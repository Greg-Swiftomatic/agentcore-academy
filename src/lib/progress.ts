"use client";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import outputs from "../../amplify_outputs.json";

// Ensure Amplify is configured before generating client
try {
  Amplify.configure(outputs, { ssr: true });
} catch {
  // Already configured
}

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
  console.log("[Progress] Fetching progress for user:", userId);
  try {
    const { data, errors } = await client.models.ModuleProgress.list({
      filter: { userId: { eq: userId } },
    });

    if (errors) {
      console.error("[Progress] Error fetching progress:", errors);
      return [];
    }

    console.log("[Progress] Fetched progress:", data);
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
    console.error("[Progress] Error fetching user progress:", error);
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
    console.error("[Progress] Error fetching module progress:", error);
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
  console.log("[Progress] Starting module:", { userId, moduleId, firstLessonId });
  try {
    // Check if progress already exists
    const existing = await getModuleProgress(userId, moduleId);

    if (existing) {
      // Update existing
      console.log("[Progress] Updating existing progress:", existing.id);
      const { data, errors } = await client.models.ModuleProgress.update({
        id: existing.id,
        status: "IN_PROGRESS",
        currentLessonId: firstLessonId,
        startedAt: existing.startedAt || new Date().toISOString(),
      });

      if (errors) {
        console.error("[Progress] Error updating module progress:", errors);
        return null;
      }

      console.log("[Progress] Updated progress:", data);
      return data as unknown as ModuleProgress;
    } else {
      // Create new
      console.log("[Progress] Creating new progress record");
      const { data, errors } = await client.models.ModuleProgress.create({
        userId,
        moduleId,
        status: "IN_PROGRESS",
        currentLessonId: firstLessonId,
        startedAt: new Date().toISOString(),
        bookmarks: [],
      });

      if (errors) {
        console.error("[Progress] Error creating module progress:", errors);
        return null;
      }

      console.log("[Progress] Created progress:", data);
      return data as unknown as ModuleProgress;
    }
  } catch (error) {
    console.error("[Progress] Error starting module:", error);
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
  console.log("[Progress] Updating current lesson:", { userId, moduleId, lessonId });
  try {
    const existing = await getModuleProgress(userId, moduleId);

    if (!existing) {
      // Start the module if not started
      console.log("[Progress] Module not started, starting it now");
      await startModule(userId, moduleId, lessonId);
      return true;
    }

    console.log("[Progress] Updating existing progress:", existing.id);
    const { errors } = await client.models.ModuleProgress.update({
      id: existing.id,
      currentLessonId: lessonId,
      status: "IN_PROGRESS",
    });

    if (errors) {
      console.error("[Progress] Error updating lesson:", errors);
      return false;
    }

    console.log("[Progress] Lesson updated successfully");
    return true;
  } catch (error) {
    console.error("[Progress] Error updating current lesson:", error);
    return false;
  }
}

export async function completeModule(
  userId: string,
  moduleId: string
): Promise<boolean> {
  console.log("[Progress] Completing module:", { userId, moduleId });
  try {
    const existing = await getModuleProgress(userId, moduleId);

    if (!existing) {
      console.log("[Progress] No progress found, creating completed record");
      const { data, errors } = await client.models.ModuleProgress.create({
        userId,
        moduleId,
        status: "COMPLETED",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        bookmarks: [],
      });

      if (errors) {
        console.error("[Progress] Error creating completed module:", errors);
        return false;
      }

      console.log("[Progress] Created completed module:", data);
      return true;
    }

    const { errors } = await client.models.ModuleProgress.update({
      id: existing.id,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    });

    if (errors) {
      console.error("[Progress] Error completing module:", errors);
      return false;
    }

    console.log("[Progress] Module completed successfully");
    return true;
  } catch (error) {
    console.error("[Progress] Error completing module:", error);
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
    console.error("[Progress] Error toggling bookmark:", error);
    return false;
  }
}
