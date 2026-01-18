'use client';

import React from 'react';
import ToolsMenu from './ToolsMenu';

type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';

type UiPrefs = {
  typingEnabled: boolean;
  typingSpeedMs: number;
  captureWord: 'shot' | 'video' | 'clip' | 'frame' | 'photo';
  autoCopyOnReview: boolean;
  promptFormat: 'ltx2' | 'paragraph';
  detailLevel: 'minimal' | 'balanced' | 'rich';
  autoFillAudio: boolean;
  autoFillCamera: boolean;
  previewFontScale: number;
  hideNsfw: boolean;
};

type OllamaSettings = {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
};

interface TopBarProps {
  step: number;
  onStepChange: (step: number) => void;
  mode: ModeId;
  onModeChange: (mode: ModeId) => void;
  uiPrefs: UiPrefs;
  previewOpen: boolean;
  onPreviewToggle: () => void;
  isStepLocked: (step: number) => boolean;
  onToggleStepLock: (step: number) => void;
  onRandomizeStep: () => void;
  onRandomizeAll: () => void;
  onResetStep: () => void;
  onResetWizard: () => void;
  onOpenProjects: () => void;
  onOpenCSVBuilder: () => void;
  onOpenSettings: () => void;
  onOpenPresetCreator: () => void;
  onOpenTemplates: () => void;
  onOpenBatch: () => void;
  onOpenHistory: () => void;
  onExpandWithOllama: () => void;
  ollamaExpanding: boolean;
  ollamaSettings: OllamaSettings;
  steps: number[];
  modes: Array<{ id: ModeId; title: string }>;
  stepTitle: (step: number) => string;
  onShowToast: (message: string) => void;
  completedSteps?: Set<number>;
  hasUnsavedChanges?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSaveChat?: () => void;
  chatSessionUnsaved?: boolean;
  onToggleChatHistory?: () => void;
  chatHistoryOpen?: boolean;
  ollamaConnected?: boolean;
  checkingConnection?: boolean;
  ollamaPaused?: boolean;
  onStopOllama?: () => void;
  onResumeOllama?: () => void;
}

export default function TopBar({
  step,
  onStepChange,
  mode,
  onModeChange,
  uiPrefs,
  previewOpen,
  onPreviewToggle,
  isStepLocked,
  onToggleStepLock,
  onRandomizeStep,
  onRandomizeAll,
  onResetStep,
  onResetWizard,
  onOpenProjects,
  onOpenCSVBuilder,
  onOpenSettings,
  onOpenPresetCreator,
  onOpenTemplates,
  onOpenBatch,
  onOpenHistory,
  onExpandWithOllama,
  ollamaExpanding,
  ollamaSettings,
  steps,
  modes,
  stepTitle,
  onShowToast,
  completedSteps = new Set(),
  hasUnsavedChanges = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSaveChat,
  chatSessionUnsaved = false,
  onToggleChatHistory,
  chatHistoryOpen = false,
  ollamaConnected = false,
  checkingConnection = false,
  ollamaPaused = false,
  onStopOllama,
  onResumeOllama,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-title">
            LTXV Prompt Creator
            {hasUnsavedChanges && (
              <span className="unsaved-dot" title="Unsaved changes" aria-label="Unsaved changes">●</span>
            )}
            {ollamaSettings.enabled && (
              <span 
                className={`ollama-status ${checkingConnection ? 'checking' : ollamaConnected ? 'connected' : 'disconnected'}`}
                title={checkingConnection ? 'Checking Ollama connection...' : ollamaConnected ? 'Ollama connected' : 'Ollama disconnected'}
                aria-label={checkingConnection ? 'Checking connection' : ollamaConnected ? 'Connected' : 'Disconnected'}
              >
                {checkingConnection ? '○' : ollamaConnected ? '●' : '○'}
              </span>
            )}
            {ollamaSettings.enabled && (ollamaPaused ? (
              <button
                type="button"
                className="ollama-control-btn resume"
                onClick={onResumeOllama}
                title="Resume Ollama AI features"
                aria-label="Resume Ollama"
              >
                ▶
              </button>
            ) : (
              <button
                type="button"
                className="ollama-control-btn stop"
                onClick={onStopOllama}
                title="Stop Ollama and free memory"
                aria-label="Stop Ollama"
              >
                ■
              </button>
            ))}
          </div>
          <div className="completion-indicator">
            {completedSteps.size} / {steps.length} steps complete
          </div>
        </div>
        <div className="topbar-actions">
          <div className="topbar-group">
            <label className="step-selector" aria-label="Jump to step">
              <span className="step-label">Step</span>
              <select
                value={String(step)}
                onChange={(e) => onStepChange(Number(e.target.value))}
                aria-label="Jump to step"
              >
                {steps.map((n) => (
                  <option key={n} value={String(n)}>
                    {completedSteps.has(n) ? '✓ ' : '○ '}Step {n} — {stepTitle(n)}
                  </option>
                ))}
              </select>
            </label>
            <label className="step-selector" aria-label="Select mode">
              <span className="step-label">Mode</span>
              <select
                value={mode}
                onChange={(e) => {
                  const next = e.target.value as ModeId;
                  onModeChange(next);
                }}
                aria-label="Select mode"
              >
                {modes
                  .filter((m) => !(uiPrefs.hideNsfw && m.id === 'nsfw'))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="topbar-group">
            <button
              className="icon-btn"
              type="button"
              title="Randomize this step"
              onClick={onRandomizeStep}
              aria-label="Randomize current step"
            >
              🎲
            </button>
            <button
              className={`icon-btn ${isStepLocked(step) ? 'locked' : ''}`}
              type="button"
              title={
                isStepLocked(step)
                  ? 'Unlock this step from randomization'
                  : 'Lock this step from randomization'
              }
              onClick={() => onToggleStepLock(step)}
              aria-label={`Step lock: ${isStepLocked(step) ? 'locked' : 'unlocked'}`}
            >
              {isStepLocked(step) ? '🔒' : '🔓'}
            </button>
            <button
              className="icon-btn"
              type="button"
              title="Randomize all steps"
              onClick={onRandomizeAll}
              aria-label="Randomize all steps"
            >
              🔀
            </button>
            <button
              className="icon-btn"
              type="button"
              title="Undo (Ctrl+Z)"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo last action"
            >
              ↶
            </button>
            <button
              className="icon-btn"
              type="button"
              title="Redo (Ctrl+Y)"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo action"
            >
              ↷
            </button>
            <button
              className="icon-btn"
              type="button"
              title="Reset this step"
              onClick={onResetStep}
              aria-label="Reset current step to default"
            >
              ⟲
            </button>
            <button
              className="icon-btn"
              type="button"
              title="Reset entire wizard"
              onClick={onResetWizard}
              aria-label="Reset entire wizard"
            >
              ⟲
            </button>
          </div>

          <div className="topbar-group">
            <ToolsMenu
              onOpenSettings={onOpenSettings}
              onOpenPresetCreator={onOpenPresetCreator}
              previewOpen={previewOpen}
              onPreviewToggle={onPreviewToggle}
              onOpenProjects={onOpenProjects}
              onOpenTemplates={onOpenTemplates}
              onOpenBatch={onOpenBatch}
              onOpenHistory={onOpenHistory}
              chatHistoryOpen={chatHistoryOpen}
              onToggleChatHistory={onToggleChatHistory || (() => {})}
              chatSessionUnsaved={chatSessionUnsaved}
              onSaveChat={onSaveChat || (() => {})}
              onExpandWithOllama={onExpandWithOllama}
              ollamaExpanding={ollamaExpanding}
              onOpenCSVBuilder={onOpenCSVBuilder}
            />
            <span
              className="ollama-model-indicator"
              aria-live="polite"
              title={
                ollamaSettings.enabled
                  ? 'Connected to Ollama'
                  : 'Ollama disabled'
              }
              aria-label={`Ollama status: ${
                ollamaSettings.enabled ? 'connected' : 'disabled'
              }`}
            >
              {ollamaSettings.enabled ? '🤖' : '⊘'} {ollamaSettings.model}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
