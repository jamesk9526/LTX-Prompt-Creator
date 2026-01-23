'use client';

import React from 'react';

type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';
type Tone = 'melancholic' | 'balanced' | 'energetic' | 'dramatic';

type OllamaSettings = {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
};

interface PreviewSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  prompt: string;
  onCopyPrompt: (text: string) => Promise<void>;
  onSaveToHistory: (prompt: string) => void;
  onShowToast: (message: string) => void;
  mode: ModeId;
  labelForMode: (mode: ModeId) => string;
  editorTone: Tone;
  onToneChange: (tone: Tone) => void;
  visualEmphasis: number;
  onVisualEmphasisChange: (value: number) => void;
  audioEmphasis: number;
  onAudioEmphasisChange: (value: number) => void;
  detailLabelFor: (value: number) => string;
  audioLabelFor: (value: number) => string;
  ollamaSettings: OllamaSettings;
  onSendToChat: (prompt: string) => void;
  previewAnimTick: number;
}

export default function PreviewSidebar({
  isOpen,
  onToggle,
  prompt,
  onCopyPrompt,
  onSaveToHistory,
  onShowToast,
  mode,
  labelForMode,
  editorTone,
  onToneChange,
  visualEmphasis,
  onVisualEmphasisChange,
  audioEmphasis,
  onAudioEmphasisChange,
  detailLabelFor,
  audioLabelFor,
  ollamaSettings,
  onSendToChat,
  previewAnimTick,
}: PreviewSidebarProps) {
  return (
    <aside
      className={`preview-sidebar ${isOpen ? 'open' : 'closed'}`}
      aria-label="Preview and editing tools"
    >
      <div className="sidebar-toggle">
        <button
          className="ghost small"
          type="button"
          onClick={onToggle}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={isOpen ? 'Collapse preview sidebar' : 'Expand preview sidebar'}
        >
          {isOpen ? '⬎' : '⬏'}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="sidebar-section preview-section">
            <div className="sidebar-head">
              <h3>Live Preview</h3>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  void onCopyPrompt(prompt);
                  onSaveToHistory(prompt);
                  onShowToast('Copied & saved');
                }}
                aria-label="Copy prompt to clipboard and save to history"
              >
                📋 Copy
              </button>
            </div>

            <div className="preview-meta">
              <div className="meta-row" aria-label="Preview context summary">
                <span className="meta-chip">Mode: {labelForMode(mode)}</span>
                <span className="meta-chip">
                  Tone: {editorTone.charAt(0).toUpperCase() + editorTone.slice(1)}
                </span>
                <span className="meta-chip">Detail: {detailLabelFor(visualEmphasis)}</span>
                <span className="meta-chip">Audio: {audioLabelFor(audioEmphasis)}</span>
              </div>
              <div className="meta-actions">
                <button
                  className="ghost tiny"
                  type="button"
                  onClick={() => onSaveToHistory(prompt)}
                  title="Save to prompt history"
                  aria-label="Save prompt to history"
                >
                  Save
                </button>
                <button
                  className="ghost tiny"
                  type="button"
                  onClick={onToggle}
                  title="Hide preview"
                  aria-label="Hide preview sidebar"
                >
                  Hide
                </button>
                {ollamaSettings.enabled && (
                  <button
                    className="ghost tiny"
                    type="button"
                    onClick={() => {
                      onSendToChat(prompt);
                      onShowToast('Prompt sent to chat');
                    }}
                    title="Send prompt to chat"
                    aria-label="Send prompt to Ollama chat"
                  >
                    💬 Chat
                  </button>
                )}
              </div>
            </div>
            <pre key={previewAnimTick} className="preview-text">
              {prompt}
            </pre>
          </div>

          <div className="sidebar-divider" />

          {/* Live Editing Tools */}
          <div className="sidebar-section editing-tools">
            <h4 className="sidebar-subtitle">Live Editing</h4>

            <div className="tool-group">
              <label className="tool-label">Tone</label>
              <div className="tone-buttons">
                {(['melancholic', 'balanced', 'energetic', 'dramatic'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tone-btn ${editorTone === t ? 'active' : ''}`}
                    onClick={() => onToneChange(t)}
                    title={`Set tone to ${t}`}
                    aria-label={`Set tone to ${t}`}
                  >
                    {t[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-group">
              <div className="tool-header">
                <label className="tool-label">Visual Detail</label>
                <span className="tool-value">{visualEmphasis}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={visualEmphasis}
                onChange={(e) => onVisualEmphasisChange(Number(e.target.value))}
                className="tool-slider"
                aria-label="Adjust visual detail emphasis"
              />
              <div className="slider-hints">
                <span>Minimal</span>
                <span>Rich</span>
              </div>
            </div>

            <div className="tool-group">
              <div className="tool-header">
                <label className="tool-label">Audio Fill</label>
                <span className="tool-value">{audioEmphasis}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioEmphasis}
                onChange={(e) => onAudioEmphasisChange(Number(e.target.value))}
                className="tool-slider"
                aria-label="Adjust audio fill emphasis"
              />
              <div className="slider-hints">
                <span>Off</span>
                <span>Full</span>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
