# AgentCore Academy

An interactive learning platform that teaches developers how to build AI agents with Amazon Bedrock AgentCore.

## Overview

AgentCore Academy is a full-stack educational web application featuring:

- **9-Module Curriculum** - From fundamentals to capstone project deployment
- **AI-Powered Tutor** - BYOK (Bring Your Own Key) streaming chat with GLM-4
- **Hands-On Exercises** - 7 exercises building toward your capstone project
- **Progress Tracking** - Persistent user progress with comprehension checks
- **Collapsible UI** - Hide/show the AI tutor as needed

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (Serverless) |
| AI | OpenRouter API (GLM-4 model) - BYOK |
| Database | Amazon DynamoDB |
| Auth | Amazon Cognito (Google OAuth) |
| Hosting | AWS Amplify Gen 2 |
| CDN | Amazon CloudFront |

## Features

### AI Tutor (BYOK)
- **Bring Your Own Key** - Users provide their OpenRouter API key
- **Client-side streaming** - Direct browser-to-OpenRouter calls
- **Key stored locally** - Never touches our servers
- **Collapsible panel** - Hide when not in use

### Learning Experience
- 9 modules, 30+ lessons
- 7 hands-on exercises building toward capstone
- Capstone project: Build and deploy a real agent
- Comprehension checks after each module
- Code review and debugging help from AI tutor

### Architecture Highlights
- **Standalone SSR** - Next.js standalone output for serverless
- **Build-time content** - Knowledge base embedded via webpack
- **Single-table DynamoDB** - Efficient user progress storage
- **OAuth Integration** - Google authentication via Cognito

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/tutor/         # AI tutor streaming endpoint
│   ├── learn/             # Lesson pages
│   ├── dashboard/         # User dashboard
│   └── auth/              # Authentication flows
├── components/            # React components
│   ├── AITutor.tsx        # Main tutor with BYOK
│   ├── CollapsibleTutor.tsx # Collapse/expand wrapper
│   ├── APIKeyModal.tsx    # Key management modal
│   └── Exercise.tsx       # Exercise component
├── hooks/                 # Custom React hooks
│   └── useAPIKey.ts       # LocalStorage key management
├── lib/                   # Utilities and API clients
└── content/               # Curriculum and knowledge base
    ├── modules/           # Course structure (JSON)
    ├── lessons/           # Lesson content (JSON)
    ├── exercises/         # Per-module exercises (JSON)
    ├── checks/            # Comprehension quizzes (JSON)
    └── knowledge-base/    # AI grounding content (Markdown)
```

## Live Demo

**URL:** https://main.d137jxngnvzxkf.amplifyapp.com/

## Local Development

```bash
# Install dependencies
npm install

# Start Amplify backend (Terminal 1)
npx ampx sandbox

# Start Next.js frontend (Terminal 2)
npm run dev
```

No environment variables required for BYOK mode - users provide their own OpenRouter API key in the app.

## Curriculum

| Module | Topic | Exercises |
|--------|-------|-----------|
| 01 | Introduction to AgentCore | Agent Idea Canvas |
| 02 | Core Services | Service Map |
| 03 | Agent Patterns | Tool Spec Sheet |
| 04 | Hands-On Build | - |
| 05 | Security & IAM | IAM Policy Draft |
| 06 | Operations | Monitoring Dashboard |
| 07 | Advanced Topics | Multi-Agent Design |
| 08 | Deployment | Pre-Launch Checklist |
| 09 | Capstone Project | Full project build |

## License

MIT
