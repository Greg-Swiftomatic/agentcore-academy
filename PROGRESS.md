# AgentCore Academy - Project Progress

## Current Status: BYOK + Collapsible Tutor Deployed

**Last Updated:** January 1, 2026

---

## Latest Session (January 1, 2026)

### Features Implemented

#### 1. BYOK (Bring Your Own Key) for AI Tutor
- Users provide their own OpenRouter API key
- Key stored in localStorage (never sent to server)
- Direct client-to-OpenRouter streaming
- Locked state UI when no key configured
- Settings modal for key management

#### 2. Collapsible AI Tutor
- Collapse button in tutor header
- Minimal vertical tab when collapsed
- State persisted to localStorage
- Click to expand

#### 3. Module 09: Capstone Project (5 lessons)
- 01: Choose Your Project (4 project types)
- 02: Architecture Design
- 03: Implementation
- 04: Testing and Iteration
- 05: Deploy and Celebrate

#### 4. Per-Module Exercises (7 total)
- Module 01: Agent Idea Canvas
- Module 02: Service Map
- Module 03: Tool Spec Sheet
- Module 05: IAM Policy Draft
- Module 06: Monitoring Dashboard
- Module 07: Multi-Agent Design
- Module 08: Pre-Launch Checklist

#### 5. Enhanced AI Tutor Prompts
- Active coaching mode
- Code review with severity levels
- Exercise feedback against success criteria
- Mid-lesson knowledge checks

### Files Created
```
src/hooks/useAPIKey.ts
src/components/APIKeyModal.tsx
src/components/CollapsibleTutor.tsx
src/components/Exercise.tsx
src/lib/exercises.ts
src/app/learn/[moduleId]/exercise/page.tsx
src/content/lessons/09-capstone/*.json (5 files)
src/content/checks/09-capstone.json
src/content/exercises/**/*.json (7 files)
```

### Files Modified
```
src/components/AITutor.tsx - BYOK + collapse
src/lib/openrouter.ts - Client-side streaming
src/app/learn/[moduleId]/[lessonId]/page.tsx - CollapsibleTutor
src/app/page.tsx - Updated stats, Module 09
src/content/modules/curriculum.json - Module 09
src/content/prompts/system-tutor.md - Active mode
```

### Commits
- `226e4d5` - Add BYOK support and collapsible AI tutor
- `519596f` - Add capstone project, per-module exercises, and active AI tutor

---

## Previous Sessions

### December 31, 2025 - January 1, 2026: 500 Error Fix

**Problem:** AI tutor API returning 500 in production

**Solution:** Embedded knowledge base at build time using webpack `asset/source` instead of runtime `fs.readFile()`

---

## Architecture Overview

```
User Browser
    │
    ├─► Lessons/Exercises (SSR via Amplify)
    │
    └─► AI Tutor (BYOK)
            │
            └─► OpenRouter API (GLM-4)
                    │
                    └─► Streaming response back to browser
```

---

## Key URLs

- **Live Site:** https://main.d137jxngnvzxkf.amplifyapp.com/
- **GitHub Repo:** https://github.com/Greg-Swiftomatic/agentcore-academy
- **OpenRouter:** https://openrouter.ai/keys (get API key)

---

## Stats

| Metric | Count |
|--------|-------|
| Modules | 9 |
| Lessons | 30+ |
| Exercises | 7 |
| Comprehension Checks | 9 |

---

## Quick Commands

```bash
# Local development
npx ampx sandbox    # Terminal 1
npm run dev         # Terminal 2

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```
