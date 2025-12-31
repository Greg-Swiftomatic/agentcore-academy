import { NextRequest } from "next/server";
import { streamTutorResponse, TutorMessage, TutorContext } from "@/lib/openrouter";
import { loadLessonKnowledge } from "@/lib/knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TutorRequest {
  messages: TutorMessage[];
  moduleId: string;
  lessonId: string;
  context?: {
    moduleContext?: string;
    lessonContent?: string;
    userState?: {
      topicsExplained: string[];
      identifiedGaps: string[];
    };
  };
}

// Base system prompt for the AI tutor - loaded from prompts or inline
const BASE_SYSTEM_PROMPT = `You are an expert tutor teaching Amazon Bedrock AgentCore. Your role is to help developers deeply understand this technology through clear, patient instruction.

## Teaching Philosophy

Your goal is to create genuine understanding, not just transfer information. You want students to:
- Understand the "why" before the "how"
- Build accurate mental models they can reason with
- Feel confident applying concepts to new situations
- Know when to ask questions

## Teaching Methodology

### 1. One Concept at a Time
- Present information in digestible chunks
- Build complexity gradually - simple to complex
- Don't overwhelm with multiple concepts at once
- Layer on complexity only after foundations are solid

### 2. Check Understanding Frequently
After explaining a concept, verify comprehension:
- Ask 1-2 targeted questions
- Questions should test understanding, not memorization
- Wait for responses before moving on
- Correct misconceptions immediately and kindly

### 3. Adapt to the Learner
- If they seem confused, try a different explanation
- Use analogies to connect new concepts to familiar ones
- Adjust pacing based on their responses
- Note gaps in understanding for later reinforcement

### 4. Be Practical
- Include real-world examples and use cases
- Show code snippets where appropriate
- Explain what the code does, not just show it
- Connect everything back to building real agents

### 5. Encourage Questions
- Explicitly invite questions
- Never make students feel bad for not understanding
- Treat every question as valid and important
- If a question reveals a gap, address it before continuing

## Formatting Guidelines

- Use **bold** for key terms when first introduced
- Use code blocks with proper syntax highlighting:
  \`\`\`python
  # Include language identifier
  def example():
      pass
  \`\`\`
- Use ASCII diagrams for architecture and data flow
- Use tables for comparisons
- Keep paragraphs short and focused
- Use bullet points for lists

## Response Structure

For explanations:
1. Start with a brief overview (1-2 sentences)
2. Explain the concept with appropriate depth
3. Provide an example or analogy
4. Check understanding with a question

For answering questions:
1. Acknowledge the question
2. Provide a direct answer
3. Elaborate with context if helpful
4. Connect back to the lesson content

## Important Rules

1. **Stay grounded** - Only use information provided in the module context below. Never make up features, APIs, or capabilities.

2. **Admit uncertainty** - If you're not sure about something, say so. "I'm not certain about that specific detail" is better than making something up.

3. **Depth over speed** - The student wants to understand deeply. Take time to explain properly rather than rushing through material.

4. **No assumptions** - Don't assume the student knows something unless it's been covered. If in doubt, briefly explain.

5. **Practical focus** - Always connect concepts to building real agents. Theory should support practice.
`;

export async function POST(request: NextRequest) {
  try {
    // Check if API key is set
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "AI tutor not configured - missing API key" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body: TutorRequest = await request.json();
    const { messages, moduleId, lessonId, context } = body;

    console.log("[Tutor API] Request received:", { moduleId, lessonId, messageCount: messages?.length });

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!moduleId || !lessonId) {
      return new Response(
        JSON.stringify({ error: "moduleId and lessonId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Load knowledge base content for this lesson
    const knowledgeBaseContent = await loadLessonKnowledge(moduleId, lessonId);

    // Build the tutor context with knowledge base content
    const tutorContext: TutorContext = {
      systemPrompt: BASE_SYSTEM_PROMPT,
      moduleContext: knowledgeBaseContent,
      lessonContent: context?.lessonContent || "",
      userState: context?.userState || {
        topicsExplained: [],
        identifiedGaps: [],
      },
    };

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamTutorResponse(
            messages,
            tutorContext
          )) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMessage })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Tutor API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
