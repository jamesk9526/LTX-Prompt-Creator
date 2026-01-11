'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './wizard.css';

type OptionSets = Record<string, Record<string, string[]>>;

const OPTION_SETS_STORAGE_KEY = 'ltx_prompter_option_sets_v1';
const UI_PREFS_STORAGE_KEY = 'ltx_prompter_ui_prefs_v1';
const PROJECTS_STORAGE_KEY = 'ltx_prompter_projects_v1';
const FAVORITES_STORAGE_KEY = 'ltx_prompter_favorites_v1';
const HISTORY_STORAGE_KEY = 'ltx_prompter_history_v1';
const LOCKED_STEPS_STORAGE_KEY = 'ltx_prompter_locked_steps_v1';
const OLLAMA_SETTINGS_STORAGE_KEY = 'ltx_prompter_ollama_settings_v1';

type CaptureWord = 'shot' | 'video' | 'clip' | 'frame';

type PromptFormat = 'ltx2' | 'paragraph';

type DetailLevel = 'minimal' | 'balanced' | 'rich';

type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'nsfw';

type Tone = 'melancholic' | 'balanced' | 'energetic' | 'dramatic';

type PromptHistoryItem = {
  text: string;
  timestamp: string;
  mode: ModeId;
};

type UiPrefs = {
  typingEnabled: boolean;
  typingSpeedMs: number;
  captureWord: CaptureWord;
  autoCopyOnReview: boolean;
  promptFormat: PromptFormat;
  detailLevel: DetailLevel;
  autoFillAudio: boolean;
  autoFillCamera: boolean;
  previewFontScale: number;
};

type Project = {
  id: string;
  name: string;
  mode: ModeId;
  nsfwEnabled: boolean;
  values: Record<string, Record<string, string>>;
  createdAt: number;
  updatedAt: number;
};

type Favorites = Record<string, Record<string, string[]>>; // mode -> field -> favorited values

type History = Record<string, Record<string, string[]>>; // mode -> field -> recent values

type LockedSteps = Record<string, boolean[]>; // mode -> array of locked status for each step (1-17)

type OllamaSettings = {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
};

const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
  enabled: false,
  apiEndpoint: 'http://localhost:11434',
  model: 'llama2',
  systemInstructions: `You are a Creative Assistant. Given a user's raw input prompt describing a scene or concept, expand it into a detailed video generation prompt with specific visuals and integrated audio to guide a text-to-video model.

#### Guidelines
- Strictly follow all aspects of the user's raw input: include every element requested (style, visuals, motions, actions, camera movement, audio).
    - If the input is vague, invent concrete details: lighting, textures, materials, scene settings, etc.
        - For characters: describe gender, clothing, hair, expressions. DO NOT invent unrequested characters.
- Use active language: present-progressive verbs ("is walking," "speaking"). If no action specified, describe natural movements.
- Maintain chronological flow: use temporal connectors ("as," "then," "while").
- Audio layer: Describe complete soundscape (background audio, ambient sounds, SFX, speech/music when requested). Integrate sounds chronologically alongside actions. Be specific (e.g., "soft footsteps on tile"), not vague (e.g., "ambient sound is present").
- Speech (only when requested): 
    - For ANY speech-related input (talking, conversation, singing, etc.), ALWAYS include exact words in quotes with voice characteristics (e.g., "The man says in an excited voice: 'You won't believe what I just saw!'").
    - Specify language if not English and accent if relevant.
- Style: Include visual style at the beginning: "Style: <style>, <rest of prompt>." Default to cinematic-realistic if unspecified. Omit if unclear.
- Visual and audio only: NO non-visual/auditory senses (smell, taste, touch).
- Restrained language: Avoid dramatic/exaggerated terms. Use mild, natural phrasing.
    - Colors: Use plain terms ("red dress"), not intensified ("vibrant blue," "bright red").
    - Lighting: Use neutral descriptions ("soft overhead light"), not harsh ("blinding light").
    - Facial features: Use delicate modifiers for subtle features (i.e., "subtle freckles").

#### Important notes: 
- Analyze the user's raw input carefully. In cases of FPV or POV, exclude the description of the subject whose POV is requested.
- Camera motion: DO NOT invent camera motion unless requested by the user.
- Speech: DO NOT modify user-provided character dialogue unless it's a typo.
- No timestamps or cuts: DO NOT use timestamps or describe scene cuts unless explicitly requested.
- Format: DO NOT use phrases like "The scene opens with...". Start directly with Style (optional) and chronological scene description.
- Format: DO NOT start your response with special characters.
- DO NOT invent dialogue unless the user mentions speech/talking/singing/conversation.
- If the user's raw input prompt is highly detailed, chronological and in the requested format: DO NOT make major edits or introduce new elements. Add/enhance audio descriptions if missing.

#### Output Format (Strict):
- Single continuous paragraph in natural language (English).
- NO titles, headings, prefaces, code fences, or Markdown.
- If unsafe/invalid, return original user prompt. Never ask questions or clarifications.

Your output quality is CRITICAL. Generate visually rich, dynamic prompts with integrated audio for high-quality video generation.

#### Example
Input: "A woman at a coffee shop talking on the phone"
Output:
Style: realistic with cinematic lighting. In a medium close-up, a woman in her early 30s with shoulder-length brown hair sits at a small wooden table by the window. She wears a cream-colored turtleneck sweater, holding a white ceramic coffee cup in one hand and a smartphone to her ear with the other. Ambient cafe sounds fill the space—espresso machine hiss, quiet conversations, gentle clinking of cups. The woman listens intently, nodding slightly, then takes a sip of her coffee and sets it down with a soft clink. Her face brightens into a warm smile as she speaks in a clear, friendly voice, 'That sounds perfect! I'd love to meet up this weekend. How about Saturday afternoon?' She laughs softly—a genuine chuckle—and shifts in her chair. Behind her, other patrons move subtly in and out of focus. 'Great, I'll see you then,' she concludes cheerfully, lowering the phone.`,
  temperature: 0.7,
};

const DEFAULT_UI_PREFS: UiPrefs = {
  typingEnabled: false,
  typingSpeedMs: 2,
  captureWord: 'clip',
  autoCopyOnReview: false,
  promptFormat: 'paragraph',
  detailLevel: 'rich',
  autoFillAudio: true,
  autoFillCamera: true,
  previewFontScale: 1,
};

const MODES = [
  { id: 'cinematic', title: 'Cinematic', tag: 'Camera-forward', desc: 'Film-inspired framing, motion, and grading.' },
  { id: 'classic', title: 'Classic', tag: 'Balanced', desc: 'Cohesive, versatile looks for general prompts.' },
  { id: 'drone', title: 'Drone / Landscape', tag: 'Non-person', desc: 'Aerials, landscapes, architecture, and environment-first footage.' },
  { id: 'animation', title: 'Animation', tag: 'Stylized', desc: '2D/3D/stop-motion/anime-friendly wording and presets.' },
  { id: 'nsfw', title: 'NSFW', tag: '18+', desc: 'Adult-focused styling. Requires NSFW enabled.' },
];

const DEFAULT_OPTION_SETS: OptionSets = {
  cinematic: {
    genre: ['Sci-fi thriller', 'Period drama', 'Heist sequence', 'Space opera', 'Character study', 'Cyberpunk adventure', 'Historical epic', 'Post-apocalyptic tale', 'Superhero saga', 'Mystery intrigue', 'Fantasy quest', 'Crime drama', 'War story', 'Romance drama', 'Coming-of-age', 'Road movie', 'Political thriller', 'Bio-tech conspiracy', 'Mythic odyssey', 'Time-loop mystery', 'Noir detective', 'Spy espionage', 'Alien invasion', 'Dystopian future', 'Medieval fantasy', 'Western showdown', 'Horror suspense', 'Action blockbuster', 'Drama adaptation', 'Comedy caper'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot', 'Dutch angle', 'Bird\'s eye view', 'Low angle', 'High angle', 'Panoramic sweep', 'Extreme close-up', 'Medium close-up', 'Two-shot', 'Point-of-view', 'Match cut setup', 'Insert detail', 'Rack focus reveal', 'Montage beat', 'Slow zoom in', 'Quick cutaway', 'Steadicam follow', 'Drone aerial', 'Handheld shaky', 'Locked focus', 'Depth reveal', 'Split screen', 'Time-lapse', 'Freeze frame', 'Reverse shot', 'Long take'],
    role: ['Protagonist', 'Investigator', 'Pilot', 'Engineer', 'Anti-hero', 'Mentor figure', 'Sidekick', 'Villain', 'Survivor', 'Rebel', 'Detective', 'Scientist', 'Soldier', 'Thief', 'Journalist', 'Leader', 'Wanderer', 'Hacker', 'Strategist', 'Visionary', 'Assassin', 'Diplomat', 'Explorer', 'Guardian', 'Outcast', 'Prophet', 'Warrior', 'Scholar', 'Inventor', 'Healer'],
    hairColor: ['black', 'dark brown', 'brown', 'auburn', 'red', 'strawberry blonde', 'blonde', 'platinum blonde', 'silver', 'white', 'gray', 'pastel pink', 'pastel blue', 'multicolored'],
    eyeColor: ['brown', 'hazel', 'green', 'blue', 'gray', 'amber', 'violet', 'heterochromia'],
    bodyDescriptor: ['tall', 'short', 'slender', 'athletic build', 'muscular build', 'curvy build', 'lean build', 'broad-shouldered', 'petite', 'plus-size'],
    mood: ['Tense', 'Hopeful', 'Melancholic', 'Triumphant', 'Mysterious', 'Energetic', 'Somber', 'Excited', 'Foreboding', 'Serene', 'Romantic', 'Bittersweet', 'Grim', 'Euphoric', 'Gritty', 'Dreamlike', 'Nostalgic', 'Introspective', 'Adventurous', 'Desperate', 'Optimistic', 'Cynical', 'Whimsical', 'Haunting', 'Empowering', 'Melodramatic'],
    lighting: ['Volumetric shafts', 'Neon rim light', 'Golden hour', 'High contrast noir', 'Soft bounce', 'Harsh shadows', 'Warm tungsten', 'Cool moonlight', 'Strobe flashes', 'Subtle fill', 'Practical lamps', 'Silhouette backlight', 'Flicker firelight', 'Window slit light', 'Soft top light', 'Edge-lit', 'Candle flicker', 'Laser beams', 'UV blacklight', 'Floodlight harsh', 'Spotlight beam', 'Bounce from walls', 'Reflected pool', 'Sunset glow', 'Twilight blue', 'Storm lightning', 'Fireplace warm', 'Headlight glare'],
    environment: ['Rainy street', 'Neon city', 'Abandoned warehouse', 'Orbiting station', 'Desert expanse', 'Dense forest', 'Urban skyline', 'Suburban home', 'Mountain peak', 'Ocean shore', 'Snowy pass', 'Cavern interior', 'Futuristic lab', 'Battlefield ruins', 'Underground tunnel', 'Rooftop at night', 'Stormy coast', 'Volcanic crater', 'Ice cave', 'Jungle canopy', 'Space colony', 'Medieval castle', 'Cyberpunk alley', 'Victorian mansion', 'Post-war wasteland', 'Crystal cavern', 'Floating platform', 'Submarine depths', 'Cloud city', 'Ancient temple'],
    wardrobe: ['Weathered leathers', 'Stealth techweave', 'Formal noir suit', 'Explorer layers', 'Armored rig', 'Casual jacket', 'Military uniform', 'Elegant gown', 'Rugged boots', 'High-tech visor', 'Streetwear', 'Tactical gear', 'Royal attire', 'Covert cloak', 'Minimal tech suit', 'Retro jumpsuit', 'Fur-lined coat', 'Chainmail armor', 'Silk robes', 'Battle-scarred cloak', 'Neon cyberwear', 'Desert robes', 'Pilot jumpsuit', 'Lab coat', 'Prison garb', 'Ceremonial robes', 'Steampunk gears', 'Space suit', 'Nomad wraps', 'Elite uniform'],
    pose: ['Striding forward', 'Holding ground', 'Leaning on rail', 'Kneeling for cover', 'Running mid-frame', 'Arms crossed', 'Pointing dramatically', 'Crouched low', 'Standing tall', 'Gesturing wildly', 'Mid-turn', 'Reaching out', 'Bracing impact', 'Over-shoulder glance', 'Hands clasped', 'Hands on console', 'Fist clenched', 'Arms raised', 'Head bowed', 'Eyes closed', 'Smiling slyly', 'Frowning intensely', 'Laughing aloud', 'Whispering secret', 'Saluting', 'Praying', 'Dancing', 'Fighting stance', 'Relaxed lean', 'Alert posture'],
    lightInteraction: ['wraps gently', 'cuts through haze', 'paints rim highlights', 'glitters on surfaces', 'bleeds into lens bloom', 'casts long shadows', 'diffuses softly', 'sparkles on metal', 'filters through leaves', 'reflects off water', 'scatters in dust', 'traces outlines', 'dances on skin', 'pierces darkness', 'softens edges', 'creates halos', 'illuminates details', 'casts silhouettes', 'warms tones', 'cools blues', 'adds depth', 'highlights textures', 'creates contrast', 'blurs boundaries', 'enhances mood', 'defines shapes'],
    weather: ['Clear dusk', 'Fine rain', 'Storm front', 'Snow flurry', 'Humid night', 'Foggy morning', 'Sunny afternoon', 'Overcast sky', 'Windy gale', 'Calm breeze', 'Heat haze', 'Blizzard whiteout', 'Smoggy night', 'Dust storm', 'Thunderstorm', 'Hail pellets', 'Rainbow arc', 'Aurora borealis', 'Sandstorm', 'Tornado funnel', 'Mild drizzle', 'Heavy downpour', 'Sleet mix', 'Frosty morning', 'Dewy grass', 'Humid fog', 'Clear starry night', 'Eclipse shadow'],
    cameraMove: ['Slow push', 'Lateral dolly', 'Crane reveal', 'Handheld drift', 'Locked-off tableau', 'Quick zoom', 'Circular pan', 'Tilt up', 'Track backward', 'Static hold', 'Orbit reveal', 'Snap zoom', 'Whip pan', 'J-cut transition', 'Boom up', 'Pedestal down', 'Arc shot', 'Dutch tilt', 'Crash zoom', 'Reverse tracking', 'Spiral pan', 'Figure-eight', 'Pendulum swing', 'Elevator rise', 'Freefall drop', 'Time warp', 'Morph transition', 'Dissolve fade'],
    lens: ['35mm spherical', '50mm prime', '85mm portrait', '24mm wide', 'Anamorphic 40mm', '100mm telephoto', '16mm ultra-wide', 'Macro lens', 'Fish-eye', 'Zoom lens', '28mm vintage', '135mm prime', '70-200 tele', 'Prime 14mm', '18-55 kit', '300mm sniper', '8mm fisheye', '50mm tilt-shift', '85mm soft focus', '24mm tilt', '100mm macro', '200mm tele', '10mm ultra-wide', '60mm macro', '400mm super tele', 'Varifocal zoom', 'Pancake lens', 'Mirror lens'],
    colorGrade: ['Teal & amber', 'Muted filmic', 'Cool tungsten', 'Punchy neon', 'Warm dusk', 'Sepia tones', 'High saturation', 'Desaturated', 'Vintage look', 'Modern vibrant', 'Bleach bypass', 'Natural cinema', 'Matte pastel', 'Neo-noir cool', 'Cinematic blue', 'Golden glow', 'Monochrome noir', 'Pastel dream', 'Harsh contrast', 'Soft lavender', 'Earthy tones', 'Electric neon', 'Retro VHS', 'Film negative', 'Polaroid fade', 'Kodachrome', 'Cineon log', 'ACES gamut', 'HDR bright', 'LUT custom'],
    sound: ['Distant traffic', 'Low wind hum', 'Crowd murmur', 'Engine rumble', 'Quiet ambience', 'Thunder clap', 'Birdsong', 'City bustle', 'Ocean waves', 'Silent tension', 'Metal creak', 'Power grid buzz', 'Heartbeat pulse', 'Echoing footsteps', 'Whispering wind', 'Crackling fire', 'Dripping water', 'Rustling leaves', 'Humming machinery', 'Faint laughter', 'Screeching tires', 'Bubbling stream', 'Howling wolf', 'Chirping insects', 'Ticking clock', 'Ringing bell', 'Sizzling sparks', 'Gurgling liquid'],
    sfx: ['Footsteps on wet pavement', 'Cloth rustle', 'Metal clink', 'Distant siren', 'Door creak', 'Gun cock', 'Glass shatter', 'Radio chatter', 'Breath close to mic', 'Rain on window', 'Whoosh transition', 'Impact hit', 'Servo whirr', 'Drone pass-by', 'Laser zap', 'Explosion boom', 'Sword clash', 'Potion bubble', 'Engine rev', 'Phone ring', 'Key turn', 'Zippo flick', 'Paper tear', 'Coin drop', 'Whistle blow', 'Bell toll', 'Chain rattle', 'Water splash', 'Fire crackle', 'Ice crack', 'Elevator ding', 'Neon sign buzz', 'Footsteps on gravel', 'Car door slam', 'Holster snap', 'Distant radio static', 'Crowd cheer swell', 'Glass tinkling', 'Steam hiss'],
    music: ['Minimal synth pulse', 'Orchestral swell', 'Lo-fi ambience', 'Dark drone pad', 'Tense ticking rhythm', 'Sparse piano motif', 'Driving percussion', 'Warm analog bassline', 'Cinematic riser', 'No music', 'Ambient strings', 'Pulsing bass', 'Analog arpeggio', 'Hybrid orchestral', 'Jazz improvisation', 'Rock guitar riff', 'Electronic glitch', 'Folk acoustic', 'Choral voices', 'Percussive beat', 'Symphonic build', 'Trip-hop groove', 'Indie folk', 'Heavy metal', 'Classical piano', 'Reggae rhythm', 'Blues slide', 'Disco funk', 'World fusion'],
    sig1: ['atmospheric haze', 'micro dust motes', 'breath in cold air', 'rain beads on skin', 'embers in frame', 'fog rolling in', 'light streaks', 'particle effects', 'smoke trails', 'water droplets', 'soft bloom trails', 'refraction shimmer', 'lens flare', 'depth blur', 'grain overlay', 'color bleed', 'motion trails', 'shadow play', 'highlight sparkle', 'texture weave', 'soft vignette', 'chromatic aberration', 'bokeh shapes', 'film scratches', 'light leaks', 'dust specks', 'water ripples', 'fire embers'],
    sig2: ['soft rim light', 'film grain', 'lens bloom', 'chromatic fringe', 'shallow DOF falloff', 'bokeh circles', 'motion blur', 'depth of field', 'flare spots', 'grain texture', 'anamorphic flares', 'subtle vignette', 'halo effect', 'glow aura', 'sharp contrast', 'soft diffusion', 'reflection mirror', 'silhouette outline', 'warm tint', 'cool shadow', 'flare burst', 'grain noise', 'bloom glow', 'vignette fade', 'edge blur', 'focus shift', 'light scatter', 'texture grain'],
    // Composition & detail presets
    framingNotes: ['rule of thirds', 'center-framed', 'negative space', 'leading lines', 'balanced symmetry', 'tight crop', 'open composition', 'foreground framing'],
    environmentTexture: ['weathered', 'sterile', 'lush', 'sparse', 'cluttered', 'pristine', 'industrial', 'organic', 'neon-soaked', 'dusty'],
    lightingIntensity: ['soft', 'dim', 'medium', 'harsh', 'glowing', 'punchy'],
    focusTarget: ['the subject', 'the face', 'the eyes', 'the hands', 'the object', 'the horizon', 'the backdrop'],
    // Movement presets
    movementSubjectType: ['Person', 'Object'],
    movement1: ['walks in', 'enters', 'runs in', 'moves into frame', 'is carried in', 'is wheeled in', 'is placed in frame', 'rolls in'],
    movement2: ['sits', 'stands', 'takes a seat', 'stops and looks around', 'is set down', 'rests', 'turns and sits', 'moves out of frame'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'hesitant', 'deliberate'],
    movementManner: ['confidently', 'nervously', 'quietly', 'carefully', 'casually', 'gracefully', 'awkwardly'],
  },
  classic: {
    genre: ['Portrait', 'Fashion editorial', 'Documentary', 'Landscape', 'Architectural', 'Street photography', 'Nature scene', 'Still life', 'Event coverage', 'Product shot', 'Food styling', 'Travel journal', 'Editorial report', 'Lifestyle', 'Beauty close-up', 'Macro nature', 'Urban exploration', 'Family portrait', 'Pet photography', 'Sports action', 'Concert capture', 'Wedding ceremony', 'Graduation moment', 'Corporate headshot', 'Art installation', 'Historical reenactment', 'Wildlife safari', 'Aerial landscape', 'Underwater scene', 'Minimalist abstract'],
    shot: ['Three-quarter', 'Half-body', 'Headshot', 'Wide landscape', 'Macro detail', 'Full body', 'Profile view', 'Environmental portrait', 'Close detail', 'Group shot', 'Overhead flatlay', 'Detail crop', 'Flat portrait', 'Low-angle portrait', 'High-angle view', 'Bird\'s eye', 'Worm\'s eye', 'Dutch tilt', 'Rule of thirds', 'Leading lines', 'Symmetrical', 'Asymmetrical', 'Golden ratio', 'Negative space', 'Framed subject', 'Silhouette', 'Backlit', 'Reflected', 'Shadow play'],
    role: ['Artist', 'Explorer', 'Scholar', 'Performer', 'Leader', 'Entrepreneur', 'Athlete', 'Teacher', 'Chef', 'Musician', 'Model', 'Craftsperson', 'Designer', 'Curator', 'Photographer', 'Journalist', 'Activist', 'Inventor', 'Healer', 'Gardener', 'Pilot', 'Scientist', 'Writer', 'Actor', 'Dancer', 'Singer', 'Painter', 'Sculptor', 'Architect', 'Engineer'],
    hairColor: ['black', 'dark brown', 'brown', 'auburn', 'red', 'blonde', 'platinum blonde', 'silver', 'white', 'gray'],
    eyeColor: ['brown', 'hazel', 'green', 'blue', 'gray', 'amber'],
    bodyDescriptor: ['tall', 'short', 'slender', 'athletic build', 'muscular build', 'curvy build', 'petite', 'plus-size'],
    mood: ['Calm', 'Confident', 'Joyful', 'Reflective', 'Gritty', 'Serene', 'Determined', 'Playful', 'Thoughtful', 'Bold', 'Minimal', 'Elegant', 'Vibrant', 'Muted', 'Warm', 'Cool', 'Dynamic', 'Static', 'Intimate', 'Expansive', 'Nostalgic', 'Modern', 'Classic', 'Artistic', 'Natural', 'Stylized', 'Authentic', 'Dreamy', 'Realistic', 'Surreal'],
    lighting: ['Soft daylight', 'Studio softbox', 'Split light', 'Backlit glow', 'Window light', 'Ring light', 'Natural shade', 'Flash fill', 'Golden hour', 'Blue hour', 'Hard noon light', 'Open shade', 'Bounce fill', 'Snoot spotlight', 'Umbrella diffuse', 'Grid spot', 'Beauty dish', 'Octabox', 'Strip light', 'Barn doors', 'Gobo pattern', 'Color gel', 'LED panel', 'Speedlight bounce', 'Reflector fill', 'Natural window', 'Studio strobe', 'Continuous light'],
    environment: ['Modern loft', 'Forest trail', 'Coastal cliffs', 'Old library', 'Glass atrium', 'City park', 'Beach shore', 'Mountain cabin', 'Urban street', 'Garden patio', 'Brick alley', 'Studio cyclorama', 'Rustic barn', 'Concrete jungle', 'Sandy dunes', 'Rocky canyon', 'Lush meadow', 'Frozen lake', 'Tropical beach', 'Desert oasis', 'Historic town', 'Industrial warehouse', 'Art gallery', 'Home kitchen', 'Office space', 'School classroom', 'Hospital ward', 'Airport terminal', 'Train station', 'Boat deck'],
    wardrobe: ['Tailored suit', 'Minimalist monochrome', 'Denim & leather', 'Casual layers', 'Editorial couture', 'Business casual', 'Athleisure', 'Bohemian dress', 'Formal attire', 'Casual jeans', 'Streetwear set', 'Classic trench', 'Silk blouse', 'Wool sweater', 'Cotton shirt', 'Leather jacket', 'Jeans and tee', 'Dress shoes', 'Sneakers', 'Boots', 'Sandals', 'Hat and scarf', 'Gloves', 'Belt', 'Tie', 'Necktie', 'Bowtie', 'Vest', 'Blazer', 'Cardigan'],
    pose: ['Standing composed', 'Relaxed seated', 'Walking in frame', 'Leaning casually', 'Arms folded', 'Hand on hip', 'Smiling directly', 'Looking away', 'Dynamic action', 'Casual stance', 'Hands in pockets', 'Crossed ankles', 'Head tilted', 'Eyes forward', 'Laughing', 'Thinking', 'Talking', 'Listening', 'Running', 'Jumping', 'Dancing', 'Sitting cross-legged', 'Kneeling', 'Lying down', 'Reaching up', 'Pointing', 'Waving', 'Clapping', 'Nodding', 'Shrugging'],
    cameraMove: ['Tripod locked', 'Gentle slider', 'Static portrait', 'Steady pan', 'Slow tilt', 'Fixed focus', 'Manual pan', 'Zoom in', 'Pull back', 'Orbit around', 'Tilt-shift motion', 'Handheld walk', 'Boom lift', 'Crane up', 'Dolly track', 'Jib arm', 'Steadicam', 'Gimbal', 'Freehand', 'Time-lapse', 'Hyperlapse', 'Panning shot', 'Tilting shot', 'Tracking shot', 'Following shot', 'Reveal shot', 'Uncover shot', 'Sweep shot', 'Arc shot'],
    lens: ['50mm prime', '85mm portrait', '35mm street', '24mm wide', 'Macro 100mm', 'Telephoto 200mm', 'Wide-angle 16mm', 'Standard zoom', 'Prime 135mm', 'Tilt-shift', '28mm compact', '24-70 zoom', '18-55 kit', '70-300 zoom', '10-22 ultra-wide', '60mm macro', '300mm super tele', '8mm fisheye', '50mm tilt-shift', '85mm soft', '100mm macro', '200mm tele', '400mm sniper', 'Varifocal', 'Pancake', 'Mirror lens'],
    colorGrade: ['Clean neutral', 'Soft pastels', 'High contrast B/W', 'Warm filmic', 'Cool tones', 'Vibrant colors', 'Monochrome', 'Sepia', 'Natural look', 'Artistic filter', 'Matte muted', 'Editorial glossy', 'Cinematic', 'Vintage', 'Modern', 'Retro', 'Futuristic', 'Earthy', 'Bright', 'Dark', 'Saturated', 'Desaturated', 'High key', 'Low key', 'Split tone', 'Duotone', 'Tri-tone', 'Color pop', 'Black and white', 'Infrared'],
    sound: ['Quiet room', 'City hush', 'Light breeze', 'Bird calls', 'Water trickle', 'Footsteps', 'Distant voices', 'Nature sounds', 'Ambient hum', 'Silent focus', 'Cafe murmur', 'Studio silence', 'Traffic noise', 'Construction', 'Music playing', 'Laughter', 'Applause', 'Whispers', 'Echoes', 'Reverberation', 'Wind howl', 'Rain patter', 'Thunder', 'Fire crackle', 'Water flow', 'Animal sounds', 'Machinery', 'Crowd chatter', 'Phone rings', 'Door bells'],
    sfx: ['Footsteps', 'Cloth rustle', 'Door close', 'Keys jingle', 'Paper shuffle', 'Water splash', 'Wind through trees', 'Distant siren', 'Camera shutter click', 'Soft breath', 'Bag zipper', 'Chair scrape', 'Pen scribble', 'Keyboard typing', 'Mouse click', 'Phone vibrate', 'Car horn', 'Bird chirp', 'Dog bark', 'Cat meow', 'Clock tick', 'Bell ring', 'Coin clink', 'Glass clink', 'Metal scrape', 'Wood creak', 'Plastic snap', 'Fabric tear', 'Paper crumple', 'Liquid pour', 'Footsteps on gravel', 'Footsteps on tile', 'Door latch click', 'Elevator ding', 'Bicycle bell', 'Match strike', 'Vinyl crackle'],
    music: ['Soft instrumental', 'Lo-fi beat', 'Ambient pad', 'Acoustic guitar', 'Piano underscore', 'Upbeat pop bed', 'Documentary score', 'No music', 'Warm jazz', 'Light electronica', 'Classical', 'Rock', 'Hip-hop', 'Electronic', 'Folk', 'Blues', 'Reggae', 'Country', 'Soul', 'Funk', 'Disco', 'Techno', 'House', 'Trance', 'Ambient', 'New age', 'World music', 'Orchestral', 'Choral', 'Vocal'],
    sig1: ['subtle vignette', 'fine grain', 'soft falloff', 'light halo', 'texture overlay', 'color correction', 'sharp focus', 'soft blur', 'highlight glow', 'shadow play', 'matte finish', 'gloss highlights', 'lens flare', 'depth blur', 'grain overlay', 'color bleed', 'motion trails', 'shadow play', 'highlight sparkle', 'texture weave', 'soft vignette', 'chromatic aberration', 'bokeh shapes', 'film scratches', 'light leaks', 'dust specks', 'water ripples', 'fire embers'],
    sig2: ['catchlights in eyes', 'gentle haze', 'depth layers', 'bokeh effect', 'film texture', 'light rays', 'reflection', 'silhouette', 'contrast boost', 'warm tint', 'soft vignette', 'flare line', 'halo effect', 'glow aura', 'sharp contrast', 'soft diffusion', 'reflection mirror', 'silhouette outline', 'warm tint', 'cool shadow', 'flare burst', 'grain noise', 'bloom glow', 'vignette fade', 'edge blur', 'focus shift', 'light scatter', 'texture grain'],
    weather: ['Clear', 'Sunny', 'Cloudy', 'Light rain', 'Snowy', 'Windy', 'Foggy', 'Overcast', 'Bright', 'Dull', 'Hazy', 'Misty', 'Stormy', 'Thunder', 'Lightning', 'Hail', 'Sleet', 'Frost', 'Dew', 'Humid', 'Dry', 'Breezy', 'Gusty', 'Calm', 'Tropical', 'Arid', 'Temperate', 'Polar', 'Equatorial', 'Monsoon'],
    lightInteraction: ['wraps softly', 'highlights features', 'creates shadows', 'diffuses evenly', 'casts glow', 'rim lights', 'fills evenly', 'spotlights', 'backlights', 'side lights', 'feathered edges', 'soft spill', 'dances on skin', 'pierces darkness', 'softens edges', 'creates halos', 'illuminates details', 'casts silhouettes', 'warms tones', 'cools blues', 'adds depth', 'highlights textures', 'creates contrast', 'blurs boundaries', 'enhances mood', 'defines shapes'],
    framingNotes: ['rule of thirds', 'center-framed', 'negative space', 'leading lines', 'balanced symmetry', 'tight crop', 'open composition', 'foreground framing'],
    environmentTexture: ['weathered', 'sterile', 'lush', 'sparse', 'cluttered', 'pristine', 'industrial', 'organic'],
    lightingIntensity: ['soft', 'dim', 'medium', 'harsh', 'glowing', 'punchy'],
    focusTarget: ['the subject', 'the face', 'the eyes', 'the hands', 'the object', 'the horizon', 'the backdrop'],
    // Movement presets
    movementSubjectType: ['Person', 'Object'],
    movement1: ['walks in', 'enters', 'moves into frame', 'is carried in', 'is wheeled in', 'is placed in frame', 'rolls in'],
    movement2: ['sits', 'stands', 'takes a seat', 'is set down', 'rests', 'moves out of frame'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'hesitant', 'deliberate'],
    movementManner: ['confidently', 'nervously', 'quietly', 'carefully', 'casually', 'gracefully', 'awkwardly'],
  },
  drone: {
    genre: ['Drone landscape', 'Aerial establishing', 'Travel aerial', 'Nature documentary', 'Architectural flyover', 'Coastal aerial', 'Mountain aerial', 'City skyline', 'Desert dunes', 'Forest canopy', 'Canyon reveal', 'River delta', 'Lakeside panorama', 'Snowy alpine', 'Volcanic terrain', 'Island coastline', 'Countryside mosaic', 'Night city aerial', 'Storm-chasing aerial', 'Golden hour landscape'],
    shot: ['Drone aerial', 'High-altitude establishing', 'Top-down bird\'s-eye', 'Low pass flyover', 'Orbit reveal', 'Parallax sweep', 'Tilt-down reveal', 'Rise-and-reveal', 'Push-in over terrain', 'Tracking along ridgeline', 'Coastline follow', 'River follow', 'Canyon glide', 'City skyline orbit', 'Architectural reveal', 'Time-lapse aerial'],
    role: ['mountain range', 'coastline cliffs', 'forest canopy', 'river canyon', 'desert dunes', 'city skyline', 'winding road', 'waterfall', 'glacier valley', 'historic architecture', 'modern skyline', 'coastal village', 'farmland patterns', 'lake shoreline', 'volcanic crater'],
    wardrobe: ['no people visible', 'clean landscape-only frame', 'natural textures emphasized', 'wet reflective surfaces', 'snow-covered peaks', 'autumn foliage', 'sunlit haze layers', 'mist in valleys', 'dusty heat shimmer', 'crisp winter air', 'long shadows', 'cloud shadows moving'],
    pose: ['waves crash against rocks', 'clouds roll over peaks', 'fog drifts through trees', 'traffic streams below', 'birds wheel in the distance', 'wind ripples grass', 'water glitters in sunlight', 'snow blows across ridges', 'rain sheets across the horizon'],
    mood: ['Expansive', 'Serene', 'Majestic', 'Adventurous', 'Minimal', 'Awe-inspiring', 'Quiet', 'Stormy', 'Mysterious', 'Crisp', 'Dreamy', 'Dramatic'],
    lighting: ['Golden hour', 'Blue hour', 'Overcast soft', 'Harsh midday sun', 'Sun shafts through clouds', 'Backlit glow', 'Storm light', 'Moonlit', 'Neon city glow', 'Fog-diffused'],
    environment: ['Coastal cliffs', 'Mountain ridge', 'Forest canopy', 'Canyon valley', 'Desert dunes', 'Urban skyline', 'Historic town', 'Island coastline', 'Frozen lake', 'Volcanic field', 'River delta', 'Countryside farms', 'Open ocean'],
    environmentTexture: ['lush', 'sparse', 'rocky', 'wind-swept', 'snowy', 'wet', 'dusty', 'misty', 'craggy', 'glassy', 'textured', 'pristine'],
    weather: ['Clear', 'Light haze', 'Foggy', 'Overcast', 'Storm front', 'Light rain', 'Snow flurry', 'Windy', 'Sunset clouds', 'Dramatic skies'],
    cameraMove: ['Slow flyover', 'Smooth orbit', 'Crane rise', 'Reveal push', 'Lateral strafe', 'Forward glide', 'Reverse pullback', 'Arc around landmark', 'Tilt-down reveal', 'Rise above treeline', 'Follow the coastline', 'Track along ridgeline'],
    lens: ['16mm ultra-wide', '24mm wide', '18mm wide', '35mm spherical', '50mm prime', 'Wide-angle drone lens'],
    colorGrade: ['Natural cinema', 'Warm golden', 'Cool teal', 'HDR bright', 'Muted filmic', 'Desaturated', 'Vibrant', 'Crisp contrast', 'Soft pastel', 'Neo-noir city'],
    sig1: ['atmospheric haze layers', 'parallax depth', 'subtle film grain', 'natural lens flare', 'heat shimmer', 'mist bands', 'sun rays'],
    sig2: ['wide panoramic feel', 'clean horizon line', 'crisp micro-contrast', 'soft vignette', 'bloom glow'],
    lightInteraction: ['wraps gently', 'cuts through haze', 'glitters on water', 'casts long shadows', 'diffuses softly', 'paints rim highlights', 'scatters in mist'],
    focusTarget: ['the horizon', 'the landscape', 'the ridgeline', 'the coastline', 'the skyline', 'the river bend', 'the canyon walls', 'the landmark', 'the sunlit valley'],
    sound: ['Low wind hum', 'Ocean waves', 'Birdsong', 'Distant city ambience', 'Rustling leaves', 'River rush', 'Rain patter', 'Thunder rumble', 'No dialogue', 'Insect chorus', 'Distant waterfall roar', 'Soft sand hiss', 'Ice crackle', 'Forest canopy hiss', 'Harbor ambience'],
    sfx: ['Drone pass-by', 'Wind gusts', 'Distant thunder', 'Waves crashing', 'Leaves rustle', 'City traffic bed', 'Camera shutter click', 'Prop wash flutter', 'Distant boat horn', 'Rockfall rumble', 'Snow crunch (distant)', 'Branch snap (distant)'],
    music: ['Ambient pad', 'Cinematic riser', 'Minimal synth pulse', 'No music', 'Orchestral swell', 'Lo-fi ambience'],
    framingNotes: ['rule of thirds', 'leading lines', 'negative space', 'layered depth', 'horizon placement', 'symmetry', 'foreground framing', 'strong vanishing point', 'wide panorama composition'],
    lightingIntensity: ['soft', 'dim', 'medium', 'harsh', 'glowing', 'punchy'],
    movementSubjectType: ['Camera', 'Object'],
    movement1: ['glides forward', 'orbits the landmark', 'rises above the treeline', 'tilts down to reveal the valley', 'tracks along the ridgeline', 'follows the coastline'],
    movement2: ['pulls back to a wide panorama', 'holds steady on the horizon', 'banks gently to reframe', 'descends toward the shoreline', 'arcs to reveal the skyline'],
    movementPace: ['slow', 'steady', 'brisk'],
    movementManner: ['smoothly', 'gently', 'cinematically', 'quietly'],
  },
  animation: {
    genre: ['Anime action', 'Pixar-style 3D', 'Hand-drawn 2D', 'Stop-motion cozy', 'Studio Ghibli vibe', 'Comic-book stylized', 'Claymation', 'Cel-shaded adventure', 'Retro cartoon', 'Fantasy animation', 'Sci-fi animation'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot', 'Panoramic sweep', 'Montage beat'],
    role: ['hero character', 'sidekick', 'villain', 'cute creature', 'robot companion', 'magical student', 'space pilot', 'wandering adventurer', 'mystic mentor', 'comic relief'],
    hairColor: ['black', 'brown', 'blonde', 'red', 'silver', 'white', 'neon pink', 'neon blue', 'multicolored'],
    eyeColor: ['brown', 'green', 'blue', 'gray', 'gold', 'violet', 'heterochromia'],
    bodyDescriptor: ['tall', 'short', 'slender', 'athletic build', 'chibi proportions', 'heroic silhouette', 'exaggerated proportions'],
    wardrobe: ['stylized outfit', 'school uniform', 'fantasy armor', 'retro jumpsuit', 'hoodie streetwear', 'flowing cloak', 'colorful costume', 'simple silhouette'],
    pose: ['expressive gesture', 'dynamic action pose', 'mid-leap', 'dramatic turn', 'running stance', 'hero landing', 'quiet contemplative pose'],
    mood: ['Whimsical', 'Energetic', 'Dreamy', 'Triumphant', 'Mysterious', 'Playful', 'Heartfelt', 'Epic'],
    lighting: ['Soft bounce', 'Golden hour', 'Neon rim light', 'Volumetric shafts', 'Moonlight', 'Studio key light', 'Painterly glow'],
    environment: ['Fantasy town', 'Neon city', 'Forest trail', 'Ancient temple', 'Space station', 'Coastal cliffs', 'Mountain cabin', 'Magical library', 'Toy workshop'],
    environmentTexture: ['painterly', 'cel-shaded', 'soft watercolor', 'hand-inked', 'clean vector', 'chunky clay texture', 'paper cutout texture'],
    lightingIntensity: ['soft', 'medium', 'glowing', 'punchy'],
    cameraMove: ['Slow push', 'Lateral dolly', 'Orbit reveal', 'Whip pan', 'Tilt up', 'Arc shot', 'Locked-off tableau'],
    lens: ['35mm spherical', '24mm wide', '50mm prime', 'Anamorphic 40mm', 'Stylized virtual camera'],
    focusTarget: ['the character', 'the face', 'the eyes', 'the hands', 'the magical object', 'the backdrop'],
    colorGrade: ['High saturation', 'Pastel dream', 'Vibrant colors', 'Matte pastel', 'Neo-noir cool', 'Warm golden', 'Toon-shaded'],
    weather: ['Clear', 'Soft rain', 'Snow flurry', 'Foggy morning', 'Starry night', 'Overcast'],
    lightInteraction: ['wraps gently', 'paints rim highlights', 'diffuses softly', 'creates halos', 'glitters on surfaces', 'casts glow'],
    sig1: ['hand-drawn linework', 'cel shading', 'painterly brush strokes', 'bouncy squash-and-stretch', 'clean outlines', 'vibrant color fills', 'soft glow effects', 'dynamic motion lines', 'expressive facial details', 'textured backgrounds'],
    sig2: ['stylized motion blur', 'sparkle particles', 'soft bloom', 'film grain (subtle)', 'comic halftone texture', 'light rays', 'color pop', 'dynamic lighting', 'shadow accents', 'vignette fade'],
    sound: ['Cartoon ambience', 'City bustle (stylized)', 'Forest ambience', 'Quiet room tone', 'No dialogue', 'Playful crowd walla', 'Retro arcade room tone', 'Toy workshop ambience', 'Windy rooftop ambience', 'Rain-on-window (stylized)', 'Sci-fi engine hum (soft)', 'Magical shimmer bed'],
    sfx: ['Whoosh transitions', 'Impact hit', 'Sparkle chimes', 'Footsteps', 'Magic shimmer', 'UI beeps', 'Boing bounce', 'Cartoon slide whistle', 'Pop sparkle', 'Comic punch thwack', 'Glitch blip', 'Energy zap', 'Page flip', 'Bubble pop', 'Chime stinger'],
    music: ['Upbeat orchestral', 'Lo-fi beat', 'Chiptune', 'Ambient pad', 'No music', 'Energetic pop', 'Cinematic adventure', 'Whimsical tune', 'Fantasy score', 'Retro synthwave'],
    framingNotes: ['rule of thirds', 'center-framed', 'dynamic diagonals', 'strong silhouettes', 'negative space'],
    movementSubjectType: ['Person', 'Object'],
    movement1: ['runs in', 'turns dramatically', 'jumps into frame', 'reaches out', 'spins'],
    movement2: ['lands and poses', 'stops and looks around', 'moves out of frame', 'smiles and waves'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried'],
    movementManner: ['confidently', 'playfully', 'dramatically', 'gracefully'],
  },
  nsfw: {
    genre: ['Boudoir', 'Art nude', 'Sensual portrait', 'Glam kink', 'Intimate scene', 'Erotic fantasy', 'Romantic encounter', 'Playful tease', 'Passionate moment', 'Tender embrace', 'Sultry editorial', 'Pin-up vintage', 'Soft erotic noir', 'Provocative fashion', 'Lingerie shoot', 'BDSM scene', 'Tantric pose', 'Fantasy roleplay', 'Steamy encounter', 'Seductive gaze', 'Nude art', 'Body worship', 'Sensual dance', 'Intimate touch', 'Erotic dream', 'Provocative tease', 'Romantic nude', 'Kinky fashion', 'Sultry noir', 'Playful nude'],
    shot: ['Intimate close-up', 'Half-body', 'Reclined pose', 'Over-shoulder', 'Mirror gaze', 'Full body nude', 'Sensual profile', 'Close embrace', 'Teasing glance', 'Dynamic pose', 'Soft profile', 'Bedside portrait', 'Silhouette nude', 'Body detail', 'Face close-up', 'Hand touch', 'Lip focus', 'Eye contact', 'Neckline', 'Curve accent', 'Pose dynamic', 'Reclined nude', 'Standing tease', 'Kneeling pose', 'Arms raised', 'Legs crossed', 'Back view', 'Side profile', 'Frontal nude', 'Partial reveal'],
    role: ['Muse', 'Lover', 'Dominant partner', 'Submissive partner', 'Seductress', 'Temptress', 'Admirer', 'Playmate', 'Confidant', 'Enchanter', 'Sir/Madam', 'Partner', 'Mistress', 'Slave', 'Goddess', 'Worshipper', 'Tease', 'Pleaser', 'Controller', 'Obeyer', 'Enchantress', 'Charmer', 'Flirt', 'Suitor', 'Paramour', 'Sweetheart', 'Darling', 'Beau', 'Belle', 'Heartthrob'],
    hairColor: ['black', 'dark brown', 'brown', 'auburn', 'red', 'blonde', 'platinum blonde', 'silver', 'white'],
    eyeColor: ['brown', 'hazel', 'green', 'blue', 'gray', 'amber', 'hazel with gold flecks',  'ice blue', 'deep green', 'smoky gray', 'golden amber', 'violet', 'heterochromia',  'emerald green', 'sapphire blue', 'chocolate brown', 'stormy gray', 'honey hazel'],
    bodyDescriptor: ['slender', 'athletic build', 'curvy build', 'lean build', 'muscular build', 'petite', 'plus-size', 'voluptuous', 'toned', 'soft curves', 'lithe', 'statuesque', 'willowy', 'fit', 'shapely', 'defined muscles', 'full-figured', 'svelte', 'compact', 'buxom', 'athletic curves'],
    mood: ['Sensual', 'Playful', 'Intense', 'Tender', 'Confident', 'Vulnerable', 'Bold', 'Shy', 'Passionate', 'Mysterious', 'Coy', 'Sultry', 'Dreamy', 'Seductive', 'Romantic', 'Erotic', 'Teasing', 'Intimate', 'Provocative', 'Alluring', 'Captivating', 'Enigmatic', 'Flirty', 'Sassy', 'Sultry', 'Voluptuous', 'Desirable', 'Irresistible', 'Magnetic', 'Enticing'],
    lighting: ['Soft amber', 'Low key shadows', 'Window dusk', 'Colored gels', 'Candle glow', 'Moonlight', 'Neon accent', 'Warm bedside', 'Dim ambient', 'Spotlight focus', 'Red velvet glow', 'Blue gel rim', 'Purple haze', 'Green envy', 'Pink blush', 'Gold shimmer', 'Silver sheen', 'Bronze glow', 'Copper tint', 'Rose petal', 'Lavender mist', 'Crimson passion', 'Emerald tease', 'Sapphire cool', 'Ruby heat', 'Diamond sparkle', 'Pearl soft', 'Onyx dark', 'Ivory warm', 'Ebony contrast'],
    environment: ['Velvet studio', 'Dim apartment', 'Hotel suite', 'Dark lounge', 'Backstage set', 'Silk bedroom', 'Luxury bath', 'Private garden', 'Cozy cabin', 'Urban loft', 'Boudoir set', 'Curtained corner', 'Mirror room', 'Candlelit chamber', 'Silk draped bed', 'Rose petal bath', 'Moonlit balcony', 'Fireplace glow', 'Jacuzzi steam', 'Sauna heat', 'Beach cabana', 'Forest glade', 'Mountain retreat', 'Desert tent', 'Island paradise', 'Castle tower', 'Submarine bubble', 'Space pod', 'Time machine', 'Dreamscape'],
    wardrobe: ['Silk robe', 'Lingerie set', 'Sheer mesh', 'Latex accent', 'Bare skin', 'Satin sheets', 'Lace lingerie', 'Nude silhouette', 'Bondage ropes', 'Elegant negligee', 'Body chain', 'Corset', 'Fishnets', 'Leather harness', 'Feather boa', 'Pearl necklace', 'Diamond earrings', 'Gold bracelet', 'Silver anklet', 'Velvet mask', 'Satin gloves', 'Lace stockings', 'Silk scarf', 'Fur stole', 'Chain collar', 'Rope bindings', 'Cufflinks', 'Tie clip', 'Pocket square', 'Belt buckle'],
    pose: ['Reclined', 'Arched back', 'Seated lean', 'Standing profile', 'Mirror pose', 'Kneeling softly', 'Arms outstretched', 'Head tilted', 'Body curved', 'Sensual stretch', 'Hand through hair', 'Sheet drape', 'Legs apart', 'Arms up', 'Back arched', 'Head back', 'Eyes closed', 'Lips parted', 'Hand on thigh', 'Finger trace', 'Body twist', 'Hip sway', 'Shoulder shrug', 'Neck crane', 'Toe point', 'Knee bend', 'Elbow rest', 'Wrist flick', 'Ankle cross', 'Fingers interlace'],
    lightInteraction: ['kisses edges', 'wraps softly', 'catches highlights', 'spills in neon', 'glows warmly', 'casts intimate shadows', 'highlights curves', 'creates mood', 'softens skin', 'accentuates form', 'traces curves', 'soft bloom', 'dances on skin', 'pierces darkness', 'softens edges', 'creates halos', 'illuminates details', 'casts silhouettes', 'warms tones', 'cools blues', 'adds depth', 'highlights textures', 'creates contrast', 'blurs boundaries', 'enhances mood', 'defines shapes'],
    weather: ['Indoor calm', 'Warm night', 'Cool breeze', 'Rainy window', 'Foggy mist', 'Sunny patio', 'Moonlit balcony', 'Stormy passion', 'Gentle wind', 'Cozy fire', 'Hazy neon', 'Soft mist', 'Thunder rumble', 'Lightning flash', 'Hail tap', 'Sleet chill', 'Frost sparkle', 'Dew glisten', 'Humid steam', 'Dry heat', 'Breezy whisper', 'Gusty howl', 'Calm serenity', 'Tropical sweat', 'Arid thirst', 'Temperate balance', 'Polar freeze', 'Equatorial heat', 'Monsoon pour'],
    cameraMove: ['Slow push', 'Static intimate', 'Drift closer', 'Gentle pan', 'Soft zoom', 'Circular reveal', 'Tilt focus', 'Pull away', 'Orbit slowly', 'Lock on gaze', 'Handheld sway', 'Slow dolly', 'Boom lift', 'Crane reveal', 'Dolly closer', 'Jib swing', 'Steadicam glide', 'Gimbal float', 'Freehand tease', 'Time-lapse build', 'Hyperlapse fade', 'Panning caress', 'Tilting gaze', 'Tracking follow', 'Following touch', 'Reveal curve', 'Uncover skin', 'Sweep body', 'Arc tease'],
    lens: ['85mm portrait', '50mm prime', '35mm intimate', '100mm close', 'Macro detail', 'Wide sensual', 'Telephoto tease', 'Standard nude', 'Artistic blur', 'Focus shift', 'Soft filter lens', 'Diffusion filter', '18-55 kit', '70-300 zoom', '10-22 ultra', '60mm macro', '300mm super', '8mm fisheye', '50mm tilt', '85mm soft', '100mm macro', '200mm tele', '400mm sniper', 'Varifocal', 'Pancake', 'Mirror lens'],
    colorGrade: ['Warm amber', 'Moody teal', 'Soft pastel', 'Deep red', 'Cool blue', 'Golden glow', 'Sepia nude', 'High contrast', 'Monochrome', 'Vibrant erotic', 'Soft rose', 'Velvet noir', 'Cinematic blue', 'Golden glow', 'Monochrome noir', 'Pastel dream', 'Harsh contrast', 'Soft lavender', 'Earthy tones', 'Electric neon', 'Retro VHS', 'Film negative', 'Polaroid fade', 'Kodachrome', 'Cineon log', 'ACES gamut', 'HDR bright', 'LUT custom', 'Teal orange', 'Blue gold'],
    sound: ['Muted room tone', 'Close breath', 'Soft whispers', 'Heartbeat rhythm', 'Silk rustle', 'Gentle moans', 'Ambient music', 'Rain patter', 'Wind sigh', 'Silent tension', 'Bed springs creak', 'Curtain rustle', 'Heartbeat thump', 'Breath gasp', 'Whisper secret', 'Moan soft', 'Rustle fabric', 'Creak wood', 'Patter rain', 'Sigh wind', 'Tension build', 'Springs squeak', 'Rustle silk', 'Drip water', 'Crackle fire', 'Hum low', 'Echo whisper', 'Pulse beat', 'Gasp sharp', 'Sigh deep'],
    sfx: ['Silk rustle', 'Slow footsteps', 'Leather creak', 'Soft chain clink', 'Door latch', 'Bed sheets shift', 'Breath close to mic', 'Rain on glass', 'Low bass throb', 'Candle crackle', 'Jewelry jingle', 'Soft gasp', 'Chain rattle', 'Leather snap', 'Silk slide', 'Footstep soft', 'Creak leather', 'Clink chain', 'Latch door', 'Shift sheets', 'Breath mic', 'Rain glass', 'Throb bass', 'Crackle candle', 'Jingle jewelry', 'Gasp soft', 'Rattle chain', 'Snap leather', 'Slide silk', 'Whisper echo', 'Zipper pull', 'Velvet brush', 'Perfume spray', 'Glass clink (soft)', 'Door lock click', 'Fabric slip'],
    music: ['Slow bass throb', 'Sensual R&B bed', 'Dark ambient', 'Minimal percussion', 'No music', 'Sultry lounge', 'Jazz seduction', 'Electronic pulse', 'Folk whisper', 'Blues moan', 'Reggae sway', 'Soul groove', 'Funk tease', 'Disco heat', 'Techno beat', 'House rhythm', 'Trance wave', 'Ambient drift', 'New age calm', 'World fusion', 'Orchestral build', 'Choral hum', 'Vocal sigh', 'Instrumental caress', 'Percussive tease', 'Symphonic rise', 'Trip-hop glide', 'Indie whisper', 'Heavy pulse', 'Classical touch'],
    sig1: ['soft skin bloom', 'delicate grain', 'bokeh orbs', 'light caress', 'texture play', 'glow effect', 'shadow dance', 'highlight trail', 'blur soft', 'focus intimate', 'powder shimmer', 'soft glow', 'lens flare', 'depth blur', 'grain overlay', 'color bleed', 'motion trails', 'shadow play', 'highlight sparkle', 'texture weave', 'soft vignette', 'chromatic aberration', 'bokeh shapes', 'film scratches', 'light leaks', 'dust specks', 'water ripples', 'fire embers'],
    sig2: ['rim highlight', 'mirror glint', 'depth sensual', 'flare erotic', 'grain texture', 'bokeh hearts', 'reflection tease', 'silhouette edge', 'warm haze', 'cool mist', 'veil silhouette', 'rose tint', 'halo effect', 'glow aura', 'sharp contrast', 'soft diffusion', 'reflection mirror', 'silhouette outline', 'warm tint', 'cool shadow', 'flare burst', 'grain noise', 'bloom glow', 'vignette fade', 'edge blur', 'focus shift', 'light scatter', 'texture grain'],
    framingNotes: ['rule of thirds', 'center-framed', 'negative space', 'leading lines', 'balanced symmetry', 'tight crop', 'open composition', 'foreground framing'],
    environmentTexture: ['weathered', 'sterile', 'lush', 'sparse', 'cluttered', 'pristine', 'industrial', 'organic', 'velvet', 'silk', 'leather', 'lace', 'wooden', 'metallic', 'glassy', 'textured', 'plush'],
    lightingIntensity: ['soft', 'dim', 'medium', 'harsh', 'glowing', 'punchy'],
    focusTarget: ['the subject', 'the face', 'the eyes', 'the hands', 'the object', 'the horizon', 'the backdrop'],
    // Additional NSFW-specific options
    position: ['reclined on bed', 'standing against wall', 'kneeling before partner', 'sitting on lap', 'lying on floor', 'bent over table', 'on all fours', 'straddling partner', 'pinned beneath', 'dominating from above', 'side by side', 'spooning intimately', 'face to face', 'back to chest', 'legs wrapped around', 'hands bound above', 'blindfolded and waiting', 'tied to bedpost', 'suspended in air', 'floating in water', 'pressed against glass', 'in shower steam', 'on velvet couch', 'in candlelit bath', 'on silk sheets', 'in dungeon chains', 'on beach sand', 'in forest clearing', 'on mountain ledge', 'in spaceship pod'],
    activity: ['kissing passionately', 'touching erotically', 'caressing skin', 'embracing tightly', 'whispering sweet nothings', 'moaning softly', 'breathing heavily', 'arching in pleasure', 'closing eyes in ecstasy', 'biting lip seductively', 'running fingers through hair', 'pressing bodies close', 'grinding rhythmically', 'thrusting deeply', 'stroking tenderly', 'licking slowly', 'sucking gently', 'biting playfully', 'spanking firmly', 'tying restraints', 'blindfolding partner', 'teasing with feather', 'pleasuring orally', 'climaxing together', 'resting in afterglow', 'exploring with hands', 'massaging sensually', 'dancing provocatively', 'stripping slowly', 'revealing skin', 'undressing partner', 'worshipping body', 'admiring curves', 'tracing tattoos', 'kissing neck', 'nibbling ear', 'sucking fingers', 'licking collarbone', 'biting shoulder', 'spanking thigh'],
    accessory: ['handcuffs gleaming', 'silk rope bindings', 'velvet blindfold', 'feather tickler', 'ice cube trail', 'candle wax drips', 'leather whip', 'wooden paddle', 'vibrator buzzing', 'dildo realistic', 'anal plug', 'collar with leash', 'latex mask', 'high heels clicking', 'fishnet stockings', 'corset laced tight', 'bondage harness', 'nipple clamps', 'ball gag', 'flogger tails', 'metal chains', 'leather cuffs', 'belt looped', 'silk scarf', 'gloves caressing', 'thigh-high boots', 'fedora tilted', 'diamond necklace', 'perfume intoxicating', 'massage oil glistening', 'condoms scattered', 'lube bottle', 'toys displayed', 'restraints ready', 'blindfold adjusted', 'candle lit', 'ice bucket', 'whip coiled', 'paddle hanging', 'vibrator charging'],
    fetish: ['bondage play', 'dominance submission', 'roleplay fantasy', 'sensory deprivation', 'impact play', 'temperature play', 'wax play', 'ice play', 'feather torture', 'tickling game', 'breath play', 'choking light', 'hair pulling', 'biting marks', 'scratching nails', 'spanking red', 'flogging rhythm', 'caning stripes', 'paddling firm', 'whipping sting', 'electro play', 'vibration tease', 'anal exploration', 'oral worship', 'foot fetish', 'latex fetish', 'leather fetish', 'rubber fetish', 'nylon fetish', 'silk fetish', 'fur fetish', 'feather fetish', 'food play', 'chocolate smeared', 'whipped cream', 'honey drizzled', 'fruit teasing', 'wine spilled', 'oil massage', 'milk bath'],
    bodyFocus: ['breasts heaving', 'nipples erect', 'waist curved', 'hips swaying', 'buttocks firm', 'thighs toned', 'calves flexed', 'feet arched', 'toes curled', 'hands gripping', 'fingers digging', 'lips parted', 'tongue teasing', 'eyes locked', 'hair tousled', 'neck exposed', 'shoulders tense', 'back arched', 'stomach taut', 'pubic area', 'inner thighs', 'armpits sensitive', 'ears whispered to', 'eyebrows raised', 'cheeks flushed', 'nose nuzzled', 'chin lifted', 'collarbone kissed', 'ribs visible', 'navel pierced', 'hips grinding', 'knees weak', 'ankles bound', 'wrists restrained', 'palms open', 'fingertips tracing', 'knuckles white', 'elbows bent', 'forearms flexed', 'biceps bulging'],
    sensation: ['warm skin contact', 'cool air breeze', 'soft fabric caress', 'rough texture rub', 'wet tongue lick', 'hot breath exhale', 'cold ice melt', 'sharp teeth nip', 'gentle finger trace', 'firm hand grip', 'light feather tickle', 'heavy weight press', 'slippery oil glide', 'sticky honey pull', 'vibrating toy buzz', 'pulsing rhythm', 'throbbing heat', 'tingling electricity', 'stinging impact', 'soothing massage', 'arousing tease', 'climaxing wave', 'afterglow warmth', 'sensitive touch', 'erogenous zone', 'pleasure point', 'pain pleasure mix', 'sensory overload', 'deprivation heighten', 'blindfold darkness', 'earplug silence', 'nose clip scent', 'taste deprivation', 'touch isolation', 'sound muffled', 'light blocked', 'temperature extreme', 'pressure intense', 'friction build', 'release sudden'],
    // Movement presets
    //TODO: Customize these for NSFW context that show only when NSFW is Selected
    movementSubjectType: ['Person', 'Object', 'Animal', 'Fantasy Creature', 'Mythical Being', 'Robot', 'Alien', 'Doll', 'Puppet', 'Statue', 'Toy', 'Inanimate Object', 'Partner', 'Lover', 'Body', 'Limb', 'Gaze', 'Touch', 'Pose', 'Silhouette', 'Shadow', 'Reflection', 'Caress', 'Embrace', 'Whisper', 'Breath', 'Pulse', 'Heat', 'Desire', 'Intimacy', 'Seduction', 'Temptation', 'Allure', 'Passion', 'Tenderness', 'Boldness', 'Shyness', 'Playfulness', 'Teasing', 'Urgency', 'Deliberation', 'Hesitation', 'Confidence', 'Nervousness', 'Quietude', 'Carefulness', 'Casualness', 'Gracefulness', 'Awkwardness'],
    movement1: ['walks in', 'enters', 'moves into frame', 'is carried in', 'is wheeled in', 'is placed in frame', 'rolls in', 'crawls in', 'slithers in', 'flies in', 'glides in', 'materializes', 'emerges', 'appears suddenly', 'is lifted in', 'is pushed in', 'is pulled in', 'is dragged in', 'is tossed in', 'is spun in', 'is rolled in', 'is tumbled in', 'saunters in seductively', 'struts in confidently', 'tiptoes in quietly', 'rushes in urgently', 'ambles in relaxed', 'bounds in energetically', 'drifts in lazily', 'marches in determinedly', 'wanders in aimlessly', 'slides in smoothly', 'twirls into frame', 'leaps in dramatically', 'sneaks in covertly', 'bursts in excitedly', 'meanders in thoughtfully', 'advances in intently', 'retreats into frame', 'approaches in curiously', 'invades the space', 'occupies the frame', 'fills the view', 'dominates the entrance', 'commands attention', 'beckons invitingly', 'beckons teasingly', 'beckons urgently', 'beckons playfully', 'beckons seductively', 'beckons intimately', 'beckons passionately', 'beckons tenderly', 'beckons boldly', 'beckons shyly', 'beckons eagerly', 'beckons reluctantly', 'beckons smoothly', 'beckons hesitantly', 'beckons deliberately', 'beckons quickly', 'beckons slowly', 'beckons lightly', 'beckons heavily', 'beckons softly', 'beckons firmly', 'beckons gently', 'beckons abruptly', 'beckons fluidly', 'beckons stiffly', 'beckons lively', 'beckons sluggishly'],
    movement2: ['sits', 'stands', 'takes a seat', 'is set down', 'rests', 'moves out of frame', 'lies down', 'reclines', 'crouches', 'kneels', 'rises slowly', 'stands up', 'gets up', 'stretches out', 'turns away', 'walks out', 'exits frame', 'disappears', 'fades away', 'is lifted out', 'is pushed out', 'is pulled out', 'is dragged out', 'is tossed out', 'is spun out', 'is rolled out', 'is tumbled out', 'is carried out', 'reclines seductively', 'poses intimately', 'leans back enticingly', 'stretches languidly', 'arches invitingly', 'curls up warmly', 'sprawls comfortably', 'perches delicately', 'settles in cozily', 'lounges luxuriously', 'drapes elegantly', 'nests snugly', 'huddles closely', 'snuggles affectionately', 'embraces tightly', 'clasps hands', 'intertwines fingers', 'presses close', 'nuzzles softly', 'whispers intimately', 'breathes heavily', 'pulses with heat', 'radiates desire', 'glows with passion', 'shimmers in light', 'casts alluring shadows', 'reflects seductively', 'touches gently', 'caresses softly', 'strokes tenderly', 'explores curiously', 'lingers intimately', 'withdraws slowly', 'beckons invitingly', 'beckons teasingly', 'beckons urgently', 'beckons playfully', 'beckons seductively', 'beckons intimately', 'beckons passionately', 'beckons tenderly', 'beckons boldly', 'beckons shyly', 'beckons eagerly', 'beckons reluctantly', 'beckons smoothly', 'beckons hesitantly', 'beckons deliberately', 'beckons quickly', 'beckons slowly', 'beckons lightly', 'beckons heavily', 'beckons softly', 'beckons firmly', 'beckons gently', 'beckons abruptly', 'beckons fluidly', 'beckons stiffly', 'beckons lively', 'beckons sluggishly'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'hesitant', 'deliberate', 'leisurely', 'quick', 'urgent', 'casual', 'measured', 'fluid', 'jerky', 'graceful', 'awkward', 'smooth', 'stiff', 'lively', 'sluggish', 'energetic', 'teasingly slow', 'urgently', 'playfully', 'seductively', 'provocatively', 'intimately', 'passionately', 'tenderly', 'boldly', 'shyly', 'confidently', 'nervously', 'quietly', 'carefully', 'casually', 'gracefully', 'awkwardly', 'dramatically', 'subtly', 'intensely', 'lazily', 'energetically', 'thoughtfully', 'curiously', 'determinedly', 'aimlessly', 'smoothly', 'abruptly', 'gradually', 'suddenly', 'rhythmically', 'erratically', 'fluidly', 'staccato'],
    movementManner: ['confidently', 'nervously', 'quietly', 'carefully', 'casually', 'gracefully', 'awkwardly', 'sensually', 'playfully', 'boldly', 'shyly', 'eagerly', 'reluctantly', 'smoothly', 'hesitantly', 'deliberately', 'quickly', 'slowly', 'lightly', 'heavily', 'softly', 'firmly', 'gently', 'abruptly', 'fluidly', 'stiffly', 'lively', 'sluggishly', 'seductively', 'provocatively', 'intimately', 'passionately', 'tenderly', 'boldly', 'shyly', 'playfully', 'teasingly', 'urgently', 'deliberately', 'hesitantly', 'briskly', 'hurriedly', 'steadily', 'slowly', 'dramatically', 'subtly', 'intensely', 'lazily', 'energetically', 'thoughtfully', 'curiously', 'determinedly', 'aimlessly', 'smoothly', 'abruptly', 'gradually', 'suddenly', 'rhythmically', 'erratically', 'fluidly', 'staccato'],
  },
};

const STEPS = Array.from({ length: 17 }, (_, i) => i + 1);

const PRONOUNS = ['They', 'He', 'She', 'I', 'We'];
const DIALOGUE_VERBS = ['says', 'whispers', 'murmurs', 'growls', 'shouts', 'laughs', 'breathes'];

const MULTI_SELECT_FIELDS = new Set<string>([
  'bodyDescriptor',
  'sound',
  'sfx',
  'music',
  'sig1',
  'sig2',
  'position',
  'activity',
  'accessory',
  'fetish',
  'bodyFocus',
  'sensation',
]);

const STEP_FIELDS: Record<number, string[]> = {
  1: [],
  2: ['genre', 'shot', 'framingNotes'],
  3: ['role', 'wardrobe', 'hairColor', 'eyeColor', 'bodyDescriptor'],
  4: ['pose', 'mood'],
  5: ['movementSubjectType', 'movementSubjectLabel', 'movement1', 'movement2', 'actions'],
  6: ['lighting', 'environment', 'environmentTexture', 'lightingIntensity'],
  7: ['cameraMove', 'lens', 'focusTarget'],
  8: ['colorGrade', 'weather'],
  9: ['lightInteraction'],
 10: ['sig1', 'sig2'],
 11: ['sound', 'sfx'],
 12: ['music', 'mix_notes'],
 13: ['dialogue', 'pronoun'],
 14: ['dialogue_verb'],
 15: ['position', 'activity', 'accessory', 'explicit_abilities', 'body_description'],
 16: ['fetish', 'bodyFocus', 'sensation', 'sexual_description'],
 17: [],
};

const TEMPLATES: Record<ModeId, { name: string; fields: Record<string, string> }[]> = {
  cinematic: [],
  classic: [],
  drone: [],
  animation: [],
  nsfw: [],
};

const detailLabelFor = (value: number) => (value < 35 ? 'Minimal' : value > 65 ? 'Rich' : 'Balanced');
const audioLabelFor = (value: number) => (value < 40 ? 'Sparse' : value > 60 ? 'Detailed' : 'Balanced');

type CinematicData = {
  genre_style: string;
  shot_type: string;
  subject_traits: string;
  subject_role: string;
  pose_action: string;
  wardrobe: string;
  prop_action: string;
  prop_weapon: string;
  hair_face_detail: string;
  sig1: string;
  sig2: string;
  environment: string;
  environment_texture?: string;
  weather: string;
  lighting: string;
  lighting_intensity?: string;
  light_interaction: string;
  sound: string;
  sfx: string;
  music: string;
  mix_notes: string;
  dialogue: string;
  pronoun: string;
  dialogue_verb: string;
  mood: string;
  lens: string;
  color_grade: string;
  framing_notes?: string;
  film_details: string;
  camera_move: string;
  focus_target: string;
  explicit_abilities?: string;
  body_description?: string;
  sexual_description?: string;
};

type ClassicData = {
  genre: string;
  shot: string;
  subject: string;
  wardrobe: string;
  environment: string;
  environment_texture?: string;
  time: string;
  lighting: string;
  lighting_intensity?: string;
  atmosphere: string;
  camera: string;
  palette: string;
  action: string;
  audio: string;
  sfx: string;
  music: string;
  mix_notes: string;
  dialogue: string;
  avoid: string;
  framing_notes?: string;
  focus_target?: string;
};

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [mode, setMode] = useState<ModeId>('cinematic');
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    { cinematic: {}, classic: {}, drone: {}, animation: {}, nsfw: {} }
  );
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchPrompts, setBatchPrompts] = useState<string[]>([]);
  const [presetCreatorOpen, setPresetCreatorOpen] = useState(false);
  const [newPresetMode, setNewPresetMode] = useState<ModeId>('cinematic');
  const [newPresetField, setNewPresetField] = useState('');
  const [newPresetOptions, setNewPresetOptions] = useState('');
  const [favorites, setFavorites] = useState<Favorites>({});
  const [history, setHistory] = useState<History>({});
  const [lockedSteps, setLockedSteps] = useState<LockedSteps>({});
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>(DEFAULT_OLLAMA_SETTINGS);
  const [ollamaExpanding, setOllamaExpanding] = useState(false);
  const [ollamaResult, setOllamaResult] = useState<string>('');
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [ollamaAvailableModels, setOllamaAvailableModels] = useState<string[]>([]);
  const [ollamaLoadingModels, setOllamaLoadingModels] = useState(false);
  const [ollamaSidePanelOpen, setOllamaSidePanelOpen] = useState(false);
  const [ollamaOriginalPrompt, setOllamaOriginalPrompt] = useState<string>('');
  const [ollamaPulling, setOllamaPulling] = useState(false);
  const [ollamaPullProgress, setOllamaPullProgress] = useState<string>('');
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [introStage, setIntroStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [introBase, setIntroBase] = useState<'film' | 'photo' | 'adult' | null>(null);
  const [introCinematicFlavor, setIntroCinematicFlavor] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState<ModeId>('cinematic');
  const [settingsField, setSettingsField] = useState('genre');
  const [newOption, setNewOption] = useState('');
  const [bulkOptions, setBulkOptions] = useState('');
  const [settingsFilter, setSettingsFilter] = useState('');
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [optionSets, setOptionSets] = useState<OptionSets>(DEFAULT_OPTION_SETS);
  const [uiPrefs, setUiPrefs] = useState<UiPrefs>(DEFAULT_UI_PREFS);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [editorTone, setEditorTone] = useState<Tone>('balanced');
  const [visualEmphasis, setVisualEmphasis] = useState(60);
  const [audioEmphasis, setAudioEmphasis] = useState(60);
  const [batchCount, setBatchCount] = useState(3);
  const didHydrateRef = useRef(false);
  const didHydrateOptionSetsRef = useRef(false);
  useEffect(() => {
    // Load persisted settings after mount to avoid SSR/CSR hydration mismatches.
    const loadedOptionSets = loadOptionSets();
    if (loadedOptionSets) {
      setOptionSets(mergeOptionSets(DEFAULT_OPTION_SETS, loadedOptionSets));
    }
    const loadedUiPrefs = loadUiPrefs();
    if (loadedUiPrefs) {
      setUiPrefs(loadedUiPrefs);
    }
    const loadedProjects = loadProjects();
    if (loadedProjects) {
      setProjects(loadedProjects);
    }
    const loadedFavorites = loadFavorites();
    if (loadedFavorites) {
      setFavorites(loadedFavorites);
    }
    const loadedHistory = loadHistory();
    if (loadedHistory) {
      setHistory(loadedHistory);
    }
    const loadedLockedSteps = loadLockedSteps();
    if (loadedLockedSteps) {
      setLockedSteps(loadedLockedSteps);
    }
    const loadedOllamaSettings = loadOllamaSettings();
    if (loadedOllamaSettings) {
      setOllamaSettings(loadedOllamaSettings);
      // Fetch models if Ollama is enabled
      if (loadedOllamaSettings.enabled) {
        fetchOllamaModels();
      }
    }
    // Load prompt history
    try {
      const saved = window.localStorage.getItem('ltx_prompter_prompt_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPromptHistory(parsed.slice(-10));
        }
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!didHydrateOptionSetsRef.current) {
      didHydrateOptionSetsRef.current = true;
      return;
    }
    saveOptionSets(optionSets);
  }, [optionSets]);

  useEffect(() => {
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }
    saveUiPrefs(uiPrefs);
  }, [uiPrefs]);

  useEffect(() => {
    if (projects.length === 0) return;
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveLockedSteps(lockedSteps);
  }, [lockedSteps]);

  useEffect(() => {
    saveOllamaSettings(ollamaSettings);
  }, [ollamaSettings]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 1600);
  }, []);

  const selects = useMemo(() => optionSets[mode] || {}, [optionSets, mode]);
  const current = useMemo(() => values[mode] || {}, [values, mode]);
  const fieldValue = useCallback((field: string) => current[field] ?? '', [current]);

  const examplePlaceholder = useCallback((opts: string[], fallback = 'Pick or type…') => {
    const first = (opts || []).find(Boolean);
    return first ? `e.g., ${first}` : fallback;
  }, []);

  const captureWordTitle = useMemo(() => {
    const w = uiPrefs.captureWord || 'shot';
    return `${w.slice(0, 1).toUpperCase()}${w.slice(1)}`;
  }, [uiPrefs.captureWord]);

  const stepTitle = useCallback((n: number) => {
    switch (n) {
      case 1: return 'Let’s set you up';
      case 2: return `Genre & ${captureWordTitle}`;
      case 3: return mode === 'drone' ? 'Focus & surface detail' : 'Role & wardrobe';
      case 4: return mode === 'drone' ? 'Motion & mood' : 'Pose & mood';
      case 5: return 'Action beats';
      case 6: return 'Lighting & environment';
      case 7: return 'Camera & lens';
      case 8: return 'Grade & weather';
      case 9: return 'Light interaction';
      case 10: return mode === 'animation' ? 'Style signatures' : 'Signatures';
      case 11: return 'Ambient & SFX';
      case 12: return 'Music & mix';
      case 13: return mode === 'drone' ? 'Optional narration' : 'Dialogue & speaker';
      case 14: return 'Delivery';
      case 15: return 'NSFW abilities & body';
      case 16: return 'NSFW expression';
      case 17: return 'Review & build';
      default: return `Step ${n}`;
    }
  }, [captureWordTitle, mode]);

  const summary = useMemo(() => ({ ...current, mode }), [current, mode]);

  useEffect(() => {
    // Ensure the mode bucket exists, but do not auto-fill defaults.
    setValues((prev) => ({
      ...prev,
      [mode]: prev[mode] || {},
    }));
  }, [mode]);

  const handleSelect = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [field]: value },
    }));
    addToHistory(mode, field, value);
  };

  const handleInput = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [field]: value },
    }));
  };

  const listIdFor = (field: string) => `list-${mode}-${field}`;

  const topOptions = useCallback((field: string, max = 4) => {
    const list = selects[field] || [];
    return list.slice(0, max);
  }, [selects]);

  const renderPickOrType = (field: string) => {
    const nsfwFields = ['position', 'activity', 'accessory', 'fetish', 'bodyFocus', 'sensation'];
    const options = nsfwFields.includes(field) ? (optionSets['nsfw']?.[field] || []) : (selects[field] || []);
    return (
      <PickOrTypeField
        ariaLabel={labelForField(field, uiPrefs.captureWord, mode)}
        value={fieldValue(field)}
        placeholder={examplePlaceholder(options)}
        listId={listIdFor(field)}
        options={options}
        multi={MULTI_SELECT_FIELDS.has(field)}
        onChange={(v) => handleInput(field, v)}
        mode={mode}
        field={field}
        favorites={favorites}
        history={history}
      />
    );
  };

  const renderLabel = useCallback(
    (text: string, tooltip?: string, keySeed?: string) => (
      <span className="field-label">
        {text}
        {keySeed && MULTI_SELECT_FIELDS.has(keySeed) ? (
          <span className="field-multi" aria-label="Multi-select field">
            Multi-select
          </span>
        ) : null}
        {tooltip ? (
          <span className="field-tip" tabIndex={0} aria-label={tooltip}>
            ?
            <span role="tooltip" className="field-tip-bubble">
              {tooltip}
            </span>
          </span>
        ) : null}
      </span>
    ),
    []
  );

  const canAdvance = () => {
    if (step === 1 && introStage < 5) return false;
    if (step === 1 && mode === 'nsfw' && !nsfwEnabled) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (introStage < 5) {
        setIntroStage((s) => (s < 5 ? ((s + 1) as any) : s));
        return;
      }
      // onboarding complete → proceed into the wizard
      setStep(2);
      return;
    }
    if (!canAdvance()) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handleBack = () => {
    if (step === 1 && introStage > 0) {
      setIntroStage((s) => (s > 0 ? ((s - 1) as any) : s));
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  useEffect(() => {
    // Apply onboarding answers to mode/NSFW.
    if (!introBase) return;
    if (introBase === 'adult') {
      setMode('nsfw');
      setNsfwEnabled(true);
      return;
    }
    // film/photo both map to cinematic/classic depending on flavor.
    if (introCinematicFlavor) setMode('cinematic');
    else setMode('classic');
  }, [introBase, introCinematicFlavor]);

  const prompt = useMemo(() => {
    // Apply tone to mood field if not explicitly set
    const workingValues = { ...values };
    const current = workingValues[mode] || {};
    const toneMap: Record<Tone, string> = {
      melancholic: 'Melancholic',
      balanced: '',
      energetic: 'Energetic',
      dramatic: 'Dramatic',
    };
    if (!current.mood && editorTone !== 'balanced') {
      workingValues[mode] = { ...current, mood: toneMap[editorTone] };
    }

    // Derive detail level from visual emphasis
    const derivedDetailLevel = visualEmphasis < 35 ? 'minimal' : visualEmphasis > 65 ? 'rich' : 'balanced';

    return buildPrompt(
      mode,
      workingValues,
      nsfwEnabled,
      optionSets,
      uiPrefs.captureWord,
      uiPrefs.promptFormat,
      derivedDetailLevel,
      audioEmphasis > 40,  // autoFillAudio: true if > 40%
      uiPrefs.autoFillCamera
    );
  }, [mode, values, nsfwEnabled, optionSets, uiPrefs.captureWord, uiPrefs.promptFormat, uiPrefs.autoFillCamera, editorTone, visualEmphasis, audioEmphasis]);

  const [previewAnimTick, setPreviewAnimTick] = useState(0);
  useEffect(() => {
    setPreviewAnimTick((n) => n + 1);
  }, [prompt]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--preview-scale', `${uiPrefs.previewFontScale || 1}`);
    root.style.setProperty('--preview-line-height', uiPrefs.previewFontScale > 1.05 ? '1.5' : '1.35');
    return () => {
      root.style.removeProperty('--preview-scale');
      root.style.removeProperty('--preview-line-height');
    };
  }, [uiPrefs.previewFontScale]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (ctrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (e.shiftKey) randomizeAll(); else randomizeStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode]);

  const randomPick = (list: string[]) => {
    const clean = (list || []).filter(Boolean);
    if (!clean.length) return '';
    const idx = Math.floor(Math.random() * clean.length);
    return clean[idx];
  };

  const isStepLocked = (stepNum: number) => {
    const modeSteps = lockedSteps[mode] || [];
    return modeSteps[stepNum - 1] === true;
  };

  const toggleStepLock = (stepNum: number) => {
    setLockedSteps((prev) => {
      const next = { ...prev };
      const modeSteps = [...(next[mode] || [])];
      modeSteps[stepNum - 1] = !modeSteps[stepNum - 1];
      next[mode] = modeSteps;
      return next;
    });
    showToast(isStepLocked(stepNum) ? `Unlocked step ${stepNum}` : `Locked step ${stepNum}`);
  };

  const optionsForField = (field: string) => {
    if (field === 'pronoun') return PRONOUNS;
    if (field === 'dialogue_verb') return DIALOGUE_VERBS;
    return selects[field] || [];
  };

  const randomizeFields = (fields: string[]) => {
    setValues((prev) => {
      const next = { ...prev };
      const bucket = { ...next[mode] };
      for (const f of fields) {
        const picked = randomPick(optionsForField(f));
        if (picked) bucket[f] = picked;
      }
      next[mode] = bucket;
      return next;
    });
  };

  const randomizeStep = () => {
    const fields = STEP_FIELDS[step] || [];
    if (!fields.length) return;
    if (isStepLocked(step)) {
      showToast(`Step ${step} is locked`);
      return;
    }
    randomizeFields(fields);
    showToast('Randomized this step');
  };

  const randomizeAll = () => {
    // Get all fields from unlocked steps only
    const unlockedFields: string[] = [];
    for (let stepNum = 1; stepNum <= STEPS.length; stepNum++) {
      if (!isStepLocked(stepNum)) {
        const fields = STEP_FIELDS[stepNum] || [];
        unlockedFields.push(...fields);
      }
    }
    if (unlockedFields.length === 0) {
      showToast('All steps are locked');
      return;
    }
    randomizeFields(unlockedFields);
    showToast('Randomized all unlocked steps');
  };

  const resetCurrentStep = () => {
    const fields = STEP_FIELDS[step] || [];
    if (!fields.length) return;
    setValues((prev) => {
      const next = { ...prev };
      const bucket = { ...next[mode] };
      for (const f of fields) {
        delete bucket[f];
      }
      next[mode] = bucket;
      return next;
    });
    showToast('Cleared this step');
  };

  // Tool: Apply template
  const applyTemplate = (template: { name: string; fields: Record<string, string> }) => {
    setValues((prev) => {
      const next = { ...prev };
      const bucket = { ...next[mode] };
      for (const [field, value] of Object.entries(template.fields)) {
        bucket[field] = value;
      }
      next[mode] = bucket;
      return next;
    });
    // Navigate to step 2 to show filled fields
    setStep(2);
    showToast(`Loaded template: ${template.name}`);
    setTemplatesOpen(false);
  };

  // Tool: Generate batch prompts
  const generateBatchPrompts = (count: number) => {
    const prompts: string[] = [];
    const fieldsToVary = Object.values(STEP_FIELDS)
      .flat()
      .filter((f) => (selects[f] || []).length > 1);
    if (fieldsToVary.length === 0) {
      showToast('Add more field variations to generate batch');
      return;
    }
    
    // Derive detail level and audio emphasis from live editing controls
    const derivedDetailLevel = visualEmphasis < 35 ? 'minimal' : visualEmphasis > 65 ? 'rich' : 'balanced';
    const enableAudioFill = audioEmphasis > 40;
    
    for (let i = 0; i < count; i++) {
      const tmpValues = { ...values[mode] };
      // Apply tone if not set
      const toneMap: Record<Tone, string> = {
        melancholic: 'Melancholic',
        balanced: '',
        energetic: 'Energetic',
        dramatic: 'Dramatic',
      };
      if (!tmpValues.mood && editorTone !== 'balanced') {
        tmpValues.mood = toneMap[editorTone];
      }
      
      // Randomize one field per prompt
      const fieldToVary = fieldsToVary[Math.floor(Math.random() * fieldsToVary.length)];
      const options = selects[fieldToVary] || [];
      if (options.length > 0) {
        tmpValues[fieldToVary] = options[Math.floor(Math.random() * options.length)];
      }
      
      // Generate prompt with varied values and live editing controls
      const batchedPrompt = buildPrompt(
        mode,
        { [mode]: tmpValues },
        nsfwEnabled,
        optionSets,
        uiPrefs.captureWord,
        uiPrefs.promptFormat,
        derivedDetailLevel,
        enableAudioFill,
        uiPrefs.autoFillCamera
      );
      prompts.push(batchedPrompt);
    }
    setBatchPrompts(prompts);
    setBatchOpen(false);
    showToast(`Generated ${count} prompt variations`);
  };

  // Tool: Add prompt to history
  const addToPromptHistory = (prompt: string) => {
    setPromptHistory((prev) => [
      { text: prompt, timestamp: new Date().toISOString(), mode },
      ...prev.slice(0, 9),
    ]);
    try {
      const history = [
        { text: prompt, timestamp: new Date().toISOString(), mode },
        ...promptHistory.slice(0, 9),
      ];
      window.localStorage.setItem('ltx_prompter_prompt_history_v1', JSON.stringify(history));
    } catch {
      // ignore
    }
  };

  // Tool: Ollama prompt expansion
  const fetchOllamaModels = async () => {
    if (!ollamaSettings.enabled) return;
    
    setOllamaLoadingModels(true);
    try {
      const response = await fetch(`${ollamaSettings.apiEndpoint}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const modelNames = (data.models || []).map((m: any) => m.name);
      setOllamaAvailableModels(modelNames);
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      setOllamaAvailableModels([]);
    } finally {
      setOllamaLoadingModels(false);
    }
  };

  const pullOllamaModelAndRetry = async (modelName: string) => {
    setOllamaPulling(true);
    setOllamaPullProgress('Starting download…');
    try {
      const response = await fetch(`${ollamaSettings.apiEndpoint}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pull failed: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim());
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.status) {
                setOllamaPullProgress(json.status);
              }
            } catch {
              // ignore
            }
          }
        }
      }

      await fetchOllamaModels();
      setOllamaSettings((p) => ({ ...p, model: modelName }));
      setOllamaError(null);
      showToast('Model installed — retrying expansion');
      await expandWithOllama();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error during model pull';
      setOllamaError(msg);
      showToast(`Pull error: ${msg}`);
    } finally {
      setOllamaPulling(false);
      setOllamaPullProgress('');
    }
  };

  const unloadOllamaModel = async (modelName: string) => {
    try {
      await fetch(`${ollamaSettings.apiEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          keep_alive: 0, // Unload immediately
        }),
      });
    } catch (error) {
      console.error('Failed to unload model:', error);
    }
  };

  const expandWithOllama = async () => {
    if (!ollamaSettings.enabled) {
      showToast('Ollama is not enabled. Enable it in Tools → Settings.');
      return;
    }
    if (!prompt) {
      showToast('No prompt to expand');
      return;
    }

    // Optionally refresh model list in background; don't block or false-negative if stale
    fetchOllamaModels();

    setOllamaOriginalPrompt(prompt);
    setOllamaExpanding(true);
    setOllamaError(null);
    setOllamaResult('');
    setOllamaSidePanelOpen(true);

    try {
      const response = await fetch(`${ollamaSettings.apiEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaSettings.model,
          messages: [
            {
              role: 'system',
              content: ollamaSettings.systemInstructions,
            },
            {
              role: 'user',
              content: `Original prompt: ${prompt}\n\nPlease expand this prompt with vivid details, atmospheric elements, and creative enhancements while maintaining its core intent and style.`,
            },
          ],
          stream: true,
          options: {
            temperature: ollamaSettings.temperature,
          },
          keep_alive: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

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
                setOllamaResult(accumulatedText);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      showToast('Prompt expanded successfully');
      
      // Unload model after completion
      setTimeout(() => {
        unloadOllamaModel(ollamaSettings.model);
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to Ollama';
      setOllamaError(errorMsg);
      showToast(`Ollama error: ${errorMsg}`);
    } finally {
      setOllamaExpanding(false);
    }
  };

  const applyOllamaResult = () => {
    if (!ollamaResult) return;
    navigator.clipboard.writeText(ollamaResult);
    showToast('Expanded prompt copied to clipboard');
  };

  // Project management
  const createProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const project: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      mode,
      nsfwEnabled,
      values,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects((prev) => [project, ...prev]);
    setCurrentProjectId(project.id);
    setNewProjectName('');
    showToast(`Created project: ${name}`);
  };

  const saveCurrentProject = () => {
    if (!currentProjectId) {
      createProject();
      return;
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? { ...p, mode, nsfwEnabled, values, updatedAt: Date.now() }
          : p
      )
    );
    showToast('Project saved');
  };

  const loadProject = (project: Project) => {
    setMode(project.mode);
    setNsfwEnabled(project.nsfwEnabled);
    setValues(project.values);
    setCurrentProjectId(project.id);
    setProjectsOpen(false);
    showToast(`Loaded: ${project.name}`);
  };

  const deleteProject = (id: string) => {
    const ok = window.confirm('Delete this project?');
    if (!ok) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
    showToast('Project deleted');
  };

  const exportProject = (project: Project) => {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported');
  };

  // Backup & Restore - export/import entire app data
  const exportAllAppData = () => {
    const bundle = {
      version: 1,
      timestamp: new Date().toISOString(),
      optionSets,
      uiPrefs,
      projects,
      favorites,
      history,
      lockedSteps,
      ollamaSettings,
      promptHistory,
    };
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ltx_prompter_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported');
  };

  const importAllAppData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Basic shape checks
        if (data.optionSets) {
          setOptionSets(mergeOptionSets(DEFAULT_OPTION_SETS, data.optionSets));
        }
        if (data.uiPrefs) {
          // Trust and set; save effect will persist
          setUiPrefs({ ...DEFAULT_UI_PREFS, ...data.uiPrefs });
        }
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (data.favorites) setFavorites(data.favorites);
        if (data.history) setHistory(data.history);
        if (data.lockedSteps) setLockedSteps(data.lockedSteps);
        if (data.ollamaSettings) setOllamaSettings({ ...DEFAULT_OLLAMA_SETTINGS, ...data.ollamaSettings });
        if (Array.isArray(data.promptHistory)) setPromptHistory(data.promptHistory);
        showToast('Backup restored');
      } catch {
        showToast('Restore failed');
      }
    };
    input.click();
  };

  const importProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const project: Project = JSON.parse(text);
        project.id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        project.createdAt = Date.now();
        project.updatedAt = Date.now();
        setProjects((prev) => [project, ...prev]);
        showToast(`Imported: ${project.name}`);
      } catch {
        showToast('Import failed');
      }
    };
    input.click();
  };

  // Favorites
  const toggleFavorite = (targetMode: ModeId, field: string, value: string) => {
    setFavorites((prev) => {
      const next = { ...prev };
      next[targetMode] = next[targetMode] || {};
      next[targetMode][field] = next[targetMode][field] || [];
      const list = [...next[targetMode][field]];
      const idx = list.indexOf(value);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(value);
      }
      next[targetMode][field] = list;
      return next;
    });
  };

  const isFavorite = (targetMode: string, field: string, value: string) => {
    return (favorites[targetMode]?.[field] || []).includes(value);
  };

  // History
  const addToHistory = (targetMode: string, field: string, value: string) => {
    if (!value.trim()) return;
    setHistory((prev) => {
      const next = { ...prev };
      next[targetMode] = next[targetMode] || {};
      const list = next[targetMode][field] || [];
      const filtered = list.filter((v) => v !== value);
      next[targetMode][field] = [value, ...filtered].slice(0, 10);
      return next;
    });
  };

  const getHistory = (targetMode: string, field: string) => {
    return history[targetMode]?.[field] || [];
  };

  // Preset Creator
  const createPreset = () => {
    const field = newPresetField.trim();
    const options = newPresetOptions
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!field || !options.length) return;
    updateOptionList(newPresetMode, field, (prev) => [...options, ...prev]);
    setNewPresetField('');
    setNewPresetOptions('');
    showToast(`Preset created: ${field}`);
  };

  const resetWizard = () => {
    const ok = window.confirm('Reset wizard and start over?');
    if (!ok) return;
    setValues(() => ({ cinematic: {}, classic: {}, drone: {}, animation: {}, nsfw: {} }));
    setStep(1);
    setIntroStage(0);
    setIntroBase(null);
    setNsfwEnabled(false);
    setMode('cinematic');
    showToast('Wizard reset');
  };

  // Suggest next fields to fill based on step
  const suggestedFields = useMemo(() => {
    const stepFields = STEP_FIELDS[step] || [];
    const current = values[mode] || {};
    const unfilled = stepFields.filter((f) => !current[f] || !(current[f] || '').trim());
    return unfilled.slice(0, 3); // Show top 3 unfilled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode, values]);

  const ltx2Checklist = useMemo(() => {
    if (uiPrefs.promptFormat !== 'ltx2') return [] as string[];
    const items: string[] = [];

    const actions = (current.actions || '').trim();
    const hasAnyVisual = Boolean(
      fieldValue('genre').trim() ||
      fieldValue('shot').trim() ||
      fieldValue('role').trim() ||
      fieldValue('environment').trim() ||
      fieldValue('lighting').trim()
    );
    const hasAnyAudio = Boolean(
      fieldValue('sound').trim() ||
      fieldValue('sfx').trim() ||
      fieldValue('music').trim() ||
      (current.mix_notes || '').trim() ||
      (current.dialogue || '').trim()
    );

    if (!actions) items.push('Core Actions: add a simple timeline (what happens over time).');
    if (!hasAnyVisual) items.push('Visual Details: add at least genre/shot/role/environment/lighting.');
    if (!hasAnyAudio) items.push('Audio: add ambience, SFX, and/or dialogue.');

    return items;
  }, [uiPrefs.promptFormat, current.actions, current.dialogue, current.mix_notes, fieldValue]);

  useEffect(() => {
    if (step !== STEPS.length) return;
    if (!uiPrefs.autoCopyOnReview) return;
    void copyPrompt(prompt).then(() => showToast('Copied prompt'));
  }, [step, uiPrefs.autoCopyOnReview, prompt, showToast]);

  const settingsFields = useMemo(() => {
    const set = optionSets[settingsMode] || {};
    const keys = Object.keys(set);
    return keys.length ? keys.sort() : Object.keys(DEFAULT_OPTION_SETS[settingsMode]).sort();
  }, [optionSets, settingsMode]);

  const updateOptionList = (
    targetMode: ModeId,
    field: string,
    updater: (prev: string[]) => string[]
  ) => {
    setOptionSets((prev) => {
      const prevMode = prev[targetMode] || {};
      const prevList = prevMode[field] || [];
      const nextList = normalizeOptions(updater(prevList));
      return {
        ...prev,
        [targetMode]: {
          ...prevMode,
          [field]: nextList,
        },
      };
    });
  };

  const addOneOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    const existing = optionSets[settingsMode]?.[settingsField] || [];
    const already = existing.some((v) => v.toLowerCase() === trimmed.toLowerCase());
    if (already) {
      showToast('Already in this list');
      return;
    }
    updateOptionList(settingsMode, settingsField, (prev) => [trimmed, ...prev]);
    setNewOption('');
    setSettingsFilter(trimmed);
    setRecentlyAdded(trimmed);
    window.setTimeout(() => setRecentlyAdded(null), 1400);
    showToast('Added to list');
  };

  const addBulkOptions = () => {
    const lines = bulkOptions
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) return;
    const existing = new Set((optionSets[settingsMode]?.[settingsField] || []).map((v) => v.toLowerCase()));
    const uniqueLines: string[] = [];
    for (const line of lines) {
      const key = line.toLowerCase();
      if (existing.has(key)) continue;
      if (uniqueLines.some((v) => v.toLowerCase() === key)) continue;
      uniqueLines.push(line);
    }
    if (!uniqueLines.length) {
      showToast('Nothing new to add');
      return;
    }
    updateOptionList(settingsMode, settingsField, (prev) => [...uniqueLines, ...prev]);
    setBulkOptions('');
    setSettingsFilter(uniqueLines[0]);
    setRecentlyAdded(uniqueLines[0]);
    window.setTimeout(() => setRecentlyAdded(null), 1400);
    showToast(`Added ${uniqueLines.length} ${uniqueLines.length === 1 ? 'option' : 'options'}`);
  };

  const removeOption = (value: string) => {
    updateOptionList(settingsMode, settingsField, (prev) => prev.filter((v) => v !== value));
  };

  const resetModeToDefaults = () => {
    setOptionSets((prev) => ({
      ...prev,
      [settingsMode]: DEFAULT_OPTION_SETS[settingsMode],
    }));
  };

  const resetUiPrefs = () => {
    setUiPrefs(DEFAULT_UI_PREFS);
  };

  return (
    <main className="wizard-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-title">LTXV Prompt Creator</div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-group">
              <label className="step-selector" aria-label="Jump to step">
                <span className="step-label">Step</span>
                <select value={String(step)} onChange={(e) => setStep(Number(e.target.value))} aria-label="Jump to step">
                  {STEPS.map((n) => (
                    <option key={n} value={String(n)}>Step {n} — {stepTitle(n)}</option>
                  ))}
                </select>
              </label>
              <label className="step-selector" aria-label="Select mode">
                <span className="step-label">Mode</span>
                <select
                  value={mode}
                  onChange={(e) => {
                    const next = e.target.value as ModeId;
                    setMode(next);
                    setSettingsMode(next);
                  }}
                  aria-label="Select mode"
                >
                  {MODES.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="topbar-group">
              <button
                className="icon-btn"
                type="button"
                title="Randomize this step"
                onClick={randomizeStep}
              >
                🎲
              </button>
              <button
                className={`icon-btn ${isStepLocked(step) ? 'locked' : ''}`}
                type="button"
                title={isStepLocked(step) ? "Unlock this step from randomization" : "Lock this step from randomization"}
                onClick={() => toggleStepLock(step)}
              >
                {isStepLocked(step) ? '🔒' : '🔓'}
              </button>
              <button
                className="icon-btn"
                type="button"
                title="Randomize all steps"
                onClick={randomizeAll}
              >
                🔀
              </button>
              <button
                className="icon-btn"
                type="button"
                title="Reset this step"
                onClick={resetCurrentStep}
              >
                ↶
              </button>
              <button
                className="icon-btn"
                type="button"
                title="Reset entire wizard"
                onClick={resetWizard}
              >
                ⟲
              </button>
            </div>

            <div className="topbar-group">
              <button
                className="ghost"
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
              >
                {previewOpen ? '⊘ Hide Preview' : '✓ Show Preview'}
              </button>
              <button
                className="icon-btn"
                type="button"
                aria-label="Open projects"
                title="Projects"
                onClick={() => setProjectsOpen(true)}
              >
                📁
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setPresetCreatorOpen(true)}
              >
                Create Preset
              </button>
              <button
                className="icon-btn"
                type="button"
                aria-label="Open settings"
                title="Settings"
                onClick={() => {
                  setSettingsMode(mode);
                  setSettingsField('genre');
                  setSettingsOpen(true);
                }}
              >
                ⚙️
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setTemplatesOpen(true)}
              >
                Templates
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setBatchOpen(true)}
              >
                Batch
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setHistoryOpen(true)}
              >
                History
              </button>
            </div>

            <div className="topbar-group">
              <button
                className="ghost"
                type="button"
                onClick={expandWithOllama}
                disabled={ollamaExpanding}
              >
                {ollamaExpanding ? 'Expanding...' : 'Ollama Expand'}
              </button>
              <span className="ollama-model-indicator" aria-live="polite" title="Current Ollama model">
                Model: {ollamaSettings.model}
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="topbar-spacer" aria-hidden="true" />



      {projectsOpen && (
        <div className="settings-overlay" onMouseDown={() => setProjectsOpen(false)}>
          <div className="settings-panel projects-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Projects</p>
                <h3 className="settings-title">Manage projects</h3>
                <p className="hint">Save and load your work. Export/import JSON files.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setProjectsOpen(false)}>Close</button>
            </div>

            <div className="projects-actions">
              <div className="settings-add">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="New project name"
                  aria-label="New project name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createProject();
                  }}
                />
                <button className="primary" type="button" onClick={createProject}>Create</button>
              </div>
              <button className="ghost" type="button" onClick={saveCurrentProject}>
                Save Current
              </button>
              <button className="ghost" type="button" onClick={importProject}>
                Import JSON
              </button>
            </div>

            <div className="projects-list">
              {projects.length === 0 && (
                <div className="empty-state">
                  <p>No projects yet. Create one to save your work.</p>
                </div>
              )}
              {projects.map((proj) => (
                <div key={proj.id} className={`project-card ${currentProjectId === proj.id ? 'active' : ''}`}>
                  <div className="project-info">
                    <div className="project-name">{proj.name}</div>
                    <div className="project-meta">
                      {labelForMode(proj.mode)} • {new Date(proj.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="project-actions">
                    <button className="ghost" type="button" onClick={() => loadProject(proj)}>Load</button>
                    <button className="ghost" type="button" onClick={() => exportProject(proj)}>Export</button>
                    <button className="ghost" type="button" onClick={() => deleteProject(proj.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {presetCreatorOpen && (
        <div className="settings-overlay" onMouseDown={() => setPresetCreatorOpen(false)}>
          <div className="settings-panel preset-creator-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Preset Creator</p>
                <h3 className="settings-title">Create custom preset</h3>
                <p className="hint">Define a new field or add options to an existing field.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setPresetCreatorOpen(false)}>Close</button>
            </div>

            <div className="settings-body">
              <div className="settings-left">
                <label className="field">
                  <span>Mode</span>
                  <select value={newPresetMode} onChange={(e) => setNewPresetMode(e.target.value as any)}>
                    <option value="cinematic">Cinematic</option>
                    <option value="classic">Classic</option>
                    <option value="drone">Drone / Landscape</option>
                    <option value="animation">Animation</option>
                    <option value="nsfw">NSFW</option>
                  </select>
                </label>

                <label className="field">
                  <span>Field name</span>
                  <input
                    type="text"
                    value={newPresetField}
                    onChange={(e) => setNewPresetField(e.target.value)}
                    placeholder="e.g., genre, mood, lighting"
                    aria-label="Field name"
                  />
                </label>

                <label className="field">
                  <span>Options (one per line)</span>
                  <textarea
                    value={newPresetOptions}
                    onChange={(e) => setNewPresetOptions(e.target.value)}
                    rows={10}
                    placeholder={'One option per line\nSci-fi thriller\nPeriod drama\nHeist sequence'}
                    aria-label="Preset options"
                  />
                </label>

                <button className="primary" type="button" onClick={createPreset}>
                  Create Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-overlay" onMouseDown={() => setSettingsOpen(false)}>
          <div className="settings-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Settings</p>
                <h3 className="settings-title">Preset options</h3>
                <p className="hint">Add, remove, and customize dropdown options. Saved locally.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setSettingsOpen(false)}>
                Close
              </button>
            </div>

            <div className="settings-summary-row" aria-label="Current settings overview">
              <div className="summary-chip">Capture word: {uiPrefs.captureWord}</div>
              <div className="summary-chip">Format: {uiPrefs.promptFormat === 'ltx2' ? 'LTX-2' : 'Paragraph'}</div>
              <div className="summary-chip">Detail: {detailLabelFor(visualEmphasis)}</div>
              <div className="summary-chip">Audio: {audioLabelFor(audioEmphasis)}</div>
              <div className="settings-summary-actions">
                <button className="ghost tiny" type="button" onClick={resetUiPrefs}>Reset UI</button>
                <button className="ghost tiny" type="button" onClick={resetModeToDefaults}>Reset mode list</button>
              </div>
            </div>

            <div className="settings-tabs">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`tab ${settingsMode === m.id ? 'active' : ''}`}
                  onClick={() => {
                    setSettingsMode(m.id as ModeId);
                    setSettingsField('genre');
                  }}
                >
                  {labelForMode(m.id)}
                </button>
              ))}
            </div>

            <div className="settings-body">
              <div className="settings-left">
                <div className="settings-experience">
                  <div className="settings-experience-head">
                    <p className="eyebrow">Experience</p>
                    <p className="hint">Tune the vibe.</p>
                  </div>

                  <label className="field">
                    <span>Use the word</span>
                    <select
                      value={uiPrefs.captureWord}
                      onChange={(e) =>
                        setUiPrefs((p) => ({ ...p, captureWord: e.target.value as CaptureWord }))
                      }
                      aria-label="Capture wording preference"
                    >
                      <option value="shot">Shot</option>
                      <option value="video">Video</option>
                      <option value="clip">Clip</option>
                      <option value="frame">Frame</option>
                    </select>
                  </label>

                  <div className="settings-experience-row">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={uiPrefs.autoCopyOnReview}
                        onChange={(e) => setUiPrefs((p) => ({ ...p, autoCopyOnReview: e.target.checked }))}
                        aria-label="Auto-copy prompt on review"
                      />
                      <span className="slider" />
                    </label>
                    <div>
                      <div className="toggle-title">Auto-copy on Review</div>
                      <div className="toggle-note">Copies the prompt when you reach Step 12.</div>
                    </div>
                  </div>

                  <label className="field">
                    <span>Prompt format</span>
                    <select
                      value={uiPrefs.promptFormat}
                      onChange={(e) =>
                        setUiPrefs((p) => ({ ...p, promptFormat: e.target.value as PromptFormat }))
                      }
                      aria-label="Prompt format"
                    >
                      <option value="ltx2">LTX-2 (Core Actions / Visual / Audio)</option>
                      <option value="paragraph">Paragraph (legacy)</option>
                    </select>
                  </label>

                  <div className="settings-experience-head">
                    <p className="eyebrow">Live editing</p>
                    <p className="hint">Dial richness and auto-fill gaps.</p>
                  </div>

                  <label className="field">
                    <span>Detail level</span>
                    <select
                      value={uiPrefs.detailLevel}
                      onChange={(e) =>
                        setUiPrefs((p) => ({ ...p, detailLevel: e.target.value as DetailLevel }))
                      }
                      aria-label="Detail level for prompts"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="balanced">Balanced</option>
                      <option value="rich">Rich</option>
                    </select>
                  </label>

                  <div className="settings-experience-row">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={uiPrefs.autoFillAudio}
                        onChange={(e) => setUiPrefs((p) => ({ ...p, autoFillAudio: e.target.checked }))}
                        aria-label="Auto-fill audio cues"
                      />
                      <span className="slider" />
                    </label>
                    <div>
                      <div className="toggle-title">Auto-fill audio</div>
                      <div className="toggle-note">Backfills ambience/SFX/music when blank.</div>
                    </div>
                  </div>

                  <div className="settings-experience-row">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={uiPrefs.autoFillCamera}
                        onChange={(e) => setUiPrefs((p) => ({ ...p, autoFillCamera: e.target.checked }))}
                        aria-label="Auto-fill camera movement"
                      />
                      <span className="slider" />
                    </label>
                    <div>
                      <div className="toggle-title">Auto camera moves</div>
                      <div className="toggle-note">Keeps motion language present if empty.</div>
                    </div>
                  </div>

                  <label className="field">
                    <span>Preview font scale ({uiPrefs.previewFontScale.toFixed(2)}x)</span>
                    <input
                      type="range"
                      min="0.9"
                      max="1.2"
                      step="0.05"
                      value={uiPrefs.previewFontScale}
                      onChange={(e) => setUiPrefs((p) => ({ ...p, previewFontScale: parseFloat(e.target.value) }))}
                      aria-label="Preview font scale"
                    />
                  </label>

                  <div className="settings-divider" />

                  <div className="settings-experience-head">
                    <p className="eyebrow">Quick tone</p>
                    <p className="hint">Preset moods for the current scene.</p>
                  </div>

                  <div className="quick-tone-buttons">
                    {(['melancholic', 'balanced', 'energetic', 'dramatic'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`tone-btn ${editorTone === t ? 'active' : ''}`}
                        onClick={() => setEditorTone(t)}
                        title={`Set mood to ${t}`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  <label className="field">
                    <span>Visual detail ({visualEmphasis}%)</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={visualEmphasis}
                      onChange={(e) => setVisualEmphasis(Number(e.target.value))}
                      aria-label="Visual detail emphasis"
                    />
                    <div className="range-hint">
                      {visualEmphasis < 35 ? 'Minimal' : visualEmphasis > 65 ? 'Rich' : 'Balanced'}
                    </div>
                  </label>

                  <label className="field">
                    <span>Audio inclusion ({audioEmphasis}%)</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={audioEmphasis}
                      onChange={(e) => setAudioEmphasis(Number(e.target.value))}
                      aria-label="Audio detail emphasis"
                    />
                    <div className="range-hint">
                      {audioEmphasis < 40 ? 'Sparse' : audioEmphasis > 60 ? 'Detailed' : 'Balanced'}
                    </div>
                  </label>
                </div>

                <div className="settings-divider" />

                <div className="settings-experience-head">
                  <p className="eyebrow">Ollama Integration</p>
                  <p className="hint">Expand prompts using local AI.</p>
                </div>

                <div className="settings-experience-row">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={ollamaSettings.enabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setOllamaSettings((p) => ({ ...p, enabled }));
                        if (enabled) {
                          fetchOllamaModels();
                        }
                      }}
                      aria-label="Enable Ollama integration"
                    />
                    <span className="slider" />
                  </label>
                  <div>
                    <div className="toggle-title">Enable Ollama</div>
                    <div className="toggle-note">Use Ollama to expand and enhance prompts.</div>
                  </div>
                </div>

                {ollamaSettings.enabled && (
                  <>
                    <label className="field">
                      <span>API Endpoint</span>
                      <input
                        type="text"
                        value={ollamaSettings.apiEndpoint}
                        onChange={(e) => setOllamaSettings((p) => ({ ...p, apiEndpoint: e.target.value }))}
                        onBlur={fetchOllamaModels}
                        placeholder="http://localhost:11434"
                        aria-label="Ollama API endpoint"
                      />
                    </label>

                    <label className="field">
                      <div className="field-header-with-action">
                        <span>Model</span>
                        <button
                          type="button"
                          className="ghost small"
                          onClick={fetchOllamaModels}
                          disabled={ollamaLoadingModels}
                          title="Refresh available models"
                        >
                          {ollamaLoadingModels ? '⟳ Loading...' : '🔄 Refresh'}
                        </button>
                      </div>
                      {ollamaAvailableModels.length > 0 ? (
                        <select
                          value={ollamaSettings.model}
                          onChange={(e) => setOllamaSettings((p) => ({ ...p, model: e.target.value }))}
                          aria-label="Select Ollama model"
                        >
                          {ollamaAvailableModels.map((modelName) => (
                            <option key={modelName} value={modelName}>
                              {modelName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={ollamaSettings.model}
                          onChange={(e) => setOllamaSettings((p) => ({ ...p, model: e.target.value }))}
                          placeholder="llama2"
                          aria-label="Ollama model name"
                        />
                      )}
                    </label>

                    <label className="field">
                      <span>Temperature ({ollamaSettings.temperature.toFixed(1)})</span>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={ollamaSettings.temperature}
                        onChange={(e) => setOllamaSettings((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                        aria-label="Ollama temperature"
                      />
                      <div className="range-hint">
                        {ollamaSettings.temperature < 0.5 ? 'Conservative' : ollamaSettings.temperature > 1.5 ? 'Creative' : 'Balanced'}
                      </div>
                    </label>

                    <label className="field">
                      <div className="field-header-with-action">
                        <span>System Instructions</span>
                        <button
                          type="button"
                          className="ghost small"
                          onClick={() => setOllamaSettings((p) => ({ ...p, systemInstructions: DEFAULT_OLLAMA_SETTINGS.systemInstructions }))}
                          title="Reset to default Creative Assistant spec"
                        >
                          Reset to default
                        </button>
                      </div>
                      <textarea
                        value={ollamaSettings.systemInstructions}
                        onChange={(e) => setOllamaSettings((p) => ({ ...p, systemInstructions: e.target.value }))}
                        rows={6}
                        placeholder="Guidelines for how Ollama should expand your prompts. Use the default for the Creative Assistant spec."
                        aria-label="Ollama system instructions"
                      />
                      <div className="settings-actions">
                        <button
                          type="button"
                          className="ghost small"
                          onClick={() => setOllamaSettings((p) => ({
                            ...p,
                            apiEndpoint: DEFAULT_OLLAMA_SETTINGS.apiEndpoint,
                            model: DEFAULT_OLLAMA_SETTINGS.model,
                            temperature: DEFAULT_OLLAMA_SETTINGS.temperature,
                            systemInstructions: DEFAULT_OLLAMA_SETTINGS.systemInstructions,
                          }))}
                          title="Restore Ollama endpoint, model, temperature, and instructions to defaults"
                        >
                          Restore Ollama Defaults
                        </button>
                      </div>
                    </label>
                  </>
                )}

                <div className="settings-divider" />

                <label className="field">
                  <span>Which list do you want to edit?</span>
                  <select
                    value={settingsField}
                    onChange={(e) => setSettingsField(e.target.value)}
                    aria-label="Select which preset list to edit"
                  >
                    {settingsFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="settings-add">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add a new option (press Enter)"
                    aria-label="Add a new preset option"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addOneOption();
                    }}
                  />
                  <button className="primary" type="button" onClick={addOneOption}>
                    Add
                  </button>
                </div>

                <details className="settings-bulk">
                  <summary>Bulk add (one per line)</summary>
                  <textarea
                    value={bulkOptions}
                    onChange={(e) => setBulkOptions(e.target.value)}
                    rows={6}
                    aria-label="Bulk add preset options"
                    placeholder={'One option per line\nExample:\nSoft mist\nNeon rain\nDreamy bokeh'}
                  />
                  <div className="settings-bulk-actions">
                    <button className="ghost" type="button" onClick={addBulkOptions}>
                      Add lines
                    </button>
                    <button className="ghost" type="button" onClick={() => setBulkOptions('')}>
                      Clear
                    </button>
                  </div>
                </details>

                {suggestedFields.length > 0 && (
                  <div className="suggested-fields">
                    <p className="eyebrow">Next to fill</p>
                    <div className="suggested-list">
                      {suggestedFields.map((field) => (
                        <div key={field} className="suggested-item">
                          <span className="field-label">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="settings-divider" />

                <div className="settings-actions">
                  <button className="ghost" type="button" onClick={exportAllAppData} title="Export all app data to JSON">
                    Backup All
                  </button>
                  <button className="ghost" type="button" onClick={importAllAppData} title="Restore from a backup JSON file">
                    Restore Backup
                  </button>
                </div>

                <div className="settings-actions">
                  <button className="ghost" type="button" onClick={resetModeToDefaults}>
                    Reset this mode to defaults
                  </button>
                </div>
              </div>

              <div className="settings-right">
                <div className="settings-list">
                  <div className="settings-add">
                    <input
                      type="text"
                      value={settingsFilter}
                      onChange={(e) => setSettingsFilter(e.target.value)}
                      placeholder="Filter options…"
                      aria-label="Filter preset options"
                    />
                    <button className="ghost" type="button" onClick={() => setSettingsFilter('')}>Clear</button>
                  </div>
                  {(optionSets[settingsMode]?.[settingsField] || []).filter((v) => {
                    const q = (settingsFilter || '').trim().toLowerCase();
                    if (!q) return true;
                    return v.toLowerCase().includes(q);
                  }).map((v) => (
                    <div key={v} className={`chip-row ${recentlyAdded === v ? 'just-added' : ''}`}>
                      <button
                        className={`fav-star ${isFavorite(settingsMode, settingsField, v) ? 'active' : ''}`}
                        type="button"
                        onClick={() => toggleFavorite(settingsMode, settingsField, v)}
                        aria-label={`${isFavorite(settingsMode, settingsField, v) ? 'Unfavorite' : 'Favorite'} ${v}`}
                      >
                        ★
                      </button>
                      <div className="chip">{v}</div>
                      <button className="ghost" type="button" onClick={() => removeOption(v)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {templatesOpen && (
        <div className="settings-overlay" onMouseDown={() => setTemplatesOpen(false)}>
          <div className="settings-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Quick Templates</p>
                <h3 className="settings-title">Load a preset scenario</h3>
                <p className="hint">Templates fill multiple fields with sensible defaults.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setTemplatesOpen(false)}>Close</button>
            </div>
            <div className="settings-body">
              <div className="template-grid">
                {(TEMPLATES[mode] || []).map((template) => (
                  <button
                    key={template.name}
                    className="template-card"
                    type="button"
                    onClick={() => applyTemplate(template)}
                  >
                    <strong>{template.name}</strong>
                    <span className="hint">{Object.keys(template.fields).length} fields</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Generator Modal */}
      {batchOpen && (
        <div className="settings-overlay" onMouseDown={() => setBatchOpen(false)}>
          <div className="settings-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Batch Generator</p>
                <h3 className="settings-title">Create prompt variations</h3>
                <p className="hint">Generate multiple prompts with randomized fields.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setBatchOpen(false)}>Close</button>
            </div>
            <div className="settings-body">
              <div className="batch-settings-info">
                <div className="batch-info-row">
                  <span className="batch-label">Tone:</span>
                  <span className="batch-value">{editorTone.charAt(0).toUpperCase() + editorTone.slice(1)}</span>
                </div>
                <div className="batch-info-row">
                  <span className="batch-label">Visual detail:</span>
                  <span className="batch-value">{visualEmphasis < 35 ? 'Minimal' : visualEmphasis > 65 ? 'Rich' : 'Balanced'}</span>
                </div>
                <div className="batch-info-row">
                  <span className="batch-label">Audio fill:</span>
                  <span className="batch-value">{audioEmphasis > 40 ? 'Enabled' : 'Minimal'}</span>
                </div>
              </div>
              
              <label className="field">
                <span>Number of variations</span>
                <select value={batchCount} onChange={(e) => setBatchCount(Math.max(1, Math.min(10, parseInt(e.target.value))))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button className="primary" type="button" onClick={() => generateBatchPrompts(batchCount)}>
                Generate {batchCount} Prompts
              </button>
              {batchPrompts.length > 0 && (
                <div className="batch-results">
                  <div className="batch-results-header">
                    <p className="eyebrow">{batchPrompts.length} Generated Prompts</p>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        batchPrompts.forEach((p) => addToPromptHistory(p));
                        setBatchPrompts([]);
                        showToast(`Saved ${batchPrompts.length} prompts to history`);
                      }}
                    >
                      Save All to History
                    </button>
                  </div>
                  <div className="batch-items-grid">
                    {batchPrompts.map((prompt, idx) => (
                      <div key={idx} className="batch-item-compact">
                        <div className="batch-preview">
                          <p className="batch-number">#{idx + 1}</p>
                          <p className="batch-text">{prompt.substring(0, 140)}…</p>
                        </div>
                        <div className="batch-actions">
                          <button
                            className="ghost small"
                            type="button"
                            title="Copy prompt"
                            onClick={() => {
                              navigator.clipboard.writeText(prompt);
                              showToast('Copied');
                            }}
                          >
                            📋
                          </button>
                          <button
                            className="ghost small"
                            type="button"
                            title="Copy & Save to history"
                            onClick={() => {
                              navigator.clipboard.writeText(prompt);
                              addToPromptHistory(prompt);
                              showToast('Saved to history');
                            }}
                          >
                            ✓
                          </button>
                          <button
                            className="ghost small"
                            type="button"
                            title="View full prompt"
                            onClick={() => {
                              showToast('Full: ' + prompt);
                            }}
                          >
                            👁️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prompt History Modal */}
      {historyOpen && (
        <div className="settings-overlay" onMouseDown={() => setHistoryOpen(false)}>
          <div className="settings-panel history-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <p className="eyebrow">Prompt History</p>
                <h3 className="settings-title">Recent prompts</h3>
                <p className="hint">Quick access to your last 10 generated prompts.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setHistoryOpen(false)}>Close</button>
            </div>
            <div className="settings-body history-body">
              {promptHistory.length === 0 ? (
                <p className="hint">No prompts yet. Generate some to see them here!</p>
              ) : (
                <>
                  <div className="history-controls">
                    <input
                      type="text"
                      placeholder="Search history…"
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="history-search"
                      aria-label="Filter history"
                    />
                    {historyFilter && (
                      <button
                        className="ghost small"
                        type="button"
                        onClick={() => setHistoryFilter('')}
                        title="Clear filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <div className="history-list">
                    {promptHistory
                      .filter((item) => 
                        historyFilter === '' ||
                        item.text.toLowerCase().includes(historyFilter.toLowerCase()) ||
                        item.mode.toLowerCase().includes(historyFilter.toLowerCase())
                      )
                      .map((item, idx) => (
                        <div key={idx} className="history-item-card">
                          <div className="history-header">
                            <span className="mode-badge">{item.mode}</span>
                            <span className="history-time">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="history-preview">{item.text.substring(0, 160)}…</p>
                          <div className="history-item-actions">
                            <button
                              className="ghost small"
                              type="button"
                              title="Copy to clipboard"
                              onClick={() => {
                                navigator.clipboard.writeText(item.text);
                                showToast('Copied');
                              }}
                            >
                              📋 Copy
                            </button>
                            <button
                              className="ghost small"
                              type="button"
                              title="View full text"
                              onClick={() => {
                                showToast('Full prompt loaded');
                              }}
                            >
                              👁️ View
                            </button>
                            <button
                              className="ghost small danger"
                              type="button"
                              title="Remove from history"
                              onClick={() => {
                                setPromptHistory((prev) => prev.filter((_, i) => i !== idx));
                                showToast('Removed from history');
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {promptHistory.filter((item) => 
                    historyFilter === '' ||
                    item.text.toLowerCase().includes(historyFilter.toLowerCase()) ||
                    item.mode.toLowerCase().includes(historyFilter.toLowerCase())
                  ).length === 0 && (
                    <p className="hint">No prompts match your filter.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ollama Expansion Side Panel */}
      {ollamaSidePanelOpen && (
        <div className="ollama-sidepanel">
          <div className="ollama-sidepanel-header">
            <div>
              <h3>Ollama Expansion</h3>
              <p className="hint">{ollamaExpanding ? 'Streaming...' : 'Completed'}</p>
            </div>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setOllamaSidePanelOpen(false);
                setOllamaResult('');
                setOllamaError(null);
              }}
              title="Close panel"
            >
              ✕
            </button>
          </div>

          {ollamaError ? (
            <div className="ollama-sidepanel-body">
              <div className="error-box">
                <p><strong>Error:</strong> {ollamaError}</p>
                <p className="hint">Make sure Ollama is running at {ollamaSettings.apiEndpoint}</p>
                {!ollamaAvailableModels.includes(ollamaSettings.model) && (
                  <div className="settings-actions">
                    <button
                      className="primary"
                      type="button"
                      onClick={() => pullOllamaModelAndRetry(ollamaSettings.model)}
                      disabled={ollamaPulling}
                      title="Pull model and retry"
                    >
                      {ollamaPulling ? 'Pulling…' : 'Pull Model & Retry'}
                    </button>
                    {ollamaPullProgress && (
                      <p className="hint pull-progress-hint">{ollamaPullProgress}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="ollama-sidepanel-body">
              <div className="ollama-comparison">
                <div className="ollama-section">
                  <div className="ollama-section-header">
                    <span className="ollama-section-title">Original Prompt</span>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => {
                        navigator.clipboard.writeText(ollamaOriginalPrompt);
                        showToast('Original copied');
                      }}
                      title="Copy original"
                    >
                      📋
                    </button>
                  </div>
                  <div className="ollama-prompt-box">
                    {ollamaOriginalPrompt}
                  </div>
                </div>

                <div className="ollama-section">
                  <div className="ollama-section-header">
                    <span className="ollama-section-title">
                      Expanded Prompt
                      {ollamaExpanding && <span className="ollama-streaming-indicator"> ●</span>}
                    </span>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={applyOllamaResult}
                      disabled={!ollamaResult || ollamaExpanding}
                      title="Copy expanded"
                    >
                      📋
                    </button>
                  </div>
                  <div className="ollama-prompt-box ollama-expanded">
                    {ollamaResult || (ollamaExpanding ? 'Generating...' : 'No result yet')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="progress">
        <div
          className={`progress-track progress-step-${step}`}
          aria-label={`Wizard progress: step ${step} of ${STEPS.length}`}
          role="progressbar"
        />
      </div>

      <div className="main-layout">
        <section className="steps">
        <article className={`step ${step === 1 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 1</p>
            <h2>Let’s set you up</h2>
            <p className="hint">Quick questions — I’ll pick the best mode for you.</p>
          </div>

          <div className="setup-progress" aria-label="Onboarding progress">
            {[{ id: 1, label: 'Pick type', done: introStage > 0, active: introStage === 0 },
              { id: 2, label: 'Style vibe', done: introStage > 1, active: introStage === 1 },
              { id: 3, label: 'Wording', done: introStage > 2, active: introStage >= 2 && introStage < 4 }].map((item) => (
              <span
                key={item.id}
                className={`setup-pill ${item.done ? 'done' : ''} ${item.active ? 'active' : ''}`}
              >
                {item.label}
              </span>
            ))}
          </div>

          <div className="setup-quick" aria-label="Current onboarding choices">
            <div className="setup-chips">
              <span className="setup-chip">Mode: {labelForMode(mode)}</span>
              <span className="setup-chip">NSFW: {nsfwEnabled ? 'On' : 'Off'}</span>
              <span className="setup-chip">Wording: {uiPrefs.captureWord}</span>
            </div>
            <div className="setup-actions">
              <button
                type="button"
                className="ghost small"
                onClick={() => {
                  setIntroStage(5);
                  setStep(2);
                }}
              >
                Skip intro and build
              </button>
              <button
                type="button"
                className="ghost small"
                onClick={() => {
                  setIntroStage(0);
                  setIntroBase(null);
                  setIntroCinematicFlavor(true);
                }}
              >
                Restart questions
              </button>
            </div>
          </div>

          <div className="friend-bubble" aria-label="Assistant message">
            <span>
              {introStage === 0
                    ? 'Alright. What are we making today?'
                    : introStage === 1
                      ? 'Nice. Do you want cinematic camera language (lens, grade, movement), or keep it simple?'
                      : introStage === 2
                        ? 'One tiny preference: should I call it a “shot” or a “video” when I describe the framing?'
                        : introStage === 3
                          ? 'Perfect. I’ve got your core setup — two quick guide pages, then we build.'
                          : introStage === 4
                            ? 'Pro tip: you can type custom text in any field — no more getting stuck in dropdowns.'
                            : 'Last one: we’ll also fine-tune dialogue (even in NSFW) before the final prompt.'}</span></div>

          {introStage === 0 && (
            <div className="choice-grid">
              <button
                type="button"
                className={`mode-card ${introBase === 'film' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('film');
                  setIntroCinematicFlavor(true);
                  setIntroStage(1);
                }}
              >
                <div className="mode-tag">Story + camera</div>
                <p className="mode-title">Film / scene</p>
                <p className="hint">Cinematic framing, motion, grade.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${introBase === 'photo' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('photo');
                  setIntroCinematicFlavor(false);
                  setIntroStage(1);
                }}
              >
                <div className="mode-tag">Clean + flexible</div>
                <p className="mode-title">Photo / portrait</p>
                <p className="hint">Balanced prompts that travel well.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${introBase === 'adult' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('adult');
                  setIntroStage(2);
                  setNsfwEnabled(true);
                  setMode('nsfw');
                }}
              >
                <div className="mode-tag">18+</div>
                <p className="mode-title">Adult / NSFW</p>
                <p className="hint">Unlocks NSFW preset lists and optional fields.</p>
              </button>
            </div>
          )}

          {introStage === 1 && introBase !== 'adult' && (
            <div className="choice-grid">
              <button
                type="button"
                className={`mode-card ${introCinematicFlavor ? 'active' : ''}`}
                onClick={() => {
                  setIntroCinematicFlavor(true);
                  setIntroStage(2);
                }}
              >
                <div className="mode-tag">Lens + movement</div>
                <p className="mode-title">Cinematic mode</p>
                <p className="hint">Feels like a director of photography wrote it.</p>
              </button>

              <button
                type="button"
                className={`mode-card ${!introCinematicFlavor ? 'active' : ''}`}
                onClick={() => {
                  setIntroCinematicFlavor(false);
                  setIntroStage(2);
                }}
              >
                <div className="mode-tag">Straightforward</div>
                <p className="mode-title">Classic mode</p>
                <p className="hint">Simple, clean, reliable prompt structure.</p>
              </button>

              <div className="inline-settings">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={nsfwEnabled}
                    onChange={(e) => setNsfwEnabled(e.target.checked)}
                    aria-label="Enable NSFW options"
                  />
                  <span className="slider" />
                </label>
                <div>
                  <div className="toggle-title">Optional: enable NSFW fields</div>
                  <div className="toggle-note">Keeps wizard safe unless enabled.</div>
                </div>
              </div>
            </div>
          )}

          {introStage === 2 && (
            <div className="choice-grid">
              {([
                { id: 'shot', title: 'Shot', desc: 'Classic camera wording (shot, angle, framing).' },
                { id: 'video', title: 'Video', desc: 'More creator-friendly phrasing (video, clip).' },
                { id: 'clip', title: 'Clip', desc: 'Short-form vibe; feels modern.' },
                { id: 'frame', title: 'Frame', desc: 'Photographic / composition language.' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`mode-card ${uiPrefs.captureWord === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    setUiPrefs((p) => ({ ...p, captureWord: opt.id }));
                    setIntroStage(3);
                  }}
                >
                  <div className="mode-tag">Wording</div>
                  <p className="mode-title">{opt.title}</p>
                  <p className="hint">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {introStage === 3 && (
            <div className="onboard-summary">
              <div className="summary-row">
                <div className="summary-pill">Mode: {labelForMode(mode)}</div>
                <div className="summary-pill">NSFW: {nsfwEnabled ? 'Enabled' : 'Off'}</div>
                <div className="summary-pill">Wording: {uiPrefs.captureWord}</div>
              </div>
              <p className="hint onboard-hint">
                You can still tweak everything in Settings.
              </p>
            </div>
          )}

          {introStage === 4 && (
            <div className="onboard-guide">
              <h3 className="guide-title">Quick guide</h3>
              <div className="guide-grid">
                <div className="guide-card">
                  <div className="guide-kicker">Pick or type</div>
                  <p className="hint">Every field lets you select an option or type your own custom value on the fly.</p>
                </div>
                <div className="guide-card">
                  <div className="guide-kicker">Settings</div>
                  <p className="hint">Customize preset lists, typing speed, wording, and auto-copy whenever you want.</p>
                </div>
              </div>
            </div>
          )}

          {introStage === 5 && (
            <div className="onboard-guide">
              <h3 className="guide-title">What we’ll tune</h3>
              <div className="guide-grid">
                <div className="guide-card">
                  <div className="guide-kicker">Dialogue</div>
                  <p className="hint">Add a line (or leave it blank), pick a speaker and delivery style.</p>
                </div>
                <div className="guide-card">
                  <div className="guide-kicker">NSFW stays gated</div>
                  <p className="hint">NSFW-only fields are still ignored unless NSFW is enabled.</p>
                </div>
              </div>
            </div>
          )}

          {!nsfwEnabled && mode === 'nsfw' && (
            <div className="inline-alert">
              <div className="dot" />
              <p>NSFW mode requires NSFW enabled.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 2 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 2</p>
            <h2>{mode === 'drone' ? `Landscape & ${captureWordTitle}` : `Genre & ${captureWordTitle}`}</h2>
            <p className="hint">{mode === 'drone' ? 'Environment-first aerial framing and location vibe.' : 'Set the story tone and camera framing.'}</p>
          </div>
          <div className="field-grid">
            {['genre', 'shot'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field, uiPrefs.captureWord, mode),
                  field === 'genre'
                    ? 'Choose a narrative style (e.g., Sci‑fi thriller, Portrait). Guides mood, camera language, and color across steps.'
                    : 'Describe framing and vantage (e.g., Wide establishing, Close‑up). Sets composition, subject scale, and movement expectations.',
                  field
                )}
                {renderPickOrType(field)}
              </label>
            ))}
            <label className="field">
              {renderLabel('Framing notes', 'Composition cues like rule of thirds, symmetry, or negative space.', 'framingNotes')}
              <PickOrTypeField
                ariaLabel={labelForField('framingNotes', uiPrefs.captureWord, mode)}
                value={fieldValue('framingNotes')}
                placeholder={examplePlaceholder(selects['framingNotes'] || [])}
                listId={listIdFor('framingNotes')}
                options={selects['framingNotes'] || []}
                onChange={(v) => handleInput('framingNotes', v)}
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 3 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 3</p>
            <h2>{mode === 'drone' ? 'Focus & surface detail' : 'Role & wardrobe'}</h2>
            <p className="hint">{mode === 'drone' ? 'Keep it non-person: landmark, terrain, architecture, and surface cues.' : 'Define who the subject is and what they wear.'}</p>
          </div>
          <div className="field-grid">
            {(mode === 'drone'
              ? ['role', 'wardrobe']
              : ['role', 'wardrobe', 'hairColor', 'eyeColor', 'bodyDescriptor']
            ).map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field, uiPrefs.captureWord, mode),
                  field === 'role'
                    ? (mode === 'drone'
                      ? 'What the shot centers on (landmark/terrain/architecture). Avoid people.'
                      : 'Subject archetype (e.g., Protagonist, Model). Drives POV and action language throughout the prompt.')
                    : field === 'wardrobe'
                      ? (mode === 'drone'
                        ? 'Surface/scene cues (e.g., mist layers, wet reflections, no people visible).'
                        : 'Style/era cues (e.g., Weathered leathers, Tailored suit). Influences tone, texture, and time period.')
                      : field === 'hairColor'
                        ? 'Hair color for the character (e.g., Black, Blonde).'
                        : field === 'eyeColor'
                          ? 'Eye color for the character (e.g., Blue, Green).'
                          : 'Body/build descriptors (e.g., Athletic build, Tall). Can be multiple.',
                  field
                )}
                {renderPickOrType(field)}
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 4 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 4</p>
            <h2>{mode === 'drone' ? 'Motion & mood' : 'Pose & mood'}</h2>
            <p className="hint">{mode === 'drone' ? 'Describe camera/scene motion and the emotional tone.' : 'Capture stance and emotional tone.'}</p>
          </div>
          <div className="field-grid">
            {['pose', 'mood'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field, uiPrefs.captureWord, mode),
                  field === 'pose'
                    ? (mode === 'drone'
                      ? 'Motion emphasis (e.g., slow drift, sweeping reveal). Pairs with movement beats.'
                      : 'Body posture/action that anchors motion (e.g., Striding forward, Relaxed seated). Pairs with movement beats.')
                    : 'Emotional temperature (e.g., Tense, Serene). Influences lighting, grade, and pacing.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field, uiPrefs.captureWord, mode)}
                  value={fieldValue(field)}
                  placeholder={examplePlaceholder(selects[field] || [])}
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 5 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 5</p>
            <h2>Action beats</h2>
            <p className="hint">Write a brief, beat-by-beat synopsis (opening → mid → closing) without using seconds.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Movement subject type', 'Select Person, Object, or Camera to tailor grammar in movement beats.', 'movementSubjectType')}
              <PickOrTypeField
                ariaLabel={labelForField('movementSubjectType')}
                value={fieldValue('movementSubjectType')}
                placeholder={examplePlaceholder(selects['movementSubjectType'] || [])}
                listId={listIdFor('movementSubjectType')}
                options={selects['movementSubjectType'] || []}
                onChange={(v) => handleInput('movementSubjectType', v)}
              />
            </label>

            <label className="field">
              {renderLabel('Movement subject label', 'Who/what moves (e.g., “the person”, “the suitcase”, “the camera”). Used in movement lines and the synopsis.', 'movementSubjectLabel')}
              <input
                type="text"
                value={current.movementSubjectLabel || ''}
                onChange={(e) => handleInput('movementSubjectLabel', e.target.value)}
                placeholder={'e.g., the person / the object / the suitcase'}
                aria-label="Movement subject label"
              />
            </label>

            <label className="field">
              {renderLabel('Movement 1', 'First beat (e.g., “walks in”, “is carried in”). Combine with pace/manner for nuance.', 'movement1')}
              <PickOrTypeField
                ariaLabel={labelForField('movement1')}
                value={fieldValue('movement1')}
                placeholder={examplePlaceholder(selects['movement1'] || [])}
                listId={listIdFor('movement1')}
                options={selects['movement1'] || []}
                onChange={(v) => handleInput('movement1', v)}
              />
            </label>

            <label className="field">
              {renderLabel('Movement 2', 'Second beat (e.g., “sits”, “is set down”). Completes the motion implied in the shot.', 'movement2')}
              <PickOrTypeField
                ariaLabel={labelForField('movement2')}
                value={fieldValue('movement2')}
                placeholder={examplePlaceholder(selects['movement2'] || [])}
                listId={listIdFor('movement2')}
                options={selects['movement2'] || []}
                onChange={(v) => handleInput('movement2', v)}
              />
            </label>

            <label className="field">
              {renderLabel('Core actions (synopsis)', 'Describe the flow using beats like “Opening”, “Mid beat”, and “Closing”. No timestamps — just narrative motion.', 'actions')}
              <textarea
                value={current.actions || ''}
                onChange={(e) => handleInput('actions', e.target.value)}
                rows={4}
                placeholder={'Opening: Establish the scene\nMid beat: The subject enters and sits\nClosing: Camera holds; end beat'}
                aria-label="Core actions synopsis"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 6 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 6</p>
            <h2>Lighting & environment</h2>
            <p className="hint">Set the light and backdrop.</p>
          </div>
          <div className="field-grid">
            {['lighting', 'environment'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'lighting'
                    ? 'Quality/direction (e.g., Golden hour, Soft bounce). Use intensity below to clarify strength.'
                    : 'Setting/backdrop (e.g., Neon city, Forest trail). Add texture to describe how it feels.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder={examplePlaceholder(selects[field] || [])}
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
            <label className="field">
              {renderLabel('Environment texture', 'Surface/feel of the setting (e.g., weathered, pristine, cluttered). Helps render material detail.', 'environmentTexture')}
              <PickOrTypeField
                ariaLabel={labelForField('environmentTexture')}
                value={fieldValue('environmentTexture')}
                placeholder={examplePlaceholder(selects['environmentTexture'] || [])}
                listId={listIdFor('environmentTexture')}
                options={selects['environmentTexture'] || []}
                onChange={(v) => handleInput('environmentTexture', v)}
              />
            </label>
            <label className="field">
              {renderLabel('Lighting intensity', 'Quick strength cue (soft/medium/harsh/glowing). Steers contrast and exposure.', 'lightingIntensity')}
              <PickOrTypeField
                ariaLabel={labelForField('lightingIntensity')}
                value={fieldValue('lightingIntensity')}
                placeholder={examplePlaceholder(selects['lightingIntensity'] || [])}
                listId={listIdFor('lightingIntensity')}
                options={selects['lightingIntensity'] || []}
                onChange={(v) => handleInput('lightingIntensity', v)}
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 7 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 7</p>
            <h2>Camera & lens</h2>
            <p className="hint">Choose movement and glass.</p>
          </div>
          <div className="field-grid">
            {['cameraMove', 'lens'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'cameraMove'
                    ? 'Camera motion (push, pan, orbit, static). Pairs with action beats; affects energy and continuity.'
                    : 'Lens/focal length (e.g., 50mm prime, 24mm wide) to lock perspective, depth of field, and distortion.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder={examplePlaceholder(selects[field] || [])}
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
            <label className="field">
              {renderLabel('Focus target', 'Primary focus (e.g., eyes, hands, object, backdrop). Influences subject emphasis and DOF.', 'focusTarget')}
              <PickOrTypeField
                ariaLabel={labelForField('focusTarget')}
                value={fieldValue('focusTarget')}
                placeholder={examplePlaceholder(selects['focusTarget'] || [])}
                listId={listIdFor('focusTarget')}
                options={selects['focusTarget'] || []}
                onChange={(v) => handleInput('focusTarget', v)}
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 8 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 8</p>
            <h2>Grade & weather</h2>
            <p className="hint">Color tone and atmospheric conditions.</p>
          </div>
          <div className="field-grid">
            {['colorGrade', 'weather'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(
                  labelForField(field),
                  field === 'colorGrade'
                    ? 'Palette direction (e.g., Teal & amber, Clean neutral). Guides overall color and mood.'
                    : 'Atmospheric conditions (e.g., Fine rain, Foggy). Modulates light texture and depth.',
                  field
                )}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder={examplePlaceholder(selects[field] || [])}
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 9 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 9</p>
            <h2>Light interaction</h2>
            <p className="hint">How the light behaves on surfaces.</p>
          </div>
          <div className="field-grid">
            {['lightInteraction'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(labelForField(field), 'Light behavior on surfaces (wraps, rims, scatters). Adds texture realism and helps avoid flat lighting.', field)}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder={examplePlaceholder(selects[field] || [])}
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 10 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 10</p>
            <h2>Signatures</h2>
            <p className="hint">Add visual signature details.</p>
          </div>
          <div className="field-grid">
            {['sig1', 'sig2'].map((field) => (
              <label className="field" key={field}>
                {renderLabel(labelForField(field), 'Small, repeatable motifs (e.g., lens bloom, grain). Use sparingly to brand the look without overpowering.', field)}
                <PickOrTypeField
                  ariaLabel={labelForField(field)}
                  value={fieldValue(field)}
                  placeholder={examplePlaceholder(selects[field] || [])}
                  listId={listIdFor(field)}
                  options={selects[field] || []}
                  onChange={(v) => handleInput(field, v)}
                />
              </label>
            ))}
          </div>
        </article>

        <article className={`step ${step === 11 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 11</p>
            <h2>Ambient & SFX</h2>
            <p className="hint">Lay down the audio bed.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Ambient sound', 'Background bed (e.g., City hush, Quiet room). Fills space between moments and sets location feel.', 'sound')}
              {renderPickOrType('sound')}
            </label>

            <label className="field">
              {renderLabel('Sound effects (SFX)', 'Spot effects (e.g., Footsteps, Door creak) that punctuate actions and transitions.', 'sfx')}
              {renderPickOrType('sfx')}
            </label>
          </div>
        </article>

        <article className={`step ${step === 12 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 12</p>
            <h2>Music & mix</h2>
            <p className="hint">Optional score plus any mixing notes.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Music (optional)', 'Score/bed (e.g., Orchestral swell, Lo‑fi beat). Leave blank for silence.', 'music')}
              <PickOrTypeField
                ariaLabel="Music"
                value={fieldValue('music')}
                placeholder={examplePlaceholder(selects.music || [])}
                listId={listIdFor('music')}
                options={selects.music || []}
                onChange={(v) => handleInput('music', v)}
              />
            </label>

            <label className="field">
              {renderLabel('Mix notes (optional)', 'Balance cues (e.g., dialogue forward, ambience low, SFX punchy).', 'mix_notes')}
              <textarea
                value={current.mix_notes || ''}
                onChange={(e) => handleInput('mix_notes', e.target.value)}
                rows={3}
                placeholder={'e.g., keep dialogue crisp, ambience low, SFX punchy'}
                aria-label="Mix notes"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 13 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 13</p>
            <h2>Dialogue & speaker</h2>
            <p className="hint">Optional line plus who says it.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Dialogue line', 'Short line of speech; blank for a silent beat.', 'dialogue')}
              <input
                type="text"
                value={current.dialogue || ''}
                onChange={(e) => handleInput('dialogue', e.target.value)}
                placeholder={'e.g., "Don\'t blink."'}
                aria-label="Dialogue line"
              />
            </label>

            <label className="field">
              {renderLabel('Speaker', 'Pronoun/voice label (They/He/She/I/We). Used to format the dialogue line.', 'pronoun')}
              <PickOrTypeField
                ariaLabel="Speaker pronoun"
                value={current.pronoun || ''}
                placeholder="Pick or type…"
                listId={`list-${mode}-pronoun`}
                options={['They', 'He', 'She', 'I', 'We']}
                onChange={(v) => handleInput('pronoun', v)}
              />
            </label>
          </div>
          <div className="inline-alert">
            <div className="dot" />
            <p>Leave dialogue empty for a silent, cinematic beat.</p>
          </div>
        </article>

        <article className={`step ${step === 14 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 14</p>
            <h2>Delivery</h2>
            <p className="hint">How the line is delivered.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Delivery', 'Verb shaping tone/pacing (e.g., whispers, shouts, murmurs).', 'dialogue_verb')}
              <PickOrTypeField
                ariaLabel="Dialogue verb"
                value={current.dialogue_verb || ''}
                placeholder="Pick or type…"
                listId={`list-${mode}-dialogue_verb`}
                options={['says', 'whispers', 'murmurs', 'growls', 'shouts', 'laughs', 'breathes']}
                onChange={(v) => handleInput('dialogue_verb', v)}
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 15 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 15</p>
            <h2>NSFW abilities & body</h2>
            <p className="hint">Adult-only context. Ignored unless NSFW is enabled.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Position', 'Intimate positioning and poses.', 'position')}
              {renderPickOrType('position')}
            </label>
            <label className="field">
              {renderLabel('Activity', 'Sensual actions and interactions.', 'activity')}
              {renderPickOrType('activity')}
            </label>
            <label className="field">
              {renderLabel('Accessory', 'Adult toys, restraints, and items.', 'accessory')}
              {renderPickOrType('accessory')}
            </label>
            <label className="field">
              {renderLabel('Explicit abilities', 'Only used when NSFW is on.', 'explicit_abilities')}
              <input
                type="text"
                value={current.explicit_abilities || ''}
                onChange={(e) => handleInput('explicit_abilities', e.target.value)}
                placeholder="e.g., power play, restraints"
                aria-label="Explicit abilities"
              />
            </label>
            <label className="field">
              {renderLabel('Body description', 'Optional physical cues; stays off in safe mode.', 'body_description')}
              <input
                type="text"
                value={current.body_description || ''}
                onChange={(e) => handleInput('body_description', e.target.value)}
                placeholder="e.g., toned silhouette, tattoos"
                aria-label="Body description"
              />
            </label>
          </div>
          {!nsfwEnabled && (
            <div className="inline-alert">
              <div className="dot" />
              <p>NSFW disabled: these fields will be ignored unless NSFW is on.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 16 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 16</p>
            <h2>NSFW expression</h2>
            <p className="hint">Optional intimacy details; gated by NSFW toggle.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Fetish', 'Specific kinks and fetishes.', 'fetish')}
              {renderPickOrType('fetish')}
            </label>
            <label className="field">
              {renderLabel('Body focus', 'Detailed body parts and emphasis.', 'bodyFocus')}
              {renderPickOrType('bodyFocus')}
            </label>
            <label className="field">
              {renderLabel('Sensation', 'Sensory experiences and touches.', 'sensation')}
              {renderPickOrType('sensation')}
            </label>
            <label className="field">
              {renderLabel('Sexual description', 'Energy, acts, or intimacy level. Ignored when NSFW is off.', 'sexual_description')}
              <input
                type="text"
                value={current.sexual_description || ''}
                onChange={(e) => handleInput('sexual_description', e.target.value)}
                placeholder="e.g., intimate tension, close contact"
                aria-label="Sexual description"
              />
            </label>
          </div>
          {!nsfwEnabled && (
            <div className="inline-alert">
              <div className="dot" />
              <p>NSFW disabled: this field will be ignored unless NSFW is on.</p>
            </div>
          )}
        </article>

        <article className={`step ${step === 17 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 17</p>
            <h2>Review & build</h2>
            <p className="hint">Confirm your picks and grab the prompt.</p>
          </div>

          {ltx2Checklist.length > 0 && (
            <div className="inline-alert" aria-label="LTX-2 prompt checklist">
              <div className="dot" />
              <div>
                <p><strong>LTX-2 checklist</strong></p>
                <p className="hint">Your prompt will work as-is, but these usually improve results:</p>
                <ul className="hint ltx2-checklist">
                  {ltx2Checklist.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="summary">
            <SummaryItem label="Mode" value={labelForMode(mode)} />
            <SummaryItem label="Genre" value={fieldValue('genre')} />
            <SummaryItem label={captureWordTitle} value={fieldValue('shot')} />
            <SummaryItem label="Role" value={fieldValue('role')} />
            <SummaryItem label="Wardrobe" value={fieldValue('wardrobe')} />
            {mode !== 'drone' && (
              <>
                <SummaryItem label="Hair" value={fieldValue('hairColor')} />
                <SummaryItem label="Eyes" value={fieldValue('eyeColor')} />
                <SummaryItem label="Body" value={fieldValue('bodyDescriptor')} />
              </>
            )}
            <SummaryItem label="Pose" value={fieldValue('pose')} />
            <SummaryItem label="Actions" value={current.actions || ''} />
            <SummaryItem label="Mood" value={fieldValue('mood')} />
            <SummaryItem label="Lighting" value={fieldValue('lighting')} />
            <SummaryItem label="Environment" value={fieldValue('environment')} />
            <SummaryItem label="Camera" value={fieldValue('cameraMove')} />
            <SummaryItem label="Lens" value={fieldValue('lens')} />
            <SummaryItem label="Grade" value={fieldValue('colorGrade')} />
            <SummaryItem label="Weather" value={fieldValue('weather')} />
            <SummaryItem label="Light FX" value={fieldValue('lightInteraction')} />
            <SummaryItem label="Signatures" value={[fieldValue('sig1'), fieldValue('sig2')].filter(Boolean).join(' · ')} />
            <SummaryItem label="Sound" value={fieldValue('sound')} />
            <SummaryItem label="SFX" value={fieldValue('sfx')} />
            <SummaryItem label="Music" value={fieldValue('music')} />
            <SummaryItem label="Mix notes" value={current.mix_notes || ''} />
            <SummaryItem label="Dialogue" value={current.dialogue || ''} />
            <SummaryItem label="Delivery" value={current.dialogue_verb || ''} />
            <SummaryItem label="Speaker" value={current.pronoun || ''} />
            {nsfwEnabled && (
              <>
                <SummaryItem label="Explicit abilities" value={current.explicit_abilities || ''} />
                <SummaryItem label="Body" value={current.body_description || ''} />
                <SummaryItem label="Sexual description" value={current.sexual_description || ''} />
              </>
            )}
          </div>
          <div className="output">
            <div className="output-head">
              <div>
                <p className="eyebrow">Generated prompt</p>
                <h3>Copy-ready</h3>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={() => void copyPrompt(prompt).then(() => showToast('Copied prompt'))}
              >
                Copy
              </button>
            </div>
            <textarea value={prompt} readOnly rows={6} aria-label="Generated prompt" />
          </div>
        </article>
      </section>

      {/* Live Preview & Tools Sidebar */}
      <aside className={`preview-sidebar ${previewOpen ? 'open' : 'closed'}`} aria-label="Preview and editing tools">
        <div className="sidebar-toggle">
          <button 
            className="ghost small"
            type="button" 
            onClick={() => setPreviewOpen((v) => !v)}
            title={previewOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={previewOpen ? 'Collapse preview sidebar' : 'Expand preview sidebar'}
          >
            {previewOpen ? '⬎' : '⬏'}
          </button>
        </div>

        {previewOpen && (
          <>
            <div className="sidebar-section preview-section">
              <div className="sidebar-head">
                <h3>Live Preview</h3>
                <button className="ghost small" type="button" onClick={() => {
                  void copyPrompt(prompt);
                  addToPromptHistory(prompt);
                  showToast('Copied & saved');
                }}>📋 Copy</button>
              </div>

              <div className="preview-meta">
                <div className="meta-row" aria-label="Preview context summary">
                  <span className="meta-chip">Mode: {labelForMode(mode)}</span>
                  <span className="meta-chip">Tone: {editorTone.charAt(0).toUpperCase() + editorTone.slice(1)}</span>
                  <span className="meta-chip">Detail: {detailLabelFor(visualEmphasis)}</span>
                  <span className="meta-chip">Audio: {audioLabelFor(audioEmphasis)}</span>
                </div>
                <div className="meta-actions">
                  <button
                    className="ghost tiny"
                    type="button"
                    onClick={() => addToPromptHistory(prompt)}
                    title="Save to prompt history"
                  >
                    Save
                  </button>
                  <button
                    className="ghost tiny"
                    type="button"
                    onClick={() => setPreviewOpen(false)}
                    title="Hide preview"
                  >
                    Hide
                  </button>
                </div>
              </div>
              <pre key={previewAnimTick} className="preview-text">
                {prompt}
              </pre>
            </div>

            <div className="sidebar-divider" />

            {/* Live Editing Tools */}
            <div className="sidebar-section editing-tools">
              <h4 className="sidebar-subtitle">Live Editing</h4>
              
              <div className="tool-group">
                <label className="tool-label">Tone</label>
                <div className="tone-buttons">
                  {(['melancholic', 'balanced', 'energetic', 'dramatic'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`tone-btn ${editorTone === t ? 'active' : ''}`}
                      onClick={() => setEditorTone(t)}
                      title={`Set tone to ${t}`}
                    >
                      {t[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tool-group">
                <div className="tool-header">
                  <label className="tool-label">Visual Detail</label>
                  <span className="tool-value">{visualEmphasis}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={visualEmphasis}
                  onChange={(e) => setVisualEmphasis(Number(e.target.value))}
                  className="tool-slider"
                  aria-label="Adjust visual detail emphasis"
                />
                <div className="slider-hints">
                  <span>Minimal</span>
                  <span>Rich</span>
                </div>
              </div>

              <div className="tool-group">
                <div className="tool-header">
                  <label className="tool-label">Audio Fill</label>
                  <span className="tool-value">{audioEmphasis}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioEmphasis}
                  onChange={(e) => setAudioEmphasis(Number(e.target.value))}
                  className="tool-slider"
                  aria-label="Adjust audio fill emphasis"
                />
                <div className="slider-hints">
                  <span>Off</span>
                  <span>Full</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
      </div>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className="sticky-nav-spacer" aria-hidden="true" />
      <footer className="sticky-nav" role="navigation" aria-label="Wizard navigation">
        <div className="sticky-nav-inner">
          <button
            className="ghost"
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            aria-label={`Back to Step ${Math.max(1, step - 1)} — ${stepTitle(Math.max(1, step - 1))}`}
          >
            Back
          </button>
          <div className="progress-pips">
            {STEPS.map((n) => (
              <button
                key={n}
                type="button"
                className={`progress-pip ${n <= step ? 'active' : ''}`}
                aria-label={`Go to Step ${n} — ${stepTitle(n)}`}
                onClick={() => setStep(n)}
              />
            ))}
          </div>
          <div className="nav-spacer" />
          <button
            className="primary"
            type="button"
            onClick={handleNext}
            aria-label={step === STEPS.length
              ? 'Finish'
              : `Next to Step ${Math.min(STEPS.length, step + 1)} — ${stepTitle(Math.min(STEPS.length, step + 1))}`}
          >
            {step === STEPS.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </footer>
    </main>
  );
}

function labelForMode(mode: string) {
  return MODES.find((m) => m.id === mode)?.title || mode;
}

function labelForField(field: string, captureWord: CaptureWord = 'shot', mode?: ModeId) {
  const base: Record<string, string> = {
    genre: 'The story feels like ____',
    shot: `The ${captureWord} looks like ____`,
    role: 'The subject is a ____',
    wardrobe: 'The subject is wearing ____',
    pose: 'The subject is posed ____',
    mood: 'The mood is ____',
    lighting: 'Lighting is ____',
    environment: 'The scene is set in ____',
    cameraMove: 'The camera moves ____',
    lens: 'We are shooting on ____',
    colorGrade: 'The color grade is ____',
    weather: 'The weather is ____',
    lightInteraction: 'Light interacts by ____',
    framingNotes: 'Framing notes are ____',
    environmentTexture: 'Environment texture is ____',
    lightingIntensity: 'Lighting intensity is ____',
    sig1: 'Signature detail 1 is ____',
    sig2: 'Signature detail 2 is ____',
    sound: 'We hear ____',
    sfx: 'Sound effects (SFX) include ____',
    music: 'Music is ____',
    mix_notes: 'Mix notes are ____',
    explicit_abilities: 'The explicit abilities are ____',
    body_description: 'The body description is ____',
    sexual_description: 'The sexual description is ____',
    hairColor: 'Hair color is ____',
    eyeColor: 'Eye color is ____',
    bodyDescriptor: 'Body descriptor is ____',
    movementSubjectType: 'Movement subject is a ____',
    movementSubjectLabel: 'Movement subject label is ____',
    movement1: 'Movement 1 is ____',
    movement2: 'Movement 2 is ____',
    movementPace: 'Movement pace is ____',
    movementManner: 'Movement manner is ____',
    focusTarget: 'Focus target is ____',
  };

  if (mode === 'drone') {
    const drone: Partial<Record<string, string>> = {
      genre: 'The location vibe feels like ____',
      role: 'The main focus is ____',
      wardrobe: 'Scene details include ____',
      pose: 'Motion emphasis is ____',
    };
    return (drone[field] || base[field] || field) as string;
  }

  if (mode === 'animation') {
    const animation: Partial<Record<string, string>> = {
      role: 'The character is a ____',
      wardrobe: 'The character is wearing ____',
      pose: 'The character is posed ____',
    };
    return (animation[field] || base[field] || field) as string;
  }

  return base[field] || field;
}

function formatLtx2Section(title: string, lines: string[]) {
  const clean = lines.map((l) => (l || '').trim()).filter(Boolean);
  if (!clean.length) return '';
  return `${title}:\n${clean.map((l) => `- ${l}`).join('\n')}`;
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="summary-item">
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value || '—'}</div>
    </div>
  );
}

function PickOrTypeField({
  ariaLabel,
  value,
  placeholder,
  listId,
  options,
  multi,
  onChange,
  mode,
  field,
  favorites,
  history,
}: {
  ariaLabel: string;
  value: string;
  placeholder?: string;
  listId: string;
  options: string[];
  multi?: boolean;
  onChange: (value: string) => void;
  mode?: string;
  field?: string;
  favorites?: Favorites;
  history?: History;
}) {
  // Organize options: favorites first, then history, then rest
  const favList = (mode && field && favorites?.[mode]?.[field]) || [];
  const histList = (mode && field && history?.[mode]?.[field]) || [];
  const isFav = (v: string) => favList.includes(v);
  const isHist = (v: string) => histList.includes(v) && !isFav(v);
  const restList = options.filter((v) => !isFav(v) && !isHist(v));
  const orderedOptions = [...favList, ...histList.filter((v) => options.includes(v)), ...restList];
  const isCustomValue = value && !options.includes(value);

  const parseMulti = (raw: string): string[] => {
    const text = String(raw || '').trim();
    if (!text) return [];
    const parts = text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const out: string[] = [];
    for (const p of parts) {
      if (!out.includes(p)) out.push(p);
    }
    return out;
  };

  const formatMulti = (vals: string[]): string => vals.filter(Boolean).join(', ');

  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (!multi) setDraft('');
  }, [multi, mode, field]);

  if (multi) {
    const selected = parseMulti(value);

    const commit = (nextList: string[]) => onChange(formatMulti(nextList));

    const toggle = (v: string) => {
      const trimmed = (v || '').trim();
      if (!trimmed) return;
      if (selected.includes(trimmed)) {
        commit(selected.filter((x) => x !== trimmed));
      } else {
        commit([...selected, trimmed]);
      }
    };

    const addDraft = () => {
      const trimmed = (draft || '').trim();
      if (!trimmed) return;
      if (!selected.includes(trimmed)) commit([...selected, trimmed]);
      setDraft('');
    };

    return (
      <>
        {selected.length > 0 && (
          <div className="selected-options" aria-label="Selected options">
            {selected.map((v) => (
              <button
                type="button"
                key={v}
                className="quick-chip selected"
                onClick={() => toggle(v)}
                aria-label={`Remove ${v}`}
                title="Click to remove"
              >
                {v} <span className="chip-x">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="multi-row">
          <input
            type="text"
            list={listId}
            value={draft}
            placeholder={placeholder || 'Add another…'}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDraft();
              }
            }}
            aria-label={ariaLabel}
          />
          <button type="button" className="multi-add" onClick={addDraft} aria-label="Add">
            Add
          </button>
        </div>

        <datalist id={listId}>
          {options.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>

        {orderedOptions && orderedOptions.length > 0 ? (
          <div className="quick-options" aria-label="All presets">
            {orderedOptions.map((v) => (
              <button
                type="button"
                key={v}
                className={`quick-chip ${selected.includes(v) ? 'selected' : ''} ${isFav(v) ? 'fav' : ''} ${isHist(v) ? 'recent' : ''}`}
                onClick={() => toggle(v)}
                title={selected.includes(v) ? 'Click to remove' : 'Click to add'}
              >
                {isFav(v) && <span className="chip-star">★</span>}
                {v}
              </button>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <input
        type="text"
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
      {isCustomValue && (
        <div className="custom-input-hint">Custom: {value}</div>
      )}
      <datalist id={listId}>
        {options.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
      {orderedOptions && orderedOptions.length > 0 ? (
        <div className="quick-options" aria-label="All presets">
          {orderedOptions.map((v) => (
            <button
              type="button"
              key={v}
              className={`quick-chip ${isFav(v) ? 'fav' : ''} ${isHist(v) ? 'recent' : ''}`}
              onClick={() => onChange(v)}
            >
              {isFav(v) && <span className="chip-star">★</span>}
              {v}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

async function copyPrompt(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Copy failed', err);
  }
}

function pickField(values: Record<string, Record<string, string>>, mode: string, field: string, fallback = '') {
  return values[mode]?.[field] || fallback;
}

function buildMovementLines(bucket: Record<string, string>): string[] {
  const subjectType = (bucket.movementSubjectType || '').trim().toLowerCase();
  const rawLabel = (bucket.movementSubjectLabel || '').trim();
  let defaultLabel = 'the subject';
  if (subjectType === 'object') defaultLabel = 'the object';
  if (subjectType === 'person') defaultLabel = 'the person';
  if (subjectType === 'camera') defaultLabel = 'the camera';
  const label = rawLabel || defaultLabel;
  const m1 = (bucket.movement1 || '').trim();
  const m2 = (bucket.movement2 || '').trim();
  const pace = (bucket.movementPace || '').trim().toLowerCase();
  const manner = (bucket.movementManner || '').trim().toLowerCase();
  const lines: string[] = [];
  
  const buildActionLine = (movement: string, subject: string): string => {
    let action = `${subject} ${lowercaseFirst(movement)}`;
    if (manner && pace) {
      action += ` ${manner}, at a ${pace} pace`;
    } else if (manner) {
      action += ` ${manner}`;
    } else if (pace) {
      action += ` at a ${pace} pace`;
    }
    return action;
  };
  
  if (m1) {
    lines.push(buildActionLine(m1, label));
  }
  if (m2) {
    lines.push(buildActionLine(m2, label));
  }
  return lines;
}

function guardrailsCinematic(data: CinematicData): CinematicData {
  const weatherLow = data.weather.toLowerCase();
  const lightLow = data.lighting.toLowerCase();
  if ((weatherLow.includes('storm') || weatherLow.includes('night') || weatherLow.includes('blizzard') || weatherLow.includes('fog')) && (lightLow.includes('sun') || lightLow.includes('bright'))) {
    data.lighting = 'overcast flat light';
  }
  if (data.shot_type.toLowerCase().includes('extreme close-up') && data.environment.toLowerCase().includes('landscape')) {
    data.environment = 'tight setting';
  }
  const pullReveal = data.camera_move.toLowerCase().includes('pull') && data.camera_move.toLowerCase().includes('reveal');
  if (pullReveal && data.environment && !data.environment.toLowerCase().includes('vast')) {
    data.environment = `vast ${data.environment}`;
  }
  return data;
}

function withCaptureWord(shotType: string, captureWord: CaptureWord): string {
  const t = (shotType || '').trim();
  if (!t) return captureWord;

  const replaced = captureWord === 'shot'
    ? t
    : t.replace(/\bshot\b/gi, captureWord);

  const low = replaced.toLowerCase();
  if (/(\bshot\b|\bvideo\b|\bclip\b|\bframe\b)/i.test(low)) return replaced;
  return `${replaced} ${captureWord}`;
}

function lowercaseFirst(text: string): string {
  if (!text) return text;
  const str = text.trim();
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function splitMultiValues(raw: string): string[] {
  const text = String(raw || '').trim();
  if (!text) return [];
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function naturalJoin(values: string[]): string {
  const list = (values || []).map((s) => String(s || '').trim()).filter(Boolean);
  if (list.length <= 1) return list[0] || '';
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
}

function naturalizeMulti(raw: string): string {
  const parts = splitMultiValues(raw);
  return naturalJoin(parts) || String(raw || '').trim();
}

function buildCinematicParagraph(
  raw: CinematicData,
  captureWord: CaptureWord,
  format: PromptFormat = 'paragraph',
  actionTimeline = '',
  detailLevel: DetailLevel = 'balanced',
  autoFillAudio = true,
  autoFillCamera = true
): string {
  const clean = guardrailsCinematic({ ...raw });

  if (autoFillCamera && !clean.camera_move) clean.camera_move = 'steady cam';
  if (!clean.focus_target) clean.focus_target = 'the subject';
  if (autoFillAudio) {
    if (!clean.sound) clean.sound = clean.mood ? `${lowercaseFirst(clean.mood)} ambience` : 'subtle room tone';
    if (!clean.sfx) clean.sfx = 'gentle cloth rustle';
    if (!clean.music) clean.music = 'light score';
  }

  const isRich = detailLevel === 'rich';
  const isMinimal = detailLevel === 'minimal';
  const subjectTraits = isRich ? `${clean.subject_traits}, finely textured` : isMinimal ? 'clean' : clean.subject_traits;

  const outfitBits = [
    clean.wardrobe && `dressed in ${lowercaseFirst(clean.wardrobe)}`,
    clean.prop_action && clean.prop_weapon ? `${clean.prop_action} ${clean.prop_weapon}` : '',
    !isMinimal && clean.hair_face_detail && clean.hair_face_detail.trim() ? `with ${lowercaseFirst(clean.hair_face_detail)}` : '',
  ].filter(Boolean).join(' and ');

  const sigBits = isMinimal ? [] : [clean.sig1, clean.sig2].filter(Boolean).map(lowercaseFirst);
  const sigText = sigBits.length > 1 
    ? `distinctive visual elements: ${sigBits.join(' and ')}` 
    : (sigBits[0] ? `characterized by ${sigBits[0]}` : '');

  const shotDesc = lowercaseFirst(withCaptureWord(clean.shot_type, captureWord));
  const roleDesc = lowercaseFirst(clean.subject_role);
  const poseDesc = lowercaseFirst(clean.pose_action);
  
  const baseParts = [
    `${clean.genre_style} unfolds with a ${shotDesc} of a ${subjectTraits} ${roleDesc} in a ${poseDesc} pose`,
  ];
  if (outfitBits) baseParts.push(`${outfitBits}`);
  if (sigText) baseParts.push(`${sigText}`);
  const base = baseParts.join(', ') + '.';

  const envText = clean.environment_texture 
    ? `${lowercaseFirst(clean.environment_texture)} ${lowercaseFirst(clean.environment)}` 
    : lowercaseFirst(clean.environment);
  const weatherDesc = lowercaseFirst(clean.weather);
  const lightingDesc = lowercaseFirst(clean.lighting);
  const interactionDesc = lowercaseFirst(clean.light_interaction);
  const intensityModifier = clean.lighting_intensity ? ` with ${lowercaseFirst(clean.lighting_intensity)} intensity` : '';
  // Avoid double "light" if lighting already includes a terminal light-word
  // (e.g., "Neon rim light", "Soft toon lighting", "Studio key illumination").
  const lightingSuffix = /(light|lighting|illumination)\s*$/.test(lightingDesc.toLowerCase()) ? '' : ' light';
  const scene = `The setting unfolds in ${envText} beneath ${weatherDesc} skies, bathed in ${lightingDesc}${lightingSuffix} that ${interactionDesc}${intensityModifier}.`;

  const audioSentenceBits: string[] = [];
  if (clean.sound && clean.sound.trim()) audioSentenceBits.push(`an ambient soundscape of ${lowercaseFirst(naturalizeMulti(clean.sound))}`);
  if (clean.sfx && clean.sfx.trim()) audioSentenceBits.push(`layered with ${lowercaseFirst(naturalizeMulti(clean.sfx))}`);
  if (clean.music && clean.music.trim()) audioSentenceBits.push(`underscored by ${lowercaseFirst(clean.music)}`);
  if (clean.mix_notes && clean.mix_notes.trim()) audioSentenceBits.push(`mix balanced with ${lowercaseFirst(clean.mix_notes)}`);
  const sound = audioSentenceBits.length 
    ? `The audio landscape features ${audioSentenceBits.join(', ')}.` 
    : '';

  let dialogue = '';
  if (clean.dialogue && clean.dialogue.trim()) {
    const pronoun = (clean.pronoun || '').trim();
    const verb = (clean.dialogue_verb || '').trim();
    if (pronoun && verb) {
      dialogue = `${lowercaseFirst(pronoun)} ${lowercaseFirst(verb)}, saying: "${clean.dialogue}"`;
    } else if (pronoun) {
      dialogue = `${lowercaseFirst(pronoun)} speaks: "${clean.dialogue}"`;
    } else {
      dialogue = `A voice carries across the scene: "${clean.dialogue}"`;
    }
  }

  const mood = clean.mood ? `The emotional atmosphere carries a sense of ${lowercaseFirst(clean.mood)}.` : '';
  
  const qualityBits = [] as string[];
  if (!isMinimal && clean.lens) {
    const lensText = lowercaseFirst(clean.lens);
    qualityBits.push(/\blens\b/i.test(lensText) ? lensText : `${lensText} lens`);
  }
  if (!isMinimal && clean.color_grade) qualityBits.push(`${lowercaseFirst(clean.color_grade)} color grading`);
  if (!isMinimal && clean.framing_notes) qualityBits.push(`${lowercaseFirst(clean.framing_notes)} framing`);
  if (!isMinimal && clean.film_details) qualityBits.push(`${lowercaseFirst(clean.film_details)}`);
  if (isRich) qualityBits.push('microtexture detail and layered depth cues');
  const quality = qualityBits.length 
    ? `The visual language is enhanced by ${qualityBits.join(', ')}.` 
    : '';

  const cameraAction = lowercaseFirst(clean.camera_move);
  const camera = `Throughout, the camera ${cameraAction}, drawing focus toward ${lowercaseFirst(clean.focus_target)}.`;

  const nsfwElements = [] as string[];
  if (clean.explicit_abilities && clean.explicit_abilities.trim()) nsfwElements.push(`exhibiting ${lowercaseFirst(clean.explicit_abilities)}`);
  if (clean.body_description && clean.body_description.trim()) nsfwElements.push(`displaying ${lowercaseFirst(clean.body_description)}`);
  if (clean.sexual_description && clean.sexual_description.trim()) nsfwElements.push(lowercaseFirst(clean.sexual_description));
  const nsfwText = nsfwElements.length ? ` The scene is further defined by ${nsfwElements.join(', ')}.` : '';

  const core = [base, scene, sound, dialogue, quality, mood, camera, nsfwText]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (format !== 'ltx2') {
    const timeline = actionTimeline
      ? actionTimeline.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      : [];
    const trimmedTimeline = isMinimal ? timeline.slice(0, 1) : timeline;
    const actionsSentence = trimmedTimeline.length 
      ? `As the scene unfolds: ${trimmedTimeline.join('; ')}.` 
      : '';
    return [core, actionsSentence].filter(Boolean).join(' ');
  }

  const actions = [] as string[];
  if (actionTimeline) {
    const rawActions = actionTimeline.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    actions.push(...(isMinimal ? rawActions.slice(0, 1) : rawActions));
  } else {
    if (clean.pose_action) actions.push(clean.pose_action);
    if (clean.camera_move) actions.push(`Camera movement: ${clean.camera_move}`);
  }

  const visuals = [] as string[];
  visuals.push(`${clean.genre_style} aesthetic`);
  visuals.push(`${shotDesc} composition`);
  visuals.push(`Subject: ${subjectTraits} ${roleDesc}`);
  if (!isMinimal && clean.wardrobe) visuals.push(`Wardrobe: ${lowercaseFirst(clean.wardrobe)}`);
  if (isRich && clean.hair_face_detail) visuals.push(`Appearance details: ${lowercaseFirst(clean.hair_face_detail)}`);
  visuals.push(`Environment: ${envText}`);
  visuals.push(`Weather conditions: ${weatherDesc}`);
  visuals.push(`Lighting design: ${lightingDesc} that ${interactionDesc}${clean.lighting_intensity ? ` at ${lowercaseFirst(clean.lighting_intensity)} intensity` : ''}`);
  if (isRich && clean.sig1) visuals.push(`Signature element: ${sigBits[0] || clean.sig1}`);
  if (isRich && clean.sig2) visuals.push(`Signature element: ${sigBits[1] || clean.sig2}`);
  if (!isMinimal && clean.lens) visuals.push(`Lens choice: ${lowercaseFirst(clean.lens)}`);
  if (!isMinimal && clean.color_grade) visuals.push(`Color grading: ${lowercaseFirst(clean.color_grade)}`);
  if (clean.mood) visuals.push(`Mood: ${lowercaseFirst(clean.mood)}`);
  if (!isMinimal && clean.framing_notes) visuals.push(`Framing approach: ${lowercaseFirst(clean.framing_notes)}`);
  if (clean.focus_target) visuals.push(`Focus priority: ${lowercaseFirst(clean.focus_target)}`);

  const audio = [] as string[];
  if (clean.sound) audio.push(`Ambient environment: ${lowercaseFirst(naturalizeMulti(clean.sound))}`);
  if (clean.sfx) audio.push(`Sound effects: ${lowercaseFirst(naturalizeMulti(clean.sfx))}`);
  if (clean.music) audio.push(`Musical underscore: ${lowercaseFirst(clean.music)}`);
  if (clean.mix_notes) audio.push(`Mix balance: ${lowercaseFirst(clean.mix_notes)}`);
  if (clean.dialogue && clean.dialogue.trim()) {
    const pronoun = (clean.pronoun || '').trim();
    const verb = (clean.dialogue_verb || '').trim();
    const dialogueText = pronoun && verb 
      ? `Dialogue: ${lowercaseFirst(pronoun)} ${lowercaseFirst(verb)}, "${clean.dialogue}"` 
      : `Dialogue: "${clean.dialogue}"`;
    audio.push(dialogueText);
  }

  const nsfw = nsfwElements.length
    ? nsfwElements.map(el => el.charAt(0).toUpperCase() + el.slice(1))
    : [];

  return [
    formatLtx2Section('Core Actions', actions),
    formatLtx2Section('Visual Details', visuals),
    formatLtx2Section('Audio', audio),
    formatLtx2Section('NSFW', nsfw),
  ].filter(Boolean).join('\n\n');
}

function buildClassicParagraph(
  data: ClassicData,
  captureWord: CaptureWord,
  format: PromptFormat = 'paragraph',
  detailLevel: DetailLevel = 'balanced',
  autoFillAudio = true,
  autoFillCamera = true
): string {
  if (autoFillCamera && !data.camera) data.camera = 'steady cam';
  if (!data.focus_target) data.focus_target = 'the subject';
  if (autoFillAudio) {
    if (!data.audio) data.audio = 'quiet ambience';
    if (!data.sfx) data.sfx = 'soft cloth rustle';
    if (!data.music) data.music = 'light score';
  }

  const isRich = detailLevel === 'rich';
  const isMinimal = detailLevel === 'minimal';

  if (format === 'ltx2') {
    const coreActions = [] as string[];
    if (data.action) coreActions.push(data.action);
    if (data.camera) coreActions.push(`Camera movement: ${data.camera}`);

    const visuals = [] as string[];
    visuals.push(`${withCaptureWord(data.shot, captureWord)} with ${lowercaseFirst(data.genre)} tone`);
    if (data.subject) visuals.push(`Subject: ${lowercaseFirst(data.subject)}`);
    if (!isMinimal && data.wardrobe) visuals.push(`Wardrobe: ${lowercaseFirst(data.wardrobe)}`);
    const envText = data.environment_texture ? `${lowercaseFirst(data.environment_texture)} ${lowercaseFirst(data.environment || 'the scene')}` : (lowercaseFirst(data.environment || 'the scene'));
    visuals.push(`Setting: ${envText}`);
    visuals.push(`Lighting: ${lowercaseFirst(data.lighting)}${data.lighting_intensity ? ` with ${lowercaseFirst(data.lighting_intensity)} intensity` : ''}`);
    if (!isMinimal && data.palette) visuals.push(`Color palette: ${lowercaseFirst(data.palette)}`);
    if (!isMinimal && data.framing_notes) visuals.push(`Framing: ${lowercaseFirst(data.framing_notes)}`);
    if (data.focus_target) visuals.push(`Focus: ${lowercaseFirst(data.focus_target)}`);
    if (isRich && data.environment_texture) visuals.push(`Texture: ${lowercaseFirst(data.environment_texture)}`);

    const audio = [] as string[];
    if (data.audio) audio.push(`Ambient sound: ${lowercaseFirst(naturalizeMulti(data.audio))}`);
    if (!isMinimal && data.sfx) audio.push(`Sound effects: ${lowercaseFirst(naturalizeMulti(data.sfx))}`);
    if (data.music) audio.push(`Musical score: ${lowercaseFirst(data.music)}`);
    if (data.mix_notes) audio.push(`Mix balance: ${lowercaseFirst(data.mix_notes)}`);
    if (data.dialogue) audio.push(`Dialogue: "${data.dialogue}"`);

    return [
      formatLtx2Section('Core Actions', coreActions),
      formatLtx2Section('Visual Details', visuals),
      formatLtx2Section('Audio', audio),
    ].filter(Boolean).join('\n\n');
  }

  const envText = data.environment_texture ? `${lowercaseFirst(data.environment_texture)} ${lowercaseFirst(data.environment || 'the scene')}` : (lowercaseFirst(data.environment || 'the scene'));
  const intensityText = data.lighting_intensity ? ` with ${lowercaseFirst(data.lighting_intensity)} intensity` : '';
  
  const bits = [] as string[];
  bits.push(`A ${withCaptureWord(data.shot, captureWord)}`);
  bits.push(`capturing a ${lowercaseFirst(data.genre)} aesthetic`);
  if (data.subject) bits.push(`that features ${lowercaseFirst(data.subject)}`);
  if (!isMinimal && data.wardrobe) bits.push(`attired in ${lowercaseFirst(data.wardrobe)}`);
  bits.push(`set within ${envText}`);
  bits.push(`at ${data.time}`);
  bits.push(`under ${lowercaseFirst(data.lighting)} illumination${intensityText}`);
  if (!isMinimal && data.atmosphere && data.atmosphere !== 'clear air') bits.push(`amid ${lowercaseFirst(data.atmosphere)}`);
  bits.push(`with the camera ${lowercaseFirst(data.camera)}`);
  if (!isMinimal && data.framing_notes) bits.push(`utilizing ${lowercaseFirst(data.framing_notes)} framing`);
  if (!isMinimal && data.palette) bits.push(`rendered in ${lowercaseFirst(data.palette)}`);
  if (data.action) bits.push(`as the action unfolds: ${data.action}`);
  if (data.focus_target) bits.push(`with attention drawn to ${lowercaseFirst(data.focus_target)}`);
  if (data.audio) bits.push(`accompanied by ${lowercaseFirst(naturalizeMulti(data.audio))} in the ambient environment`);
  if (!isMinimal && data.sfx) bits.push(`layered with ${lowercaseFirst(naturalizeMulti(data.sfx))}`);
  if (data.music) bits.push(`underscored by ${lowercaseFirst(data.music)}`);
  if (data.mix_notes) bits.push(`balanced with ${lowercaseFirst(data.mix_notes)}`);
  if (data.dialogue) bits.push(`and dialogue that reads: "${data.dialogue}"`);
  if (!isMinimal && data.avoid) bits.push(`while avoiding ${lowercaseFirst(data.avoid)}`);
  
  return bits.join(', ').replace(/,\s+/g, ', ').trim() + '.';
}

function buildPrompt(
  mode: string,
  values: Record<string, Record<string, string>>,
  nsfwEnabled: boolean,
  _optionSets: OptionSets,
  captureWord: CaptureWord = 'shot',
  promptFormat: PromptFormat = 'ltx2',
  detailLevel: DetailLevel = 'balanced',
  autoFillAudio = true,
  autoFillCamera = true
) {
  const current = values[mode] || {};

  const pick = (field: string, fallback = '') => {
    return values[mode]?.[field] || fallback;
  };

  const buildAppearanceSnippet = (body: string, hair: string, eyes: string) => {
    const bits: string[] = [];
    const bodyText = (body || '').trim();
    const hairText = (hair || '').trim();
    const eyesText = (eyes || '').trim();

    if (bodyText) bits.push(bodyText);
    if (hairText) bits.push(/\bhair\b/i.test(hairText) ? hairText : `${hairText} hair`);
    if (eyesText) bits.push(/\beye\b/i.test(eyesText) ? eyesText : `${eyesText} eyes`);

    return bits.join(', ');
  };

  if (mode === 'classic') {
    const appearance = buildAppearanceSnippet(pick('bodyDescriptor', ''), pick('hairColor', ''), pick('eyeColor', ''));
    const baseSubject = pick('role', '');
    const subject = appearance
      ? (baseSubject ? `${baseSubject} with ${appearance}` : `subject with ${appearance}`)
      : baseSubject;
    const data: ClassicData = {
      genre: pick('genre', 'Classic scene'),
      shot: pick('shot', 'medium'),
      subject,
      wardrobe: pick('wardrobe', ''),
      environment: pick('environment', 'the scene'),
      environment_texture: pick('environmentTexture', ''),
      time: 'dusk',
      lighting: pick('lighting', 'soft light'),
      lighting_intensity: pick('lightingIntensity', ''),
      atmosphere: 'clear air',
      camera: pick('cameraMove', 'steady cam'),
      palette: pick('colorGrade', ''),
      action: ((current.actions || '').trim()) || buildMovementLines(current).join('; '),
      audio: pick('sound', ''),
      sfx: pick('sfx', ''),
      music: pick('music', ''),
      mix_notes: (current.mix_notes || '').trim(),
      dialogue: current.dialogue || '',
      avoid: '',
      framing_notes: pick('framingNotes', ''),
      focus_target: pick('focusTarget', ''),
    };
    return buildClassicParagraph(data, captureWord, promptFormat, detailLevel, autoFillAudio, autoFillCamera);
  }

  if (mode === 'drone') {
    const movementTimeline = buildMovementLines(current).join('\n');
    const actionTimeline = ((current.actions || '').trim()) || movementTimeline;

    const genre = pick('genre', 'Drone landscape footage');
    const shotType = pick('shot', 'wide aerial');
    const focus = pick('role', 'the environment');
    const motionEmphasis = pick('pose', 'slow drifting reveal');
    const sceneDetails = pick('wardrobe', '');
    const environment = pick('environment', 'vast terrain');
    const environmentTexture = pick('environmentTexture', '');
    const weather = pick('weather', 'clear air');
    const lighting = pick('lighting', 'soft light');
    const lightingIntensity = pick('lightingIntensity', '');
    const lightInteraction = pick('lightInteraction', 'wraps gently');
    const mood = pick('mood', '');
    const cameraMove = pick('cameraMove', 'smooth flyover');
    const lens = pick('lens', '');
    const colorGrade = pick('colorGrade', '');
    const framingNotes = pick('framingNotes', '');
    const focusTarget = pick('focusTarget', focus);

    let sound = pick('sound', '');
    let sfx = pick('sfx', '');
    let music = pick('music', '');
    const mixNotes = (current.mix_notes || '').trim();

    if (autoFillAudio) {
      if (!sound) sound = mood ? `${lowercaseFirst(mood)} ambience` : 'natural ambience';
      if (!sfx) sfx = 'subtle wind texture';
      if (!music) music = 'light atmospheric score';
    }

    const envText = environmentTexture
      ? `${lowercaseFirst(environmentTexture)} ${lowercaseFirst(environment)}`
      : lowercaseFirst(environment);
    const shotDesc = lowercaseFirst(withCaptureWord(shotType, captureWord));
    const lightingDesc = lowercaseFirst(lighting);
    const lightingSuffix = /(light|lighting|illumination)\s*$/.test(lightingDesc.toLowerCase()) ? '' : ' light';

    if (promptFormat !== 'ltx2') {
      const base = `An environment-first ${genre} with a ${shotDesc} focused on ${lowercaseFirst(focus)}${motionEmphasis ? `, emphasizing ${lowercaseFirst(motionEmphasis)}` : ''}.`;
      const scene = `The setting unfolds in ${envText} beneath ${lowercaseFirst(weather)} skies, bathed in ${lightingDesc}${lightingSuffix} that ${lowercaseFirst(lightInteraction)}${lightingIntensity ? ` with ${lowercaseFirst(lightingIntensity)} intensity` : ''}.`;
      const details = sceneDetails ? `Scene details include ${lowercaseFirst(sceneDetails)}.` : '';
      const audioBits: string[] = [];
      if (sound) audioBits.push(`an ambient soundscape of ${lowercaseFirst(naturalizeMulti(sound))}`);
      if (sfx) audioBits.push(`layered with ${lowercaseFirst(naturalizeMulti(sfx))}`);
      if (music) audioBits.push(`underscored by ${lowercaseFirst(music)}`);
      if (mixNotes) audioBits.push(`mix balanced with ${lowercaseFirst(mixNotes)}`);
      const audioSentence = audioBits.length ? `The audio landscape features ${audioBits.join(', ')}.` : '';
      const qualityBits: string[] = [];
      if (lens) qualityBits.push(`${lowercaseFirst(lens)} lens`);
      if (colorGrade) qualityBits.push(`${lowercaseFirst(colorGrade)} color grading`);
      if (framingNotes) qualityBits.push(`${lowercaseFirst(framingNotes)} framing`);
      const quality = qualityBits.length ? `The visual language is enhanced by ${qualityBits.join(', ')}.` : '';
      const camera = `Throughout, the camera ${lowercaseFirst(autoFillCamera && !cameraMove ? 'steady cam' : cameraMove)}, drawing focus toward ${lowercaseFirst(focusTarget)}.`;
      const timeline = actionTimeline
        ? actionTimeline.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
        : [];
      const actionsSentence = timeline.length ? `As the scene unfolds: ${timeline.join('; ')}.` : '';
      return [base, scene, details, audioSentence, quality, mood ? `The emotional atmosphere carries a sense of ${lowercaseFirst(mood)}.` : '', camera, actionsSentence]
        .filter(Boolean)
        .join(' ');
    }

    const actions: string[] = [];
    if (actionTimeline) {
      const rawActions = actionTimeline.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      actions.push(...(detailLevel === 'minimal' ? rawActions.slice(0, 1) : rawActions));
    }
    if (cameraMove) actions.push(`Camera movement: ${cameraMove}`);
    if (motionEmphasis) actions.push(`Motion emphasis: ${motionEmphasis}`);

    const visuals: string[] = [];
    visuals.push(`${genre} aesthetic`);
    visuals.push(`${shotDesc} composition`);
    visuals.push(`Focus: ${lowercaseFirst(focus)}`);
    if (sceneDetails) visuals.push(`Scene details: ${lowercaseFirst(sceneDetails)}`);
    visuals.push(`Environment: ${envText}`);
    visuals.push(`Weather conditions: ${lowercaseFirst(weather)}`);
    visuals.push(`Lighting design: ${lowercaseFirst(lighting)} that ${lowercaseFirst(lightInteraction)}${lightingIntensity ? ` at ${lowercaseFirst(lightingIntensity)} intensity` : ''}`);
    if (detailLevel !== 'minimal' && lens) visuals.push(`Lens choice: ${lowercaseFirst(lens)}`);
    if (detailLevel !== 'minimal' && colorGrade) visuals.push(`Color grading: ${lowercaseFirst(colorGrade)}`);
    if (mood) visuals.push(`Mood: ${lowercaseFirst(mood)}`);
    if (detailLevel !== 'minimal' && framingNotes) visuals.push(`Framing approach: ${lowercaseFirst(framingNotes)}`);
    if (focusTarget) visuals.push(`Focus priority: ${lowercaseFirst(focusTarget)}`);

    const audio: string[] = [];
    if (sound) audio.push(`Ambient environment: ${lowercaseFirst(naturalizeMulti(sound))}`);
    if (sfx) audio.push(`Sound effects: ${lowercaseFirst(naturalizeMulti(sfx))}`);
    if (music) audio.push(`Musical underscore: ${lowercaseFirst(music)}`);
    if (mixNotes) audio.push(`Mix balance: ${lowercaseFirst(mixNotes)}`);

    return [
      formatLtx2Section('Core Actions', actions),
      formatLtx2Section('Visual Details', visuals),
      formatLtx2Section('Audio', audio),
    ].filter(Boolean).join('\n\n');
  }

  // Cinematic and NSFW both use the cinematic paragraph builder
  const isAnimation = mode === 'animation';
  let genreStyle = pick('genre', isAnimation ? 'Animated scene' : 'Cinematic scene');
  if (isAnimation && !/(animat|anime|toon|cartoon|2d|3d|cg)/i.test(genreStyle)) {
    genreStyle = `${genreStyle}, animated`;
  }

  const appearance = buildAppearanceSnippet(pick('bodyDescriptor', ''), pick('hairColor', ''), pick('eyeColor', ''));

  const data: CinematicData = {
    genre_style: genreStyle,
    shot_type: pick('shot', 'wide'),
    subject_traits: isAnimation ? 'stylized' : 'detailed',
    subject_role: pick('role', isAnimation ? 'character' : 'subject'),
    pose_action: pick('pose', isAnimation ? 'dynamic' : 'standing'),
    wardrobe: pick('wardrobe', ''),
    prop_action: '',
    prop_weapon: '',
    hair_face_detail: appearance,
    sig1: pick('sig1', isAnimation ? 'stylized linework accents' : 'atmospheric haze'),
    sig2: pick('sig2', isAnimation ? 'expressive shading' : 'soft rim light'),
    environment: pick('environment', 'unspecified environment'),
    environment_texture: pick('environmentTexture', ''),
    weather: pick('weather', 'clear air'),
    lighting: pick('lighting', 'soft light'),
    lighting_intensity: pick('lightingIntensity', ''),
    light_interaction: pick('lightInteraction', 'wraps gently'),
    sound: pick('sound', 'quiet ambience'),
    sfx: pick('sfx', ''),
    music: pick('music', ''),
    mix_notes: (current.mix_notes || '').trim(),
    dialogue: current.dialogue || '',
    pronoun: current.pronoun || '',
    dialogue_verb: current.dialogue_verb || '',
    mood: pick('mood', ''),
    lens: pick('lens', ''),
    color_grade: pick('colorGrade', ''),
    framing_notes: pick('framingNotes', ''),
    film_details: '',
    camera_move: pick('cameraMove', 'slow push'),
    focus_target: pick('focusTarget', isAnimation ? 'the character' : 'the subject'),
    explicit_abilities: nsfwEnabled ? current.explicit_abilities || '' : '',
    body_description: nsfwEnabled ? current.body_description || '' : '',
    sexual_description: nsfwEnabled ? current.sexual_description || '' : '',
  };

  const movementTimeline = buildMovementLines(current).join('\n');
  const actionTimeline = ((current.actions || '').trim()) || movementTimeline;
  return buildCinematicParagraph(data, captureWord, promptFormat, actionTimeline, detailLevel, autoFillAudio, autoFillCamera);
}

// Project management
function loadProjects(): Project[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

// Favorites
function loadFavorites(): Favorites | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveFavorites(favorites: Favorites) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // ignore
  }
}

// History
function loadHistory(): History | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveHistory(history: History) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

// Locked steps
function loadLockedSteps(): LockedSteps | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCKED_STEPS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLockedSteps(lockedSteps: LockedSteps) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCKED_STEPS_STORAGE_KEY, JSON.stringify(lockedSteps));
  } catch {
    // ignore
  }
}

// Ollama settings
function loadOllamaSettings(): OllamaSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(OLLAMA_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_OLLAMA_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function saveOllamaSettings(settings: OllamaSettings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OLLAMA_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function normalizeOptions(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const v = (raw || '').trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function mergeOptionSets(base: OptionSets, override?: Partial<OptionSets> | null): OptionSets {
  const merged: OptionSets = JSON.parse(JSON.stringify(base));
  if (!override) return merged;
  for (const [mode, fields] of Object.entries(override)) {
    if (!fields) continue;
    merged[mode] = merged[mode] || {};
    for (const [field, list] of Object.entries(fields as Record<string, unknown>)) {
      if (!Array.isArray(list)) continue;
      merged[mode][field] = normalizeOptions(list.map(String));
    }
  }
  return merged;
}

function loadOptionSets(): Partial<OptionSets> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(OPTION_SETS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveOptionSets(optionSets: OptionSets) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OPTION_SETS_STORAGE_KEY, JSON.stringify(optionSets));
  } catch {
    // ignore
  }
}

function loadUiPrefs(): UiPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(UI_PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    const cw = parsed.captureWord;
    const captureWord: CaptureWord = cw === 'video' || cw === 'clip' || cw === 'frame' ? cw : 'shot';
    const pf = parsed.promptFormat;
    const promptFormat: PromptFormat = pf === 'paragraph' ? 'paragraph' : 'ltx2';
    const dl = parsed.detailLevel;
    const detailLevel: DetailLevel = dl === 'minimal' || dl === 'rich' ? dl : 'balanced';
    const autoFillAudio = parsed.autoFillAudio ?? DEFAULT_UI_PREFS.autoFillAudio;
    const autoFillCamera = parsed.autoFillCamera ?? DEFAULT_UI_PREFS.autoFillCamera;
    const previewFontScale = typeof parsed.previewFontScale === 'number'
      ? Math.min(1.25, Math.max(0.85, parsed.previewFontScale))
      : DEFAULT_UI_PREFS.previewFontScale;
    return {
      typingEnabled: parsed.typingEnabled !== false,
      typingSpeedMs: typeof parsed.typingSpeedMs === 'number' ? parsed.typingSpeedMs : 14,
      captureWord,
      autoCopyOnReview: parsed.autoCopyOnReview === true,
      promptFormat,
      detailLevel,
      autoFillAudio,
      autoFillCamera,
      previewFontScale,
    };
  } catch {
    return null;
  }
}

function saveUiPrefs(prefs: UiPrefs) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UI_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function TypewriterText({
  text,
  speedMs = 14,
  startDelayMs = 120,
}: {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
}) {
  const [out, setOut] = useState('');

  useEffect(() => {
    let alive = true;
    let i = 0;
    let interval: number | undefined;
    setOut('');

    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (!alive) return;
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          if (interval) window.clearInterval(interval);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      alive = false;
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);

  return (
    <span className="typewriter">
      {out}
      <span className="tw-caret" aria-hidden="true" />
    </span>
  );
}






