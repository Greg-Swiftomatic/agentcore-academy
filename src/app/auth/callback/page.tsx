"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // This will handle the OAuth callback with Amplify
    // For now, simulate a redirect after authentication
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen grain flex items-center justify-center p-6">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg
            className="w-6 h-6 animate-spin text-accent"
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
            Completing sign in...
          </span>
        </div>
        
        <p className="text-text-muted text-sm">
          You&apos;ll be redirected to your dashboard shortly.
        </p>
      </div>
    </div>
  );
}
