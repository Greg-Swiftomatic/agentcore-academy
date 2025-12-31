"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Amplify } from "aws-amplify";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  AuthUser,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

// Configure Amplify - try to load outputs if available
function configureAmplify() {
  try {
    // Dynamic import of amplify outputs - file may not exist yet
    // eslint-disable-next-line
    const outputs = require("../../amplify_outputs.json");
    Amplify.configure(outputs, { ssr: true });
    return true;
  } catch {
    console.warn(
      "Amplify outputs not found. Run `npx ampx sandbox` to generate configuration."
    );
    return false;
  }
}

// Initialize on module load
const isConfigured = configureAmplify();

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function mapAuthUserToUser(authUser: AuthUser): Promise<User> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    
    // Extract user info from token claims
    const claims = idToken?.payload || {};
    
    return {
      id: authUser.userId,
      email: (claims.email as string) || "",
      name: (claims.name as string) || (claims.email as string) || "User",
      avatarUrl: claims.picture as string | undefined,
    };
  } catch {
    return {
      id: authUser.userId,
      email: "",
      name: "User",
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for current user on mount
    checkUser();

    // Listen for auth events
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          await checkUser();
          break;
        case "signedOut":
          setUser(null);
          break;
        case "tokenRefresh":
          await checkUser();
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  async function checkUser() {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const authUser = await getCurrentUser();
      const mappedUser = await mapAuthUserToUser(authUser);
      setUser(mappedUser);
    } catch {
      // Not signed in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!isConfigured) {
      console.error("Amplify not configured. Run `npx ampx sandbox` first.");
      return;
    }
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  }

  async function signInWithGitHub() {
    if (!isConfigured) {
      console.error("Amplify not configured. Run `npx ampx sandbox` first.");
      return;
    }
    // Note: GitHub requires additional setup in Amplify auth config
    // For now, we'll show an alert if not configured
    console.error("GitHub sign in not yet configured");
    alert("GitHub sign-in coming soon! Please use Google for now.");
  }

  async function logout() {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        signInWithGoogle,
        signInWithGitHub,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
