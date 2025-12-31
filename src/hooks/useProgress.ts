"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  getUserProgress,
  getModuleProgress,
  startModule,
  updateCurrentLesson,
  completeModule,
  toggleBookmark,
  type ModuleProgress,
} from "@/lib/progress";
import curriculumData from "@/content/modules/curriculum.json";

export interface UseProgressReturn {
  // Data
  progress: Record<string, ModuleProgress>;
  isLoading: boolean;
  
  // Computed
  completedModules: number;
  totalModules: number;
  overallProgress: number;
  currentModule: {
    id: string;
    title: string;
    currentLessonId: string;
    progress: number;
  } | null;
  
  // Actions
  refreshProgress: () => Promise<void>;
  startModuleProgress: (moduleId: string, firstLessonId: string) => Promise<void>;
  updateLesson: (moduleId: string, lessonId: string) => Promise<void>;
  markModuleComplete: (moduleId: string) => Promise<void>;
  toggleLessonBookmark: (moduleId: string, lessonId: string) => Promise<void>;
  isLessonBookmarked: (moduleId: string, lessonId: string) => boolean;
  getModuleStatus: (moduleId: string) => "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  getModuleProgressPercent: (moduleId: string) => number;
}

export function useProgress(): UseProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userProgress = await getUserProgress(user.id);
      const progressMap: Record<string, ModuleProgress> = {};
      
      for (const p of userProgress) {
        progressMap[p.moduleId] = p;
      }
      
      console.log("[useProgress] Loaded progress:", progressMap);
      setProgress(progressMap);
    } catch (error) {
      console.error("[useProgress] Error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const startModuleProgress = useCallback(
    async (moduleId: string, firstLessonId: string) => {
      if (!user?.id) return;
      
      const result = await startModule(user.id, moduleId, firstLessonId);
      if (result) {
        setProgress((prev) => ({
          ...prev,
          [moduleId]: result,
        }));
      }
    },
    [user?.id]
  );

  const updateLesson = useCallback(
    async (moduleId: string, lessonId: string) => {
      if (!user?.id) return;
      
      await updateCurrentLesson(user.id, moduleId, lessonId);
      
      // Check if this is the last lesson - if so, mark module complete
      const currModule = curriculumData.modules.find((m) => m.id === moduleId);
      if (currModule) {
        const lessonIndex = currModule.lessons.findIndex((l) => l.id === lessonId);
        const isLastLesson = lessonIndex === currModule.lessons.length - 1;
        
        if (isLastLesson) {
          console.log("[useProgress] Last lesson reached, marking module complete");
          await completeModule(user.id, moduleId);
        }
      }
      
      await refreshProgress();
    },
    [user?.id, refreshProgress]
  );

  const markModuleComplete = useCallback(
    async (moduleId: string) => {
      if (!user?.id) return;
      
      await completeModule(user.id, moduleId);
      await refreshProgress();
    },
    [user?.id, refreshProgress]
  );

  const toggleLessonBookmark = useCallback(
    async (moduleId: string, lessonId: string) => {
      if (!user?.id) return;
      
      await toggleBookmark(user.id, moduleId, lessonId);
      await refreshProgress();
    },
    [user?.id, refreshProgress]
  );

  const isLessonBookmarked = useCallback(
    (moduleId: string, lessonId: string): boolean => {
      const moduleProgress = progress[moduleId];
      return moduleProgress?.bookmarks?.includes(lessonId) || false;
    },
    [progress]
  );

  const getModuleStatus = useCallback(
    (moduleId: string): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" => {
      return progress[moduleId]?.status || "NOT_STARTED";
    },
    [progress]
  );

  const getModuleProgressPercent = useCallback(
    (moduleId: string): number => {
      const moduleProgress = progress[moduleId];
      if (!moduleProgress) return 0;
      if (moduleProgress.status === "COMPLETED") return 100;
      if (moduleProgress.status === "NOT_STARTED") return 0;

      // Calculate based on current lesson position
      // Progress = (current lesson index + 1) / total lessons
      // Being ON lesson 1 means you've started it, so count it
      const currModule = curriculumData.modules.find((m) => m.id === moduleId);
      if (!currModule || !moduleProgress.currentLessonId) return 0;

      const currentLessonIndex = currModule.lessons.findIndex(
        (l) => l.id === moduleProgress.currentLessonId
      );
      
      if (currentLessonIndex === -1) return 0;
      
      // Progress: being on lesson 1 of 3 = 33%, lesson 2 of 3 = 66%, etc.
      // We add 1 because viewing a lesson counts as progress toward completing it
      return Math.round(((currentLessonIndex + 1) / currModule.lessons.length) * 100);
    },
    [progress]
  );

  // Computed values
  const completedModules = Object.values(progress).filter(
    (p) => p.status === "COMPLETED"
  ).length;

  const totalModules = curriculumData.modules.length;

  // Overall progress = average of all module progress percentages
  const overallProgress = Math.round(
    curriculumData.modules.reduce((sum, module) => {
      return sum + getModuleProgressPercent(module.id);
    }, 0) / totalModules
  );

  // Find current module (first in-progress module)
  const currentModuleProgress = Object.values(progress).find(
    (p) => p.status === "IN_PROGRESS"
  );
  
  const currentModule = currentModuleProgress
    ? {
        id: currentModuleProgress.moduleId,
        title:
          curriculumData.modules.find(
            (m) => m.id === currentModuleProgress.moduleId
          )?.title || "",
        currentLessonId: currentModuleProgress.currentLessonId || "",
        progress: getModuleProgressPercent(currentModuleProgress.moduleId),
      }
    : null;

  return {
    progress,
    isLoading,
    completedModules,
    totalModules,
    overallProgress,
    currentModule,
    refreshProgress,
    startModuleProgress,
    updateLesson,
    markModuleComplete,
    toggleLessonBookmark,
    isLessonBookmarked,
    getModuleStatus,
    getModuleProgressPercent,
  };
}
