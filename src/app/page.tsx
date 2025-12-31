import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Logo } from "@/components/Logo";

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card card-interactive group">
      <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Module preview card
function ModuleCard({
  number,
  title,
  duration,
  lessons,
}: {
  number: string;
  title: string;
  duration: string;
  lessons: number;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-bg-secondary/50 border border-border-subtle hover:border-border transition-colors group">
      <div className="w-10 h-10 rounded-md bg-accent-muted flex items-center justify-center flex-shrink-0 font-display text-accent font-semibold group-hover:bg-accent group-hover:text-bg-primary transition-colors">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-medium text-text-primary group-hover:text-accent transition-colors">
          {title}
        </h4>
        <p className="text-text-muted text-sm mt-1">
          {lessons} lessons · {duration}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen grain">
      <Navigation user={null} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="stagger-children">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="badge badge-accent">
                Powered by Amazon Bedrock
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center mb-6">
              <span className="block text-text-primary">Master</span>
              <span className="block text-accent glow-text">
                Amazon Bedrock AgentCore
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-center text-text-secondary text-xl max-w-2xl mx-auto mb-12 font-body">
              Deep, practical knowledge of AI agent development on AWS.
              Learn from structured curriculum with an AI tutor that adapts to your pace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/auth/signin" className="btn btn-primary text-lg px-8 py-4">
                Start Learning Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="#curriculum" className="btn btn-secondary text-lg px-8 py-4">
                View Curriculum
              </Link>
            </div>

            {/* Terminal Preview */}
            <div className="terminal-window max-w-3xl mx-auto shadow-lg">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red"></div>
                <div className="terminal-dot terminal-dot-yellow"></div>
                <div className="terminal-dot terminal-dot-green"></div>
                <span className="ml-4 text-text-muted text-sm font-mono">ai-tutor</span>
              </div>
              <div className="terminal-body text-text-secondary">
                <p className="mb-3">
                  <span className="text-accent">tutor $</span>{" "}
                  <span className="text-text-primary">explain how agents decide which tools to use</span>
                </p>
                <p className="text-text-primary leading-relaxed">
                  Great question! When an agent receives a task, it follows a
                  <span className="text-accent"> reasoning loop</span> to select the right tool.
                  Let me break this down...
                </p>
                <p className="mt-3 text-text-muted animate-pulse">▋</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">Why AgentCore Academy?</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Not another surface-level tutorial. Deep understanding through
              structured learning and AI-powered guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Structured Curriculum"
              description="8 modules covering everything from basics to production deployment. Learn in the right order with clear prerequisites."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="AI Tutor"
              description="Ask questions anytime. Get explanations tailored to your level. The tutor remembers what you've learned."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Comprehension Checks"
              description="Verify your understanding before moving on. Questions that test real comprehension, not memorization."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }
              title="Real Code Examples"
              description="Learn from the official AWS samples repository. Every concept illustrated with production-ready code."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Practical Focus"
              description="Build a working agent by Module 4. Security, operations, and deployment covered in depth."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Track Progress"
              description="See exactly where you are. Bookmark lessons. Take notes. Pick up right where you left off."
            />
          </div>
        </div>
      </section>

      {/* Curriculum Preview Section */}
      <section id="curriculum" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">The Curriculum</h2>
            <p className="text-text-secondary text-lg">
              From zero to production-ready AI agents in 8 modules.
            </p>
          </div>

          <div className="grid gap-3">
            <ModuleCard
              number="01"
              title="Introduction to AgentCore"
              duration="45 min"
              lessons={3}
            />
            <ModuleCard
              number="02"
              title="Core Services Deep Dive"
              duration="90 min"
              lessons={4}
            />
            <ModuleCard
              number="03"
              title="Agent Design Patterns"
              duration="75 min"
              lessons={3}
            />
            <ModuleCard
              number="04"
              title="Hands-On: Build Your First Agent"
              duration="60 min"
              lessons={3}
            />
            <ModuleCard
              number="05"
              title="Security & IAM"
              duration="60 min"
              lessons={3}
            />
            <ModuleCard
              number="06"
              title="Operations & Optimization"
              duration="60 min"
              lessons={3}
            />
            <ModuleCard
              number="07"
              title="Advanced Topics"
              duration="75 min"
              lessons={3}
            />
            <ModuleCard
              number="08"
              title="Production Deployment"
              duration="60 min"
              lessons={3}
            />
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/signin" className="btn btn-primary text-lg px-8 py-4">
              Start Module 1 Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="mb-6">Ready to master AI agents?</h2>
          <p className="text-text-secondary text-lg mb-8">
            Join developers building the next generation of AI applications with Amazon Bedrock AgentCore.
          </p>
          <Link href="/auth/signin" className="btn btn-primary text-lg px-8 py-4">
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-text-muted text-sm">
              Built for learning Amazon Bedrock AgentCore
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/awslabs/amazon-bedrock-agentcore-samples"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
