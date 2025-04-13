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

interface LessonPlanData {
    topic: string;
    grade_level: string;
    learning_objectives: string[];
    materials: string[];
    duration: string | number;
    activities: string[];
    assessment: Assessment | string;
}

interface ApiResponse {
    topic: string;
    grade_level: string;
    learning_objectives: string[];
    materials: string[];
    duration: string | number;
    activities: string[];
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
                const jsonResponse = JSON.parse(rawText.trim()) as ApiResponse;
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
                                            {lessonPlan.materials.map((material, index) => (
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
                                            {lessonPlan.activities.map((activity, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <CheckCircleOutlineIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={activity} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AssessmentIcon /> Assessment
                                        </Typography>
                                        {renderAssessment(lessonPlan.assessment)}
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