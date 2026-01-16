'use client';

import { useEffect, useRef, useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import './popout.css';

// Minimal popout chat page which forwards actions to the main window via IPC

type OllamaSettings = {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
};

const OLLAMA_SETTINGS_STORAGE_KEY = 'ltx_prompter_ollama_settings_v1';
const CHAT_SETTINGS_STORAGE_KEY = 'ltx_prompter_chat_settings_v1';

const DEFAULT_CHAT_SYSTEM_PROMPT = `You are a cinematic scene generator.

Your role is to produce highly structured, film-language–accurate scene descriptions suitable for AI video or image generation. Always think like a cinematographer and director, not a novelist.

GENERAL RULES:
- Always write in a single cohesive paragraph unless explicitly instructed otherwise.
- Do NOT explain your reasoning.
- Do NOT include lists, headings, or bullet points.
- Do NOT add disclaimers, safety commentary, or meta explanations.
- Be precise, visual, and sensory.
- Maintain realism unless explicitly told otherwise.
- Avoid repetition and filler words.

OUTPUT STRUCTURE (MANDATORY ORDER):

1. OPENING SHOT
Begin by declaring the scene as cinematic.
Specify camera angle and framing clearly (e.g., low-angle medium shot, close-up, wide establishing shot).
Introduce the subject with concise physical description, clothing, and immediate pose or action.
Establish emotional tone or attitude through body language or expression.

2. SUBJECT PRESENCE
Describe how the subject relates to the camera or environment (eye contact, focus, stillness, movement).
Keep this grounded and intentional.

3. SETTING & TIME
Clearly state the location and time of day or weather.
Use the setting to reinforce mood.

4. LIGHTING & MOOD
Describe lighting style using film terminology (rim light, volumetric light, soft key, practicals, high-key, low-key).
Specify color temperature or tonal bias.
Lighting must serve emotional intent.

5. BACKGROUND & DEPTH
Add environmental details that provide depth, scale, or motion.
Background elements should never distract from the subject.

6. CAMERA MOVEMENT
Describe deliberate camera motion (dolly, pan, tilt, push-in, pull-back).
Always include a clear start point and end point for the movement.
Movement should guide attention, not wander.

7. AUDIO LAYER
Include ambient environmental sounds.
Optionally include music or score style.
Audio should complement pacing and mood.

8. FINAL POLISH
End with color grading style, depth of field, and overall cinematic finish.

STYLE GUIDELINES:
- Use confident, declarative language.
- Favor visual clarity over metaphor.
- Maintain a grounded, cinematic tone.
- Treat every scene as if it were shot on a professional cinema camera.

If the user provides a prompt, reinterpret it using this structure.
If the user provides minimal input, extrapolate intelligently while remaining realistic.`;

export default function ChatPopoutPage() {
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState('');
  const [chatSystemPrompt, setChatSystemPrompt] = useState(DEFAULT_CHAT_SYSTEM_PROMPT);
  const [chatSystemPromptModalOpen, setChatSystemPromptModalOpen] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>({
    enabled: true,
    apiEndpoint: 'http://localhost:11434',
    model: 'llama2',
    systemInstructions: '',
    temperature: 0.7,
  });
  const [ollamaAvailableModels, setOllamaAvailableModels] = useState<string[]>([]);

  const prompt = '';
  const mode = 'cinematic';
  const editorTone = 'balanced';

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(OLLAMA_SETTINGS_STORAGE_KEY);
      if (raw) setOllamaSettings(JSON.parse(raw));
      const chatRaw = window.localStorage.getItem(CHAT_SETTINGS_STORAGE_KEY);
      if (chatRaw) {
        const parsed = JSON.parse(chatRaw);
        if (parsed?.chatModel) setChatModel(parsed.chatModel);
        if (typeof parsed?.chatSystemPrompt === 'string') setChatSystemPrompt(parsed.chatSystemPrompt);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHAT_SETTINGS_STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(CHAT_SETTINGS_STORAGE_KEY, JSON.stringify({ ...prev, chatSystemPrompt }));
    } catch {}
  }, [chatSystemPrompt]);

  const showToast = (message: string) => {
    // Simple alert fallback in popout
    console.log('[Chat]', message);
  };

  const unloadOllamaModel = async (modelName: string) => {
    try {
      await fetch(`${ollamaSettings.apiEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: ' ',
          keep_alive: 0,
        }),
      });
    } catch {}
  };

  const fetchOllamaModels = async () => {
    try {
      const res = await fetch(`${ollamaSettings.apiEndpoint}/api/tags`);
      const json = await res.json();
      const names = Array.isArray(json?.models)
        ? json.models.map((m: any) => m.name).filter(Boolean)
        : [];
      setOllamaAvailableModels(names);
    } catch {}
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    if (!ollamaSettings.enabled) {
      showToast('🔧 Enable Ollama in Settings first');
      return;
    }

    const userMessage = chatInput.trim();
    const modelToUse = chatModel || ollamaSettings.model;

    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(updatedMessages);
    setChatInput('');
    if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
    setChatSending(true);

    try {
      // Build dynamic fields spec from localStorage optionSets
      const fieldsSpec = (() => {
        try {
          const raw = window.localStorage.getItem('ltx_prompter_option_sets_v1');
          if (!raw) return '';
          const sets = JSON.parse(raw)[mode] || {};
          const lines: string[] = ['AVAILABLE FIELDS AND SAMPLE OPTIONS:'];
          const fieldNames = Object.keys(sets || {}).sort();
          for (const fname of fieldNames) {
            const opts = (sets[fname] || []).slice(0, 6);
            const sample = opts.length ? ` — samples: ${opts.join(', ')}` : '';
            lines.push(`- ${fname}${sample}`);
          }
          return lines.join('\n');
        } catch {
          return '';
        }
      })();

      const NICOLE_BASE = `You are Nicole, a professional AI assistant and expert in creative prompt writing and video production.
OUTPUT BEHAVIOR (CRITICAL):
- When expanding or refining prompts: Output ONLY the expanded prompt in a markdown code block (\`\`\`prompt ... \`\`\`)
- NO preamble, NO explanation, NO extra text - just the refined prompt
- Exception: If user explicitly asks for feedback, explanation, or critique, then provide brief professional feedback THEN the markup
Your communication style:
- KEEP RESPONSES SHORT AND TO THE POINT
- 2-3 sentences maximum unless detailed explanation is specifically requested
- Professional and expert tone at all times
- NEVER use emojis, emoticons, or excessive punctuation
- Cut the fluff - deliver pure value`;

      const LTX_CONTEXT = `LTX VIDEO MODEL INFORMATION:
LTX is a state-of-the-art text-to-video generation model optimized for professional video creation.`;

      const ACTIONS_SPEC = `UI CONTROL ACTIONS:
If the user asks to change settings or control the UI, output a separate markdown code block labeled 'actions' containing a JSON array of actions. Each action has a 'type' and parameters. Supported actions:
- {"type":"openSettings"}
- {"type":"setMode","value":"cinematic|classic|drone|animation|photography|nsfw"}
- {"type":"togglePreview"}
- {"type":"setStep","value":<number 1-22>}
- {"type":"setNSFW","value":true|false}
- {"type":"setEditorTone","value":"melancholic|balanced|energetic|dramatic"}
- {"type":"updateUiPref","key":"captureWord|promptFormat|detailLevel|autoFillAudio|autoFillCamera|previewFontScale|hideNsfw","value":<appropriate>}
- {"type":"updateOllamaSetting","key":"apiEndpoint|model|temperature|systemInstructions","value":<appropriate>}
- {"type":"setChatModel","value":"modelName"}
- {"type":"openChatSystemPrompt"}
Additional prompt step controls:
- {"type":"setFieldValue","field":"genre|shot|role|...","value":"desired text"}
- {"type":"clearField","field":"genre|shot|..."}
- {"type":"bulkSetValues","entries":{"genre":"Sci-fi","shot":"Wide establishing"}}
${fieldsSpec}
Always keep normal prompt output in a \`\`\`prompt\`\`\` block; use \`\`\`actions\`\`\` only for UI changes.`;

      const response = await fetch(`${ollamaSettings.apiEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            {
              role: 'system',
              content: `${chatSystemPrompt ? chatSystemPrompt + '\n\n' : ''}${NICOLE_BASE}\n\n${LTX_CONTEXT}\n\n${ACTIONS_SPEC}`,
            },
            ...updatedMessages,
          ],
          stream: true,
          options: {
            temperature: ollamaSettings.temperature,
          },
          keep_alive: 0,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim());
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.message?.content) {
                accumulatedText += json.message.content;
                setChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: accumulatedText };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      setTimeout(() => unloadOllamaModel(modelToUse), 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to Ollama';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]);
      showToast(`Chat error: ${errorMsg}`);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <main className="chat-popout-shell">
      <div className="chat-popout-topbar">
        <button className="ghost" type="button" onClick={() => (window as any).electron?.windowControl?.openChatWindow?.()}>
          Focus Chat
        </button>
        <button className="ghost" type="button" onClick={() => (window as any).electron?.ipcRenderer?.send?.('close-chat-window') }>
          Dock Back
        </button>
      </div>
      <ChatPanel
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatModel={chatModel}
        setChatModel={setChatModel}
        chatSystemPrompt={chatSystemPrompt}
        setChatSystemPrompt={setChatSystemPrompt}
        chatSystemPromptModalOpen={chatSystemPromptModalOpen}
        setChatSystemPromptModalOpen={setChatSystemPromptModalOpen}
        chatMinimized={chatMinimized}
        setChatMinimized={setChatMinimized}
        chatSending={chatSending}
        ollamaSettings={ollamaSettings}
        ollamaAvailableModels={ollamaAvailableModels}
        prompt={prompt}
        mode={mode}
        editorTone={editorTone}
        labelForMode={(m) => m}
        showToast={showToast}
        sendChatMessage={sendChatMessage}
        addToPromptHistory={() => {}}
        chatAllowControl={true}
        onActions={(actions) => {
          try {
            (window as any).electron?.ipcRenderer?.send?.('chat-actions', actions);
          } catch {}
        }}
      />
    </main>
  );
}
