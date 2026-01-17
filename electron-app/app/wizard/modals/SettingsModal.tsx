'use client';

import React, { useState } from 'react';

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
  allowNsfwInChat: boolean;
};

type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';

type OllamaSettings = {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsMode: ModeId;
  onSettingsModeChange: (mode: ModeId) => void;
  settingsField: string;
  onSettingsFieldChange: (field: string) => void;
  uiPrefs: UiPrefs;
  onUiPrefsChange: (prefs: UiPrefs) => void;
  ollamaSettings: OllamaSettings;
  onOllamaSettingsChange: (settings: OllamaSettings) => void;
  optionSets: Record<string, Record<string, string[]>>;
  onOptionSetsChange: (sets: Record<string, Record<string, string[]>>) => void;
  favorites: Record<string, Record<string, string[]>>;
  onToggleFavorite: (mode: ModeId, field: string, value: string) => void;
  settingsFilter: string;
  onSettingsFilterChange: (filter: string) => void;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  bulkOptions: string;
  onBulkOptionsChange: (value: string) => void;
  recentlyAdded: string | null;
  onRemoveOption: (value: string) => void;
  onResetModeToDefaults: () => void;
  onResetUiPrefs: () => void;
  onAddOneOption: () => void;
  onAddBulkOptions: () => void;
  onFetchOllamaModels: () => void;
  ollamaAvailableModels: string[];
  ollamaLoadingModels: boolean;
  suggestedFields: string[];
  onExportAllAppData: () => void;
  onImportAllAppData: () => void;
  editorTone: 'melancholic' | 'balanced' | 'energetic' | 'dramatic';
  onEditorToneChange: (tone: 'melancholic' | 'balanced' | 'energetic' | 'dramatic') => void;
  visualEmphasis: number;
  onVisualEmphasisChange: (value: number) => void;
  audioEmphasis: number;
  onAudioEmphasisChange: (value: number) => void;
  modes: Array<{ id: ModeId; title: string }>;
  isFavorite: (mode: ModeId, field: string, value: string) => boolean;
  detailLabelFor: (value: number) => string;
  audioLabelFor: (value: number) => string;
  labelForMode: (mode: ModeId) => string;
  DEFAULT_OPTION_SETS: Record<string, Record<string, string[]>>;
  DEFAULT_OLLAMA_SETTINGS: OllamaSettings;
  // Chat assistant controls
  chatAllowControl?: boolean;
  onChatAllowControlChange?: (enabled: boolean) => void;
  chatModel?: string;
  onSetChatModel?: (model: string) => void;
  chatSystemPrompt?: string;
  onSetChatSystemPrompt?: (value: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settingsMode,
  onSettingsModeChange,
  settingsField,
  onSettingsFieldChange,
  uiPrefs,
  onUiPrefsChange,
  ollamaSettings,
  onOllamaSettingsChange,
  optionSets,
  onOptionSetsChange,
  favorites,
  onToggleFavorite,
  settingsFilter,
  onSettingsFilterChange,
  newOption,
  onNewOptionChange,
  bulkOptions,
  onBulkOptionsChange,
  recentlyAdded,
  onRemoveOption,
  onResetModeToDefaults,
  onResetUiPrefs,
  onAddOneOption,
  onAddBulkOptions,
  onFetchOllamaModels,
  ollamaAvailableModels,
  ollamaLoadingModels,
  suggestedFields,
  onExportAllAppData,
  onImportAllAppData,
  editorTone,
  onEditorToneChange,
  visualEmphasis,
  onVisualEmphasisChange,
  audioEmphasis,
  onAudioEmphasisChange,
  modes,
  isFavorite,
  detailLabelFor,
  audioLabelFor,
  labelForMode,
  DEFAULT_OPTION_SETS,
  DEFAULT_OLLAMA_SETTINGS,
  chatAllowControl = false,
  onChatAllowControlChange = () => {},
  chatModel = '',
  onSetChatModel = () => {},
  chatSystemPrompt = '',
  onSetChatSystemPrompt = () => {},
}: SettingsModalProps) {
  if (!isOpen) return null;

  const settingsFields = Object.keys(optionSets[settingsMode] || {}).length
    ? Object.keys(optionSets[settingsMode]).sort()
    : Object.keys(DEFAULT_OPTION_SETS[settingsMode]).sort();

  return (
    <div className="settings-overlay" onMouseDown={onClose}>
      <div className="settings-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="settings-head">
          <div>
            <p className="eyebrow">Settings</p>
            <h3 className="settings-title">Preset options</h3>
            <p className="hint">Add, remove, and customize dropdown options. Saved locally.</p>
          </div>
          <button className="ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="settings-summary-row" aria-label="Current settings overview">
          <div className="summary-chip">Capture word: {uiPrefs.captureWord}</div>
          <div className="summary-chip">Format: {uiPrefs.promptFormat === 'ltx2' ? 'LTX-2' : 'Paragraph'}</div>
          <div className="summary-chip">Detail: {detailLabelFor(visualEmphasis)}</div>
          <div className="summary-chip">Audio: {audioLabelFor(audioEmphasis)}</div>
          <div className="settings-summary-actions">
            <button className="ghost tiny" type="button" onClick={onResetUiPrefs}>Reset UI</button>
            <button className="ghost tiny" type="button" onClick={onResetModeToDefaults}>Reset mode list</button>
          </div>
        </div>

        <div className="settings-tabs">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`tab ${settingsMode === m.id ? 'active' : ''}`}
              onClick={() => {
                onSettingsModeChange(m.id);
                onSettingsFieldChange('genre');
              }}
            >
              {labelForMode(m.id)}
            </button>
          ))}
        </div>

        <div className="settings-body">
          <div className="settings-left">
            <div className="settings-experience">
              <div className="settings-experience-head">
                <p className="eyebrow">Experience</p>
                <p className="hint">Tune the vibe.</p>
              </div>

              <label className="field">
                <span>Use the word</span>
                <select
                  value={uiPrefs.captureWord}
                  onChange={(e) =>
                    onUiPrefsChange({ ...uiPrefs, captureWord: e.target.value as any })
                  }
                  aria-label="Capture wording preference"
                >
                  <option value="shot">Shot</option>
                  <option value="video">Video</option>
                  <option value="clip">Clip</option>
                  <option value="frame">Frame</option>
                  <option value="photo">Photo</option>
                </select>
              </label>

              <div className="settings-experience-row">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={uiPrefs.autoCopyOnReview}
                    onChange={(e) => onUiPrefsChange({ ...uiPrefs, autoCopyOnReview: e.target.checked })}
                    aria-label="Auto-copy prompt on review"
                  />
                  <span className="slider" />
                </label>
                <div>
                  <div className="toggle-title">Auto-copy on Review</div>
                  <div className="toggle-note">Copies the prompt when you reach Step 22.</div>
                </div>
              </div>

              <label className="field">
                <span>Prompt format</span>
                <select
                  value={uiPrefs.promptFormat}
                  onChange={(e) =>
                    onUiPrefsChange({ ...uiPrefs, promptFormat: e.target.value as any })
                  }
                  aria-label="Prompt format"
                >
                  <option value="ltx2">LTX-2 (Core Actions / Visual / Audio)</option>
                  <option value="paragraph">Paragraph (legacy)</option>
                </select>
              </label>

              <div className="settings-experience-head">
                <p className="eyebrow">Live editing</p>
                <p className="hint">Dial richness and auto-fill gaps.</p>
              </div>

              <label className="field">
                <span>Detail level</span>
                <select
                  value={uiPrefs.detailLevel}
                  onChange={(e) =>
                    onUiPrefsChange({ ...uiPrefs, detailLevel: e.target.value as any })
                  }
                  aria-label="Detail level for prompts"
                >
                  <option value="minimal">Minimal</option>
                  <option value="balanced">Balanced</option>
                  <option value="rich">Rich</option>
                </select>
              </label>

              <div className="settings-experience-row">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={uiPrefs.autoFillAudio}
                    onChange={(e) => onUiPrefsChange({ ...uiPrefs, autoFillAudio: e.target.checked })}
                    aria-label="Auto-fill audio cues"
                  />
                  <span className="slider" />
                </label>
                <div>
                  <div className="toggle-title">Auto-fill audio</div>
                  <div className="toggle-note">Backfills ambience/SFX/music when blank.</div>
                </div>
              </div>

              <div className="settings-experience-row">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={uiPrefs.autoFillCamera}
                    onChange={(e) => onUiPrefsChange({ ...uiPrefs, autoFillCamera: e.target.checked })}
                    aria-label="Auto-fill camera movement"
                  />
                  <span className="slider" />
                </label>
                <div>
                  <div className="toggle-title">Auto camera moves</div>
                  <div className="toggle-note">Keeps motion language present if empty.</div>
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-experience-head">
                <p className="eyebrow">Content filtering</p>
                <p className="hint">Hide adult content options throughout the app.</p>
              </div>

              <div className="settings-experience-row">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={uiPrefs.hideNsfw}
                    onChange={(e) => onUiPrefsChange({ ...uiPrefs, hideNsfw: e.target.checked })}
                    aria-label="Hide NSFW options"
                  />
                  <span className="slider" />
                </label>
                <div>
                  <div className="toggle-title">Hide NSFW options</div>
                  <div className="toggle-note">Hides all adult content modes and fields. Can be re-enabled anytime.</div>
                </div>
              </div>

              <label className="field">
                <span>Preview font scale ({uiPrefs.previewFontScale.toFixed(2)}x)</span>
                <input
                  type="range"
                  min="0.9"
                  max="1.2"
                  step="0.05"
                  value={uiPrefs.previewFontScale}
                  onChange={(e) => onUiPrefsChange({ ...uiPrefs, previewFontScale: parseFloat(e.target.value) })}
                  aria-label="Preview font scale"
                />
              </label>

              <div className="settings-divider" />

              <div className="settings-experience-head">
                <p className="eyebrow">Quick tone</p>
                <p className="hint">Preset moods for the current scene.</p>
              </div>

              <div className="quick-tone-buttons">
                {(['melancholic', 'balanced', 'energetic', 'dramatic'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tone-btn ${editorTone === t ? 'active' : ''}`}
                    onClick={() => onEditorToneChange(t)}
                    title={`Set mood to ${t}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <label className="field">
                <span>Visual detail ({visualEmphasis}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={visualEmphasis}
                  onChange={(e) => onVisualEmphasisChange(Number(e.target.value))}
                  aria-label="Visual detail emphasis"
                />
                <div className="range-hint">
                  {visualEmphasis < 35 ? 'Minimal' : visualEmphasis > 65 ? 'Rich' : 'Balanced'}
                </div>
              </label>

              <label className="field">
                <span>Audio inclusion ({audioEmphasis}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={audioEmphasis}
                  onChange={(e) => onAudioEmphasisChange(Number(e.target.value))}
                  aria-label="Audio detail emphasis"
                />
                <div className="range-hint">
                  {audioEmphasis < 40 ? 'Sparse' : audioEmphasis > 60 ? 'Detailed' : 'Balanced'}
                </div>
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-experience-head">
              <p className="eyebrow">Ollama Integration</p>
              <p className="hint">Expand prompts using local AI.</p>
            </div>

            <div className="settings-experience-row">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={ollamaSettings.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    onOllamaSettingsChange({ ...ollamaSettings, enabled });
                    if (enabled) {
                      onFetchOllamaModels();
                    }
                  }}
                  aria-label="Enable Ollama integration"
                />
                <span className="slider" />
              </label>
              <div>
                <div className="toggle-title">Enable Ollama</div>
                <div className="toggle-note">Use Ollama to expand and enhance prompts.</div>
              </div>
            </div>

            {ollamaSettings.enabled && (
              <>
                <label className="field">
                  <span>API Endpoint</span>
                  <input
                    type="text"
                    value={ollamaSettings.apiEndpoint}
                    onChange={(e) => onOllamaSettingsChange({ ...ollamaSettings, apiEndpoint: e.target.value })}
                    onBlur={onFetchOllamaModels}
                    placeholder="http://localhost:11434"
                    aria-label="Ollama API endpoint"
                  />
                </label>

                <label className="field">
                  <div className="field-header-with-action">
                    <span>Model</span>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={onFetchOllamaModels}
                      disabled={ollamaLoadingModels}
                      title="Refresh available models"
                    >
                      {ollamaLoadingModels ? '⟳ Loading...' : '🔄 Refresh'}
                    </button>
                  </div>
                  {ollamaAvailableModels.length > 0 ? (
                    <select
                      value={ollamaSettings.model}
                      onChange={(e) => onOllamaSettingsChange({ ...ollamaSettings, model: e.target.value })}
                      aria-label="Select Ollama model"
                    >
                      {ollamaAvailableModels.map((modelName) => (
                        <option key={modelName} value={modelName}>
                          {modelName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={ollamaSettings.model}
                      onChange={(e) => onOllamaSettingsChange({ ...ollamaSettings, model: e.target.value })}
                      placeholder="llama2"
                      aria-label="Ollama model name"
                    />
                  )}
                </label>

                <label className="field">
                  <span>Temperature ({ollamaSettings.temperature.toFixed(1)})</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ollamaSettings.temperature}
                    onChange={(e) => onOllamaSettingsChange({ ...ollamaSettings, temperature: parseFloat(e.target.value) })}
                    aria-label="Ollama temperature"
                  />
                  <div className="range-hint">
                    {ollamaSettings.temperature < 0.5 ? 'Conservative' : ollamaSettings.temperature > 1.5 ? 'Creative' : 'Balanced'}
                  </div>
                </label>

                <label className="field">
                  <div className="field-header-with-action">
                    <span>System Instructions</span>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => onOllamaSettingsChange({ ...ollamaSettings, systemInstructions: DEFAULT_OLLAMA_SETTINGS.systemInstructions })}
                      title="Reset to default Creative Assistant spec"
                    >
                      Reset to default
                    </button>
                  </div>
                  <textarea
                    value={ollamaSettings.systemInstructions}
                    onChange={(e) => onOllamaSettingsChange({ ...ollamaSettings, systemInstructions: e.target.value })}
                    rows={6}
                    placeholder="Guidelines for how Ollama should expand your prompts. Use the default for the Creative Assistant spec."
                    aria-label="Ollama system instructions"
                  />
                  <div className="settings-actions">
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => onOllamaSettingsChange({
                        ...ollamaSettings,
                        apiEndpoint: DEFAULT_OLLAMA_SETTINGS.apiEndpoint,
                        model: DEFAULT_OLLAMA_SETTINGS.model,
                        temperature: DEFAULT_OLLAMA_SETTINGS.temperature,
                        systemInstructions: DEFAULT_OLLAMA_SETTINGS.systemInstructions,
                      })}
                      title="Restore Ollama endpoint, model, temperature, and instructions to defaults"
                    >
                      Restore Ollama Defaults
                    </button>
                  </div>
                </label>
              </>
            )}

            <div className="settings-divider" />

            <div className="settings-experience-head">
              <p className="eyebrow">Chat Assistant</p>
              <p className="hint">Configure Nicole and live UI control via chat.</p>
            </div>

            <div className="settings-experience-row">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={chatAllowControl}
                  onChange={(e) => onChatAllowControlChange(e.target.checked)}
                  aria-label="Allow chat to control UI"
                />
                <span className="slider" />
              </label>
              <div>
                <div className="toggle-title">Allow chat to control UI</div>
                <div className="toggle-note">Enables actions like changing mode, toggling preview, opening settings.</div>
              </div>
            </div>

            <div className="settings-experience-row">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={uiPrefs.allowNsfwInChat}
                  onChange={(e) => onUiPrefsChange({ ...uiPrefs, allowNsfwInChat: e.target.checked })}
                  aria-label="Allow NSFW content in chat"
                />
                <span className="slider" />
              </label>
              <div>
                <div className="toggle-title">Allow NSFW content in chat</div>
                <div className="toggle-note">Permits adult content in chat responses.</div>
              </div>
            </div>

            <label className="field">
              <span>Default Chat Model</span>
              <input
                type="text"
                value={chatModel}
                onChange={(e) => onSetChatModel(e.target.value)}
                placeholder="llama2"
                aria-label="Default chat model"
              />
            </label>

            <label className="field">
              <div className="field-header-with-action">
                <span>Chat System Prompt</span>
              </div>
              <textarea
                value={chatSystemPrompt}
                onChange={(e) => onSetChatSystemPrompt(e.target.value)}
                rows={6}
                placeholder="Define Nicole's behavior for chat conversations"
                aria-label="Chat system prompt"
              />
            </label>

            <div className="settings-divider" />

            <label className="field">
              <span>Which list do you want to edit?</span>
              <select
                value={settingsField}
                onChange={(e) => onSettingsFieldChange(e.target.value)}
                aria-label="Select which preset list to edit"
              >
                {settingsFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <div className="settings-add">
              <input
                type="text"
                value={newOption}
                onChange={(e) => onNewOptionChange(e.target.value)}
                placeholder="Add a new option (press Enter)"
                aria-label="Add a new preset option"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddOneOption();
                }}
              />
              <button className="primary" type="button" onClick={onAddOneOption}>
                Add
              </button>
            </div>

            <details className="settings-bulk">
              <summary>Bulk add (one per line)</summary>
              <textarea
                value={bulkOptions}
                onChange={(e) => onBulkOptionsChange(e.target.value)}
                rows={6}
                aria-label="Bulk add preset options"
                placeholder={'One option per line\nExample:\nSoft mist\nNeon rain\nDreamy bokeh'}
              />
              <div className="settings-bulk-actions">
                <button className="ghost" type="button" onClick={onAddBulkOptions}>
                  Add lines
                </button>
                <button className="ghost" type="button" onClick={() => onBulkOptionsChange('')}>
                  Clear
                </button>
              </div>
            </details>

            {suggestedFields.length > 0 && (
              <div className="suggested-fields">
                <p className="eyebrow">Next to fill</p>
                <div className="suggested-list">
                  {suggestedFields.map((field) => (
                    <div key={field} className="suggested-item">
                      <span className="field-label">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="settings-divider" />

            <div className="settings-actions">
              <button className="ghost" type="button" onClick={onExportAllAppData} title="Export all app data to JSON">
                Backup All
              </button>
              <button className="ghost" type="button" onClick={onImportAllAppData} title="Restore from a backup JSON file">
                Restore Backup
              </button>
            </div>

            <div className="settings-actions">
              <button className="ghost" type="button" onClick={onResetModeToDefaults}>
                Reset this mode to defaults
              </button>
            </div>
          </div>

          <div className="settings-right">
            <div className="settings-list">
              <div className="settings-add">
                <input
                  type="text"
                  value={settingsFilter}
                  onChange={(e) => onSettingsFilterChange(e.target.value)}
                  placeholder="Filter options…"
                  aria-label="Filter preset options"
                />
                <button className="ghost" type="button" onClick={() => onSettingsFilterChange('')}>Clear</button>
              </div>
              {(optionSets[settingsMode]?.[settingsField] || []).filter((v) => {
                const q = (settingsFilter || '').trim().toLowerCase();
                if (!q) return true;
                return v.toLowerCase().includes(q);
              }).map((v) => (
                <div key={v} className={`chip-row ${recentlyAdded === v ? 'just-added' : ''}`}>
                  <button
                    className={`fav-star ${isFavorite(settingsMode, settingsField, v) ? 'active' : ''}`}
                    type="button"
                    onClick={() => onToggleFavorite(settingsMode, settingsField, v)}
                    aria-label={`${isFavorite(settingsMode, settingsField, v) ? 'Unfavorite' : 'Favorite'} ${v}`}
                  >
                    ★
                  </button>
                  <div className="chip">{v}</div>
                  <button className="ghost" type="button" onClick={() => onRemoveOption(v)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
