import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { } from '@mui/x-date-pickers/themeAugmentation';
import type { } from '@mui/x-charts/themeAugmentation';
import type { } from '@mui/x-data-grid/themeAugmentation';
import type { } from '@mui/x-tree-view/themeAugmentation';
import { alpha, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

// Styled Components for Chat Interface
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  gap: theme.spacing(2),
}));

const MessageArea = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const BotMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: '75%',
  borderRadius: theme.shape.borderRadius * 2,
  borderTopLeftRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  boxShadow: theme.shadows[1],
}));

const UserMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: '75%',
  marginLeft: 'auto', // This pushes the message to the right
  borderRadius: theme.shape.borderRadius * 2,
  borderTopRightRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  boxShadow: theme.shadows[1],
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  marginRight: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  marginLeft: theme.spacing(1),
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.main,
}));

interface ChatMessage {
  id: string;
  text: string;
  isbot: boolean;
}

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
};

export default function TeachBot(props: { disableCustomTheme?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      text: "Hello! I'm TeachBot, your AI teaching assistant. How can I help you today?",
      isbot: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup function for any pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Add user message with unique ID
    const userMessageId = generateId();
    const newMessage: ChatMessage = {
      id: userMessageId,
      text: inputValue,
      isbot: false
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    let buffer = '';
    let botResponseId: string | null = null;

    try {
      // Send API request
      const response = await fetch('https://bot-pnys4b454q-uc.a.run.app', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ data: { message: inputValue, conversation_id: conversationIdRef.current } }),
        signal,
      });

      if (!response.ok || !response.body) throw new Error('Network response was not ok');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let lineIndex;
        while ((lineIndex = buffer.indexOf('\n\n')) !== -1) {
          const line = buffer.slice(0, lineIndex).trim();
          buffer = buffer.slice(lineIndex + 2);

          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));

              // Check for errors in the streamed response
              if (jsonData.error) {
                // Log the error but don't display it in the console as an error
                console.log('Stream message:', jsonData.error);
                
                // If this is our first message from the bot, create a new message
                if (botResponseId === null) {
                  botResponseId = generateId();
                  const botResponse: ChatMessage = {
                    id: botResponseId,
                    text: "I'm sorry, I'm having trouble processing your request right now. Please try again later or ask a different question.",
                    isbot: true
                  };
                  setMessages(prev => [...prev, botResponse]);
                }
                
                setIsLoading(false);
                return; // Exit the processing loop
              }

              // Handle conversation ID from first message
              if (jsonData.conversation_id) {
                conversationIdRef.current = jsonData.conversation_id;
              }

              // Create a new bot message if this is the first chunk
              if (jsonData.text && botResponseId === null) {
                botResponseId = generateId();
                const botResponse: ChatMessage = {
                  id: botResponseId,
                  text: jsonData.text,
                  isbot: true
                };
                setMessages(prev => [...prev, botResponse]);
              } 
              // Append to existing message if we already created one
              else if (jsonData.text && botResponseId !== null) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botResponseId
                      ? { ...msg, text: msg.text + jsonData.text }
                      : msg
                  )
                );
              }

              // Handle completion
              if (jsonData.done) {
                setIsLoading(false);
              }
            } catch (e) {
              console.log('Invalid JSON in message:', line);
              // Don't show this as an error in the console
            }
          }
        }
      }
    } catch (error) {
      // Check if this is an abort error, which we don't need to handle
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      // Handle other errors - log but don't display as console error
      console.log('Chat request issue:', error);
      
      // Add error message if we haven't added a bot response yet
      if (botResponseId === null) {
        const errorMessageId = generateId();
        setMessages(prev => [
          ...prev,
          {
            id: errorMessageId,
            text: "I'm sorry, I couldn't connect to the server. Please check your connection and try again.",
            isbot: true
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
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

            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 2, 
                width: '100%', 
                fontFamily: 'Plus Jakarta Sans, sans-serif' 
              }}
            >
              TeachBot
            </Typography>
            <Divider />

            {/* Chat Interface */}
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: 3, borderRadius: 2 }}
            >
              <ChatContainer>
                <MessageArea elevation={0} variant="outlined">
                  {messages.map((message) => (
                    <MessageContainer key={message.id}>
                      {message.isbot ? (
                        <>
                          <StyledAvatar>
                            <SmartToyOutlinedIcon fontSize="small" />
                          </StyledAvatar>
                          <BotMessage>
                            <Typography
                              variant="body1"
                              sx={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                lineHeight: 1.5,
                              }}
                            >
                              {message.text}
                            </Typography>
                          </BotMessage>
                        </>
                      ) : (
                        <>
                          <UserMessage>
                            <Typography
                              variant="body1"
                              sx={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.5,
                              }}
                            >
                              {message.text}
                            </Typography>
                          </UserMessage>
                          <UserAvatar>
                            <PersonOutlineOutlinedIcon fontSize="small" />
                          </UserAvatar>
                        </>
                      )}
                    </MessageContainer>
                  ))}
                  {isLoading && (
                    <MessageContainer>
                      <StyledAvatar>
                        <SmartToyOutlinedIcon fontSize="small" />
                      </StyledAvatar>
                      <BotMessage>
                        <CircularProgress size={20} thickness={4} sx={{ opacity: 0.7 }} />
                      </BotMessage>
                    </MessageContainer>
                  )}
                  <div ref={messagesEndRef} />
                </MessageArea>

                <InputContainer elevation={0} variant="outlined">
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      style: { cursor: 'text' },
                    }}
                    sx={{ px: 1 }}
                    disabled={isLoading}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    sx={{
                      transform: inputValue.trim() && !isLoading ? 'scale(1)' : 'scale(0.9)',
                      transition: 'all 0.2s ease',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputContainer>
              </ChatContainer>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}