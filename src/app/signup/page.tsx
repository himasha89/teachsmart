"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  AuthError as FirebaseAuthError,
  User
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import SignUp from '../../sign-up/SignUp';
import MFAEnrollment from '../../components/MFAEnrollment';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  // Steps for signup process
  const steps = ['Create Account', 'Verify Email', 'Setup Two-Factor Authentication'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Move to next step
      setCurrentUser(user);
      setActiveStep(1);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.error("Error during signup:", firebaseError);
      
      let errorMessage = 'Failed to sign up. Please try again.';
      
      // Handle specific error cases
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or sign in.';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Please use a stronger password (at least 6 characters).';
      }
      
      setError({
        code: firebaseError.code,
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for social authentication success
  const handleSocialSignup = async (user: User) => {
    setCurrentUser(user);
    
    // If email is already verified (common with Google/Facebook auth), skip to MFA step
    if (user.emailVerified) {
      setActiveStep(2);
    } else {
      // Otherwise, go to email verification step
      setActiveStep(1);
    }
  };

  const handleEmailVerification = async () => {
    setIsLoading(true);
    try {
      // Refresh the user to check if email is verified
      if (currentUser) {
        await currentUser.reload();
        const refreshedUser = auth.currentUser;
        
        if (refreshedUser && refreshedUser.emailVerified) {
          // Move to MFA setup
          setCurrentUser(refreshedUser);
          setActiveStep(2);
        } else {
          setError({
            message: 'Your email is not verified yet. Please check your inbox and click the verification link.'
          });
        }
      }
    } catch (error) {
      console.error("Error checking email verification:", error);
      setError({
        message: 'Failed to verify email status. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setError(null);
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setError({
        message: 'Failed to send verification email. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASuccess = () => {
    // Redirect to dashboard on successful MFA setup
    router.push('/dashboard/home');
  };

  const skipMFA = () => {
    // Redirect to dashboard without setting up MFA
    router.push('/dashboard/home');
  };

  // Render different UI based on the current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <SignUp
            onSignup={handleSignup}
            setEmail={setEmail}
            setPassword={setPassword}
            setFullName={setFullName}
            email={email}
            password={password}
            fullName={fullName}
            error={error}
            isLoading={isLoading}
            onSocialSignup={handleSocialSignup}
            setError={setError}
            setIsLoading={setIsLoading}
          />
        );
      case 1:
        return (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 400,
              width: '100%',
              mx: 'auto',
              mt: 4
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Verify Your Email
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              A verification email has been sent to <strong>{currentUser?.email}</strong>
            </Alert>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error.message}
              </Alert>
            )}
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please check your inbox (and spam folder) and click the verification link.
              Once verified, click the button below to continue.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleEmailVerification}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "I've Verified My Email"}
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={resendVerificationEmail}
                disabled={isLoading}
              >
                Resend Verification Email
              </Button>
            </Box>
          </Paper>
        );
      case 2:
        // If user exists, show MFA setup
        return currentUser ? (
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Enhance Your Account Security
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                Setting up two-factor authentication adds an extra layer of security to your account.
                Each time you sign in, you'll need to provide a verification code sent to your phone.
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 3 }}>
                This step is optional but highly recommended for better security.
              </Typography>
              
              <Button 
                variant="outlined" 
                onClick={skipMFA}
                sx={{ mr: 2 }}
              >
                Skip for Now
              </Button>
            </Paper>
            
            <MFAEnrollment
              user={currentUser}
              onSuccess={handleMFASuccess}
            />
          </Box>
        ) : (
          <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {activeStep > 0 && (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      
      {renderStepContent()}
    </Box>
  );
}