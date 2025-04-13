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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface AnalysisResponse {
  result: {
    summary_text: string;
  };
}

export default function DocumentAnalysis(props: { disableCustomTheme?: boolean }) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysisResults, setAnalysisResults] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [extractingText, setExtractingText] = React.useState(false);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      setExtractingText(true);
      
      // Read the PDF file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    } finally {
      setExtractingText(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setErrorMessage(null);
      setAnalysisResults(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    try {
      setAnalyzing(true);
      setErrorMessage(null);
      
      // Extract text based on file type
      let text: string;
      if (selectedFile.type === 'application/pdf') {
        text = await extractTextFromPdf(selectedFile);
      } else {
        // For text files, read as text
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(selectedFile);
        });
      }

      if (!text.trim()) {
        throw new Error('No text content found in the file');
      }

      // Make API call
      const response = await fetch('/api/lesson-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            text: text.trim(),
            task: 'summarize'
          }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
  
      const result = await response.json() as AnalysisResponse;
      if (result.result?.summary_text) {
        setAnalysisResults(result.result.summary_text);
      } else {
        throw new Error('Invalid response format');
      }
  
    } catch (error) {
      console.error('Analysis error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze document. Please try again.');
      setAnalysisResults(null);
    } finally {
      setAnalyzing(false);
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
              Document Analysis
            </Typography>
            <Divider />
            
            {/* Upload and Analysis Section */}
            <Paper 
              elevation={0} 
              variant="outlined"
              sx={{ p: 3, borderRadius: 2 }}
            >
              <Stack spacing={3}>
                <Typography variant="h6" gutterBottom>
                  Document Analysis
                </Typography>
                
                {/* Upload Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Document
                    <VisuallyHiddenInput 
                      type="file" 
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Box>

                {errorMessage && (
                  <Alert severity="error">
                    {errorMessage}
                  </Alert>
                )}

                {/* Analyze Button */}
                <Button
                  variant="outlined"
                  startIcon={(analyzing || extractingText) ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                  onClick={handleAnalyze}
                  disabled={!selectedFile || analyzing || extractingText}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {extractingText ? 'Extracting Text...' : analyzing ? 'Analyzing...' : 'Analyze Document'}
                </Button>
              </Stack>
            </Paper>

            {/* Results Section */}
            {analysisResults && (
              <Paper 
                elevation={0} 
                variant="outlined"
                sx={{ p: 3, borderRadius: 2 }}
              >
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    {analysisResults}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}