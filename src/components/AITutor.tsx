"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { APIKeyModal } from "./APIKeyModal";
import { useAPIKey } from "@/hooks/useAPIKey";
import { streamTutorResponseClient, TutorContext } from "@/lib/openrouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AITutorProps {
  moduleId: string;
  lessonId: string;
  moduleContext: string;
  lessonContent: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

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
- Use code blocks with proper syntax highlighting
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

2. **Admit uncertainty** - If you're not sure about something, say so.

3. **Depth over speed** - The student wants to understand deeply. Take time to explain properly.

4. **No assumptions** - Don't assume the student knows something unless it's been covered.

5. **Practical focus** - Always connect concepts to building real agents.
`;

export function AITutor({
  moduleId,
  lessonId,
  moduleContext,
  lessonContent,
  isCollapsed = false,
  onToggleCollapse,
}: AITutorProps) {
  const { apiKey, setApiKey, hasApiKey, isLoading: isKeyLoading } = useAPIKey();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome! I'm your AI tutor for this lesson.

I can help you:
- **Understand concepts** - Ask me to explain anything
- **Test your knowledge** - Request a quiz on the material
- **Review your work** - Share code or exercise submissions for feedback
- **Connect to your capstone** - Ask how this applies to your project

What would you like to explore?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const tutorContext: TutorContext = {
        systemPrompt: BASE_SYSTEM_PROMPT,
        moduleContext: moduleContext,
        lessonContent: lessonContent,
        userState: {
          topicsExplained: [],
          identifiedGaps: [],
        },
      };

      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      let fullContent = "";

      for await (const chunk of streamTutorResponseClient(allMessages, tutorContext, apiKey)) {
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: fullContent,
        },
      ]);
      setStreamingContent("");
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("401") || errorMessage.includes("invalid")) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Your API key appears to be invalid. Please check your key in the settings.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "I apologize, but I encountered an error. Please try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    "Quiz me on this lesson",
    "Explain the key concept",
    "How does this apply to my capstone?",
    "Review my code",
  ];

  const advancedActions = [
    { label: "Challenge me", prompt: "Give me a challenging question about this material to test my understanding." },
    { label: "Review my exercise", prompt: "I'd like you to review my exercise submission. Here's what I completed:" },
    { label: "Debug help", prompt: "I'm stuck on something. Can you help me debug this issue?" },
  ];

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-bp-primary border border-r-0 border-border hover:border-cyan transition-colors group"
        title="Open AI Tutor"
      >
        <div className="px-2 py-4 flex flex-col items-center gap-2">
          <div className="w-8 h-8 border border-cyan flex items-center justify-center relative">
            <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {hasApiKey && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-success" />
            )}
          </div>
          <span className="text-[10px] text-cyan uppercase tracking-wider font-bold [writing-mode:vertical-lr] rotate-180">
            AI Tutor
          </span>
          <svg className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-bp-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-cyan flex items-center justify-center relative">
              <svg className="w-4 h-4 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {hasApiKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-success" />
              )}
            </div>
            <div>
              <span className="font-body text-sm font-bold text-text-primary">
                AI Tutor
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                {hasApiKey ? (
                  <span className="text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Ready
                  </span>
                ) : (
                  <span className="text-warning">No API Key</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="w-7 h-7 border border-border-subtle hover:border-cyan flex items-center justify-center transition-colors group"
              title="API Key Settings"
            >
              <svg className="w-3.5 h-3.5 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-7 h-7 border border-border-subtle hover:border-cyan flex items-center justify-center transition-colors group"
                title="Collapse Tutor"
              >
                <svg className="w-3.5 h-3.5 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {!hasApiKey && !isKeyLoading ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 border border-dashed border-warning mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-display text-lg text-text-primary mb-2">
              API Key Required
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Add your OpenRouter API key to unlock the AI tutor. Your key stays in your browser.
            </p>
            <button
              onClick={() => setShowKeyModal(true)}
              className="btn btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Add API Key
            </button>
            <p className="text-xs text-text-muted mt-4">
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan hover:underline"
              >
                Get a key from OpenRouter
              </a>
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {streamingContent && (
              <ChatMessage
                role="assistant"
                content={streamingContent}
                isStreaming={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="flex-shrink-0 px-4 pb-3 space-y-3">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Quick Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs px-3 py-1.5 border border-dashed border-border-dashed text-text-secondary hover:border-cyan hover:text-cyan transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Advanced
                </p>
                <div className="flex flex-wrap gap-2">
                  {advancedActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setInput(action.prompt)}
                      className="text-xs px-3 py-1.5 border border-cyan/50 text-cyan/80 hover:border-cyan hover:text-cyan transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex-shrink-0 p-4 border-t border-border bg-bp-secondary/30">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about the lesson..."
                  className="w-full px-4 py-3 bg-bp-deep border border-border-subtle text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-cyan transition-colors font-body"
                  rows={1}
                  disabled={isLoading || !hasApiKey}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !hasApiKey}
                className="w-12 h-12 border-2 border-cyan flex items-center justify-center text-cyan hover:bg-cyan hover:text-bp-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cyan"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
            <p className="text-[10px] text-text-muted mt-2 text-center uppercase tracking-wider">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}

      <APIKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={setApiKey}
        currentKey={apiKey}
      />
    </div>
  );
}
