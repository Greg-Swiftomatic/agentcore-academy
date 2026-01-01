"use client";

import { useState, useEffect } from "react";
import { AITutor } from "./AITutor";

interface CollapsibleTutorProps {
  moduleId: string;
  lessonId: string;
  moduleContext: string;
  lessonContent: string;
}

const COLLAPSE_STORAGE_KEY = "agentcore-academy-tutor-collapsed";

export function CollapsibleTutor({
  moduleId,
  lessonId,
  moduleContext,
  lessonContent,
}: CollapsibleTutorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored === "true") {
        setIsCollapsed(true);
      }
    } catch {
    }
    setIsHydrated(true);
  }, []);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(newState));
    } catch {
    }
  };

  if (!isHydrated) {
    return (
      <div className="w-[450px] flex-shrink-0 bg-bp-deep border-l border-border">
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <AITutor
        moduleId={moduleId}
        lessonId={lessonId}
        moduleContext={moduleContext}
        lessonContent={lessonContent}
        isCollapsed={true}
        onToggleCollapse={handleToggle}
      />
    );
  }

  return (
    <div className="w-[450px] flex-shrink-0 bg-bp-deep border-l border-border">
      <AITutor
        moduleId={moduleId}
        lessonId={lessonId}
        moduleContext={moduleContext}
        lessonContent={lessonContent}
        isCollapsed={false}
        onToggleCollapse={handleToggle}
      />
    </div>
  );
}
