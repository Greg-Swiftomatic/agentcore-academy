# AgentCore Academy - Project Progress

## Current Status: 500 Error Fixed - Pending Deployment

**Last Updated:** January 1, 2026

---

## Latest Session Summary

### Problem
The AI tutor API (`/api/tutor`) returns 500 error in production on AWS Amplify.

### Root Cause
The `knowledge-base.ts` file used `fs.readFile()` to load markdown content at runtime. In Next.js standalone mode on Amplify serverless, the `outputFileTracingIncludes` config wasn't working reliably.

### Solution Applied (January 1, 2026)

**Embedded knowledge base at build time using webpack `asset/source`:**

1. **Updated `next.config.mjs`** - Added webpack config to import .md files as raw text:
   ```javascript
   webpack: (config) => {
     config.module.rules.push({
       test: /\.md$/,
       type: 'asset/source',
     });
     return config;
   },
   ```

2. **Rewrote `src/lib/knowledge-base.ts`** - Changed from `fs.readFile()` to static imports:
   - All 17 markdown files are now imported at build time
   - Content is bundled directly into the serverless function
   - No filesystem access required at runtime

3. **Added TypeScript declaration** - `src/types/markdown.d.ts` for .md module types

### Previous Fixes (December 31, 2025)

1. **Added `output: 'standalone'`** to `next.config.mjs` (commit `7a97a25`)
   - Fixed initial 404 error - route is now being reached

2. **Added `outputFileTracingIncludes`** to `next.config.mjs` (commit `0d6706c`)
   - This didn't reliably work for serverless

3. **Added detailed logging** to both files for debugging

---

## Next Steps (Priority Order)

### 1. Push and Deploy
- Commit and push the new changes
- Wait for Amplify to deploy

### 2. Verify Environment Variable
Check AWS Amplify Console → Hosting → Environment variables:
- Ensure `OPENROUTER_API_KEY` is set with valid OpenRouter API key

### 3. Test After Deployment
- Go to live site and test AI tutor in a lesson
- Verify 500 error is resolved

### 4. Minor Issues to Address
- Add `favicon.ico` (404 in browser)
- Investigate RSC 404 for `/learn/01-introduction?_rsc=...` (may be expected behavior)

---

## Architecture Overview

```
User → Amplify CloudFront → Next.js Standalone
                              ↓
                         /api/tutor (POST)
                              ↓
                    loadLessonKnowledge()
                              ↓
                    fs.readFile (markdown)
                              ↓
                    streamTutorResponse()
                              ↓
                    OpenRouter API (GLM-4)
                              ↓
                    SSE stream back to client
```

---

## Key URLs

- **Live Site:** https://main.d137jxngnvzxkf.amplifyapp.com/
- **GitHub Repo:** https://github.com/Greg-Swiftomatic/agentcore-academy
- **Amplify Console:** AWS Console → Amplify → agentcore-academy

---

## Tech Stack Quick Reference

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Hosting | AWS Amplify Gen 2 |
| AI Model | GLM-4 via OpenRouter (`z-ai/glm-4.7`) |
| Auth | Cognito (Google OAuth) |
| Database | DynamoDB |
| Styling | Tailwind CSS |

---

## Files Modified This Session

### January 1, 2026
1. `next.config.mjs` - Added webpack config for .md imports
2. `src/lib/knowledge-base.ts` - Rewrote to use static imports (build-time bundling)
3. `src/types/markdown.d.ts` - Added TypeScript declarations for .md files

### December 31, 2025
1. `next.config.mjs` - Added standalone output + file tracing
2. `src/app/api/tutor/route.ts` - Added debug logging
3. `src/lib/knowledge-base.ts` - Added debug logging

---

## Quick Start Commands

```bash
# Local development (2 terminals)
npx ampx sandbox          # Terminal 1: Backend
npm run dev               # Terminal 2: Frontend

# Check deployment status
git log --oneline -5      # Recent commits

# Test API locally
curl -X POST http://localhost:3000/api/tutor \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"moduleId":"01-introduction","lessonId":"01-what-is-agentcore"}'
```
