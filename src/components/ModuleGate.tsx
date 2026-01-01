"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/hooks/useProgress";
import curriculumData from "@/content/modules/curriculum.json";

interface ModuleGateProps {
  moduleId: string;
  children: React.ReactNode;
}

export function ModuleGate({ moduleId, children }: ModuleGateProps) {
  const router = useRouter();
  const { getModuleStatus, isLoading } = useProgress();

  const moduleIndex = curriculumData.modules.findIndex((m) => m.id === moduleId);
  
  const isUnlocked = (() => {
    if (moduleIndex === 0) return true;
    if (moduleIndex === -1) return false;
    const prevModule = curriculumData.modules[moduleIndex - 1];
    return getModuleStatus(prevModule.id) === "COMPLETED";
  })();

  useEffect(() => {
    if (!isLoading && !isUnlocked) {
      router.replace("/curriculum");
    }
  }, [isLoading, isUnlocked, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 animate-spin text-cyan" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-text-muted">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 border border-dashed border-error mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2">Module Locked</h1>
          <p className="text-text-muted mb-6">Complete the previous module to unlock this one.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
