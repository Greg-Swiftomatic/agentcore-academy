# AgentCore Academy

Interactive learning platform for Amazon Bedrock AgentCore.

## Project Overview

A public educational web app that teaches developers Amazon Bedrock AgentCore through structured curriculum + AI-powered tutoring.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Hosting:** AWS Amplify Gen 2 (standalone mode)
- **AI:** OpenRouter API (GLM-4 model: `z-ai/glm-4.7`)
- **Database:** DynamoDB (via Amplify Data)
- **Auth:** Amazon Cognito (Google OAuth)
- **Content:** JSON lessons + Markdown knowledge base
- **Styling:** Tailwind CSS

## Project Structure

```
/src
  /app                  # Next.js App Router pages
    /api/tutor          # AI tutor streaming API endpoint
    /learn              # Lesson pages
    /dashboard          # User dashboard
    /auth               # Authentication pages
  /components           # React components
  /lib                  # Utilities, API clients, helpers
  /content
    /modules            # Curriculum structure (JSON)
    /lessons            # Lesson content (JSON)
    /knowledge-base     # AI grounding content (Markdown)
    /prompts            # AI tutor system prompts
    /checks             # Comprehension check questions
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

## Local Development

Requires two terminals:

```bash
# Terminal 1: Amplify backend sandbox
npx ampx sandbox

# Terminal 2: Next.js frontend
npm run dev
```

Create `.env.local` with:
```
OPENROUTER_API_KEY=your-key-here
```

## AWS Services Used

- **Amplify Gen 2:** Hosting, CI/CD, Backend
- **Cognito:** User authentication (Google OAuth)
- **DynamoDB:** User progress, learning state
- **CloudFront:** CDN for static assets

## Key Files

- `src/app/api/tutor/route.ts` - AI tutor API (streaming, OpenRouter)
- `src/lib/openrouter.ts` - OpenRouter client (model: z-ai/glm-4.7)
- `src/lib/knowledge-base.ts` - Loads markdown content for AI grounding
- `src/lib/progress.ts` - User progress tracking
- `next.config.mjs` - Standalone output + content file tracing

## Environment Variables

**Required in Amplify Console:**
- `OPENROUTER_API_KEY` - OpenRouter API key for AI tutor

## Deployment

- **Live URL:** https://main.d137jxngnvzxkf.amplifyapp.com/
- **GitHub:** https://github.com/Greg-Swiftomatic/agentcore-academy
- Push to `main` triggers automatic Amplify deployment

## Development Notes

### Content Strategy
- Curriculum defined in JSON files under /src/content/modules
- Knowledge base created by analyzing https://github.com/awslabs/amazon-bedrock-agentcore-samples
- AI tutor uses embedded context (not RAG) - relevant content injected per lesson

### Data Model
- Single-table DynamoDB design
- Keys: USER#<id>, MODULE#<id>, STATE#<id>
- See /docs/plans/2025-01-01-agentcore-academy-design.md for full schema

### AI Tutor
- Context assembled per request: system prompt + knowledge base + lesson content
- Streaming responses via OpenRouter API (SSE)
- Teaching methodology: one concept at a time, comprehension checks, adaptive pacing

## Design Document

Full design specification: `/docs/plans/2025-01-01-agentcore-academy-design.md`
