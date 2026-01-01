"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ComprehensionCheck } from "@/components/ComprehensionCheck";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/lib/auth";
import curriculumData from "@/content/modules/curriculum.json";

export default function CheckPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const { user } = useAuth();
  const { markModuleComplete, refreshProgress } = useProgress();

  const currModule = curriculumData.modules.find((m) => m.id === moduleId);

  if (!currModule) {
    return (
      <div className="min-h-screen relative z-10">
        <Navigation />
        <main className="pt-24 pb-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-text-primary mb-4">Module Not Found</h1>
            <Link href="/curriculum" className="btn btn-primary">
              Back to Curriculum
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleComplete = async (passed: boolean, score: number) => {
    console.log("[Check] handleComplete called:", { passed, score, moduleId, userId: user?.id });
    
    if (!passed) {
      console.log("[Check] User did not pass, skipping progress update");
      return;
    }
    
    if (!user?.id) {
      console.warn("[Check] User not signed in, progress will not be saved");
      return;
    }
    
    try {
      console.log("[Check] Marking module complete for user:", user.id);
      await markModuleComplete(moduleId);
      console.log("[Check] markModuleComplete succeeded, refreshing progress...");
      await refreshProgress();
      console.log("[Check] Progress refreshed successfully");
    } catch (error) {
      console.error("[Check] Error in handleComplete:", error);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      <Navigation />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-text-muted mb-6 uppercase tracking-wider">
            <Link href="/curriculum" className="hover:text-cyan transition-colors">
              Curriculum
            </Link>
            <span className="text-border-dashed">/</span>
            <Link href={`/learn/${moduleId}/${currModule.lessons[0].id}`} className="hover:text-cyan transition-colors">
              {currModule.title}
            </Link>
            <span className="text-border-dashed">/</span>
            <span className="text-cyan">Comprehension Check</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <span className="blueprint-label mb-4">Module Verification</span>
            <h1 className="text-text-primary mb-2">{currModule.title}</h1>
            <p className="text-text-secondary">
              Test your understanding of the key concepts from this module.
              You need 80% to pass and unlock the next module.
            </p>
          </div>

          {/* Notice */}
          <div className="schematic-box mb-8" data-label="VERIFICATION PROTOCOL">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border border-dashed border-cyan flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-text-primary font-body font-bold text-sm mb-1">
                  Scenario-Based Assessment
                </p>
                <p className="text-text-secondary text-sm">
                  These questions test your ability to apply concepts, not just recall facts.
                  Take your time and think through each scenario.
                </p>
              </div>
            </div>
          </div>

          {/* Comprehension Check Component */}
          <ComprehensionCheck moduleId={moduleId} onComplete={handleComplete} />

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href={`/learn/${moduleId}/${currModule.lessons[currModule.lessons.length - 1].id}`}
              className="text-text-muted hover:text-cyan text-sm transition-colors"
            >
              ← Back to last lesson
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
