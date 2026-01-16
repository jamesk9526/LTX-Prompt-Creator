// Component exports for the Wizard app
// This helps organize and manage the wizard's many sub-components

export { default as ChatPanel } from './ChatPanel';
export type { ChatPanelProps, ChatMessage } from './ChatPanel';

export { default as Toast } from './Toast';

export { default as AIRefiner } from './AIRefiner';

export { default as ProjectsModal } from './modals/ProjectsModal';
export { default as SettingsModal } from './modals/SettingsModal';
export { default as OllamaSidePanel } from './modals/OllamaSidePanel';
export { default as PromptHistoryModal } from './modals/PromptHistoryModal';
export { default as PresetCreatorModal } from './modals/PresetCreatorModal';
