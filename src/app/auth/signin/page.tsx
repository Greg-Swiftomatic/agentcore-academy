"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export default function SignInPage() {
  const { user, isLoading, isConfigured, signInWithGoogle, signInWithGitHub } = useAuth();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
      {/* Decorative corners */}
      <div className="fixed top-6 left-6 w-24 h-24 border-l border-t border-border-dashed" />
      <div className="fixed top-6 right-6 w-24 h-24 border-r border-t border-border-dashed" />
      <div className="fixed bottom-6 left-6 w-24 h-24 border-l border-b border-border-dashed" />
      <div className="fixed bottom-6 right-6 w-24 h-24 border-r border-b border-border-dashed" />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="lg" />
          </Link>
        </div>

        {/* Sign In Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="badge badge-cyan mb-4">
              <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
              Authentication Required
            </span>
            <h1 className="font-display text-2xl text-text-primary mb-2">
              Initialize Session
            </h1>
            <p className="text-text-secondary text-sm">
              Connect your account to begin training
            </p>
          </div>

          {/* Configuration Warning */}
          {!isConfigured && (
            <div className="mb-6 p-4 border border-warning/50 bg-warning/10 text-sm">
              <p className="text-warning font-bold mb-2">Setup Required</p>
              <p className="text-text-secondary">
                Run <code className="bg-bp-deep px-1">npx ampx sandbox</code> to start the Amplify backend, then configure Google OAuth credentials.
              </p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-8">
            {/* Google Sign In */}
            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 font-body font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors relative group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGoogleSignIn}
              disabled={!isConfigured || isLoading}
            >
              {/* Corner cuts */}
              <span className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-t-bp-primary border-l-[10px] border-l-transparent" />
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* GitHub Sign In */}
            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0d1117] border border-[#30363d] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[#161b22] hover:border-cyan transition-colors relative group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGitHubSignIn}
              disabled={!isConfigured || isLoading}
            >
              {/* Corner cuts */}
              <span className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-t-bp-primary border-l-[10px] border-l-transparent" />
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="divider mb-8" />

          {/* Benefits */}
          <div className="schematic-box" data-label="SYSTEM BENEFITS">
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 border border-success flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-secondary">Save your progress across devices</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 border border-success flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-secondary">AI tutor remembers your learning context</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 border border-success flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-secondary">Take notes and bookmark lessons</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 border border-success flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-text-secondary">Track comprehension check results</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-text-muted text-sm hover:text-cyan transition-colors inline-flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Return to home base
          </Link>
        </div>
      </div>
    </div>
  );
}
