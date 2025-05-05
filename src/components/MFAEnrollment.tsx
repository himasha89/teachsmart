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
  Dialog
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

  // Complete cleanup of reCAPTCHA
  const cleanupRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
        console.log('reCAPTCHA verifier cleared');
      } catch (e) {
        console.error('Error clearing reCAPTCHA:', e);
      }
      
      recaptchaVerifierRef.current = null;
    }
    
    // Remove any reCAPTCHA elements from the DOM
    const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, .grecaptcha-logo, iframe[src*="recaptcha"]');
    recaptchaElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
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

  // Create a fresh reCAPTCHA container
  const createFreshRecaptchaContainer = () => {
    // Clean up any existing reCAPTCHA setup
    cleanupRecaptchaVerifier();
    
    // Remove existing container if it exists
    const existingContainer = document.getElementById('recaptcha-container');
    if (existingContainer && existingContainer.parentNode) {
      existingContainer.parentNode.removeChild(existingContainer);
    }
    
    // Create a new container
    const container = document.createElement('div');
    container.id = 'recaptcha-container';
    container.style.position = 'absolute';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '0';
    container.style.height = '0';
    container.style.overflow = 'hidden';
    container.style.visibility = 'hidden';
    document.body.appendChild(container);
    
    console.log('Created fresh reCAPTCHA container');
    return container.id;
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
      
      const auth = getAuth();
      
      // Create a fresh container for reCAPTCHA
      const containerId = createFreshRecaptchaContainer();
      
      // Short delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        // Create new reCAPTCHA verifier
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          containerId,
          { 
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified successfully');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA challenge expired');
              cleanupRecaptchaVerifier();
            }
          }
        );
        
        // Get the multi-factor session
        const multiFactorUser = multiFactor(user);
        const session = await multiFactorUser.getSession();
        
        // Send verification code
        const phoneAuthProvider = new PhoneAuthProvider(auth);
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
        } else if (verifyError.message && (
          verifyError.message.includes('has already been rendered') || 
          verifyError.message.includes('reCAPTCHA')
        )) {
          // Handle reCAPTCHA specific errors
          if (isMountedRef.current) {
            setError('Security verification error. Please try again.');
            // Clean up completely
            cleanupRecaptchaVerifier();
          }
        } else {
          if (isMountedRef.current) {
            setError(verifyError.message || 'Failed to verify phone number. Please try again.');
          }
        }
      }
    } catch (err: any) {
      console.error('Error sending verification code:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
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

  // Handle resend code
  const handleResendCode = async () => {
    setVerificationCode('');
    setActiveStep(0);
    
    // Clean up completely first
    cleanupRecaptchaVerifier();
    
    // Short delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Then trigger send code with a fresh container
    if (isMountedRef.current) {
      sendVerificationCode();
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
            variant="outlined" 
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
              variant="outlined" 
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
            onClick={handleResendCode}
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