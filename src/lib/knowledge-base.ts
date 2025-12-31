import { promises as fs } from "fs";
import path from "path";

/**
 * Mapping from curriculum module IDs to knowledge base directories
 */
const MODULE_TO_KB_MAP: Record<string, string[]> = {
  "01-introduction": ["01-introduction"],
  "02-core-services": ["02-core-services"],
  "03-agent-patterns": ["03-agent-patterns"],
  "04-hands-on-build": ["04-hands-on"],
  "05-security-iam": ["05-security"],
  "06-operations": ["06-operations"],
  "07-advanced-topics": ["07-advanced"],
  "08-deployment": ["08-deployment"],
};

/**
 * Mapping from lesson IDs to specific knowledge base files
 * This provides more targeted content for each lesson
 */
const LESSON_TO_KB_FILES: Record<string, string[]> = {
  // Module 1: Introduction
  "01-what-is-agentcore": ["01-introduction/what-is-agentcore.md"],
  "02-architecture-overview": ["01-introduction/architecture-overview.md"],
  "03-key-concepts": ["01-introduction/key-concepts.md"],

  // Module 2: Core Services
  "01-service-overview": [
    "02-core-services/runtime-service.md",
    "02-core-services/memory-service.md",
    "02-core-services/gateway-service.md",
    "02-core-services/identity-service.md",
  ],
  "02-runtime-service": ["02-core-services/runtime-service.md"],
  "03-memory-service": ["02-core-services/memory-service.md"],
  "04-tool-service": [
    "02-core-services/gateway-service.md",
    "03-agent-patterns/tool-selection-patterns.md",
  ],

  // Module 3: Agent Patterns
  "01-tool-selection": ["03-agent-patterns/tool-selection-patterns.md"],
  "02-memory-patterns": ["02-core-services/memory-service.md"],
  "03-custom-tools": [
    "03-agent-patterns/tool-selection-patterns.md",
    "04-hands-on/building-first-agent.md",
  ],

  // Module 4: Hands-On Build
  "01-project-setup": ["04-hands-on/building-first-agent.md"],
  "02-basic-agent": ["04-hands-on/building-first-agent.md"],
  "03-adding-tools": [
    "04-hands-on/building-first-agent.md",
    "03-agent-patterns/tool-selection-patterns.md",
  ],

  // Module 5: Security & IAM
  "01-iam-basics": ["05-security/iam-and-permissions.md"],
  "02-data-privacy": ["05-security/iam-and-permissions.md"],
  "03-security-best-practices": ["05-security/iam-and-permissions.md"],

  // Module 6: Operations
  "01-cost-optimization": ["06-operations/monitoring-and-observability.md"],
  "02-monitoring": ["06-operations/monitoring-and-observability.md"],
  "03-error-handling": ["06-operations/monitoring-and-observability.md"],

  // Module 7: Advanced Topics
  "01-multi-agent": ["07-advanced/multi-agent-orchestration.md"],
  "02-evaluation": ["07-advanced/agent-evaluation.md"],
  "03-scaling": ["07-advanced/scaling-strategies.md"],

  // Module 8: Deployment
  "01-testing-strategies": ["08-deployment/testing-strategies.md"],
  "02-deployment-patterns": ["08-deployment/deployment-patterns.md"],
  "03-going-live": ["08-deployment/production-checklist.md"],
};

/**
 * Get the base path for knowledge base files
 */
function getKnowledgeBasePath(): string {
  // In Next.js, we need to resolve from the project root
  const basePath = path.join(process.cwd(), "src", "content", "knowledge-base");
  console.log("[KnowledgeBase] Base path:", basePath);
  console.log("[KnowledgeBase] CWD:", process.cwd());
  return basePath;
}

/**
 * Load a single knowledge base file
 */
async function loadKnowledgeBaseFile(
  relativePath: string
): Promise<string | null> {
  try {
    const fullPath = path.join(getKnowledgeBasePath(), relativePath);
    console.log("[KnowledgeBase] Loading file:", fullPath);
    const content = await fs.readFile(fullPath, "utf-8");
    console.log("[KnowledgeBase] Loaded file successfully, length:", content.length);
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[KnowledgeBase] Could not load file: ${relativePath} - ${errorMessage}`);
    return null;
  }
}

/**
 * Load all files from a knowledge base directory
 */
async function loadKnowledgeBaseDirectory(
  dirName: string
): Promise<string | null> {
  try {
    const dirPath = path.join(getKnowledgeBasePath(), dirName);
    console.log("[KnowledgeBase] Loading directory:", dirPath);
    const files = await fs.readdir(dirPath);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    console.log("[KnowledgeBase] Found files:", mdFiles);

    const contents: string[] = [];
    for (const file of mdFiles) {
      const content = await loadKnowledgeBaseFile(path.join(dirName, file));
      if (content) {
        contents.push(content);
      }
    }

    return contents.length > 0 ? contents.join("\n\n---\n\n") : null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[KnowledgeBase] Could not load directory: ${dirName} - ${errorMessage}`);
    return null;
  }
}

/**
 * Load knowledge base content for a specific lesson
 *
 * @param moduleId - The module ID (e.g., "01-introduction")
 * @param lessonId - The lesson ID (e.g., "01-what-is-agentcore")
 * @returns The combined knowledge base content for the lesson
 */
export async function loadLessonKnowledge(
  moduleId: string,
  lessonId: string
): Promise<string> {
  console.log("[KnowledgeBase] Loading knowledge for:", { moduleId, lessonId });
  const contents: string[] = [];

  // First, try to load lesson-specific files
  const lessonFiles = LESSON_TO_KB_FILES[lessonId];
  console.log("[KnowledgeBase] Lesson files mapping:", lessonFiles);
  
  if (lessonFiles) {
    for (const file of lessonFiles) {
      const content = await loadKnowledgeBaseFile(file);
      if (content) {
        contents.push(content);
      }
    }
  }

  // If no lesson-specific files found, fall back to module directory
  if (contents.length === 0) {
    console.log("[KnowledgeBase] No lesson files found, trying module directory");
    const moduleDirs = MODULE_TO_KB_MAP[moduleId];
    if (moduleDirs) {
      for (const dir of moduleDirs) {
        const content = await loadKnowledgeBaseDirectory(dir);
        if (content) {
          contents.push(content);
        }
      }
    }
  }

  // Return combined content or a fallback message
  if (contents.length === 0) {
    console.log("[KnowledgeBase] No content found, using fallback");
    return "No specific knowledge base content available for this lesson. Use your general knowledge of AI agents and AWS services to help the student.";
  }

  console.log("[KnowledgeBase] Loaded content pieces:", contents.length);
  return contents.join("\n\n---\n\n");
}

/**
 * Load the full module context (all files for a module)
 * Useful for providing broader context when needed
 *
 * @param moduleId - The module ID
 * @returns All knowledge base content for the module
 */
export async function loadModuleKnowledge(moduleId: string): Promise<string> {
  const moduleDirs = MODULE_TO_KB_MAP[moduleId];
  if (!moduleDirs) {
    return "";
  }

  const contents: string[] = [];
  for (const dir of moduleDirs) {
    const content = await loadKnowledgeBaseDirectory(dir);
    if (content) {
      contents.push(content);
    }
  }

  return contents.join("\n\n---\n\n");
}

/**
 * Get a summary of available knowledge base content
 * Useful for debugging and understanding coverage
 */
export async function getKnowledgeBaseSummary(): Promise<{
  modules: Record<string, string[]>;
  totalFiles: number;
}> {
  const basePath = getKnowledgeBasePath();
  const summary: Record<string, string[]> = {};
  let totalFiles = 0;

  try {
    const dirs = await fs.readdir(basePath);
    for (const dir of dirs) {
      const dirPath = path.join(basePath, dir);
      const stat = await fs.stat(dirPath);
      if (stat.isDirectory()) {
        const files = await fs.readdir(dirPath);
        const mdFiles = files.filter((f) => f.endsWith(".md"));
        summary[dir] = mdFiles;
        totalFiles += mdFiles.length;
      }
    }
  } catch (error) {
    console.error("Error getting knowledge base summary:", error);
  }

  return { modules: summary, totalFiles };
}
