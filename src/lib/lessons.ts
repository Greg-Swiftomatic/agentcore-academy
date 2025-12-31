import { promises as fs } from "fs";
import path from "path";

export interface LessonContent {
  title: string;
  objectives: string[];
  content: string;
}

/**
 * Get the base path for lesson content files
 */
function getLessonsPath(): string {
  return path.join(process.cwd(), "src", "content", "lessons");
}

/**
 * Load lesson content from a JSON file
 *
 * @param moduleId - The module ID (e.g., "01-introduction")
 * @param lessonId - The lesson ID (e.g., "01-what-is-agentcore")
 * @returns The lesson content or a fallback
 */
export async function loadLessonContent(
  moduleId: string,
  lessonId: string
): Promise<LessonContent> {
  try {
    const filePath = path.join(
      getLessonsPath(),
      moduleId,
      `${lessonId}.json`
    );
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as LessonContent;
  } catch (error) {
    console.warn(
      `Could not load lesson content for ${moduleId}/${lessonId}:`,
      error
    );
    // Return fallback content
    return {
      title: lessonId.replace(/-/g, " ").replace(/^\d+-/, ""),
      objectives: ["Complete this lesson"],
      content: `# Coming Soon\n\nThis lesson content is being developed. Use the AI Tutor on the right to explore this topic interactively!`,
    };
  }
}

/**
 * Check if lesson content exists
 */
export async function lessonContentExists(
  moduleId: string,
  lessonId: string
): Promise<boolean> {
  try {
    const filePath = path.join(
      getLessonsPath(),
      moduleId,
      `${lessonId}.json`
    );
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available lessons for a module
 */
export async function getModuleLessons(
  moduleId: string
): Promise<string[]> {
  try {
    const dirPath = path.join(getLessonsPath(), moduleId);
    const files = await fs.readdir(dirPath);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}
