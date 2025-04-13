// /api/lesson-planner.js
export default async function handler(req, res) {
    // Set CORS headers for your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    try {
      // Forward the request to the external API
      const response = await fetch('https://lessonplanner-pnys4b454q-uc.a.run.app/', {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          // Forward any authorization headers if needed
          ...(req.headers.authorization && { 
            'Authorization': req.headers.authorization 
          })
        },
        // Forward the request body for POST/PUT requests
        ...(req.method !== 'GET' && req.method !== 'HEAD' && { 
          body: JSON.stringify(req.body) 
        })
      });
  
      // Get the response data
      const data = await response.json();
      
      // Return the response to your frontend
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to connect to the lesson planner service',
        details: error.message 
      });
    }
  }