"use client";

import { useState } from "react";

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey?: string | null;
}

export function APIKeyModal({ isOpen, onClose, onSave, currentKey }: APIKeyModalProps) {
  const [inputValue, setInputValue] = useState(currentKey || "");
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      onClose();
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSave("");
    onClose();
  };

  const isValid = inputValue.startsWith("sk-") && inputValue.length > 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-bp-deep/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md mx-4 border border-border bg-bp-primary">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="font-display text-sm uppercase tracking-wider text-text-primary">
              API Key Settings
            </span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-text-secondary mb-4">
              Enter your OpenRouter API key to enable the AI tutor. Your key is stored locally in your browser and never sent to our servers.
            </p>
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
            >
              Get a key from OpenRouter
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-3 py-2 pr-10 bg-bp-deep border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showKey ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {inputValue && !isValid && (
              <p className="text-xs text-error">
                Invalid key format. Key should start with &quot;sk-&quot;
              </p>
            )}
          </div>

          <div className="schematic-box text-xs text-text-muted" data-label="NOTE">
            <p>
              The AI tutor uses <strong className="text-cyan">GLM-4</strong> via OpenRouter. 
              Typical cost: ~$0.001-0.01 per conversation turn.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          {currentKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-error hover:underline"
            >
              Remove Key
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs border border-border-subtle text-text-muted hover:text-text-primary hover:border-border transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="btn btn-primary py-2 px-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
