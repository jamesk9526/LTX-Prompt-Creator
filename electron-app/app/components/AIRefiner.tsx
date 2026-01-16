'use client';

import React, { useState, useCallback } from 'react';

interface AIRefinerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  mode: 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';
  tone: 'melancholic' | 'balanced' | 'energetic' | 'dramatic';
  onApplySuggestion: (suggestion: string) => void;
  showToast: (message: string) => void;
  isRefining: boolean;
  onRefine: (prompt: string) => Promise<string>;
}

interface Suggestion {
  id: string;
  category: string;
  description: string;
  applied?: boolean;
}

const SUGGESTION_CATEGORIES = {
  specificity: {
    title: 'Add Specificity',
    icon: '🎯',
    description: 'Make vague terms more concrete',
  },
  details: {
    title: 'Enhance Details',
    icon: '✨',
    description: 'Add technical or visual specifics',
  },
  emotion: {
    title: 'Emotional Depth',
    icon: '❤️',
    description: 'Strengthen emotional impact',
  },
  technical: {
    title: 'Technical Elements',
    icon: '⚙️',
    description: 'Add cinematography/camera specs',
  },
  tone: {
    title: 'Tone Alignment',
    icon: '🎭',
    description: 'Better match selected mood',
  },
  structure: {
    title: 'Improve Structure',
    icon: '📐',
    description: 'Better logical flow',
  },
};

export default function AIRefiner({
  isOpen,
  onClose,
  currentPrompt,
  mode,
  tone,
  onApplySuggestion,
  showToast,
  isRefining,
  onRefine,
}: AIRefinerProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const generateSuggestions = useCallback(async () => {
    if (!currentPrompt.trim()) {
      showToast('Add some prompt content first');
      return;
    }

    setLoading(true);
    try {
      const toneContext = {
        melancholic: 'somber, introspective, slow-paced',
        balanced: 'even-paced, neutral perspective',
        energetic: 'fast-moving, dynamic, intense',
        dramatic: 'high stakes, cinematic tension',
      };

      const prompt = `Analyze this prompt and suggest up to 5 specific, actionable improvements:

Prompt: "${currentPrompt}"
Mode: ${mode}
Tone: ${tone} (${toneContext[tone]})

For each suggestion, provide:
1. Category (specificity/details/emotion/technical/tone/structure)
2. What to improve
3. Specific suggestion

Keep suggestions brief and actionable. Format as a JSON array.`;

      const result = await onRefine(prompt);
      
      // Parse suggestions from result
      try {
        const parsed = JSON.parse(result);
        const newSuggestions = Array.isArray(parsed) ? parsed.slice(0, 5) : [];
        setSuggestions(newSuggestions.map((s: any, i: number) => ({
          id: `${i}`,
          category: s.category || 'details',
          description: s.suggestion || s.description || s.improvement || '',
          applied: false,
        })));
        showToast('Suggestions generated!');
      } catch {
        // If parsing fails, create generic suggestions based on analysis
        const defaultSuggestions: Suggestion[] = [
          {
            id: '1',
            category: 'specificity',
            description: 'Replace vague descriptors with specific details',
          },
          {
            id: '2',
            category: 'details',
            description: 'Add camera movement or framing details',
          },
          {
            id: '3',
            category: 'technical',
            description: 'Include lighting setup or color grade',
          },
          {
            id: '4',
            category: 'emotion',
            description: 'Emphasize emotional arc or character motivation',
          },
          {
            id: '5',
            category: 'tone',
            description: `Enhance ${tone} mood with specific elements`,
          },
        ];
        setSuggestions(defaultSuggestions);
        showToast('Smart suggestions ready');
      }
    } catch (err) {
      showToast('Error generating suggestions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPrompt, mode, tone, onRefine, showToast]);

  const refinePrompt = useCallback(async () => {
    if (!currentPrompt.trim()) return;

    setLoading(true);
    try {
      const systemPrompt = `You are Nicole, an expert AI assistant in creative prompt writing.

Your task: Refine the user's prompt to be more specific, detailed, and aligned with their selected mode and tone.

Output ONLY the refined prompt in a markdown code block (\`\`\`prompt ... \`\`\`), with no preamble or explanation.

Consider:
- Mode: ${mode}
- Tone: ${tone}
- Current prompt length and detail level
- Technical accuracy for the generation model`;

      const refined = await onRefine(`${currentPrompt}\n\nRefine this prompt to be more specific and detailed.`);
      setRefinedPrompt(refined);
      showToast('Prompt refined!');
    } catch (err) {
      showToast('Error refining prompt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPrompt, mode, tone, onRefine, showToast]);

  const applySuggestion = useCallback((suggestion: Suggestion) => {
    const enhancement = `${currentPrompt}\n\nIncorporate: ${suggestion.description}`;
    onApplySuggestion(enhancement);
    
    setSuggestions(suggestions.map(s =>
      s.id === suggestion.id ? { ...s, applied: true } : s
    ));
    
    showToast('Suggestion applied!');
  }, [currentPrompt, suggestions, onApplySuggestion, showToast]);

  if (!isOpen) return null;

  const filteredSuggestions = activeTab === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === activeTab);

  return (
    <div className="ai-refiner-overlay" onMouseDown={onClose}>
      <div 
        className="ai-refiner-panel" 
        role="dialog" 
        aria-modal="true" 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ai-refiner-header">
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h3>Smart Prompt Refinement</h3>
            <p className="hint">Get suggestions to enhance your prompt</p>
          </div>
          <button 
            className="ghost" 
            type="button" 
            onClick={onClose}
            aria-label="Close AI refiner"
          >
            ✕
          </button>
        </div>

        <div className="ai-refiner-body">
          <div className="ai-refiner-current">
            <div className="ai-section-header">
              <span>Current Prompt</span>
              <span className="char-count">{currentPrompt.length} chars</span>
            </div>
            <div className="prompt-preview">
              {currentPrompt || '(Empty prompt)'}
            </div>
            <div className="ai-actions">
              <button 
                className="primary" 
                type="button"
                onClick={generateSuggestions}
                disabled={loading || !currentPrompt.trim()}
                aria-label="Generate suggestions"
              >
                {loading ? '⟳ Analyzing...' : '✨ Get Suggestions'}
              </button>
              <button 
                className="secondary" 
                type="button"
                onClick={refinePrompt}
                disabled={loading || !currentPrompt.trim()}
                aria-label="Refine entire prompt"
              >
                {loading ? '⟳ Refining...' : '🎨 Auto-Refine'}
              </button>
            </div>
          </div>

          {refinedPrompt && (
            <div className="ai-refiner-refined">
              <div className="ai-section-header">
                <span>Refined Prompt</span>
                <button 
                  className="ghost small"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(refinedPrompt);
                    showToast('Copied to clipboard');
                  }}
                  aria-label="Copy refined prompt"
                >
                  📋
                </button>
              </div>
              <div className="prompt-preview refined">
                {refinedPrompt}
              </div>
              <button 
                className="primary full"
                type="button"
                onClick={() => onApplySuggestion(refinedPrompt)}
                aria-label="Apply refined prompt"
              >
                Apply Refined Version
              </button>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="ai-suggestions">
              <div className="suggestions-header">
                <span className="eyebrow">Smart Suggestions</span>
                <div className="suggestion-tabs">
                  <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab('all')}
                  >
                    All ({suggestions.length})
                  </button>
                  {Object.entries(SUGGESTION_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      title={cat.description}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="suggestions-list">
                {filteredSuggestions.map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className={`suggestion-item ${suggestion.applied ? 'applied' : ''}`}
                  >
                    <div className="suggestion-content">
                      <span className="suggestion-icon">
                        {SUGGESTION_CATEGORIES[suggestion.category as keyof typeof SUGGESTION_CATEGORIES]?.icon || '💡'}
                      </span>
                      <div>
                        <div className="suggestion-category">
                          {SUGGESTION_CATEGORIES[suggestion.category as keyof typeof SUGGESTION_CATEGORIES]?.title || suggestion.category}
                        </div>
                        <div className="suggestion-description">
                          {suggestion.description}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`suggestion-action ${suggestion.applied ? 'applied' : ''}`}
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      disabled={suggestion.applied || loading}
                      title={suggestion.applied ? 'Applied' : 'Apply this suggestion'}
                    >
                      {suggestion.applied ? '✓' : '→'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length === 0 && !refinedPrompt && (
            <div className="ai-placeholder">
              <p className="eyebrow">How AI Refinement Works</p>
              <ul>
                <li>Click &ldquo;Get Suggestions&rdquo; to analyze your prompt</li>
                <li>Use &ldquo;Auto-Refine&rdquo; for a complete revision</li>
                <li>Apply individual suggestions or the full refined version</li>
                <li>Suggestions are tailored to your mode and tone</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
