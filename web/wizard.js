const MODES = [
  { id: 'cinematic', title: 'Cinematic', tag: 'Camera-forward', desc: 'Film-inspired framing, motion, and grading.' },
  { id: 'classic', title: 'Classic', tag: 'Balanced', desc: 'Cohesive, versatile looks for general prompts.' },
  { id: 'nsfw', title: 'NSFW', tag: '18+', desc: 'Adult-focused styling. Requires NSFW enabled.' }
];

const OPTION_SETS = {
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

const state = {
  step: 1,
  nsfwEnabled: false,
  mode: 'cinematic',
  values: {
    cinematic: {},
    classic: {},
    nsfw: {},
  },
};

let steps = [];
let progressTrack = null;
let progressPipsContainer = null;
let modeGrid = null;
let nsfwToggle = null;
let nsfwAlert = null;
let selects = [];
let summaryEl = null;
let promptOutput = null;
let copyBtn = null;
let backBtn = null;
let nextBtn = null;

function init() {
  // Query DOM now to avoid early nulls
  steps = Array.from(document.querySelectorAll('[data-step]'));
  progressTrack = document.querySelector('.progress-track');
  progressPipsContainer = document.getElementById('progress-pips');
  modeGrid = document.getElementById('mode-grid');
  nsfwToggle = document.getElementById('nsfw-toggle');
  nsfwAlert = document.getElementById('nsfw-alert');
  selects = Array.from(document.querySelectorAll('select[data-field]'));
  summaryEl = document.getElementById('summary');
  promptOutput = document.getElementById('prompt-output');
  copyBtn = document.getElementById('copy-btn');
  backBtn = document.getElementById('back-btn');
  nextBtn = document.getElementById('next-btn');

  // Guard against missing DOM (e.g., if script loads before body)
  if (!progressTrack || !progressPipsContainer || !modeGrid || !backBtn || !nextBtn || steps.length === 0) return;

  buildPips();
  renderModeCards();
  attachModeListeners();
  attachSelectListeners();
  attachNavListeners();
  attachCopy();
  renderOptionsFor(state.mode);
  renderSummary();
  buildPrompt();
  updateStepUI();
}

function buildPips() {
  const total = steps.length;
  progressPipsContainer.innerHTML = '';
  for (let i = 0; i < total; i += 1) {
    const pip = document.createElement('div');
    pip.className = 'progress-pip';
    progressPipsContainer.appendChild(pip);
  }
}

function renderModeCards() {
  modeGrid.innerHTML = '';
  MODES.forEach((mode) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mode-card';
    card.dataset.mode = mode.id;
    card.innerHTML = `
      <div class="mode-tag">${mode.tag}</div>
      <p class="mode-title">${mode.title}</p>
      <p class="hint">${mode.desc}</p>
    `;
    modeGrid.appendChild(card);
  });
}

function attachModeListeners() {
  modeGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.mode-card');
    if (!card) return;
    const mode = card.dataset.mode;
    state.mode = mode;
    updateModeCards();
    if (mode === 'nsfw' && !state.nsfwEnabled) {
      nsfwAlert.hidden = false;
    } else {
      nsfwAlert.hidden = true;
    }
    renderOptionsFor(mode);
    renderSummary();
    buildPrompt();
  });

  nsfwToggle.addEventListener('change', (e) => {
    state.nsfwEnabled = e.target.checked;
    if (state.mode === 'nsfw' && !state.nsfwEnabled) {
      nsfwAlert.hidden = false;
    } else {
      nsfwAlert.hidden = true;
    }
  });

  updateModeCards();
}

function updateModeCards() {
  const cards = modeGrid.querySelectorAll('.mode-card');
  cards.forEach((card) => {
    card.classList.toggle('active', card.dataset.mode === state.mode);
  });
}

function renderOptionsFor(mode) {
  const opts = OPTION_SETS[mode];
  selects.forEach((sel) => {
    const field = sel.dataset.field;
    const values = opts[field] || [];
    sel.innerHTML = values.map((v) => `<option value="${v}">${v}</option>`).join('');
    const saved = state.values[mode][field];
    sel.value = saved || values[0] || '';
    state.values[mode][field] = sel.value;
  });
}

function attachSelectListeners() {
  selects.forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const field = e.target.dataset.field;
      state.values[state.mode][field] = e.target.value;
      renderSummary();
      buildPrompt();
    });
  });
}

function attachNavListeners() {
  backBtn.addEventListener('click', () => {
    state.step = Math.max(1, state.step - 1);
    updateStepUI();
  });

  nextBtn.addEventListener('click', () => {
    if (state.step === 1 && state.mode === 'nsfw' && !state.nsfwEnabled) {
      nsfwAlert.hidden = false;
      return;
    }
    state.step = Math.min(steps.length, state.step + 1);
    updateStepUI();
    renderSummary();
    buildPrompt();
  });
}

function updateStepUI() {
  steps.forEach((stepEl) => {
    const n = Number(stepEl.dataset.step);
    stepEl.classList.toggle('active', n === state.step);
  });

  backBtn.disabled = state.step === 1;
  nextBtn.textContent = state.step === steps.length ? 'Finish' : 'Next';

  const ratio = state.step / steps.length;
  progressTrack.style.width = `${Math.max(0.25, ratio) * 100}%`;

  const pips = progressPipsContainer.querySelectorAll('.progress-pip');
  pips.forEach((pip, idx) => {
    pip.classList.toggle('active', idx < state.step);
  });
}

function renderSummary() {
  const current = state.values[state.mode];
  summaryEl.innerHTML = `
    <div class="summary-item">
      <div class="summary-label">Mode</div>
      <div class="summary-value">${labelForMode(state.mode)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Genre</div>
      <div class="summary-value">${current.genre || '—'}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Shot</div>
      <div class="summary-value">${current.shot || '—'}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Role</div>
      <div class="summary-value">${current.role || '—'}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Mood</div>
      <div class="summary-value">${current.mood || '—'}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Lighting</div>
      <div class="summary-value">${current.lighting || '—'}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Environment</div>
      <div class="summary-value">${current.environment || '—'}</div>
    </div>
  `;
}

function buildPrompt() {
  const modeLabel = labelForMode(state.mode);
  const v = state.values[state.mode];
  const parts = [modeLabel];
  if (v.genre) parts.push(v.genre);
  if (v.shot) parts.push(v.shot);
  if (v.role) parts.push(v.role);
  const moodBlock = [v.mood, v.lighting].filter(Boolean).join(' · ');
  if (moodBlock) parts.push(moodBlock);
  if (v.environment) parts.push(`at ${v.environment}`);
  promptOutput.value = parts.join(' | ');
}

function attachCopy() {
  copyBtn.addEventListener('click', async () => {
    const text = promptOutput.value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
    } catch (err) {
      console.error('Copy failed', err);
    }
  });
}

function labelForMode(mode) {
  const found = MODES.find((m) => m.id === mode);
  return found ? found.title : mode;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
