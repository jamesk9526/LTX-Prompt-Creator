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
  // Chat mode selection
  chatMode?: string;
  setChatMode?: (mode: string) => void;
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
  chatMode,
  setChatMode,
}: ChatPanelProps) {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const conversationStartTime = useRef<number>(Date.now());
  const recognitionRef = useRef<any>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [statsPanel, setStatsPanel] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [dividerPos, setDividerPos] = useState(60);
  const [pipMode, setPipMode] = useState(false);
  const [pipPos, setPipPos] = useState({ x: 20, y: 20 });
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set());
  const [showContinueBanner, setShowContinueBanner] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [chatTemperature, setChatTemperature] = useState(0.7);
  const [chatMaxTokens, setChatMaxTokens] = useState(2048);
  const [chatTopP, setChatTopP] = useState(0.9);
  const [chatStreamEnabled, setChatStreamEnabled] = useState(true);

  // Auto-save conversation to localStorage every 10 seconds
  useEffect(() => {
    if (!chatOpen || chatMessages.length === 0) return;

    const saveInterval = setInterval(() => {
      const sessionId = Date.now().toString();
      const sessionData = {
        id: sessionId,
        messages: chatMessages,
        mode: chatMode || 'general',
        model: chatModel || ollamaSettings.model,
        timestamp: Date.now(),
        tone: editorTone,
        duration: elapsedSeconds
      };

      try {
        // Save current session
        localStorage.setItem('ltx_current_session', JSON.stringify(sessionData));
        
        // Save to sessions history
        const sessions = JSON.parse(localStorage.getItem('ltx_sessions') || '[]');
        const existingIndex = sessions.findIndex((s: any) => s.id === sessionId);
        if (existingIndex >= 0) {
          sessions[existingIndex] = sessionData;
        } else {
          sessions.push(sessionData);
        }
        // Keep only last 10 sessions
        const recent = sessions.slice(-10);
        localStorage.setItem('ltx_sessions', JSON.stringify(recent));

        setAutoSaveIndicator(true);
        setTimeout(() => setAutoSaveIndicator(false), 300);
      } catch (e) {
        console.error('Failed to save session:', e);
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [chatOpen, chatMessages, chatMode, chatModel, editorTone, elapsedSeconds, ollamaSettings.model]);

  // Load previous session on mount
  useEffect(() => {
    if (chatMessages.length > 0 || !chatOpen) return;

    try {
      const lastSession = localStorage.getItem('ltx_current_session');
      if (lastSession) {
        const session = JSON.parse(lastSession);
        const timeSinceLastSession = Date.now() - session.timestamp;
        // Show continue banner if last session was within last 24 hours
        if (timeSinceLastSession < 24 * 60 * 60 * 1000) {
          setLastSessionId(session.id);
          setShowContinueBanner(true);
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  }, [chatOpen, chatMessages.length]);

  // Keyboard shortcuts for fullscreen chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!chatOpen) return;

      // ESC - Exit fullscreen
      if (e.key === 'Escape' && chatMaximized && setChatMaximized) {
        e.preventDefault();
        setChatMaximized(false);
        setZenMode(false);
        setPresentationMode(false);
      }

      // ? - Show keyboard help (only in fullscreen)
      if (e.key === '?' && chatMaximized && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
        }
      }

      // Ctrl/Cmd + Z - Toggle zen mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && chatMaximized) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          setZenMode(!zenMode);
          showToast(zenMode ? 'Zen mode disabled' : 'Zen mode enabled');
        }
      }

      // Ctrl/Cmd + Shift + P - Toggle presentation mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P' && chatMaximized) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          setPresentationMode(!presentationMode);
          showToast(presentationMode ? 'Presentation mode disabled' : 'Presentation mode enabled');
        }
      }

      // Ctrl/Cmd + I - Toggle stats panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'i' && !e.shiftKey && chatMaximized) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          setStatsPanel(!statsPanel);
          showToast(statsPanel ? 'Stats panel closed' : 'Stats panel opened');
        }
      }

      // Ctrl/Cmd + L - Toggle split view
      if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !e.shiftKey && chatMaximized) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          setSplitView(!splitView);
          showToast(splitView ? 'Split view disabled' : 'Split view enabled');
        }
      }

      // Ctrl/Cmd + M - Toggle picture-in-picture
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && !e.shiftKey && chatMaximized) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          setPipMode(!pipMode);
          showToast(pipMode ? 'PiP mode disabled' : 'PiP mode enabled');
        }
      }
      if (e.key === 'F11' && setChatMaximized) {
        e.preventDefault();
        setChatMaximized(!chatMaximized);
        if (!chatMaximized && chatMinimized) setChatMinimized(false);
        if (chatMaximized) {
          setZenMode(false);
          setPresentationMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatOpen, chatMaximized, setChatMaximized, chatMinimized, setChatMinimized, zenMode, presentationMode, statsPanel, splitView, pipMode, showKeyboardHelp, showToast]);

  // Divider drag handler for split view
  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.chat-split-container') as HTMLElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newPos = Math.max(20, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100));
      setDividerPos(newPos);
    };

    const handleMouseUp = () => setIsDraggingDivider(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider]);

  // PiP drag handler
  useEffect(() => {
    if (!isDraggingPip || !pipRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = pipRef.current?.getBoundingClientRect();
      if (!rect) return;
      const offsetX = e.clientX - rect.width / 2;
      const offsetY = e.clientY - rect.height / 2;
      setPipPos({
        x: Math.max(0, Math.min(window.innerWidth - rect.width, offsetX)),
        y: Math.max(0, Math.min(window.innerHeight - rect.height, offsetY))
      });
    };

    const handleMouseUp = () => setIsDraggingPip(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPip]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, chatSending]);

  // Timer effect for stats panel
  useEffect(() => {
    if (!statsPanel || !chatOpen) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - conversationStartTime.current) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [statsPanel, chatOpen]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptPart + ' ');
        } else {
          interim += transcriptPart;
        }
      }
      if (interim) {
        setTranscript((prev) => {
          const base = prev.trim().split(' ').slice(0, -1).join(' ');
          return base ? base + ' ' + interim : interim;
        });
      }
    };

    recognition.onerror = (event: any) => {
      showToast(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [showToast]);

  // Handle voice recording start/stop
  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      showToast('Voice recognition not supported in this browser');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Auto-append transcript to input
      if (transcript.trim()) {
        const newInput = chatInput ? chatInput + ' ' + transcript.trim() : transcript.trim();
        setChatInput(newInput);
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  // Check if message is quality analysis
  const isQualityAnalysis = (content: string) => {
    return content.includes('**Prompt Quality Analysis') && content.includes('**Score:');
  };

  // Parse quality analysis into structured data
  const parseQualityAnalysis = (content: string) => {
    const scoreMatch = content.match(/\*\*Score:\s*(\d+)\/100\*\*/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    
    const strengthsMatch = content.match(/\*\*Strengths:\*\*([\s\S]*?)\*\*Areas for Improvement:/);
    const strengths = strengthsMatch ? strengthsMatch[1].trim().split('\n').filter(s => s.trim().startsWith('•')).map(s => s.replace('•', '').trim()) : [];
    
    const improvementsMatch = content.match(/\*\*Areas for Improvement:\*\*([\s\S]*?)\*\*Recommendation:/);
    const improvements = improvementsMatch ? improvementsMatch[1].trim().split('\n').filter(s => s.trim().startsWith('•')).map(s => s.replace('•', '').trim()) : [];
    
    const recommendationMatch = content.match(/\*\*Recommendation:\*\*\s*(.+)/);
    const recommendation = recommendationMatch ? recommendationMatch[1].trim() : '';
    
    return { score, strengths, improvements, recommendation };
  };

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

  // Toggle bookmark for a message
  const toggleBookmark = (index: number) => {
    const newBookmarks = new Set(bookmarkedMessages);
    if (newBookmarks.has(index)) {
      newBookmarks.delete(index);
    } else {
      newBookmarks.add(index);
    }
    setBookmarkedMessages(newBookmarks);
    showToast(newBookmarks.has(index) ? '⭐ Message bookmarked' : '⭐ Bookmark removed');
  };

  // Export as Markdown
  const exportMarkdown = () => {
    const markdown = chatMessages
      .map((msg, idx) => {
        const marker = bookmarkedMessages.has(idx) ? '⭐ ' : '';
        return `**${marker}${msg.role === 'user' ? 'You' : 'Nicole'}:**\n\n${msg.content}\n\n---\n`;
      })
      .join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 Exported as Markdown');
  };

  // Export as JSON
  const exportJSON = () => {
    const data = {
      timestamp: Date.now(),
      mode: chatMode || 'general',
      model: chatModel || ollamaSettings.model,
      tone: editorTone,
      duration: elapsedSeconds,
      totalMessages: chatMessages.length,
      bookmarkedCount: bookmarkedMessages.size,
      messages: chatMessages.map((msg, idx) => ({
        index: idx,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        bookmarked: bookmarkedMessages.has(idx)
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📋 Exported as JSON');
  };

  // Export bookmarked messages only
  const exportBookmarks = () => {
    if (bookmarkedMessages.size === 0) {
      showToast('⚠️ No bookmarked messages to export');
      return;
    }

    const bookmarks = chatMessages
      .map((msg, idx) => bookmarkedMessages.has(idx) ? { ...msg, index: idx } : null)
      .filter(Boolean);

    const markdown = bookmarks
      .map((msg: any) => `**${msg.role === 'user' ? 'You' : 'Nicole'}:**\n\n${msg.content}\n\n---\n`)
      .join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-bookmarks-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⭐ Bookmarks exported');
  };

  // Restore previous session
  const restorePreviousSession = () => {
    try {
      const lastSession = localStorage.getItem('ltx_current_session');
      if (lastSession) {
        const session = JSON.parse(lastSession);
        setChatMessages(session.messages);
        if (setChatMode) setChatMode(session.mode);
        setChatModel(session.model);
        setShowContinueBanner(false);
        showToast('📂 Previous conversation restored');
        conversationStartTime.current = Date.now() - session.duration * 1000;
      }
    } catch (e) {
      showToast('❌ Failed to restore session');
      console.error(e);
    }
  };

  if (!chatOpen) return null;

  return (
    <>
      {/* Chat Panel */}
      <div className={`chat-panel ${chatMinimized ? 'minimized' : ''} ${docked ? 'docked' : ''} ${chatMaximized ? 'maximized' : ''} ${zenMode ? 'zen-mode' : ''} ${presentationMode ? 'presentation-mode' : ''}`}>
        {!presentationMode && (
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-title-block">
                <p className="eyebrow">Nicole • AI Prompt Engineer</p>
                <h3>{chatMode === 'flux' ? 'Flux Mode' : chatMode === 'sd' ? 'Stable Diffusion' : chatMode === 'ltx' ? 'LTX Video prompt creator' : 'Chat'}</h3>
              </div>
              {/* Model Selector in Header */}
              {!chatMinimized && (
                <select
                  className="chat-model-select"
                  value={chatModel || ollamaSettings.model}
                  onChange={(e) => {
                    setChatModel(e.target.value);
                    showToast(`Model: ${e.target.value}`);
                  }}
                  disabled={!ollamaSettings.enabled || chatSending}
                  title="Select AI Model"
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
              {!chatMinimized && setChatMode && (
                <button
                  className="ghost small"
                  type="button"
                  onClick={() => setChatSettingsOpen(!chatSettingsOpen)}
                  title="Chat settings and mode"
                  aria-label="Open chat settings"
                >
                  ⚙️
                </button>
              )}
              {onToggleDock && !chatMaximized && (
                <button
                  className="ghost small"
                  type="button"
                  onClick={onToggleDock}
                  title={docked ? 'Undock to floating panel' : 'Dock to left sidebar'}
                  aria-label={docked ? 'Undock chat' : 'Dock chat'}
                >
                  {docked ? '○' : '◉'}
                </button>
              )}
              {!docked && setChatMaximized && (
                <button
                  className="ghost small icon-only"
                  type="button"
                  onClick={() => {
                    setChatMaximized(!chatMaximized);
                    if (chatMinimized) setChatMinimized(false);
                  }}
                  title={chatMaximized ? 'Restore to window' : 'Maximize to fullscreen'}
                  aria-label={chatMaximized ? 'Restore chat' : 'Maximize chat'}
                >
                  {chatMaximized ? '⊡' : '⊞'}
                </button>
              )}
              {chatMaximized && (
                <button
                  className="ghost small"
                  type="button"
                  onClick={() => setSplitView(!splitView)}
                  title={splitView ? 'Close split view' : 'Open split view'}
                  aria-label={splitView ? 'Close split view' : 'Open split view'}
                >
                  {splitView ? '⊟' : '⊞⊞'}
                </button>
              )}
              {chatMaximized && (
                <button
                  className="ghost small"
                  type="button"
                  onClick={() => setPipMode(!pipMode)}
                  title={pipMode ? 'Close picture-in-picture' : 'Open picture-in-picture'}
                  aria-label={pipMode ? 'Close PiP' : 'Open PiP'}
                >
                  {pipMode ? '🟪' : '📺'}
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
                className="ghost small"
                type="button"
                onClick={() => {
                  // Find the last assistant message with code block
                  for (let i = chatMessages.length - 1; i >= 0; i--) {
                    if (chatMessages[i].role === 'assistant') {
                      const codeMatch = chatMessages[i].content.match(/```prompt\n([\s\S]*?)\n```/);
                      if (codeMatch) {
                        const promptText = codeMatch[1].trim();
                        // Add to CSV using the global function
                        if (typeof (window as any).csvBuilderAddRow === 'function') {
                          (window as any).csvBuilderAddRow(promptText);
                          showToast('✓ Saved to CSV');
                        } else {
                          showToast('⚠️ Please open CSV Builder first');
                        }
                        return;
                      }
                    }
                  }
                  showToast('No prompt found in chat');
                }}
                title="Save last prompt to CSV (negative field will be blank)"
                aria-label="Save to CSV"
              >
                💾 CSV
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
        )}

        {!chatMinimized && !zenMode && (
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
            {splitView ? (
              <div className="chat-split-container">
                <div className="chat-split-panel" style={{ width: `${dividerPos}%` }}>
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
                // Check if this is a quality analysis message
                if (msg.role === 'assistant' && isQualityAnalysis(msg.content)) {
                  const analysisData = parseQualityAnalysis(msg.content);
                  return (
                    <div key={idx} className="chat-message assistant quality-analysis">
                      <div className="chat-message-row">
                        <div className="chat-avatar" aria-hidden>N</div>
                        <div className="chat-message-body">
                          <div className="chat-message-role">
                            Nicole
                            {msg.timestamp && <span className="chat-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>}
                          </div>
                          <div className="quality-analysis-card">
                            <div className="quality-analysis-header">
                              <div className="quality-score-badge" data-score={analysisData.score >= 80 ? 'high' : analysisData.score >= 60 ? 'medium' : 'low'}>
                                <span className="score-value">{analysisData.score}</span>
                                <span className="score-max">/100</span>
                              </div>
                              <div className="quality-title">
                                <h4>Prompt Quality Analysis</h4>
                                <p>Based on {mode} mode criteria</p>
                              </div>
                            </div>

                            {analysisData.strengths.length > 0 && (
                              <div className="quality-section strengths">
                                <h5>✓ Strengths</h5>
                                <ul>
                                  {analysisData.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {analysisData.improvements.length > 0 && (
                              <div className="quality-section improvements">
                                <h5>⚡ Areas for Improvement</h5>
                                <ul>
                                  {analysisData.improvements.map((imp, i) => (
                                    <li key={i}>{imp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {analysisData.recommendation && (
                              <div className="quality-recommendation">
                                <p>{analysisData.recommendation}</p>
                              </div>
                            )}

                            <div className="quality-actions">
                              <button
                                className="primary"
                                onClick={() => {
                                  const improvementText = analysisData.improvements.length > 0 
                                    ? `Help me improve these aspects: ${analysisData.improvements.join(', ')}`
                                    : 'Help me further refine this prompt';
                                  setChatInput(improvementText);
                                  if (chatInputRef.current) {
                                    chatInputRef.current.focus();
                                  }
                                  showToast('Improvement request added to input');
                                }}
                              >
                                💡 Apply Improvements to Input
                              </button>
                              <button
                                className="ghost"
                                onClick={() => {
                                  setChatInput('Can you provide a refined version incorporating these improvements?');
                                  if (chatInputRef.current) {
                                    chatInputRef.current.focus();
                                  }
                                }}
                              >
                                Request Refined Version
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Regular message rendering
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
                                            // Save to CSV builder
                                            if (typeof window !== 'undefined' && (window as any).csvBuilderAddRow) {
                                              (window as any).csvBuilderAddRow(actualCode);
                                              showToast('Saved to CSV builder');
                                            } else {
                                              showToast('CSV builder not available');
                                            }
                                          }}
                                          title="Save prompt to CSV builder"
                                        >
                                          CSV
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
                        <div className="chat-message-actions">
                          <button
                            className={`ghost small message-bookmark-btn ${bookmarkedMessages.has(idx) ? 'bookmarked' : ''}`}
                            onClick={() => toggleBookmark(idx)}
                            title={bookmarkedMessages.has(idx) ? 'Remove bookmark' : 'Bookmark message'}
                            aria-label="Toggle bookmark"
                          >
                            {bookmarkedMessages.has(idx) ? '⭐' : '☆'}
                          </button>
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
                  </div>

                  <div
                    className="chat-split-divider"
                    onMouseDown={() => setIsDraggingDivider(true)}
                    style={{ left: `${dividerPos}%` }}
                  />

                  <div className="chat-split-panel preview-panel" style={{ width: `${100 - dividerPos}%` }}>
                    <div className="preview-placeholder">
                      <p>📊 Preview content</p>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="chat-messages" ref={chatMessagesRef}>
                {/* Continue Banner */}
                {showContinueBanner && chatMessages.length === 0 && (
                  <div className="continue-banner">
                    <div className="continue-banner-content">
                      <span className="continue-icon">📂</span>
                      <div className="continue-text">
                        <strong>Continue where you left off?</strong>
                        <p>Your previous conversation is waiting to be restored.</p>
                      </div>
                      <button
                        className="primary small"
                        onClick={restorePreviousSession}
                      >
                        Restore
                      </button>
                      <button
                        className="ghost small"
                        onClick={() => setShowContinueBanner(false)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

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
                  // Check if this is a quality analysis message
                  if (msg.role === 'assistant' && isQualityAnalysis(msg.content)) {
                    const analysisData = parseQualityAnalysis(msg.content);
                    return (
                      <div key={idx} className="chat-message assistant quality-analysis">
                        <div className="chat-message-row">
                          <div className="chat-avatar" aria-hidden>N</div>
                          <div className="chat-message-body">
                            <div className="chat-message-role">
                              Nicole
                              {msg.timestamp && <span className="chat-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>}
                            </div>
                            <div className="quality-analysis-card">
                              <div className="quality-analysis-header">
                                <div className="quality-score-badge" data-score={analysisData.score >= 80 ? 'high' : analysisData.score >= 60 ? 'medium' : 'low'}>
                                  <span className="score-value">{analysisData.score}</span>
                                  <span className="score-max">/100</span>
                                </div>
                                <div className="quality-title">
                                  <h4>Prompt Quality Analysis</h4>
                                  <p>Based on {mode} mode criteria</p>
                                </div>
                              </div>

                              {analysisData.strengths.length > 0 && (
                                <div className="quality-section strengths">
                                  <h5>✓ Strengths</h5>
                                  <ul>
                                    {analysisData.strengths.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {analysisData.improvements.length > 0 && (
                                <div className="quality-section improvements">
                                  <h5>⚡ Areas for Improvement</h5>
                                  <ul>
                                    {analysisData.improvements.map((imp, i) => (
                                      <li key={i}>{imp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {analysisData.recommendation && (
                                <div className="quality-recommendation">
                                  <p>{analysisData.recommendation}</p>
                                </div>
                              )}

                              <div className="quality-actions">
                                <button
                                  className="primary"
                                  onClick={() => {
                                    const improvementText = analysisData.improvements.length > 0 
                                      ? `Help me improve these aspects: ${analysisData.improvements.join(', ')}`
                                      : 'Help me further refine this prompt';
                                    setChatInput(improvementText);
                                    if (chatInputRef.current) {
                                      chatInputRef.current.focus();
                                    }
                                    showToast('Improvement request added to input');
                                  }}
                                >
                                  💡 Apply Improvements to Input
                                </button>
                                <button
                                  className="ghost"
                                  onClick={() => {
                                    setChatInput('Can you provide a refined version incorporating these improvements?');
                                    if (chatInputRef.current) {
                                      chatInputRef.current.focus();
                                    }
                                  }}
                                >
                                  Request Refined Version
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Regular message rendering
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
            )}

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

            {!presentationMode && (
              <div className="chat-input-area">
                {/* Voice Recording Transcript Display */}
                {isRecording && transcript && (
                  <div className="voice-transcript-display">
                    <span className="recording-indicator">🎤 Recording...</span>
                    <span className="transcript-text">{transcript}</span>
                  </div>
                )}

                {/* Quick Actions Toolbar */}
                {showQuickActions && (
                  <div className="quick-actions-toolbar">
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        setChatInput(chatInput + ' [context needed]');
                        showToast('Quick action added');
                      }}
                      title="Attach context"
                      aria-label="Attach context"
                    >
                      📎
                    </button>
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        setChatInput(chatInput + ' Make this more ' + editorTone);
                        showToast('Tone suggestion added');
                      }}
                      title="Change tone"
                      aria-label="Change tone"
                    >
                      🎨
                    </button>
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        // Find last assistant message and request regeneration
                        for (let i = chatMessages.length - 1; i >= 0; i--) {
                          if (chatMessages[i].role === 'assistant') {
                            setChatInput('Can you regenerate that last response with a different approach?');
                            if (chatInputRef.current) chatInputRef.current.focus();
                            return;
                          }
                        }
                        showToast('No assistant message to regenerate');
                      }}
                      title="Regenerate last response"
                      aria-label="Regenerate"
                    >
                      🔄
                    </button>
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        for (let i = chatMessages.length - 1; i >= 0; i--) {
                          if (chatMessages[i].role === 'assistant') {
                            navigator.clipboard.writeText(chatMessages[i].content);
                            showToast('Last response copied');
                            return;
                          }
                        }
                      }}
                      title="Copy last response"
                      aria-label="Copy last"
                    >
                      📋
                    </button>
                    <button
                      className="quick-action-btn"
                      onClick={() => {
                        addToPromptHistory(chatInput);
                        showToast('Message bookmarked');
                      }}
                      title="Bookmark message"
                      aria-label="Bookmark"
                    >
                      ⭐
                    </button>
                  </div>
                )}

                <div className="chat-input-wrapper">
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
                  <div className="chat-input-side-buttons">
                    <button
                      className={`voice-btn ${isRecording ? 'recording' : ''}`}
                      type="button"
                      onClick={toggleVoiceRecording}
                      title={isRecording ? 'Stop recording' : 'Start voice input'}
                      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                    >
                      {isRecording ? '🎤' : '🎙️'}
                    </button>
                    <button
                      className="quick-actions-toggle"
                      type="button"
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      title="Quick actions menu"
                      aria-label="Show quick actions"
                    >
                      ⚡
                    </button>
                  </div>
                </div>

                <div className="chat-input-buttons">
                  {onAnalyzeQuality && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={onAnalyzeQuality}
                      disabled={!ollamaSettings.enabled || chatSending || analyzingQuality}
                      title="Analyze prompt quality using Ollama"
                      aria-label="Analyze prompt quality"
                    >
                      {analyzingQuality ? '🔍 Analyzing...' : '🔍 Analyze Quality'}
                    </button>
                  )}
                  <button
                    className="primary"
                    type="button"
                    onClick={sendChatMessage}
                    disabled={!ollamaSettings.enabled || chatSending || !chatInput.trim()}
                  >
                    {chatSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Sidebar Panel */}
        {statsPanel && chatMaximized && !presentationMode && (
          <div className="chat-stats-panel">
            <div className="stats-panel-header">
              <h4>📊 Conversation Stats</h4>
              <button className="ghost small" onClick={() => setStatsPanel(false)}>✕</button>
            </div>
            <div className="stats-panel-content">
              <div className="stat-item">
                <span className="stat-label">📨 Messages</span>
                <span className="stat-value">{chatMessages.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">💬 User Messages</span>
                <span className="stat-value">{chatMessages.filter(m => m.role === 'user').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">🤖 AI Responses</span>
                <span className="stat-value">{chatMessages.filter(m => m.role === 'assistant').length}</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-label">📝 Total Words</span>
                <span className="stat-value">
                  {chatMessages.reduce((sum, msg) => sum + msg.content.split(/\s+/).filter(w => w).length, 0)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">🔤 Total Characters</span>
                <span className="stat-value">
                  {chatMessages.reduce((sum, msg) => sum + msg.content.length, 0)}
                </span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-label">⏱️ Duration</span>
                <span className="stat-value">
                  {elapsedSeconds < 60 ? `${elapsedSeconds}s` : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`}
                </span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-label">🤖 Model</span>
                <span className="stat-value">{chatModel || ollamaSettings.model}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">📌 Mode</span>
                <span className="stat-value">{chatMode === 'ltx' ? 'LTX' : chatMode === 'flux' ? 'Flux' : chatMode === 'sd' ? 'SD' : 'General'}</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-label">⭐ Bookmarks</span>
                <span className="stat-value">{bookmarkedMessages.size}</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <span className="stat-label">📤 Export & Save</span>
                <div className="stat-export-buttons">
                  <button
                    className="stat-export-btn"
                    onClick={exportMarkdown}
                    title="Download as Markdown file"
                  >
                    📄 MD
                  </button>
                  <button
                    className="stat-export-btn"
                    onClick={exportJSON}
                    title="Download as JSON file"
                  >
                    📋 JSON
                  </button>
                  <button
                    className="stat-export-btn"
                    onClick={exportBookmarks}
                    title="Export bookmarked messages"
                    disabled={bookmarkedMessages.size === 0}
                  >
                    ⭐ Save
                  </button>
                </div>
              </div>

              {/* Auto-save indicator */}
              {autoSaveIndicator && (
                <div className="auto-save-indicator">
                  <span className="auto-save-dot">✓</span> Auto-saved
                </div>
              )}
            </div>
          </div>
        )}

        {/* Picture-in-Picture Mini Chat */}
        {pipMode && (
          <div
            ref={pipRef}
            className="chat-pip-window"
            style={{
              left: `${pipPos.x}px`,
              top: `${pipPos.y}px`
            }}
            onMouseDown={() => setIsDraggingPip(true)}
          >
            <div className="pip-header">
              <span className="pip-title">💬 Mini Chat</span>
              <button
                className="pip-close"
                onClick={() => setPipMode(false)}
                title="Close PiP"
              >
                ✕
              </button>
            </div>
            <div className="pip-messages">
              {chatMessages.slice(-3).map((msg, idx) => (
                <div key={idx} className={`pip-message ${msg.role}`}>
                  <strong>{msg.role === 'user' ? 'You' : 'Nicole'}:</strong>
                  <p>{msg.content.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
            <div className="pip-footer">
              <span className="pip-count">{chatMessages.length} messages</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings Menu Modal */}
      {chatSettingsOpen && setChatMode && (
        <div className="settings-overlay" onMouseDown={() => setChatSettingsOpen(false)}>
          <div className="settings-panel chat-settings-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <h3 className="settings-title">Chat Settings</h3>
                <p className="hint">Configure chat mode and AI model preferences</p>
              </div>
              <button className="ghost" type="button" onClick={() => setChatSettingsOpen(false)}>Close</button>
            </div>
            <div className="settings-body settings-body-single-col">
              <div className="field-group">
                <label className="field-label">Chat Mode</label>
                <p className="hint">Select the type of prompts you're working with</p>
                <div className="mode-selector-grid">
                  <button
                    className={`mode-card ${chatMode === 'ltx' ? 'active' : ''}`}
                    onClick={() => {
                      setChatMode('ltx');
                      showToast('LTX Video prompt creator mode activated');
                    }}
                  >
                    <div className="mode-icon">🎬</div>
                    <div className="mode-title">LTX Video prompt creator</div>
                    <div className="mode-desc">Cinematic video generation</div>
                  </button>
                  <button
                    className={`mode-card ${chatMode === 'flux' ? 'active' : ''}`}
                    onClick={() => {
                      setChatMode('flux');
                      showToast('Flux mode activated');
                    }}
                  >
                    <div className="mode-icon">✨</div>
                    <div className="mode-title">Flux</div>
                    <div className="mode-desc">High-quality image generation</div>
                  </button>
                  <button
                    className={`mode-card ${chatMode === 'sd' ? 'active' : ''}`}
                    onClick={() => {
                      setChatMode('sd');
                      showToast('Stable Diffusion mode activated');
                    }}
                  >
                    <div className="mode-icon">🖼️</div>
                    <div className="mode-title">Stable Diffusion</div>
                    <div className="mode-desc">Versatile image creation</div>
                  </button>
                  <button
                    className={`mode-card ${!chatMode || chatMode === 'general' ? 'active' : ''}`}
                    onClick={() => {
                      setChatMode('general');
                      showToast('General mode activated');
                    }}
                  >
                    <div className="mode-icon">💬</div>
                    <div className="mode-title">General</div>
                    <div className="mode-desc">All-purpose assistance</div>
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">AI Model</label>
                <select
                  className="field-select"
                  value={chatModel || ollamaSettings.model}
                  onChange={(e) => setChatModel(e.target.value)}
                  disabled={!ollamaSettings.enabled}
                >
                  {ollamaAvailableModels.length > 0 ? (
                    ollamaAvailableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value={ollamaSettings.model}>{ollamaSettings.model}</option>
                  )}
                </select>
                <p className="hint">Selected model: {chatModel || ollamaSettings.model}</p>
              </div>

              <div className="field-group">
                <label className="field-label">Temperature</label>
                <div className="slider-field">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={chatTemperature}
                    onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
                    className="field-slider"
                  />
                  <span className="slider-value">{chatTemperature.toFixed(1)}</span>
                </div>
                <p className="hint">Controls randomness: 0 = deterministic, 2 = very creative</p>
              </div>

              <div className="field-group">
                <label className="field-label">Max Tokens</label>
                <input
                  type="number"
                  min="128"
                  max="8192"
                  step="128"
                  value={chatMaxTokens}
                  onChange={(e) => setChatMaxTokens(parseInt(e.target.value))}
                  className="field-input"
                />
                <p className="hint">Maximum response length (tokens)</p>
              </div>

              <div className="field-group">
                <label className="field-label">Top P (Nucleus Sampling)</label>
                <div className="slider-field">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={chatTopP}
                    onChange={(e) => setChatTopP(parseFloat(e.target.value))}
                    className="field-slider"
                  />
                  <span className="slider-value">{chatTopP.toFixed(2)}</span>
                </div>
                <p className="hint">Controls diversity: lower = more focused, higher = more diverse</p>
              </div>

              <div className="field-group">
                <label className="field-label">Stream Responses</label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={chatStreamEnabled}
                    onChange={(e) => setChatStreamEnabled(e.target.checked)}
                  />
                  <span>Enable streaming responses (real-time output)</span>
                </label>
              </div>

              <div className="field-group">
                <button
                  className="ghost"
                  onClick={() => {
                    setChatSystemPromptModalOpen(true);
                    setChatSettingsOpen(false);
                  }}
                >
                  Edit System Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Keyboard Help Overlay */}
      {showKeyboardHelp && chatMaximized && (
        <div className="keyboard-help-overlay" onClick={() => setShowKeyboardHelp(false)}>
          <div className="keyboard-help-panel" onClick={(e) => e.stopPropagation()}>
            <div className="keyboard-help-header">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <button className="ghost small" onClick={() => setShowKeyboardHelp(false)}>✕</button>
            </div>
            <div className="keyboard-help-content">
              <div className="shortcut-group">
                <h4>Navigation</h4>
                <div className="shortcut-item">
                  <kbd>ESC</kbd>
                  <span>Exit fullscreen</span>
                </div>
                <div className="shortcut-item">
                  <kbd>F11</kbd>
                  <span>Toggle fullscreen</span>
                </div>
                <div className="shortcut-item">
                  <kbd>?</kbd>
                  <span>Show/hide this help</span>
                </div>
              </div>
              <div className="shortcut-group">
                <h4>View Modes</h4>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Z</kbd>
                  <span>Toggle Zen mode (hide UI)</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
                  <span>Toggle Presentation mode</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>I</kbd>
                  <span>Toggle Stats panel</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>L</kbd>
                  <span>Toggle Split view</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl</kbd> + <kbd>M</kbd>
                  <span>Toggle Picture-in-Picture</span>
                </div>
              </div>
              <div className="shortcut-group">
                <h4>Input</h4>
                <div className="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>Send message</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Shift</kbd> + <kbd>Enter</kbd>
                  <span>New line</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
