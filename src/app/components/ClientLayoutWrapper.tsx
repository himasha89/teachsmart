'use client';

import { AuthContextProvider } from "../context/AuthContext";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}