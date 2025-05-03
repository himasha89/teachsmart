"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper
} from '@mui/material';
import { 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  PhoneMultiFactorGenerator,
  getAuth
} from 'firebase/auth';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

interface MFAVerificationProps {
  resolver: any; // MultiFactorResolver from Firebase
  onSuccess: (user: any) => void; // Make sure this matches the callback in SignInPage
  onCancel: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({ 
  resolver, 
  onSuccess, 
  onCancel 
}) => {
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  // For development mode only
  const [devMode, setDevMode] = useState<boolean>(isDevelopment);
  const recaptchaElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize recaptcha when component mounts
    if (!devMode) {
      initializeRecaptcha();
    } else {
      // In development mode, directly enable the verification code input
      console.log('Development mode: Skipping reCAPTCHA initialization');
      // Generate a fake verification ID for development
      const fakeVerificationId = 'dev-verification-' + Date.now();
      setVerificationId(fakeVerificationId);
      setCodeSent(true);
    }
    
    return () => {
      // Clear recaptcha on unmount
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, [devMode]);

  const initializeRecaptcha = () => {
    try {
      const auth = getAuth();
      
      // Get the container element
      const container = recaptchaElementRef.current || document.getElementById('recaptcha-container');
      
      if (!container) {
        console.error('reCAPTCHA container not found');
        setError('reCAPTCHA container not found. Please refresh the page.');
        return;
      }
      
      // Clear any existing instance
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      
      // Create a new recaptcha verifier with minimal options
      const verifier = new RecaptchaVerifier(
        auth, 
        container, 
        { size: 'normal' }
      );
      
      setRecaptchaVerifier(verifier);
      
      // Render the reCAPTCHA
      verifier.render().then(() => {
        console.log('reCAPTCHA rendered successfully');
      }).catch((error) => {
        console.error('Error rendering reCAPTCHA:', error);
        setError('Failed to initialize verification. Please refresh the page.');
      });
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      setError('Failed to initialize verification. Please refresh the page.');
    }
  };

  const sendVerificationCode = async () => {
    if (devMode) {
      // In development mode, just proceed
      setCodeSent(true);
      return;
    }
    
    if (!recaptchaVerifier) {
      setError('reCAPTCHA not initialized. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the first hint - typically the phone number used for MFA
      const selectedHint = resolver.hints[0];
      
      // Create a phone auth provider
      const auth = getAuth();
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      console.log('Sending verification code...');
      
      // Request verification code
      const vId = await phoneAuthProvider.verifyPhoneNumber(
        {
          multiFactorHint: selectedHint,
          session: resolver.session
        },
        recaptchaVerifier
      );
      
      console.log('Verification code sent successfully');
      setVerificationId(vId);
      setCodeSent(true);
    } catch (err: any) {
      console.error('Error sending code:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For development mode
      if (devMode) {
        console.log('Development mode: Simulating successful verification');
        // Create a mock user object for development
        const mockUser = {
          uid: 'dev-user-id',
          email: 'dev@example.com',
          // Add other properties as needed by your app
        };
        
        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Call onSuccess with the mock user
        onSuccess(mockUser);
        return;
      }
      
      // Production flow
      console.log('Verifying code...');
      
      // Create the phone credential
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId, 
        verificationCode
      );
      
      // Create the multi-factor assertion
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      
      // Complete sign-in
      const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
      console.log('MFA verification successful');
      
      // Call onSuccess with the authenticated user
      onSuccess(userCredential.user);
    } catch (err: any) {
      console.error('MFA verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle dev mode (for testing purposes)
  const toggleDevMode = () => {
    setDevMode(!devMode);
    // Reset state when switching modes
    setVerificationCode('');
    setError(null);
    
    if (!devMode) {
      // Switching to dev mode
      setCodeSent(true);
      setVerificationId('dev-verification-' + Date.now());
    } else {
      // Switching to production mode
      setCodeSent(false);
      setVerificationId('');
      // Initialize recaptcha for production mode
      setTimeout(initializeRecaptcha, 100);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        mx: 'auto'
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Two-Factor Authentication
      </Typography>
      
      {/* Development mode indicator */}
      {isDevelopment && (
        <Box sx={{ mb: 2 }}>
          <Alert severity={devMode ? "warning" : "info"}>
            {devMode ? "Development Mode: No actual verification will be performed" : "Production Mode: Real verification will be performed"}
          </Alert>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={toggleDevMode} 
            sx={{ mt: 1 }}
          >
            {devMode ? "Switch to Production Mode" : "Switch to Development Mode"}
          </Button>
        </Box>
      )}
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Please verify your identity with the code sent to your phone.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!codeSent ? (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Complete the reCAPTCHA below to receive a verification code.
          </Typography>
          
          <Box 
            id="recaptcha-container" 
            ref={recaptchaElementRef}
            sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}
          ></Box>
          
          <Button
            variant="contained"
            fullWidth
            onClick={sendVerificationCode}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
          </Button>
        </>
      ) : (
        <>
          <TextField
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 6 }}
            placeholder="Enter 6-digit code"
            autoFocus
            disabled={loading}
            helperText={devMode ? "In development mode, any 6-digit code will work" : ""}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={verifyCode}
              disabled={loading || !verificationCode}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          </Box>
          
          {!devMode && (
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 2 }}
              onClick={sendVerificationCode}
              disabled={loading}
            >
              Resend Code
            </Button>
          )}
        </>
      )}
    </Paper>
  );
};

export default MFAVerification;