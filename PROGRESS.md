# AgentCore Academy - Project Progress

## Current Status: Debugging 500 Error on AI Tutor API

**Last Updated:** December 31, 2025

---

## Latest Session Summary

### Problem
The AI tutor API (`/api/tutor`) returns 500 error in production on AWS Amplify.

### Root Cause (Suspected)
The `knowledge-base.ts` file uses `fs.readFile()` to load markdown content at runtime. In Next.js standalone mode on Amplify serverless, these files weren't being bundled with the API route.

### Fixes Applied

1. **Added `output: 'standalone'`** to `next.config.mjs` (commit `7a97a25`)
   - Fixed initial 404 error - route is now being reached

2. **Added `outputFileTracingIncludes`** to `next.config.mjs` (commit `0d6706c`)
   ```javascript
   outputFileTracingIncludes: {
     '/api/tutor': ['./src/content/**/*'],
   },
   ```
   - This should include the knowledge-base markdown files in the serverless bundle

3. **Added detailed logging** to both files for debugging:
   - `src/app/api/tutor/route.ts` - logs API key presence, request details
   - `src/lib/knowledge-base.ts` - logs file paths, CWD, loading attempts

### Commits Made This Session
```
0d6706c Include content files in standalone build for serverless API routes
56ee180 Add detailed logging to knowledge-base for debugging serverless file access
64ce964 Add detailed error logging to tutor API for debugging 500 error
7a97a25 Enable standalone output for Amplify SSR support
```

---

## Next Steps (Priority Order)

### 1. Verify Environment Variable
Check AWS Amplify Console → Hosting → Environment variables:
- Ensure `OPENROUTER_API_KEY` is set with valid OpenRouter API key

### 2. Test After Deployment
- Wait for Amplify to finish deploying commit `0d6706c`
- Go to live site and test AI tutor in a lesson
- Check if 500 error is resolved

### 3. If Still Failing - Check Logs
Go to Amplify Console → Hosting → Logs (or CloudWatch):
- Look for `[Tutor API]` log entries
- Look for `[KnowledgeBase]` log entries
- Check if API key is present (`true` or `false`)
- Check what path it's trying to load files from

### 4. Potential Further Fixes
If file loading still fails in serverless:
- **Option A:** Pre-bundle knowledge base content at build time using `import`
- **Option B:** Move knowledge base to S3 and fetch at runtime
- **Option C:** Embed knowledge base directly in the lesson JSON files

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
