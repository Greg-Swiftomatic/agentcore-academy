/**
 * Knowledge Base - Static Imports
 * 
 * This module provides knowledge base content for the AI tutor.
 * Content is imported at build time to work reliably in serverless environments.
 */

// Static imports for all knowledge base files
// These are bundled at build time, making them available in serverless

// Module 1: Introduction
import whatIsAgentcore from "@/content/knowledge-base/01-introduction/what-is-agentcore.md";
import architectureOverview from "@/content/knowledge-base/01-introduction/architecture-overview.md";
import keyConcepts from "@/content/knowledge-base/01-introduction/key-concepts.md";

// Module 2: Core Services
import runtimeService from "@/content/knowledge-base/02-core-services/runtime-service.md";
import memoryService from "@/content/knowledge-base/02-core-services/memory-service.md";
import gatewayService from "@/content/knowledge-base/02-core-services/gateway-service.md";
import identityService from "@/content/knowledge-base/02-core-services/identity-service.md";

// Module 3: Agent Patterns
import toolSelectionPatterns from "@/content/knowledge-base/03-agent-patterns/tool-selection-patterns.md";

// Module 4: Hands-On
import buildingFirstAgent from "@/content/knowledge-base/04-hands-on/building-first-agent.md";

// Module 5: Security
import iamAndPermissions from "@/content/knowledge-base/05-security/iam-and-permissions.md";

// Module 6: Operations
import monitoringAndObservability from "@/content/knowledge-base/06-operations/monitoring-and-observability.md";

// Module 7: Advanced
import multiAgentOrchestration from "@/content/knowledge-base/07-advanced/multi-agent-orchestration.md";
import agentEvaluation from "@/content/knowledge-base/07-advanced/agent-evaluation.md";
import scalingStrategies from "@/content/knowledge-base/07-advanced/scaling-strategies.md";

// Module 8: Deployment
import testingStrategies from "@/content/knowledge-base/08-deployment/testing-strategies.md";
import deploymentPatterns from "@/content/knowledge-base/08-deployment/deployment-patterns.md";
import productionChecklist from "@/content/knowledge-base/08-deployment/production-checklist.md";

/**
 * Mapping from lesson IDs to knowledge base content
 */
const LESSON_CONTENT: Record<string, string[]> = {
  // Module 1: Introduction
  "01-what-is-agentcore": [whatIsAgentcore],
  "02-architecture-overview": [architectureOverview],
  "03-key-concepts": [keyConcepts],

  // Module 2: Core Services
  "01-service-overview": [runtimeService, memoryService, gatewayService, identityService],
  "02-runtime-service": [runtimeService],
  "03-memory-service": [memoryService],
  "04-tool-service": [gatewayService, toolSelectionPatterns],

  // Module 3: Agent Patterns
  "01-tool-selection": [toolSelectionPatterns],
  "02-memory-patterns": [memoryService],
  "03-custom-tools": [toolSelectionPatterns, buildingFirstAgent],

  // Module 4: Hands-On Build
  "01-project-setup": [buildingFirstAgent],
  "02-basic-agent": [buildingFirstAgent],
  "03-adding-tools": [buildingFirstAgent, toolSelectionPatterns],

  // Module 5: Security & IAM
  "01-iam-basics": [iamAndPermissions],
  "02-data-privacy": [iamAndPermissions],
  "03-security-best-practices": [iamAndPermissions],

  // Module 6: Operations
  "01-cost-optimization": [monitoringAndObservability],
  "02-monitoring": [monitoringAndObservability],
  "03-error-handling": [monitoringAndObservability],

  // Module 7: Advanced Topics
  "01-multi-agent": [multiAgentOrchestration],
  "02-evaluation": [agentEvaluation],
  "03-scaling": [scalingStrategies],

  // Module 8: Deployment
  "01-testing-strategies": [testingStrategies],
  "02-deployment-patterns": [deploymentPatterns],
  "03-going-live": [productionChecklist],
};

/**
 * Mapping from module IDs to all content for that module
 */
const MODULE_CONTENT: Record<string, string[]> = {
  "01-introduction": [whatIsAgentcore, architectureOverview, keyConcepts],
  "02-core-services": [runtimeService, memoryService, gatewayService, identityService],
  "03-agent-patterns": [toolSelectionPatterns],
  "04-hands-on-build": [buildingFirstAgent],
  "05-security-iam": [iamAndPermissions],
  "06-operations": [monitoringAndObservability],
  "07-advanced-topics": [multiAgentOrchestration, agentEvaluation, scalingStrategies],
  "08-deployment": [testingStrategies, deploymentPatterns, productionChecklist],
};

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

  // First, try lesson-specific content
  const lessonContent = LESSON_CONTENT[lessonId];
  if (lessonContent && lessonContent.length > 0) {
    console.log("[KnowledgeBase] Found lesson content, pieces:", lessonContent.length);
    return lessonContent.join("\n\n---\n\n");
  }

  // Fall back to module content
  const moduleContent = MODULE_CONTENT[moduleId];
  if (moduleContent && moduleContent.length > 0) {
    console.log("[KnowledgeBase] Using module content, pieces:", moduleContent.length);
    return moduleContent.join("\n\n---\n\n");
  }

  // Fallback message
  console.log("[KnowledgeBase] No content found, using fallback");
  return "No specific knowledge base content available for this lesson. Use your general knowledge of AI agents and AWS services to help the student.";
}

/**
 * Load the full module context (all files for a module)
 *
 * @param moduleId - The module ID
 * @returns All knowledge base content for the module
 */
export async function loadModuleKnowledge(moduleId: string): Promise<string> {
  const moduleContent = MODULE_CONTENT[moduleId];
  if (!moduleContent || moduleContent.length === 0) {
    return "";
  }
  return moduleContent.join("\n\n---\n\n");
}

/**
 * Get a summary of available knowledge base content
 */
export async function getKnowledgeBaseSummary(): Promise<{
  modules: Record<string, number>;
  totalFiles: number;
}> {
  const summary: Record<string, number> = {};
  let totalFiles = 0;

  for (const [moduleId, content] of Object.entries(MODULE_CONTENT)) {
    summary[moduleId] = content.length;
    totalFiles += content.length;
  }

  return { modules: summary, totalFiles };
}
