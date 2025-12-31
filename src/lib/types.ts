/**
 * Core types for AgentCore Academy
 */

// Module and lesson structure
export interface Module {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  prerequisites: string[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
}

// Comprehension check types
export interface ComprehensionQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "free_response";
  options?: string[]; // For multiple choice
  correctAnswer?: string; // For multiple choice
  rubric?: string; // For AI to evaluate free response
}

export interface ComprehensionResult {
  questionId: string;
  passed: boolean;
  attempts: number;
  lastAttemptAt: string;
}

// Progress tracking
export type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface UserProgress {
  moduleId: string;
  status: ModuleStatus;
  startedAt?: string;
  completedAt?: string;
  currentLessonId?: string;
  comprehensionChecks: ComprehensionResult[];
  bookmarks: string[];
}

// Learning state for AI context
export interface LearningState {
  moduleId: string;
  lastContext?: string;
  topicsExplained: string[];
  identifiedGaps: string[];
}

// User types
export type AuthProvider = "GITHUB" | "GOOGLE";

export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
  lastActiveAt: string;
}

// Chat message for AI tutor
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
