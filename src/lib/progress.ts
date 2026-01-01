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

const client = generateClient<Schema>({
  authMode: "userPool",
});

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
    
    const allRecords = (data || []).map((item) => ({
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

    const deduped = new Map<string, ModuleProgress>();
    for (const record of allRecords) {
      const existing = deduped.get(record.moduleId);
      if (!existing) {
        deduped.set(record.moduleId, record);
      } else if (record.status === "COMPLETED" && existing.status !== "COMPLETED") {
        deduped.set(record.moduleId, record);
      } else if (record.completedAt && (!existing.completedAt || record.completedAt > existing.completedAt)) {
        deduped.set(record.moduleId, record);
      }
    }

    const result = Array.from(deduped.values());
    console.log("[Progress] Deduplicated progress:", result);
    return result;
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

    const records = data.map((item) => ({
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

    const completed = records.find((r) => r.status === "COMPLETED");
    if (completed) return completed;

    return records[0];
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
  console.log("[Progress] completeModule called:", { userId, moduleId });
  
  if (!userId) {
    console.error("[Progress] Cannot complete module: userId is empty");
    return false;
  }
  
  try {
    console.log("[Progress] Checking for existing progress record...");
    const existing = await getModuleProgress(userId, moduleId);
    console.log("[Progress] Existing record:", existing);

    if (!existing) {
      console.log("[Progress] No progress found, creating new COMPLETED record");
      const createPayload = {
        userId,
        moduleId,
        status: "COMPLETED" as const,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        bookmarks: [],
      };
      console.log("[Progress] Create payload:", createPayload);
      
      const { data, errors } = await client.models.ModuleProgress.create(createPayload);

      console.log("[Progress] Create response - data:", data, "errors:", errors);

      if (errors && errors.length > 0) {
        console.error("[Progress] Create errors:", JSON.stringify(errors, null, 2));
        return false;
      }

      if (!data) {
        console.error("[Progress] Create returned null data - authorization failure?");
        return false;
      }

      console.log("[Progress] Successfully created completed record:", data.id);
      return true;
    }

    console.log("[Progress] Updating existing record to COMPLETED:", existing.id);
    const { data: updateData, errors } = await client.models.ModuleProgress.update({
      id: existing.id,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    });

    console.log("[Progress] Update response - data:", updateData, "errors:", errors);

    if (errors && errors.length > 0) {
      console.error("[Progress] Update errors:", JSON.stringify(errors, null, 2));
      return false;
    }

    if (!updateData) {
      console.error("[Progress] Update returned null data - authorization failure?");
      return false;
    }

    console.log("[Progress] Successfully updated to completed:", updateData.id);
    return true;
  } catch (error) {
    console.error("[Progress] Exception in completeModule:", error);
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
