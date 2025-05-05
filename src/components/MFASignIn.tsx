import React, { useState, useEffect, useRef } from 'react';
import { 
  MultiFactorResolver,
  RecaptchaVerifier,
  getAuth
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
  createFreshRecaptchaContainer,
  createUniqueContainerId
} from '../mfa/firebase-signin-mfa';

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
  const containerIdRef = useRef<string>(createUniqueContainerId());
  
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

  // Reset reCAPTCHA and create fresh environment for verification
  const resetRecaptchaEnvironment = async () => {
    // Clean up any existing verifier
    if (recaptchaVerifierRef.current) {
      cleanupRecaptchaVerifier(recaptchaVerifierRef.current);
      recaptchaVerifierRef.current = null;
    }
    
    // Generate a new container ID
    containerIdRef.current = createUniqueContainerId();
    
    // Create a fresh container
    createFreshRecaptchaContainer(containerIdRef.current);
    
    // Short delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const initializeVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reset reCAPTCHA environment
      await resetRecaptchaEnvironment();
      
      // Create a fresh reCAPTCHA verifier
      try {
        // Get the Firebase auth instance
        const auth = getAuth();
        
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          containerIdRef.current,
          { 
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified successfully');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA challenge expired');
            }
          }
        );
        
        // Start MFA sign-in process
        const vId = await startMFASignIn(resolver, recaptchaVerifierRef.current);
        
        if (isMountedRef.current) {
          setVerificationId(vId);
          setVerificationSent(true);
        }
      } catch (verifyError: any) {
        console.error('Error initializing verification:', verifyError);
        
        if (verifyError.message && verifyError.message.includes('has already been rendered')) {
          // Handle reCAPTCHA specific errors - try again with a complete reset
          await resetRecaptchaEnvironment();
          
          if (isMountedRef.current) {
            setError('Security verification error. Please try again later.');
            onError(verifyError);
          }
        } else {
          if (isMountedRef.current) {
            setError(verifyError.message || 'Failed to initialize verification process.');
            onError(verifyError);
          }
        }
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
    setVerificationSent(false);
    
    // Reset reCAPTCHA environment completely
    await resetRecaptchaEnvironment();
    
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
        variant="outlined" 
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
      
      {/* Hidden container for reCAPTCHA that will not be used directly */}
      <div id={containerIdRef.current} style={{ display: 'none' }}></div>
    </Paper>
  );
};

export default MFASignIn;