import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const features = [
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4361EE' }} />,
    title: "AI-Powered Teaching Assistant",
    description: "Leveraging advanced NLP using spaCy and Hugging Face Transformers for intelligent content analysis and recommendations"
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: '#4CC9F0' }} />,
    title: "Comprehensive Lesson Planning",
    description: "Create and organize lesson plans with AI support, making curriculum development more efficient and effective"
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 40, color: '#4895EF' }} />,
    title: "Interactive Document Analysis",
    description: "Advanced document analysis capabilities for historical texts and educational materials with NLP insights"
  },
  {
    icon: <AutoStoriesIcon sx={{ fontSize: 40, color: '#F72585' }} />,
    title: "Adaptive Learning Tools",
    description: "Customizable lesson adaptations to meet diverse student needs and learning styles"
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#7209B7' }} />,
    title: "Progress Tracking",
    description: "Real-time analytics on student engagement and comprehensive progress monitoring"
  },
  {
    icon: <IntegrationInstructionsIcon sx={{ fontSize: 40, color: '#3A0CA3' }} />,
    title: "Seamless Integration",
    description: "Built with React.js and Firebase for reliable, scalable, and secure educational technology"
  }
];

export default function About(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
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
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            
            {/* About Content */}
            <Box sx={{ maxWidth: 1200, width: '100%', mx: 'auto', p: 3 }}>
              {/* Platform Overview */}
              <Paper elevation={0} sx={{ p: 4, mb: 4, backgroundColor: 'transparent' }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
                  About TeachSmart
                </Typography>
                <Typography variant="h5" sx={{ mb: 3, color: '#454545' }}>
                  Empowering Educators with Intelligent Teaching Tools
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#666666' }}>
                  TeachSmart is an innovative educational platform that combines artificial intelligence with modern teaching methodologies. Our platform is designed to enhance the teaching experience by providing smart tools for lesson planning, document analysis, and student engagement tracking.
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  Built with cutting-edge technologies including React.js for the frontend and Google Firebase for backend services, TeachSmart ensures a seamless, secure, and efficient experience for educators.
                </Typography>
              </Paper>

              {/* Key Features Grid */}
              <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 4, color: '#1a237e' }}>
                Key Features
              </Typography>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}>
                      <CardContent sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center',
                        p: 3
                      }}>
                        <Box sx={{ mb: 2 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ color: '#2c387e' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Technology Stack */}
              {/* <Paper elevation={0} sx={{ p: 4, mt: 6, backgroundColor: 'transparent' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                  Our Technology
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  TeachSmart is built on a robust technology stack that ensures reliability, scalability, and security:
                </Typography>
                <Box component="ul" sx={{ color: '#666666' }}>
                  <Typography component="li" sx={{ mt: 1 }}>Frontend: React.js with Material UI components</Typography>
                  <Typography component="li" sx={{ mt: 1 }}>Backend: Google Firebase and Firestore</Typography>
                  <Typography component="li" sx={{ mt: 1 }}>AI/ML: spaCy and Hugging Face Transformers for NLP</Typography>
                  <Typography component="li" sx={{ mt: 1 }}>Authentication: Firebase Authentication</Typography>
                  <Typography component="li" sx={{ mt: 1 }}>Real-time Updates: Firebase Real-time Database</Typography>
                </Box>
              </Paper> */}
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}