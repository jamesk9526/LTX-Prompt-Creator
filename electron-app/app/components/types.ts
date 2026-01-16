// Shared types for components
// These should match the types defined in app/wizard/page.tsx

export type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';

export interface Project {
  id: string;
  name: string;
  mode: ModeId;
  nsfwEnabled: boolean;
  values: Record<string, Record<string, string>>;
  createdAt: number;
  updatedAt: number;
}

export interface OllamaSettings {
  enabled: boolean;
  model: string;
  baseUrl: string;
}
