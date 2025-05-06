# TeachSmart

![TeachSmart Logo](public/icon.png)

## Overview

TeachSmart is an innovative educational platform that combines artificial intelligence with modern teaching methodologies. The platform is designed to enhance the teaching experience by providing smart tools for lesson planning, document analysis, and student engagement.

## Features

### Lesson Planning
Create lesson plans with AI support. Generate comprehensive plans with objectives, activities, and assessments.

### Document Analysis
Analyze historical documents with NLP for insights. Upload PDFs and text files to extract summaries and key concepts.

### TeachBot
Your AI teaching assistant. Ask questions, get lesson ideas, and receive instant support for all your teaching needs.

### Grammar Checker
Check student writing for grammar and spelling errors in real-time. Get improvement suggestions and writing quality scores.

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

TeachSmart uses Firebase Authentication with the following features:
- Email and password authentication
- Email verification
- Password reset functionality
- Optional phone-based multi-factor authentication (MFA)

## Features Implementation

### Lesson Planning
The Lesson Planning tool helps teachers create structured lesson plans with learning objectives, activities, and assessment strategies. It uses AI to generate content based on the teacher's input.

### Document Analysis
This tool allows teachers to upload PDF and text documents for analysis. It extracts text from documents and provides summaries using natural language processing.

### TeachBot
TeachBot provides an interactive chat interface where teachers can ask questions and get AI-generated responses. It connects to a backend service for processing queries.

### Grammar Checker
The Grammar Checker analyzes student writing for grammar and spelling errors. It provides suggestions for improvements and calculates a writing quality score.

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
- Analyze historical documents and educational materials efficiently
- Get instant teaching assistance through TeachBot
- Improve student writing with detailed grammar feedback