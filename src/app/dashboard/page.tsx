"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/hooks/useProgress";
import curriculumData from "@/content/modules/curriculum.json";

// Blueprint-style progress ring
function ProgressRing({
  progress,
  size = 120,
}: {
  progress: number;
  size?: number;
}) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle - dashed */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-dashed)"
          strokeWidth={strokeWidth}
          strokeDasharray="4 4"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="square"
          className="transition-all duration-700"
          style={{ filter: "drop-shadow(0 0 6px var(--color-cyan-glow))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl text-cyan glow-cyan">
          {progress}%
        </span>
        <span className="text-text-muted text-xs uppercase tracking-widest mt-1">
          Complete
        </span>
      </div>
    </div>
  );
}

// Blueprint stat card
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border border-border-subtle hover:border-border transition-colors group">
      <div className="w-10 h-10 border border-dashed border-border-dashed flex items-center justify-center text-cyan group-hover:border-cyan transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-text-muted text-xs uppercase tracking-wider">{label}</p>
        <p className="font-display text-xl text-text-primary">{value}</p>
      </div>
    </div>
  );
}

// Module card with blueprint styling
function ModuleCard({
  number,
  title,
  status,
  progress,
  href,
}: {
  number: string;
  title: string;
  status: "completed" | "in_progress" | "not_started";
  progress?: number;
  href: string;
}) {
  const statusStyles = {
    completed: "border-success",
    in_progress: "border-cyan animate-pulse-glow",
    not_started: "border-border-subtle opacity-60",
  };

  const content = (
    <div className={`p-4 border ${statusStyles[status]} transition-all hover:bg-bp-secondary/30 group relative`}>
      {/* Corner marks */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-current opacity-50" />
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`font-body text-xs font-bold ${
            status === "completed" ? "text-success" : 
            status === "in_progress" ? "text-cyan" : "text-text-muted"
          }`}>
            {number}
          </span>
          <span className="font-body text-sm font-bold text-text-primary group-hover:text-cyan transition-colors">
            {title}
          </span>
        </div>
        {status === "completed" && (
          <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {status === "not_started" && (
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      </div>
      {progress !== undefined && status !== "not_started" && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );

  return <Link href={href}>{content}</Link>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    isLoading, 
    completedModules, 
    totalModules, 
    overallProgress,
    currentModule,
    getModuleStatus,
    getModuleProgressPercent,
  } = useProgress();

  // Find the first lesson of the first module to start with
  const firstModule = curriculumData.modules[0];
  const firstLesson = firstModule?.lessons[0];

  // Get current lesson title
  const currentLessonTitle = currentModule
    ? curriculumData.modules
        .find((m) => m.id === currentModule.id)
        ?.lessons.find((l) => l.id === currentModule.currentLessonId)?.title || "Getting Started"
    : firstLesson?.title || "Getting Started";

  // Determine what to show for "continue learning"
  const continueModule = currentModule || {
    id: firstModule?.id || "01-introduction",
    title: firstModule?.title || "Introduction to AgentCore",
    currentLessonId: firstLesson?.id || "01-what-is-agentcore",
    progress: 0,
  };

  return (
    <div className="min-h-screen relative z-10">
      <Navigation />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12 relative">
            {/* Decorative line */}
            <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan via-border-dashed to-transparent" />
            
            <span className="blueprint-label mb-4">Control Panel</span>
            <h1 className="mb-2">
              <span className="text-text-primary">Welcome back, </span>
              <span className="text-cyan glow-cyan">{user?.name || "Developer"}</span>
            </h1>
            <p className="text-text-secondary">
              Continue your AgentCore training sequence
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 animate-spin text-cyan" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-text-muted">Loading progress data...</span>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Continue Learning Card */}
                <div className="card relative overflow-hidden">
                  {/* Scanning line effect */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50" />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
                        {currentModule ? "Active Training Module" : "Start Your Training"}
                      </p>
                      <h2 className="font-display text-xl text-text-primary mb-1">
                        {continueModule.title}
                      </h2>
                      <p className="text-cyan text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                        {currentLessonTitle}
                      </p>
                    </div>
                    <span className="badge badge-cyan">
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                      {currentModule ? "In Progress" : "Ready"}
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-muted uppercase tracking-wider">Module Progress</span>
                      <span className="text-cyan font-bold">
                        {continueModule.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${continueModule.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learn/${continueModule.id}/${continueModule.currentLessonId}`}
                    className="btn btn-primary w-full"
                  >
                    <span>{currentModule ? "Resume Training" : "Begin Training"}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                {/* Module Progress Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="blueprint-label">Module Status</span>
                    <Link href="/curriculum" className="text-cyan text-xs uppercase tracking-wider hover:glow-cyan transition-all">
                      View Full Schematics →
                    </Link>
                  </div>

                  <div className="schematic-box" data-label="TRAINING SEQUENCE">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {curriculumData.modules.slice(0, 4).map((module, index) => {
                        const status = getModuleStatus(module.id);
                        const progress = getModuleProgressPercent(module.id);
                        const displayStatus = status === "COMPLETED" ? "completed" : 
                                             status === "IN_PROGRESS" ? "in_progress" : "not_started";
                        
                        return (
                          <ModuleCard
                            key={module.id}
                            number={String(index + 1).padStart(2, "0")}
                            title={module.title.replace("Introduction to ", "").replace(" Deep Dive", "")}
                            status={displayStatus}
                            progress={status !== "NOT_STARTED" ? progress : undefined}
                            href={`/learn/${module.id}/${module.lessons[0]?.id}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Overall Progress */}
                <div className="card text-center">
                  <span className="blueprint-label justify-center mb-6">System Status</span>
                  <div className="flex justify-center mb-4">
                    <ProgressRing progress={overallProgress} />
                  </div>
                  <p className="text-text-secondary text-sm">
                    <span className="text-cyan font-bold">{completedModules}</span>
                    <span className="text-text-muted"> of </span>
                    <span className="text-text-primary">{totalModules}</span>
                    <span className="text-text-muted"> modules completed</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="schematic-box space-y-3" data-label="METRICS">
                  <StatCard
                    label="Modules Done"
                    value={`${completedModules}/${totalModules}`}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Total Lessons"
                    value={curriculumData.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Progress"
                    value={`${overallProgress}%`}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    }
                  />
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <span className="blueprint-label mb-4">Quick Access</span>
                  <div className="space-y-1">
                    <Link
                      href="/curriculum"
                      className="flex items-center gap-3 p-3 hover:bg-bp-secondary/50 transition-colors group"
                    >
                      <svg className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-sm text-text-secondary group-hover:text-cyan transition-colors">
                        Browse Curriculum
                      </span>
                      <svg className="w-3 h-3 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="/learn"
                      className="flex items-center gap-3 p-3 hover:bg-bp-secondary/50 transition-colors group"
                    >
                      <svg className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-text-secondary group-hover:text-cyan transition-colors">
                        Continue Learning
                      </span>
                      <svg className="w-3 h-3 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
