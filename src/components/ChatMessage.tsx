"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isAssistant ? "bg-accent/20" : "bg-bg-tertiary"
        }`}
      >
        {isAssistant ? (
          <svg
            className="w-5 h-5 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] ${
          isAssistant ? "" : "flex justify-end"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-3 ${
            isAssistant
              ? "bg-bg-tertiary/50 border border-border-subtle"
              : "bg-accent/20 border border-accent/30"
          }`}
        >
          <div
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              isAssistant ? "text-text-primary" : "text-text-primary"
            }`}
          >
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse" />
            )}
          </div>
        </div>
        <p className="text-xs text-text-muted mt-1 px-1">
          {isAssistant ? "AI Tutor" : "You"}
        </p>
      </div>
    </div>
  );
}
