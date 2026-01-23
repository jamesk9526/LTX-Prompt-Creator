/**
 * Action Executor - Enhanced handler for AI action execution
 * Provides structured execution, error handling, and detailed logging
 */

import {
  Action,
  ActionResult,
  ActionExecutionReport,
  getActionDescription,
  parseActions,
} from '../types/actions';

export interface ActionHandlers {
  onOpenSettings?: () => void;
  onSetMode?: (mode: string) => void;
  onSetStep?: (step: number) => void;
  onEditorToneChange?: (tone: string) => void;
  onSetNsfwEnabled?: (enabled: boolean) => void;
  onPreviewToggle?: () => void;
  onUpdateUiPref?: (updater: (prev: any) => any) => void;
  onUpdateOllama?: (updater: (prev: any) => any) => void;
  onSetFieldValue?: (field: string, value: string) => void;
  onClearField?: (field: string) => void;
  onBulkSetValues?: (entries: Record<string, string>) => void;
  onSetChatModel?: (model: string) => void;
  onOpenChatSystemPrompt?: () => void;
  onSetChatMinimized?: (minimized: boolean) => void;
  onShowToast?: (message: string) => void;
}

export interface ExecutionContext {
  source?: string; // e.g., 'chat', 'system', 'user'
  userId?: string;
  sessionId?: string;
}

/**
 * Enhanced action executor with error handling and logging
 */
export class ActionExecutor {
  private executionHistory: ActionExecutionReport[] = [];
  private lastReport: ActionExecutionReport | null = null;

  constructor(private handlers: ActionHandlers, private context?: ExecutionContext) {}

  /**
   * Parse and execute action JSON
   */
  async executeFromJson(
    raw: string,
    options?: { skipErrors?: boolean; silent?: boolean }
  ): Promise<ActionExecutionReport> {
    const startTime = Date.now();
    const { actions, errors: parseErrors } = parseActions(raw);

    if (parseErrors.length > 0 && !options?.skipErrors) {
      console.warn('[ActionExecutor] Parse errors:', parseErrors);
      if (!options?.silent) {
        this.handlers.onShowToast?.(`⚠️ Action format issue: ${parseErrors[0]}`);
      }
    }

    return this.execute(actions, { skipErrors: options?.skipErrors, silent: options?.silent });
  }

  /**
   * Execute actions with structured error handling
   */
  async execute(
    actions: Action[],
    options?: { skipErrors?: boolean; silent?: boolean }
  ): Promise<ActionExecutionReport> {
    const startTime = performance.now();
    const results: ActionResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    console.group(
      `[ActionExecutor] Executing ${actions.length} action${actions.length !== 1 ? 's' : ''}`
    );

    for (const action of actions) {
      const actionStartTime = performance.now();

      try {
        const result = await this.executeAction(action);

        if (result.success) {
          successCount++;
          console.log(`✓ ${result.message}`, action);
        } else {
          failureCount++;
          console.warn(`✗ ${result.message}`, action, result.error);

          if (!options?.skipErrors) {
            if (!options?.silent) {
              this.handlers.onShowToast?.(`❌ ${result.message}`);
            }
          }
        }

        results.push({
          ...result,
          duration: performance.now() - actionStartTime,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        failureCount++;
        console.error(`✗ Action execution error: ${errorMsg}`, action);

        if (!options?.skipErrors && !options?.silent) {
          this.handlers.onShowToast?.(`❌ Error: ${errorMsg}`);
        }

        results.push({
          action,
          success: false,
          message: `Execution error`,
          error: errorMsg,
          duration: performance.now() - actionStartTime,
        });
      }
    }

    console.groupEnd();

    const report: ActionExecutionReport = {
      timestamp: Date.now(),
      totalActions: actions.length,
      successCount,
      failureCount,
      results,
      duration: performance.now() - startTime,
    };

    this.lastReport = report;
    this.executionHistory.push(report);

    // Log summary
    const summary = `${successCount}/${actions.length} actions executed (${report.duration.toFixed(0)}ms)`;
    if (failureCount === 0) {
      console.log(`[ActionExecutor] ✓ ${summary}`);
    } else {
      console.warn(`[ActionExecutor] ⚠️ ${summary} - ${failureCount} failed`);
    }

    return report;
  }

  /**
   * Execute a single action with detailed error handling
   */
  private async executeAction(action: Action): Promise<ActionResult> {
    const description = getActionDescription(action);

    try {
      switch (action.type) {
        case 'openSettings': {
          this.handlers.onOpenSettings?.();
          return {
            action,
            success: true,
            message: 'Opened settings panel',
          };
        }

        case 'setMode': {
          if (typeof action.value !== 'string') {
            return {
              action,
              success: false,
              message: 'Mode not specified',
              error: 'value must be string',
            };
          }
          this.handlers.onSetMode?.(action.value);
          return {
            action,
            success: true,
            message: `Switched to ${action.value} mode`,
          };
        }

        case 'setStep': {
          if (typeof action.value !== 'number' || action.value < 1 || action.value > 22) {
            return {
              action,
              success: false,
              message: 'Invalid step number',
              error: 'Step must be between 1 and 22',
            };
          }
          this.handlers.onSetStep?.(action.value);
          return {
            action,
            success: true,
            message: `Jumped to step ${action.value}`,
          };
        }

        case 'setEditorTone': {
          const validTones = ['melancholic', 'balanced', 'energetic', 'dramatic'];
          if (!validTones.includes(action.value)) {
            return {
              action,
              success: false,
              message: 'Invalid editor tone',
              error: `Must be one of: ${validTones.join(', ')}`,
            };
          }
          this.handlers.onEditorToneChange?.(action.value);
          return {
            action,
            success: true,
            message: `Set editor tone to ${action.value}`,
          };
        }

        case 'setNSFW': {
          if (typeof action.value !== 'boolean') {
            return {
              action,
              success: false,
              message: 'Invalid NSFW value',
              error: 'value must be boolean',
            };
          }
          this.handlers.onSetNsfwEnabled?.(action.value);
          return {
            action,
            success: true,
            message: `${action.value ? 'Enabled' : 'Disabled'} NSFW mode`,
          };
        }

        case 'togglePreview': {
          this.handlers.onPreviewToggle?.();
          return {
            action,
            success: true,
            message: 'Toggled preview panel',
          };
        }

        case 'setFieldValue': {
          if (!action.field || typeof action.value !== 'string') {
            return {
              action,
              success: false,
              message: 'Invalid field update',
              error: 'field and value are required',
            };
          }
          this.handlers.onSetFieldValue?.(action.field, action.value);
          return {
            action,
            success: true,
            message: `Set ${action.field}`,
          };
        }

        case 'clearField': {
          if (!action.field) {
            return {
              action,
              success: false,
              message: 'Invalid clear field',
              error: 'field is required',
            };
          }
          this.handlers.onClearField?.(action.field);
          return {
            action,
            success: true,
            message: `Cleared ${action.field}`,
          };
        }

        case 'bulkSetValues': {
          if (!action.entries || typeof action.entries !== 'object') {
            return {
              action,
              success: false,
              message: 'Invalid bulk update',
              error: 'entries must be an object',
            };
          }
          const count = Object.keys(action.entries).length;
          this.handlers.onBulkSetValues?.(action.entries);
          return {
            action,
            success: true,
            message: `Updated ${count} field${count !== 1 ? 's' : ''}`,
          };
        }

        case 'updateUiPref': {
          if (!action.key) {
            return {
              action,
              success: false,
              message: 'Invalid UI preference',
              error: 'key is required',
            };
          }
          this.handlers.onUpdateUiPref?.((prev) => ({ ...prev, [action.key]: action.value }));
          return {
            action,
            success: true,
            message: `Updated UI preference: ${action.key}`,
          };
        }

        case 'updateOllamaSetting': {
          if (!action.key) {
            return {
              action,
              success: false,
              message: 'Invalid Ollama setting',
              error: 'key is required',
            };
          }
          this.handlers.onUpdateOllama?.((prev) => ({ ...prev, [action.key]: action.value }));
          return {
            action,
            success: true,
            message: `Updated Ollama setting: ${action.key}`,
          };
        }

        case 'setChatModel': {
          if (typeof action.value !== 'string') {
            return {
              action,
              success: false,
              message: 'Invalid chat model',
              error: 'value must be string',
            };
          }
          this.handlers.onSetChatModel?.(action.value);
          return {
            action,
            success: true,
            message: `Switched to ${action.value}`,
          };
        }

        case 'openChatSystemPrompt': {
          this.handlers.onOpenChatSystemPrompt?.();
          return {
            action,
            success: true,
            message: 'Opened chat system prompt editor',
          };
        }

        case 'setChatMinimized': {
          if (typeof action.value !== 'boolean') {
            return {
              action,
              success: false,
              message: 'Invalid chat state',
              error: 'value must be boolean',
            };
          }
          this.handlers.onSetChatMinimized?.(action.value);
          return {
            action,
            success: true,
            message: `${action.value ? 'Minimized' : 'Restored'} chat`,
          };
        }

        default:
          return {
            action,
            success: false,
            message: 'Unknown action type',
            error: `Type '${(action as any).type}' not recognized`,
          };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        action,
        success: false,
        message: description,
        error: errorMsg,
      };
    }
  }

  /**
   * Get execution history
   */
  getHistory(): ActionExecutionReport[] {
    return [...this.executionHistory];
  }

  /**
   * Get last execution report
   */
  getLastReport(): ActionExecutionReport | null {
    return this.lastReport;
  }

  /**
   * Get summary statistics
   */
  getStats() {
    if (this.executionHistory.length === 0) {
      return {
        totalReports: 0,
        totalActions: 0,
        totalSuccess: 0,
        totalFailures: 0,
        successRate: 0,
      };
    }

    const totalActions = this.executionHistory.reduce((sum, r) => sum + r.totalActions, 0);
    const totalSuccess = this.executionHistory.reduce((sum, r) => sum + r.successCount, 0);
    const totalFailures = this.executionHistory.reduce((sum, r) => sum + r.failureCount, 0);

    return {
      totalReports: this.executionHistory.length,
      totalActions,
      totalSuccess,
      totalFailures,
      successRate: totalActions > 0 ? (totalSuccess / totalActions) * 100 : 0,
    };
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.executionHistory = [];
    this.lastReport = null;
  }
}
