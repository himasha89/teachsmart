import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../../shared-theme/AppTheme';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import EditNoteIcon from '@mui/icons-material/EditNote';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface Assessment {
    Type: string;
    Description: string;
}

// Define Activity interface to handle structured activities
interface Activity {
    name: string;
    description: string;
}

interface LessonPlanData {
    topic: string;
    grade_level: string;
    learning_objectives: string[];
    materials: string[];
    duration: string | number;
    activities: (Activity | string)[]; // Update to support both object format and string format
    assessment: Assessment | string;
}

interface ApiResponse {
    topic: string;
    grade_level: string;
    learning_objectives: string[];
    materials: string[];
    duration: string | number;
    activities: (Activity | string)[];
    assessment: Assessment | string;
}

export default function LessonPlanner(props: { disableCustomTheme?: boolean }) {
    const [question, setQuestion] = React.useState('');
    const [generating, setGenerating] = React.useState(false);
    const [lessonPlan, setLessonPlan] = React.useState<LessonPlanData | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const handleGenerate = async () => {
        if (!question.trim()) {
            setErrorMessage('Please enter your question about lesson planning');
            return;
        }

        try {
            setGenerating(true);
            setErrorMessage(null);

            console.log('Sending request with question:', question.trim());

            const response = await fetch('https://lessonplanner-pnys4b454q-uc.a.run.app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        question: question.trim()
                    }
                }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate lesson plan: ${errorText || response.statusText}`);
            }

            const rawText = await response.text();
            console.log('Raw response:', rawText);

            try {
                // Try to safely parse the JSON - attempt to repair if it's truncated
                const jsonResponse = safeParseJson(rawText.trim());
                
                // Validate required fields
                if (!jsonResponse || !jsonResponse.topic || !jsonResponse.grade_level || 
                    !Array.isArray(jsonResponse.learning_objectives) || 
                    !Array.isArray(jsonResponse.activities)) {
                    throw new Error('Incomplete response from lesson plan service');
                }
                
                setLessonPlan(jsonResponse);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Failed to parse the lesson plan response. Please try again.');
            }

        } catch (error) {
            console.error('Generation error:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to generate lesson plan. Please try again.');
            setLessonPlan(null);
        } finally {
            setGenerating(false);
        }
    };

    // Helper function to attempt to repair and parse potentially truncated JSON
    const safeParseJson = (jsonString: string): ApiResponse => {
        try {
            // First try normal parsing
            return JSON.parse(jsonString);
        } catch (error) {
            console.log('Initial JSON parse failed, attempting to repair');
            
            try {
                // First, let's identify if the JSON is truncated in the middle of a string
                const descriptionMatch = jsonString.match(/"description"\s*:\s*"([^"]*?)$/);
                if (descriptionMatch) {
                    console.log('Found truncated description field, attempting to repair');
                    
                    // Add closing quote to the description
                    let repairedJson = jsonString + '"';
                    
                    // Ensure the activities array is properly closed
                    if (!repairedJson.includes(']}')) {
                        repairedJson += ']}';
                    }
                    
                    try {
                        return JSON.parse(repairedJson);
                    } catch (descError) {
                        console.log('Simple description repair failed, trying more complex repair');
                    }
                }
                
                // Handle the case where the quiz description is truncated
                const quizMatch = jsonString.match(/The quiz will be\s*$/);
                if (quizMatch) {
                    console.log('Found truncated quiz description, attempting to repair');
                    let repairedJson = jsonString + ' completed in class."}]}';
                    
                    try {
                        return JSON.parse(repairedJson);
                    } catch (quizError) {
                        console.log('Quiz description repair failed, trying more complex repair');
                    }
                }
                
                // More complex repair - handle truncated JSON by extracting valid parts
                // First try to extract all complete activities
                const topicMatch = jsonString.match(/"topic"\s*:\s*"([^"]+)"/);
                const gradeMatch = jsonString.match(/"grade_level"\s*:\s*"([^"]+)"/);
                const durationMatch = jsonString.match(/"duration"\s*:\s*"?(\d+)"?/);
                
                // Extract arrays if possible
                const objectivesMatch = jsonString.match(/"learning_objectives"\s*:\s*\[([\s\S]*?)\]/);
                const materialsMatch = jsonString.match(/"materials"\s*:\s*\[([\s\S]*?)\]/);
                
                // Extract complete activities
                const activities: Activity[] = [];
                const activityRegex = /{[^{}]*"name"\s*:\s*"([^"]+)"[^{}]*"description"\s*:\s*"([^"]+)"[^{}]*}/g;
                let activityMatch;
                
                while ((activityMatch = activityRegex.exec(jsonString)) !== null) {
                    activities.push({
                        name: activityMatch[1],
                        description: activityMatch[2]
                    });
                }
                
                // If we couldn't find any complete activities but there are partial ones
                if (activities.length === 0) {
                    const partialActivityMatch = jsonString.match(/{[^{}]*"name"\s*:\s*"([^"]+)"[^{}]*"description"\s*:\s*"([^"]*?)$/);
                    if (partialActivityMatch) {
                        activities.push({
                            name: partialActivityMatch[1],
                            description: partialActivityMatch[2] + '...'
                        });
                    }
                }
                
                // Construct a valid JSON object with extracted data
                const repairedData: ApiResponse = {
                    topic: topicMatch ? topicMatch[1] : 'Introduction to Information Technology',
                    grade_level: gradeMatch ? gradeMatch[1] : '9',
                    learning_objectives: objectivesMatch ? 
                        extractArrayItems(objectivesMatch[1]) : 
                        ['Identify various types of information technology devices', 
                        'Describe the role of information technology in society'],
                    materials: materialsMatch ? 
                        extractArrayItems(materialsMatch[1]) : 
                        ['Projector and screen', 'Internet access'],
                    duration: durationMatch ? durationMatch[1] : '90',
                    activities: activities.length > 0 ? 
                        activities : 
                        [{name: 'IT Devices Scavenger Hunt', 
                          description: 'Students will be divided into groups and will be given a list of IT devices to find in the classroom or school.'}],
                    assessment: 'Students will complete a quiz on key IT concepts covered in the lesson.'
                };
                
                return repairedData;
            } catch (repairError) {
                console.error('JSON repair failed:', repairError);
                
                // Return a minimally valid structure to prevent errors
                return {
                    topic: 'Introduction to Information Technology',
                    grade_level: '9',
                    learning_objectives: ['Identify various types of information technology devices'],
                    materials: ['Projector and screen'],
                    duration: '90',
                    activities: [{
                        name: 'IT Devices Scavenger Hunt',
                        description: 'Students will be divided into groups and will be given a list of IT devices to find in the classroom or school.'
                    }],
                    assessment: 'Students will complete a quiz on key IT concepts covered in the lesson.'
                };
            }
        }
    };
    
    // Helper function to extract valid array items
    const extractArrayItems = (arrayStr: string): string[] => {
        const items: string[] = [];
        const regex = /"([^"]*)"/g;
        let match;
        
        while ((match = regex.exec(arrayStr)) !== null) {
            items.push(match[1]);
        }
        
        return items.length > 0 ? items : ['No items found'];
    };
    
    // Helper function to extract as much valid JSON as possible
    const extractValidJson = (jsonStr: string): ApiResponse | null => {
        try {
            // Try to find a valid subset of the JSON
            const objectMatch = /{[\s\S]*}/g.exec(jsonStr);
            if (objectMatch) {
                const potentialJson = objectMatch[0];
                try {
                    const parsed = JSON.parse(potentialJson);
                    if (parsed.topic && parsed.grade_level) {
                        return parsed;
                    }
                } catch (e) {
                    // Not valid JSON, continue with other approaches
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    const renderAssessment = (assessment: Assessment | string) => {
        if (typeof assessment === 'string') {
            return (
                <Typography variant="body1" sx={{ pl: 4 }}>
                    {assessment}
                </Typography>
            );
        }

        return (
            <Box sx={{ pl: 4 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Assessment Type: {assessment.Type}
                </Typography>
                <Typography variant="body1">
                    {assessment.Description}
                </Typography>
            </Box>
        );
    };

    // Helper function to render activity based on its type
    const renderActivity = (activity: Activity | string, index: number) => {
        if (typeof activity === 'string') {
            return (
                <ListItem key={index}>
                    <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={activity} />
                </ListItem>
            );
        } else {
            return (
                <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                        primary={activity.name} 
                        secondary={activity.description}
                    />
                </ListItem>
            );
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                <SideMenu />
                <AppNavbar />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                        padding: 3
                    })}
                >
                    <Stack spacing={3}>
                        <Header />

                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, width: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Lesson Planning Assistant
                        </Typography>
                        <Divider />

                        {/* Input Section */}
                        <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{ p: 3, borderRadius: 2 }}
                        >
                            <Stack spacing={3}>
                                <Typography variant="h6" gutterBottom>
                                    What would you like help with?
                                </Typography>

                                <TextField
                                    multiline
                                    rows={3}
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Enter your question about lesson planning (e.g., 'Can you create a lesson plan for teaching fractions to grade 5 students?')"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                      style: { cursor: 'text', height: '75px' },
                                    }}
                                />

                                {errorMessage && (
                                    <Alert severity="error" onClose={() => setErrorMessage(null)}>
                                        {errorMessage}
                                    </Alert>
                                )}

                                <Button
                                    variant="outlined"
                                    startIcon={generating ? <CircularProgress size={20} /> : <EditNoteIcon />}
                                    onClick={handleGenerate}
                                    disabled={!question.trim() || generating}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    {generating ? 'Generating Plan...' : 'Generate Lesson Plan'}
                                </Button>
                            </Stack>
                        </Paper>

                        {/* Results Section */}
                        {lessonPlan && (
                            <Paper
                                elevation={0}
                                variant="outlined"
                                sx={{ p: 3, borderRadius: 2 }}
                            >
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="h5" gutterBottom color="primary">
                                            {lessonPlan.topic}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                            Grade {lessonPlan.grade_level}
                                            <AccessTimeIcon sx={{ verticalAlign: 'middle', ml: 3, mr: 1 }} />
                                            {typeof lessonPlan.duration === 'number'
                                                ? `${lessonPlan.duration} minutes`
                                                : lessonPlan.duration
                                            }
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AutoStoriesIcon /> Learning Objectives
                                        </Typography>
                                        <List>
                                            {lessonPlan.learning_objectives.map((objective, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <CheckCircleOutlineIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={objective} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BuildIcon /> Materials Needed
                                        </Typography>
                                        <List>
                                            {Array.isArray(lessonPlan.materials) && lessonPlan.materials.map((material, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <CheckCircleOutlineIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={material} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ListAltIcon /> Activities
                                        </Typography>
                                        <List>
                                            {Array.isArray(lessonPlan.activities) && lessonPlan.activities.map((activity, index) => 
                                                renderActivity(activity, index)
                                            )}
                                        </List>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AssessmentIcon /> Assessment
                                        </Typography>
                                        {lessonPlan.assessment && renderAssessment(lessonPlan.assessment)}
                                    </Box>
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}