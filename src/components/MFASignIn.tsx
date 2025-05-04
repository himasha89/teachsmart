import React, { useState, useEffect, useRef } from 'react';
import { 
  MultiFactorResolver,
  RecaptchaVerifier
} from 'firebase/auth';
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
  startMFASignIn,
  completeMFASignIn,
  cleanupRecaptchaVerifier,
  createRecaptchaVerifier
} from '../mfa/firebase-mfa';

interface MFASignInProps {
  resolver: MultiFactorResolver;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

const MFASignIn: React.FC<MFASignInProps> = ({ 
  resolver,
  onSuccess,
  onError
}) => {
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  
  // Reference to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Initialize verification process
    initializeVerification();
    
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Clean up RecaptchaVerifier when component unmounts
      if (recaptchaVerifierRef.current) {
        cleanupRecaptchaVerifier(recaptchaVerifierRef.current);
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const initializeVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a fresh reCAPTCHA verifier
      recaptchaVerifierRef.current = createRecaptchaVerifier('recaptcha-container');
      
      // Start MFA sign-in process
      const vId = await startMFASignIn(resolver, recaptchaVerifierRef.current);
      
      if (isMountedRef.current) {
        setVerificationId(vId);
        setVerificationSent(true);
      }
    } catch (err: any) {
      console.error('Error starting MFA verification:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Failed to start verification process. Please try again.');
        onError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const verifyAndSignIn = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Complete MFA sign-in
      await completeMFASignIn(resolver, verificationId, verificationCode);
      
      // Clean up reCAPTCHA
      if (recaptchaVerifierRef.current) {
        cleanupRecaptchaVerifier(recaptchaVerifierRef.current);
        recaptchaVerifierRef.current = null;
      }
      
      // Call success callback
      onSuccess();
    } catch (err: any) {
      console.error('MFA verification error:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Invalid verification code. Please try again.');
        onError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    
    // Clean up existing reCAPTCHA
    if (recaptchaVerifierRef.current) {
      cleanupRecaptchaVerifier(recaptchaVerifierRef.current);
      recaptchaVerifierRef.current = null;
    }
    
    // Reinitialize verification
    initializeVerification();
  };

  if (loading && !verificationSent) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto' }} />;
  }

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
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Please enter the 6-digit verification code sent to your phone.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Hidden container for reCAPTCHA */}
      <Box id="recaptcha-container" sx={{ height: 0, overflow: 'hidden' }}></Box>
      
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
      />
      
      <Button 
        variant="contained" 
        fullWidth
        onClick={verifyAndSignIn}
        disabled={loading || !verificationCode}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Verify & Sign In'}
      </Button>
      
      <Button
        variant="text"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleResendCode}
        disabled={loading}
      >
        Resend Code
      </Button>
    </Paper>
  );
};

export default MFASignIn;