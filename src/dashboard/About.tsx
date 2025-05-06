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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
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

// Features based on actual codebase implementation
const features = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 40, color: '#4CC9F0' }} />,
    title: "Lesson Planning",
    description: "Create lesson plans with AI support. Generate comprehensive plans with objectives, activities, and assessments."
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 40, color: '#4895EF' }} />,
    title: "Document Analysis",
    description: "Analyze historical documents with NLP for insights. Upload PDFs and text files to extract summaries and key concepts."
  },
  {
    icon: <SmartToyIcon sx={{ fontSize: 40, color: '#4361EE' }} />,
    title: "TeachBot",
    description: "Your AI teaching assistant. Ask questions, get lesson ideas, and receive instant support for all your teaching needs."
  },
  {
    icon: <SpellcheckIcon sx={{ fontSize: 40, color: '#F72585' }} />,
    title: "Grammar Checker",
    description: "Check student writing for grammar and spelling errors in real-time. Get improvement suggestions and writing quality scores."
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
                  TeachSmart is an innovative educational platform that combines artificial intelligence with modern teaching methodologies. Our platform is designed to enhance the teaching experience by providing smart tools for lesson planning, document analysis, and student engagement.
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  Built with cutting-edge technologies including React.js for the frontend and Google Firebase for backend services, TeachSmart ensures a seamless, secure, and efficient experience for educators.
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
              <Paper elevation={0} sx={{ p: 4, mt: 3, backgroundColor: 'transparent' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
                  Our Technology
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>
                  TeachSmart is built on a robust technology stack that ensures reliability, scalability, and security:
                </Typography>
                <Box component="ul" sx={{ color: '#666666', pl: 3 }}>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Frontend:</strong> Next.js, React, and Material UI
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Authentication:</strong> Firebase Authentication with multi-factor security
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Database:</strong> Firebase Firestore
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>PDF Processing:</strong> PDF.js for document analysis
                  </Typography>
                  <Typography component="li" sx={{ mt: 1 }}>
                    <strong>Security:</strong> Email verification and phone-based MFA
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
                    Analyze historical documents and educational materials efficiently
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
                  TeachSmart is designed for educators. Our platform provides powerful, easy-to-use tools that help you focus on what matters most: inspiring and educating your students. Create an account today to experience the difference that intelligent teaching tools can make in your classroom.
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}