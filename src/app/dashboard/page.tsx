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
}: {
  number: string;
  title: string;
  status: "completed" | "in_progress" | "locked";
  progress?: number;
}) {
  const statusStyles = {
    completed: "border-success",
    in_progress: "border-cyan animate-pulse-glow",
    locked: "border-border-subtle opacity-60",
  };

  return (
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
        {status === "locked" && (
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
  const overallProgress = Math.round((mockProgress.completedModules / mockProgress.totalModules) * 100);

  return (
    <div className="min-h-screen relative z-10">
      <Navigation user={mockUser} />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12 relative">
            {/* Decorative line */}
            <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan via-border-dashed to-transparent" />
            
            <span className="blueprint-label mb-4">Control Panel</span>
            <h1 className="mb-2">
              <span className="text-text-primary">Welcome back, </span>
              <span className="text-cyan glow-cyan">{mockUser.name}</span>
            </h1>
            <p className="text-text-secondary">
              Continue your AgentCore training sequence
            </p>
          </div>

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
                      Active Training Module
                    </p>
                    <h2 className="font-display text-xl text-text-primary mb-1">
                      {mockProgress.currentModule.title}
                    </h2>
                    <p className="text-cyan text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                      {mockProgress.currentModule.currentLessonTitle}
                    </p>
                  </div>
                  <span className="badge badge-cyan">
                    <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                    In Progress
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-muted uppercase tracking-wider">Module Progress</span>
                    <span className="text-cyan font-bold">
                      {mockProgress.currentModule.progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
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
                  <span>Resume Training</span>
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
                    <ModuleCard
                      number="01"
                      title="Introduction"
                      status="completed"
                      progress={100}
                    />
                    <ModuleCard
                      number="02"
                      title="Core Services"
                      status="in_progress"
                      progress={35}
                    />
                    <ModuleCard
                      number="03"
                      title="Agent Patterns"
                      status="locked"
                    />
                    <ModuleCard
                      number="04"
                      title="Hands-On Build"
                      status="locked"
                    />
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
                  <span className="text-cyan font-bold">{mockProgress.completedModules}</span>
                  <span className="text-text-muted"> of </span>
                  <span className="text-text-primary">{mockProgress.totalModules}</span>
                  <span className="text-text-muted"> modules completed</span>
                </p>
              </div>

              {/* Stats */}
              <div className="schematic-box space-y-3" data-label="METRICS">
                <StatCard
                  label="Learning Streak"
                  value={`${mockProgress.streak} days`}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  }
                />
                <StatCard
                  label="Time Invested"
                  value={mockProgress.totalTime}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  label="Modules Done"
                  value={`${mockProgress.completedModules}/${mockProgress.totalModules}`}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
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
                    href="/settings"
                    className="flex items-center gap-3 p-3 hover:bg-bp-secondary/50 transition-colors group"
                  >
                    <svg className="w-4 h-4 text-text-muted group-hover:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-text-secondary group-hover:text-cyan transition-colors">
                      System Settings
                    </span>
                    <svg className="w-3 h-3 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
