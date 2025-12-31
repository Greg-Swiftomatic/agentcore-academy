import Link from "next/link";
import { Navigation } from "@/components/Navigation";

// Mock data - replace with real data from DynamoDB
const mockUser = {
  name: "Developer",
  avatarUrl: undefined,
};

const mockProgress = {
  currentModule: {
    id: "02-core-services",
    title: "Core Services Deep Dive",
    currentLesson: "02-runtime-service",
    currentLessonTitle: "Runtime Service",
    progress: 35,
  },
  completedModules: 1,
  totalModules: 8,
  streak: 3,
  totalTime: "2h 15m",
};

// Progress ring component
function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-text-primary">
          {progress}%
        </span>
        <span className="text-text-muted text-sm">Complete</span>
      </div>
    </div>
  );
}

// Stat card component
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
    <div className="bg-bg-secondary/50 border border-border-subtle rounded-lg p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <p className="text-text-muted text-sm">{label}</p>
        <p className="font-display text-xl font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

// Recent module card
function RecentModuleCard({
  number,
  title,
  status,
  progress,
}: {
  number: string;
  title: string;
  status: "completed" | "in_progress" | "locked";
  progress?: number;
}) {
  const statusStyles = {
    completed: "border-success/30 bg-success/5",
    in_progress: "border-accent/30 bg-accent/5",
    locked: "border-border-subtle bg-bg-secondary/30 opacity-60",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${statusStyles[status]} transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-semibold text-accent">
            {number}
          </span>
          <span className="font-display text-sm font-medium text-text-primary">
            {title}
          </span>
        </div>
        {status === "completed" && (
          <svg
            className="w-5 h-5 text-success"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {status === "locked" && (
          <svg
            className="w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        )}
      </div>
      {progress !== undefined && status !== "locked" && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen grain">
      <Navigation user={mockUser} />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-3xl mb-2">
              Welcome back, <span className="text-accent">{mockUser.name}</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Continue your AgentCore journey
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Continue Learning Card */}
              <div className="card bg-gradient-to-br from-bg-secondary to-bg-tertiary border-accent/20">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-text-muted text-sm mb-1">Continue Learning</p>
                    <h2 className="text-xl font-display font-semibold">
                      {mockProgress.currentModule.title}
                    </h2>
                    <p className="text-accent text-sm mt-1">
                      {mockProgress.currentModule.currentLessonTitle}
                    </p>
                  </div>
                  <span className="badge badge-accent">In Progress</span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-muted">Module Progress</span>
                    <span className="text-text-primary font-display">
                      {mockProgress.currentModule.progress}%
                    </span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${mockProgress.currentModule.progress}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/learn/${mockProgress.currentModule.id}/${mockProgress.currentModule.currentLesson}`}
                  className="btn btn-primary w-full"
                >
                  Continue Lesson
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>

              {/* Module Progress */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Your Progress</h3>
                  <Link
                    href="/curriculum"
                    className="text-accent text-sm hover:underline"
                  >
                    View Full Curriculum
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <RecentModuleCard
                    number="01"
                    title="Introduction"
                    status="completed"
                    progress={100}
                  />
                  <RecentModuleCard
                    number="02"
                    title="Core Services"
                    status="in_progress"
                    progress={35}
                  />
                  <RecentModuleCard
                    number="03"
                    title="Agent Patterns"
                    status="locked"
                  />
                  <RecentModuleCard
                    number="04"
                    title="Hands-On Build"
                    status="locked"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="card text-center">
                <h3 className="font-display text-sm font-semibold text-text-muted mb-6">
                  Overall Progress
                </h3>
                <div className="flex justify-center mb-4">
                  <ProgressRing
                    progress={Math.round(
                      (mockProgress.completedModules / mockProgress.totalModules) * 100
                    )}
                  />
                </div>
                <p className="text-text-secondary text-sm">
                  {mockProgress.completedModules} of {mockProgress.totalModules} modules
                  completed
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <StatCard
                  label="Learning Streak"
                  value={`${mockProgress.streak} days`}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Time Spent"
                  value={mockProgress.totalTime}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Modules Done"
                  value={`${mockProgress.completedModules}/${mockProgress.totalModules}`}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="font-display text-sm font-semibold text-text-muted mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/curriculum"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      Browse Curriculum
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      Settings
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
