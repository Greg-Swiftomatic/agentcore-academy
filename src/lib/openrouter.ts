/**
 * OpenRouter API client for AI tutor
 * Using GLM-4 model for powerful, cost-effective responses
 */

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// GLM-4 model on OpenRouter - powerful and cost-effective
const MODEL_ID = "z-ai/glm-4.7";

export interface TutorMessage {
  role: "user" | "assistant" | "system";
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
 * Invoke GLM-4 via OpenRouter with streaming response
 */
export async function* streamTutorResponse(
  messages: TutorMessage[],
  context: TutorContext
): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const systemPrompt = buildSystemPrompt(context);

  const payload = {
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
    max_tokens: 4096,
    stream: true,
    temperature: 0.7,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://agentcore.academy",
      "X-Title": "AgentCore Academy",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter API error:", response.status, errorText);
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No response body from OpenRouter");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Process complete lines
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed === "data: [DONE]") continue;
      
      if (trimmed.startsWith("data: ")) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // Skip malformed JSON
          console.warn("Failed to parse SSE chunk:", trimmed);
        }
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim() && buffer.trim().startsWith("data: ")) {
    try {
      const data = JSON.parse(buffer.trim().slice(6));
      const content = data.choices?.[0]?.delta?.content;
      if (content) {
        yield content;
      }
    } catch (e) {
      // Skip
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
