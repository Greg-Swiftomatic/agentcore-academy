# AgentCore Academy - Design Document

**Date:** 2025-01-01  
**Status:** Approved  
**Project:** AgentCore Academy - Interactive Learning Platform for Amazon Bedrock AgentCore

---

## 1. Product Overview

### What We're Building

A public educational web application that teaches developers Amazon Bedrock AgentCore through a structured curriculum combined with an AI-powered tutor.

### Core Value Proposition

- Structured, module-based learning path covering the entire Bedrock AgentCore framework
- AI tutor (powered by Bedrock Claude) that explains concepts, answers questions, and adapts to the user's pace
- Comprehension checks that verify understanding before progressing
- Progress tracking so users can pick up where they left off

### Target Users

- Developers with some AWS experience who want to learn Bedrock AgentCore
- No community features - purely focused on the learning experience

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) |
| Hosting | AWS Amplify |
| AI | Amazon Bedrock (Claude) |
| Database | DynamoDB |
| Auth | Amazon Cognito (GitHub + Google OAuth) |
| Content | MDX files in codebase + dynamic AI responses |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    AWS Amplify                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Next.js Application                     │  │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │  │
│  │  │  │   Pages/    │  │   API       │  │   MDX       │  │  │  │
│  │  │  │   Components│  │   Routes    │  │   Content   │  │  │  │
│  │  │  └─────────────┘  └──────┬──────┘  └─────────────┘  │  │  │
│  │  └──────────────────────────┼──────────────────────────┘  │  │
│  └─────────────────────────────┼─────────────────────────────┘  │
│                                │                                 │
│         ┌──────────────────────┼──────────────────────┐         │
│         │                      │                      │         │
│         ▼                      ▼                      ▼         │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐   │
│  │   Cognito   │       │   Bedrock   │       │  DynamoDB   │   │
│  │  (Auth)     │       │  (Claude)   │       │  (Data)     │   │
│  │             │       │             │       │             │   │
│  │ - GitHub    │       │ - Tutor AI  │       │ - Users     │   │
│  │ - Google    │       │ - Questions │       │ - Progress  │   │
│  └─────────────┘       └─────────────┘       │ - Notes     │   │
│                                              └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User visits app → Amplify serves Next.js
2. User signs in → Cognito handles OAuth with GitHub/Google
3. User loads module → Next.js fetches MDX content + user progress from DynamoDB
4. User interacts with AI tutor → API route calls Bedrock, streams response back
5. User completes comprehension check → Progress saved to DynamoDB

---

## 3. Data Model (DynamoDB)

### Table: Users

```
PK: USER#<cognito_sub>
SK: PROFILE

Attributes:
- email: string
- name: string
- avatarUrl: string
- authProvider: "github" | "google"
- createdAt: ISO timestamp
- lastActiveAt: ISO timestamp
```

### Table: Progress

```
PK: USER#<cognito_sub>
SK: MODULE#<module_id>

Attributes:
- status: "not_started" | "in_progress" | "completed"
- startedAt: ISO timestamp
- completedAt: ISO timestamp (optional)
- currentLessonId: string
- comprehensionChecks: [
    { questionId, passed, attempts, lastAttemptAt }
  ]
- bookmarks: [lessonId, ...]
- notes: [{ lessonId, content, createdAt }, ...]
```

### Table: LearningState

```
PK: USER#<cognito_sub>
SK: STATE#<module_id>

Attributes:
- lastContext: string (summary of recent AI conversation for continuity)
- topicsExplained: [string, ...]
- questionsAsked: [{ question, answeredAt }, ...]
- identifiedGaps: [string, ...] (knowledge gaps AI has noted)
- updatedAt: ISO timestamp
```

---

## 4. Curriculum Structure

### Content Organization

```
/content
  /modules
    /01-introduction
      meta.json        # title, description, duration, prerequisites
      overview.mdx     # module intro, learning objectives
      /lessons
        01-what-is-agentcore.mdx
        02-architecture-overview.mdx
        03-key-concepts.mdx
      /comprehension
        questions.json  # pre-defined check questions
    /02-core-services
      ...
  /prompts
    system-tutor.md    # base AI tutor personality/instructions
    per-module/        # module-specific teaching context
  /knowledge-base
    /repo-analysis
      structure.md
      components.md
      code-samples.md
    /aws-docs
      bedrock-agents.md
      iam-permissions.md
      pricing.md
```

### Module Structure

| # | Module | Topics |
|---|--------|--------|
| 1 | Introduction | What is AgentCore, why it exists, high-level architecture |
| 2 | Core Services | Each service deep-dive (what, why, how) |
| 3 | Agent Patterns | Design patterns, tools/functions, memory management |
| 4 | Hands-On Build | Step-by-step simple agent walkthrough |
| 5 | Security & IAM | Permissions, data privacy, best practices |
| 6 | Operations | Cost optimization, monitoring, error handling |
| 7 | Advanced Topics | Multi-agent orchestration, evaluation, scaling |
| 8 | Deployment | Production deployment, testing strategies |

---

## 5. AI Tutor System

### Context Assembly Flow

```
┌─────────────────────────────────────────────────────────┐
│                   User in Lesson 2.3                     │
└─────────────────────┬───────────────────────────────────┘
                      │ User question
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Context Assembly (API Route)                │
│  1. System prompt (tutor personality + methodology)      │
│  2. Module context (from /knowledge-base/module-02)      │
│  3. Lesson content (current MDX + learning goals)        │
│  4. User state (topics covered, identified gaps)         │
│  5. User question                                        │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Amazon Bedrock (Claude)                  │
│  - Answers grounded in provided context                  │
│  - Follows teaching methodology                          │
│  - Generates follow-up comprehension questions           │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Response + State Update                     │
│  - Stream response to user                               │
│  - Update LearningState (topics explained, gaps)         │
└─────────────────────────────────────────────────────────┘
```

### Knowledge Base Strategy

- **Initial:** Content embedded in prompts per module (simple, no extra infrastructure)
- **Future:** Can add RAG with vector search if needed for complex Q&A
- Knowledge base created by analyzing the GitHub repo + AWS docs

---

## 6. Page Structure

### Routes

```
/                       # Landing page
/auth/signin            # OAuth selection
/auth/callback          # OAuth callback

/dashboard              # User's home - progress overview
/curriculum             # Full curriculum view

/learn/[moduleId]                  # Module overview
/learn/[moduleId]/[lessonId]       # Lesson + AI tutor

/settings               # User preferences
```

### Lesson Page Layout

```
┌────────────────────────────────────────────────────────┐
│  Header: Module 2 > Lesson 3: Tool Selection           │
├────────────────────┬───────────────────────────────────┤
│                    │                                   │
│   Lesson Content   │         AI Tutor Chat             │
│   (MDX rendered)   │                                   │
│                    │   ┌─────────────────────────────┐ │
│   - Concepts       │   │ AI: Let me explain how...   │ │
│   - Code examples  │   │                             │ │
│   - Diagrams       │   │ You: What about edge cases? │ │
│                    │   │                             │ │
│                    │   │ AI: Great question! When... │ │
│                    │   └─────────────────────────────┘ │
│                    │   ┌─────────────────────────────┐ │
│                    │   │ Type your question...    >  │ │
│                    │   └─────────────────────────────┘ │
├────────────────────┴───────────────────────────────────┤
│  Progress: ████████░░ 80%    [← Previous] [Next →]     │
└────────────────────────────────────────────────────────┘
```

---

## 7. Features - v1 Scope

### Included

| Feature | Description |
|---------|-------------|
| OAuth Authentication | GitHub + Google sign-in via Cognito |
| Landing Page | Clear value prop, course overview, sign-in CTA |
| Dashboard | Progress summary, continue where you left off |
| Curriculum View | All 8 modules, completion status, estimated time |
| Module Pages | Learning objectives, lesson list, prerequisites |
| Lesson Pages | MDX content + AI tutor side-by-side |
| AI Tutor | Bedrock Claude, context-aware, streaming responses |
| Comprehension Checks | Pre-defined + AI-generated questions per lesson |
| Progress Tracking | Per-lesson completion, stored in DynamoDB |
| Learning State | Topics covered, knowledge gaps, bookmarks, notes |
| Knowledge Base | Analyzed repo content + AWS docs for AI grounding |
| Responsive Design | Desktop-optimized, tablet/mobile readable |

### Explicitly NOT in v1

- Community features (forums, comments)
- Interactive code execution
- Certificates/badges
- Multiple courses (just AgentCore)
- Admin panel for content editing
- Full conversation history storage

---

## 8. Implementation Phases

### Phase 1: Foundation
- Initialize Next.js project
- Set up AWS Amplify
- Configure Cognito (GitHub + Google OAuth)
- Set up DynamoDB tables
- Basic project structure + styling setup

### Phase 2: Content & Knowledge Base
- Analyze GitHub repo (amazon-bedrock-agentcore-samples)
- Create knowledge base markdown files
- Build curriculum MDX structure (8 modules)
- Write system prompts for AI tutor
- Create comprehension check questions

### Phase 3: Core Features
- Landing page
- Authentication flow
- Dashboard
- Curriculum view
- Module overview pages
- Lesson pages (MDX rendering)

### Phase 4: AI Tutor Integration
- Bedrock Claude integration
- Context assembly system
- Streaming responses
- Comprehension check flow
- Learning state management

### Phase 5: Polish & Deploy
- Progress tracking UI
- Bookmarks & notes
- Responsive design refinement
- Error handling & loading states
- Production deployment on Amplify
- Testing & bug fixes

---

## 9. Source Material

- **Primary:** https://github.com/awslabs/amazon-bedrock-agentcore-samples
- **Supporting:** AWS Bedrock documentation, IAM best practices

---

*Document generated through collaborative brainstorming session.*
