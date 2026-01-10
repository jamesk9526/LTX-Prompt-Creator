'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './wizard.css';

type OptionSets = Record<string, Record<string, string[]>>;

const OPTION_SETS_STORAGE_KEY = 'ltx_prompter_option_sets_v1';
const UI_PREFS_STORAGE_KEY = 'ltx_prompter_ui_prefs_v1';

type CaptureWord = 'shot' | 'video' | 'clip' | 'frame';

type PromptFormat = 'ltx2' | 'paragraph';

type UiPrefs = {
  typingEnabled: boolean;
  typingSpeedMs: number;
  captureWord: CaptureWord;
  autoCopyOnReview: boolean;
  promptFormat: PromptFormat;
};

const DEFAULT_UI_PREFS: UiPrefs = {
  typingEnabled: true,
  typingSpeedMs: 14,
  captureWord: 'shot',
  autoCopyOnReview: false,
  promptFormat: 'ltx2',
};

const MODES = [
  { id: 'cinematic', title: 'Cinematic', tag: 'Camera-forward', desc: 'Film-inspired framing, motion, and grading.' },
  { id: 'classic', title: 'Classic', tag: 'Balanced', desc: 'Cohesive, versatile looks for general prompts.' },
  { id: 'nsfw', title: 'NSFW', tag: '18+', desc: 'Adult-focused styling. Requires NSFW enabled.' },
];

const DEFAULT_OPTION_SETS: OptionSets = {
  cinematic: {
    genre: ['Sci-fi thriller', 'Period drama', 'Heist sequence', 'Space opera', 'Character study', 'Cyberpunk adventure', 'Historical epic', 'Post-apocalyptic tale', 'Superhero saga', 'Mystery intrigue'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot', 'Dutch angle', 'Bird\'s eye view', 'Low angle', 'High angle', 'Panoramic sweep'],
    role: ['Protagonist', 'Investigator', 'Pilot', 'Engineer', 'Anti-hero', 'Mentor figure', 'Sidekick', 'Villain', 'Survivor', 'Rebel'],
    mood: ['Tense', 'Hopeful', 'Melancholic', 'Triumphant', 'Mysterious', 'Energetic', 'Somber', 'Excited', 'Foreboding', 'Serene'],
    lighting: ['Volumetric shafts', 'Neon rim light', 'Golden hour', 'High contrast noir', 'Soft bounce', 'Harsh shadows', 'Warm tungsten', 'Cool moonlight', 'Strobe flashes', 'Subtle fill'],
    environment: ['Rainy street', 'Neon city', 'Abandoned warehouse', 'Orbiting station', 'Desert expanse', 'Dense forest', 'Urban skyline', 'Suburban home', 'Mountain peak', 'Ocean shore'],
    wardrobe: ['Weathered leathers', 'Stealth techweave', 'Formal noir suit', 'Explorer layers', 'Armored rig', 'Casual jacket', 'Military uniform', 'Elegant gown', 'Rugged boots', 'High-tech visor'],
    pose: ['Striding forward', 'Holding ground', 'Leaning on rail', 'Kneeling for cover', 'Running mid-frame', 'Arms crossed', 'Pointing dramatically', 'Crouched low', 'Standing tall', 'Gesturing wildly'],
    lightInteraction: ['wraps gently', 'cuts through haze', 'paints rim highlights', 'glitters on surfaces', 'bleeds into lens bloom', 'casts long shadows', 'diffuses softly', 'sparkles on metal', 'filters through leaves', 'reflects off water'],
    weather: ['Clear dusk', 'Fine rain', 'Storm front', 'Snow flurry', 'Humid night', 'Foggy morning', 'Sunny afternoon', 'Overcast sky', 'Windy gale', 'Calm breeze'],
    cameraMove: ['Slow push', 'Lateral dolly', 'Crane reveal', 'Handheld drift', 'Locked-off tableau', 'Quick zoom', 'Circular pan', 'Tilt up', 'Track backward', 'Static hold'],
    lens: ['35mm spherical', '50mm prime', '85mm portrait', '24mm wide', 'Anamorphic 40mm', '100mm telephoto', '16mm ultra-wide', 'Macro lens', 'Fish-eye', 'Zoom lens'],
    colorGrade: ['Teal & amber', 'Muted filmic', 'Cool tungsten', 'Punchy neon', 'Warm dusk', 'Sepia tones', 'High saturation', 'Desaturated', 'Vintage look', 'Modern vibrant'],
    sound: ['Distant traffic', 'Low wind hum', 'Crowd murmur', 'Engine rumble', 'Quiet ambience', 'Thunder clap', 'Birdsong', 'City bustle', 'Ocean waves', 'Silent tension'],
    sfx: ['Footsteps on wet pavement', 'Cloth rustle', 'Metal clink', 'Distant siren', 'Door creak', 'Gun cock', 'Glass shatter', 'Radio chatter', 'Breath close to mic', 'Rain on window'],
    music: ['Minimal synth pulse', 'Orchestral swell', 'Lo-fi ambience', 'Dark drone pad', 'Tense ticking rhythm', 'Sparse piano motif', 'Driving percussion', 'Warm analog bassline', 'Cinematic riser', 'No music'],
    sig1: ['atmospheric haze', 'micro dust motes', 'breath in cold air', 'rain beads on skin', 'embers in frame', 'fog rolling in', 'light streaks', 'particle effects', 'smoke trails', 'water droplets'],
    sig2: ['soft rim light', 'film grain', 'lens bloom', 'chromatic fringe', 'shallow DOF falloff', 'bokeh circles', 'motion blur', 'depth of field', 'flare spots', 'grain texture'],
  },
  classic: {
    genre: ['Portrait', 'Fashion editorial', 'Documentary', 'Landscape', 'Architectural', 'Street photography', 'Nature scene', 'Still life', 'Event coverage', 'Product shot'],
    shot: ['Three-quarter', 'Half-body', 'Headshot', 'Wide landscape', 'Macro detail', 'Full body', 'Profile view', 'Environmental portrait', 'Close detail', 'Group shot'],
    role: ['Artist', 'Explorer', 'Scholar', 'Performer', 'Leader', 'Entrepreneur', 'Athlete', 'Teacher', 'Chef', 'Musician'],
    mood: ['Calm', 'Confident', 'Joyful', 'Reflective', 'Gritty', 'Serene', 'Determined', 'Playful', 'Thoughtful', 'Bold'],
    lighting: ['Soft daylight', 'Studio softbox', 'Split light', 'Backlit glow', 'Window light', 'Ring light', 'Natural shade', 'Flash fill', 'Golden hour', 'Blue hour'],
    environment: ['Modern loft', 'Forest trail', 'Coastal cliffs', 'Old library', 'Glass atrium', 'City park', 'Beach shore', 'Mountain cabin', 'Urban street', 'Garden patio'],
    wardrobe: ['Tailored suit', 'Minimalist monochrome', 'Denim & leather', 'Casual layers', 'Editorial couture', 'Business casual', 'Athleisure', 'Bohemian dress', 'Formal attire', 'Casual jeans'],
    pose: ['Standing composed', 'Relaxed seated', 'Walking in frame', 'Leaning casually', 'Arms folded', 'Hand on hip', 'Smiling directly', 'Looking away', 'Dynamic action', 'Casual stance'],
    cameraMove: ['Tripod locked', 'Gentle slider', 'Static portrait', 'Steady pan', 'Slow tilt', 'Fixed focus', 'Manual pan', 'Zoom in', 'Pull back', 'Orbit around'],
    lens: ['50mm prime', '85mm portrait', '35mm street', '24mm wide', 'Macro 100mm', 'Telephoto 200mm', 'Wide-angle 16mm', 'Standard zoom', 'Prime 135mm', 'Tilt-shift'],
    colorGrade: ['Clean neutral', 'Soft pastels', 'High contrast B/W', 'Warm filmic', 'Cool tones', 'Vibrant colors', 'Monochrome', 'Sepia', 'Natural look', 'Artistic filter'],
    sound: ['Quiet room', 'City hush', 'Light breeze', 'Bird calls', 'Water trickle', 'Footsteps', 'Distant voices', 'Nature sounds', 'Ambient hum', 'Silent focus'],
    sfx: ['Footsteps', 'Cloth rustle', 'Door close', 'Keys jingle', 'Paper shuffle', 'Water splash', 'Wind through trees', 'Distant siren', 'Camera shutter click', 'Soft breath'],
    music: ['Soft instrumental', 'Lo-fi beat', 'Ambient pad', 'Acoustic guitar', 'Piano underscore', 'Upbeat pop bed', 'Documentary score', 'No music'],
    sig1: ['subtle vignette', 'fine grain', 'soft falloff', 'light halo', 'texture overlay', 'color correction', 'sharp focus', 'soft blur', 'highlight glow', 'shadow play'],
    sig2: ['catchlights in eyes', 'gentle haze', 'depth layers', 'bokeh effect', 'film texture', 'light rays', 'reflection', 'silhouette', 'contrast boost', 'warm tint'],
    weather: ['Clear', 'Sunny', 'Cloudy', 'Light rain', 'Snowy', 'Windy', 'Foggy', 'Overcast', 'Bright', 'Dull'],
    lightInteraction: ['wraps softly', 'highlights features', 'creates shadows', 'diffuses evenly', 'casts glow', 'rim lights', 'fills evenly', 'spotlights', 'backlights', 'side lights'],
  },
  nsfw: {
    genre: ['Boudoir', 'Art nude', 'Sensual portrait', 'Glam kink', 'Intimate scene', 'Erotic fantasy', 'Romantic encounter', 'Playful tease', 'Passionate moment', 'Tender embrace'],
    shot: ['Intimate close-up', 'Half-body', 'Reclined pose', 'Over-shoulder', 'Mirror gaze', 'Full body nude', 'Sensual profile', 'Close embrace', 'Teasing glance', 'Dynamic pose'],
    role: ['Muse', 'Lover', 'Dominant partner', 'Submissive partner', 'Seductress', 'Temptress', 'Admirer', 'Playmate', 'Confidant', 'Enchanter'],
    mood: ['Sensual', 'Playful', 'Intense', 'Tender', 'Confident', 'Vulnerable', 'Bold', 'Shy', 'Passionate', 'Mysterious'],
    lighting: ['Soft amber', 'Low key shadows', 'Window dusk', 'Colored gels', 'Candle glow', 'Moonlight', 'Neon accent', 'Warm bedside', 'Dim ambient', 'Spotlight focus'],
    environment: ['Velvet studio', 'Dim apartment', 'Hotel suite', 'Dark lounge', 'Backstage set', 'Silk bedroom', 'Luxury bath', 'Private garden', 'Cozy cabin', 'Urban loft'],
    wardrobe: ['Silk robe', 'Lingerie set', 'Sheer mesh', 'Latex accent', 'Bare skin', 'Satin sheets', 'Lace lingerie', 'Nude silhouette', 'Bondage ropes', 'Elegant negligee'],
    pose: ['Reclined', 'Arched back', 'Seated lean', 'Standing profile', 'Mirror pose', 'Kneeling softly', 'Arms outstretched', 'Head tilted', 'Body curved', 'Sensual stretch'],
    lightInteraction: ['kisses edges', 'wraps softly', 'catches highlights', 'spills in neon', 'glows warmly', 'casts intimate shadows', 'highlights curves', 'creates mood', 'softens skin', 'accentuates form'],
    weather: ['Indoor calm', 'Warm night', 'Cool breeze', 'Rainy window', 'Foggy mist', 'Sunny patio', 'Moonlit balcony', 'Stormy passion', 'Gentle wind', 'Cozy fire'],
    cameraMove: ['Slow push', 'Static intimate', 'Drift closer', 'Gentle pan', 'Soft zoom', 'Circular reveal', 'Tilt focus', 'Pull away', 'Orbit slowly', 'Lock on gaze'],
    lens: ['85mm portrait', '50mm prime', '35mm intimate', '100mm close', 'Macro detail', 'Wide sensual', 'Telephoto tease', 'Standard nude', 'Artistic blur', 'Focus shift'],
    colorGrade: ['Warm amber', 'Moody teal', 'Soft pastel', 'Deep red', 'Cool blue', 'Golden glow', 'Sepia nude', 'High contrast', 'Monochrome', 'Vibrant erotic'],
    sound: ['Muted room tone', 'Close breath', 'Soft whispers', 'Heartbeat rhythm', 'Silk rustle', 'Gentle moans', 'Ambient music', 'Rain patter', 'Wind sigh', 'Silent tension'],
    sfx: ['Silk rustle', 'Slow footsteps', 'Leather creak', 'Soft chain clink', 'Door latch', 'Bed sheets shift', 'Breath close to mic', 'Rain on glass', 'Low bass throb', 'Candle crackle'],
    music: ['Slow bass throb', 'Sensual R&B bed', 'Dark ambient', 'Minimal percussion', 'No music'],
    sig1: ['soft skin bloom', 'delicate grain', 'bokeh orbs', 'light caress', 'texture play', 'glow effect', 'shadow dance', 'highlight trail', 'blur soft', 'focus intimate'],
    sig2: ['rim highlight', 'mirror glint', 'depth sensual', 'flare erotic', 'grain texture', 'bokeh hearts', 'reflection tease', 'silhouette edge', 'warm haze', 'cool mist'],
  },
};

const STEPS = Array.from({ length: 17 }, (_, i) => i + 1);

type CinematicData = {
  genre_style: string;
  shot_type: string;
  subject_traits: string;
  subject_role: string;
  pose_action: string;
  wardrobe: string;
  prop_action: string;
  prop_weapon: string;
  hair_face_detail: string;
  sig1: string;
  sig2: string;
  environment: string;
  weather: string;
  lighting: string;
  light_interaction: string;
  sound: string;
  sfx: string;
  music: string;
  mix_notes: string;
  dialogue: string;
  pronoun: string;
  dialogue_verb: string;
  mood: string;
  lens: string;
  color_grade: string;
  film_details: string;
  camera_move: string;
  focus_target: string;
  explicit_abilities?: string;
  body_description?: string;
  sexual_description?: string;
};

type ClassicData = {
  genre: string;
  shot: string;
  subject: string;
  wardrobe: string;
  environment: string;
  time: string;
  lighting: string;
  atmosphere: string;
  camera: string;
  palette: string;
  action: string;
  audio: string;
  sfx: string;
  music: string;
  mix_notes: string;
  dialogue: string;
  avoid: string;
};

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'cinematic' | 'classic' | 'nsfw'>('cinematic');
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [introStage, setIntroStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [introBase, setIntroBase] = useState<'film' | 'photo' | 'adult' | null>(null);
  const [introCinematicFlavor, setIntroCinematicFlavor] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState<'cinematic' | 'classic' | 'nsfw'>('cinematic');
  const [settingsField, setSettingsField] = useState('genre');
  const [newOption, setNewOption] = useState('');
  const [bulkOptions, setBulkOptions] = useState('');
  const [optionSets, setOptionSets] = useState<OptionSets>(DEFAULT_OPTION_SETS);
  const [uiPrefs, setUiPrefs] = useState<UiPrefs>(DEFAULT_UI_PREFS);
  const didHydrateRef = useRef(false);
  const didHydrateOptionSetsRef = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () => ({ cinematic: {}, classic: {}, nsfw: {} })
  );

  useEffect(() => {
    // Load persisted settings after mount to avoid SSR/CSR hydration mismatches.
    const loadedOptionSets = loadOptionSets();
    if (loadedOptionSets) {
      setOptionSets(mergeOptionSets(DEFAULT_OPTION_SETS, loadedOptionSets));
    }
    const loadedUiPrefs = loadUiPrefs();
    if (loadedUiPrefs) {
      setUiPrefs(loadedUiPrefs);
    }
  }, []);

  useEffect(() => {
    if (!didHydrateOptionSetsRef.current) {
      didHydrateOptionSetsRef.current = true;
      return;
    }
    saveOptionSets(optionSets);
  }, [optionSets]);

  useEffect(() => {
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }
    saveUiPrefs(uiPrefs);
  }, [uiPrefs]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 1600);
  }, []);

  const selects = useMemo(() => optionSets[mode] || {}, [optionSets, mode]);
  const current = useMemo(() => values[mode] || {}, [values, mode]);
  const fieldValue = useCallback((field: string) => current[field] ?? '', [current]);

  const captureWordTitle = useMemo(() => {
    const w = uiPrefs.captureWord || 'shot';
    return `${w.slice(0, 1).toUpperCase()}${w.slice(1)}`;
  }, [uiPrefs.captureWord]);

  const summary = useMemo(() => ({ ...current, mode }), [current, mode]);

  useEffect(() => {
    // Ensure the mode bucket exists, but do not auto-fill defaults.
    setValues((prev) => ({
      ...prev,
      [mode]: prev[mode] || {},
    }));
  }, [mode]);

  const handleSelect = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [field]: value },
    }));
  };

  const handleInput = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [field]: value },
    }));
  };

  const listIdFor = (field: string) => `list-${mode}-${field}`;

  const renderLabel = useCallback(
    (text: string, tooltip?: string, keySeed?: string) => (
      <span className="field-label">
        {uiPrefs.typingEnabled ? (
          <TypewriterText key={`${step}-${keySeed || text}`} text={text} speedMs={uiPrefs.typingSpeedMs} />
        ) : (
          text
        )}
        {tooltip ? (
          <span className="field-tip" tabIndex={0} aria-label={tooltip}>
            ?
            <span role="tooltip" className="field-tip-bubble">
              {tooltip}
            </span>
          </span>
        ) : null}
      </span>
    ),
    [step, uiPrefs.typingEnabled, uiPrefs.typingSpeedMs]
  );

  const canAdvance = () => {
    if (step === 1 && introStage < 5) return false;
    if (step === 1 && mode === 'nsfw' && !nsfwEnabled) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (introStage < 5) {
        setIntroStage((s) => (s < 5 ? ((s + 1) as any) : s));
        return;
      }
      // onboarding complete → proceed into the wizard
      setStep(2);
      return;
    }
    if (!canAdvance()) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handleBack = () => {
    if (step === 1 && introStage > 0) {
      setIntroStage((s) => (s > 0 ? ((s - 1) as any) : s));
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  useEffect(() => {
    // Apply onboarding answers to mode/NSFW.
    if (!introBase) return;
    if (introBase === 'adult') {
      setMode('nsfw');
      setNsfwEnabled(true);
      return;
    }
    // film/photo both map to cinematic/classic depending on flavor.
    if (introCinematicFlavor) setMode('cinematic');
    else setMode('classic');
  }, [introBase, introCinematicFlavor]);

  const prompt = useMemo(() => {
    return buildPrompt(mode, values, nsfwEnabled, optionSets, uiPrefs.captureWord, uiPrefs.promptFormat);
  }, [mode, values, nsfwEnabled, optionSets, uiPrefs.captureWord, uiPrefs.promptFormat]);

  const ltx2Checklist = useMemo(() => {
    if (uiPrefs.promptFormat !== 'ltx2') return [] as string[];
    const items: string[] = [];

    const actions = (current.actions || '').trim();
    const hasAnyVisual = Boolean(
      fieldValue('genre').trim() ||
      fieldValue('shot').trim() ||
      fieldValue('role').trim() ||
      fieldValue('environment').trim() ||
      fieldValue('lighting').trim()
    );
    const hasAnyAudio = Boolean(
      fieldValue('sound').trim() ||
      fieldValue('sfx').trim() ||
      fieldValue('music').trim() ||
      (current.mix_notes || '').trim() ||
      (current.dialogue || '').trim()
    );

    if (!actions) items.push('Core Actions: add a simple timeline (what happens over time).');
    if (!hasAnyVisual) items.push('Visual Details: add at least genre/shot/role/environment/lighting.');
    if (!hasAnyAudio) items.push('Audio: add ambience, SFX, and/or dialogue.');

    return items;
  }, [uiPrefs.promptFormat, current.actions, current.dialogue, current.mix_notes, fieldValue]);

  useEffect(() => {
    if (step !== STEPS.length) return;
    if (!uiPrefs.autoCopyOnReview) return;
    void copyPrompt(prompt).then(() => showToast('Copied prompt'));
  }, [step, uiPrefs.autoCopyOnReview, prompt, showToast]);

  const settingsFields = useMemo(() => {
    const set = optionSets[settingsMode] || {};
    const keys = Object.keys(set);
    return keys.length ? keys.sort() : Object.keys(DEFAULT_OPTION_SETS[settingsMode]).sort();
  }, [optionSets, settingsMode]);

  const updateOptionList = (
    targetMode: 'cinematic' | 'classic' | 'nsfw',
    field: string,
    updater: (prev: string[]) => string[]
  ) => {
    setOptionSets((prev) => {
      const prevMode = prev[targetMode] || {};
      const prevList = prevMode[field] || [];
      const nextList = normalizeOptions(updater(prevList));
      return {
        ...prev,
        [targetMode]: {
          ...prevMode,
          [field]: nextList,
        },
      };
    });
  };

  const addOneOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    updateOptionList(settingsMode, settingsField, (prev) => [trimmed, ...prev]);
    setNewOption('');
  };

  const addBulkOptions = () => {
    const lines = bulkOptions
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) return;
    updateOptionList(settingsMode, settingsField, (prev) => [...lines, ...prev]);
    setBulkOptions('');
  };

  const removeOption = (value: string) => {
    updateOptionList(settingsMode, settingsField, (prev) => prev.filter((v) => v !== value));
  };

  const resetModeToDefaults = () => {
    setOptionSets((prev) => ({
      ...prev,
      [settingsMode]: DEFAULT_OPTION_SETS[settingsMode],
    }));
  };

  return (
    <main className="wizard-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-title">LTXV Prompt Creator</div>
          <div className="brand-sub">Personalize presets • auto-saved</div>
        </div>
        <div className="topbar-actions">
          <button
            className="ghost"
            type="button"
            onClick={() => {
              setSettingsMode(mode);
              setSettingsField('genre');
              setSettingsOpen(true);
            }}
          >
            Settings
          </button>
        </div>
      </header>

      {settingsOpen && (
        <div className="settings-overlay" onMouseDown={() => setSettingsOpen(false)}>
          <div className="settings-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Settings</p>
                <h3 className="settings-title">Preset options</h3>
                <p className="hint">Add, remove, and customize dropdown options. Saved locally.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setSettingsOpen(false)}>
                Close
              </button>
            </div>

            <div className="settings-tabs">
              {(['cinematic', 'classic', 'nsfw'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`tab ${settingsMode === m ? 'active' : ''}`}
                  onClick={() => {
                    setSettingsMode(m);
                    setSettingsField('genre');
                  }}
                >
                  {labelForMode(m)}
                </button>
              ))}
            </div>

            <div className="settings-body">
              <div className="settings-left">
                <div className="settings-experience">
                  <div className="settings-experience-head">
                    <p className="eyebrow">Experience</p>
                    <p className="hint">Tune the vibe.</p>
                  </div>
                  <div className="settings-experience-row">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={uiPrefs.typingEnabled}
                        onChange={(e) => setUiPrefs((p) => ({ ...p, typingEnabled: e.target.checked }))}
                        aria-label="Enable typing animation"
                      />
                      <span className="slider" />
                    </label>
                    <div>
                      <div className="toggle-title">Typing animation</div>
                      <div className="toggle-note">Turn off for instant labels.</div>
                    </div>
                  </div>
                  <label className="field">
                    <span>Typing speed</span>
                    <select
                      value={String(uiPrefs.typingSpeedMs)}
                      onChange={(e) =>
                        setUiPrefs((p) => ({ ...p, typingSpeedMs: Number(e.target.value) }))
                      }
                      aria-label="Typing speed"
                      disabled={!uiPrefs.typingEnabled}
                    >
                      <option value="20">Slow</option>
                      <option value="14">Normal</option>
                      <option value="9">Fast</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Use the word</span>
                    <select
                      value={uiPrefs.captureWord}
                      onChange={(e) =>
                        setUiPrefs((p) => ({ ...p, captureWord: e.target.value as CaptureWord }))
                      }
                      aria-label="Capture wording preference"
                    >
                      <option value="shot">Shot</option>
                      <option value="video">Video</option>
                      <option value="clip">Clip</option>
                      <option value="frame">Frame</option>
                    </select>
                  </label>

                  <div className="settings-experience-row">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={uiPrefs.autoCopyOnReview}
                        onChange={(e) => setUiPrefs((p) => ({ ...p, autoCopyOnReview: e.target.checked }))}
                        aria-label="Auto-copy prompt on review"
                      />
                      <span className="slider" />
                    </label>
                    <div>
                      <div className="toggle-title">Auto-copy on Review</div>
                      <div className="toggle-note">Copies the prompt when you reach Step 12.</div>
                    </div>
                  </div>

                  <label className="field">
                    <span>Prompt format</span>
                    <select
                      value={uiPrefs.promptFormat}
                      onChange={(e) =>
                        setUiPrefs((p) => ({ ...p, promptFormat: e.target.value as PromptFormat }))
                      }
                      aria-label="Prompt format"
                    >
                      <option value="ltx2">LTX-2 (Core Actions / Visual / Audio)</option>
                      <option value="paragraph">Paragraph (legacy)</option>
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Which list do you want to edit?</span>
                  <select
                    value={settingsField}
                    onChange={(e) => setSettingsField(e.target.value)}
                    aria-label="Select which preset list to edit"
                  >
                    {settingsFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="settings-add">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add a new option (press Enter)"
                    aria-label="Add a new preset option"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addOneOption();
                    }}
                  />
                  <button className="primary" type="button" onClick={addOneOption}>
                    Add
                  </button>
                </div>

                <details className="settings-bulk">
                  <summary>Bulk add (one per line)</summary>
                  <textarea
                    value={bulkOptions}
                    onChange={(e) => setBulkOptions(e.target.value)}
                    rows={6}
                    aria-label="Bulk add preset options"
                    placeholder={'One option per line\nExample:\nSoft mist\nNeon rain\nDreamy bokeh'}
                  />
                  <div className="settings-bulk-actions">
                    <button className="ghost" type="button" onClick={addBulkOptions}>
                      Add lines
                    </button>
                    <button className="ghost" type="button" onClick={() => setBulkOptions('')}>
                      Clear
                    </button>
                  </div>
                </details>

                <div className="settings-actions">
                  <button className="ghost" type="button" onClick={resetModeToDefaults}>
                    Reset this mode to defaults
                  </button>
                </div>
              </div>

              <div className="settings-right">
                <div className="settings-list">
                  {(optionSets[settingsMode]?.[settingsField] || []).map((v) => (
                    <div key={v} className="chip-row">
                      <div className="chip">{v}</div>
                      <button className="ghost" type="button" onClick={() => removeOption(v)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="progress">
        <div
          className="progress-track"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step}
          role="progressbar"
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
            <h2>Let’s set you up</h2>
            <p className="hint">Quick questions — I’ll pick the best mode for you.</p>
          </div>

          <div className="friend-bubble" aria-label="Assistant message">
            {uiPrefs.typingEnabled ? (
              <TypewriterText
                key={`intro-${introStage}`}
                text={
                  introStage === 0
                    ? 'Alright. What are we making today?'
                    : introStage === 1
                      ? 'Nice. Do you want cinematic camera language (lens, grade, movement), or keep it simple?'
                      : introStage === 2
                        ? 'One tiny preference: should I call it a “shot” or a “video” when I describe the framing?'
                        : introStage === 3
                          ? 'Perfect. I’ve got your core setup — two quick guide pages, then we build.'
                          : introStage === 4
                            ? 'Pro tip: you can type custom text in any field — no more getting stuck in dropdowns.'
                            : 'Last one: we’ll also fine-tune dialogue (even in NSFW) before the final prompt.'
                }
                speedMs={Math.max(9, uiPrefs.typingSpeedMs)}
                startDelayMs={140}
              />
            ) : (
              <span>
                {introStage === 0
                  ? 'Alright. What are we making today?'
                  : introStage === 1
                    ? 'Nice. Do you want cinematic camera language (lens, grade, movement), or keep it simple?'
                    : introStage === 2
                      ? 'One tiny preference: should I call it a “shot” or a “video” when I describe the framing?'
                      : introStage === 3
                        ? 'Perfect. I’ve got your core setup — two quick guide pages, then we build.'
                        : introStage === 4
                          ? 'Pro tip: you can type custom text in any field — no more getting stuck in dropdowns.'
                          : 'Last one: we’ll also fine-tune dialogue (even in NSFW) before the final prompt.'}
              </span>
            )}
          </div>

          {introStage === 0 && (
            <div className="choice-grid">
              <button
                type="button"
                className={`mode-card ${introBase === 'film' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('film');
                  setIntroCinematicFlavor(true);
                  setIntroStage(1);
                }}
              >
                <div className="mode-tag">Story + camera</div>
                <p className="mode-title">Film / scene</p>
                <p className="hint">Cinematic framing, motion, grade.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${introBase === 'photo' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('photo');
                  setIntroCinematicFlavor(false);
                  setIntroStage(1);
                }}
              >
                <div className="mode-tag">Clean + flexible</div>
                <p className="mode-title">Photo / portrait</p>
                <p className="hint">Balanced prompts that travel well.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${introBase === 'adult' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('adult');
                  setIntroStage(2);
                  setNsfwEnabled(true);
                  setMode('nsfw');
                }}
              >
                <div className="mode-tag">18+</div>
                <p className="mode-title">Adult / NSFW</p>
                <p className="hint">Unlocks NSFW preset lists and optional fields.</p>
              </button>
            </div>
          )}

          {introStage === 1 && introBase !== 'adult' && (
            <div className="choice-grid">
              <button
                type="button"
                className={`mode-card ${introCinematicFlavor ? 'active' : ''}`}
                onClick={() => {
                  setIntroCinematicFlavor(true);
                  setIntroStage(2);
                }}
              >
                <div className="mode-tag">Lens + movement</div>
                <p className="mode-title">Cinematic mode</p>
                <p className="hint">Feels like a director of photography wrote it.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${!introCinematicFlavor ? 'active' : ''}`}
                onClick={() => {
                  setIntroCinematicFlavor(false);
                  setIntroStage(2);
                }}
              >
                <div className="mode-tag">Straightforward</div>
                <p className="mode-title">Classic mode</p>
                <p className="hint">Simple, clean, reliable prompt structure.</p>
              </button>

              <div className="inline-settings">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={nsfwEnabled}
                    onChange={(e) => setNsfwEnabled(e.target.checked)}
                    aria-label="Enable NSFW options"
                  />
                  <span className="slider" />
                </label>
                <div>
                  <div className="toggle-title">Optional: enable NSFW fields</div>
                  <div className="toggle-note">Keeps wizard safe unless enabled.</div>
                </div>
              </div>
            </div>
          )}

          {introStage === 2 && (
            <div className="choice-grid">
              {([
                { id: 'shot', title: 'Shot', desc: 'Classic camera wording (shot, angle, framing).' },
                { id: 'video', title: 'Video', desc: 'More creator-friendly phrasing (video, clip).' },
                { id: 'clip', title: 'Clip', desc: 'Short-form vibe; feels modern.' },
                { id: 'frame', title: 'Frame', desc: 'Photographic / composition language.' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`mode-card ${uiPrefs.captureWord === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    setUiPrefs((p) => ({ ...p, captureWord: opt.id }));
                    setIntroStage(3);
                  }}
                >
                  <div className="mode-tag">Wording</div>
                  <p className="mode-title">{opt.title}</p>
                  <p className="hint">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {introStage === 3 && (
            <div className="onboard-summary">
              <div className="summary-row">
                <div className="summary-pill">Mode: {labelForMode(mode)}</div>
                <div className="summary-pill">NSFW: {nsfwEnabled ? 'Enabled' : 'Off'}</div>
                <div className="summary-pill">Wording: {uiPrefs.captureWord}</div>
              </div>
              <p className="hint onboard-hint">
                You can still tweak everything in Settings.
              </p>
            </div>
          )}

          {introStage === 4 && (
            <div className="onboard-guide">
              <h3 className="guide-title">Quick guide</h3>
              <div className="guide-grid">
                <div className="guide-card">
                  <div className="guide-kicker">Pick or type</div>
                  <p className="hint">Every field lets you select an option or type your own custom value on the fly.</p>
                </div>
                <div className="guide-card">
                  <div className="guide-kicker">Settings</div>
                  <p className="hint">Customize preset lists, typing speed, wording, and auto-copy whenever you want.</p>
                </div>
              </div>
            </div>
          )}

          {introStage === 5 && (
            <div className="onboard-guide">
              <h3 className="guide-title">What we’ll tune</h3>
              <div className="guide-grid">
                <div className="guide-card">
                  <div className="guide-kicker">Dialogue</div>
                  <p className="hint">Add a line (or leave it blank), pick a speaker and delivery style.</p>
                </div>
                <div className="guide-card">
                  <div className="guide-kicker">NSFW stays gated</div>
                  <p className="hint">NSFW-only fields are still ignored unless NSFW is enabled.</p>
                </div>
              </div>
            </div>
          )}

          {!nsfwEnabled && mode === 'nsfw' && (
            <div className="inline-alert">
              <div className="dot" />
              <p>NSFW mode requires NSFW enabled.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 2 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 2</p>
            <h2>Genre & {captureWordTitle}</h2>
            <p className="hint">Set the story tone and camera framing.</p>
          </div>
          <div className="field-grid">
            {['genre', 'shot'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field, uiPrefs.captureWord),
                  field === 'genre'
                    ? 'Sets the narrative lane so everything stays cohesive.'
                    : 'Frames the subject (wide, close-up, overhead) to anchor composition.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field, uiPrefs.captureWord)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 3 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 3</p>
            <h2>Role & wardrobe</h2>
            <p className="hint">Define who the subject is and what they wear.</p>
          </div>
          <div className="field-grid">
            {['role', 'wardrobe'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'role'
                    ? 'Character or subject archetype to set the POV.'
                    : 'Outfit cues that steer style and era.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 4 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 4</p>
            <h2>Pose & mood</h2>
            <p className="hint">Capture stance and emotional tone.</p>
          </div>
          <div className="field-grid">
            {['pose', 'mood'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'pose'
                    ? 'Body posture or action that drives the frame.'
                    : 'Emotional temperature to cue lighting and color.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 5 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 5</p>
            <h2>Action beats</h2>
            <p className="hint">Sketch the timeline so motion feels intentional.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Core actions (over time)', 'Break the scene into small beats; works for video or stills with implied motion.', 'actions')}
              <textarea
                value={current.actions || ''}
                onChange={(e) => handleInput('actions', e.target.value)}
                rows={4}
                placeholder={'0-2s: Establish the scene\n2-4s: Main action beat\n4-6s: End beat / camera move'}
                aria-label="Core actions over time"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 6 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 6</p>
            <h2>Lighting & environment</h2>
            <p className="hint">Set the light and backdrop.</p>
          </div>
          <div className="field-grid">
            {['lighting', 'environment'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'lighting'
                    ? 'Quality, direction, and intensity of light.'
                    : 'Location or backdrop that grounds the scene.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 7 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 7</p>
            <h2>Camera & lens</h2>
            <p className="hint">Choose movement and glass.</p>
          </div>
          <div className="field-grid">
            {['cameraMove', 'lens'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'cameraMove'
                    ? 'Describe how the camera moves (push, pan, orbit, static).'
                    : 'Lens or focal length to lock perspective and depth.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 8 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 8</p>
            <h2>Grade & weather</h2>
            <p className="hint">Color tone and atmospheric conditions.</p>
          </div>
          <div className="field-grid">
            {['colorGrade', 'weather'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'colorGrade'
                    ? 'Film grade or LUT-like direction to drive palette.'
                    : 'Weather/atmosphere that affects light and texture.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 9 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 9</p>
            <h2>Light interaction</h2>
            <p className="hint">How the light behaves on surfaces.</p>
          </div>
          <div className="field-grid">
            {['lightInteraction'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(labelForField(field), 'Describe how light wraps, rims, or scatters for texture.', field)}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 10 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 10</p>
            <h2>Signatures</h2>
            <p className="hint">Add visual signature details.</p>
          </div>
          <div className="field-grid">
            {['sig1', 'sig2'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(labelForField(field), 'Small, repeated motifs that brand the look.', field)}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder="Pick or type…"
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 11 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 11</p>
            <h2>Ambient & SFX</h2>
            <p className="hint">Lay down the audio bed.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Ambient sound', 'Background texture that plays under the scene.', 'sound')}
              <PickOrTypeField
                ariaLabel="Ambient sound"
                value={fieldValue('sound')}
                placeholder="Pick or type…"
                listId={listIdFor('sound')}
                options={selects.sound || []}
                onChange={(v) => handleInput('sound', v)}
              />
            </label>

            <label className="field">
              {renderLabel('Sound effects (SFX)', 'Spot effects that punctuate moments.', 'sfx')}
              <PickOrTypeField
                ariaLabel="Sound effects"
                value={fieldValue('sfx')}
                placeholder="Pick or type…"
                listId={listIdFor('sfx')}
                options={selects.sfx || []}
                onChange={(v) => handleInput('sfx', v)}
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 12 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 12</p>
            <h2>Music & mix</h2>
            <p className="hint">Optional score plus any mixing notes.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Music (optional)', 'Add a musical bed or leave blank for silence.', 'music')}
              <PickOrTypeField
                ariaLabel="Music"
                value={fieldValue('music')}
                placeholder="Pick or type…"
                listId={listIdFor('music')}
                options={selects.music || []}
                onChange={(v) => handleInput('music', v)}
              />
            </label>

            <label className="field">
              {renderLabel('Mix notes (optional)', 'Balance guidance: who leads, what stays subtle.', 'mix_notes')}
              <textarea
                value={current.mix_notes || ''}
                onChange={(e) => handleInput('mix_notes', e.target.value)}
                rows={3}
                placeholder={'e.g., keep dialogue crisp, ambience low, SFX punchy'}
                aria-label="Mix notes"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 13 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 13</p>
            <h2>Dialogue & speaker</h2>
            <p className="hint">Optional line plus who says it.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Dialogue line', 'Keep it short; leave empty for a silent beat.', 'dialogue')}
              <input
                type="text"
                value={current.dialogue || ''}
                onChange={(e) => handleInput('dialogue', e.target.value)}
                placeholder={'e.g., "Don\'t blink."'}
                aria-label="Dialogue line"
              />
            </label>

            <label className="field">
              {renderLabel('Speaker', 'Pronoun or voice label for the line.', 'pronoun')}
              <PickOrTypeField
                ariaLabel="Speaker pronoun"
                value={current.pronoun || ''}
                placeholder="Pick or type…"
                listId={`list-${mode}-pronoun`}
                options={['They', 'He', 'She', 'I', 'We']}
                onChange={(v) => handleInput('pronoun', v)}
              />
            </label>
          </div>
          <div className="inline-alert">
            <div className="dot" />
            <p>Leave dialogue empty for a silent, cinematic beat.</p>
          </div>
        </article>

        <article className={`step ${step === 14 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 14</p>
            <h2>Delivery</h2>
            <p className="hint">How the line is delivered.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Delivery', 'Verb that shapes tone and pacing of the line.', 'dialogue_verb')}
              <PickOrTypeField
                ariaLabel="Dialogue verb"
                value={current.dialogue_verb || ''}
                placeholder="Pick or type…"
                listId={`list-${mode}-dialogue_verb`}
                options={['says', 'whispers', 'murmurs', 'growls', 'shouts', 'laughs', 'breathes']}
                onChange={(v) => handleInput('dialogue_verb', v)}
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 15 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 15</p>
            <h2>NSFW abilities & body</h2>
            <p className="hint">Adult-only context. Ignored unless NSFW is enabled.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Explicit abilities', 'Only used when NSFW is on.', 'explicit_abilities')}
              <input
                type="text"
                value={current.explicit_abilities || ''}
                onChange={(e) => handleInput('explicit_abilities', e.target.value)}
                placeholder="e.g., power play, restraints"
                aria-label="Explicit abilities"
              />
            </label>
            <label className="field">
              {renderLabel('Body description', 'Optional physical cues; stays off in safe mode.', 'body_description')}
              <input
                type="text"
                value={current.body_description || ''}
                onChange={(e) => handleInput('body_description', e.target.value)}
                placeholder="e.g., toned silhouette, tattoos"
                aria-label="Body description"
              />
            </label>
          </div>
          {!nsfwEnabled && (
            <div className="inline-alert">
              <div className="dot" />
              <p>NSFW disabled: these fields will be ignored unless NSFW is on.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 16 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 16</p>
            <h2>NSFW expression</h2>
            <p className="hint">Optional intimacy details; gated by NSFW toggle.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Sexual description', 'Energy, acts, or intimacy level. Ignored when NSFW is off.', 'sexual_description')}
              <input
                type="text"
                value={current.sexual_description || ''}
                onChange={(e) => handleInput('sexual_description', e.target.value)}
                placeholder="e.g., intimate tension, close contact"
                aria-label="Sexual description"
              />
            </label>
          </div>
          {!nsfwEnabled && (
            <div className="inline-alert">
              <div className="dot" />
              <p>NSFW disabled: this field will be ignored unless NSFW is on.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 17 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 17</p>
            <h2>Review & build</h2>
            <p className="hint">Confirm your picks and grab the prompt.</p>
          </div>

          {ltx2Checklist.length > 0 && (
            <div className="inline-alert" aria-label="LTX-2 prompt checklist">
              <div className="dot" />
              <div>
                <p><strong>LTX-2 checklist</strong></p>
                <p className="hint">Your prompt will work as-is, but these usually improve results:</p>
                <ul className="hint ltx2-checklist">
                  {ltx2Checklist.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="summary">
            <SummaryItem label="Mode" value={labelForMode(mode)} />
            <SummaryItem label="Genre" value={fieldValue('genre')} />
            <SummaryItem label={captureWordTitle} value={fieldValue('shot')} />
            <SummaryItem label="Role" value={fieldValue('role')} />
            <SummaryItem label="Wardrobe" value={fieldValue('wardrobe')} />
            <SummaryItem label="Pose" value={fieldValue('pose')} />
            <SummaryItem label="Actions" value={current.actions || ''} />
            <SummaryItem label="Mood" value={fieldValue('mood')} />
            <SummaryItem label="Lighting" value={fieldValue('lighting')} />
            <SummaryItem label="Environment" value={fieldValue('environment')} />
            <SummaryItem label="Camera" value={fieldValue('cameraMove')} />
            <SummaryItem label="Lens" value={fieldValue('lens')} />
            <SummaryItem label="Grade" value={fieldValue('colorGrade')} />
            <SummaryItem label="Weather" value={fieldValue('weather')} />
            <SummaryItem label="Light FX" value={fieldValue('lightInteraction')} />
            <SummaryItem label="Signatures" value={[fieldValue('sig1'), fieldValue('sig2')].filter(Boolean).join(' · ')} />
            <SummaryItem label="Sound" value={fieldValue('sound')} />
            <SummaryItem label="SFX" value={fieldValue('sfx')} />
            <SummaryItem label="Music" value={fieldValue('music')} />
            <SummaryItem label="Mix notes" value={current.mix_notes || ''} />
            <SummaryItem label="Dialogue" value={current.dialogue || ''} />
            <SummaryItem label="Delivery" value={current.dialogue_verb || ''} />
            <SummaryItem label="Speaker" value={current.pronoun || ''} />
            {nsfwEnabled && (
              <>
                <SummaryItem label="Explicit abilities" value={current.explicit_abilities || ''} />
                <SummaryItem label="Body" value={current.body_description || ''} />
                <SummaryItem label="Sexual description" value={current.sexual_description || ''} />
              </>
            )}
          </div>
          <div className="output">
            <div className="output-head">
              <div>
                <p className="eyebrow">Generated prompt</p>
                <h3>Copy-ready</h3>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={() => void copyPrompt(prompt).then(() => showToast('Copied prompt'))}
              >
                Copy
              </button>
            </div>
            <textarea value={prompt} readOnly rows={6} aria-label="Generated prompt" />
          </div>
        </article>
      </section>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

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

function labelForField(field: string, captureWord: CaptureWord = 'shot') {
  const map: Record<string, string> = {
    genre: 'The story feels like ____',
    shot: `The ${captureWord} looks like ____`,
    role: 'The subject is a ____',
    wardrobe: 'The subject is wearing ____',
    pose: 'The subject is posed ____',
    mood: 'The mood is ____',
    lighting: 'Lighting is ____',
    environment: 'The scene is set in ____',
    cameraMove: 'The camera moves ____',
    lens: 'We are shooting on ____',
    colorGrade: 'The color grade is ____',
    weather: 'The weather is ____',
    lightInteraction: 'Light interacts by ____',
    sig1: 'Signature detail 1 is ____',
    sig2: 'Signature detail 2 is ____',
    sound: 'We hear ____',
    sfx: 'Sound effects (SFX) include ____',
    music: 'Music is ____',
    mix_notes: 'Mix notes are ____',
    explicit_abilities: 'The explicit abilities are ____',
    body_description: 'The body description is ____',
    sexual_description: 'The sexual description is ____',
  };
  return map[field] || field;
}

function formatLtx2Section(title: string, lines: string[]) {
  const clean = lines.map((l) => (l || '').trim()).filter(Boolean);
  if (!clean.length) return '';
  return `${title}:\n${clean.map((l) => `- ${l}`).join('\n')}`;
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="summary-item">
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value || '—'}</div>
    </div>
  );
}

function PickOrTypeField({
  ariaLabel,
  value,
  placeholder,
  listId,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  placeholder?: string;
  listId: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <>
      <input
        type="text"
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
      <datalist id={listId}>
        {options.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
    </>
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

function pickField(values: Record<string, Record<string, string>>, mode: string, field: string, fallback = '') {
  return values[mode]?.[field] || fallback;
}

function guardrailsCinematic(data: CinematicData): CinematicData {
  const weatherLow = data.weather.toLowerCase();
  const lightLow = data.lighting.toLowerCase();
  if ((weatherLow.includes('storm') || weatherLow.includes('night') || weatherLow.includes('blizzard') || weatherLow.includes('fog')) && (lightLow.includes('sun') || lightLow.includes('bright'))) {
    data.lighting = 'overcast flat light';
  }
  if (data.shot_type.toLowerCase().includes('extreme close-up') && data.environment.toLowerCase().includes('landscape')) {
    data.environment = 'tight setting';
  }
  const pullReveal = data.camera_move.toLowerCase().includes('pull') && data.camera_move.toLowerCase().includes('reveal');
  if (pullReveal && data.environment && !data.environment.toLowerCase().includes('vast')) {
    data.environment = `vast ${data.environment}`;
  }
  return data;
}

function withCaptureWord(shotType: string, captureWord: CaptureWord): string {
  const t = (shotType || '').trim();
  if (!t) return captureWord;

  const replaced = captureWord === 'shot'
    ? t
    : t.replace(/\bshot\b/gi, captureWord);

  const low = replaced.toLowerCase();
  if (/(\bshot\b|\bvideo\b|\bclip\b|\bframe\b)/i.test(low)) return replaced;
  return `${replaced} ${captureWord}`;
}

function buildCinematicParagraph(
  raw: CinematicData,
  captureWord: CaptureWord,
  format: PromptFormat = 'paragraph',
  actionTimeline = ''
): string {
  const clean = guardrailsCinematic({ ...raw });

  const outfitBits = [
    clean.wardrobe && `clad in ${clean.wardrobe}`,
    clean.prop_action && clean.prop_weapon ? `${clean.prop_action} ${clean.prop_weapon}` : '',
    clean.hair_face_detail,
  ].filter(Boolean).join('; ');

  const base = (
    `${clean.genre_style} shows a ${withCaptureWord(clean.shot_type, captureWord)} of ${clean.subject_traits} ${clean.subject_role} ${clean.pose_action}` +
    `${outfitBits ? `, ${outfitBits}` : ''}; ${clean.sig1}, ${clean.sig2}.`
  );

  const scene = `The scene is set in ${clean.environment} under ${clean.weather}, casting ${clean.lighting} that ${clean.light_interaction}.`;
  const audioSentenceBits: string[] = [];
  if (clean.sound && clean.sound.trim()) audioSentenceBits.push(`Ambient sounds: ${clean.sound}.`);
  if (clean.sfx && clean.sfx.trim()) audioSentenceBits.push(`SFX: ${clean.sfx}.`);
  if (clean.music && clean.music.trim()) audioSentenceBits.push(`Music: ${clean.music}.`);
  if (clean.mix_notes && clean.mix_notes.trim()) audioSentenceBits.push(`Mix notes: ${clean.mix_notes}.`);
  const sound = audioSentenceBits.length ? audioSentenceBits.join(' ') : '';

  let dialogue = '';
  if (clean.dialogue && clean.dialogue.trim()) {
    const pronoun = (clean.pronoun || '').trim();
    const verb = (clean.dialogue_verb || '').trim();
    dialogue = pronoun && verb
      ? `${pronoun} ${verb}: "${clean.dialogue}"`
      : `Dialogue: "${clean.dialogue}"`;
  }

  const mood = clean.mood ? `Mood: ${clean.mood}.` : '';
  const qualityBits = [] as string[];
  if (clean.lens) qualityBits.push(`Lens ${clean.lens}`);
  if (clean.color_grade) qualityBits.push(`grade ${clean.color_grade}`);
  if (clean.film_details) qualityBits.push(`film feel ${clean.film_details}`);
  const quality = qualityBits.length ? `${qualityBits.join('; ')}.` : '';

  const camera = `The camera ${clean.camera_move} on ${clean.focus_target}.`;

  const nsfwElements = [] as string[];
  if (clean.explicit_abilities && clean.explicit_abilities.trim()) nsfwElements.push(`with ${clean.explicit_abilities}`);
  if (clean.body_description && clean.body_description.trim()) nsfwElements.push(`featuring ${clean.body_description}`);
  if (clean.sexual_description && clean.sexual_description.trim()) nsfwElements.push(clean.sexual_description);
  const nsfwText = nsfwElements.length ? ` ${nsfwElements.join(', ')}.` : '';

  const core = [base, scene, sound, dialogue, quality, mood, camera, nsfwText]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (format !== 'ltx2') return core;

  const actions = [] as string[];
  if (actionTimeline) {
    actions.push(...actionTimeline.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  } else {
    if (clean.pose_action) actions.push(clean.pose_action);
    if (clean.camera_move) actions.push(`Camera: ${clean.camera_move}`);
  }

  const visuals = [] as string[];
  visuals.push(`${clean.genre_style}`);
  visuals.push(`${withCaptureWord(clean.shot_type, captureWord)}`);
  visuals.push(`Subject: ${clean.subject_traits} ${clean.subject_role}`);
  if (clean.wardrobe) visuals.push(`Wardrobe: ${clean.wardrobe}`);
  visuals.push(`Environment: ${clean.environment}`);
  visuals.push(`Weather: ${clean.weather}`);
  visuals.push(`Lighting: ${clean.lighting} (${clean.light_interaction})`);
  if (clean.sig1) visuals.push(`Signature: ${clean.sig1}`);
  if (clean.sig2) visuals.push(`Signature: ${clean.sig2}`);
  if (clean.lens) visuals.push(`Lens: ${clean.lens}`);
  if (clean.color_grade) visuals.push(`Grade: ${clean.color_grade}`);
  if (clean.mood) visuals.push(`Mood: ${clean.mood}`);

  const audio = [] as string[];
  if (clean.sound) audio.push(`Ambient: ${clean.sound}`);
  if (clean.sfx) audio.push(`SFX: ${clean.sfx}`);
  if (clean.music) audio.push(`Music: ${clean.music}`);
  if (clean.mix_notes) audio.push(`Mix notes: ${clean.mix_notes}`);
  if (clean.dialogue && clean.dialogue.trim()) {
    const pronoun = (clean.pronoun || '').trim();
    const verb = (clean.dialogue_verb || '').trim();
    audio.push(pronoun && verb ? `Dialogue: ${pronoun} ${verb}: "${clean.dialogue}"` : `Dialogue: "${clean.dialogue}"`);
  }

  const nsfw = nsfwElements.length
    ? [`${nsfwElements.join(', ')}`]
    : [];

  return [
    formatLtx2Section('Core Actions', actions),
    formatLtx2Section('Visual Details', visuals),
    formatLtx2Section('Audio', audio),
    formatLtx2Section('NSFW', nsfw),
  ].filter(Boolean).join('\n\n');
}

function buildClassicParagraph(data: ClassicData, captureWord: CaptureWord, format: PromptFormat = 'paragraph'): string {
  if (format === 'ltx2') {
    const coreActions = [] as string[];
    if (data.action) coreActions.push(data.action);
    if (data.camera) coreActions.push(`Camera: ${data.camera}`);

    const visuals = [] as string[];
    visuals.push(`${withCaptureWord(data.shot, captureWord)}; ${data.genre} tone`);
    if (data.subject) visuals.push(`Subject: ${data.subject}`);
    if (data.wardrobe) visuals.push(`Wardrobe: ${data.wardrobe}`);
    visuals.push(`Environment: ${data.environment || 'the scene'}`);
    visuals.push(`Lighting: ${data.lighting}`);
    if (data.palette) visuals.push(`Color grade: ${data.palette}`);

    const audio = [] as string[];
    if (data.audio) audio.push(`Ambient: ${data.audio}`);
    if (data.sfx) audio.push(`SFX: ${data.sfx}`);
    if (data.music) audio.push(`Music: ${data.music}`);
    if (data.mix_notes) audio.push(`Mix notes: ${data.mix_notes}`);
    if (data.dialogue) audio.push(`Dialogue: "${data.dialogue}"`);

    return [
      formatLtx2Section('Core Actions', coreActions),
      formatLtx2Section('Visual Details', visuals),
      formatLtx2Section('Audio', audio),
    ].filter(Boolean).join('\n\n');
  }

  const bits = [] as string[];
  bits.push(`A ${withCaptureWord(data.shot, captureWord)} in a ${data.genre} tone`);
  if (data.subject) bits.push(`featuring ${data.subject}`);
  if (data.wardrobe) bits.push(`in ${data.wardrobe}`);
  bits.push(`set in ${data.environment || 'the scene'} at ${data.time} with ${data.lighting}`);
  if (data.atmosphere && data.atmosphere !== 'clear air') bits.push(`amid ${data.atmosphere}`);
  bits.push(`camera ${data.camera}`);
  if (data.palette) bits.push(`palette ${data.palette}`);
  if (data.action) bits.push(`action: ${data.action}`);
  if (data.audio) bits.push(`ambient: ${data.audio}`);
  if (data.sfx) bits.push(`sfx: ${data.sfx}`);
  if (data.music) bits.push(`music: ${data.music}`);
  if (data.mix_notes) bits.push(`mix notes: ${data.mix_notes}`);
  if (data.dialogue) bits.push(`Dialogue: "${data.dialogue}"`);
  if (data.avoid) bits.push(`Avoid: ${data.avoid}`);
  return bits.join('. ').replace(/\s+/g, ' ').trim() + '.';
}

function buildPrompt(
  mode: string,
  values: Record<string, Record<string, string>>,
  nsfwEnabled: boolean,
  _optionSets: OptionSets,
  captureWord: CaptureWord = 'shot',
  promptFormat: PromptFormat = 'ltx2'
) {
  const current = values[mode] || {};

  const pick = (field: string, fallback = '') => {
    return values[mode]?.[field] || fallback;
  };

  if (mode === 'classic') {
    const data: ClassicData = {
      genre: pick('genre', 'Classic scene'),
      shot: pick('shot', 'medium'),
      subject: pick('role', ''),
      wardrobe: pick('wardrobe', ''),
      environment: pick('environment', 'the scene'),
      time: 'dusk',
      lighting: pick('lighting', 'soft light'),
      atmosphere: 'clear air',
      camera: pick('cameraMove', 'steady cam'),
      palette: pick('colorGrade', ''),
      action: (current.actions || '').trim(),
      audio: pick('sound', ''),
      sfx: pick('sfx', ''),
      music: pick('music', ''),
      mix_notes: (current.mix_notes || '').trim(),
      dialogue: current.dialogue || '',
      avoid: '',
    };
    return buildClassicParagraph(data, captureWord, promptFormat);
  }

  // Cinematic and NSFW both use the cinematic paragraph builder
  const data: CinematicData = {
    genre_style: pick('genre', 'Cinematic scene'),
    shot_type: pick('shot', 'wide'),
    subject_traits: 'detailed',
    subject_role: pick('role', 'subject'),
    pose_action: pick('pose', 'standing'),
    wardrobe: pick('wardrobe', ''),
    prop_action: '',
    prop_weapon: '',
    hair_face_detail: '',
    sig1: pick('sig1', 'atmospheric haze'),
    sig2: pick('sig2', 'soft rim light'),
    environment: pick('environment', 'unspecified environment'),
    weather: pick('weather', 'clear air'),
    lighting: pick('lighting', 'soft light'),
    light_interaction: pick('lightInteraction', 'wraps gently'),
    sound: pick('sound', 'quiet ambience'),
    sfx: pick('sfx', ''),
    music: pick('music', ''),
    mix_notes: (current.mix_notes || '').trim(),
    dialogue: current.dialogue || '',
    pronoun: current.pronoun || '',
    dialogue_verb: current.dialogue_verb || '',
    mood: pick('mood', ''),
    lens: pick('lens', ''),
    color_grade: pick('colorGrade', ''),
    film_details: '',
    camera_move: pick('cameraMove', 'slow push'),
    focus_target: 'the subject',
    explicit_abilities: nsfwEnabled ? current.explicit_abilities || '' : '',
    body_description: nsfwEnabled ? current.body_description || '' : '',
    sexual_description: nsfwEnabled ? current.sexual_description || '' : '',
  };

  return buildCinematicParagraph(data, captureWord, promptFormat, (current.actions || '').trim());
}

function normalizeOptions(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const v = (raw || '').trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function mergeOptionSets(base: OptionSets, override?: Partial<OptionSets> | null): OptionSets {
  const merged: OptionSets = JSON.parse(JSON.stringify(base));
  if (!override) return merged;
  for (const [mode, fields] of Object.entries(override)) {
    if (!fields) continue;
    merged[mode] = merged[mode] || {};
    for (const [field, list] of Object.entries(fields as Record<string, unknown>)) {
      if (!Array.isArray(list)) continue;
      merged[mode][field] = normalizeOptions(list.map(String));
    }
  }
  return merged;
}

function loadOptionSets(): Partial<OptionSets> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(OPTION_SETS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveOptionSets(optionSets: OptionSets) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OPTION_SETS_STORAGE_KEY, JSON.stringify(optionSets));
  } catch {
    // ignore
  }
}

function loadUiPrefs(): UiPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(UI_PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    const cw = parsed.captureWord;
    const captureWord: CaptureWord = cw === 'video' || cw === 'clip' || cw === 'frame' ? cw : 'shot';
    const pf = parsed.promptFormat;
    const promptFormat: PromptFormat = pf === 'paragraph' ? 'paragraph' : 'ltx2';
    return {
      typingEnabled: parsed.typingEnabled !== false,
      typingSpeedMs: typeof parsed.typingSpeedMs === 'number' ? parsed.typingSpeedMs : 14,
      captureWord,
      autoCopyOnReview: parsed.autoCopyOnReview === true,
      promptFormat,
    };
  } catch {
    return null;
  }
}

function saveUiPrefs(prefs: UiPrefs) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UI_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function TypewriterText({
  text,
  speedMs = 14,
  startDelayMs = 120,
}: {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
}) {
  const [out, setOut] = useState('');

  useEffect(() => {
    let alive = true;
    let i = 0;
    let interval: number | undefined;
    setOut('');

    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (!alive) return;
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          if (interval) window.clearInterval(interval);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      alive = false;
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);

  return (
    <span className="typewriter">
      {out}
      <span className="tw-caret" aria-hidden="true" />
    </span>
  );
}
