'use client';

import React, { useState, useMemo } from 'react';
import ChatHistoryManager, { ChatSession } from '../utils/ChatHistoryManager';

interface ChatHistorySidebarProps {
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  currentSessionId?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  onSelectSession,
  onNewChat,
  currentSessionId
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>(ChatHistoryManager.getAllSessions());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    let result = sessions;

    if (showStarredOnly) {
      result = result.filter(s => s.isStarred);
    }

    if (filterMode) {
      result = result.filter(s => s.mode === filterMode);
    }

    if (searchQuery) {
      result = ChatHistoryManager.searchSessions(searchQuery);
    }

    return result;
  }, [sessions, searchQuery, filterMode, showStarredOnly]);

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm('Delete this chat session?')) {
      ChatHistoryManager.deleteSession(sessionId);
      setSessions(ChatHistoryManager.getAllSessions());
    }
  };

  const handleToggleStar = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ChatHistoryManager.toggleStar(sessionId);
    setSessions(ChatHistoryManager.getAllSessions());
  };

  const handleSelectSession = (session: ChatSession) => {
    onSelectSession(session);
  };

  const modes = ['cinematic', 'classic', 'drone', 'animation', 'photography', 'nsfw'];

  return (
    <div className="chat-history-sidebar">
      <div className="chat-history-header">
        <button className="chat-history-new-btn" onClick={onNewChat}>
          + New Chat
        </button>
      </div>

      <div className="chat-history-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="chat-history-search-input"
        />
      </div>

      <div className="chat-history-filters">
        <button
          className={`filter-btn ${showStarredOnly ? 'active' : ''}`}
          onClick={() => setShowStarredOnly(!showStarredOnly)}
          title="Show starred only"
        >
          ★
        </button>

        <select
          value={filterMode || ''}
          onChange={(e) => setFilterMode(e.target.value || null)}
          className="filter-select"
          aria-label="Filter by mode"
        >
          <option value="">All Modes</option>
          {modes.map(mode => (
            <option key={mode} value={mode}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-history-list">
        {filteredSessions.length === 0 ? (
          <div className="chat-history-empty">
            <p>No chats found</p>
            <p className="hint">Start a new chat to get began</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div
              key={session.id}
              className={`chat-history-item ${currentSessionId === session.id ? 'active' : ''}`}
              onClick={() => handleSelectSession(session)}
            >
              <div className="chat-history-item-header">
                <div className="chat-history-item-title" title={session.title}>
                  {session.title}
                </div>
                <button
                  className={`star-btn ${session.isStarred ? 'starred' : ''}`}
                  onClick={(e) => handleToggleStar(session.id, e)}
                  title={session.isStarred ? 'Unstar' : 'Star'}
                >
                  ★
                </button>
              </div>

              <div className="chat-history-item-meta">
                <span className="mode-badge">{session.mode}</span>
                <span className="message-count">{session.messages.length} messages</span>
                <span className="timestamp">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {expandedSession === session.id && session.messages.length > 0 && (
                <div className="chat-history-item-preview">
                  <p className="preview-label">Preview:</p>
                  <p className="preview-content">
                    {session.messages[0].content.substring(0, 150)}
                    {session.messages[0].content.length > 150 ? '...' : ''}
                  </p>
                </div>
              )}

              <div className="chat-history-item-actions">
                <button
                  className="action-btn expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSession(expandedSession === session.id ? null : session.id);
                  }}
                  title="Preview"
                >
                  ▼
                </button>

                <a
                  href={`data:text/plain,${encodeURIComponent(
                    ChatHistoryManager.exportAsMarkdown(session.id) || ''
                  )}`}
                  download={`${session.title}.md`}
                  className="action-btn export-btn"
                  title="Export as Markdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  ↓
                </a>

                <button
                  className="action-btn delete-btn"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-history-stats">
        {filteredSessions.length > 0 && (
          <div className="stats-text">
            {filteredSessions.length} chat{filteredSessions.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;