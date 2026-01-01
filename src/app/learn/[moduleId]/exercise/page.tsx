import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { ExerciseComponent } from "@/components/Exercise";
import { ModuleGate } from "@/components/ModuleGate";
import { loadExercise } from "@/lib/exercises";
import curriculumData from "@/content/modules/curriculum.json";

interface ExercisePageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { moduleId } = await params;

  const currentModule = curriculumData.modules.find((m) => m.id === moduleId);
  const moduleIndex = curriculumData.modules.findIndex((m) => m.id === moduleId);
  const exercise = await loadExercise(moduleId);

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 border border-dashed border-error mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2">Module Not Found</h1>
          <p className="text-text-muted mb-6">The requested module could not be located.</p>
          <Link href="/curriculum" className="btn btn-primary">
            Return to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen relative z-10">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 border border-dashed border-warning mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-text-primary mb-2">No Exercise Available</h1>
            <p className="text-text-muted mb-6">
              This module doesn&apos;t have an exercise yet. Continue to the comprehension check or explore other modules.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/learn/${moduleId}/check`} className="btn btn-primary">
                Take Comprehension Check
              </Link>
              <Link href="/curriculum" className="btn btn-secondary">
                View Curriculum
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ModuleGate moduleId={moduleId}>
    <div className="min-h-screen relative z-10">
      <Navigation />

      <div className="fixed top-16 left-0 right-0 z-40 bg-bp-deep/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
              <Link href="/curriculum" className="text-text-muted hover:text-cyan transition-colors">
                Curriculum
              </Link>
              <span className="text-border-dashed">/</span>
              <Link href={`/learn/${moduleId}`} className="text-text-muted hover:text-cyan transition-colors">
                Module {String(moduleIndex + 1).padStart(2, "0")}
              </Link>
              <span className="text-border-dashed">/</span>
              <span className="text-cyan">Exercise</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/learn/${moduleId}/${currentModule.lessons[currentModule.lessons.length - 1].id}`}
                className="w-8 h-8 border border-border-subtle hover:border-cyan flex items-center justify-center transition-colors group"
                title="Back to last lesson"
              >
                <svg className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <Link href={`/learn/${moduleId}/check`} className="btn btn-primary py-2 px-4 text-xs">
                <span>Take Check</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="badge badge-cyan">
              Module {String(moduleIndex + 1).padStart(2, "0")}
            </span>
            <span className="h-px flex-1 bg-border-dashed" />
            <span className="badge badge-warning">Exercise</span>
          </div>

          <ExerciseComponent exercise={exercise} />

          <div className="mt-12 pt-8 border-t border-border-dashed">
            <div className="flex items-center justify-between">
              <Link
                href={`/learn/${moduleId}/${currentModule.lessons[currentModule.lessons.length - 1].id}`}
                className="group flex items-center gap-3 text-text-muted hover:text-cyan transition-colors"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-wider opacity-60">Previous</p>
                  <p className="font-body text-sm font-bold">Back to Lessons</p>
                </div>
              </Link>

              <Link href={`/learn/${moduleId}/check`} className="btn btn-primary">
                <span>Take Comprehension Check</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ModuleGate>
  );
}
