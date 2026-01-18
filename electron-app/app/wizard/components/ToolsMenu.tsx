'use client';

import React, { useState, useRef, useEffect } from 'react';
import './ToolsMenu.css';

interface ToolsMenuProps {
  // Settings & UI
  onOpenSettings: () => void;
  onOpenPresetCreator: () => void;
  previewOpen: boolean;
  onPreviewToggle: () => void;
  
  // Projects & Templates
  onOpenProjects: () => void;
  onOpenTemplates: () => void;
  onOpenBatch: () => void;
  
  // History & Chat
  onOpenHistory: () => void;
  chatHistoryOpen: boolean;
  onToggleChatHistory: () => void;
  chatSessionUnsaved: boolean;
  onSaveChat: () => void;
  
  // AI Tools
  onExpandWithOllama: () => void;
  ollamaExpanding: boolean;
  
  // CSV Builder
  onOpenCSVBuilder: () => void;
}

export default function ToolsMenu({
  onOpenSettings,
  onOpenPresetCreator,
  previewOpen,
  onPreviewToggle,
  onOpenProjects,
  onOpenTemplates,
  onOpenBatch,
  onOpenHistory,
  chatHistoryOpen,
  onToggleChatHistory,
  chatSessionUnsaved,
  onSaveChat,
  onExpandWithOllama,
  ollamaExpanding,
  onOpenCSVBuilder
}: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    closeMenu();
  };

  return (
    <div className="tools-menu-container" ref={menuRef}>
      <button
        className="tools-menu-trigger"
        onClick={handleMenuClick}
        aria-label="Open tools menu"
        title="Tools"
      >
        🛠️ Tools {isOpen ? '▼' : '▶'}
      </button>

      {isOpen && (
        <div className="tools-menu-dropdown">
          {/* Projects & Files */}
          <div className="tools-menu-section">
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenProjects)}
            >
              <span className="tools-menu-icon">📁</span>
              <span>Projects</span>
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenTemplates)}
            >
              <span className="tools-menu-icon">📄</span>
              <span>Templates</span>
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenBatch)}
            >
              <span className="tools-menu-icon">📦</span>
              <span>Batch Generator</span>
            </button>
          </div>

          <div className="tools-menu-divider" />

          {/* Chat & History */}
          <div className="tools-menu-section">
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onToggleChatHistory)}
            >
              <span className="tools-menu-icon">📚</span>
              <span>Chat History</span>
              {chatHistoryOpen && <span className="tools-badge">Open</span>}
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onSaveChat)}
              disabled={!chatSessionUnsaved}
            >
              <span className="tools-menu-icon">💾</span>
              <span>Save Chat</span>
              {chatSessionUnsaved && <span className="tools-badge unsaved">•</span>}
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenHistory)}
            >
              <span className="tools-menu-icon">📜</span>
              <span>History</span>
            </button>
          </div>

          <div className="tools-menu-divider" />

          {/* AI & Creation Tools */}
          <div className="tools-menu-section">
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onExpandWithOllama)}
              disabled={ollamaExpanding}
            >
              <span className="tools-menu-icon">🤖</span>
              <span>AI Expand</span>
              {ollamaExpanding && <span className="tools-badge">...</span>}
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenPresetCreator)}
            >
              <span className="tools-menu-icon">✨</span>
              <span>Create Preset</span>
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenCSVBuilder)}
            >
              <span className="tools-menu-icon">📊</span>
              <span>CSV Builder</span>
            </button>
          </div>

          <div className="tools-menu-divider" />

          {/* Settings & View */}
          <div className="tools-menu-section">
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onPreviewToggle)}
            >
              <span className="tools-menu-icon">{previewOpen ? '👁️' : '👁️‍🗨️'}</span>
              <span>{previewOpen ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
            <button
              className="tools-menu-item"
              onClick={() => handleAction(onOpenSettings)}
            >
              <span className="tools-menu-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
