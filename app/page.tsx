'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const WELCOME_SEEN_KEY = 'oyama_prompt_pro_welcome_seen_v1';

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
      if (seen) {
        router.replace('/wizard');
        return;
      }
    } catch {
      // ignore
    }
    setVisible(true);
  }, [router]);

  const handleStart = () => {
    try { window.localStorage.setItem(WELCOME_SEEN_KEY, '1'); } catch { /* localStorage unavailable in some environments */ }
    router.push('/wizard');
  };

  if (!visible) return null;

  return (
    <main style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100%', background: '#f5f3f0', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <section style={{
        textAlign: 'center', maxWidth: 480, padding: '48px 32px',
        background: '#fff', borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)',
        border: '1px solid #e8e5e0',
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>✦</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2d2a26', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Oyama Prompt Pro
        </h1>
        <p style={{ fontSize: 15, color: '#8a8580', margin: '0 0 32px', lineHeight: 1.6 }}>
          A premium prompt engineering studio.<br />
          Craft, version, and test AI prompts with Ollama.
        </p>
        <button
          onClick={handleStart}
          type="button"
          style={{
            padding: '12px 36px', fontSize: 15, fontWeight: 600,
            background: '#2d2a26', color: '#fff', border: 'none',
            borderRadius: 10, cursor: 'pointer', letterSpacing: '0.2px',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#4a4540')}
          onMouseOut={e => (e.currentTarget.style.background = '#2d2a26')}
        >
          Get Started
        </button>
      </section>
    </main>
  );
}
