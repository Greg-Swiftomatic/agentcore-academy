"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

// Generate typed client
const client = generateClient<Schema>();

export type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface ModuleProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: ModuleStatus;
  startedAt?: string;
  completedAt?: string;
  currentLessonId?: string;
  comprehensionChecks?: Record<string, unknown>;
  bookmarks?: string[];
}

export interface UserProgressSummary {
  completedModules: number;
  totalModules: number;
  currentModule?: {
    id: string;
    title: string;
    currentLessonId: string;
    progress: number;
  };
  moduleProgress: Record<string, ModuleProgress>;
}

/**
 * Get all progress for a user
 */
export async function getUserProgress(userId: string): Promise<ModuleProgress[]> {
  try {
    const { data, errors } = await client.models.ModuleProgress.list({
      filter: { userId: { eq: userId } },
    });

    if (errors) {
      console.error("Error fetching progress:", errors);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      userId: item.userId,
      moduleId: item.moduleId,
      status: (item.status as ModuleStatus) || "NOT_STARTED",
      startedAt: item.startedAt || undefined,
      completedAt: item.completedAt || undefined,
      currentLessonId: item.currentLessonId || undefined,
      comprehensionChecks: item.comprehensionChecks as Record<string, unknown> | undefined,
      bookmarks: item.bookmarks?.filter((b): b is string => b !== null) || [],
    }));
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return [];
  }
}

/**
 * Get progress for a specific module
 */
export async function getModuleProgress(
  userId: string,
  moduleId: string
): Promise<ModuleProgress | null> {
  try {
    const { data, errors } = await client.models.ModuleProgress.list({
      filter: {
        userId: { eq: userId },
        moduleId: { eq: moduleId },
      },
    });

    if (errors || !data || data.length === 0) {
      return null;
    }

    const item = data[0];
    return {
      id: item.id,
      userId: item.userId,
      moduleId: item.moduleId,
      status: (item.status as ModuleStatus) || "NOT_STARTED",
      startedAt: item.startedAt || undefined,
      completedAt: item.completedAt || undefined,
      currentLessonId: item.currentLessonId || undefined,
      comprehensionChecks: item.comprehensionChecks as Record<string, unknown> | undefined,
      bookmarks: item.bookmarks?.filter((b): b is string => b !== null) || [],
    };
  } catch (error) {
    console.error("Error fetching module progress:", error);
    return null;
  }
}

/**
 * Start a module (set status to IN_PROGRESS)
 */
export async function startModule(
  userId: string,
  moduleId: string,
  firstLessonId: string
): Promise<ModuleProgress | null> {
  try {
    // Check if progress already exists
    const existing = await getModuleProgress(userId, moduleId);

    if (existing) {
      // Update existing
      const { data, errors } = await client.models.ModuleProgress.update({
        id: existing.id,
        status: "IN_PROGRESS",
        currentLessonId: firstLessonId,
        startedAt: existing.startedAt || new Date().toISOString(),
      });

      if (errors) {
        console.error("Error updating module progress:", errors);
        return null;
      }

      return data as unknown as ModuleProgress;
    } else {
      // Create new
      const { data, errors } = await client.models.ModuleProgress.create({
        userId,
        moduleId,
        status: "IN_PROGRESS",
        currentLessonId: firstLessonId,
        startedAt: new Date().toISOString(),
        bookmarks: [],
      });

      if (errors) {
        console.error("Error creating module progress:", errors);
        return null;
      }

      return data as unknown as ModuleProgress;
    }
  } catch (error) {
    console.error("Error starting module:", error);
    return null;
  }
}

/**
 * Update current lesson in a module
 */
export async function updateCurrentLesson(
  userId: string,
  moduleId: string,
  lessonId: string
): Promise<boolean> {
  try {
    const existing = await getModuleProgress(userId, moduleId);

    if (!existing) {
      // Start the module if not started
      await startModule(userId, moduleId, lessonId);
      return true;
    }

    const { errors } = await client.models.ModuleProgress.update({
      id: existing.id,
      currentLessonId: lessonId,
      status: "IN_PROGRESS",
    });

    return !errors;
  } catch (error) {
    console.error("Error updating current lesson:", error);
    return false;
  }
}

/**
 * Mark a module as completed
 */
export async function completeModule(
  userId: string,
  moduleId: string
): Promise<boolean> {
  try {
    const existing = await getModuleProgress(userId, moduleId);

    if (!existing) {
      return false;
    }

    const { errors } = await client.models.ModuleProgress.update({
      id: existing.id,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    });

    return !errors;
  } catch (error) {
    console.error("Error completing module:", error);
    return false;
  }
}

/**
 * Toggle a bookmark for a lesson
 */
export async function toggleBookmark(
  userId: string,
  moduleId: string,
  lessonId: string
): Promise<boolean> {
  try {
    let existing = await getModuleProgress(userId, moduleId);

    if (!existing) {
      // Start module first
      existing = await startModule(userId, moduleId, lessonId);
      if (!existing) return false;
    }

    const bookmarks = existing.bookmarks || [];
    const isBookmarked = bookmarks.includes(lessonId);

    const newBookmarks = isBookmarked
      ? bookmarks.filter((b) => b !== lessonId)
      : [...bookmarks, lessonId];

    const { errors } = await client.models.ModuleProgress.update({
      id: existing.id,
      bookmarks: newBookmarks,
    });

    return !errors;
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return false;
  }
}
