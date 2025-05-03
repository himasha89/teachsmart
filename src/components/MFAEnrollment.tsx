import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  multiFactor, 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  PhoneMultiFactorGenerator,
  getAuth
} from 'firebase/auth';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper,
  Step,
  Stepper,
  StepLabel,
  Dialog
} from '@mui/material';
import { 
  isMFAEnabled,
  unenrollMFA
} from '../mfa/firebase-mfa';

// reCAPTCHA Enterprise site key
const RECAPTCHA_SITE_KEY = '6LeOxywrAAAAAACn-0YKinJbHSqorOI_991mnOhxr';

interface MFAEnrollmentProps {
  user: User;
  onSuccess: () => void;
}

const MFAEnrollment: React.FC<MFAEnrollmentProps> = ({ 
  user,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [hasMFA, setHasMFA] = useState<boolean>(false);
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if user already has MFA enabled
    checkMFAStatus();
    
    // Do not set up recaptcha on mount - wait until it's needed
    
    return () => {
      // Clean up RecaptchaVerifier when component unmounts
      cleanupRecaptchaVerifier();
    };
  }, [user]);

  const setupRecaptchaVerifier = () => {
    cleanupRecaptchaVerifier();
    
    try {
      // Make sure the container is empty before initializing
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        // Clear any existing content
        recaptchaContainer.innerHTML = '';
      }
      
      const auth = getAuth();
      
      // For Firebase v9, we need to properly use RecaptchaVerifier
      // This approach works better with reCAPTCHA Enterprise
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            setError('reCAPTCHA verification expired. Please try again.');
          }
          // Note: We're not explicitly setting sitekey here, letting Firebase handle it
        }
      );
      
      // Render explicitly with error handling
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.render()
          .then(widgetId => {
            console.log('reCAPTCHA widget rendered successfully, ID:', widgetId);
          })
          .catch(error => {
            console.error('Failed to render reCAPTCHA:', error);
            setError('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
          });
      }
    } catch (err: any) {
      console.error('Error setting up reCAPTCHA:', err);
      setError('Failed to initialize reCAPTCHA: ' + err.message);
    }
  };

  const cleanupRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        console.error('Error clearing reCAPTCHA:', e);
      }
      recaptchaVerifierRef.current = null;
      
      // DO NOT clear the container manually
      // Let Firebase handle the reCAPTCHA lifecycle
    }
  };

  const checkMFAStatus = async () => {
    try {
      setLoading(true);
      const enabled = await isMFAEnabled(user);
      setHasMFA(enabled);
      
      if (enabled) {
        // Get enrolled factors information
        const multiFactorUser = multiFactor(user);
        setEnrolledFactors(multiFactorUser.enrolledFactors);
      }
    } catch (err) {
      console.error('Error checking MFA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Format the phone number
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${cleanPhoneNumber}`;
      
      const auth = getAuth();
      
      // First, clean up any existing reCAPTCHA verifier
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error('Error clearing existing reCAPTCHA:', e);
        }
        recaptchaVerifierRef.current = null;
      }
      
      // Create a new RecaptchaVerifier - IMPORTANT: Do NOT clear the container first
      // Let Firebase handle the container contents
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container', 
        {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified');
          }
        }
      );
      
      // Get the multi-factor session
      const multiFactorUser = multiFactor(user);
      const session = await multiFactorUser.getSession();
      
      // Send verification code
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      try {
        const vId = await phoneAuthProvider.verifyPhoneNumber(
          {
            phoneNumber: formattedPhoneNumber,
            session
          }, 
          recaptchaVerifierRef.current
        );
        
        // Only clear the verifier AFTER verification succeeds
        setVerificationId(vId);
        setActiveStep(1);
      } catch (error: any) {
        console.error('Error during phone verification:', error);
        
        // Handle specific verification errors
        if (error.code) {
          if (
            error.code === 'auth/missing-recaptcha-token' || 
            error.code === 'auth/invalid-recaptcha-token' ||
            error.code === 'auth/captcha-check-failed'
          ) {
            setError('reCAPTCHA verification failed. Please try again with a valid phone number.');
          } else {
            setError(error.message || 'Failed to verify phone number. Please try again.');
          }
        } else {
          setError('Verification failed. Please check your phone number and try again.');
        }
      }
    } catch (err: any) {
      console.error('Overall error in sendVerificationCode:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnroll = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId, 
        verificationCode
      );
      
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      const multiFactorUser = multiFactor(user);
      await multiFactorUser.enroll(multiFactorAssertion, "Phone");
      
      setHasMFA(true);
      await checkMFAStatus();
      
      // Call onSuccess callback with no arguments
      onSuccess();
    } catch (err: any) {
      console.error('MFA enrollment error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      for (const factor of enrolledFactors) {
        await unenrollMFA(user, factor);
      }
      
      setHasMFA(false);
      setEnrolledFactors([]);
      setOpenDialog(false);
      
      // Call onSuccess with no arguments
      onSuccess();
    } catch (err: any) {
      console.error('Error disabling MFA:', err);
      setError(err.message || 'Failed to disable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !hasMFA) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto' }} />;
  }

  if (hasMFA) {
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
        
        <Alert severity="success" sx={{ mb: 3 }}>
          Two-factor authentication is enabled
        </Alert>
        
        {enrolledFactors.map((factor, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Phone: {factor.displayName || 'Phone Authentication'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Factor ID: {factor.uid.substring(0, 8)}...
            </Typography>
          </Box>
        ))}
        
        <Button 
          variant="outlined" 
          color="error"
          fullWidth
          onClick={() => setOpenDialog(true)}
        >
          Disable Two-Factor Authentication
        </Button>
        
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <Box sx={{ p: 3, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Disable Two-Factor Authentication?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              This will reduce the security of your account. Are you sure you want to continue?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={disableMFA}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Disable'}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Paper>
    );
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
        Enable Two-Factor Authentication
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Phone Number</StepLabel>
        </Step>
        <Step>
          <StepLabel>Verification</StepLabel>
        </Step>
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 ? (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Add your phone number to receive verification codes when signing in.
          </Typography>
          
          <TextField
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="+1 (123) 456-7890"
            autoFocus
            disabled={loading}
          />
          
          {/* reCAPTCHA container - must be persistent in the DOM */}
          <div 
            id="recaptcha-container" 
            style={{ position: 'fixed', bottom: '0', left: '-10000px', visibility: 'hidden' }}
          ></div>
          
          <Button 
            variant="contained" 
            fullWidth
            onClick={sendVerificationCode}
            disabled={loading || !phoneNumber}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
          </Button>
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter the 6-digit verification code sent to your phone.
          </Typography>
          
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
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={() => setActiveStep(0)}
              disabled={loading}
            >
              Back
            </Button>
            <Button 
              variant="contained" 
              onClick={verifyAndEnroll}
              disabled={loading || !verificationCode}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify & Enable'}
            </Button>
          </Box>
          
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={sendVerificationCode}
            disabled={loading}
          >
            Resend Code
          </Button>
        </>
      )}
    </Paper>
  );
};

export default MFAEnrollment;