"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { useProgress } from "@/hooks/useProgress";
import curriculumData from "@/content/modules/curriculum.json";

function ModuleBlueprint({
  module,
  index,
  status,
  progressPercent,
  isUnlocked,
}: {
  module: (typeof curriculumData.modules)[0];
  index: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercent: number;
  isUnlocked: boolean;
}) {
  const statusColors = {
    COMPLETED: "border-success",
    IN_PROGRESS: "border-cyan",
    NOT_STARTED: "border-border-subtle",
  };

  const nodeColor = {
    COMPLETED: "bg-success border-success",
    IN_PROGRESS: "bg-cyan border-cyan animate-pulse-glow",
    NOT_STARTED: "bg-bp-primary border-border-dashed",
  };

  return (
    <div className={`relative ${!isUnlocked ? "opacity-50" : ""}`}>
      {/* Vertical connection line */}
      {index < curriculumData.modules.length - 1 && (
        <div className="absolute left-[19px] top-12 bottom-0 w-px border-l border-dashed border-border-dashed" />
      )}
      
      <div className={`card ${statusColors[status]} transition-all ${isUnlocked ? "hover:border-cyan" : ""}`}>
        <div className="flex gap-6">
          {/* Status node */}
          <div className="flex flex-col items-center">
            <div className={`node w-10 h-10 ${nodeColor[status]} flex items-center justify-center`}>
              {status === "COMPLETED" ? (
                <svg className="w-5 h-5 text-bp-deep" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : status === "IN_PROGRESS" ? (
                <div className="w-3 h-3 bg-bp-deep" />
              ) : (
                <span className="font-body text-xs font-bold text-text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* Module content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-cyan text-xs font-bold uppercase tracking-widest">
                    Module {String(index + 1).padStart(2, "0")}
                  </span>
                  {status === "COMPLETED" && (
                    <span className="badge badge-success text-[10px]">Verified</span>
                  )}
                  {status === "IN_PROGRESS" && (
                    <span className="badge badge-cyan text-[10px]">
                      <span className="w-1 h-1 bg-cyan rounded-full animate-pulse" />
                      Active
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="badge badge-muted text-[10px]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Locked
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-text-primary mb-2">
                  {module.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {module.description}
                </p>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-6 text-xs text-text-muted mb-4">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {module.estimatedDuration}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {module.lessons.length} lessons
              </span>
            </div>

            {/* Progress bar */}
            {status !== "NOT_STARTED" && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-text-muted uppercase tracking-wider">Progress</span>
                  <span className="text-cyan font-bold">{progressPercent}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* Lessons */}
            <div className="schematic-box" data-label="LESSONS">
              <div className="space-y-0 divide-y divide-border-subtle">
                {module.lessons.map((lesson, lessonIndex) => {
                  const lessonCompleted =
                    status === "COMPLETED" ||
                    (status === "IN_PROGRESS" &&
                      (lessonIndex / module.lessons.length) * 100 < progressPercent);

                  return (
                    <Link
                      key={lesson.id}
                      href={isUnlocked ? `/learn/${module.id}/${lesson.id}` : "#"}
                      className={`flex items-center gap-4 py-3 px-2 transition-colors ${
                        isUnlocked ? "hover:bg-bp-secondary/30 cursor-pointer group" : "cursor-not-allowed"
                      }`}
                    >
                      {/* Lesson node */}
                      <div className={`w-6 h-6 border flex items-center justify-center flex-shrink-0 ${
                        lessonCompleted 
                          ? "bg-success/20 border-success text-success" 
                          : "bg-transparent border-border-dashed text-text-muted"
                      }`}>
                        {lessonCompleted ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-bold">{lessonIndex + 1}</span>
                        )}
                      </div>
                      
                      {/* Lesson content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-body text-sm font-bold ${
                          isUnlocked ? "text-text-primary group-hover:text-cyan" : "text-text-muted"
                        } transition-colors truncate`}>
                          {lesson.title}
                        </h4>
                        <p className="text-text-muted text-xs truncate">
                          {lesson.description}
                        </p>
                      </div>
                      
                      {/* Duration */}
                      <span className="text-text-muted text-xs flex-shrink-0">
                        {lesson.estimatedDuration}
                      </span>
                      
                      {/* Arrow */}
                      {isUnlocked && (
                        <svg className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-cyan transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  const { getModuleStatus, getModuleProgressPercent, completedModules, totalModules, isLoading } = useProgress();

  // Calculate which modules are unlocked based on prerequisites
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    const prevModule = curriculumData.modules[moduleIndex - 1];
    const prevStatus = getModuleStatus(prevModule.id);
    return prevStatus === "COMPLETED";
  };

  // Calculate total progress
  const totalProgress = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="min-h-screen relative z-10">
      <Navigation />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-text-muted mb-6 uppercase tracking-wider">
              <Link href="/dashboard" className="hover:text-cyan transition-colors">
                Dashboard
              </Link>
              <span className="text-border-dashed">/</span>
              <span className="text-cyan">Curriculum</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="blueprint-label mb-4">Training Blueprint</span>
                <h1 className="text-text-primary mb-2">Course Schematics</h1>
                <p className="text-text-secondary">
                  8 modules · 26 lessons · ~8.5 hours of content
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-4 p-4 border border-border-subtle">
                <div className="text-right">
                  <p className="text-text-muted text-xs uppercase tracking-wider">System Progress</p>
                  <p className="font-display text-2xl text-cyan glow-cyan">
                    {isLoading ? "..." : `${totalProgress}%`}
                  </p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--color-border-dashed)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--color-cyan)"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress * 1.76} 176`}
                      strokeLinecap="square"
                      style={{ filter: "drop-shadow(0 0 4px var(--color-cyan-glow))" }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisites Notice */}
          <div className="schematic-box mb-8" data-label="SYSTEM NOTICE">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border border-dashed border-cyan flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-text-primary font-body font-bold text-sm mb-1">
                  Sequential Training Protocol
                </p>
                <p className="text-text-secondary text-sm">
                  Complete each module to unlock the next. This ensures you have the
                  foundational knowledge required for advanced topics.
                </p>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-text-muted">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading progress...
              </div>
            </div>
          )}

          {/* Modules List */}
          {!isLoading && (
            <div className="space-y-6">
              {curriculumData.modules.map((module, index) => (
                <ModuleBlueprint
                  key={module.id}
                  module={module}
                  index={index}
                  status={getModuleStatus(module.id)}
                  progressPercent={getModuleProgressPercent(module.id)}
                  isUnlocked={isModuleUnlocked(index)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
