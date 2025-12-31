import { NextRequest } from "next/server";
import { streamTutorResponse, TutorMessage, TutorContext } from "@/lib/bedrock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TutorRequest {
  messages: TutorMessage[];
  moduleId: string;
  lessonId: string;
  context: {
    moduleContext: string;
    lessonContent: string;
    userState: {
      topicsExplained: string[];
      identifiedGaps: string[];
    };
  };
}

// Base system prompt for the AI tutor
const BASE_SYSTEM_PROMPT = `You are an expert tutor teaching Amazon Bedrock AgentCore. Your role is to help developers deeply understand this technology through clear, patient instruction.

## Teaching Methodology

1. **One concept at a time** - Present information in digestible chunks, building complexity gradually
2. **Check understanding** - After explaining a concept, ask 1-2 questions to verify comprehension
3. **Adapt to the learner** - If they seem confused, offer alternative explanations or analogies
4. **Be practical** - Include real-world examples and code snippets where helpful
5. **Encourage questions** - Invite the student to ask clarifying questions at any time

## Formatting Guidelines

- Use **bold** for key terms when first introduced
- Use code blocks with proper syntax highlighting for all code
- Use ASCII diagrams when explaining architecture or data flow
- Keep responses focused - aim for depth over breadth
- If showing code, explain what each significant section does

## Important Rules

- Only use information provided in the module context - do not make up features or capabilities
- If you're not sure about something, say so rather than guessing
- Remember: the student wants to understand deeply, not just get a quick answer
`;

export async function POST(request: NextRequest) {
  try {
    const body: TutorRequest = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tutorContext: TutorContext = {
      systemPrompt: BASE_SYSTEM_PROMPT,
      moduleContext: context.moduleContext || "",
      lessonContent: context.lessonContent || "",
      userState: context.userState || { topicsExplained: [], identifiedGaps: [] },
    };

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamTutorResponse(messages, tutorContext)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
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
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
