/**
 * Chat History Management System
 * Handles storage, retrieval, and persistence of chat conversations
 */

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatHistoryMessage[];
  mode: 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';
  model: string;
  createdAt: number;
  updatedAt: number;
  isStarred: boolean;
  tags: string[];
  summary?: string;
}

const CHAT_HISTORY_KEY = 'ltx_prompter_chat_history_v1';
const CHAT_SESSIONS_KEY = 'ltx_prompter_chat_sessions_v1';
const MAX_SESSIONS = 100;
const SESSION_STORAGE_LIMIT = 10 * 1024 * 1024; // 10MB

class ChatHistoryManager {
  /**
   * Generate a unique ID for a chat session
   */
  static generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new chat session
   */
  static createSession(
    title: string,
    mode: ChatSession['mode'],
    model: string,
    messages: ChatHistoryMessage[] = []
  ): ChatSession {
    return {
      id: this.generateSessionId(),
      title,
      messages,
      mode,
      model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isStarred: false,
      tags: []
    };
  }

  /**
   * Save a chat session to localStorage
   */
  static saveSession(session: ChatSession): boolean {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updatedAt: Date.now() };
      } else {
        sessions.unshift(session);
      }

      // Keep only the most recent sessions if we exceed the limit
      if (sessions.length > MAX_SESSIONS) {
        sessions.splice(MAX_SESSIONS);
      }

      const data = JSON.stringify(sessions);
      
      // Check storage limit
      if (data.length > SESSION_STORAGE_LIMIT) {
        console.warn('Chat history storage limit approaching');
        // Remove oldest sessions
        sessions.splice(MAX_SESSIONS - 10);
        window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      } else {
        window.localStorage.setItem(CHAT_SESSIONS_KEY, data);
      }

      return true;
    } catch (error) {
      console.error('Failed to save chat session:', error);
      return false;
    }
  }

  /**
   * Load a specific chat session by ID
   */
  static getSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to load chat session:', error);
      return null;
    }
  }

  /**
   * Get all chat sessions
   */
  static getAllSessions(): ChatSession[] {
    try {
      const raw = window.localStorage.getItem(CHAT_SESSIONS_KEY);
      if (!raw) return [];
      const sessions = JSON.parse(raw) as ChatSession[];
      // Sort by most recent first
      return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    }
  }

  /**
   * Search chat sessions by title or content
   */
  static searchSessions(query: string): ChatSession[] {
    const sessions = this.getAllSessions();
    const lowerQuery = query.toLowerCase();

    return sessions.filter(session => {
      const titleMatch = session.title.toLowerCase().includes(lowerQuery);
      const contentMatch = session.messages.some(msg =>
        msg.content.toLowerCase().includes(lowerQuery)
      );
      const tagMatch = session.tags.some(tag =>
        tag.toLowerCase().includes(lowerQuery)
      );

      return titleMatch || contentMatch || tagMatch;
    });
  }

  /**
   * Filter sessions by mode
   */
  static filterByMode(mode: ChatSession['mode']): ChatSession[] {
    return this.getAllSessions().filter(s => s.mode === mode);
  }

  /**
   * Filter sessions by tags
   */
  static filterByTags(tags: string[]): ChatSession[] {
    return this.getAllSessions().filter(session =>
      tags.some(tag => session.tags.includes(tag))
    );
  }

  /**
   * Get starred sessions
   */
  static getStarredSessions(): ChatSession[] {
    return this.getAllSessions().filter(s => s.isStarred);
  }

  /**
   * Toggle star status for a session
   */
  static toggleStar(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.isStarred = !session.isStarred;
    session.updatedAt = Date.now();
    return this.saveSession(session);
  }

  /**
   * Add a tag to a session
   */
  static addTag(sessionId: string, tag: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    if (!session.tags.includes(tag)) {
      session.tags.push(tag);
      session.updatedAt = Date.now();
      return this.saveSession(session);
    }

    return true;
  }

  /**
   * Remove a tag from a session
   */
  static removeTag(sessionId: string, tag: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.tags = session.tags.filter(t => t !== tag);
    session.updatedAt = Date.now();
    return this.saveSession(session);
  }

  /**
   * Add a message to a session
   */
  static addMessage(sessionId: string, message: ChatHistoryMessage): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.messages.push(message);
    session.updatedAt = Date.now();
    return this.saveSession(session);
  }

  /**
   * Delete a chat session
   */
  static deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete chat session:', error);
      return false;
    }
  }

  /**
   * Delete multiple sessions
   */
  static deleteSessions(sessionIds: string[]): boolean {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter(s => !sessionIds.includes(s.id));
      window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete chat sessions:', error);
      return false;
    }
  }

  /**
   * Export a chat session as JSON
   */
  static exportAsJson(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  /**
   * Export a chat session as Markdown
   */
  static exportAsMarkdown(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    let markdown = `# ${session.title}\n\n`;
    markdown += `**Mode**: ${session.mode}\n`;
    markdown += `**Model**: ${session.model}\n`;
    markdown += `**Created**: ${new Date(session.createdAt).toLocaleString()}\n`;
    markdown += `**Updated**: ${new Date(session.updatedAt).toLocaleString()}\n\n`;

    if (session.tags.length > 0) {
      markdown += `**Tags**: ${session.tags.join(', ')}\n\n`;
    }

    markdown += '---\n\n';

    for (const msg of session.messages) {
      const role = msg.role === 'user' ? 'You' : 'Nicole';
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      markdown += `**${role}** *(${timestamp})*:\n\n${msg.content}\n\n`;
    }

    return markdown;
  }

  /**
   * Export a chat session as plain text
   */
  static exportAsText(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    let text = `${session.title}\n`;
    text += `${'='.repeat(session.title.length)}\n\n`;
    text += `Mode: ${session.mode}\n`;
    text += `Model: ${session.model}\n`;
    text += `Created: ${new Date(session.createdAt).toLocaleString()}\n\n`;

    for (const msg of session.messages) {
      const role = msg.role === 'user' ? 'You' : 'Nicole';
      text += `${role}:\n${msg.content}\n\n`;
    }

    return text;
  }

  /**
   * Import chat session from JSON
   */
  static importFromJson(jsonString: string): ChatSession | null {
    try {
      const data = JSON.parse(jsonString) as Partial<ChatSession>;

      // Validate required fields
      if (!data.id || !data.title || !data.messages || !data.mode) {
        return null;
      }

      const session: ChatSession = {
        id: this.generateSessionId(), // Generate new ID to avoid conflicts
        title: data.title,
        messages: data.messages,
        mode: data.mode,
        model: data.model || 'llama2',
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
        isStarred: data.isStarred || false,
        tags: data.tags || []
      };

      return this.saveSession(session) ? session : null;
    } catch (error) {
      console.error('Failed to import chat session:', error);
      return null;
    }
  }

  /**
   * Generate a summary of the chat
   */
  static generateSummary(sessionId: string, maxLength: number = 100): string | null {
    const session = this.getSession(sessionId);
    if (!session || session.messages.length === 0) return null;

    // Get first user message as summary base
    const firstUserMessage = session.messages.find(m => m.role === 'user');
    if (!firstUserMessage) return null;

    const summary = firstUserMessage.content.substring(0, maxLength);
    return summary.length === maxLength ? summary + '...' : summary;
  }

  /**
   * Clear all chat history (use with caution)
   */
  static clearAllHistory(): boolean {
    try {
      window.localStorage.removeItem(CHAT_SESSIONS_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      return false;
    }
  }

  /**
   * Get storage usage stats
   */
  static getStorageStats(): {
    totalSessions: number;
    totalMessages: number;
    storageSize: number;
    percentOfLimit: number;
  } {
    try {
      const sessions = this.getAllSessions();
      const data = JSON.stringify(sessions);

      return {
        totalSessions: sessions.length,
        totalMessages: sessions.reduce((sum, s) => sum + s.messages.length, 0),
        storageSize: new Blob([data]).size,
        percentOfLimit: (new Blob([data]).size / SESSION_STORAGE_LIMIT) * 100
      };
    } catch (error) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        storageSize: 0,
        percentOfLimit: 0
      };
    }
  }
}

export default ChatHistoryManager;