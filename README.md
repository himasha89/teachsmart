# TeachSmart

![TeachSmart Logo](public/icon.png)

## Overview

TeachSmart is an AI-powered educational platform designed to enhance teaching experiences through intelligent tools for lesson planning, document analysis, and student engagement. Our application combines artificial intelligence with modern teaching methodologies to help educators create more effective learning environments.

## Features

- **AI-Powered Teaching Assistant**: Leveraging advanced NLP using spaCy and Hugging Face Transformers for intelligent content analysis and recommendations
- **Comprehensive Lesson Planning**: Create and organize lesson plans with AI support, making curriculum development more efficient
- **Interactive Document Analysis**: Advanced document analysis capabilities for educational materials with NLP insights
- **Grammar Checker**: Check student writing for grammar and spelling errors in real-time
- **TeachBot**: AI teaching assistant for immediate support and creative lesson ideas
- **Multi-Factor Authentication**: Secure access with email verification and phone-based MFA
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Material UI
- **Authentication**: Firebase Authentication
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore
- **Deployment**: Vercel/Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/teachsmart.git
   cd teachsmart
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your Firebase project:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Phone)
   - Set up Firestore database
   - Set up Firebase Hosting
   - Enable Firebase Functions

4. Configure environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Tools

### Lesson Planning Assistant
Create comprehensive lesson plans with AI-generated content, learning objectives, assessment strategies, and more. Input your topic and grade level requirements, and receive a structured lesson plan tailored to your needs.

### Document Analysis
Upload and analyze educational documents to extract key insights, main themes, and important concepts. Great for historical texts and research materials.

### Grammar Checker
Check student writing for grammar, spelling, and style errors in real-time. Get suggestions for improvements and an overall writing quality score.

### TeachBot
Chat with an AI teaching assistant to get instant answers to teaching questions, creative lesson ideas, and support for classroom challenges.

## Deployment

### Firebase Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel project settings
3. Deploy through the Vercel dashboard

## Security Features

TeachSmart implements several security features:
- Email verification for new user accounts
- Optional phone-based multi-factor authentication
- Secure password reset functionality
- Protected routes using Next.js middleware
