"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  AuthError as FirebaseAuthError,
  getAuth,
  getMultiFactorResolver
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import SignIn from '../../sign-in/SignIn';
import MFASignIn from '../../components/MFASignIn';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // MFA verification states
  const [needsMFA, setNeedsMFA] = useState(false);
  const [resolver, setResolver] = useState<any>(null);

  // Handle forgot password
  const handleForgotPassword = async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError({
        code: 'auth/invalid-email',
        message: 'Please enter a valid email address to reset your password.'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}. Please check your inbox.`);
    } catch (err) {
      const firebaseError = err as FirebaseAuthError;
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      }
      
      setError({
        code: firebaseError.code,
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard/home');
    } catch (err) {
      const firebaseError = err as FirebaseAuthError;
      
      // Check if error is related to MFA
      if (firebaseError.code === 'auth/multi-factor-auth-required') {
        // Handle MFA required case
        const multiFactorError = err as any;
        const mfaResolver = getMultiFactorResolver(auth, multiFactorError);
        setResolver(mfaResolver);
        setNeedsMFA(true);
      } else if (firebaseError.code === 'auth/invalid-credential') {
        setError({
          code: firebaseError.code,
          message: 'Incorrect email or password. Please try again.'
        });
      } else if (firebaseError.code === 'auth/user-not-found') {
        setError({
          code: firebaseError.code,
          message: 'No account found with this email address.'
        });
      } else if (firebaseError.code === 'auth/wrong-password') {
        setError({
          code: firebaseError.code,
          message: 'Incorrect password. Please try again.'
        });
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError({
          code: firebaseError.code,
          message: 'Too many unsuccessful login attempts. Please try again later or reset your password.'
        });
      } else {
        setError({
          code: firebaseError.code,
          message: 'An error occurred during sign in. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASuccess = () => {
    // Redirect on successful MFA sign-in
    router.push('/dashboard/home');
  };

  const handleMFAError = (error: Error) => {
    // Handle MFA errors
    setError({
      message: error.message || 'MFA verification failed. Please try again.'
    });
    setNeedsMFA(false);
  };

  // If MFA verification is needed, show the MFA sign-in component
  if (needsMFA && resolver) {
    return (
      <MFASignIn 
        resolver={resolver}
        onSuccess={handleMFASuccess}
        onError={handleMFAError}
      />
    );
  }

  return (
    <SignIn 
      onSignin={onSignin} 
      setEmail={setEmail} 
      setPassword={setPassword} 
      email={email}
      password={password}
      error={error}
      isLoading={isLoading}
      onForgotPassword={handleForgotPassword}
    />
  );
}