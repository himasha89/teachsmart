import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from 'next/font/google'; // Import Plus Jakarta Sans
import "./globals.css";
import { ClientLayoutWrapper } from "./components/ClientLayoutWrapper";
import localFont from "next/font/local";

// Configure Plus Jakarta Sans
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

// Keep Geist Mono for code snippets if needed
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TeachSmart",
  description: "POWERED BY AI, DRIVEN BY LEARNING",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}