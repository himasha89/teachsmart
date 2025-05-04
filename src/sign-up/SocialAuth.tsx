// SocialAuth.tsx - Component for handling Google and Facebook authentication

import * as React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  AuthError as FirebaseAuthError,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { auth } from '../firebaseConfig';  // Make sure this path matches your project structure
import { GoogleIcon, FacebookIcon } from './CustomIcons';  // Import from your existing CustomIcons component

interface SocialAuthProps {
  onSuccess: (user: User) => void;
  setError: (error: { code?: string; message: string } | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ 
  onSuccess, 
  setError, 
  isLoading, 
  setIsLoading 
}) => {
  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const googleProvider = new GoogleAuthProvider();
      // Add scopes for additional permissions if needed
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Send email verification if not already verified
      if (result.user && !result.user.emailVerified) {
        await sendEmailVerification(result.user);
      }
      
      // Call the success callback with the user
      onSuccess(result.user);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.error("Google sign-in error:", firebaseError);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      // Handle specific error cases
      if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in method.';
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      }
      
      setError({
        code: firebaseError.code,
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook sign-in handler
  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const facebookProvider = new FacebookAuthProvider();
      // Add scopes for additional permissions if needed
      facebookProvider.addScope('email');
      facebookProvider.addScope('public_profile');
      
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Send email verification if not already verified
      if (result.user && !result.user.emailVerified) {
        await sendEmailVerification(result.user);
      }
      
      // Call the success callback with the user
      onSuccess(result.user);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.error("Facebook sign-in error:", firebaseError);
      
      let errorMessage = 'Failed to sign in with Facebook. Please try again.';
      
      // Handle specific error cases
      if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in method.';
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      }
      
      setError({
        code: firebaseError.code,
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        startIcon={<GoogleIcon />}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : "Sign up with Google"}
      </Button>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleFacebookSignIn}
        startIcon={<FacebookIcon />}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : "Sign up with Facebook"}
      </Button>
    </Box>
  );
};

export default SocialAuth;