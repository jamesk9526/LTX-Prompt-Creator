'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './titlebar.module.css';

interface WindowState {
  isMaximized: boolean;
}

export default function TitleBar() {
  const [windowState, setWindowState] = useState<WindowState>({ isMaximized: false });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Get initial window state
    const getState = async () => {
      try {
        const state = await (window as any).electron?.windowControl?.getState();
        if (state) {
          setWindowState(state);
        }
      } catch (err) {
        console.error('Failed to get window state:', err);
      }
    };

    getState();

    // Listen for window state changes
    const handleMaximize = () => setWindowState(prev => ({ ...prev, isMaximized: true }));
    const handleUnmaximize = () => setWindowState(prev => ({ ...prev, isMaximized: false }));

    const electronAPI = (window as any).electron;
    if (electronAPI?.ipcRenderer?.on) {
      electronAPI.ipcRenderer.on('window-state', (state: WindowState) => {
        setWindowState(state);
      });
    }

    // Listen to window events if available
    const ipcRenderer = electronAPI?.ipcRenderer;
    if (ipcRenderer) {
      ipcRenderer.on('window-state', handleMaximize);
    }

    return () => {
      // Cleanup
    };
  }, []);

  const handleMinimize = () => {
    (window as any).electron?.windowControl?.minimize?.();
  };

  const handleMaximize = () => {
    (window as any).electron?.windowControl?.maximize?.();
  };

  const handleClose = () => {
    (window as any).electron?.windowControl?.close?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from empty titlebar area (not buttons)
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div
      className={styles.titlebar}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.brand}>
        <Image className={styles.brandIcon} src="/icon.svg" alt="" width={18} height={18} priority />
        <div className={styles.title}>LTX Prompter</div>
      </div>
      <div className={styles.controls}>
        <button
          className={styles.button}
          onClick={handleMinimize}
          title="Minimize"
          aria-label="Minimize window"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect y="6" width="12" height="1" fill="currentColor" />
          </svg>
        </button>

        <button
          className={styles.button}
          onClick={handleMaximize}
          title={windowState.isMaximized ? 'Restore' : 'Maximize'}
          aria-label={windowState.isMaximized ? 'Restore window' : 'Maximize window'}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {windowState.isMaximized ? (
              <>
                <rect x="2" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1" fill="none" />
                <rect x="3" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1" fill="none" />
              </>
            ) : (
              <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" />
            )}
          </svg>
        </button>

        <button
          className={`${styles.button} ${styles.closeButton}`}
          onClick={handleClose}
          title="Close"
          aria-label="Close window"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
