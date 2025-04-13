"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmailAndPassword, AuthError as FirebaseAuthError } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import SignIn from '../../sign-in/SignIn';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard/home');
    } catch (err) {
      const firebaseError = err as FirebaseAuthError;
      
      if (firebaseError.code === 'auth/invalid-credential') {
        setError({
          code: firebaseError.code,
          message: 'Incorrect email or password. Please try again.'
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

  return (
    <SignIn 
      onSignin={onSignin} 
      setEmail={setEmail} 
      setPassword={setPassword} 
      email={email}
      password={password}
      error={error}
      isLoading={isLoading}
    />
  );
}