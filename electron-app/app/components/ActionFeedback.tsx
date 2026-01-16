/**
 * ActionFeedback Component
 * Displays execution status and results for AI actions in the chat interface
 */

'use client';

import React from 'react';
import { ActionExecutionReport, Action } from '../types/actions';
import { getActionDescription } from '../types/actions';

export interface ActionFeedbackProps {
  report: ActionExecutionReport;
  compact?: boolean;
  onDismiss?: () => void;
}

/**
 * Component that displays action execution feedback
 */
export const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  report,
  compact = false,
  onDismiss,
}) => {
  const { totalActions, successCount, failureCount, duration, results } = report;
  const successRate = totalActions > 0 ? (successCount / totalActions) * 100 : 0;
  const allSuccess = failureCount === 0;

  if (compact) {
    return (
      <div className="action-feedback-compact">
        <div className={`status-badge ${allSuccess ? 'success' : 'partial'}`}>
          {allSuccess ? '✅' : '⚠️'} {successCount}/{totalActions} Actions
        </div>
        {!allSuccess && (
          <div className="failure-count">{failureCount} failed</div>
        )}
        <div className="duration">{duration.toFixed(0)}ms</div>
      </div>
    );
  }

  return (
    <div className={`action-feedback ${allSuccess ? 'success' : 'partial-fail'}`}>
      <div className="feedback-header">
        <div className="feedback-title">
          {allSuccess ? '✅ Actions Applied' : '⚠️ Actions Executed (with errors)'}
        </div>
        {onDismiss && (
          <button
            className="feedback-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss"
            title="Dismiss feedback"
          >
            ×
          </button>
        )}
      </div>

      <div className="feedback-stats">
        <div className="stat">
          <span className="label">Executed:</span>
          <span className="value">{totalActions}</span>
        </div>
        <div className="stat">
          <span className="label">Success:</span>
          <span className={`value ${successCount === totalActions ? 'all-success' : ''}`}>
            {successCount}
          </span>
        </div>
        {failureCount > 0 && (
          <div className="stat error">
            <span className="label">Failed:</span>
            <span className="value">{failureCount}</span>
          </div>
        )}
        <div className="stat">
          <span className="label">Time:</span>
          <span className="value">{duration.toFixed(1)}ms</span>
        </div>
      </div>

      {results.length > 0 && (
        <div className="feedback-results">
          {results.map((result, idx) => (
            <ActionResultItem
              key={idx}
              result={result}
              index={idx}
            />
          ))}
        </div>
      )}

      <div className="feedback-footer">
        <div className="success-rate">
          Success Rate: <strong>{successRate.toFixed(0)}%</strong>
        </div>
      </div>
    </div>
  );
};

interface ActionResultItemProps {
  result: {
    action: Action;
    success: boolean;
    message: string;
    error?: string;
    duration?: number;
  };
  index: number;
}

/**
 * Individual action result display
 */
const ActionResultItem: React.FC<ActionResultItemProps> = ({ result, index }) => {
  const { action, success, message, error, duration } = result;
  const description = getActionDescription(action);

  return (
    <div className={`action-result ${success ? 'success' : 'error'}`}>
      <div className="result-header">
        <span className="result-icon">{success ? '✓' : '✗'}</span>
        <span className="result-message">{message}</span>
        {duration !== undefined && (
          <span className="result-duration">{duration.toFixed(1)}ms</span>
        )}
      </div>
      <div className="result-details">
        <div className="detail-type">
          <span className="label">Type:</span>
          <span className="value">{action.type}</span>
        </div>
        <div className="detail-description">
          <span className="label">Action:</span>
          <span className="value">{description}</span>
        </div>
        {error && (
          <div className="detail-error">
            <span className="label">Error:</span>
            <span className="value error-text">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook for managing action feedback display
 */
export function useActionFeedback() {
  const [feedback, setFeedback] = React.useState<ActionExecutionReport | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showFeedback = React.useCallback((report: ActionExecutionReport, autoDismissMs?: number) => {
    setFeedback(report);

    if (autoDismissMs && autoDismissMs > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
      }, autoDismissMs);
    }
  }, []);

  const dismissFeedback = React.useCallback(() => {
    setFeedback(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { feedback, showFeedback, dismissFeedback };
}

export default ActionFeedback;
