// Option sets for all modes - extracted from wizard/page.tsx for better performance
// These can be lazy-loaded on demand instead of loading everything upfront

export type OptionSets = Record<string, Record<string, string[]>>;

export const cinematicOptions: Record<string, string[]> = {
  genre: ['Sci-fi thriller', 'Period drama', 'Heist sequence', 'Space opera', 'Character study', 'Cyberpunk adventure', 'Historical epic', 'Post-apocalyptic tale', 'Superhero saga', 'Mystery intrigue', 'Fantasy quest', 'Crime drama', 'War story', 'Romance drama', 'Coming-of-age', 'Road movie', 'Political thriller', 'Bio-tech conspiracy', 'Mythic odyssey', 'Time-loop mystery', 'Noir detective', 'Spy espionage', 'Alien invasion', 'Dystopian future', 'Medieval fantasy', 'Western showdown', 'Horror suspense', 'Action blockbuster'],
  
  shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot', 'Dutch angle', 'Bird\'s eye view', 'Low angle', 'High angle', 'Panoramic sweep', 'Extreme close-up', 'Medium close-up', 'Two-shot', 'Point-of-view', 'Match cut setup', 'Insert detail', 'Rack focus reveal', 'Montage beat', 'Slow zoom in', 'Quick cutaway', 'Steadicam follow', 'Drone aerial', 'Handheld shaky', 'Locked focus', 'Depth reveal'],
  
  lighting: ['Volumetric shafts', 'Neon rim light', 'Golden hour', 'High contrast noir', 'Soft bounce', 'Harsh shadows', 'Warm tungsten', 'Cool moonlight', 'Strobe flashes', 'Subtle fill', 'Practical lamps', 'Silhouette backlight', 'Flicker firelight', 'Window slit light', 'Soft top light', 'Edge-lit', 'Candle flicker'],
  
  cameraMove: ['Slow push', 'Lateral dolly', 'Crane reveal', 'Handheld drift', 'Locked-off tableau', 'Quick zoom', 'Circular pan', 'Tilt up', 'Track backward', 'Static hold', 'Orbit reveal', 'Snap zoom', 'Whip pan'],
  
  // Add more as needed - kept short for initial refactor
};

// Function to get options for a specific mode
export function getOptionsForMode(mode: string): Record<string, string[]> {
  switch (mode) {
    case 'cinematic':
      return cinematicOptions;
    // Add other modes as we extract them
    default:
      return {};
  }
}

// Lazy load function for future use
export async function loadOptionsForMode(mode: string): Promise<Record<string, string[]>> {
  // In the future, this could fetch from JSON files or API
  return getOptionsForMode(mode);
}
