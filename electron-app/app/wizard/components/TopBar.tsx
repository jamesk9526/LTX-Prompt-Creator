'use client';

import React from 'react';

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
  nsfwEnabled: boolean;
  onNsfwToggle: () => void;
  isStepLocked: (step: number) => boolean;
  onToggleStepLock: (step: number) => void;
  onRandomizeStep: () => void;
  onRandomizeAll: () => void;
  onResetStep: () => void;
  onResetWizard: () => void;
  onOpenProjects: () => void;
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
}

export default function TopBar({
  step,
  onStepChange,
  mode,
  onModeChange,
  uiPrefs,
  previewOpen,
  onPreviewToggle,
  nsfwEnabled,
  onNsfwToggle,
  isStepLocked,
  onToggleStepLock,
  onRandomizeStep,
  onRandomizeAll,
  onResetStep,
  onResetWizard,
  onOpenProjects,
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
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-title">LTXV Prompt Creator</div>
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
                    Step {n} — {stepTitle(n)}
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
              className={`icon-btn ${!uiPrefs.hideNsfw ? (nsfwEnabled ? 'active' : '') : 'disabled'}`}
              type="button"
              title={
                uiPrefs.hideNsfw
                  ? 'NSFW is hidden'
                  : nsfwEnabled
                  ? 'Disable NSFW'
                  : 'Enable NSFW'
              }
              onClick={() => {
                if (!uiPrefs.hideNsfw) {
                  onNsfwToggle();
                  onShowToast(nsfwEnabled ? '🔒 NSFW disabled' : '🔓 NSFW enabled');
                }
              }}
              disabled={uiPrefs.hideNsfw}
              aria-label={`Toggle NSFW mode: currently ${nsfwEnabled ? 'enabled' : 'disabled'}`}
            >
              {uiPrefs.hideNsfw ? '⊘' : nsfwEnabled ? '🔞' : '🚫'}
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
              title="Reset this step"
              onClick={onResetStep}
              aria-label="Reset current step to default"
            >
              ↶
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
            <button
              className="ghost"
              type="button"
              onClick={onPreviewToggle}
              aria-label={`Preview: ${previewOpen ? 'hide' : 'show'}`}
            >
              {previewOpen ? '⊘ Hide Preview' : '✓ Show Preview'}
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label="Open projects"
              title="Projects"
              onClick={onOpenProjects}
            >
              📁
            </button>
            <button
              className="ghost"
              type="button"
              onClick={onOpenPresetCreator}
              aria-label="Open preset creator"
            >
              Create Preset
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label="Open settings"
              title="Settings"
              onClick={onOpenSettings}
            >
              ⚙️
            </button>
            <button
              className="ghost"
              type="button"
              onClick={onOpenTemplates}
              aria-label="Open templates"
            >
              Templates
            </button>
            <button
              className="ghost"
              type="button"
              onClick={onOpenBatch}
              aria-label="Open batch generator"
            >
              Batch
            </button>
            <button
              className="ghost"
              type="button"
              onClick={onOpenHistory}
              aria-label="Open prompt history"
            >
              History
            </button>
          </div>

          <div className="topbar-group">
            <button
              className={`ghost${ollamaExpanding ? ' loading' : ''}`}
              type="button"
              onClick={onExpandWithOllama}
              disabled={ollamaExpanding}
              title={
                ollamaExpanding
                  ? 'Expanding prompt with AI...'
                  : 'Expand prompt with AI'
              }
              aria-label={`AI Expand: ${ollamaExpanding ? 'expanding' : 'ready'}`}
            >
              {ollamaExpanding ? '⏳ Expanding...' : '✨ AI Expand'}
            </button>
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
