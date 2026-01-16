/**
 * useActionHistory Hook
 * Manages action execution history with replay and undo capabilities
 */

import { useState, useCallback, useRef } from 'react';
import { Action, ActionExecutionReport } from '../types/actions';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  actions: Action[];
  report: ActionExecutionReport;
}

export interface UseActionHistoryReturn {
  history: HistoryEntry[];
  currentIndex: number;
  addEntry: (actions: Action[], report: ActionExecutionReport) => void;
  undo: () => void;
  redo: () => void;
  goToEntry: (index: number) => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportHistory: () => string;
  importHistory: (json: string) => boolean;
}

/**
 * Hook for managing action history
 */
export function useActionHistory(maxSize: number = 100): UseActionHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const historyIdRef = useRef(0);

  const addEntry = useCallback(
    (actions: Action[], report: ActionExecutionReport) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        const newEntry: HistoryEntry = {
          id: `action_${++historyIdRef.current}`,
          timestamp: Date.now(),
          actions: [...actions],
          report,
        };
        newHistory.push(newEntry);

        // Limit history size
        if (newHistory.length > maxSize) {
          newHistory.shift();
        }

        return newHistory;
      });

      setCurrentIndex((prev) => Math.min(prev + 1, history.length));
    },
    [history.length, currentIndex, maxSize]
  );

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, -1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const goToEntry = useCallback((index: number) => {
    if (index >= -1 && index < history.length) {
      setCurrentIndex(index);
    }
  }, [history.length]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    historyIdRef.current = 0;
  }, []);

  const exportHistory = useCallback((): string => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  const importHistory = useCallback((json: string): boolean => {
    try {
      const imported = JSON.parse(json) as HistoryEntry[];
      if (!Array.isArray(imported)) return false;

      setHistory(imported);
      setCurrentIndex(Math.max(imported.length - 1, -1));
      return true;
    } catch {
      return false;
    }
  }, []);

  const canUndo = currentIndex > -1;
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addEntry,
    undo,
    redo,
    goToEntry,
    clearHistory,
    canUndo,
    canRedo,
    exportHistory,
    importHistory,
  };
}

/**
 * Hook for session-based action tracking
 * Stores in localStorage for persistence
 */
export function useSessionActionTracker(sessionId: string) {
  const storageKey = `action_session_${sessionId}`;

  const saveSession = useCallback(
    (history: HistoryEntry[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(history));
      } catch {
        console.warn('[ActionTracker] Failed to save session');
      }
    },
    [storageKey]
  );

  const loadSession = useCallback((): HistoryEntry[] => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      console.warn('[ActionTracker] Failed to clear session');
    }
  }, [storageKey]);

  return { saveSession, loadSession, clearSession };
}
