'use client';

import TitleBar from './titlebar';
import './layout.css';
import './components.css';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <TitleBar />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}
