/**
 * AI Actions Test Suite
 * Comprehensive tests for action parsing, validation, and execution
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  parseActions,
  isValidAction,
  getActionDescription,
  Action,
} from '../app/types/actions';
import { ActionExecutor } from '../app/utils/ActionExecutor';

describe('Action Schema - Parsing & Validation', () => {
  describe('parseActions', () => {
    test('parses valid action array', () => {
      const raw = JSON.stringify([
        { type: 'setFieldValue', field: 'genre', value: 'Sci-fi' },
        { type: 'setMode', value: 'cinematic' },
      ]);

      const { actions, errors } = parseActions(raw);

      expect(errors).toHaveLength(0);
      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('setFieldValue');
      expect(actions[1].type).toBe('setMode');
    });

    test('parses single object as array', () => {
      const raw = JSON.stringify({ type: 'openSettings' });

      const { actions, errors } = parseActions(raw);

      expect(errors).toHaveLength(0);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('openSettings');
    });

    test('returns error on invalid JSON', () => {
      const raw = '{ invalid json }';

      const { actions, errors } = parseActions(raw);

      expect(actions).toHaveLength(0);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/Parse error/);
    });

    test('returns error on invalid action structure', () => {
      const raw = JSON.stringify([
        { type: 'setFieldValue' }, // Missing required fields
        { type: 'unknownAction' },
      ]);

      const { actions, errors } = parseActions(raw);

      expect(errors.length).toBeGreaterThan(0);
      expect(actions).toHaveLength(0);
    });

    test('skips invalid actions with skipErrors flag', () => {
      const raw = JSON.stringify([
        { type: 'setFieldValue', field: 'genre', value: 'Sci-fi' }, // Valid
        { type: 'invalidAction' }, // Invalid
      ]);

      const { actions, errors } = parseActions(raw);

      expect(errors.length).toBeGreaterThan(0);
      expect(actions).toHaveLength(1); // Only valid action
    });

    test('handles empty array', () => {
      const raw = '[]';

      const { actions, errors } = parseActions(raw);

      expect(errors).toHaveLength(0);
      expect(actions).toHaveLength(0);
    });

    test('handles null or non-object root', () => {
      const { actions, errors } = parseActions('null');

      expect(errors.length).toBeGreaterThan(0);
      expect(actions).toHaveLength(0);
    });
  });

  describe('isValidAction', () => {
    test('validates setFieldValue action', () => {
      const action = { type: 'setFieldValue', field: 'genre', value: 'Sci-fi' };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates clearField action', () => {
      const action = { type: 'clearField', field: 'genre' };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates bulkSetValues action', () => {
      const action = { type: 'bulkSetValues', entries: { genre: 'Sci-fi', tone: 'Epic' } };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates setMode action with valid mode', () => {
      const action = { type: 'setMode', value: 'cinematic' };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates setStep action', () => {
      const action = { type: 'setStep', value: 5 };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates setEditorTone action', () => {
      const action = { type: 'setEditorTone', value: 'dramatic' };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates setNSFW action', () => {
      const action = { type: 'setNSFW', value: true };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates togglePreview action', () => {
      const action = { type: 'togglePreview' };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates updateUiPref action', () => {
      const action = { type: 'updateUiPref', key: 'darkMode', value: true };

      expect(isValidAction(action)).toBe(true);
    });

    test('validates setChatModel action', () => {
      const action = { type: 'setChatModel', value: 'claude-3' };

      expect(isValidAction(action)).toBe(true);
    });

    test('rejects invalid action type', () => {
      const action = { type: 'unknownAction' };

      expect(isValidAction(action)).toBe(false);
    });

    test('rejects action missing required fields', () => {
      const action = { type: 'setFieldValue' }; // Missing field and value

      expect(isValidAction(action)).toBe(false);
    });

    test('rejects non-object input', () => {
      expect(isValidAction('not an action')).toBe(false);
      expect(isValidAction(null)).toBe(false);
      expect(isValidAction(undefined)).toBe(false);
      expect(isValidAction(123)).toBe(false);
    });

    test('rejects action without type field', () => {
      const action = { field: 'genre', value: 'Sci-fi' };

      expect(isValidAction(action)).toBe(false);
    });
  });

  describe('getActionDescription', () => {
    test('describes setFieldValue action', () => {
      const action = { type: 'setFieldValue', field: 'genre', value: 'Sci-fi' };
      const desc = getActionDescription(action as any);

      expect(desc).toContain('genre');
      expect(desc).toContain('Sci-fi');
    });

    test('describes setMode action', () => {
      const action = { type: 'setMode', value: 'cinematic' };
      const desc = getActionDescription(action as any);

      expect(desc).toContain('cinematic');
    });

    test('describes bulkSetValues action', () => {
      const action = { type: 'bulkSetValues', entries: { genre: 'Sci-fi', tone: 'Epic' } };
      const desc = getActionDescription(action as any);

      expect(desc).toContain('2');
      expect(desc).toContain('fields');
    });

    test('describes all action types', () => {
      const actions: Action[] = [
        { type: 'setFieldValue', field: 'test', value: 'value' },
        { type: 'clearField', field: 'test' },
        { type: 'bulkSetValues', entries: { a: 'b' } },
        { type: 'setMode', value: 'cinematic' },
        { type: 'setStep', value: 5 },
        { type: 'setEditorTone', value: 'dramatic' },
        { type: 'setNSFW', value: true },
        { type: 'togglePreview' },
        { type: 'openSettings' },
        { type: 'updateUiPref', key: 'test', value: 'value' },
        { type: 'updateOllamaSetting', key: 'test', value: 'value' },
        { type: 'setChatModel', value: 'model' },
        { type: 'openChatSystemPrompt' },
        { type: 'setChatMinimized', value: true },
      ];

      for (const action of actions) {
        const desc = getActionDescription(action);
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(5);
      }
    });
  });
});

describe('Action Executor', () => {
  let executor: ActionExecutor;
  let mockHandlers: Record<string, jest.Mock>;

  beforeEach(() => {
    mockHandlers = {
      onOpenSettings: jest.fn(),
      onSetMode: jest.fn(),
      onSetStep: jest.fn(),
      onEditorToneChange: jest.fn(),
      onSetNsfwEnabled: jest.fn(),
      onPreviewToggle: jest.fn(),
      onUpdateUiPref: jest.fn(),
      onUpdateOllama: jest.fn(),
      onSetFieldValue: jest.fn(),
      onClearField: jest.fn(),
      onBulkSetValues: jest.fn(),
      onSetChatModel: jest.fn(),
      onOpenChatSystemPrompt: jest.fn(),
      onSetChatMinimized: jest.fn(),
      onShowToast: jest.fn(),
    };

    executor = new ActionExecutor(mockHandlers as any);
  });

  test('executes single action', async () => {
    const actions = [{ type: 'openSettings' }];

    const report = await executor.execute(actions);

    expect(report.successCount).toBe(1);
    expect(report.failureCount).toBe(0);
    expect(mockHandlers.onOpenSettings).toHaveBeenCalled();
  });

  test('executes multiple actions in sequence', async () => {
    const actions = [
      { type: 'setMode', value: 'cinematic' },
      { type: 'setFieldValue', field: 'genre', value: 'Sci-fi' },
      { type: 'openSettings' },
    ];

    const report = await executor.execute(actions as any);

    expect(report.totalActions).toBe(3);
    expect(report.successCount).toBe(3);
    expect(report.failureCount).toBe(0);
    expect(mockHandlers.onSetMode).toHaveBeenCalledWith('cinematic');
    expect(mockHandlers.onSetFieldValue).toHaveBeenCalledWith('genre', 'Sci-fi');
  });

  test('handles invalid actions gracefully', async () => {
    const actions = [
      { type: 'invalidAction' }, // Invalid
      { type: 'openSettings' }, // Valid
    ];

    const report = await executor.execute(actions as any);

    expect(report.successCount).toBe(1);
    expect(report.failureCount).toBe(1);
  });

  test('tracks execution history', async () => {
    const actions1 = [{ type: 'openSettings' }];
    const actions2 = [{ type: 'togglePreview' }];

    await executor.execute(actions1 as any);
    await executor.execute(actions2 as any);

    const history = executor.getHistory();
    expect(history).toHaveLength(2);
  });

  test('reports execution statistics', async () => {
    const actions = [
      { type: 'openSettings' },
      { type: 'togglePreview' },
    ];

    await executor.execute(actions as any);

    const stats = executor.getStats();
    expect(stats.totalReports).toBe(1);
    expect(stats.totalActions).toBe(2);
    expect(stats.totalSuccess).toBe(2);
    expect(stats.successRate).toBe(100);
  });

  test('validates step values', async () => {
    const actions = [
      { type: 'setStep', value: 0 }, // Invalid
      { type: 'setStep', value: 5 }, // Valid
      { type: 'setStep', value: 25 }, // Invalid
    ];

    const report = await executor.execute(actions as any);

    expect(report.successCount).toBe(1);
    expect(report.failureCount).toBe(2);
  });

  test('validates NSFW boolean', async () => {
    const actions = [
      { type: 'setNSFW', value: true }, // Valid
      { type: 'setNSFW', value: 'yes' }, // Invalid
    ];

    const report = await executor.execute(actions as any);

    expect(report.successCount).toBe(1);
    expect(report.failureCount).toBe(1);
  });

  test('parses and executes from JSON', async () => {
    const json = JSON.stringify([
      { type: 'openSettings' },
      { type: 'togglePreview' },
    ]);

    const report = await executor.executeFromJson(json);

    expect(report.successCount).toBe(2);
    expect(report.failureCount).toBe(0);
  });

  test('handles invalid JSON in executeFromJson', async () => {
    const json = '{ invalid }';

    const report = await executor.executeFromJson(json, { skipErrors: true });

    expect(report.totalActions).toBe(0);
  });

  test('clears history', async () => {
    const actions = [{ type: 'openSettings' }];

    await executor.execute(actions as any);
    expect(executor.getHistory().length).toBeGreaterThan(0);

    executor.clearHistory();
    expect(executor.getHistory()).toHaveLength(0);
    expect(executor.getStats().totalReports).toBe(0);
  });

  test('respects skipErrors option', async () => {
    const actions = [
      { type: 'invalidAction' },
      { type: 'openSettings' },
    ];

    const report = await executor.execute(actions as any, { skipErrors: true });

    expect(report.failureCount).toBe(1);
    // Toast not shown when skipErrors is true
    expect(mockHandlers.onShowToast).not.toHaveBeenCalledWith(expect.stringContaining('❌'));
  });

  test('respects silent option', async () => {
    const actions = [
      { type: 'invalidAction' },
      { type: 'openSettings' },
    ];

    const report = await executor.execute(actions as any, { silent: true });

    // No toast messages shown
    expect(mockHandlers.onShowToast).not.toHaveBeenCalled();
  });

  test('executes bulkSetValues', async () => {
    const actions = [
      {
        type: 'bulkSetValues',
        entries: { genre: 'Sci-fi', tone: 'Epic' },
      },
    ];

    const report = await executor.execute(actions as any);

    expect(report.successCount).toBe(1);
    expect(mockHandlers.onBulkSetValues).toHaveBeenCalledWith({
      genre: 'Sci-fi',
      tone: 'Epic',
    });
  });

  test('measures execution duration', async () => {
    const actions = [{ type: 'openSettings' }];

    const report = await executor.execute(actions as any);

    expect(report.duration).toBeGreaterThanOrEqual(0);
    expect(report.results[0].duration).toBeGreaterThanOrEqual(0);
  });
});

describe('Edge Cases', () => {
  test('handles empty action array', async () => {
    const executor = new ActionExecutor({
      onShowToast: jest.fn(),
    } as any);

    const report = await executor.execute([]);

    expect(report.totalActions).toBe(0);
    expect(report.successCount).toBe(0);
  });

  test('handles very large batch of actions', async () => {
    const executor = new ActionExecutor({
      onOpenSettings: jest.fn(),
      onShowToast: jest.fn(),
    } as any);

    const actions = Array(100).fill({ type: 'openSettings' });

    const report = await executor.execute(actions as any);

    expect(report.totalActions).toBe(100);
    expect(report.successCount).toBe(100);
  });

  test('handles special characters in string values', async () => {
    const executor = new ActionExecutor({
      onSetFieldValue: jest.fn(),
      onShowToast: jest.fn(),
    } as any);

    const actions = [
      {
        type: 'setFieldValue',
        field: 'description',
        value: 'Special chars: "quotes", "newlines", \\\\backslashes\\\\',
      },
    ];

    const report = await executor.execute(actions as any);

    expect(report.successCount).toBe(1);
  });

  test('handles nested object values', async () => {
    const executor = new ActionExecutor({
      onUpdateUiPref: jest.fn(),
      onShowToast: jest.fn(),
    } as any);

    const actions = [
      {
        type: 'updateUiPref',
        key: 'theme',
        value: { isDark: true, colors: { primary: '#000' } },
      },
    ];

    const report = await executor.execute(actions as any);

    expect(report.successCount).toBe(1);
  });
});
