'use client';

import React, { useMemo, useRef, useCallback } from 'react';

interface VirtualizedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  id: string;
}

interface VirtualizedChatPanelProps {
  messages: VirtualizedMessage[];
  isLoading?: boolean;
  onScroll?: (scrollPercent: number) => void;
}

// Approximate height of a message (will vary with content, but this is a reasonable estimate)
const ESTIMATED_MESSAGE_HEIGHT = 80;
const BUFFER_SIZE = 5; // Number of items to render outside the visible area

const VirtualizedChatPanel: React.FC<VirtualizedChatPanelProps> = ({
  messages,
  isLoading = false,
  onScroll
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 10 });
  const [itemHeights, setItemHeights] = React.useState<Record<string, number>>({});

  // Calculate visible range based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Calculate which items should be visible
    const start = Math.max(0, Math.floor(scrollTop / ESTIMATED_MESSAGE_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      messages.length,
      Math.ceil((scrollTop + containerHeight) / ESTIMATED_MESSAGE_HEIGHT) + BUFFER_SIZE
    );

    setVisibleRange({ start, end });

    // Calculate scroll percentage
    const scrollPercent =
      (scrollTop / (innerRef.current?.clientHeight || 1 - containerHeight)) * 100;
    onScroll?.(Math.min(100, scrollPercent));
  }, [messages.length, onScroll]);

  // Measure actual heights when messages render
  const setItemHeight = useCallback((id: string, height: number) => {
    setItemHeights(prev => {
      if (prev[id] !== height) {
        return { ...prev, [id]: height };
      }
      return prev;
    });
  }, []);

  // Calculate total height and offsets
  const { totalHeight, offsets } = useMemo(() => {
    let total = 0;
    const messageOffsets: Record<string, number> = {};

    for (const msg of messages) {
      messageOffsets[msg.id] = total;
      const height = itemHeights[msg.id] || ESTIMATED_MESSAGE_HEIGHT;
      total += height;
    }

    return { totalHeight: total, offsets: messageOffsets };
  }, [messages, itemHeights]);

  // Get visible items with proper offsets
  const visibleItems = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end).map(msg => ({
      msg,
      offset: offsets[msg.id] || 0,
      index: messages.indexOf(msg)
    }));
  }, [messages, visibleRange, offsets]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      // Check if already at bottom
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isAtBottom) {
        containerRef.current.scrollTop = scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="virtualized-chat-container"
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div
        ref={innerRef}
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleItems.map(({ msg, offset }) => (
          <VirtualizedMessageItem
            key={msg.id}
            message={msg}
            offset={offset}
            onHeightChange={(height) => setItemHeight(msg.id, height)}
          />
        ))}

        {isLoading && (
          <div className="chat-message assistant" style={{ marginTop: '12px' }}>
            <div className="chat-message-row">
              <div className="chat-avatar" aria-hidden>
                N
              </div>
              <div className="chat-message-body">
                <div className="chat-message-role">Nicole</div>
                <div className="chat-message-content chat-typing">Thinking...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface VirtualizedMessageItemProps {
  message: VirtualizedMessage;
  offset: number;
  onHeightChange: (height: number) => void;
}

const VirtualizedMessageItem: React.FC<VirtualizedMessageItemProps> = ({
  message,
  offset,
  onHeightChange
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (itemRef.current) {
      const height = itemRef.current.clientHeight;
      onHeightChange(height);
    }
  }, [message.content, onHeightChange]);

  type MessagePart =
    | { type: 'text'; text: string }
    | { type: 'code'; code: string; lang: string };

  const parseMessageParts = (content: string): MessagePart[] => {
    const parts: MessagePart[] = [];
    const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.substring(lastIndex, match.index) });
      }

      // Add code block
      parts.push({
        type: 'code',
        lang: match[1] || 'plaintext',
        code: (match[2] || '').trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.substring(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', text: content }];
  };

  const parts = parseMessageParts(message.content);
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : null;

  return (
    <div
      ref={itemRef}
      className={`chat-message ${message.role}`}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      <div className="chat-message-row">
        <div className="chat-avatar" aria-hidden>
          {message.role === 'user' ? 'Y' : 'N'}
        </div>
        <div className="chat-message-body">
          <div className="chat-message-role">
            {message.role === 'user' ? 'You' : 'Nicole'}
            {timestamp && <span className="chat-timestamp">{timestamp}</span>}
          </div>
          <div className="chat-message-content">
            {parts.map((part, i) => {
              if (part.type === 'code') {
                return (
                  <div key={i} className="code-block">
                    <div className="code-block-header">
                      <span className="code-type">{part.lang || 'code'}</span>
                      <button
                        className="code-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(part.code || '');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="code-block-content">{part.code}</pre>
                  </div>
                );
              }

              return <p key={i}>{part.text || ''}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedChatPanel;
export { type VirtualizedMessage, type VirtualizedChatPanelProps };