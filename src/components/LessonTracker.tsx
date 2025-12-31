"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { updateCurrentLesson } from "@/lib/progress";

interface LessonTrackerProps {
  moduleId: string;
  lessonId: string;
}

/**
 * Invisible component that tracks lesson progress when mounted
 */
export function LessonTracker({ moduleId, lessonId }: LessonTrackerProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      // Track that the user is viewing this lesson
      updateCurrentLesson(user.id, moduleId, lessonId).catch((err) => {
        console.error("Failed to track lesson progress:", err);
      });
    }
  }, [user?.id, moduleId, lessonId]);

  // This component doesn't render anything
  return null;
}
