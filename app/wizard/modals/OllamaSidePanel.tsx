'use client';

import React from 'react';

type OllamaSettings = {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
};

interface OllamaSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanding: boolean;
  result: string;
  error: string | null;
  originalPrompt: string;
  ollamaSettings: OllamaSettings;
  availableModels: string[];
  isPulling: boolean;
  pullProgress: string | null;
  onApplyResult: () => void;
  onPullModelAndRetry: (model: string) => void;
  onShowToast: (message: string) => void;
}

export default function OllamaSidePanel({
  isOpen,
  onClose,
  isExpanding,
  result,
  error,
  originalPrompt,
  ollamaSettings,
  availableModels,
  isPulling,
  pullProgress,
  onApplyResult,
  onPullModelAndRetry,
  onShowToast,
}: OllamaSidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="ollama-sidepanel">
      <div className="ollama-sidepanel-header">
        <div>
          <h3>Ollama Expansion</h3>
          <p className="hint">{isExpanding ? 'Streaming...' : 'Completed'}</p>
        </div>
        <button
          type="button"
          className="ghost"
          onClick={onClose}
          title="Close panel"
          aria-label="Close Ollama expansion panel"
        >
          ✕
        </button>
      </div>

      {error ? (
        <div className="ollama-sidepanel-body">
          <div className="error-box">
            <p>
              <strong>Error:</strong> {error}
            </p>
            <p className="hint">Make sure Ollama is running at {ollamaSettings.apiEndpoint}</p>
            {!availableModels.includes(ollamaSettings.model) && (
              <div className="settings-actions">
                <button
                  className="primary"
                  type="button"
                  onClick={() => onPullModelAndRetry(ollamaSettings.model)}
                  disabled={isPulling}
                  title="Pull model and retry"
                  aria-label="Pull model and retry expansion"
                >
                  {isPulling ? 'Pulling…' : 'Pull Model & Retry'}
                </button>
                {pullProgress && <p className="hint pull-progress-hint">{pullProgress}</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="ollama-sidepanel-body">
          <div className="ollama-comparison">
            <div className="ollama-section">
              <div className="ollama-section-header">
                <span className="ollama-section-title">Original Prompt</span>
                <button
                  type="button"
                  className="ghost small"
                  onClick={() => {
                    navigator.clipboard.writeText(originalPrompt);
                    onShowToast('Original copied');
                  }}
                  title="Copy original prompt"
                  aria-label="Copy original prompt to clipboard"
                >
                  📋
                </button>
              </div>
              <div className="ollama-prompt-box">{originalPrompt}</div>
            </div>

            <div className="ollama-section">
              <div className="ollama-section-header">
                <span className="ollama-section-title">
                  Expanded Prompt
                  {isExpanding && <span className="ollama-streaming-indicator"> ●</span>}
                </span>
                <button
                  type="button"
                  className="ghost small"
                  onClick={onApplyResult}
                  disabled={!result || isExpanding}
                  title="Apply expanded prompt"
                  aria-label="Apply expanded prompt to current prompt"
                >
                  📋
                </button>
              </div>
              <div className="ollama-prompt-box ollama-expanded">
                {result || (isExpanding ? 'Generating...' : 'No result yet')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
