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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
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

// Features based on actual implementation
const features = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 40, color: '#4CC9F0' }} />,
    title: "Lesson Planning Assistant",
    description: "Create comprehensive lesson plans with AI support. Input your requirements to generate structured plans with objectives, activities, and assessments."
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 40, color: '#4895EF' }} />,
    title: "Document Analysis",
    description: "Upload PDF and text files for NLP analysis. Extract text, generate summaries, and identify key concepts to enhance understanding of educational materials."
  },
  {
    icon: <SmartToyIcon sx={{ fontSize: 40, color: '#4361EE' }} />,
    title: "TeachBot",
    description: "Access an AI teaching assistant through an interactive chat interface. Ask questions about teaching methodologies and receive real-time guidance and support."
  },
  {
    icon: <SpellcheckIcon sx={{ fontSize: 40, color: '#F72585' }} />,
    title: "Grammar Checker",
    description: "Analyze student writing for grammar and spelling errors. Receive improvement suggestions, detailed explanations, and writing quality assessments."
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
                  POWERED BY AI, DRIVEN BY LEARNING
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#666666' }}>
                  TeachSmart is an innovative educational platform that combines artificial intelligence with modern teaching methodologies. Our platform is designed to enhance the teaching experience by providing smart tools for lesson planning, document analysis, grammar checking, and AI-assisted teaching support.
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  Built with cutting-edge technologies including Next.js for the frontend and Firebase for authentication and database services, TeachSmart ensures a seamless, secure, and efficient experience for educators at all levels.
                </Typography>
              </Paper>

              {/* Key Features Grid */}
              <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3, color: '#1a237e' }}>
                Key Features
              </Typography>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={6} key={index}>
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
              <Paper elevation={0} sx={{ p: 4, mt: 4, backgroundColor: 'transparent' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                  Our Technology
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>
                  TeachSmart leverages modern technologies to deliver a robust, secure platform:
                </Typography>
                <Box component="ul" sx={{ color: '#666666', pl: 3 }}>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Frontend:</strong> Next.js 15, React 18, and Material UI 6 for a responsive, accessible interface
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Authentication:</strong> Firebase Authentication with email verification and phone-based MFA
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Database:</strong> Firebase Firestore for secure, scalable data storage
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>PDF Processing:</strong> PDF.js for document text extraction and analysis
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>AI Integration:</strong> Custom API endpoints for lesson planning, document analysis, and grammar checking
                  </Typography>
                </Box>
              </Paper>

              {/* Security Section */}
              <Paper elevation={0} sx={{ p: 4, mt: 3, backgroundColor: 'transparent' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                  Security Features
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>
                  TeachSmart prioritizes user security through:
                </Typography>
                <Box component="ul" sx={{ color: '#666666', pl: 3 }}>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Email verification for all new accounts
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Optional phone-based multi-factor authentication
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Secure password handling and reset procedures
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Protected routes with authentication middleware
                  </Typography>
                </Box>
              </Paper>

              {/* Benefits Section */}
              <Paper elevation={0} sx={{ p: 4, mt: 3, backgroundColor: 'transparent' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                  Benefits for Educators
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>
                  TeachSmart helps educators:
                </Typography>
                <Box component="ul" sx={{ color: '#666666', pl: 3 }}>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Create comprehensive lesson plans in less time
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Analyze educational documents efficiently with NLP
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Get instant teaching assistance through TeachBot
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    Improve student writing with detailed grammar feedback
                  </Typography>
                </Box>
              </Paper>

              {/* Get Started */}
              <Paper elevation={0} sx={{ p: 4, mt: 3, backgroundColor: 'transparent' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                  Get Started with TeachSmart
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  TeachSmart is designed for educators at all levels. Our platform provides powerful, user-friendly tools that help you focus on what matters most: inspiring and educating your students. Create an account today to experience the difference that AI-enhanced teaching tools can make in your classroom.
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}