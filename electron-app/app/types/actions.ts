/**
 * AI Actions Schema - Structured output for UI control
 * Defines all available actions Nicole can emit to control the application
 */

/**
 * Base action interface - all actions must have a type
 */
export interface BaseAction {
  type: string;
  timestamp?: number;
}

/**
 * Prompt field update actions
 */
export interface SetFieldValueAction extends BaseAction {
  type: 'setFieldValue';
  field: string;
  value: string;
}

export interface ClearFieldAction extends BaseAction {
  type: 'clearField';
  field: string;
}

export interface BulkSetValuesAction extends BaseAction {
  type: 'bulkSetValues';
  entries: Record<string, string>;
}

/**
 * Mode and navigation actions
 */
export interface SetModeAction extends BaseAction {
  type: 'setMode';
  value: 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';
}

export interface SetStepAction extends BaseAction {
  type: 'setStep';
  value: number; // 1-22
}

export interface SetEditorToneAction extends BaseAction {
  type: 'setEditorTone';
  value: 'melancholic' | 'balanced' | 'energetic' | 'dramatic';
}

/**
 * Content control actions
 */
export interface SetNSFWAction extends BaseAction {
  type: 'setNSFW';
  value: boolean;
}

export interface TogglePreviewAction extends BaseAction {
  type: 'togglePreview';
}

/**
 * Settings actions
 */
export interface OpenSettingsAction extends BaseAction {
  type: 'openSettings';
}

export interface UpdateUiPrefAction extends BaseAction {
  type: 'updateUiPref';
  key: string;
  value: any;
}

export interface UpdateOllamaSettingAction extends BaseAction {
  type: 'updateOllamaSetting';
  key: string;
  value: any;
}

export interface SetChatModelAction extends BaseAction {
  type: 'setChatModel';
  value: string;
}

export interface OpenChatSystemPromptAction extends BaseAction {
  type: 'openChatSystemPrompt';
}

export interface SetChatMinimizedAction extends BaseAction {
  type: 'setChatMinimized';
  value: boolean;
}

/**
 * Union type of all valid actions
 */
export type Action =
  | SetFieldValueAction
  | ClearFieldAction
  | BulkSetValuesAction
  | SetModeAction
  | SetStepAction
  | SetEditorToneAction
  | SetNSFWAction
  | TogglePreviewAction
  | OpenSettingsAction
  | UpdateUiPrefAction
  | UpdateOllamaSettingAction
  | SetChatModelAction
  | OpenChatSystemPromptAction
  | SetChatMinimizedAction;

/**
 * Action execution result
 */
export interface ActionResult {
  action: Action;
  success: boolean;
  message: string;
  error?: string;
  duration?: number;
}

/**
 * Execution report for a batch of actions
 */
export interface ActionExecutionReport {
  timestamp: number;
  totalActions: number;
  successCount: number;
  failureCount: number;
  results: ActionResult[];
  duration: number;
}

/**
 * Validate an action object
 */
export function isValidAction(obj: unknown): obj is Action {
  if (typeof obj !== 'object' || obj === null) return false;

  const action = obj as Record<string, any>;
  const type = action.type;

  if (typeof type !== 'string') return false;

  // Define valid action types and their required fields
  const validActionTypes: Record<string, string[]> = {
    setFieldValue: ['field', 'value'],
    clearField: ['field'],
    bulkSetValues: ['entries'],
    setMode: ['value'],
    setStep: ['value'],
    setEditorTone: ['value'],
    setNSFW: ['value'],
    togglePreview: [],
    openSettings: [],
    updateUiPref: ['key', 'value'],
    updateOllamaSetting: ['key', 'value'],
    setChatModel: ['value'],
    openChatSystemPrompt: [],
    setChatMinimized: ['value'],
  };

  if (!(type in validActionTypes)) return false;

  const requiredFields = validActionTypes[type];
  return requiredFields.every((field) => field in action);
}

/**
 * Parse action JSON with validation
 */
export function parseActions(raw: string): {
  actions: Action[];
  errors: string[];
} {
  const actions: Action[] = [];
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      parsed.forEach((item, index) => {
        if (isValidAction(item)) {
          actions.push(item as Action);
        } else {
          errors.push(`Action ${index}: Invalid structure or missing required fields`);
        }
      });
    } else if (typeof parsed === 'object' && parsed !== null && isValidAction(parsed)) {
      actions.push(parsed as Action);
    } else {
      errors.push('Root: Expected array of actions or single action object');
    }
  } catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { actions, errors };
}

/**
 * Get human-readable action description
 */
export function getActionDescription(action: Action): string {
  switch (action.type) {
    case 'setFieldValue':
      return `Set ${action.field} to "${action.value}"`;
    case 'clearField':
      return `Clear ${action.field}`;
    case 'bulkSetValues':
      const fields = Object.keys(action.entries).join(', ');
      return `Update fields: ${fields}`;
    case 'setMode':
      return `Switch to ${action.value} mode`;
    case 'setStep':
      return `Jump to step ${action.value}`;
    case 'setEditorTone':
      return `Set editor tone to ${action.value}`;
    case 'setNSFW':
      return `${action.value ? 'Enable' : 'Disable'} NSFW mode`;
    case 'togglePreview':
      return 'Toggle preview panel';
    case 'openSettings':
      return 'Open settings';
    case 'updateUiPref':
      return `Update UI preference: ${action.key}`;
    case 'updateOllamaSetting':
      return `Update Ollama setting: ${action.key}`;
    case 'setChatModel':
      return `Switch to ${action.value} model`;
    case 'openChatSystemPrompt':
      return 'Open chat system prompt editor';
    case 'setChatMinimized':
      return `${action.value ? 'Minimize' : 'Restore'} chat`;
    default:
      return `Execute action: ${(action as any).type}`;
  }
}
