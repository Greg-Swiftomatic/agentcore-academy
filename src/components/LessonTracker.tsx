"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { updateCurrentLesson, completeModule, getModuleProgress } from "@/lib/progress";
import curriculumData from "@/content/modules/curriculum.json";

interface LessonTrackerProps {
  moduleId: string;
  lessonId: string;
}

/**
 * Invisible component that tracks lesson progress when mounted
 */
export function LessonTracker({ moduleId, lessonId }: LessonTrackerProps) {
  const { user, isLoading } = useAuth();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent duplicate tracking for the same lesson
    const trackingKey = `${moduleId}:${lessonId}`;
    if (trackedRef.current === trackingKey) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!user?.id) {
      console.log("[LessonTracker] No user logged in, skipping tracking");
      return;
    }

    console.log("[LessonTracker] Tracking lesson:", { moduleId, lessonId, userId: user.id });
    trackedRef.current = trackingKey;

    async function trackLesson() {
      try {
        // Update current lesson
        await updateCurrentLesson(user!.id, moduleId, lessonId);
        
        // Check if this is the last lesson in the module
        const currModule = curriculumData.modules.find((m) => m.id === moduleId);
        if (currModule) {
          const lessonIndex = currModule.lessons.findIndex((l) => l.id === lessonId);
          const isLastLesson = lessonIndex === currModule.lessons.length - 1;
          
          if (isLastLesson) {
            console.log("[LessonTracker] Last lesson reached, checking if should complete module");
            const progress = await getModuleProgress(user!.id, moduleId);
            
            // Only mark complete if not already completed
            if (progress && progress.status !== "COMPLETED") {
              console.log("[LessonTracker] Marking module as completed");
              await completeModule(user!.id, moduleId);
            }
          }
        }
        
        console.log("[LessonTracker] Tracking complete");
      } catch (err) {
        console.error("[LessonTracker] Failed to track lesson progress:", err);
      }
    }

    trackLesson();
  }, [user?.id, moduleId, lessonId, isLoading]);

  // This component doesn't render anything
  return null;
}
