// Ollama AI enhancement features
// Smart field suggestions, quality analysis, and auto-completion using Ollama API

import { OllamaSettings } from '../wizard/constants';

export interface FieldSuggestion {
  field: string;
  suggestions: string[];
  confidence: number;
}

export interface QualityAnalysis {
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
  missing: string[];
}

export interface StyleTransfer {
  originalStyle: string;
  targetStyle: string;
  adaptedPrompt: string;
}

/**
 * Smart field auto-complete using Ollama
 * Suggests relevant values based on current prompt context
 */
export async function getFieldSuggestions(
  settings: OllamaSettings,
  currentValues: Record<string, string>,
  fieldName: string,
  mode: string
): Promise<string[]> {
  if (!settings.enabled) return [];

  try {
    const context = Object.entries(currentValues)
      .filter(([k, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const prompt = `Based on this ${mode} scene context: ${context}

Suggest 5 relevant options for the "${fieldName}" field that would complement this scene.
You MUST output ONLY a valid JSON array of 5 string suggestions. Output NOTHING else.
["option1", "option2", "option3", "option4", "option5"]`;

    const response = await fetch(`${settings.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.model,
        prompt,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error('Ollama request failed');

    const data = await response.json();
    const responseText = data.response || '';
    
    let suggestions: any = [];
    try {
      // Try to parse as JSON array
      suggestions = JSON.parse(responseText);
    } catch {
      // Try to find JSON array in the text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[0]);
        } catch {
          console.warn('Could not parse suggestions:', responseText);
          return [];
        }
      } else {
        console.warn('No JSON array found in response:', responseText);
        return [];
      }
    }
    
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
  } catch (error) {
    console.error('Field suggestion error:', error);
    return [];
  }
}

/**
 * Analyze prompt quality and provide actionable feedback
 */
export async function analyzePromptQuality(
  settings: OllamaSettings,
  promptText: string,
  mode: string
): Promise<QualityAnalysis> {
  if (!settings.enabled) {
    console.warn('analyzePromptQuality: Ollama not enabled');
    return {
      score: 0,
      strengths: [],
      improvements: [],
      missing: [],
    };
  }

  try {
    console.log('analyzePromptQuality: Starting with endpoint:', settings.apiEndpoint, 'model:', settings.model);
    
    const prompt = `Analyze this ${mode} video prompt for quality and completeness:
"${promptText}"

Provide analysis in this EXACT JSON format. Output ONLY the JSON, nothing else:
{
  "score": 75,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "missing": ["element1", "element2"]
}`;

    console.log('analyzePromptQuality: Sending request to', `${settings.apiEndpoint}/api/generate`);
    
    const response = await fetch(`${settings.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.model,
        prompt,
        temperature: 0.3,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = `Ollama request failed: ${response.status} ${response.statusText}`;
      console.error('analyzePromptQuality:', error);
      throw new Error(error);
    }

    const data = await response.json();
    console.log('analyzePromptQuality: Got response, parsing...');
    
    // Ollama returns response as text, may contain JSON embedded
    let responseText = data.response || '';
    console.log('analyzePromptQuality: Response text (first 200 chars):', responseText.substring(0, 200));
    
    // Unescape if needed (for escaped JSON responses)
    if (responseText.includes('\\"')) {
      try {
        responseText = JSON.parse(`"${responseText}"`);
      } catch {
        // Not a fully escaped string, continue as-is
      }
    }
    
    // Try to extract JSON from the response
    let analysis: any = {};
    try {
      // First try to parse the entire response
      analysis = JSON.parse(responseText);
    } catch {
      // If that fails, try to find JSON object in the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch {
          // If JSON parsing fails, return default
          console.warn('Could not parse Ollama response as JSON:', responseText);
          return {
            score: 0,
            strengths: [],
            improvements: [],
            missing: [],
          };
        }
      } else {
        console.warn('No JSON found in Ollama response:', responseText);
        return {
          score: 0,
          strengths: [],
          improvements: [],
          missing: [],
        };
      }
    }

    // Helper function to normalize array items to strings
    const normalizeToStrings = (arr: any[]): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // If it's an object with name/description, combine them
          if (item.name && item.description) {
            return `${item.name}: ${item.description}`;
          }
          if (item.name) return item.name;
          if (item.description) return item.description;
          // Try to stringify if it's some other object
          return JSON.stringify(item);
        }
        return String(item);
      }).filter(s => s.trim().length > 0);
    };

    const result = {
      score: Math.min(100, Math.max(0, parseInt(analysis.score) || 0)),
      strengths: normalizeToStrings(analysis.strengths),
      improvements: normalizeToStrings(analysis.improvements),
      missing: normalizeToStrings(analysis.missing),
    };
    
    console.log('analyzePromptQuality: Successfully parsed result:', result);
    return result;
  } catch (error) {
    console.error('Quality analysis error:', error);
    return {
      score: 0,
      strengths: [],
      improvements: [],
      missing: [],
    };
  }
}

/**
 * Auto-populate empty fields with AI suggestions
 */
export async function autoPopulateFields(
  settings: OllamaSettings,
  currentValues: Record<string, string>,
  emptyFields: string[],
  mode: string
): Promise<Record<string, string>> {
  if (!settings.enabled || emptyFields.length === 0) return {};

  try {
    const filled = Object.entries(currentValues)
      .filter(([k, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const prompt = `Given this ${mode} scene:

${filled}

Suggest appropriate values for these empty fields: ${emptyFields.join(', ')}
Output ONLY this JSON format, nothing else:
{
  "field1": "suggested value",
  "field2": "suggested value"
}`;

    const response = await fetch(`${settings.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.model,
        prompt,
        temperature: 0.8,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error('Ollama request failed');

    const data = await response.json();
    const responseText = data.response || '';
    
    let suggestions: any = {};
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[0]);
        } catch {
          console.warn('Could not parse field suggestions:', responseText);
          return {};
        }
      } else {
        console.warn('No JSON found in response:', responseText);
        return {};
      }
    }

    return typeof suggestions === 'object' ? suggestions : {};
  } catch (error) {
    console.error('Auto-populate error:', error);
    return {};
  }
}

/**
 * Transfer style from reference prompt to current prompt
 */
export async function transferStyle(
  settings: OllamaSettings,
  currentPrompt: string,
  referenceStyle: string,
  mode: string
): Promise<string> {
  if (!settings.enabled) return currentPrompt;

  try {
    const prompt = `Transform this ${mode} prompt to match the style of the reference, maintaining all the current content but adapting the stylistic approach:

Current prompt: "${currentPrompt}"
Reference style: "${referenceStyle}"

Output ONLY the transformed prompt with no additional text or explanation.`;

    const response = await fetch(`${settings.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.model,
        prompt,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error('Ollama request failed');

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Style transfer error:', error);
    return currentPrompt;
  }
}

/**
 * Check if Ollama server is reachable
 */
export async function checkOllamaConnection(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get available Ollama models
 */
export async function getAvailableModels(endpoint: string): Promise<string[]> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}
