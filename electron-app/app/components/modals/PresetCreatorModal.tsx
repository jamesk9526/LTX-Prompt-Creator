'use client';

import React, { useState } from 'react';

interface PresetField {
  name: string;
  value: string;
  description?: string;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  mode: string;
  fields: PresetField[];
  createdAt: string;
}

interface PresetCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  onCreatePreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  onLoadPreset: (preset: Preset) => void;
  currentMode: string;
  labelForMode: (mode: string) => string;
  showToast: (message: string) => void;
  availableFields: string[];
}

export default function PresetCreatorModal({
  isOpen,
  onClose,
  presets,
  onCreatePreset,
  onDeletePreset,
  onLoadPreset,
  currentMode,
  labelForMode,
  showToast,
  availableFields,
}: PresetCreatorModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('browse');
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [selectedFields, setSelectedFields] = useState<PresetField[]>([]);
  const [filterMode, setFilterMode] = useState('all');

  const modePresets = presets.filter(p => filterMode === 'all' || p.mode === filterMode);

  const handleAddField = () => {
    const newField: PresetField = {
      name: availableFields[0] || 'custom',
      value: '',
    };
    setSelectedFields([...selectedFields, newField]);
  };

  const handleUpdateField = (index: number, field: Partial<PresetField>) => {
    const updated = [...selectedFields];
    updated[index] = { ...updated[index], ...field };
    setSelectedFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setSelectedFields(selectedFields.filter((_, i) => i !== index));
  };

  const handleCreatePreset = () => {
    if (!presetName.trim()) {
      showToast('Please name your preset');
      return;
    }

    if (selectedFields.length === 0) {
      showToast('Add at least one field');
      return;
    }

    const newPreset: Preset = {
      id: `preset_${Date.now()}`,
      name: presetName,
      description: presetDescription,
      mode: currentMode,
      fields: selectedFields,
      createdAt: new Date().toISOString(),
    };

    onCreatePreset(newPreset);
    
    // Reset form
    setPresetName('');
    setPresetDescription('');
    setSelectedFields([]);
    setActiveTab('browse');
    
    showToast(`Preset "${presetName}" created!`);
  };

  const uniqueModes = Array.from(new Set(presets.map(p => p.mode)));

  if (!isOpen) return null;

  return (
    <div className="preset-modal-overlay" onMouseDown={onClose}>
      <div 
        className="preset-modal-panel" 
        role="dialog" 
        aria-modal="true" 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="preset-modal-header">
          <div>
            <p className="eyebrow">Preset Manager</p>
            <h3>Create & manage presets</h3>
            <p className="hint">Save field combinations for quick reuse</p>
          </div>
          <button className="ghost" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="preset-tabs">
          <button
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('browse')}
          >
            Browse ({presets.length})
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('create')}
          >
            Create New
          </button>
        </div>

        <div className="preset-modal-body">
          {activeTab === 'browse' ? (
            <>
              {presets.length > 0 && (
                <div className="preset-filter">
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="small-select"
                  >
                    <option value="all">All modes</option>
                    {uniqueModes.map(mode => (
                      <option key={mode} value={mode}>
                        {labelForMode(mode)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modePresets.length === 0 ? (
                <div className="preset-empty">
                  <p className="eyebrow">No presets yet</p>
                  <p className="hint">Create your first preset to get started</p>
                </div>
              ) : (
                <div className="preset-list">
                  {modePresets.map(preset => (
                    <div key={preset.id} className="preset-card">
                      <div className="preset-card-header">
                        <div>
                          <h4 className="preset-name">{preset.name}</h4>
                          <p className="preset-mode">{labelForMode(preset.mode)}</p>
                        </div>
                        <div className="preset-card-actions">
                          <button
                            className="ghost small"
                            type="button"
                            onClick={() => {
                              onLoadPreset(preset);
                              showToast(`Preset "${preset.name}" loaded`);
                              onClose();
                            }}
                            title="Load preset"
                          >
                            ↙
                          </button>
                          <button
                            className="ghost small danger"
                            type="button"
                            onClick={() => {
                              onDeletePreset(preset.id);
                              showToast(`Preset "${preset.name}" deleted`);
                            }}
                            title="Delete preset"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                      {preset.description && (
                        <p className="preset-description">{preset.description}</p>
                      )}
                      <div className="preset-fields">
                        {preset.fields.slice(0, 3).map((field, i) => (
                          <span key={i} className="preset-field-tag">
                            {field.name}: {field.value.substring(0, 20)}
                            {field.value.length > 20 ? '...' : ''}
                          </span>
                        ))}
                        {preset.fields.length > 3 && (
                          <span className="preset-field-tag muted">
                            +{preset.fields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="preset-creator">
              <div className="preset-form">
                <label className="field">
                  <span>Preset name</span>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="e.g., 'Cinematic Golden Hour'"
                    aria-label="Preset name"
                  />
                </label>

                <label className="field">
                  <span>Description (optional)</span>
                  <textarea
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Describe when to use this preset..."
                    rows={3}
                    aria-label="Preset description"
                  />
                </label>

                <div className="preset-fields-section">
                  <div className="preset-fields-header">
                    <span className="eyebrow">Fields ({selectedFields.length})</span>
                    <button
                      className="ghost small"
                      type="button"
                      onClick={handleAddField}
                      title="Add field"
                    >
                      + Add Field
                    </button>
                  </div>

                  {selectedFields.length === 0 ? (
                    <div className="preset-fields-empty">
                      <p className="hint">Add fields to save as part of this preset</p>
                    </div>
                  ) : (
                    <div className="preset-field-list">
                      {selectedFields.map((field, i) => (
                        <div key={i} className="preset-field-row">
                          <select
                            value={field.name}
                            onChange={(e) => handleUpdateField(i, { name: e.target.value })}
                            className="small-select"
                          >
                            {availableFields.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleUpdateField(i, { value: e.target.value })}
                            placeholder="Field value"
                            aria-label={`${field.name} value`}
                          />
                          <button
                            className="ghost small danger"
                            type="button"
                            onClick={() => handleRemoveField(i)}
                            title="Remove field"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="preset-creator-actions">
                  <button
                    className="primary"
                    type="button"
                    onClick={handleCreatePreset}
                    disabled={!presetName.trim() || selectedFields.length === 0}
                  >
                    Create Preset
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => {
                      setPresetName('');
                      setPresetDescription('');
                      setSelectedFields([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
