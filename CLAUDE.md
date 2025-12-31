# AgentCore Academy

Interactive learning platform for Amazon Bedrock AgentCore.

## Project Overview

A public educational web app that teaches developers Amazon Bedrock AgentCore through structured curriculum + AI-powered tutoring.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Hosting:** AWS Amplify
- **AI:** Amazon Bedrock (Claude)
- **Database:** DynamoDB
- **Auth:** Amazon Cognito (GitHub + Google OAuth)
- **Content:** MDX files + dynamic AI responses
- **Styling:** Tailwind CSS

## Project Structure

```
/src
  /app                  # Next.js App Router pages
  /components           # React components
  /lib                  # Utilities, AWS clients, helpers
  /content
    /modules            # Course content (MDX)
    /prompts            # AI tutor system prompts
    /knowledge-base     # Analyzed repo content for AI grounding
/docs
  /plans                # Design documents
```

## Key Commands

```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript checks
```

## AWS Services Used

- **Amplify:** Hosting, CI/CD
- **Cognito:** User authentication (OAuth)
- **DynamoDB:** User data, progress, learning state
- **Bedrock:** AI tutor (Claude model)

## Development Notes

### Content Strategy
- Curriculum defined in MDX files under /src/content/modules
- Knowledge base created by analyzing https://github.com/awslabs/amazon-bedrock-agentcore-samples
- AI tutor uses embedded context (not RAG) - relevant content injected per lesson

### Data Model
- Single-table DynamoDB design
- Keys: USER#<id>, MODULE#<id>, STATE#<id>
- See /docs/plans/2025-01-01-agentcore-academy-design.md for full schema

### AI Tutor
- Context assembled per request: system prompt + module content + user state
- Streaming responses via Bedrock API
- Teaching methodology: one concept at a time, comprehension checks, adaptive pacing

## Design Document

Full design specification: `/docs/plans/2025-01-01-agentcore-academy-design.md`
