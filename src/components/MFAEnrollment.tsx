import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  multiFactor, 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  PhoneMultiFactorGenerator,
  getAuth,
  sendEmailVerification
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
  Dialog,
  Link
} from '@mui/material';
import { 
  isMFAEnabled,
  unenrollMFA
} from '../mfa/firebase-mfa';

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
  const [configError, setConfigError] = useState<boolean>(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState<boolean>(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [hasMFA, setHasMFA] = useState<boolean>(false);
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  
  // Reference to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Check if user already has MFA enabled
    checkMFAStatus();
    
    // Check if email is verified
    checkEmailVerification();
    
    // Create a permanent reCAPTCHA container if it doesn't exist
    ensureRecaptchaContainer();
    
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Clean up RecaptchaVerifier when component unmounts
      cleanupRecaptchaVerifier();
    };
  }, [user]);

  // Check if user's email is verified
  const checkEmailVerification = () => {
    if (user && !user.emailVerified) {
      setNeedsEmailVerification(true);
    } else {
      setNeedsEmailVerification(false);
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Send verification email
      await sendEmailVerification(user);
      
      if (isMountedRef.current) {
        setVerificationEmailSent(true);
      }
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Failed to send verification email');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Refresh user to check if email has been verified
  const refreshUserEmailVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reload user data
      await user.reload();
      
      if (isMountedRef.current) {
        if (user.emailVerified) {
          setNeedsEmailVerification(false);
          setVerificationEmailSent(false);
        } else {
          setError('Email not verified yet. Please check your inbox and verify your email.');
        }
      }
    } catch (err: any) {
      console.error('Error refreshing user data:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Failed to refresh user data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Ensure we have a stable reCAPTCHA container
  const ensureRecaptchaContainer = () => {
    // Check if we need to create a permanent container at the document level
    if (!document.getElementById('global-recaptcha-container')) {
      const container = document.createElement('div');
      container.id = 'global-recaptcha-container';
      // Position it somewhere it won't interfere with layout but still be in the DOM
      container.style.position = 'fixed';
      container.style.bottom = '0';
      container.style.left = '0';
      container.style.width = '0px';
      container.style.height = '0px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
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
    }
  };

  const checkMFAStatus = async () => {
    try {
      setLoading(true);
      const enabled = await isMFAEnabled(user);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setHasMFA(enabled);
        
        if (enabled) {
          // Get enrolled factors information
          const multiFactorUser = multiFactor(user);
          setEnrolledFactors(multiFactorUser.enrolledFactors);
        }
      }
    } catch (err) {
      console.error('Error checking MFA status:', err);
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
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
      setConfigError(false);
      setNeedsEmailVerification(false); // Reset email verification flag
      
      // Format the phone number
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${cleanPhoneNumber}`;
      
      // Check if email is verified
      if (!user.emailVerified) {
        setNeedsEmailVerification(true);
        return;
      }
      
      // PRODUCTION FLOW WITH ERROR HANDLING
      const auth = getAuth();
      
      // Clean up any existing verifier
      cleanupRecaptchaVerifier();
      
      // Get a stable container that won't be removed 
      const recaptchaContainer = document.getElementById('global-recaptcha-container');
      if (!recaptchaContainer) {
        throw new Error('reCAPTCHA container not found');
      }
      
      // Create RecaptchaVerifier with minimal configuration
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        recaptchaContainer,
        { size: 'invisible' }
      );
      
      // Render the verifier before using it
      await recaptchaVerifierRef.current.render();
      
      // Get the multi-factor session
      const multiFactorUser = multiFactor(user);
      const session = await multiFactorUser.getSession();
      
      // Send verification code using the standard Firebase approach
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      try {
        const vId = await phoneAuthProvider.verifyPhoneNumber(
          {
            phoneNumber: formattedPhoneNumber,
            session
          }, 
          recaptchaVerifierRef.current
        );
        
        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          setVerificationId(vId);
          setActiveStep(1);
        }
      } catch (verifyError: any) {
        console.error('Phone verification error:', verifyError);
        
        if (verifyError.code === 'auth/operation-not-allowed') {
          // This is a configuration error - SMS MFA not enabled in Firebase
          setConfigError(true);
          setError('SMS-based MFA is not enabled in your Firebase project.');
        } else if (verifyError.code === 'auth/unverified-email') {
          // Email verification required
          setNeedsEmailVerification(true);
        } else if (verifyError.message && verifyError.message.includes('client element has been removed')) {
          setError('reCAPTCHA element was removed. Please try again.');
        } else {
          setError(verifyError.message || 'Failed to verify phone number. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Error sending verification code:', err);
      
      // Handle different error scenarios
      let errorMessage = 'Failed to send verification code. Please try again.';
      
      if (err.code === 'auth/missing-recaptcha-token') {
        errorMessage = 'reCAPTCHA verification failed. Please try on a registered domain.';
      } else if (err.code === 'auth/argument-error') {
        errorMessage = 'Domain not configured properly for reCAPTCHA. Check your Firebase settings.';
      } else if (err.code === 'auth/operation-not-allowed') {
        // This is a configuration error - SMS MFA not enabled in Firebase
        setConfigError(true);
        errorMessage = 'SMS-based MFA is not enabled in your Firebase project.';
      } else if (err.code === 'auth/unverified-email') {
        // Email verification required
        setNeedsEmailVerification(true);
        return; // Return early to prevent showing error message
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
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
      
      // Production verification
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId, 
        verificationCode
      );
      
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      const multiFactorUser = multiFactor(user);
      await multiFactorUser.enroll(multiFactorAssertion, "Phone");
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setHasMFA(true);
        await checkMFAStatus();
        onSuccess();
      }
    } catch (err: any) {
      console.error('MFA enrollment error:', err);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(err.message || 'Invalid verification code. Please try again.');
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const disableMFA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Production flow
      for (const factor of enrolledFactors) {
        await unenrollMFA(user, factor);
      }
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setHasMFA(false);
        setEnrolledFactors([]);
        setOpenDialog(false);
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error disabling MFA:', err);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(err.message || 'Failed to disable MFA. Please try again.');
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  if (loading && !hasMFA && !needsEmailVerification) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto' }} />;
  }

  // Email verification screen
  if (needsEmailVerification) {
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
          Email Verification Required
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          You must verify your email address before setting up two-factor authentication
        </Alert>
        
        {verificationEmailSent ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              A verification email has been sent to <strong>{user.email}</strong>. 
              Please check your inbox (and spam folder) and click the verification link.
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              Once you've verified your email, click the button below to continue.
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={refreshUserEmailVerification}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "I've Verified My Email"}
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={sendVerificationEmail}
                disabled={loading}
              >
                Resend Verification Email
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              To use two-factor authentication, you need to verify your email address first.
              Click the button below to send a verification email to <strong>{user.email}</strong>.
            </Typography>
            
            <Button 
              variant="contained" 
              fullWidth
              onClick={sendVerificationEmail}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Verification Email'}
            </Button>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>
    );
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

  // Configuration error alert
  if (configError) {
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
          Configuration Error
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3 }}>
          SMS-based MFA is not enabled in your Firebase project
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          To use phone-based two-factor authentication, you need to enable SMS multi-factor authentication in your Firebase project.
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Please follow these steps:
          <ol>
            <li>Go to the Firebase Console</li>
            <li>Select your project</li>
            <li>Navigate to Authentication → Sign-in method</li>
            <li>Scroll down to "Multi-factor authentication" section</li>
            <li>Enable "SMS" as a second factor</li>
            <li>Set up SMS provider if required</li>
            <li>Save your changes</li>
          </ol>
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            href="https://console.firebase.google.com/" 
            target="_blank"
          >
            Go to Firebase Console
          </Button>
          
          <Button 
            variant="contained"
            onClick={() => {
              setConfigError(false);
              setError(null);
            }}
          >
            Try Again
          </Button>
        </Box>
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