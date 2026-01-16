'use client';

import React, { useState, useMemo } from 'react';

interface HistoryItem {
  id: string;
  text: string;
  timestamp: string;
  mode: string;
  modeLabel: string;
}

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectPrompt: (text: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  showToast: (message: string) => void;
  labelForMode: (mode: string) => string;
}

export default function PromptHistoryModal({
  isOpen,
  onClose,
  history,
  onSelectPrompt,
  onDeleteItem,
  onClearAll,
  showToast,
  labelForMode,
}: PromptHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest'>('newest');

  const uniqueModes = useMemo(() => {
    const modes = new Set(history.map(item => item.mode));
    return Array.from(modes);
  }, [history]);

  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.text.toLowerCase().includes(q) ||
        item.modeLabel.toLowerCase().includes(q)
      );
    }

    // Apply mode filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(item => item.mode === filterMode);
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.reverse();
    } else if (sortBy === 'longest') {
      sorted.sort((a, b) => b.text.length - a.text.length);
    }

    return sorted;
  }, [history, searchQuery, filterMode, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="history-modal-overlay" onMouseDown={onClose}>
      <div 
        className="history-modal-panel" 
        role="dialog" 
        aria-modal="true" 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="history-modal-header">
          <div>
            <p className="eyebrow">Prompt History</p>
            <h3>Your recent prompts</h3>
            <p className="hint">Search, filter, and reuse past prompts</p>
          </div>
          <button className="ghost" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="history-modal-filters">
          <div className="history-search">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search prompt history"
            />
            {searchQuery && (
              <button
                className="ghost small"
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="history-controls">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              aria-label="Filter by mode"
              className="small-select"
            >
              <option value="all">All modes</option>
              {uniqueModes.map(mode => (
                <option key={mode} value={mode}>
                  {labelForMode(mode)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort by"
              className="small-select"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="longest">Longest first</option>
            </select>

            {history.length > 0 && (
              <button
                className="ghost small danger"
                type="button"
                onClick={() => {
                  if (confirm('Clear all history? This cannot be undone.')) {
                    onClearAll();
                    showToast('History cleared');
                  }
                }}
                title="Clear all history"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="history-modal-body">
          {filteredHistory.length === 0 ? (
            <div className="history-empty">
              <p className="eyebrow">No prompts found</p>
              <p className="hint">
                {history.length === 0 
                  ? "You haven't created any prompts yet."
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="history-list">
              <div className="history-stats">
                Showing {filteredHistory.length} of {history.length} prompts
              </div>
              {filteredHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-header">
                    <div className="history-item-meta">
                      <span className="mode-badge">{item.modeLabel}</span>
                      <span className="timestamp">{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span className="char-count">{item.text.length} chars</span>
                    </div>
                    <div className="history-item-actions">
                      <button
                        className="ghost small"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.text);
                          showToast('Copied to clipboard');
                        }}
                        title="Copy prompt"
                        aria-label={`Copy prompt to clipboard`}
                      >
                        📋
                      </button>
                      <button
                        className="ghost small"
                        type="button"
                        onClick={() => {
                          onSelectPrompt(item.text);
                          showToast('Prompt loaded');
                          onClose();
                        }}
                        title="Load prompt"
                        aria-label={`Load prompt`}
                      >
                        ↙
                      </button>
                      <button
                        className="ghost small danger"
                        type="button"
                        onClick={() => {
                          onDeleteItem(item.id);
                          showToast('Prompt deleted');
                        }}
                        title="Delete prompt"
                        aria-label={`Delete prompt`}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="history-item-text">
                    {item.text.substring(0, 300)}
                    {item.text.length > 300 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
