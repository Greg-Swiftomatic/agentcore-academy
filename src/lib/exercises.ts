import { promises as fs } from "fs";
import path from "path";

export interface ExerciseField {
  name: string;
  label: string;
  type: "text" | "textarea" | "list" | "code" | "select" | "checklist";
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  minLength?: number;
  minItems?: number;
  maxItems?: number;
  options?: string[] | { value: string; label: string }[];
  language?: string;
}

export interface ExerciseDeliverable {
  type: "form" | "code" | "checklist";
  fields: ExerciseField[];
}

export interface Exercise {
  moduleId: string;
  exerciseId: string;
  title: string;
  estimatedTime: string;
  overview: string;
  objectives: string[];
  context: string;
  instructions: string;
  deliverable: ExerciseDeliverable;
  successCriteria: string[];
  exampleSubmission?: Record<string, unknown>;
  tutorPrompt?: string;
}

export async function loadExercise(moduleId: string): Promise<Exercise | null> {
  const exercisesDir = path.join(process.cwd(), "src/content/exercises", moduleId);
  
  try {
    const files = await fs.readdir(exercisesDir);
    const jsonFile = files.find((f) => f.endsWith(".json"));
    
    if (!jsonFile) {
      return null;
    }
    
    const exercisePath = path.join(exercisesDir, jsonFile);
    const content = await fs.readFile(exercisePath, "utf-8");
    return JSON.parse(content) as Exercise;
  } catch {
    return null;
  }
}

export async function hasExercise(moduleId: string): Promise<boolean> {
  const exercise = await loadExercise(moduleId);
  return exercise !== null;
}

export async function getModulesWithExercises(): Promise<string[]> {
  const exercisesDir = path.join(process.cwd(), "src/content/exercises");
  
  try {
    const modules = await fs.readdir(exercisesDir);
    const modulesWithExercises: string[] = [];
    
    for (const moduleId of modules) {
      const modulePath = path.join(exercisesDir, moduleId);
      const stat = await fs.stat(modulePath);
      
      if (stat.isDirectory()) {
        const hasEx = await hasExercise(moduleId);
        if (hasEx) {
          modulesWithExercises.push(moduleId);
        }
      }
    }
    
    return modulesWithExercises;
  } catch {
    return [];
  }
}
