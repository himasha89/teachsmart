# TeachSmart

![TeachSmart Logo](public/icon.png)

## Overview

TeachSmart is an innovative educational platform that combines artificial intelligence with modern teaching methodologies. The platform enhances the teaching experience by providing smart tools for lesson planning, document analysis, grammar checking, and AI-assisted teaching.

## Features

### Lesson Planning Assistant
Create comprehensive lesson plans with AI support. Input your requirements, and TeachSmart will generate lesson plans with objectives, activities, assessments, and materials needed.

### Document Analysis
Upload and analyze documents with natural language processing. The platform supports PDF and text files, extracting key concepts and generating summaries to help understand complex materials.

### TeachBot
Get instant teaching support through an AI-powered chat interface. Ask questions about teaching strategies, lesson ideas, or educational concepts to receive real-time guidance.

### Grammar Checker
Check student writing for grammar and spelling errors. The tool provides suggestions for improvements, calculates writing quality scores, and highlights potential issues with explanations.

## Tech Stack

- **Frontend**: Next.js, React, Material UI
- **Authentication**: Firebase Authentication with multi-factor security
- **Database**: Firebase Firestore
- **PDF Processing**: PDF.js for document analysis
- **Security**: Email verification and phone-based MFA

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/himasha89/teachsmart.git
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
   - Enable Firebase Functions

4. Configure environment variables:
   Create a `.env.local` file in the root directory with your Firebase configuration.

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/             # Next.js app directory
│   ├── components/  # Shared components
│   ├── context/     # Context providers (Auth)
│   ├── dashboard/   # Dashboard pages
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── dashboard/       # Dashboard components
│   ├── components/  # Dashboard UI components
│   ├── home/        # Feature implementations
│   └── theme/       # Theme customizations
├── mfa/             # Multi-factor authentication
├── shared-theme/    # Theme providers
├── sign-in/         # Authentication components
└── sign-up/         # User registration components
```

## Authentication

TeachSmart implements robust Firebase Authentication with:
- Email and password authentication
- Email verification workflow
- Secure password reset functionality
- Phone-based multi-factor authentication (MFA)

## Features Implementation

### Lesson Planning Assistant
The Lesson Planning tool helps teachers create structured lesson plans with learning objectives, activities, and assessment strategies. Enter your requirements, and the AI will generate tailored plans that include:
- Learning objectives
- Required materials
- Structured activities
- Assessment strategies

### Document Analysis
This tool allows document analysis through NLP, with support for:
- PDF file upload and text extraction
- Text file processing
- Summary generation
- Key concept identification
- Results display for easy review

### TeachBot
TeachBot provides an interactive chat interface where teachers can:
- Ask questions about teaching methodologies
- Get assistance with lesson ideas
- Receive support for classroom management
- Access teaching resources and strategies

### Grammar Checker
The Grammar Checker analyzes student writing with:
- Grammar error detection
- Spelling correction
- Writing quality assessment
- Improvement suggestions
- Detailed explanations of issues found

## Security Features

TeachSmart prioritizes security with:
- Email verification for all new accounts
- Multi-factor authentication using phone verification
- Secure password handling
- Protected routes with authentication checks

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

## Benefits for Educators

TeachSmart helps educators:
- Create comprehensive lesson plans in less time
- Analyze educational materials efficiently
- Get instant teaching assistance through TeachBot
- Improve student writing with detailed grammar feedback