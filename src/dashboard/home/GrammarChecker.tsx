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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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

interface GrammarIssue {
  original: string;
  suggestion: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  explanation: string;
  startIndex: number;
  endIndex: number;
}

interface GrammarCheckResponse {
  correctedText: string;
  issues: GrammarIssue[];
  score: number;
}

// API URL for grammar checking
const GRAMMAR_API_URL = process.env.REACT_APP_GRAMMAR_API_URL || 'http://localhost:8080';

export default function GrammarChecker(props: { disableCustomTheme?: boolean }) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [tabValue, setTabValue] = React.useState('text');
  const [inputText, setInputText] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [extractingText, setExtractingText] = React.useState(false);
  const [grammarResults, setGrammarResults] = React.useState<GrammarCheckResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
      setGrammarResults(null);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    // Reset results when switching tabs
    setGrammarResults(null);
    setErrorMessage(null);
  };

  const handleCheckGrammar = async () => {
    try {
      setChecking(true);
      setErrorMessage(null);
      
      let textToCheck: string;
      
      // Get text based on current tab
      if (tabValue === 'file') {
        if (!selectedFile) {
          throw new Error('Please select a file first');
        }
        
        // Extract text based on file type
        if (selectedFile.type === 'application/pdf') {
          textToCheck = await extractTextFromPdf(selectedFile);
        } else {
          // For text files, read as text
          textToCheck = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(selectedFile);
          });
        }
      } else {
        // Use the text from textarea
        textToCheck = inputText.trim();
        if (!textToCheck) {
          throw new Error('Please enter some text to check');
        }
      }

      // Call the grammar check API with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      try {
        const response = await fetch(`${GRAMMAR_API_URL}/check_grammar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: { text: textToCheck }
          }),
          signal: controller.signal
        });
      
        clearTimeout(timeoutId);
      
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error (${response.status}): ${errorText}`);
        }
      
        const responseData = await response.json();
        setGrammarResults(responseData.result);
      } catch (error: unknown) {
        // Type-safe error handling
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. The grammar check is taking longer than expected.');
          }
          throw error;
        } else {
          // Handle case where error is not an Error object
          throw new Error('An unknown error occurred');
        }
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to check grammar. Please try again.');
      setGrammarResults(null);
    } finally {
      setChecking(false);
    }
  };

  const renderHighlightedText = () => {
    if (!grammarResults || !grammarResults.issues.length) {
      return <Typography variant="body1">{grammarResults?.correctedText || ''}</Typography>;
    }

    // Sort issues by start index to process them in order
    const sortedIssues = [...grammarResults.issues].sort((a, b) => a.startIndex - b.startIndex);
    const text = grammarResults.correctedText;
    let lastIndex = 0;
    const segments = [];

    sortedIssues.forEach((issue, idx) => {
      // Add text before the current issue
      if (issue.startIndex > lastIndex) {
        segments.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, issue.startIndex)}
          </span>
        );
      }

      // Add highlighted issue
      segments.push(
        <Box
          component="span"
          key={`highlight-${idx}`}
          sx={{
            backgroundColor: theme => {
              switch (issue.type) {
                case 'grammar': return alpha(theme.palette.error.main, 0.1);
                case 'spelling': return alpha(theme.palette.warning.main, 0.1);
                case 'punctuation': return alpha(theme.palette.info.main, 0.1);
                case 'style': return alpha(theme.palette.success.main, 0.1);
                default: return alpha(theme.palette.error.main, 0.1);
              }
            },
            borderBottom: theme => {
              switch (issue.type) {
                case 'grammar': return `2px solid ${theme.palette.error.main}`;
                case 'spelling': return `2px solid ${theme.palette.warning.main}`;
                case 'punctuation': return `2px solid ${theme.palette.info.main}`;
                case 'style': return `2px solid ${theme.palette.success.main}`;
                default: return `2px solid ${theme.palette.error.main}`;
              }
            },
            padding: '0 2px',
            position: 'relative',
            cursor: 'help',
            '&:hover': {
              '& > .tooltip': {
                display: 'block',
              },
            },
          }}
          title={`${issue.suggestion} - ${issue.explanation}`}
        >
          {issue.original}
          <Box
            className="tooltip"
            sx={{
              display: 'none',
              position: 'absolute',
              bottom: '100%',
              left: 0,
              backgroundColor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              padding: 1.5,
              borderRadius: 1,
              zIndex: 1000,
              minWidth: 200,
              maxWidth: 300,
            }}
          >
            <Typography variant="caption" component="div" fontWeight="bold">
              Suggestion: {issue.suggestion}
            </Typography>
            <Typography variant="caption" component="div">
              {issue.explanation}
            </Typography>
          </Box>
        </Box>
      );

      lastIndex = issue.endIndex;
    });

    // Add text after the last issue
    if (lastIndex < text.length) {
      segments.push(
        <span key="text-last">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <Typography variant="body1">{segments}</Typography>;
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
              Grammar Checker
            </Typography>
            <Divider />
            
            {/* Tabs for Input Methods */}
            <Paper 
              elevation={0} 
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="input method tabs">
                    <Tab label="Enter Text" value="text" icon={<SpellcheckIcon />} iconPosition="start" />
                    <Tab label="Upload Document" value="file" icon={<CloudUploadIcon />} iconPosition="start" />
                  </TabList>
                </Box>
                
                <TabPanel value="text" sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Typography variant="body1">
                      Enter your text below and click "Check Grammar" to review your text.
                    </Typography>
                    
                    <TextField
                      label="Text to check"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type or paste your text here..."
                      InputProps={{
                        style: { cursor: 'text', height: '100px' },
                      }}
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={checking ? <CircularProgress size={20}  /> : <CheckCircleIcon />}
                      onClick={handleCheckGrammar}
                      disabled={checking || !inputText.trim()}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {checking ? 'Checking...' : 'Check Grammar'}
                    </Button>
                  </Stack>
                </TabPanel>
                
                <TabPanel value="file" sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Typography variant="body1">
                      Upload a PDF or TXT document to check its grammar and spelling.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload Document
                        <VisuallyHiddenInput 
                          type="file" 
                          accept=".pdf,.txt,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </Button>
                      {selectedFile && (
                        <Typography variant="body2" color="text.secondary">
                          Selected: {selectedFile.name}
                        </Typography>
                      )}
                    </Box>
                    
                    <Button
                      variant="outlined"
                      startIcon={(checking || extractingText) ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                      onClick={handleCheckGrammar}
                      disabled={!selectedFile || checking || extractingText}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {extractingText ? 'Extracting Text...' : checking ? 'Checking...' : 'Check Grammar'}
                    </Button>
                  </Stack>
                </TabPanel>
              </TabContext>
            </Paper>

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Results Section */}
            {grammarResults && (
              <Paper 
                elevation={0} 
                variant="outlined"
                sx={{ p: 3, borderRadius: 2 }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Grammar Check Results
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        bgcolor: theme => alpha(theme.palette.success.main, 0.1), 
                        p: 1, 
                        borderRadius: 1 
                      }}
                    >
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Grammar Score:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {grammarResults.score}/100
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  {/* Corrections Summary */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Identified Issues ({grammarResults.issues.length})
                    </Typography>
                    
                    {grammarResults.issues.length === 0 ? (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        No grammar issues found in your text!
                      </Alert>
                    ) : (
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {grammarResults.issues.map((issue, index) => (
                          <Card key={index} variant="outlined">
                            <CardContent>
                              <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                                {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} issue
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    textDecoration: 'line-through', 
                                    color: 'error.main', 
                                    fontWeight: 'medium' 
                                  }}
                                >
                                  {issue.original}
                                </Typography>
                                <span>→</span>
                                <Typography 
                                  variant="body2"
                                  sx={{ 
                                    color: 'success.main', 
                                    fontWeight: 'medium' 
                                  }}
                                >
                                  {issue.suggestion}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                {issue.explanation}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Box>
                  
                  {/* Corrected Text */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Text with Corrections
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 1 }}
                    >
                      {renderHighlightedText()}
                    </Paper>
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