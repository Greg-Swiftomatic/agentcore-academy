import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Initialize client - credentials come from environment or IAM role
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Claude model ID on Bedrock
const MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorContext {
  systemPrompt: string;
  moduleContext: string;
  lessonContent: string;
  userState: {
    topicsExplained: string[];
    identifiedGaps: string[];
  };
}

/**
 * Build the full system prompt with context for the AI tutor
 */
function buildSystemPrompt(context: TutorContext): string {
  return `${context.systemPrompt}

## Current Module Context
${context.moduleContext}

## Current Lesson Content
${context.lessonContent}

## Student's Learning State
- Topics already explained: ${context.userState.topicsExplained.join(", ") || "None yet"}
- Identified knowledge gaps: ${context.userState.identifiedGaps.join(", ") || "None identified"}

Remember: 
- Build on what the student already knows
- Address any identified knowledge gaps when relevant
- Check understanding before moving to new concepts
`;
}

/**
 * Invoke Claude via Bedrock with streaming response
 */
export async function* streamTutorResponse(
  messages: TutorMessage[],
  context: TutorContext
): AsyncGenerator<string> {
  const systemPrompt = buildSystemPrompt(context);

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: MODEL_ID,
    body: JSON.stringify(payload),
    contentType: "application/json",
  });

  const response = await bedrockClient.send(command);

  if (!response.body) {
    throw new Error("No response body from Bedrock");
  }

  for await (const event of response.body) {
    if (event.chunk?.bytes) {
      const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        yield chunk.delta.text;
      }
    }
  }
}

/**
 * Non-streaming version for simple responses
 */
export async function getTutorResponse(
  messages: TutorMessage[],
  context: TutorContext
): Promise<string> {
  let fullResponse = "";
  for await (const chunk of streamTutorResponse(messages, context)) {
    fullResponse += chunk;
  }
  return fullResponse;
}
