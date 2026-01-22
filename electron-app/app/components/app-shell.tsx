'use client';

import { useEffect } from 'react';
import TitleBar from './titlebar';
import './layout.css';
import './components.css';
import { loadAccentColor } from '../utils/accentColors';

export function AppShell({ children }: { children: React.ReactNode }) {
  // Initialize accent color on mount
  useEffect(() => {
    loadAccentColor();
  }, []);

  return (
    <div className="app-shell">
      <TitleBar />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}
