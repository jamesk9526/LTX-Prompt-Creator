'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './wizard.css';

// ============================================================
// Types
// ============================================================

type TabId = 'editor' | 'scratchpad' | 'library' | 'versions' | 'output' | 'settings';

type SectionType = 'role' | 'goal' | 'constraints' | 'style' | 'context' | 'output_rules' | 'examples' | 'notes';

interface PromptSection {
  id: string;
  type: SectionType;
  content: string;
  collapsed: boolean;
}

interface SavedPrompt {
  id: string;
  title: string;
  sections: PromptSection[];
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

interface LibraryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: number;
}

interface PromptVersion {
  id: string;
  promptId: string;
  timestamp: number;
  label: string;
  sections: PromptSection[];
  fullText: string;
}

interface OutputData {
  response: string;
  model: string;
  generationTime: number;
  tokenCount: number;
  promptUsed: string;
}

interface AppSettings {
  systemPrompt: string;
  ollamaEndpoint: string;
  selectedModel: string;
  temperature: number;
  topP: number;
  contextSize: number;
  seed: number;
  theme: 'light';
}

interface WorkspaceState {
  folders: Folder[];
  expandedFolders: string[];
  activePromptId: string | null;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_SYSTEM_PROMPT = `You are an expert prompt engineering assistant. Your role is to help users craft, refine, and optimize prompts for AI models. You understand prompt structure, clarity, specificity, and how different models interpret instructions. When analyzing prompts, consider: role definition, goal clarity, constraint specificity, output formatting, example quality, and edge case handling. Provide actionable, specific feedback. When generating prompts, follow best practices: be specific, use clear structure, define expected output format, include relevant context, and set appropriate constraints.`;

const SECTION_META: Record<SectionType, { label: string; icon: string; placeholder: string }> = {
  role: { label: 'Role', icon: '👤', placeholder: 'Define the AI\'s role and persona. E.g., "You are a senior technical writer..."' },
  goal: { label: 'Goal', icon: '🎯', placeholder: 'What should the AI accomplish? Be specific about the desired outcome.' },
  constraints: { label: 'Constraints', icon: '🚧', placeholder: 'Rules, limitations, and things to avoid. E.g., "Do not use jargon..."' },
  style: { label: 'Style', icon: '🎨', placeholder: 'Tone, voice, and formatting preferences. E.g., "Professional but approachable..."' },
  context: { label: 'Context', icon: '📋', placeholder: 'Background information, domain knowledge, or situational context.' },
  output_rules: { label: 'Output Rules', icon: '📐', placeholder: 'Format, structure, and length requirements. E.g., "Respond in JSON format..."' },
  examples: { label: 'Examples', icon: '💡', placeholder: 'Example inputs and desired outputs to guide the AI\'s responses.' },
  notes: { label: 'Notes', icon: '📝', placeholder: 'Additional notes, edge cases, or reminders for this prompt.' },
};

const ALL_SECTION_TYPES: SectionType[] = ['role', 'goal', 'constraints', 'style', 'context', 'output_rules', 'examples', 'notes'];

const LIBRARY_CATEGORIES = ['All', 'System Prompts', 'Templates', 'Components', 'Tone Packs', 'Role Definitions'];

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'editor', label: 'Editor', icon: '✏️' },
  { id: 'scratchpad', label: 'Scratchpad', icon: '📄' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'versions', label: 'Versions', icon: '🕐' },
  { id: 'output', label: 'Output', icon: '▶️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const STORAGE_KEYS = {
  prompts: 'oyama_prompts_v1',
  scratchpad: 'oyama_scratchpad_v1',
  library: 'oyama_library_v1',
  versions: 'oyama_versions_v1',
  settings: 'oyama_settings_v1',
  workspace: 'oyama_workspace_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  ollamaEndpoint: 'http://localhost:11434',
  selectedModel: '',
  temperature: 0.7,
  topP: 0.9,
  contextSize: 4096,
  seed: -1,
  theme: 'light',
};

const DEFAULT_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib-1',
    title: 'Expert Analyst',
    content: 'You are an expert analyst with deep knowledge in the specified domain. Analyze the given information thoroughly, identify key patterns, and provide actionable insights with supporting evidence.',
    category: 'Role Definitions',
    tags: ['role', 'analysis'],
    createdAt: Date.now(),
  },
  {
    id: 'lib-2',
    title: 'Structured Output Template',
    content: '## Task\n[Describe the task]\n\n## Input\n[Provide input data]\n\n## Expected Output Format\n- Key findings (bullet points)\n- Summary (1-2 paragraphs)\n- Recommendations (numbered list)\n\n## Constraints\n- Be concise\n- Use evidence-based reasoning\n- Cite sources when possible',
    category: 'Templates',
    tags: ['template', 'structured'],
    createdAt: Date.now(),
  },
  {
    id: 'lib-3',
    title: 'Professional Tone Pack',
    content: 'Maintain a professional, authoritative tone throughout. Use precise language, avoid colloquialisms, and structure responses with clear headings and logical flow. Favor active voice and concrete examples over abstract descriptions.',
    category: 'Tone Packs',
    tags: ['tone', 'professional'],
    createdAt: Date.now(),
  },
  {
    id: 'lib-4',
    title: 'Code Review System Prompt',
    content: 'You are a senior software engineer conducting a thorough code review. Examine the code for: correctness, performance, security vulnerabilities, readability, maintainability, and adherence to best practices. Provide specific line references and suggest concrete improvements. Rate severity: critical, major, minor, suggestion.',
    category: 'System Prompts',
    tags: ['code', 'review', 'system'],
    createdAt: Date.now(),
  },
  {
    id: 'lib-5',
    title: 'Chain-of-Thought Component',
    content: 'Think through this step-by-step:\n1. First, identify the core problem\n2. Break it down into sub-problems\n3. Solve each sub-problem\n4. Combine the solutions\n5. Verify the final answer\n\nShow your reasoning at each step.',
    category: 'Components',
    tags: ['reasoning', 'chain-of-thought'],
    createdAt: Date.now(),
  },
  {
    id: 'lib-6',
    title: 'Creative Writer',
    content: 'You are a creative writer with a gift for vivid imagery and compelling narratives. Your writing is evocative, sensory-rich, and emotionally resonant. You adapt your style to match the genre and audience while maintaining your unique voice.',
    category: 'Role Definitions',
    tags: ['role', 'creative', 'writing'],
    createdAt: Date.now(),
  },
];

// ============================================================
// Utility Functions
// ============================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countChars(text: string): number {
  return text.length;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function sectionsToText(sections: PromptSection[]): string {
  return sections
    .filter((s) => s.content.trim())
    .map((s) => {
      const meta = SECTION_META[s.type];
      return `[${meta.label}]\n${s.content.trim()}`;
    })
    .join('\n\n');
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

function makeDefaultPrompt(): SavedPrompt {
  return {
    id: generateId(),
    title: 'Untitled Prompt',
    sections: [
      { id: generateId(), type: 'role', content: '', collapsed: false },
      { id: generateId(), type: 'goal', content: '', collapsed: false },
    ],
    folderId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Simple variable extraction: finds {{variable_name}} patterns
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  const unique = [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
  return unique;
}

// ============================================================
// Main Component
// ============================================================

export default function WizardPage() {
  // --- Core State ---
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // --- Prompt State ---
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  // --- Workspace ---
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    folders: [
      { id: 'folder-drafts', name: 'Drafts', parentId: null },
      { id: 'folder-production', name: 'Production', parentId: null },
    ],
    expandedFolders: ['folder-drafts', 'folder-production'],
    activePromptId: null,
  });
  const [sidebarSearch, setSidebarSearch] = useState('');

  // --- Scratchpad ---
  const [scratchpadContent, setScratchpadContent] = useState('');

  // --- Library ---
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(DEFAULT_LIBRARY_ITEMS);
  const [libraryCategory, setLibraryCategory] = useState('All');
  const [librarySearch, setLibrarySearch] = useState('');
  const [showNewComponent, setShowNewComponent] = useState(false);
  const [newComponentTitle, setNewComponentTitle] = useState('');
  const [newComponentContent, setNewComponentContent] = useState('');
  const [newComponentCategory, setNewComponentCategory] = useState('Components');
  const [newComponentTags, setNewComponentTags] = useState('');

  // --- Versions ---
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [compareVersions, setCompareVersions] = useState<[string | null, string | null]>([null, null]);
  const [showDiff, setShowDiff] = useState(false);

  // --- Output ---
  const [outputData, setOutputData] = useState<OutputData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');

  // --- Settings ---
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // --- Ollama ---
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaConnected, setOllamaConnected] = useState(false);

  // --- UI ---
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);

  // --- Refs ---
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ============================================================
  // Derived State
  // ============================================================

  const activePrompt = useMemo(() => {
    if (!activePromptId) return null;
    return prompts.find((p) => p.id === activePromptId) || null;
  }, [prompts, activePromptId]);

  const fullPromptText = useMemo(() => {
    if (!activePrompt) return '';
    return sectionsToText(activePrompt.sections);
  }, [activePrompt]);

  const promptStats = useMemo(() => {
    const text = fullPromptText;
    return {
      chars: countChars(text),
      words: countWords(text),
      tokens: estimateTokens(text),
      sections: activePrompt?.sections.filter((s) => s.content.trim()).length || 0,
    };
  }, [fullPromptText, activePrompt]);

  const promptVariables = useMemo(() => {
    return extractVariables(fullPromptText);
  }, [fullPromptText]);

  const promptQuality = useMemo(() => {
    if (!activePrompt) return { score: 0, hints: [] as { type: string; message: string }[] };
    const hints: { type: string; message: string }[] = [];
    let score = 0;
    const sections = activePrompt.sections;
    const filledSections = sections.filter((s) => s.content.trim().length > 10);

    if (filledSections.some((s) => s.type === 'role')) {
      score += 20;
      hints.push({ type: 'good', message: 'Role is defined — clear persona helps AI respond consistently.' });
    } else {
      hints.push({ type: 'warn', message: 'Consider adding a Role section to define the AI\'s persona.' });
    }

    if (filledSections.some((s) => s.type === 'goal')) {
      score += 25;
      hints.push({ type: 'good', message: 'Goal is specified — the AI knows what to accomplish.' });
    } else {
      hints.push({ type: 'warn', message: 'Add a Goal section to clarify what the AI should do.' });
    }

    if (filledSections.some((s) => s.type === 'constraints')) {
      score += 15;
      hints.push({ type: 'good', message: 'Constraints set — boundaries help avoid unwanted output.' });
    } else {
      hints.push({ type: 'info', message: 'Adding constraints can prevent off-topic or unwanted responses.' });
    }

    if (filledSections.some((s) => s.type === 'examples')) {
      score += 15;
      hints.push({ type: 'good', message: 'Examples provided — few-shot learning improves accuracy.' });
    } else {
      hints.push({ type: 'info', message: 'Examples (few-shot) can significantly improve output quality.' });
    }

    if (filledSections.some((s) => s.type === 'output_rules')) {
      score += 15;
      hints.push({ type: 'good', message: 'Output format defined — structured responses are more useful.' });
    }

    if (filledSections.length >= 3) {
      score += 10;
    }

    const totalLen = filledSections.reduce((acc, s) => acc + s.content.length, 0);
    if (totalLen > 100) {
      score = Math.min(100, score);
    } else if (totalLen > 0) {
      score = Math.min(score, 40);
      hints.push({ type: 'info', message: 'Add more detail to your prompt sections for better results.' });
    }

    return { score: Math.min(100, score), hints };
  }, [activePrompt]);

  const filteredSidebarPrompts = useMemo(() => {
    if (!sidebarSearch.trim()) return prompts;
    const q = sidebarSearch.toLowerCase();
    return prompts.filter((p) => p.title.toLowerCase().includes(q));
  }, [prompts, sidebarSearch]);

  const filteredLibrary = useMemo(() => {
    let items = libraryItems;
    if (libraryCategory !== 'All') {
      items = items.filter((i) => i.category === libraryCategory);
    }
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [libraryItems, libraryCategory, librarySearch]);

  // ============================================================
  // Toast Helper
  // ============================================================

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  }, []);

  // ============================================================
  // Hydration & Load from Storage
  // ============================================================

  useEffect(() => {
    const savedPrompts = loadFromStorage<SavedPrompt[]>(STORAGE_KEYS.prompts, []);
    const savedScratchpad = loadFromStorage<string>(STORAGE_KEYS.scratchpad, '');
    const savedLibrary = loadFromStorage<LibraryItem[]>(STORAGE_KEYS.library, DEFAULT_LIBRARY_ITEMS);
    const savedVersions = loadFromStorage<PromptVersion[]>(STORAGE_KEYS.versions, []);
    const savedSettings = loadFromStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    const savedWorkspace = loadFromStorage<WorkspaceState>(STORAGE_KEYS.workspace, {
      folders: [
        { id: 'folder-drafts', name: 'Drafts', parentId: null },
        { id: 'folder-production', name: 'Production', parentId: null },
      ],
      expandedFolders: ['folder-drafts', 'folder-production'],
      activePromptId: null,
    });

    if (savedPrompts.length > 0) {
      setPrompts(savedPrompts);
      const lastActiveId = savedWorkspace.activePromptId;
      if (lastActiveId && savedPrompts.some((p) => p.id === lastActiveId)) {
        setActivePromptId(lastActiveId);
      } else {
        setActivePromptId(savedPrompts[0].id);
      }
    } else {
      const defaultPrompt = makeDefaultPrompt();
      setPrompts([defaultPrompt]);
      setActivePromptId(defaultPrompt.id);
    }

    setScratchpadContent(savedScratchpad);
    if (savedLibrary.length > 0) setLibraryItems(savedLibrary);
    setVersions(savedVersions);
    setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
    setWorkspace(savedWorkspace);
    setIsHydrated(true);
  }, []);

  // ============================================================
  // Auto-Save
  // ============================================================

  const scheduleSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      requestAnimationFrame(() => {
        saveToStorage(STORAGE_KEYS.prompts, prompts);
        saveToStorage(STORAGE_KEYS.scratchpad, scratchpadContent);
        saveToStorage(STORAGE_KEYS.library, libraryItems);
        saveToStorage(STORAGE_KEYS.versions, versions);
        saveToStorage(STORAGE_KEYS.settings, settings);
        saveToStorage(STORAGE_KEYS.workspace, { ...workspace, activePromptId });
        setSaveStatus('saved');
      });
    }, 800);
  }, [prompts, scratchpadContent, libraryItems, versions, settings, workspace, activePromptId]);

  useEffect(() => {
    if (!isHydrated) return;
    scheduleSave();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [prompts, scratchpadContent, libraryItems, versions, settings, workspace, activePromptId, isHydrated, scheduleSave]);

  // ============================================================
  // Ollama: Fetch Models
  // ============================================================

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch(`${settings.ollamaEndpoint}/api/tags`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const models: string[] = (data.models || []).map((m: { name: string }) => m.name);
      setOllamaModels(models);
      setOllamaConnected(true);
      if (!settings.selectedModel && models.length > 0) {
        setSettings((prev) => ({ ...prev, selectedModel: models[0] }));
      }
    } catch {
      setOllamaModels([]);
      setOllamaConnected(false);
    }
  }, [settings.ollamaEndpoint, settings.selectedModel]);

  useEffect(() => {
    if (!isHydrated) return;
    fetchModels();
    const interval = setInterval(fetchModels, 30000);
    return () => clearInterval(interval);
  }, [isHydrated, fetchModels]);

  // ============================================================
  // Ollama: Run Prompt
  // ============================================================

  const runPrompt = useCallback(async () => {
    const text = fullPromptText;
    if (!text.trim()) {
      showToast('Write something in the editor first');
      return;
    }
    if (!settings.selectedModel) {
      showToast('Select an Ollama model first');
      return;
    }

    setIsGenerating(true);
    setStreamText('');
    setActiveTab('output');

    const startTime = Date.now();

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${settings.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.selectedModel,
          prompt: text,
          system: settings.systemPrompt,
          stream: true,
          options: {
            temperature: settings.temperature,
            top_p: settings.topP,
            num_ctx: settings.contextSize,
            ...(settings.seed >= 0 ? { seed: settings.seed } : {}),
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let totalTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              accumulated += parsed.response;
              setStreamText(accumulated);
            }
            if (parsed.eval_count) {
              totalTokens = parsed.eval_count;
            }
          } catch {
            // Partial JSON, skip
          }
        }
      }

      const elapsed = Date.now() - startTime;
      const output: OutputData = {
        response: accumulated,
        model: settings.selectedModel,
        generationTime: elapsed,
        tokenCount: totalTokens || estimateTokens(accumulated),
        promptUsed: text,
      };
      setOutputData(output);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      setOutputData({
        response: `Error: ${message}\n\nMake sure Ollama is running at ${settings.ollamaEndpoint}`,
        model: settings.selectedModel,
        generationTime: 0,
        tokenCount: 0,
        promptUsed: text,
      });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [fullPromptText, settings, showToast]);

  // ============================================================
  // Prompt CRUD
  // ============================================================

  const createNewPrompt = useCallback(() => {
    const newPrompt = makeDefaultPrompt();
    setPrompts((prev) => [newPrompt, ...prev]);
    setActivePromptId(newPrompt.id);
    setActiveTab('editor');
    showToast('New prompt created');
  }, [showToast]);

  const updateActivePrompt = useCallback(
    (updater: (p: SavedPrompt) => SavedPrompt) => {
      if (!activePromptId) return;
      setPrompts((prev) =>
        prev.map((p) => (p.id === activePromptId ? updater({ ...p, updatedAt: Date.now() }) : p))
      );
    },
    [activePromptId]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      setPrompts((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        if (id === activePromptId) {
          setActivePromptId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
      showToast('Prompt deleted');
    },
    [activePromptId, showToast]
  );

  const duplicatePrompt = useCallback(
    (id: string) => {
      const original = prompts.find((p) => p.id === id);
      if (!original) return;
      const copy: SavedPrompt = {
        ...original,
        id: generateId(),
        title: `${original.title} (copy)`,
        sections: original.sections.map((s) => ({ ...s, id: generateId() })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setPrompts((prev) => [copy, ...prev]);
      setActivePromptId(copy.id);
      showToast('Prompt duplicated');
    },
    [prompts, showToast]
  );

  // ============================================================
  // Section Management
  // ============================================================

  const addSection = useCallback(
    (type: SectionType) => {
      const newSection: PromptSection = {
        id: generateId(),
        type,
        content: '',
        collapsed: false,
      };
      updateActivePrompt((p) => ({
        ...p,
        sections: [...p.sections, newSection],
      }));
      setShowSectionPicker(false);
    },
    [updateActivePrompt]
  );

  const updateSection = useCallback(
    (sectionId: string, content: string) => {
      updateActivePrompt((p) => ({
        ...p,
        sections: p.sections.map((s) => (s.id === sectionId ? { ...s, content } : s)),
      }));
    },
    [updateActivePrompt]
  );

  const toggleSectionCollapse = useCallback(
    (sectionId: string) => {
      updateActivePrompt((p) => ({
        ...p,
        sections: p.sections.map((s) =>
          s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
        ),
      }));
    },
    [updateActivePrompt]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      updateActivePrompt((p) => ({
        ...p,
        sections: p.sections.filter((s) => s.id !== sectionId),
      }));
    },
    [updateActivePrompt]
  );

  const moveSectionUp = useCallback(
    (sectionId: string) => {
      updateActivePrompt((p) => {
        const idx = p.sections.findIndex((s) => s.id === sectionId);
        if (idx <= 0) return p;
        const next = [...p.sections];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        return { ...p, sections: next };
      });
    },
    [updateActivePrompt]
  );

  const moveSectionDown = useCallback(
    (sectionId: string) => {
      updateActivePrompt((p) => {
        const idx = p.sections.findIndex((s) => s.id === sectionId);
        if (idx < 0 || idx >= p.sections.length - 1) return p;
        const next = [...p.sections];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        return { ...p, sections: next };
      });
    },
    [updateActivePrompt]
  );

  // ============================================================
  // Version Management
  // ============================================================

  const saveVersion = useCallback(
    (label?: string) => {
      if (!activePrompt) return;
      const version: PromptVersion = {
        id: generateId(),
        promptId: activePrompt.id,
        timestamp: Date.now(),
        label: label || `Version ${versions.filter((v) => v.promptId === activePrompt.id).length + 1}`,
        sections: activePrompt.sections.map((s) => ({ ...s })),
        fullText: sectionsToText(activePrompt.sections),
      };
      setVersions((prev) => [version, ...prev].slice(0, 100));
      showToast('Version saved');
    },
    [activePrompt, versions, showToast]
  );

  // Auto-version every 5 minutes of editing
  useEffect(() => {
    if (!activePrompt || !isHydrated) return;
    if (versionTimerRef.current) clearTimeout(versionTimerRef.current);
    versionTimerRef.current = setTimeout(() => {
      const text = sectionsToText(activePrompt.sections);
      if (text.trim().length > 20) {
        const existingVersions = versions.filter((v) => v.promptId === activePrompt.id);
        if (existingVersions.length === 0 || existingVersions[0]?.fullText !== text) {
          saveVersion('Auto-save');
        }
      }
    }, 300000);
    return () => {
      if (versionTimerRef.current) clearTimeout(versionTimerRef.current);
    };
  }, [activePrompt, versions, isHydrated, saveVersion]);

  const restoreVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (!version || !activePromptId) return;
      saveVersion('Before restore');
      updateActivePrompt((p) => ({
        ...p,
        sections: version.sections.map((s) => ({ ...s, id: generateId() })),
      }));
      showToast('Version restored');
    },
    [versions, activePromptId, saveVersion, updateActivePrompt, showToast]
  );

  const forkVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (!version) return;
      const forked: SavedPrompt = {
        id: generateId(),
        title: `Fork of ${activePrompt?.title || 'Prompt'}`,
        sections: version.sections.map((s) => ({ ...s, id: generateId() })),
        folderId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setPrompts((prev) => [forked, ...prev]);
      setActivePromptId(forked.id);
      showToast('Version forked as new prompt');
    },
    [versions, activePrompt, showToast]
  );

  // ============================================================
  // Library Management
  // ============================================================

  const addLibraryItem = useCallback(() => {
    if (!newComponentTitle.trim() || !newComponentContent.trim()) {
      showToast('Title and content are required');
      return;
    }
    const item: LibraryItem = {
      id: generateId(),
      title: newComponentTitle.trim(),
      content: newComponentContent.trim(),
      category: newComponentCategory,
      tags: newComponentTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: Date.now(),
    };
    setLibraryItems((prev) => [item, ...prev]);
    setNewComponentTitle('');
    setNewComponentContent('');
    setNewComponentTags('');
    setShowNewComponent(false);
    showToast('Component added to library');
  }, [newComponentTitle, newComponentContent, newComponentCategory, newComponentTags, showToast]);

  const deleteLibraryItem = useCallback(
    (id: string) => {
      setLibraryItems((prev) => prev.filter((i) => i.id !== id));
      showToast('Removed from library');
    },
    [showToast]
  );

  const insertLibraryItemToEditor = useCallback(
    (content: string) => {
      if (!activePrompt) {
        showToast('Open a prompt first');
        return;
      }
      const newSection: PromptSection = {
        id: generateId(),
        type: 'context',
        content,
        collapsed: false,
      };
      updateActivePrompt((p) => ({
        ...p,
        sections: [...p.sections, newSection],
      }));
      setActiveTab('editor');
      showToast('Inserted into editor');
    },
    [activePrompt, updateActivePrompt, showToast]
  );

  // ============================================================
  // Scratchpad Actions
  // ============================================================

  const promoteToPrompt = useCallback(() => {
    if (!scratchpadContent.trim()) {
      showToast('Scratchpad is empty');
      return;
    }
    if (!activePrompt) {
      createNewPrompt();
    }
    const newSection: PromptSection = {
      id: generateId(),
      type: 'notes',
      content: scratchpadContent.trim(),
      collapsed: false,
    };
    updateActivePrompt((p) => ({
      ...p,
      sections: [...p.sections, newSection],
    }));
    setActiveTab('editor');
    showToast('Promoted to editor');
  }, [scratchpadContent, activePrompt, createNewPrompt, updateActivePrompt, showToast]);

  const saveToLibrary = useCallback(() => {
    if (!scratchpadContent.trim()) {
      showToast('Scratchpad is empty');
      return;
    }
    const item: LibraryItem = {
      id: generateId(),
      title: `Scratchpad — ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
      content: scratchpadContent.trim(),
      category: 'Components',
      tags: ['scratchpad'],
      createdAt: Date.now(),
    };
    setLibraryItems((prev) => [item, ...prev]);
    showToast('Saved to library');
  }, [scratchpadContent, showToast]);

  // ============================================================
  // Settings: Export / Import
  // ============================================================

  const exportData = useCallback(() => {
    const data = {
      prompts,
      scratchpad: scratchpadContent,
      library: libraryItems,
      versions,
      settings,
      workspace,
      exportedAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oyama-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  }, [prompts, scratchpadContent, libraryItems, versions, settings, workspace, showToast]);

  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.prompts) setPrompts(data.prompts);
          if (data.scratchpad) setScratchpadContent(data.scratchpad);
          if (data.library) setLibraryItems(data.library);
          if (data.versions) setVersions(data.versions);
          if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          if (data.workspace) setWorkspace(data.workspace);
          if (data.prompts?.length > 0) setActivePromptId(data.prompts[0].id);
          showToast('Data imported successfully');
        } catch {
          showToast('Invalid file format');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [showToast]);

  // ============================================================
  // Keyboard Shortcuts
  // ============================================================

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        runPrompt();
      }
      if (isMod && e.key === 's') {
        e.preventDefault();
        saveVersion('Manual save');
      }
      if (isMod && e.key === 'n') {
        e.preventDefault();
        createNewPrompt();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runPrompt, saveVersion, createNewPrompt]);

  // ============================================================
  // Render: Top Bar
  // ============================================================

  function renderTopBar() {
    return (
      <div className="oyama-topbar">
        <div className="oyama-topbar-brand">
          <div className="oyama-topbar-brand-icon">O</div>
          <span>Oyama Prompt Pro</span>
        </div>
        <div className="oyama-topbar-divider" />
        <input
          className="oyama-topbar-title-input"
          value={activePrompt?.title || ''}
          onChange={(e) =>
            updateActivePrompt((p) => ({ ...p, title: e.target.value }))
          }
          placeholder="Prompt title..."
          disabled={!activePrompt}
        />
        <div className="oyama-topbar-autosave">
          <span
            className={`oyama-autosave-dot ${saveStatus === 'saving' ? 'oyama-saving' : ''}`}
          />
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'unsaved' && 'Unsaved'}
        </div>
        <div className="oyama-topbar-spacer" />
        <div className="oyama-connection-status">
          <span
            className={`oyama-connection-dot ${ollamaConnected ? 'oyama-connected' : 'oyama-disconnected'}`}
          />
          {ollamaConnected ? 'Connected' : 'Disconnected'}
        </div>
        <select
          className="oyama-topbar-model-select"
          value={settings.selectedModel}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, selectedModel: e.target.value }))
          }
        >
          {ollamaModels.length === 0 && (
            <option value="">No models found</option>
          )}
          {ollamaModels.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button
          className="oyama-btn oyama-btn-primary"
          onClick={runPrompt}
          disabled={isGenerating || !activePrompt}
          title="Run prompt (Ctrl+Enter)"
        >
          {isGenerating ? (
            <>
              <span className="oyama-spinner" /> Running...
            </>
          ) : (
            <>▶ Run</>
          )}
        </button>
        <button
          className="oyama-btn-icon"
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    );
  }

  // ============================================================
  // Render: Tab Bar
  // ============================================================

  function renderTabBar() {
    return (
      <div className="oyama-tabbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`oyama-tab ${activeTab === tab.id ? 'oyama-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="oyama-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // ============================================================
  // Render: Left Sidebar
  // ============================================================

  function renderLeftSidebar() {
    return (
      <div className={`oyama-sidebar ${!leftSidebarOpen ? 'oyama-sidebar-collapsed' : ''}`}>
        <div className="oyama-sidebar-header">
          <span className="oyama-sidebar-title">Workspace</span>
          <button
            className="oyama-btn-icon"
            onClick={() => setLeftSidebarOpen(false)}
            title="Collapse sidebar"
            style={{ width: 24, height: 24, fontSize: 12 }}
          >
            ◀
          </button>
        </div>
        <div className="oyama-sidebar-search">
          <div className="oyama-search-wrapper">
            <span className="oyama-search-icon">🔍</span>
            <input
              className="oyama-search-input"
              placeholder="Search prompts..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="oyama-sidebar-content">
          {workspace.folders.map((folder) => {
            const isExpanded = workspace.expandedFolders.includes(folder.id);
            const folderPrompts = filteredSidebarPrompts.filter(
              (p) => p.folderId === folder.id
            );
            return (
              <div key={folder.id} className="oyama-sidebar-folder">
                <button
                  className="oyama-sidebar-folder-header"
                  onClick={() =>
                    setWorkspace((prev) => ({
                      ...prev,
                      expandedFolders: isExpanded
                        ? prev.expandedFolders.filter((f) => f !== folder.id)
                        : [...prev.expandedFolders, folder.id],
                    }))
                  }
                >
                  <span
                    className={`oyama-sidebar-folder-arrow ${isExpanded ? 'oyama-expanded' : ''}`}
                  >
                    ▶
                  </span>
                  📁 {folder.name}
                  <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>
                    {folderPrompts.length}
                  </span>
                </button>
                {isExpanded &&
                  folderPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      className={`oyama-sidebar-item ${prompt.id === activePromptId ? 'oyama-sidebar-item-active' : ''}`}
                      onClick={() => {
                        setActivePromptId(prompt.id);
                        setActiveTab('editor');
                      }}
                    >
                      <span className="oyama-sidebar-item-icon">📝</span>
                      <span className="oyama-sidebar-item-text">{prompt.title}</span>
                      <span className="oyama-sidebar-item-date">
                        {formatTimestamp(prompt.updatedAt)}
                      </span>
                    </button>
                  ))}
              </div>
            );
          })}
          {/* Unfiled prompts */}
          {filteredSidebarPrompts
            .filter((p) => !p.folderId)
            .map((prompt) => (
              <button
                key={prompt.id}
                className={`oyama-sidebar-item ${prompt.id === activePromptId ? 'oyama-sidebar-item-active' : ''}`}
                onClick={() => {
                  setActivePromptId(prompt.id);
                  setActiveTab('editor');
                }}
              >
                <span className="oyama-sidebar-item-icon">📝</span>
                <span className="oyama-sidebar-item-text">{prompt.title}</span>
                <span className="oyama-sidebar-item-date">
                  {formatTimestamp(prompt.updatedAt)}
                </span>
              </button>
            ))}
        </div>
        <div className="oyama-sidebar-footer">
          <button
            className="oyama-btn oyama-btn-primary"
            style={{ width: '100%' }}
            onClick={createNewPrompt}
          >
            + New Prompt
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Editor Tab
  // ============================================================

  function renderEditorTab() {
    if (!activePrompt) {
      return (
        <div className="oyama-empty">
          <div className="oyama-empty-icon">✏️</div>
          <div className="oyama-empty-title">No prompt selected</div>
          <div className="oyama-empty-desc">
            Create a new prompt or select one from the sidebar to start editing.
          </div>
          <button className="oyama-btn oyama-btn-primary" onClick={createNewPrompt}>
            + New Prompt
          </button>
        </div>
      );
    }

    const existingTypes = new Set(activePrompt.sections.map((s) => s.type));

    return (
      <div className="oyama-editor-canvas">
        {activePrompt.sections.map((section, idx) => {
          const meta = SECTION_META[section.type];
          return (
            <div key={section.id} className="oyama-editor-section oyama-animate-in">
              <div
                className="oyama-editor-section-header"
                onClick={() => toggleSectionCollapse(section.id)}
              >
                <span className="oyama-editor-section-icon">{meta.icon}</span>
                <span className="oyama-editor-section-label">{meta.label}</span>
                <span style={{ fontSize: 11, color: 'var(--oyama-muted)', marginRight: 4 }}>
                  {section.content.trim() ? `${countWords(section.content)}w` : ''}
                </span>
                {idx > 0 && (
                  <button
                    className="oyama-editor-section-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSectionUp(section.id);
                    }}
                    title="Move up"
                  >
                    ↑
                  </button>
                )}
                {idx < activePrompt.sections.length - 1 && (
                  <button
                    className="oyama-editor-section-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSectionDown(section.id);
                    }}
                    title="Move down"
                  >
                    ↓
                  </button>
                )}
                <button
                  className={`oyama-editor-section-collapse ${section.collapsed ? 'oyama-collapsed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectionCollapse(section.id);
                  }}
                >
                  ▼
                </button>
                <button
                  className="oyama-editor-section-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(section.id);
                  }}
                  title="Remove section"
                >
                  ✕
                </button>
              </div>
              <div
                className={`oyama-editor-section-body ${section.collapsed ? 'oyama-collapsed' : ''}`}
              >
                <textarea
                  className="oyama-editor-textarea"
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  placeholder={meta.placeholder}
                  rows={4}
                />
              </div>
            </div>
          );
        })}

        {/* Add Section */}
        {showSectionPicker ? (
          <div className="oyama-editor-section-picker oyama-animate-in">
            {ALL_SECTION_TYPES.map((type) => {
              const meta = SECTION_META[type];
              const alreadyUsed = existingTypes.has(type);
              return (
                <button
                  key={type}
                  className="oyama-editor-section-picker-btn"
                  onClick={() => addSection(type)}
                  disabled={alreadyUsed}
                  title={alreadyUsed ? 'Already added' : `Add ${meta.label} section`}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
            <button
              className="oyama-btn oyama-btn-ghost oyama-btn-sm"
              onClick={() => setShowSectionPicker(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="oyama-editor-add-section"
            onClick={() => setShowSectionPicker(true)}
          >
            + Add Section
          </button>
        )}

        {/* Stats */}
        <div className="oyama-editor-stats">
          <div className="oyama-editor-stat">
            <span className="oyama-editor-stat-label">Characters:</span>
            <span className="oyama-editor-stat-value">{promptStats.chars.toLocaleString()}</span>
          </div>
          <div className="oyama-editor-stat">
            <span className="oyama-editor-stat-label">Words:</span>
            <span className="oyama-editor-stat-value">{promptStats.words.toLocaleString()}</span>
          </div>
          <div className="oyama-editor-stat">
            <span className="oyama-editor-stat-label">~Tokens:</span>
            <span className="oyama-editor-stat-value">{promptStats.tokens.toLocaleString()}</span>
          </div>
          <div className="oyama-editor-stat">
            <span className="oyama-editor-stat-label">Sections:</span>
            <span className="oyama-editor-stat-value">{promptStats.sections}</span>
          </div>
          <div style={{ flex: 1 }} />
          <button
            className="oyama-btn oyama-btn-sm oyama-btn-ghost"
            onClick={() => saveVersion()}
            title="Save version (Ctrl+S)"
          >
            💾 Save Version
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Right Panel (Editor Inspector)
  // ============================================================

  function renderRightPanelEditor() {
    return (
      <>
        {/* Quality Score */}
        <div className="oyama-inspector-section">
          <div className="oyama-inspector-title">Prompt Quality</div>
          <div className="oyama-inspector-meter">
            <div className="oyama-inspector-meter-label">
              <span>Score</span>
              <span style={{ fontWeight: 600 }}>{promptQuality.score}%</span>
            </div>
            <div className="oyama-inspector-meter-bar">
              <div
                className="oyama-inspector-meter-fill"
                style={{
                  width: `${promptQuality.score}%`,
                  background:
                    promptQuality.score >= 70
                      ? 'var(--oyama-success)'
                      : promptQuality.score >= 40
                        ? 'var(--oyama-warning)'
                        : 'var(--oyama-danger)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Hints */}
        <div className="oyama-inspector-section">
          <div className="oyama-inspector-title">Quality Hints</div>
          {promptQuality.hints.map((hint, i) => (
            <div
              key={i}
              className={`oyama-inspector-hint oyama-hint-${hint.type === 'good' ? 'good' : hint.type === 'warn' ? 'warn' : 'info'}`}
            >
              <span className="oyama-inspector-hint-icon">
                {hint.type === 'good' ? '✓' : hint.type === 'warn' ? '!' : 'i'}
              </span>
              <span>{hint.message}</span>
            </div>
          ))}
        </div>

        {/* Variables */}
        {promptVariables.length > 0 && (
          <div className="oyama-inspector-section">
            <div className="oyama-inspector-title">
              Variables ({promptVariables.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {promptVariables.map((v) => (
                <span key={v} className="oyama-var-pill">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--oyama-muted)',
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              Use {`{{variable_name}}`} syntax in your prompt to create reusable templates.
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="oyama-inspector-section">
          <div className="oyama-inspector-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className="oyama-btn oyama-btn-sm"
              onClick={() => {
                if (activePrompt) {
                  const text = sectionsToText(activePrompt.sections);
                  navigator.clipboard.writeText(text);
                  showToast('Prompt copied to clipboard');
                }
              }}
            >
              📋 Copy Full Prompt
            </button>
            <button
              className="oyama-btn oyama-btn-sm"
              onClick={() => activePrompt && duplicatePrompt(activePrompt.id)}
            >
              📄 Duplicate Prompt
            </button>
            <button
              className="oyama-btn oyama-btn-sm oyama-btn-danger"
              onClick={() => {
                if (activePrompt && confirm('Delete this prompt?')) {
                  deletePrompt(activePrompt.id);
                }
              }}
            >
              🗑 Delete Prompt
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // Render: Scratchpad Tab
  // ============================================================

  function renderScratchpadTab() {
    return (
      <div className="oyama-scratchpad">
        <textarea
          className="oyama-scratchpad-textarea"
          value={scratchpadContent}
          onChange={(e) => setScratchpadContent(e.target.value)}
          placeholder="Free-form drafting space. Write ideas, experiment with phrasing, or quickly jot down prompt concepts...

No structure, no rules — just write."
        />
        <div className="oyama-scratchpad-actions">
          <button className="oyama-btn oyama-btn-primary" onClick={promoteToPrompt}>
            ✏️ Promote to Prompt
          </button>
          <button className="oyama-btn" onClick={saveToLibrary}>
            📚 Save to Library
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: 'var(--oyama-muted)' }}>
            {countWords(scratchpadContent)} words · {countChars(scratchpadContent)} chars
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Library Tab
  // ============================================================

  function renderLibraryTab() {
    return (
      <div>
        <div className="oyama-library-toolbar">
          <div className="oyama-search-wrapper" style={{ flex: '0 1 220px' }}>
            <span className="oyama-search-icon">🔍</span>
            <input
              className="oyama-search-input"
              placeholder="Search library..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
            />
          </div>
          <div className="oyama-library-categories">
            {LIBRARY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`oyama-category-btn ${libraryCategory === cat ? 'oyama-category-active' : ''}`}
                onClick={() => setLibraryCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button
            className="oyama-btn oyama-btn-primary oyama-btn-sm"
            onClick={() => setShowNewComponent(true)}
          >
            + New Component
          </button>
        </div>

        {/* New Component Form */}
        {showNewComponent && (
          <div
            className="oyama-editor-section oyama-animate-in"
            style={{ marginBottom: 16 }}
          >
            <div className="oyama-editor-section-header">
              <span className="oyama-editor-section-icon">🆕</span>
              <span className="oyama-editor-section-label">New Component</span>
              <button
                className="oyama-editor-section-delete"
                onClick={() => setShowNewComponent(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="oyama-input-group">
                <label className="oyama-input-label">Title</label>
                <input
                  className="oyama-input"
                  value={newComponentTitle}
                  onChange={(e) => setNewComponentTitle(e.target.value)}
                  placeholder="Component title..."
                />
              </div>
              <div className="oyama-input-group">
                <label className="oyama-input-label">Content</label>
                <textarea
                  className="oyama-settings-textarea"
                  style={{ minHeight: 100 }}
                  value={newComponentContent}
                  onChange={(e) => setNewComponentContent(e.target.value)}
                  placeholder="Component content..."
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="oyama-input-group" style={{ flex: 1 }}>
                  <label className="oyama-input-label">Category</label>
                  <select
                    className="oyama-topbar-model-select"
                    style={{ width: '100%', maxWidth: 'none' }}
                    value={newComponentCategory}
                    onChange={(e) => setNewComponentCategory(e.target.value)}
                  >
                    {LIBRARY_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="oyama-input-group" style={{ flex: 1 }}>
                  <label className="oyama-input-label">Tags (comma-separated)</label>
                  <input
                    className="oyama-input"
                    value={newComponentTags}
                    onChange={(e) => setNewComponentTags(e.target.value)}
                    placeholder="tag1, tag2"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  className="oyama-btn"
                  onClick={() => setShowNewComponent(false)}
                >
                  Cancel
                </button>
                <button
                  className="oyama-btn oyama-btn-primary"
                  onClick={addLibraryItem}
                >
                  Save Component
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Library Grid */}
        {filteredLibrary.length === 0 ? (
          <div className="oyama-empty">
            <div className="oyama-empty-icon">📚</div>
            <div className="oyama-empty-title">No items found</div>
            <div className="oyama-empty-desc">
              {librarySearch
                ? 'Try a different search term.'
                : 'Add reusable prompt components to your library.'}
            </div>
          </div>
        ) : (
          <div className="oyama-library-grid">
            {filteredLibrary.map((item) => (
              <div key={item.id} className="oyama-library-card oyama-animate-in">
                <div className="oyama-library-card-title">{item.title}</div>
                <div className="oyama-library-card-preview">{item.content}</div>
                <div className="oyama-library-card-meta">
                  <span className="oyama-library-card-category">{item.category}</span>
                  {item.tags.map((tag) => (
                    <span key={tag} className="oyama-library-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="oyama-library-card-actions">
                  <button
                    className="oyama-btn oyama-btn-sm oyama-btn-primary"
                    onClick={() => insertLibraryItemToEditor(item.content)}
                  >
                    Insert
                  </button>
                  <button
                    className="oyama-btn oyama-btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                      showToast('Copied to clipboard');
                    }}
                  >
                    Copy
                  </button>
                  <button
                    className="oyama-btn oyama-btn-sm oyama-btn-danger"
                    onClick={() => deleteLibraryItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // Render: Versions Tab
  // ============================================================

  function renderVersionsTab() {
    const promptVersions = activePrompt
      ? versions.filter((v) => v.promptId === activePrompt.id)
      : [];

    if (!activePrompt) {
      return (
        <div className="oyama-empty">
          <div className="oyama-empty-icon">🕐</div>
          <div className="oyama-empty-title">No prompt selected</div>
          <div className="oyama-empty-desc">Select a prompt to view its version history.</div>
        </div>
      );
    }

    return (
      <div className="oyama-versions">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            Version History — {activePrompt.title}
          </h3>
          <div style={{ flex: 1 }} />
          <button className="oyama-btn oyama-btn-sm oyama-btn-primary" onClick={() => saveVersion()}>
            + Save Current Version
          </button>
        </div>

        {promptVersions.length === 0 ? (
          <div className="oyama-empty">
            <div className="oyama-empty-icon">🕐</div>
            <div className="oyama-empty-title">No versions yet</div>
            <div className="oyama-empty-desc">
              Versions are auto-saved periodically. You can also save manually with Ctrl+S.
            </div>
          </div>
        ) : (
          <div className="oyama-version-timeline">
            {promptVersions.map((version, idx) => (
              <div key={version.id} className="oyama-version-item oyama-animate-in">
                <div className="oyama-version-dot" />
                <div className="oyama-version-card">
                  <div className="oyama-version-header">
                    <span className="oyama-version-label">{version.label}</span>
                    <span className="oyama-version-time">
                      {formatDate(version.timestamp)}
                    </span>
                  </div>
                  <div className="oyama-version-preview">{version.fullText.slice(0, 300)}</div>
                  <div className="oyama-version-actions">
                    <button
                      className="oyama-btn oyama-btn-sm oyama-btn-primary"
                      onClick={() => restoreVersion(version.id)}
                    >
                      Restore
                    </button>
                    <button
                      className="oyama-btn oyama-btn-sm"
                      onClick={() => forkVersion(version.id)}
                    >
                      Fork
                    </button>
                    {idx < promptVersions.length - 1 && (
                      <button
                        className="oyama-btn oyama-btn-sm"
                        onClick={() => {
                          setCompareVersions([version.id, promptVersions[idx + 1].id]);
                          setShowDiff(true);
                        }}
                      >
                        Compare ↓
                      </button>
                    )}
                    <button
                      className="oyama-btn oyama-btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(version.fullText);
                        showToast('Version copied');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diff View */}
        {showDiff && compareVersions[0] && compareVersions[1] && (
          <div className="oyama-diff-container oyama-animate-in">
            <div className="oyama-diff-header">
              <span>Comparing Versions</span>
              <button
                className="oyama-btn oyama-btn-sm oyama-btn-ghost"
                onClick={() => {
                  setShowDiff(false);
                  setCompareVersions([null, null]);
                }}
              >
                ✕ Close
              </button>
            </div>
            <div className="oyama-diff-body">
              <div className="oyama-diff-side">
                <div className="oyama-diff-label">Newer</div>
                {versions.find((v) => v.id === compareVersions[0])?.fullText || ''}
              </div>
              <div className="oyama-diff-side">
                <div className="oyama-diff-label">Older</div>
                {versions.find((v) => v.id === compareVersions[1])?.fullText || ''}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // Render: Output Tab
  // ============================================================

  function renderOutputTab() {
    if (isGenerating) {
      return (
        <div className="oyama-output">
          <div className="oyama-output-meta">
            <div className="oyama-output-meta-item">
              <span className="oyama-spinner" />
              <span>Generating with</span>
              <span className="oyama-output-meta-value">{settings.selectedModel}</span>
            </div>
          </div>
          <div className="oyama-output-body">
            {streamText}
            <span className="oyama-output-streaming" />
          </div>
        </div>
      );
    }

    if (!outputData) {
      return (
        <div className="oyama-output-empty">
          <div className="oyama-output-empty-icon">▶️</div>
          <div className="oyama-output-empty-text">No output yet</div>
          <div className="oyama-output-empty-hint">
            Write a prompt and click Run (or press Ctrl+Enter) to generate a response.
          </div>
        </div>
      );
    }

    return (
      <div className="oyama-output">
        <div className="oyama-output-meta">
          <div className="oyama-output-meta-item">
            <span>Model:</span>
            <span className="oyama-output-meta-value">{outputData.model}</span>
          </div>
          <div className="oyama-output-meta-item">
            <span>Time:</span>
            <span className="oyama-output-meta-value">
              {(outputData.generationTime / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="oyama-output-meta-item">
            <span>Tokens:</span>
            <span className="oyama-output-meta-value">
              ~{outputData.tokenCount.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="oyama-output-body oyama-markdown">{outputData.response}</div>
        <div className="oyama-output-actions">
          <button
            className="oyama-btn"
            onClick={() => {
              navigator.clipboard.writeText(outputData.response);
              showToast('Output copied');
            }}
          >
            📋 Copy
          </button>
          <button className="oyama-btn oyama-btn-primary" onClick={runPrompt}>
            🔄 Re-run
          </button>
          <button
            className="oyama-btn"
            onClick={() => {
              const item: LibraryItem = {
                id: generateId(),
                title: `Output — ${formatDate(Date.now())}`,
                content: outputData.response,
                category: 'Components',
                tags: ['output', outputData.model],
                createdAt: Date.now(),
              };
              setLibraryItems((prev) => [item, ...prev]);
              showToast('Output saved to library');
            }}
          >
            📚 Save to Library
          </button>
        </div>
        {outputData.promptUsed && (
          <details style={{ marginTop: 16 }}>
            <summary
              style={{
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--oyama-muted)',
                marginBottom: 8,
              }}
            >
              Show prompt used
            </summary>
            <div
              className="oyama-version-preview"
              style={{ maxHeight: 200, overflow: 'auto' }}
            >
              {outputData.promptUsed}
            </div>
          </details>
        )}
      </div>
    );
  }

  // ============================================================
  // Render: Settings Tab
  // ============================================================

  function renderSettingsTab() {
    return (
      <div className="oyama-settings">
        {/* System Prompt */}
        <div className="oyama-settings-group">
          <div className="oyama-settings-group-title">System Prompt</div>
          <div className="oyama-settings-group-desc">
            This system prompt is sent with every request to guide the AI&apos;s behavior.
            Customize it for your workflow.
          </div>
          <textarea
            className="oyama-settings-textarea"
            value={settings.systemPrompt}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, systemPrompt: e.target.value }))
            }
            rows={8}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="oyama-btn oyama-btn-sm"
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  systemPrompt: DEFAULT_SYSTEM_PROMPT,
                }));
                showToast('System prompt reset to default');
              }}
            >
              Reset to Default
            </button>
            <button
              className="oyama-btn oyama-btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(settings.systemPrompt);
                showToast('System prompt copied');
              }}
            >
              📋 Copy
            </button>
          </div>
        </div>

        {/* Ollama Connection */}
        <div className="oyama-settings-group">
          <div className="oyama-settings-group-title">Ollama Connection</div>
          <div className="oyama-settings-group-desc">
            Configure the Ollama API endpoint and default model.
          </div>
          <div className="oyama-settings-field">
            <label className="oyama-settings-label">Endpoint URL</label>
            <div className="oyama-settings-row">
              <input
                className="oyama-settings-input"
                value={settings.ollamaEndpoint}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    ollamaEndpoint: e.target.value,
                  }))
                }
                placeholder="http://localhost:11434"
              />
              <button className="oyama-btn oyama-btn-sm" onClick={fetchModels}>
                Test
              </button>
            </div>
          </div>
          <div className="oyama-settings-field">
            <label className="oyama-settings-label">Model</label>
            <select
              className="oyama-topbar-model-select"
              style={{ width: '100%', maxWidth: 'none' }}
              value={settings.selectedModel}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  selectedModel: e.target.value,
                }))
              }
            >
              {ollamaModels.length === 0 && (
                <option value="">No models available</option>
              )}
              {ollamaModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="oyama-connection-status" style={{ display: 'inline-flex', marginTop: 8 }}>
            <span
              className={`oyama-connection-dot ${ollamaConnected ? 'oyama-connected' : 'oyama-disconnected'}`}
            />
            {ollamaConnected
              ? `Connected — ${ollamaModels.length} model(s) available`
              : 'Not connected — make sure Ollama is running'}
          </div>
        </div>

        {/* Model Parameters */}
        <div className="oyama-settings-group">
          <div className="oyama-settings-group-title">Model Parameters</div>
          <div className="oyama-settings-group-desc">
            Fine-tune generation behavior. These settings are sent with each request.
          </div>

          <div className="oyama-settings-field">
            <label className="oyama-settings-label">
              Temperature — {settings.temperature.toFixed(2)}
            </label>
            <div className="oyama-slider-container">
              <span style={{ fontSize: 11, color: 'var(--oyama-muted)' }}>Precise</span>
              <input
                className="oyama-slider"
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
              />
              <span style={{ fontSize: 11, color: 'var(--oyama-muted)' }}>Creative</span>
            </div>
          </div>

          <div className="oyama-settings-field">
            <label className="oyama-settings-label">
              Top P — {settings.topP.toFixed(2)}
            </label>
            <div className="oyama-slider-container">
              <span style={{ fontSize: 11, color: 'var(--oyama-muted)' }}>Focused</span>
              <input
                className="oyama-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.topP}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    topP: parseFloat(e.target.value),
                  }))
                }
              />
              <span style={{ fontSize: 11, color: 'var(--oyama-muted)' }}>Diverse</span>
            </div>
          </div>

          <div className="oyama-settings-field">
            <label className="oyama-settings-label">Context Size (tokens)</label>
            <input
              className="oyama-settings-input"
              type="number"
              min="512"
              max="128000"
              step="512"
              value={settings.contextSize}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  contextSize: parseInt(e.target.value, 10) || 4096,
                }))
              }
            />
          </div>

          <div className="oyama-settings-field">
            <label className="oyama-settings-label">
              Seed (-1 for random)
            </label>
            <input
              className="oyama-settings-input"
              type="number"
              min="-1"
              value={settings.seed}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  seed: parseInt(e.target.value, 10),
                }))
              }
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="oyama-settings-group">
          <div className="oyama-settings-group-title">Data Management</div>
          <div className="oyama-settings-group-desc">
            Export or import your prompts, library, and settings.
          </div>
          <div className="oyama-settings-actions">
            <button className="oyama-btn" onClick={exportData}>
              📤 Export All Data
            </button>
            <button className="oyama-btn" onClick={importData}>
              📥 Import Data
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="oyama-btn oyama-btn-danger"
              onClick={() => {
                if (
                  confirm(
                    'This will clear all data including prompts, library items, and settings. Continue?'
                  )
                ) {
                  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
                  window.location.reload();
                }
              }}
            >
              �� Clear All Data
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="oyama-settings-group">
          <div className="oyama-settings-group-title">Keyboard Shortcuts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="oyama-kbd">Ctrl</span>
              <span style={{ color: 'var(--oyama-muted)' }}>+</span>
              <span className="oyama-kbd">Enter</span>
              <span style={{ flex: 1, fontSize: 12.5, color: 'var(--oyama-text-secondary)' }}>
                Run prompt
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="oyama-kbd">Ctrl</span>
              <span style={{ color: 'var(--oyama-muted)' }}>+</span>
              <span className="oyama-kbd">S</span>
              <span style={{ flex: 1, fontSize: 12.5, color: 'var(--oyama-text-secondary)' }}>
                Save version
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="oyama-kbd">Ctrl</span>
              <span style={{ color: 'var(--oyama-muted)' }}>+</span>
              <span className="oyama-kbd">N</span>
              <span style={{ flex: 1, fontSize: 12.5, color: 'var(--oyama-text-secondary)' }}>
                New prompt
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Right Panel Content (context-aware)
  // ============================================================

  function renderRightPanelContent() {
    switch (activeTab) {
      case 'editor':
        return renderRightPanelEditor();
      case 'scratchpad':
        return (
          <div className="oyama-inspector-section">
            <div className="oyama-inspector-title">Scratchpad Notes</div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--oyama-muted)',
                lineHeight: 1.6,
              }}
            >
              <p style={{ marginBottom: 10 }}>
                Use the scratchpad for free-form brainstorming. When you are happy with your
                draft, promote it to a prompt section or save it to the library.
              </p>
              <p style={{ marginBottom: 10 }}>
                <strong>Tips:</strong>
              </p>
              <ul style={{ paddingLeft: 16 }}>
                <li>Try different phrasings</li>
                <li>Test prompt structures</li>
                <li>Jot down edge cases</li>
                <li>Draft few-shot examples</li>
              </ul>
            </div>
          </div>
        );
      case 'library':
        return (
          <div className="oyama-inspector-section">
            <div className="oyama-inspector-title">Library Info</div>
            <div style={{ fontSize: 12, color: 'var(--oyama-muted)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 10 }}>
                Your library contains reusable prompt components. Build a collection of
                roles, templates, and tone packs to speed up prompt creation.
              </p>
              <div style={{ marginTop: 12 }}>
                <div className="oyama-inspector-title">Stats</div>
                <div className="oyama-editor-stat" style={{ marginBottom: 4 }}>
                  <span className="oyama-editor-stat-label">Total items:</span>
                  <span className="oyama-editor-stat-value">{libraryItems.length}</span>
                </div>
                {LIBRARY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <div key={cat} className="oyama-editor-stat" style={{ marginBottom: 4 }}>
                    <span className="oyama-editor-stat-label">{cat}:</span>
                    <span className="oyama-editor-stat-value">
                      {libraryItems.filter((i) => i.category === cat).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'versions':
        return (
          <div className="oyama-inspector-section">
            <div className="oyama-inspector-title">Version Info</div>
            <div style={{ fontSize: 12, color: 'var(--oyama-muted)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 10 }}>
                Versions track the evolution of your prompt. Auto-save creates periodic
                snapshots, or save manually with Ctrl+S.
              </p>
              <p>
                <strong>Restore</strong> replaces the current prompt.
                <br />
                <strong>Fork</strong> creates a new prompt from the version.
                <br />
                <strong>Compare</strong> shows a side-by-side diff.
              </p>
            </div>
          </div>
        );
      case 'output':
        return (
          <div className="oyama-inspector-section">
            <div className="oyama-inspector-title">Generation Settings</div>
            <div style={{ fontSize: 12, color: 'var(--oyama-muted)', lineHeight: 1.6 }}>
              <div className="oyama-editor-stat" style={{ marginBottom: 6 }}>
                <span className="oyama-editor-stat-label">Model:</span>
                <span className="oyama-editor-stat-value">
                  {settings.selectedModel || 'None'}
                </span>
              </div>
              <div className="oyama-editor-stat" style={{ marginBottom: 6 }}>
                <span className="oyama-editor-stat-label">Temperature:</span>
                <span className="oyama-editor-stat-value">{settings.temperature}</span>
              </div>
              <div className="oyama-editor-stat" style={{ marginBottom: 6 }}>
                <span className="oyama-editor-stat-label">Top P:</span>
                <span className="oyama-editor-stat-value">{settings.topP}</span>
              </div>
              <div className="oyama-editor-stat" style={{ marginBottom: 6 }}>
                <span className="oyama-editor-stat-label">Context:</span>
                <span className="oyama-editor-stat-value">{settings.contextSize}</span>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="oyama-inspector-section">
            <div className="oyama-inspector-title">About</div>
            <div style={{ fontSize: 12, color: 'var(--oyama-muted)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--oyama-text)' }}>Oyama Prompt Pro</strong>
              </p>
              <p style={{ marginBottom: 8 }}>
                A premium prompt engineering studio for crafting, versioning, and
                testing AI prompts with Ollama.
              </p>
              <p style={{ marginBottom: 8 }}>
                Build structured prompts, maintain a library of reusable components,
                track versions, and test with local AI models.
              </p>
              <p style={{ fontSize: 11, opacity: 0.7 }}>
                Data is stored locally in your browser.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  // ============================================================
  // Render: Right Panel
  // ============================================================

  function renderRightPanel() {
    const panelTitles: Record<TabId, string> = {
      editor: 'Prompt Inspector',
      scratchpad: 'Notes',
      library: 'Library Info',
      versions: 'Version Info',
      output: 'Generation Info',
      settings: 'About',
    };

    return (
      <div
        className={`oyama-rightpanel ${!rightPanelOpen ? 'oyama-rightpanel-collapsed' : ''}`}
      >
        <div className="oyama-rightpanel-header">
          <span className="oyama-rightpanel-title">{panelTitles[activeTab]}</span>
          <button
            className="oyama-btn-icon"
            onClick={() => setRightPanelOpen(false)}
            title="Collapse panel"
            style={{ width: 24, height: 24, fontSize: 12 }}
          >
            ▶
          </button>
        </div>
        <div className="oyama-rightpanel-content">{renderRightPanelContent()}</div>
      </div>
    );
  }

  // ============================================================
  // Render: Main Content
  // ============================================================

  function renderMainContent() {
    switch (activeTab) {
      case 'editor':
        return renderEditorTab();
      case 'scratchpad':
        return renderScratchpadTab();
      case 'library':
        return renderLibraryTab();
      case 'versions':
        return renderVersionsTab();
      case 'output':
        return renderOutputTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  }

  // ============================================================
  // Loading State
  // ============================================================

  if (!isHydrated) {
    return (
      <div className="oyama-app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="oyama-spinner" style={{ width: 28, height: 28, marginBottom: 12 }} />
          <div style={{ fontSize: 14, color: 'var(--oyama-muted)' }}>
            Loading Oyama Prompt Pro...
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Main Render
  // ============================================================

  return (
    <div className="oyama-app">
      {renderTopBar()}
      {renderTabBar()}
      <div className="oyama-layout">
        {/* Sidebar toggle when collapsed */}
        {!leftSidebarOpen && (
          <button
            className="oyama-btn-icon"
            onClick={() => setLeftSidebarOpen(true)}
            title="Show sidebar"
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 15,
              background: 'var(--oyama-panel)',
              border: '1px solid var(--oyama-border)',
              borderRadius: '0 4px 4px 0',
              width: 20,
              height: 40,
              fontSize: 10,
            }}
          >
            ▶
          </button>
        )}

        {renderLeftSidebar()}

        <div className="oyama-main">
          <div className="oyama-main-content">{renderMainContent()}</div>
        </div>

        {/* Right panel toggle when collapsed */}
        {!rightPanelOpen && (
          <button
            className="oyama-btn-icon"
            onClick={() => setRightPanelOpen(true)}
            title="Show panel"
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 15,
              background: 'var(--oyama-panel)',
              border: '1px solid var(--oyama-border)',
              borderRadius: '4px 0 0 4px',
              width: 20,
              height: 40,
              fontSize: 10,
            }}
          >
            ◀
          </button>
        )}

        {renderRightPanel()}
      </div>

      {/* Toast */}
      <div className={`oyama-toast ${toastVisible ? 'oyama-toast-visible' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}
