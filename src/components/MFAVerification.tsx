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

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

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

  // For development mode only
  const [devMode, setDevMode] = useState<boolean>(isDevelopment);

  useEffect(() => {
    // Check if user already has MFA enabled
    checkMFAStatus();
    
    return () => {
      // Clean up RecaptchaVerifier when component unmounts
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [user]);

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
      
      // For development mode, skip actual verification
      if (devMode) {
        console.log('Development mode: Skipping actual verification');
        // Generate a fake verification ID
        const fakeVerificationId = 'dev-verification-' + Date.now();
        setVerificationId(fakeVerificationId);
        setActiveStep(1);
        setLoading(false);
        return;
      }
      
      // Production flow
      const auth = getAuth();
      
      // Clear any existing recaptcha
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      
      // Simplified reCAPTCHA creation - fewer options to reduce error chances
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
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
      
      setVerificationId(vId);
      setActiveStep(1);
    } catch (err: any) {
      console.error('Error sending verification code:', err);
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
      
      // For development mode
      if (devMode) {
        console.log('Development mode: Simulating successful MFA enrollment');
        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHasMFA(true);
        onSuccess();
        setLoading(false);
        return;
      }
      
      // Production flow
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId, 
        verificationCode
      );
      
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      const multiFactorUser = multiFactor(user);
      await multiFactorUser.enroll(multiFactorAssertion, "Phone");
      
      setHasMFA(true);
      await checkMFAStatus();
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
      
      // For development mode
      if (devMode) {
        console.log('Development mode: Simulating MFA disabling');
        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHasMFA(false);
        setEnrolledFactors([]);
        setOpenDialog(false);
        onSuccess();
        setLoading(false);
        return;
      }
      
      // Production flow
      for (const factor of enrolledFactors) {
        await unenrollMFA(user, factor);
      }
      
      setHasMFA(false);
      setEnrolledFactors([]);
      setOpenDialog(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error disabling MFA:', err);
      setError(err.message || 'Failed to disable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle dev mode (for testing purposes)
  const toggleDevMode = () => {
    setDevMode(!devMode);
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
          
          {/* This container is needed for reCAPTCHA - leave it even in dev mode */}
          <Box id="recaptcha-container" sx={{ mb: 2, mt: 2 }}></Box>
          
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
            {devMode && " (In development mode, any 6-digit code will work)"}
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