'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const WELCOME_SEEN_KEY = 'ltx_prompter_welcome_seen_v1';

function Typewriter({
  text,
  speedMs = 14,
  startDelayMs = 180,
}: {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
}) {
  const [out, setOut] = useState('');

  useEffect(() => {
    let i = 0;
    let interval: number | undefined;
    setOut('');

    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length && interval) window.clearInterval(interval);
      }, speedMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);

  return (
    <span>
      {out}
      <span aria-hidden="true" className="welcome-caret">▍</span>
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const [skipWelcome, setSkipWelcome] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
      if (seen) router.replace('/wizard');
    } catch {
      // ignore
    }
  }, [router]);

  useEffect(() => {
    if (!skipWelcome) return;
    try {
      window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {
      // ignore
    }
  }, [skipWelcome]);

  const lines = useMemo(
    () => [
      "Hey — I’m here to help you write a killer prompt.",
      "I’ll ask a few quick questions, then we’ll build it together.",
    ],
    []
  );

  return (
    <main className="welcome-shell">
      <section className="welcome-card">
        <h1 className="welcome-title">LTX Prompter</h1>
        <p className="welcome-sub">
          A guided, friendly prompt wizard with customizable presets.
        </p>

        <div className="welcome-bubble" aria-label="Welcome message">
          <p className="welcome-line">
            <Typewriter text={lines[0]} speedMs={13} />
          </p>
          <p className="welcome-line welcome-line2">
            <Typewriter text={lines[1]} speedMs={13} startDelayMs={900} />
          </p>
        </div>

        <div className="welcome-actions">
          <button className="button primary" onClick={() => router.push('/wizard')} type="button">
            Let’s start
          </button>
          <Link className="button" href="/wizard">
            Skip
          </Link>
          <Link className="button muted-link" href="/legacy">
            Legacy
          </Link>
        </div>

        <label className="welcome-dontshow">
          <input
            type="checkbox"
            checked={skipWelcome}
            onChange={(e) => setSkipWelcome(e.target.checked)}
            aria-label="Don’t show this welcome screen again"
          />
          <span className="welcome-dontshow-text">Don’t show this again</span>
        </label>
      </section>
    </main>
  );
}
