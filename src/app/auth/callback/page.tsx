"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");

    if (errorParam) {
      setError(errorDescription || errorParam);
      return;
    }

    // Wait for auth to complete, then redirect
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        // If no user after loading, something went wrong
        // Give it a moment as the Hub listener might still be processing
        const timer = setTimeout(() => {
          if (!user) {
            router.push("/auth/signin");
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <div className="w-16 h-16 border border-dashed border-error mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="font-display text-2xl text-text-primary mb-4">
            Authentication Failed
          </h1>
          
          <p className="text-text-secondary mb-6">
            {error}
          </p>
          
          <button
            onClick={() => router.push("/auth/signin")}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg
            className="w-6 h-6 animate-spin text-cyan"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-text-secondary font-display">
            Completing authentication...
          </span>
        </div>
        
        <p className="text-text-muted text-sm">
          You&apos;ll be redirected to your dashboard shortly.
        </p>
      </div>
    </div>
  );
}
