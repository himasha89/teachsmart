"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import SignUp from '../../sign-up/SignUp';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirect to dashboard on successful signup
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Failed to sign up. Please try again.");
    }
  };

  return (
    <SignUp
      onSignup={handleSignup}
      setEmail={setEmail}
      setPassword={setPassword}
      email={email}
      password={password}
    />
  );
}
