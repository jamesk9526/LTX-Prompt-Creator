'use client';

import { useEffect, useMemo, useState } from 'react';
import './wizard.css';

const MODES = [
  { id: 'cinematic', title: 'Cinematic', tag: 'Camera-forward', desc: 'Film-inspired framing, motion, and grading.' },
  { id: 'classic', title: 'Classic', tag: 'Balanced', desc: 'Cohesive, versatile looks for general prompts.' },
  { id: 'nsfw', title: 'NSFW', tag: '18+', desc: 'Adult-focused styling. Requires NSFW enabled.' },
];

const OPTION_SETS: Record<string, Record<string, string[]>> = {
  cinematic: {
    genre: ['Sci-fi thriller', 'Period drama', 'Heist sequence', 'Space opera', 'Character study'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot'],
    role: ['Protagonist', 'Investigator', 'Pilot', 'Engineer', 'Anti-hero'],
    mood: ['Tense', 'Hopeful', 'Melancholic', 'Triumphant', 'Mysterious'],
    lighting: ['Volumetric shafts', 'Neon rim light', 'Golden hour', 'High contrast noir', 'Soft bounce'],
    environment: ['Rainy street', 'Neon city', 'Abandoned warehouse', 'Orbiting station', 'Desert expanse'],
  },
  classic: {
    genre: ['Portrait', 'Fashion editorial', 'Documentary', 'Landscape', 'Architectural'],
    shot: ['Three-quarter', 'Half-body', 'Headshot', 'Wide landscape', 'Macro detail'],
    role: ['Artist', 'Explorer', 'Scholar', 'Performer', 'Leader'],
    mood: ['Calm', 'Confident', 'Joyful', 'Reflective', 'Gritty'],
    lighting: ['Soft daylight', 'Studio softbox', 'Split light', 'Backlit glow', 'Window light'],
    environment: ['Modern loft', 'Forest trail', 'Coastal cliffs', 'Old library', 'Glass atrium'],
  },
  nsfw: {
    genre: ['Boudoir', 'Art nude', 'Sensual portrait', 'Glam kink', 'Intimate scene'],
    shot: ['Intimate close-up', 'Half-body', 'Reclined pose', 'Over-shoulder', 'Mirror gaze'],
    role: ['Muse', 'Lover', 'Dominant partner', 'Submissive partner', 'Seductress'],
    mood: ['Sensual', 'Playful', 'Intense', 'Tender', 'Confident'],
    lighting: ['Soft amber', 'Low key shadows', 'Window dusk', 'Colored gels', 'Candle glow'],
    environment: ['Velvet studio', 'Dim apartment', 'Hotel suite', 'Dark lounge', 'Backstage set'],
  },
};

const STEPS = [1, 2, 3, 4];

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'cinematic' | 'classic' | 'nsfw'>('cinematic');
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () => ({ cinematic: {}, classic: {}, nsfw: {} })
  );

  const selects = useMemo(() => OPTION_SETS[mode], [mode]);
  const current = values[mode] || {};

  const summary = useMemo(() => ({ ...current, mode }), [current, mode]);

  useEffect(() => {
    // Initialize defaults when mode changes
    setValues((prev) => {
      const next = { ...prev };
      const defaults = OPTION_SETS[mode];
      if (!next[mode]) next[mode] = {};
      Object.entries(defaults).forEach(([key, arr]) => {
        if (!next[mode][key]) next[mode][key] = arr[0] || '';
      });
      return next;
    });
  }, [mode]);

  const handleSelect = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [field]: value },
    }));
  };

  const canAdvance = () => {
    if (step === 1 && mode === 'nsfw' && !nsfwEnabled) return false;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const prompt = useMemo(() => {
    const v = values[mode] || {};
    const parts: string[] = [labelForMode(mode)];
    if (v.genre) parts.push(v.genre);
    if (v.shot) parts.push(v.shot);
    if (v.role) parts.push(v.role);
    const moodBlock = [v.mood, v.lighting].filter(Boolean).join(' · ');
    if (moodBlock) parts.push(moodBlock);
    if (v.environment) parts.push(`at ${v.environment}`);
    return parts.join(' | ');
  }, [mode, values]);

  return (
    <main className="wizard-shell">
      <div className="progress">
        <div
          className="progress-track"
          style={{ width: `${Math.max(0.25, step / STEPS.length) * 100}%` }}
        />
        <div className="progress-pips">
          {STEPS.map((n) => (
            <div key={n} className={`progress-pip ${n <= step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <section className="steps">
        <article className={`step ${step === 1 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 1</p>
            <h2>Choose your mode</h2>
            <p className="hint">Pick the style. Enable NSFW to unlock NSFW mode.</p>
          </div>
          <div className="mode-grid">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mode-card ${m.id === mode ? 'active' : ''}`}
                onClick={() => setMode(m.id as any)}
              >
                <div className="mode-tag">{m.tag}</div>
                <p className="mode-title">{m.title}</p>
                <p className="hint">{m.desc}</p>
              </button>
            ))}
          </div>
          <div className="nsfw-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={nsfwEnabled}
                onChange={(e) => setNsfwEnabled(e.target.checked)}
              />
              <span className="slider" />
            </label>
            <div>
              <div className="toggle-title">Enable NSFW options</div>
              <div className="toggle-note">Required to proceed with NSFW mode.</div>
            </div>
          </div>
          {!nsfwEnabled && mode === 'nsfw' && (
            <div className="inline-alert">
              <div className="dot" />
              <p>Turn on NSFW to continue with the NSFW mode.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 2 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 2</p>
            <h2>Core setup</h2>
            <p className="hint">Basics: genre, shot, role.</p>
          </div>
          <div className="field-grid">
            {['genre', 'shot', 'role'].map((field) => (
              <label className="field" key={field}>
                <span>{labelForField(field)}</span>
                <select
                  value={current[field] || selects[field]?.[0] || ''}
                  onChange={(e) => handleSelect(field, e.target.value)}
                >
                  {(selects[field] || []).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 3 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 3</p>
            <h2>World & mood</h2>
            <p className="hint">Add tone, lighting, and where this happens.</p>
          </div>
          <div className="field-grid">
            {['mood', 'lighting', 'environment'].map((field) => (
              <label className="field" key={field}>
                <span>{labelForField(field)}</span>
                <select
                  value={current[field] || selects[field]?.[0] || ''}
                  onChange={(e) => handleSelect(field, e.target.value)}
                >
                  {(selects[field] || []).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 4 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 4</p>
            <h2>Review & build</h2>
            <p className="hint">Confirm your picks and grab the prompt.</p>
          </div>
          <div className="summary">
            <SummaryItem label="Mode" value={labelForMode(mode)} />
            <SummaryItem label="Genre" value={current.genre} />
            <SummaryItem label="Shot" value={current.shot} />
            <SummaryItem label="Role" value={current.role} />
            <SummaryItem label="Mood" value={current.mood} />
            <SummaryItem label="Lighting" value={current.lighting} />
            <SummaryItem label="Environment" value={current.environment} />
          </div>
          <div className="output">
            <div className="output-head">
              <div>
                <p className="eyebrow">Generated prompt</p>
                <h3>Copy-ready</h3>
              </div>
              <button className="ghost" type="button" onClick={() => copyPrompt(prompt)}>
                Copy
              </button>
            </div>
            <textarea value={prompt} readOnly rows={6} />
          </div>
        </article>
      </section>

      <footer className="nav">
        <button className="ghost" type="button" onClick={handleBack} disabled={step === 1}>Back</button>
        <div className="nav-spacer" />
        <button className="primary" type="button" onClick={handleNext}>
          {step === STEPS.length ? 'Finish' : 'Next'}
        </button>
      </footer>
    </main>
  );
}

function labelForMode(mode: string) {
  return MODES.find((m) => m.id === mode)?.title || mode;
}

function labelForField(field: string) {
  const map: Record<string, string> = {
    genre: 'Genre / Style',
    shot: 'Shot Type',
    role: 'Subject Role',
    mood: 'Mood',
    lighting: 'Lighting',
    environment: 'Environment',
  };
  return map[field] || field;
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="summary-item">
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value || '—'}</div>
    </div>
  );
}

async function copyPrompt(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Copy failed', err);
  }
}
