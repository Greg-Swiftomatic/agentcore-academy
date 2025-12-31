import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Logo } from "@/components/Logo";

// Blueprint Feature Card
function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card card-interactive group">
      {/* Number label */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 border border-dashed border-border-dashed flex items-center justify-center text-xs font-bold text-cyan">
          {number}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-border-dashed to-transparent" />
      </div>
      
      <h3 className="font-display text-lg text-text-primary mb-3 group-hover:text-cyan transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
      
      {/* Annotation */}
      <span className="annotation absolute -bottom-2 -right-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        explore →
      </span>
    </div>
  );
}

// Module Blueprint Card
function ModuleCard({
  number,
  title,
  duration,
  lessons,
  status = "locked",
}: {
  number: string;
  title: string;
  duration: string;
  lessons: number;
  status?: "completed" | "active" | "locked";
}) {
  const statusColors = {
    completed: "border-success text-success",
    active: "border-cyan text-cyan animate-pulse-glow",
    locked: "border-border-subtle text-text-muted",
  };

  return (
    <div className="flex items-center gap-4 py-4 px-5 border border-border-subtle hover:border-border transition-colors group relative">
      {/* Connection line */}
      <div className="absolute left-0 top-1/2 w-3 h-px bg-border-dashed -translate-x-full" />
      
      {/* Node */}
      <div className={`node ${status === "completed" ? "completed" : status === "active" ? "active" : ""}`} />
      
      {/* Number */}
      <span className={`font-body text-xs font-bold ${statusColors[status]}`}>
        {number}
      </span>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-body text-sm font-bold text-text-primary group-hover:text-cyan transition-colors truncate">
          {title}
        </h4>
        <p className="text-text-muted text-xs mt-0.5">
          {lessons} modules · {duration}
        </p>
      </div>
      
      {/* Status indicator */}
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
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen relative z-10">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        {/* Decorative corner marks */}
        <div className="absolute top-24 left-6 w-16 h-16 border-l border-t border-border-dashed" />
        <div className="absolute top-24 right-6 w-16 h-16 border-r border-t border-border-dashed" />
        
        <div className="max-w-5xl mx-auto">
          <div className="stagger">
            {/* Label */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-px w-12 bg-border-dashed" />
              <span className="badge badge-cyan">
                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
                Powered by Amazon Bedrock
              </span>
              <span className="h-px w-12 bg-border-dashed" />
            </div>

            {/* Headline */}
            <h1 className="text-center mb-6">
              <span className="block text-text-primary">Build</span>
              <span className="block text-cyan glow-cyan">AI Agents</span>
            </h1>
            
            {/* Annotation */}
            <div className="flex justify-center mb-8">
              <span className="annotation text-2xl">
                master the blueprints
              </span>
            </div>

            {/* Subheadline */}
            <p className="text-center text-text-secondary max-w-xl mx-auto mb-12 leading-relaxed">
              Deep, systematic knowledge of Amazon Bedrock AgentCore.
              Structured curriculum with AI tutoring that adapts to your learning.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/auth/signin" className="btn btn-primary">
                <span>Begin Training</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="#curriculum" className="btn btn-secondary">
                <span>View Schematics</span>
              </Link>
            </div>

            {/* Terminal Preview */}
            <div className="terminal max-w-2xl mx-auto">
              <div className="terminal-header">
                <div className="terminal-dot bg-error" />
                <div className="terminal-dot bg-warning" />
                <div className="terminal-dot bg-success" />
                <span className="ml-4 text-text-muted text-xs font-body tracking-wider">
                  AI_TUTOR_v1.0
                </span>
              </div>
              <div className="terminal-body text-text-secondary">
                <p className="mb-2">
                  <span className="text-cyan">$</span>{" "}
                  <span className="text-text-primary">tutor.explain(&quot;tool_selection&quot;)</span>
                </p>
                <p className="text-text-primary leading-relaxed">
                  <span className="text-success">&gt;</span> When an agent receives a task, it enters a{" "}
                  <span className="text-cyan">reasoning loop</span> to select appropriate tools.
                  Let me draw the decision flow...
                </p>
                <p className="mt-2">
                  <span className="text-text-muted">│</span>
                </p>
                <p className="text-cyan cursor">_</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-dashed to-transparent" />
        
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="blueprint-label mb-4">System Features</span>
            <h2 className="text-text-primary mb-4">Technical Specifications</h2>
            <p className="text-text-secondary max-w-xl">
              Not surface-level tutorials. Deep architectural understanding through
              structured learning and adaptive AI guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              number="01"
              title="Structured Curriculum"
              description="8 modules from fundamentals to production deployment. Sequential prerequisites ensure solid foundations."
            />
            <FeatureCard
              number="02"
              title="AI Tutor System"
              description="Context-aware explanations that adapt to your level. Ask questions anytime, get precise answers."
            />
            <FeatureCard
              number="03"
              title="Comprehension Checks"
              description="Verify understanding before advancing. Questions test real comprehension, not memorization."
            />
            <FeatureCard
              number="04"
              title="Production Code"
              description="Learn from official AWS samples. Every concept illustrated with deployment-ready examples."
            />
            <FeatureCard
              number="05"
              title="Hands-On Building"
              description="Construct a working agent by Module 4. Security and operations covered in depth."
            />
            <FeatureCard
              number="06"
              title="Progress Tracking"
              description="Bookmark lessons, take notes, track completion. Resume exactly where you stopped."
            />
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="blueprint-label justify-center mb-4">Training Program</span>
            <h2 className="text-text-primary mb-4">Curriculum Blueprint</h2>
            <p className="text-text-secondary">
              Zero to production-ready in 8 systematic modules.
            </p>
          </div>

          {/* Curriculum schematic */}
          <div className="schematic-box relative" data-label="MODULE SEQUENCE">
            {/* Vertical connection line */}
            <div className="absolute left-8 top-12 bottom-8 w-px border-l border-dashed border-border-dashed" />
            
            <div className="space-y-1 pl-4">
              <ModuleCard
                number="01"
                title="Introduction to AgentCore"
                duration="45 min"
                lessons={3}
                status="active"
              />
              <ModuleCard
                number="02"
                title="Core Services Deep Dive"
                duration="90 min"
                lessons={4}
                status="locked"
              />
              <ModuleCard
                number="03"
                title="Agent Design Patterns"
                duration="75 min"
                lessons={3}
                status="locked"
              />
              <ModuleCard
                number="04"
                title="Hands-On: Build Your Agent"
                duration="60 min"
                lessons={3}
                status="locked"
              />
              <ModuleCard
                number="05"
                title="Security & IAM"
                duration="60 min"
                lessons={3}
                status="locked"
              />
              <ModuleCard
                number="06"
                title="Operations & Optimization"
                duration="60 min"
                lessons={3}
                status="locked"
              />
              <ModuleCard
                number="07"
                title="Advanced Topics"
                duration="75 min"
                lessons={3}
                status="locked"
              />
              <ModuleCard
                number="08"
                title="Production Deployment"
                duration="60 min"
                lessons={3}
                status="locked"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/signin" className="btn btn-primary">
              <span>Start Module 01</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-bp-secondary/50 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="mb-8">
            <Logo size="lg" showText={false} />
          </div>
          
          <h2 className="text-text-primary mb-4">Ready to Begin?</h2>
          
          <p className="annotation text-xl mb-8">
            join the next generation of AI builders
          </p>
          
          <Link href="/auth/signin" className="btn btn-primary">
            <span>Initialize Training Sequence</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            
            <p className="text-text-muted text-xs tracking-wider uppercase">
              Amazon Bedrock AgentCore Training System
            </p>
            
            <a
              href="https://github.com/awslabs/amazon-bedrock-agentcore-samples"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-cyan transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
