import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import curriculumData from "@/content/modules/curriculum.json";

const mockUser = {
  name: "Developer",
  avatarUrl: undefined,
};

// Mock progress data - replace with real data
const mockModuleProgress: Record<string, { status: string; progress: number }> = {
  "01-introduction": { status: "completed", progress: 100 },
  "02-core-services": { status: "in_progress", progress: 35 },
  "03-agent-patterns": { status: "not_started", progress: 0 },
  "04-hands-on-build": { status: "not_started", progress: 0 },
  "05-security-iam": { status: "not_started", progress: 0 },
  "06-operations": { status: "not_started", progress: 0 },
  "07-advanced-topics": { status: "not_started", progress: 0 },
  "08-deployment": { status: "not_started", progress: 0 },
};

function ModuleAccordion({
  module,
  index,
  progress,
  isUnlocked,
}: {
  module: (typeof curriculumData.modules)[0];
  index: number;
  progress: { status: string; progress: number };
  isUnlocked: boolean;
}) {
  const statusIcons = {
    completed: (
      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
    in_progress: (
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
      </div>
    ),
    not_started: (
      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center font-display text-sm font-semibold text-text-muted">
        {String(index + 1).padStart(2, "0")}
      </div>
    ),
  };

  const statusColors = {
    completed: "border-success/30",
    in_progress: "border-accent/30",
    not_started: "border-border-subtle",
  };

  return (
    <div
      className={`rounded-xl border ${statusColors[progress.status as keyof typeof statusColors]} ${
        !isUnlocked ? "opacity-60" : ""
      } overflow-hidden transition-all`}
    >
      {/* Module Header */}
      <div className="bg-bg-secondary/50 p-6">
        <div className="flex items-start gap-4">
          {statusIcons[progress.status as keyof typeof statusIcons]}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display text-xs font-semibold text-accent uppercase tracking-wider">
                Module {String(index + 1).padStart(2, "0")}
              </span>
              {progress.status === "completed" && (
                <span className="badge badge-success">Completed</span>
              )}
              {progress.status === "in_progress" && (
                <span className="badge badge-accent">In Progress</span>
              )}
              {!isUnlocked && (
                <span className="badge badge-muted flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Locked
                </span>
              )}
            </div>
            <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
              {module.title}
            </h3>
            <p className="text-text-secondary text-sm mb-4">{module.description}</p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {module.estimatedDuration}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {module.lessons.length} lessons
              </span>
            </div>

            {/* Progress bar for in-progress modules */}
            {progress.status !== "not_started" && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-display">{progress.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="border-t border-border-subtle divide-y divide-border-subtle">
        {module.lessons.map((lesson, lessonIndex) => {
          const lessonCompleted =
            progress.status === "completed" ||
            (progress.status === "in_progress" &&
              (lessonIndex / module.lessons.length) * 100 < progress.progress);

          return (
            <Link
              key={lesson.id}
              href={isUnlocked ? `/learn/${module.id}/${lesson.id}` : "#"}
              className={`flex items-center gap-4 p-4 transition-colors ${
                isUnlocked
                  ? "hover:bg-bg-tertiary/50 cursor-pointer"
                  : "cursor-not-allowed"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  lessonCompleted
                    ? "bg-success/20 text-success"
                    : "bg-bg-tertiary text-text-muted"
                }`}
              >
                {lessonCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-display">{lessonIndex + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-display text-sm font-medium ${
                    isUnlocked ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {lesson.title}
                </h4>
                <p className="text-text-muted text-xs mt-0.5">{lesson.description}</p>
              </div>
              <span className="text-text-muted text-xs flex-shrink-0">
                {lesson.estimatedDuration}
              </span>
              {isUnlocked && (
                <svg
                  className="w-4 h-4 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  // Calculate which modules are unlocked based on prerequisites
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    const prevModule = curriculumData.modules[moduleIndex - 1];
    const prevProgress = mockModuleProgress[prevModule.id];
    return prevProgress?.status === "completed";
  };

  // Calculate total progress
  const completedModules = Object.values(mockModuleProgress).filter(
    (p) => p.status === "completed"
  ).length;
  const totalProgress = Math.round(
    (completedModules / curriculumData.modules.length) * 100
  );

  return (
    <div className="min-h-screen grain">
      <Navigation user={mockUser} />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/dashboard" className="hover:text-accent transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-text-primary">Curriculum</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl mb-2">Course Curriculum</h1>
                <p className="text-text-secondary">
                  8 modules · 26 lessons · ~8.5 hours of content
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-text-muted text-sm">Overall Progress</p>
                  <p className="font-display text-2xl font-bold text-accent">
                    {totalProgress}%
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-bg-tertiary relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="4"
                      strokeDasharray={`${totalProgress * 1.76} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisites Notice */}
          <div className="bg-bg-secondary/50 border border-border-subtle rounded-lg p-4 mb-8 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              <p className="text-text-primary font-medium">Linear progression</p>
              <p className="text-text-secondary">
                Complete each module to unlock the next. This ensures you have the
                foundational knowledge needed for advanced topics.
              </p>
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-6">
            {curriculumData.modules.map((module, index) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                index={index}
                progress={
                  mockModuleProgress[module.id] || { status: "not_started", progress: 0 }
                }
                isUnlocked={isModuleUnlocked(index)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
