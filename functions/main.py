# main.py
from firebase_functions.params import SecretParam
import uuid
from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
from typing import Iterator,Any
from huggingface_hub import InferenceClient
from typing import Iterator
from ast import literal_eval
import logging


import os
import json


# if not firebase_admin._apps:
#     firebase_admin.initialize_app()
initialize_app()
# db = firestore.client()


client = InferenceClient(token=os.environ.get('HUGGINGFACE_API_KEY'))

# @https_fn.on_request(
#      cors=options.CorsOptions(
#         # cors_origins=["https://example.web.app"],
#         cors_methods=["GET", "POST", "OPTIONS"],
#     )
# )
@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["http://localhost:3000"],
        cors_methods=["POST","OPTIONS"]
    )
) 
def analyze_document(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function to analyze documents using Hugging Face Inference API.
    """
    
    if req.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return https_fn.Response('', status=204, headers=headers)

    # Set CORS headers for the main request
    headers = {
        # 'Access-Control-Allow-Origin': "*",
        'Content-Type': 'application/json'
    }
    try:
        
        # Parse request data
        request_json = req.get_json()["data"]
        
        if not request_json or 'text' not in request_json:
            return https_fn.Response(
                json.dumps({'error': 'No text provided'}),
                status=400
            )

        text = request_json['text']
        task = request_json.get('task', 'summarize')
        
        # Process based on task type
        if task == 'summarize':
            result = client.summarization(
                model="facebook/bart-large-cnn",
                text=text,
                parameters={"max_length": 130, "min_length": 30}
            )

        elif task == 'sentiment':
            result = client.text_classification(
                model="distilbert-base-uncased-finetuned-sst-2-english",
                inputs=text
            )

        elif task == 'qa':
            if 'question' not in request_json:
                return https_fn.Response(
                    json.dumps({'error': 'Question is required for QA task'}),
                    status=400,
                    headers=headers
                )
            
            question = request_json['question']
            result = client.question_answering(
                # model="distilbert-base-cased-distilled-squad",
              question=question,
                    context= text
            
            )

        else:
            return https_fn.Response(
                json.dumps({'error': 'Invalid task specified'}),
                status=400,
                headers=headers
            )

        # Store result in Firestore
        db = firestore.client()
        doc_ref = db.collection('analysis_results').add({
            'text': text,
            'task': task,
            'result': result,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        return https_fn.Response(
            json.dumps({
                'id': doc_ref[1].id,
                'result': result
            }),
            status=200,
            headers=headers
        )

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return https_fn.Response(
            json.dumps({
                'error': f'Processing failed: {str(e)}'
            }),
            
            status=500,
            headers=headers
        )
        
def get_or_create_conversation(db:Any,conversation_id: str = None) -> tuple:
    """Get existing conversation or create new one"""
    if conversation_id:
        conv_ref = db.collection('conversations').document(conversation_id)
        conv = conv_ref.get()
        if conv.exists:
            return conv_ref, conv.to_dict()
    
    # Create new conversation if none exists or invalid ID
    new_conv_ref = db.collection('conversations').document(str(uuid.uuid4()))
    initial_chat = [
        {
            "role": "system", 
            "content": "You are a teacher's assistant who knows all about teaching and teaching materials."
        }
    ]
    new_conv_ref.set({
        'messages': initial_chat,
        'created_at': firestore.SERVER_TIMESTAMP,
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    return new_conv_ref, {'messages': initial_chat}

        
def generate_chunks(stream,conv_ref, chat) -> Iterator[str]:
    """Generator function to yield response chunks in SSE format"""
    try:
        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_response += content
                chunk_data = {
                    "text": content,
                    "done": False
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
        chat.append({"role": "assistant", "content": full_response})
        conv_ref.update({
            'messages': chat,
            'last_updated': firestore.SERVER_TIMESTAMP
        })
        # Send completion message
        yield f"data: {json.dumps({'text': '', 'done': True})}\n\n"
    
    except Exception as e:
        error_data = {
            "error": str(e),
            "done": True
        }
        yield f"data: {json.dumps(error_data)}\n\n"

def teachbot(req: https_fn.Request) -> https_fn.Response:
    try:
        request_json = req.get_json()["data"]
        print(request_json)
        if not request_json or 'message' not in request_json:
            return https_fn.Response(
                response='Missing message in request body',
                status=400
            )
        db = firestore.client()
        # Get conversation ID from request or create new one
        conversation_id = request_json.get('conversation_id')
        conv_ref, conversation = get_or_create_conversation(db,conversation_id)
        
        
        
        
        # Get existing messages and append new user message
        chat = conversation['messages']
        chat.append({"role": "user", "content": request_json['message']})
        stream = client.chat.completions.create(
        model="meta-llama/Llama-3.2-1B-Instruct", 
        messages=chat, 
        max_tokens=1000,
        stream=True)
        
        
        conv_ref.update({
            'messages': chat,
            'last_updated': firestore.SERVER_TIMESTAMP
        })
        # Create response with streaming chunks
        response = https_fn.Response()
        response.headers['Content-Type'] = 'text/event-stream'
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Connection'] = 'keep-alive'
        # response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        first_chunk = json.dumps({
            "conversation_id": conv_ref.id,
            "text": "",
            "done": False
        })
        def enhanced_stream():
            yield f"data: {first_chunk}\n\n"
            yield from generate_chunks(stream,conv_ref,chat)
        response.response = enhanced_stream()
        return response
    except ValueError as e:
        return https_fn.Response(
            response=f'Invalid request: {str(e)}',
            status=400
        )
    except Exception as e:
        return https_fn.Response(
            response=f'Server error: {str(e)}',
            status=500
        )



#     cors=options.CorsOptions(
#         cors_origins=["http://localhost:3000","https://77e1-122-151-28-10.ngrok-free.app"],
#         cors_methods=["POST","OPTIONS"]
#     )
# )
@https_fn.on_request()
def bot(req: https_fn.Request) -> https_fn.Response:
    # Handle CORS preflight requests
    allowed_origins = ["http://localhost:3000", "https://77e1-122-151-28-10.ngrok-free.app"]
    
    # Handle CORS preflight requests
    if req.method == 'OPTIONS':
        origin = req.headers.get('Origin')
        if origin in allowed_origins:
            headers = {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Max-Age': '3600',
            }
            return https_fn.Response(status=204, headers=headers)
        else:
            return https_fn.Response(status=403, content='Origin not allowed')

    # Actual request handling
    origin = req.headers.get('Origin')
    headers = {}
    if origin in allowed_origins:
        headers['Access-Control-Allow-Origin'] = origin
    
    # Call your main function
    response = teachbot(req)
    response.headers.update(headers)
    return response


@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["http://localhost:3000"],
        cors_methods=["POST","OPTIONS"]
    )
) 
def lessonplanner(req: https_fn.Request) -> https_fn.Response:
    template="""
        You should provide your answer as a JSON blob..

        Your answer should be built as follows, it must contain the "Answer:" and "End of answer." sequences.
        The answer should have description about topic, grade_level, learning objective, materials, duration, activities and assessment. You should take a hint about what should the key represent from the descripiton provided.
        Answer:
        {{
            "topic": "The main topic of the lesson",
            "grade_level": "The intended grade level for the lesson",
            "learning_objectives": "A list of learning objectives for the lesson",
            "materials":"A list of materials needed for the lesson",
            "duration":"The estimated duration of the lesson in minutes",
            "activities": "A list of activities to be conducted during the lesson",
            "assessment": "The method of assessing student learning (e.g., quiz, project) It should be very descriptive. Give a detailed assessment"
        }}
        End of answer.
        Now begin!
        Here is the user question: {question}.
        Answer:
        """
    try:
        # Validate JSON input
        request_json = req.get_json()["data"]
        if not request_json:
            return https_fn.Response(
                response=json.dumps({
                    'error': 'Missing JSON body'
                }),
                status=400,
                mimetype='application/json'
            )
            
        if 'question' not in request_json:
            return https_fn.Response(
                response=json.dumps({
                    'error': 'Missing required field: question'
                }),
                status=400,
                mimetype='application/json'
            )

        # Format prompt with question
        prompt = template.format(question=request_json['question'])
        
        # Generate answer using model
        answer = client.text_generation(
            model="meta-llama/Llama-3.2-1B-Instruct",
            prompt=prompt,
            max_new_tokens=1000,
            temperature=1,
            return_full_text=False
        )
        
        # Process the answer
        answer = answer.split("End of answer.")[0]
        try:
            print(answer)
            parsed_answer = literal_eval(answer)
            
        except (ValueError, SyntaxError) as e:
            return https_fn.Response(
                response=json.dumps({
                    'error': 'Failed to parse model response',
                    'details': str(e)
                }),
                status=500,
                mimetype='application/json'
            )

        # Return successful response
        return https_fn.Response(
            response=json.dumps(parsed_answer),
            status=200,
            mimetype='application/json'
        )

    except ValueError as e:
        return https_fn.Response(
            response=json.dumps({
                'error': 'Invalid JSON format',
                'details': str(e)
            }),
            status=400,
            mimetype='application/json'
        )
    except Exception as e:
        return https_fn.Response(
            response=json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            }),
            status=500,
            mimetype='application/json'
        )