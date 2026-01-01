"use client";

import { useState, useEffect, useCallback } from "react";

const API_KEY_STORAGE_KEY = "agentcore-academy-openrouter-key";

export function useAPIKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
      setApiKeyState(stored);
    } catch (e) {
      console.warn("Failed to read API key from localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    try {
      if (key) {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
      } else {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
      setApiKeyState(key);
    } catch (e) {
      console.warn("Failed to save API key to localStorage:", e);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey(null);
  }, [setApiKey]);

  const isValidKeyFormat = useCallback((key: string): boolean => {
    return key.startsWith("sk-") && key.length > 20;
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    isLoading,
    hasApiKey: !!apiKey,
    isValidKeyFormat,
  };
}
