# AgentCore Academy

An interactive learning platform that teaches developers how to build AI agents with Amazon Bedrock AgentCore.

## Overview

AgentCore Academy is a full-stack educational web application featuring:

- **Structured Curriculum** - 8 modules covering AgentCore from basics to production deployment
- **AI-Powered Tutor** - Real-time conversational tutoring with streaming responses
- **Progress Tracking** - Persistent user progress with comprehension checks
- **Modern Architecture** - Serverless, scalable, and cost-effective

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (Serverless) |
| AI | OpenRouter API (GLM-4 model) |
| Database | Amazon DynamoDB |
| Auth | Amazon Cognito (Google OAuth) |
| Hosting | AWS Amplify Gen 2 |
| CDN | Amazon CloudFront |

## Features

### AI Tutor
- Streaming responses for real-time interaction
- Context-aware teaching based on lesson content
- Adaptive pacing with comprehension checks
- Grounded in curated knowledge base content

### Learning Experience
- Progressive curriculum from fundamentals to advanced topics
- Hands-on lessons with code examples
- Module-based progress tracking
- Interactive Q&A with the AI tutor

### Architecture Highlights
- **Standalone SSR** - Next.js standalone output for optimized serverless deployment
- **Single-table DynamoDB** - Efficient data model for user progress
- **Streaming API** - Server-Sent Events for real-time AI responses
- **OAuth Integration** - Secure Google authentication via Cognito

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/tutor/         # AI tutor streaming endpoint
│   ├── learn/             # Lesson pages
│   ├── dashboard/         # User dashboard
│   └── auth/              # Authentication flows
├── components/            # React components
├── lib/                   # Utilities and API clients
└── content/               # Curriculum and knowledge base
    ├── modules/           # Course structure (JSON)
    ├── lessons/           # Lesson content (JSON)
    └── knowledge-base/    # AI grounding content (Markdown)
```

## Live Demo

**URL:** https://main.d137jxngnvzxkf.amplifyapp.com/

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your OPENROUTER_API_KEY

# Start Amplify backend (Terminal 1)
npx ampx sandbox

# Start Next.js frontend (Terminal 2)
npm run dev
```

## What I Built

This project demonstrates:

- Full-stack Next.js application with App Router
- Integration with multiple AWS services (Amplify, Cognito, DynamoDB)
- Real-time streaming AI responses
- OAuth authentication flow
- Serverless architecture on AWS
- Content management for educational curriculum

## License

MIT
