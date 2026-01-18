'use client';

import { useRef, useState, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatPanelProps {
  chatOpen: boolean;
  setChatOpen: (value: boolean) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  chatModel: string;
  setChatModel: (model: string) => void;
  chatSystemPrompt: string;
  setChatSystemPrompt: (prompt: string) => void;
  chatSystemPromptModalOpen: boolean;
  setChatSystemPromptModalOpen: (open: boolean) => void;
  chatMinimized: boolean;
  setChatMinimized: (minimized: boolean) => void;
  chatMaximized?: boolean;
  setChatMaximized?: (maximized: boolean) => void;
  chatSending: boolean;
  // Optional flags and callbacks used by popout chat
  chatAllowControl?: boolean;
  onActions?: (actions: any[]) => void;
  onApplyPrompt?: (promptText: string) => void;
  actionPreviewOpen?: boolean;
  actionPreviewRaw?: string;
  actionPreviewJson?: string;
  actionPreviewDescriptions?: string[];
  actionPreviewErrors?: string[];
  onApplyActionsPreview?: () => void;
  onCopyActionsJson?: () => void;
  onCloseActionsPreview?: () => void;
  // Docking controls (optional)
  docked?: boolean;
  onToggleDock?: () => void;
  ollamaSettings: {
    enabled: boolean;
    model: string;
  };
  ollamaAvailableModels: string[];
  prompt: string;
  mode: string;
  editorTone: string;
  labelForMode: (mode: string) => string;
  showToast: (message: string) => void;
  sendChatMessage: () => void;
  addToPromptHistory: (prompt: string) => void;
  applyingActions?: boolean;
  // Analyze Quality feature
  onAnalyzeQuality?: () => Promise<void>;
  analyzingQuality?: boolean;
}

export default function ChatPanel({
  chatOpen,
  setChatOpen,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatModel,
  setChatModel,
  chatSystemPrompt,
  setChatSystemPrompt,
  chatSystemPromptModalOpen,
  setChatSystemPromptModalOpen,
  chatMinimized,
  setChatMinimized,
  chatMaximized,
  setChatMaximized,
  chatSending,
  onApplyPrompt,
  actionPreviewOpen,
  actionPreviewRaw,
  actionPreviewJson,
  actionPreviewDescriptions,
  actionPreviewErrors,
  onApplyActionsPreview,
  onCopyActionsJson,
  onCloseActionsPreview,
  docked,
  onToggleDock,
  ollamaSettings,
  ollamaAvailableModels,
  prompt,
  mode,
  editorTone,
  labelForMode,
  showToast,
  sendChatMessage,
  addToPromptHistory,
  applyingActions,
  onAnalyzeQuality,
  analyzingQuality,
}: ChatPanelProps) {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, chatSending]);

  const parseMessageParts = (content: string) => {
    const parts: Array<{ type: 'text' | 'code'; text?: string; lang?: string; code?: string }> = [];
    const regex = /``{2,3}([^\n`]*)\n?([\s\S]*?)``{2,3}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }

      const rawLang = (match[1] || '').trim();
      let lang = rawLang;
      let code = match[2] ?? '';

      if (!code && rawLang.includes(' ')) {
        const [token, ...rest] = rawLang.split(/\s+/);
        lang = token;
        code = rest.join(' ');
      }

      parts.push({ type: 'code', lang, code });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts;
  };

  if (!chatOpen) return null;

  return (
    <>
      {/* Chat Panel */}
      <div className={`chat-panel ${chatMinimized ? 'minimized' : ''} ${docked ? 'docked' : ''} ${chatMaximized ? 'maximized' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-title-block">
              <p className="eyebrow">Nicole • Prompt co-pilot</p>
              <h3>Chat workspace</h3>
            </div>
            {!chatMinimized && (
              <select
                className="chat-model-selector"
                value={chatModel || ollamaSettings.model}
                onChange={(e) => setChatModel(e.target.value)}
                disabled={!ollamaSettings.enabled}
                title="Select AI model for chat"
                aria-label="Select AI model"
              >
                {ollamaAvailableModels.length > 0 ? (
                  ollamaAvailableModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))
                ) : (
                  <option value={ollamaSettings.model}>{ollamaSettings.model}</option>
                )}
              </select>
            )}
          </div>
          <div className="chat-header-actions">
            {onToggleDock && !chatMaximized && (
              <button
                className="ghost small"
                type="button"
                onClick={onToggleDock}
                title={docked ? 'Undock to floating panel' : 'Dock to left sidebar'}
                aria-label={docked ? 'Undock chat' : 'Dock chat'}
              >
                {docked ? 'Float' : 'Dock'}
              </button>
            )}
            {!docked && setChatMaximized && (
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  setChatMaximized(!chatMaximized);
                  if (chatMinimized) setChatMinimized(false);
                }}
                title={chatMaximized ? 'Restore to window' : 'Maximize to fullscreen'}
                aria-label={chatMaximized ? 'Restore chat' : 'Maximize chat'}
              >
                {chatMaximized ? '🗗' : '🗖'}
              </button>
            )}
            <button
              className="ghost small"
              type="button"
              onClick={() => {
                setChatMessages([]);
                setChatInput('');
                showToast('Chat cleared');
              }}
              title="Start a new conversation"
              aria-label="Start new chat"
            >
              New
            </button>
            <button
              className="ghost small"
              type="button"
              onClick={() => {
                const contextMessage = `App Context:
- Current Mode: ${labelForMode(mode)}
- Tone: ${editorTone.charAt(0).toUpperCase() + editorTone.slice(1)}

CURRENT FULL PREVIEW PROMPT:
${prompt}

Please review this context and let me know how I can optimize my prompts for the LTX model.`;
                setChatInput(contextMessage);
                setChatMessages([...chatMessages, { role: 'user', content: contextMessage }]);
                setTimeout(() => sendChatMessage(), 0);
              }}
              title="Gather app context and send to Nicole"
              aria-label="Gather context"
            >
              Context
            </button>
            <button
              className="ghost small"
              type="button"
              onClick={() => {
                // Find the last assistant message with code block
                for (let i = chatMessages.length - 1; i >= 0; i--) {
                  if (chatMessages[i].role === 'assistant') {
                    const codeMatch = chatMessages[i].content.match(/```prompt\n([\s\S]*?)\n```/);
                    if (codeMatch) {
                      const promptText = codeMatch[1].trim();
                      // Create a paste-ready message for the preview
                      navigator.clipboard.writeText(promptText);
                      showToast('Prompt copied to clipboard - paste into preview');
                      return;
                    }
                  }
                }
                showToast('No prompt found in chat');
              }}
              title="Copy last expanded prompt to clipboard"
              aria-label="Copy prompt"
            >
              Copy
            </button>
            <button
              className="icon-btn small"
              type="button"
              onClick={() => setChatSystemPromptModalOpen(true)}
              title="Edit system prompt"
              aria-label="Edit system prompt"
            >
              ⚙️
            </button>
            <button
              className="icon-btn small"
              type="button"
              onClick={() => setChatMinimized(!chatMinimized)}
              title={chatMinimized ? 'Maximize' : 'Minimize'}
              aria-label={chatMinimized ? 'Maximize chat' : 'Minimize chat'}
            >
              {chatMinimized ? '▲' : '▼'}
            </button>
            <button
              className="ghost small"
              type="button"
              onClick={() => {
                setChatOpen(false);
                setChatMessages([]);
                setChatMinimized(false);
              }}
            >
              Close
            </button>
          </div>
        </div>

        {!chatMinimized && (
          <div className="chat-meta-strip">
            <div className="chat-meta-left">
              <span className={`chat-pill ${ollamaSettings.enabled ? 'online' : 'offline'}`}>
                {ollamaSettings.enabled ? 'Connected to Ollama' : 'Ollama disabled'}
              </span>
              <span className="chat-pill">Model: {chatModel || ollamaSettings.model}</span>
              <span className="chat-pill">Mode: {labelForMode(mode)}</span>
              <span className="chat-pill">Tone: {editorTone}</span>
            </div>
          </div>
        )}

        {!chatMinimized && (
          <>
            <div className="chat-messages" ref={chatMessagesRef}>
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-copy">
                    <p>Hi, I&apos;m Nicole. I refine, critique, and reshape your prompts.</p>
                    <p className="hint">Pick a quickstart or drop your current preview to get tailored advice.</p>
                  </div>
                  <div className="suggested-messages-grid">
                    {[{
                      title: 'Improve a prompt',
                      body: 'Tighten visuals, pacing, and cohesion for better generations.',
                      msg: 'Help me improve this prompt for better visual quality'
                    }, {
                      title: 'Prompt structure tips',
                      body: 'Outline the must-have elements for cinematic prompts.',
                      msg: 'What elements should a cinematic video prompt include?'
                    }, {
                      title: 'Camera movement',
                      body: 'Get language for dynamic but readable camera moves.',
                      msg: 'How do I describe camera movement effectively?'
                    }, {
                      title: 'Lighting guidance',
                      body: 'Ask for lighting language and technical cues.',
                      msg: 'How do I write lighting descriptions for video?'
                    }].map((item) => (
                      <button
                        key={item.title}
                        className="suggested-msg-card"
                        onClick={() => {
                          setChatInput(item.msg);
                          setChatMessages([{ role: 'user', content: item.msg }]);
                          setTimeout(() => sendChatMessage(), 0);
                        }}
                      >
                        <div className="suggested-title">{item.title}</div>
                        <div className="suggested-body">{item.body}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, idx) => {
                const parts = parseMessageParts(msg.content);
                return (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="chat-message-row">
                      <div className="chat-avatar" aria-hidden>{msg.role === 'user' ? 'Y' : 'N'}</div>
                      <div className="chat-message-body">
                        <div className="chat-message-role">
                          {msg.role === 'user' ? 'You' : 'Nicole'}
                          {msg.timestamp && <span className="chat-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>}
                        </div>
                        <div className="chat-message-content">
                          {parts.map((part, i) => {
                            if (part.type === 'code') {
                              let codeType = part.lang || '';
                              let actualCode = part.code || '';
                              if (!codeType) {
                                const lines = actualCode.split('\n');
                                const first = (lines[0] || '').trim();
                                if (lines.length > 1 && /^[a-zA-Z0-9_-]+$/.test(first)) {
                                  codeType = first;
                                  actualCode = lines.slice(1).join('\n');
                                }
                              }
                              const headerType = codeType || 'code';

                              return (
                                <div key={i} className="code-block">
                                  <div className="code-block-header">
                                    <span className="code-type">{headerType}</span>
                                    <div className="code-block-buttons">
                                      <button
                                        className="code-copy-btn"
                                        onClick={() => {
                                          navigator.clipboard.writeText(actualCode);
                                          showToast('Copied to clipboard');
                                        }}
                                        title="Copy to clipboard"
                                      >
                                        Copy
                                      </button>
                                      <button
                                        className="code-copy-btn"
                                        onClick={() => {
                                          navigator.clipboard.writeText(actualCode);
                                          showToast('Prompt copied - paste into preview');
                                        }}
                                        title="Copy and prepare to paste to preview"
                                      >
                                        Use
                                      </button>
                                      {headerType === 'prompt' && (
                                        <button
                                          className="code-copy-btn"
                                          onClick={() => {
                                            addToPromptHistory(actualCode);
                                            showToast('Saved to history');
                                          }}
                                          title="Save prompt to history"
                                        >
                                          Save
                                        </button>
                                      )}
                                      {headerType === 'prompt' && (
                                        <button
                                          className="code-copy-btn"
                                          onClick={() => {
                                            if (typeof window !== 'undefined' && typeof onApplyPrompt === 'function') {
                                              onApplyPrompt(actualCode);
                                            } else {
                                              showToast('Apply not available');
                                            }
                                          }}
                                          title="Apply this prompt to the UI via actions"
                                          disabled={applyingActions}
                                        >
                                          {applyingActions ? 'Applying...' : 'Apply'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <pre className="code-block-content">{actualCode}</pre>
                                </div>
                              );
                            }
                            const text = part.text || '';
                            return text ? <p key={i}>{text}</p> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {chatSending && (
                <div className="chat-message assistant">
                  <div className="chat-message-row">
                    <div className="chat-avatar" aria-hidden>N</div>
                    <div className="chat-message-body">
                      <div className="chat-message-role">Nicole</div>
                      <div className="chat-message-content chat-typing">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {actionPreviewOpen && (
              <div className="chat-action-preview">
                <div className="chat-action-preview-head">
                  <div>
                    <div className="eyebrow">Chat Apply Preview</div>
                    <div className="hint">Review the LLM response and JSON actions before applying.</div>
                  </div>
                  <button className="ghost small" type="button" onClick={onCloseActionsPreview}>
                    Close
                  </button>
                </div>
                {actionPreviewErrors && actionPreviewErrors.length > 0 && (
                  <div className="hint" aria-live="polite">{actionPreviewErrors[0]}</div>
                )}
                <label className="field">
                  <span>LLM response (raw)</span>
                  <textarea value={actionPreviewRaw || ''} readOnly rows={4} />
                </label>
                {actionPreviewDescriptions && actionPreviewDescriptions.length > 0 && (
                  <div className="suggested-list" style={{ marginBottom: '8px' }}>
                    {actionPreviewDescriptions.map((d, i) => (
                      <div key={i} className="suggested-item">
                        <span className="field-label">{d}</span>
                      </div>
                    ))}
                  </div>
                )}
                <label className="field">
                  <span>Actions JSON</span>
                  <textarea value={actionPreviewJson || ''} readOnly rows={6} />
                </label>
                <div className="settings-actions">
                  <button className="ghost" type="button" onClick={onCopyActionsJson}>
                    Copy JSON
                  </button>
                  <button className="primary" type="button" onClick={onApplyActionsPreview}>
                    Apply Now
                  </button>
                </div>
              </div>
            )}

            <div className="chat-input-area">
              <textarea
                ref={chatInputRef}
                className="chat-input"
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
                disabled={!ollamaSettings.enabled || chatSending}
                rows={1}
              />
              <button
                className="primary"
                type="button"
                onClick={sendChatMessage}
                disabled={!ollamaSettings.enabled || chatSending || !chatInput.trim()}
              >
                {chatSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* System Prompt Modal */}
      {chatSystemPromptModalOpen && (
        <div className="settings-overlay" onMouseDown={() => setChatSystemPromptModalOpen(false)}>
          <div className="settings-panel chat-system-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <h3 className="settings-title">Chat System Prompt</h3>
                <p className="hint">Define how the AI assistant should behave in chat conversations.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setChatSystemPromptModalOpen(false)}>Close</button>
            </div>
            <div className="settings-body settings-body-single-col">
              <textarea
                className="chat-system-textarea-modal"
                value={chatSystemPrompt}
                onChange={(e) => setChatSystemPrompt(e.target.value)}
                placeholder="Define how the AI should behave..."
                rows={8}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
