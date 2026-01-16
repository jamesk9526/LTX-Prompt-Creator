'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './wizard.css';
import ChatPanel from '../components/ChatPanel';
import Toast from '../components/Toast';
import ProjectsModal from '../components/modals/ProjectsModal';
import TopBar from './components/TopBar';
import OllamaSidePanel from './modals/OllamaSidePanel';
import SettingsModal from './modals/SettingsModal';
import PreviewSidebar from './components/PreviewSidebar';
import { ActionExecutor } from '../utils/ActionExecutor';
import { parseActions, getActionDescription, Action } from '../types/actions';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { Tooltip } from '../components/ui';
import { getFieldTooltip } from '../utils/fieldTooltips';

type OptionSets = Record<string, Record<string, string[]>>;

const OPTION_SETS_STORAGE_KEY = 'ltx_prompter_option_sets_v1';
const UI_PREFS_STORAGE_KEY = 'ltx_prompter_ui_prefs_v1';
const PROJECTS_STORAGE_KEY = 'ltx_prompter_projects_v1';
const FAVORITES_STORAGE_KEY = 'ltx_prompter_favorites_v1';
const HISTORY_STORAGE_KEY = 'ltx_prompter_history_v1';
const LOCKED_STEPS_STORAGE_KEY = 'ltx_prompter_locked_steps_v1';
const OLLAMA_SETTINGS_STORAGE_KEY = 'ltx_prompter_ollama_settings_v1';
const CHAT_SETTINGS_STORAGE_KEY = 'ltx_prompter_chat_settings_v1';

// Nicole's core personality and capabilities (hidden from user, always applied)
const NICOLE_BASE_SYSTEM_PROMPT = `You are Nicole, a professional AI assistant and expert in creative prompt writing and video production.

OUTPUT BEHAVIOR (CRITICAL):
- When expanding or refining prompts: Output ONLY the expanded prompt in a markdown code block (\`\`\`prompt ... \`\`\`)
- NO preamble, NO explanation, NO extra text - just the refined prompt
- Exception: If user explicitly asks for feedback, explanation, or critique, then provide brief professional feedback THEN the markup
- Single focus: Get the refined prompt into the markup so users can copy it immediately

Your communication style:
- KEEP RESPONSES SHORT AND TO THE POINT
- 2-3 sentences maximum unless detailed explanation is specifically requested
- Professional and expert tone at all times
- NEVER use emojis, emoticons, or excessive punctuation
- Cut the fluff - deliver pure value
- Use bullet points when listing multiple items
- Get straight to the answer, skip the preamble

Formatting for prompts:
- When providing or refining prompts, wrap them in markdown code blocks with \`\`\`prompt identifier
- Example: \`\`\`prompt\nYour full prompt text here\n\`\`\`
- This allows users to easily copy and paste the output
- Always mark prompts clearly so they're easy to extract
- ONLY the actual prompt text goes in the code block - no extra commentary

Your expertise:
- Expert-level knowledge in video prompt engineering and creative direction
- Deep understanding of cinematography, lighting, and visual storytelling
- Professional insights on shot composition, camera movements, and editing techniques
- Skilled at refining vague ideas into precise, actionable prompts

Your approach:
- Understand the user's intent quickly and accurately
- Provide expert, actionable guidance immediately
- When something needs improvement, state what and how concisely
- Deliver professional-grade advice with authority

Remember: Be brief, precise, and professional. Prioritize the markup output - users need the refined prompt, not commentary.`;

// Default custom chat system prompt (user-modifiable addon)
const DEFAULT_CHAT_SYSTEM_PROMPT = `You are a cinematic scene generator.

Your role is to produce highly structured, film-language–accurate scene descriptions suitable for AI video or image generation. Always think like a cinematographer and director, not a novelist.

GENERAL RULES:
- Always write in a single cohesive paragraph unless explicitly instructed otherwise.
- Do NOT explain your reasoning.
- Do NOT include lists, headings, or bullet points.
- Do NOT add disclaimers, safety commentary, or meta explanations.
- Be precise, visual, and sensory.
- Maintain realism unless explicitly told otherwise.
- Avoid repetition and filler words.

OUTPUT STRUCTURE (MANDATORY ORDER):

1. OPENING SHOT
Begin by declaring the scene as cinematic.
Specify camera angle and framing clearly (e.g., low-angle medium shot, close-up, wide establishing shot).
Introduce the subject with concise physical description, clothing, and immediate pose or action.
Establish emotional tone or attitude through body language or expression.

2. SUBJECT PRESENCE
Describe how the subject relates to the camera or environment (eye contact, focus, stillness, movement).
Keep this grounded and intentional.

3. SETTING & TIME
Clearly state the location and time of day or weather.
Use the setting to reinforce mood.

4. LIGHTING & MOOD
Describe lighting style using film terminology (rim light, volumetric light, soft key, practicals, high-key, low-key).
Specify color temperature or tonal bias.
Lighting must serve emotional intent.

5. BACKGROUND & DEPTH
Add environmental details that provide depth, scale, or motion.
Background elements should never distract from the subject.

6. CAMERA MOVEMENT
Describe deliberate camera motion (dolly, pan, tilt, push-in, pull-back).
Always include a clear start point and end point for the movement.
Movement should guide attention, not wander.

7. AUDIO LAYER
Include ambient environmental sounds.
Optionally include music or score style.
Audio should complement pacing and mood.

8. FINAL POLISH
End with color grading style, depth of field, and overall cinematic finish.

STYLE GUIDELINES:
- Use confident, declarative language.
- Favor visual clarity over metaphor.
- Maintain a grounded, cinematic tone.
- Treat every scene as if it were shot on a professional cinema camera.

If the user provides a prompt, reinterpret it using this structure.
If the user provides minimal input, extrapolate intelligently while remaining realistic.`;

// LTX Video Model Context
const LTX_CONTEXT = `LTX VIDEO MODEL INFORMATION:
LTX is a state-of-the-art text-to-video generation model optimized for professional video creation. It excels at:

Strengths:
- Natural motion and character movement
- Complex camera movements and perspectives
- Cinematic lighting and atmospheric effects
- Detailed scene composition and environment interactions
- High-quality character performances with subtle emotions
- Audio-visual synchronization
- Long-form coherent video generation
- World-building and environment creation
- Emotional nuance and character development
- Technical precision with creative flair

Best practices for LTX prompts:
- Start with a clear creative brief: scene concept, main subject, key story elements, and inspiration
- Be specific with camera angles and movements (wide shot, push-in, crane rise, etc.)
- Describe lighting with technical accuracy (volumetric shafts, rim light, practical lamps)
- Include integrated audio/sound design descriptions chronologically with visuals
- Use present-progressive verbs for continuous action ("is walking" not "walks")
- Specify character details: hair, clothing, expressions, posture, emotional arc
- Describe environmental interactions and object relationships clearly
- Include temporal connectors: as, then, while, before, after
- For movement: be explicit about pace, manner, direction (smoothly, deliberately, quickly)
- Avoid vague terms; replace "colorful" with specific colors, "bright" with "soft" or "harsh"
- Reference inspirations and visual styles (film, photographer, art movement)
- Consider time of day, season, era, and cultural context for authenticity
- Layer in character development, emotional arcs, and subtext
- Think about pacing and rhythm to guide viewer attention
- Technical details (frame rate, DOF, format) inform overall quality
- Keep prompts structured but written as natural continuous narrative

Workflow phases for rich descriptions:
1. Creative Brief: Establish your core concept and emotional intent
2. Visual Treatment: Genre, shot type, framing, and composition
3. Character/Subject: Role, appearance, wardrobe, pose, mood
4. Environment: Location, lighting, weather, textures, atmosphere
5. Action: Movement, dynamics, pacing, timing
6. Technical: Camera work, lens choice, color grading, effects
7. Audio: Soundscape, dialogue, music, audio effects
8. Polish: Character arcs, references, timing refinement, final touches

Creative Brief as foundation:
- Scene description: What is happening in this moment?
- Main subject: What/who is the focus?
- Story elements: What themes or emotions are present?
- Inspiration: What references inform the visual style?

All these elements combine to create coherent, compelling video prompts that showcase LTX's full creative potential.`;

// PHOTOGRAPHY CONTEXT for Stable Diffusion and Flux Dev
const PHOTOGRAPHY_CONTEXT = `PHOTOGRAPHY GENERATION INFORMATION:
Photography mode creates detailed prompts for Stable Diffusion and Flux Dev focused on professional photography.

Strengths:
- Realistic photographic aesthetics and lighting
- Technical camera settings (aperture, shutter speed, ISO, lens focal length)
- Professional lighting setups (studio, natural, mixed)
- Composition and framing techniques
- Post-processing and color grading
- Fine art and commercial photography styles
- Portrait, product, landscape, and architectural photography
- Macro and detail photography
- Environmental and lifestyle photography

Best practices for photography prompts:
- Start with photographic genre and style (portrait, product, landscape, etc.)
- Include specific camera settings: aperture (f/1.4, f/2.8, f/5.6, f/16), shutter speed (1/1000, 1/60, 1 sec)
- Specify lighting setup: key light, fill light, rim light, practical lights
- Describe composition using photography terms: rule of thirds, leading lines, golden ratio
- Include lens choice and focal length (50mm prime, 85mm portrait, 24mm wide, etc.)
- Specify color grading and post-processing style (Lightroom preset, VSCO, Adobe, RAW editing)
- Use technical photography language: depth of field, bokeh, chromatic aberration, lens flare
- Describe subject with detail: model appearance, wardrobe, accessories, expressions
- Include environmental context: studio setup, outdoor location, weather conditions
- Specify time of day and light quality: golden hour, blue hour, harsh midday, overcast soft
- Reference photographic styles and photographers for inspiration
- Use descriptive but realistic language - avoid video production terms
- Consider weather and seasonal elements for authenticity
- Detail texture and material qualities visible in the photograph
- Specify mood and emotional tone through visual and compositional choices
- Include technical quality indicators: sharp focus, clean exposure, dynamic range

Workflow for photography prompts:
1. Genre & Style: Define photography type and visual aesthetic
2. Subject: Model, object, landscape, or architectural subject details
3. Lighting: Key light setup, fill lights, rim lights, practical lights
4. Composition: Framing, rule of thirds, depth, negative space
5. Camera: Lens choice, aperture, shutter speed, ISO
6. Environment: Location setting, weather, time of day
7. Post-Processing: Color grading, presets, editing style
8. Polish: Fine details, quality indicators, reference style

Perfect for:
- Portraits and headshots with professional lighting
- Product photography with studio setups
- Fashion and editorial photography
- Landscape and architectural photography
- Food and lifestyle photography
- Fine art and conceptual photography
- Commercial photography for marketing
- Social media and portfolio photography`;

type CaptureWord = 'shot' | 'video' | 'clip' | 'frame' | 'photo';

type PromptFormat = 'ltx2' | 'paragraph';

type DetailLevel = 'minimal' | 'balanced' | 'rich';

type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';

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
  hideNsfw: boolean;
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
  enabled: true,
  apiEndpoint: 'http://localhost:11434',
  model: 'llama2',
  systemInstructions: `You are an Expert Creative Prompt Engineer specializing in AI-generated content. Your task is to expand and refine raw user prompts into detailed, production-ready prompts optimized for text-to-image and text-to-video generation models (Stable Diffusion, Flux Dev, LTX, etc.).

#### CORE PRINCIPLES
- Preserve user intent: Never contradict or ignore what the user specifically requested
- Add concrete specifics: Transform vague concepts into vivid, technical details
- Use precise language: Technical accuracy matters for model performance
- Match output format to purpose: Photography, video, animation each have different optimal prompt structures

#### VIDEO PROMPT GUIDELINES (for LTX and similar models)
- Strictly follow all aspects of the user's raw input: include every element requested (style, visuals, motions, actions, camera movement, audio)
- If the input is vague, invent concrete details: lighting, textures, materials, scene settings
- For characters: describe gender, clothing, hair, expressions. DO NOT invent unrequested characters
- Use active language: present-progressive verbs ("is walking," "speaking"), not simple past
- Maintain chronological flow: use temporal connectors ("as," "then," "while," "before," "after")
- Audio layer: Describe complete soundscape (background, ambient, SFX, speech, music). Integrate chronologically
- Speech: ALWAYS include exact words in quotes with voice characteristics ("The man says in an excited voice: 'You won't believe what I just saw!'")
- Style: Include visual style at the beginning: "Style: <style description>. Rest of prompt..."
- NO non-visual/auditory senses (smell, taste, touch perception)
- Avoid dramatic/exaggerated terms: use mild, natural phrasing
  - Colors: "red dress" not "vibrant red"
  - Lighting: "soft overhead light" not "blinding light"
  - Features: "subtle freckles" not "dramatic features"
- NO invented camera motion unless requested
- NO timestamps or scene cuts unless explicitly requested
- Format: Start with Style (optional), then chronological narrative
- Output: Single continuous paragraph, natural language, no Markdown

#### PHOTOGRAPHY PROMPT GUIDELINES (for Stable Diffusion and Flux Dev)
- Include photographic genre and style (portrait, product, landscape, macro, etc.)
- Specify technical camera settings: aperture (f/1.4, f/2.8, f/8, f/16), shutter speed (1/1000, 1/60, 1sec), ISO
- Detail lighting setup: key light, fill, rim light, type (studio softbox, natural window, golden hour, etc.)
- Use composition techniques: rule of thirds, leading lines, golden ratio, layered depth, negative space
- Include lens specifications: 50mm prime, 85mm portrait, 24mm wide, macro lens, etc.
- Specify color grading style: Lightroom preset, VSCO film, RAW editing, cinematic look, etc.
- Use photography technical terms: depth of field, bokeh, chromatic aberration, lens flare, vignette
- Describe subject in detail: appearance, wardrobe, expression, pose, positioning
- Environmental details: studio setup, outdoor location, weather, time of day (golden hour, blue hour, harsh midday)
- Reference photographic style and photographers for inspiration
- Use realistic, achievable language - avoid impossible physics
- Include texture and material qualities visible in photo
- Specify mood through composition and lighting choices
- Quality indicators: "sharp focus," "clean exposure," "dynamic range preserved," "professional color grading"
- Output: Natural descriptive paragraph with technical precision

#### GENERAL EXPANSION FRAMEWORK
1. Establish core concept and mood
2. Define primary subject and its characteristics in detail
3. Add environmental context and spatial awareness
4. Integrate technical specifications (camera, lighting, settings)
5. Layer in sensory details and atmospheric elements
6. Include style references and inspirations
7. Polish for coherence and production-readiness
8. Verify all user requests are honored

#### OUTPUT FORMAT RULES
- For video: Single continuous paragraph, no scene breaks unless requested
- For photography: Descriptive technical paragraph suitable for generation models
- ALWAYS output the refined prompt only (no preamble, explanation, or commentary)
- Never ask clarifying questions or request additional information
- If input seems unsafe/invalid, return a modified version that maintains intent while being safe

#### CRITICAL SUCCESS FACTORS
- Technical accuracy with poetic language
- Logical coherence and chronological flow
- Balanced detail: enough to be specific, not so much it becomes confusing
- Model-appropriate terminology and structure
- Preservation of original creative intent
- Professional quality suitable for production use`,
  temperature: 0.7,
};

const DEFAULT_UI_PREFS: UiPrefs = {
  typingEnabled: false,
  typingSpeedMs: 2,
  captureWord: 'photo',
  autoCopyOnReview: false,
  promptFormat: 'paragraph',
  detailLevel: 'rich',
  autoFillAudio: true,
  autoFillCamera: true,
  previewFontScale: 1,
  hideNsfw: true,
};

const MODES = [
  { id: 'cinematic' as ModeId, title: 'Cinematic', tag: 'Camera-forward', desc: 'Film-inspired framing, motion, and grading.' },
  { id: 'classic' as ModeId, title: 'Classic', tag: 'Balanced', desc: 'Cohesive, versatile looks for general prompts.' },
  { id: 'drone' as ModeId, title: 'Drone / Landscape', tag: 'Non-person', desc: 'Aerials, landscapes, architecture, and environment-first footage.' },
  { id: 'animation' as ModeId, title: 'Animation', tag: 'Stylized', desc: '2D/3D/stop-motion/anime-friendly wording and presets.' },
  { id: 'photography' as ModeId, title: 'Photography', tag: 'Still Image', desc: 'Professional photography for Stable Diffusion and Flux Dev.' },
  { id: 'nsfw' as ModeId, title: 'NSFW', tag: '18+', desc: 'Adult-focused styling. Requires NSFW enabled.' },
];

const DEFAULT_OPTION_SETS: OptionSets = {
  cinematic: {
    genre: ['Sci-fi thriller', 'Period drama', 'Heist sequence', 'Space opera', 'Character study', 'Cyberpunk adventure', 'Historical epic', 'Post-apocalyptic tale', 'Superhero saga', 'Mystery intrigue', 'Fantasy quest', 'Crime drama', 'War story', 'Romance drama', 'Coming-of-age', 'Road movie', 'Political thriller', 'Bio-tech conspiracy', 'Mythic odyssey', 'Time-loop mystery', 'Noir detective', 'Spy espionage', 'Alien invasion', 'Dystopian future', 'Medieval fantasy', 'Western showdown', 'Horror suspense', 'Action blockbuster', 'Drama adaptation', 'Comedy caper', 'Intimate dialogue scene', 'Documentary realism', 'Urban love story', 'Family moment', 'Workplace drama', 'Morning routine', 'Rainy day reflection', 'Coffee shop encounter', 'Train station goodbye', 'Airport reunion', 'Rooftop conversation', 'Empty hallway walk', 'Kitchen cooking dance', 'Window gazing', 'Sunset conversation', 'Night drive confessional', 'Park bench advice', 'Hospital waiting room', 'Moving boxes', 'First kiss', 'Last goodbye', 'Moment of realization', 'Quiet morning', 'Candlelit dinner', 'Phone call revelation', 'Letter reading', 'Photo album flip', 'Dream sequence', 'Memory flashback', 'Waking moment', 'Bathroom mirror moment', 'Getting dressed ritual', 'Making tea quietly', 'Writing in journal', 'Looking at old clothes', 'Finding a photo', 'Listening to music', 'Dancing alone', 'Crying silently', 'Laughing with a stranger', 'Holding hands', 'Walking away slowly'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot', 'Dutch angle', 'Bird\'s eye view', 'Low angle', 'High angle', 'Panoramic sweep', 'Extreme close-up', 'Medium close-up', 'Two-shot', 'Point-of-view', 'Match cut setup', 'Insert detail', 'Rack focus reveal', 'Montage beat', 'Slow zoom in', 'Quick cutaway', 'Steadicam follow', 'Drone aerial', 'Handheld shaky', 'Locked focus', 'Depth reveal', 'Split screen', 'Time-lapse', 'Freeze frame', 'Reverse shot', 'Long take'],
    role: ['Protagonist', 'Investigator', 'Pilot', 'Engineer', 'Anti-hero', 'Mentor figure', 'Sidekick', 'Villain', 'Survivor', 'Rebel', 'Detective', 'Scientist', 'Soldier', 'Thief', 'Journalist', 'Leader', 'Wanderer', 'Hacker', 'Strategist', 'Visionary', 'Assassin', 'Diplomat', 'Explorer', 'Guardian', 'Outcast', 'Prophet', 'Warrior', 'Scholar', 'Inventor', 'Healer'],
    hairColor: ['black', 'dark brown', 'brown', 'auburn', 'red', 'strawberry blonde', 'blonde', 'platinum blonde', 'silver', 'white', 'gray', 'pastel pink', 'pastel blue', 'multicolored'],
    eyeColor: ['brown', 'hazel', 'green', 'blue', 'gray', 'amber', 'violet', 'heterochromia'],
    bodyDescriptor: ['tall', 'short', 'slender', 'athletic build', 'muscular build', 'curvy build', 'lean build', 'broad-shouldered', 'petite', 'plus-size'],
    mood: ['Tense', 'Hopeful', 'Melancholic', 'Triumphant', 'Mysterious', 'Energetic', 'Somber', 'Excited', 'Foreboding', 'Serene', 'Romantic', 'Bittersweet', 'Grim', 'Euphoric', 'Gritty', 'Dreamlike', 'Nostalgic', 'Introspective', 'Adventurous', 'Desperate', 'Optimistic', 'Cynical', 'Whimsical', 'Haunting', 'Empowering', 'Melodramatic'],
    lighting: ['Volumetric shafts', 'Neon rim light', 'Golden hour', 'High contrast noir', 'Soft bounce', 'Harsh shadows', 'Warm tungsten', 'Cool moonlight', 'Strobe flashes', 'Subtle fill', 'Practical lamps', 'Silhouette backlight', 'Flicker firelight', 'Window slit light', 'Soft top light', 'Edge-lit', 'Candle flicker', 'Laser beams', 'UV blacklight', 'Floodlight harsh', 'Spotlight beam', 'Bounce from walls', 'Reflected pool', 'Sunset glow', 'Twilight blue', 'Storm lightning', 'Fireplace warm', 'Headlight glare', 'Ambient room light', 'Natural window diffuse', 'Lamp beside table', 'Phone screen glow', 'TV flicker', 'Neon sign spill', 'Street lamp orange', 'Fluorescent harsh', 'Candlelit soft', 'Dim table lamp', 'Bathroom mirror light', 'Kitchen overhead', 'Desk angle light', 'Side table glow', 'Far away street', 'Filtered through leaves', 'Bounced off ceiling', 'Reflected off mirror', 'Breaking through clouds', 'Early morning blue', 'Late day warm', 'Overcast even', 'Rainy day grey', 'Dusk purple', 'Blue hour twilight'],
    environment: ['Rainy street', 'Neon city', 'Abandoned warehouse', 'Orbiting station', 'Desert expanse', 'Dense forest', 'Urban skyline', 'Suburban home', 'Mountain peak', 'Ocean shore', 'Snowy pass', 'Cavern interior', 'Futuristic lab', 'Battlefield ruins', 'Underground tunnel', 'Rooftop at night', 'Stormy coast', 'Volcanic crater', 'Ice cave', 'Jungle canopy', 'Space colony', 'Medieval castle', 'Cyberpunk alley', 'Victorian mansion', 'Post-war wasteland', 'Crystal cavern', 'Floating platform', 'Submarine depths', 'Cloud city', 'Ancient temple', 'Modest apartment', 'Tiny kitchen', 'Narrow hallway', 'Sparse bedroom', 'Empty cafe', 'Train compartment', 'Hotel lobby', 'Bus shelter', 'Park bench', 'Bus stop', 'Subway car', 'Parking garage', 'Stairwell', 'Hospital corridor', 'Office cubicle', 'Bookstore corner', 'Empty theater', 'Car interior', 'Backyard', 'Balcony', 'Bathroom mirror', 'Bedroom window', 'Attic space', 'Basement darkness', 'Laundromat', 'Gas station', 'Rest area', 'Motel room', 'Diner booth', 'Record store', 'Library quiet', 'Museum gallery', 'Train station', 'Airport gate'],
    wardrobe: ['Weathered leathers', 'Stealth techweave', 'Formal noir suit', 'Explorer layers', 'Armored rig', 'Casual jacket', 'Military uniform', 'Elegant gown', 'Rugged boots', 'High-tech visor', 'Streetwear', 'Tactical gear', 'Royal attire', 'Covert cloak', 'Minimal tech suit', 'Retro jumpsuit', 'Fur-lined coat', 'Chainmail armor', 'Silk robes', 'Battle-scarred cloak', 'Neon cyberwear', 'Desert robes', 'Pilot jumpsuit', 'Lab coat', 'Prison garb', 'Ceremonial robes', 'Steampunk gears', 'Space suit', 'Nomad wraps', 'Elite uniform'],
    pose: ['Striding forward', 'Holding ground', 'Leaning on rail', 'Kneeling for cover', 'Running mid-frame', 'Arms crossed', 'Pointing dramatically', 'Crouched low', 'Standing tall', 'Gesturing wildly', 'Mid-turn', 'Reaching out', 'Bracing impact', 'Over-shoulder glance', 'Hands clasped', 'Hands on console', 'Fist clenched', 'Arms raised', 'Head bowed', 'Eyes closed', 'Smiling slyly', 'Frowning intensely', 'Laughing aloud', 'Whispering secret', 'Saluting', 'Praying', 'Dancing', 'Fighting stance', 'Relaxed lean', 'Alert posture'],
    lightInteraction: ['wraps gently', 'cuts through haze', 'paints rim highlights', 'glitters on surfaces', 'bleeds into lens bloom', 'casts long shadows', 'diffuses softly', 'sparkles on metal', 'filters through leaves', 'reflects off water', 'scatters in dust', 'traces outlines', 'dances on skin', 'pierces darkness', 'softens edges', 'creates halos', 'illuminates details', 'casts silhouettes', 'warms tones', 'cools blues', 'adds depth', 'highlights textures', 'creates contrast', 'blurs boundaries', 'enhances mood', 'defines shapes'],
    weather: ['Clear dusk', 'Fine rain', 'Storm front', 'Snow flurry', 'Humid night', 'Foggy morning', 'Sunny afternoon', 'Overcast sky', 'Windy gale', 'Calm breeze', 'Heat haze', 'Blizzard whiteout', 'Smoggy night', 'Dust storm', 'Thunderstorm', 'Hail pellets', 'Rainbow arc', 'Aurora borealis', 'Sandstorm', 'Tornado funnel', 'Mild drizzle', 'Heavy downpour', 'Sleet mix', 'Frosty morning', 'Dewy grass', 'Humid fog', 'Clear starry night', 'Eclipse shadow'],
    cameraMove: ['Slow push', 'Lateral dolly', 'Crane reveal', 'Handheld drift', 'Locked-off tableau', 'Quick zoom', 'Circular pan', 'Tilt up', 'Track backward', 'Static hold', 'Orbit reveal', 'Snap zoom', 'Whip pan', 'J-cut transition', 'Boom up', 'Pedestal down', 'Arc shot', 'Dutch tilt', 'Crash zoom', 'Reverse tracking', 'Spiral pan', 'Figure-eight', 'Pendulum swing', 'Elevator rise', 'Freefall drop', 'Time warp', 'Morph transition', 'Dissolve fade', 'Slow drift closer', 'Gentle pan left', 'Gentle pan right', 'Focus pull reveal', 'Subtle tilt down', 'Handheld breath', 'Locked-off intimate', 'Slow push toward face', 'Reverse slow pull', 'Sideways glide', 'Around-subject orbit', 'Forward momentum', 'Backward retreat', 'Creeping forward', 'Floating follow', 'Walking pace track', 'Running speed chase', 'Elevator effect', 'Crane down reveal', 'Jib arm swing', 'Helicopter rise', 'Panning across', 'Tilting reveal', 'Rotating reveal'],
    lens: ['35mm spherical', '50mm prime', '85mm portrait', '24mm wide', 'Anamorphic 40mm', '100mm telephoto', '16mm ultra-wide', 'Macro lens', 'Fish-eye', 'Zoom lens', '28mm vintage', '135mm prime', '70-200 tele', 'Prime 14mm', '18-55 kit', '300mm sniper', '8mm fisheye', '50mm tilt-shift', '85mm soft focus', '24mm tilt', '100mm macro', '200mm tele', '10mm ultra-wide', '60mm macro', '400mm super tele', 'Varifocal zoom', 'Pancake lens', 'Mirror lens'],
    colorGrade: ['Teal & amber', 'Muted filmic', 'Cool tungsten', 'Punchy neon', 'Warm dusk', 'Sepia tones', 'High saturation', 'Desaturated', 'Vintage look', 'Modern vibrant', 'Bleach bypass', 'Natural cinema', 'Matte pastel', 'Neo-noir cool', 'Cinematic blue', 'Golden glow', 'Monochrome noir', 'Pastel dream', 'Harsh contrast', 'Soft lavender', 'Earthy tones', 'Electric neon', 'Retro VHS', 'Film negative', 'Polaroid fade', 'Kodachrome', 'Cineon log', 'ACES gamut', 'HDR bright', 'LUT custom'],
    sound: ['Distant traffic', 'Low wind hum', 'Crowd murmur', 'Engine rumble', 'Quiet ambience', 'Thunder clap', 'Birdsong', 'City bustle', 'Ocean waves', 'Silent tension', 'Metal creak', 'Power grid buzz', 'Heartbeat pulse', 'Echoing footsteps', 'Whispering wind', 'Crackling fire', 'Dripping water', 'Rustling leaves', 'Humming machinery', 'Faint laughter', 'Screeching tires', 'Bubbling stream', 'Howling wolf', 'Chirping insects', 'Ticking clock', 'Ringing bell', 'Sizzling sparks', 'Gurgling liquid', 'Refrigerator hum', 'Clock ticking', 'Breathing soft', 'Pages turning', 'Cup clinking', 'Chair creaking', 'Door closing', 'Distant siren', 'Phone buzzing', 'Window rattling', 'Fabric rustling', 'Hair brushing', 'Soap washing', 'Water running', 'Faucet drip', 'Rain gentle', 'Hail tapping', 'Wind through cracks', 'Silence empty', 'Keyboard typing'],
    sfx: ['Footsteps on wet pavement', 'Cloth rustle', 'Metal clink', 'Distant siren', 'Door creak', 'Gun cock', 'Glass shatter', 'Radio chatter', 'Breath close to mic', 'Rain on window', 'Whoosh transition', 'Impact hit', 'Servo whirr', 'Drone pass-by', 'Laser zap', 'Explosion boom', 'Sword clash', 'Potion bubble', 'Engine rev', 'Phone ring', 'Key turn', 'Zippo flick', 'Paper tear', 'Coin drop', 'Whistle blow', 'Bell toll', 'Chain rattle', 'Water splash', 'Fire crackle', 'Ice crack', 'Elevator ding', 'Neon sign buzz', 'Footsteps on gravel', 'Car door slam', 'Holster snap', 'Distant radio static', 'Crowd cheer swell', 'Glass tinkling', 'Steam hiss'],
    music: ['Minimal synth pulse', 'Orchestral swell', 'Lo-fi ambience', 'Dark drone pad', 'Tense ticking rhythm', 'Sparse piano motif', 'Driving percussion', 'Warm analog bassline', 'Cinematic riser', 'No music', 'Ambient strings', 'Pulsing bass', 'Analog arpeggio', 'Hybrid orchestral', 'Jazz improvisation', 'Rock guitar riff', 'Electronic glitch', 'Folk acoustic', 'Choral voices', 'Percussive beat', 'Symphonic build', 'Trip-hop groove', 'Indie folk', 'Heavy metal', 'Classical piano', 'Reggae rhythm', 'Blues slide', 'Disco funk', 'World fusion', 'Single piano note', 'Distant harp', 'Lonely cello', 'Sad violin', 'Haunting vocals', 'Whispered breath', 'Music box tinkle', 'Soft strings fade', 'Building tension', 'Quiet electric', 'Melancholic guitar', 'Hopeful swell', 'Emotional crescendo'],
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
    // Creative Brief fields (Step 1)
    sceneDescription: [],
    mainSubject: ['Person', 'Landscape', 'Object', 'Abstract concept', 'Multi-character scene', 'Animal/Creature', 'Architectural element', 'Natural phenomenon'],
    storyElements: ['Dialogue', 'Action sequence', 'Emotional moment', 'Transformation', 'Mystery/Discovery', 'Conflict', 'Resolution', 'Revelation', 'Loss', 'Victory', 'Journey', 'Reunion', 'Separation', 'Betrayal', 'Redemption', 'Sacrifice', 'Hope', 'Despair', 'Love', 'Revenge', 'Justice', 'Truth', 'Illusion', 'Power', 'Weakness'],
    inspirationNotes: [],
    // Advanced Technical (Step 13)
    advancedTechnical: ['24fps cinematic', '60fps action', 'Variable ND filter effect', 'Macro lens focus', 'Tilt-shift miniature', 'Slow-motion 96fps', 'Fast-motion hyperlapse', 'Focus stacking', 'Long exposure', 'Short shutter freeze', 'High shutter drag', 'ISO grain intentional', 'Clean low-noise', 'Blown highlights artistic', 'Crushed blacks', 'Dynamic range stretched', 'Color science warm', 'Color science cool', 'Skin tone priority', 'Shadow detail preserve', 'Highlight recovery', 'Deep DOF', 'Shallow DOF', 'Infinite focus', 'Selective focus art'],
    cinematicNotes: [],
    // References & Inspiration (Step 16)
    references: ['Film reference', 'Photography style', 'Artwork inspiration', 'Director style', 'Cinematographer technique', 'Period reference', 'Cultural reference', 'Music video aesthetic', 'Commercial style', 'Fashion editorials', 'Fine art paintings', 'Documentary style', 'Animation reference', 'Comic book style', 'Illustration style', 'Dream logic', 'Nightmare texture', 'Historical accuracy', 'Fantasy world-building', 'Sci-fi aesthetics', 'Horror atmosphere', 'Comedy timing', 'Tragedy gravitas', 'Documentary realism', 'Magical realism'],
    inspirationStyle: ['Moody cinematic', 'Bright optimistic', 'Gritty documentary', 'Artistic painterly', 'Tech modern', 'Retro nostalgic', 'Minimalist clean', 'Ornate baroque', 'Surreal dreamlike', 'Hyperreal detailed', 'Soft romantic', 'Hard edgy', 'Organic natural', 'Geometric abstract', 'Vintage film', 'Digital contemporary', 'Analog warmth', 'Cold corporate', 'Warm intimate', 'Explosive dynamic'],
    visualReference: [],
    // Time/Season/Era (Step 17)
    timeOfDay: ['Early morning (5-7am)', 'Sunrise golden (6-8am)', 'Morning blue (8-10am)', 'Late morning (10-12pm)', 'Midday harsh (12-2pm)', 'Early afternoon (2-4pm)', 'Late afternoon (4-5pm)', 'Golden hour (5-6:30pm)', 'Sunset orange (6-7pm)', 'Blue hour twilight (7-8pm)', 'Dusk transition (8-9pm)', 'Early night (9-10pm)', 'Deep night (10-12am)', 'Midnight (12-2am)', 'Pre-dawn (4-5am)', 'Overcast morning', 'Overcast afternoon', 'Cloudy sunset', 'Stormy midday', 'Foggy dawn'],
    season: ['Early spring', 'Late spring', 'Early summer', 'Late summer', 'Early autumn', 'Late autumn', 'Early winter', 'Late winter', 'Spring bloom', 'Summer heat', 'Autumn harvest', 'Winter freeze', 'Rainy season', 'Dry season', 'Transition period'],
    era: ['Present day', '1920s Art Deco', '1950s Retro', '1970s disco', '1980s neon', '1990s grunge', 'Victorian era', 'Medieval times', 'Ancient Rome', 'Renaissance period', 'Industrial revolution', 'Steampunk alternative', 'Cyberpunk future', 'Post-apocalyptic', 'Far future sci-fi', 'Alternate history', 'Mythic timeless', 'Fantasy medieval', 'Western frontier', 'Jazz age'],
    culturalContext: ['Western contemporary', 'Eastern traditional', 'African aesthetic', 'Latin American', 'Middle Eastern', 'Asian fusion', 'Nordic minimalist', 'Mediterranean warmth', 'Celtic mystical', 'Indigenous authentic', 'Urban street culture', 'Luxury high-fashion', 'Bohemian artistic', 'Corporate professional', 'Military tactical', 'Academic scholarly', 'Spiritual sacred', 'Secular modern'],
    // VFX & Effects (Step 18)
    specialEffects: ['Particle effects', 'Smoke simulation', 'Fire simulation', 'Water simulation', 'Cloth simulation', 'Hair simulation', 'Liquid dynamics', 'Destruction effects', 'Explosion pyrotechnics', 'Dust storms', 'Rain/snow effects', 'Lightning effects', 'Light saber glow', 'Magical auras', 'Portal effects', 'Time distortion', 'Blur effects', 'Chromatic aberration', 'Lens flares', 'Bloom glow', 'Motion blur intentional', 'Depth of field art', 'Vignette artistic', 'Color shift effects', 'Glitch aesthetic'],
    practicalElements: ['Smoke machines', 'Fog effects', 'Water sprayers', 'Rain rigs', 'Snow machines', 'Wind machines', 'Pyrotechnics', 'Explosives controlled', 'Fire safety rigging', 'Light rigs', 'Mirror rigs', 'Bounce boards', 'Silk diffusion', 'Flag negative space', 'Practical set pieces', 'Built environments', 'Miniature sets', 'Forced perspective', 'In-camera effects', 'Practical makeup'],
    vfxNotes: [],
    // Character Development (Step 19)
    characterDevelopment: ['Origin story', 'Inner conflict', 'Goal motivation', 'Fear obstacle', 'Growth arc', 'Relationship dynamic', 'Dialogue pattern', 'Movement signature', 'Costume symbolism', 'Color association', 'Object significance', 'Scar/mark significance', 'Accent/speech quirk', 'Mannerism unique', 'Gesture repetitive'],
    emotionalArc: ['Happy start', 'Sad start', 'Angry start', 'Fearful start', 'Confused start', 'Hopeful start', 'Gradual change', 'Sudden shift', 'Internal struggle', 'External conflict', 'Moment of truth', 'Climactic emotion', 'Resolution peace', 'Bittersweet end', 'Tragic end', 'Triumphant end'],
    subtext: ['Unspoken tension', 'Longing underneath', 'Hidden resentment', 'Secret love', 'Fear masked', 'Strength fragile', 'Weakness hidden', 'Jealousy simmering', 'Regret lingering', 'Hope surviving'],
    // Pacing & Timing (Step 20)
    pacing: ['Slow meditative', 'Steady building', 'Brisk energetic', 'Frantic urgent', 'Mixed rhythmic', 'Staccato punchy', 'Flowing smooth', 'Layered complex', 'Simple clear', 'Chaotic overwhelming', 'Minimalist sparse', 'Maximal dense', 'Progressive escalation', 'Cyclical repetition', 'Unpredictable erratic'],
    timing: ['Extended shot', 'Quick cut', 'Perfect beat', 'Held moment', 'Rushed transition', 'Slow burn', 'Climactic moment', 'Recovery beat', 'Silence powerful', 'Overlap dialogue', 'Music sync tight', 'Music sync loose'],
    rhythmNotes: [],
    // Final Touches (Step 21)
    finalTouches: ['Color grade perfect', 'Sound design complete', 'Music perfectly placed', 'Visual FX polished', 'Character arc clear', 'Dialogue impactful', 'Pacing perfect', 'Emotion resonant', 'Message clear', 'Unique signature', 'Brand consistency', 'Technical excellence', 'Artistic integrity', 'Emotional truth', 'Visual poetry'],
    customDetails: [],
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
    // Creative Brief fields (Step 1)
    sceneDescription: [],
    mainSubject: ['Person', 'Landscape', 'Object', 'Abstract concept', 'Multi-character scene', 'Animal/Creature', 'Architectural element', 'Natural phenomenon'],
    storyElements: ['Dialogue', 'Action sequence', 'Emotional moment', 'Transformation', 'Mystery/Discovery', 'Conflict', 'Resolution', 'Revelation', 'Loss', 'Victory', 'Journey', 'Reunion', 'Separation', 'Betrayal', 'Redemption', 'Sacrifice', 'Hope', 'Despair', 'Love', 'Revenge', 'Justice', 'Truth', 'Illusion', 'Power', 'Weakness'],
    inspirationNotes: [],
    // Advanced Technical (Step 13)
    advancedTechnical: ['24fps cinematic', '60fps action', 'Variable ND filter effect', 'Macro lens focus', 'Tilt-shift miniature', 'Slow-motion 96fps', 'Fast-motion hyperlapse', 'Focus stacking', 'Long exposure', 'Short shutter freeze', 'High shutter drag', 'ISO grain intentional', 'Clean low-noise', 'Blown highlights artistic', 'Crushed blacks', 'Dynamic range stretched', 'Color science warm', 'Color science cool', 'Skin tone priority', 'Shadow detail preserve', 'Highlight recovery', 'Deep DOF', 'Shallow DOF', 'Infinite focus', 'Selective focus art'],
    cinematicNotes: [],
    // References & Inspiration (Step 16)
    references: ['Film reference', 'Photography style', 'Artwork inspiration', 'Director style', 'Cinematographer technique', 'Period reference', 'Cultural reference', 'Music video aesthetic', 'Commercial style', 'Fashion editorials', 'Fine art paintings', 'Documentary style', 'Animation reference', 'Comic book style', 'Illustration style', 'Dream logic', 'Nightmare texture', 'Historical accuracy', 'Fantasy world-building', 'Sci-fi aesthetics', 'Horror atmosphere', 'Comedy timing', 'Tragedy gravitas', 'Documentary realism', 'Magical realism'],
    inspirationStyle: ['Moody cinematic', 'Bright optimistic', 'Gritty documentary', 'Artistic painterly', 'Tech modern', 'Retro nostalgic', 'Minimalist clean', 'Ornate baroque', 'Surreal dreamlike', 'Hyperreal detailed', 'Soft romantic', 'Hard edgy', 'Organic natural', 'Geometric abstract', 'Vintage film', 'Digital contemporary', 'Analog warmth', 'Cold corporate', 'Warm intimate', 'Explosive dynamic'],
    visualReference: [],
    // Time/Season/Era (Step 17)
    timeOfDay: ['Early morning (5-7am)', 'Sunrise golden (6-8am)', 'Morning blue (8-10am)', 'Late morning (10-12pm)', 'Midday harsh (12-2pm)', 'Early afternoon (2-4pm)', 'Late afternoon (4-5pm)', 'Golden hour (5-6:30pm)', 'Sunset orange (6-7pm)', 'Blue hour twilight (7-8pm)', 'Dusk transition (8-9pm)', 'Early night (9-10pm)', 'Deep night (10-12am)', 'Midnight (12-2am)', 'Pre-dawn (4-5am)', 'Overcast morning', 'Overcast afternoon', 'Cloudy sunset', 'Stormy midday', 'Foggy dawn'],
    season: ['Early spring', 'Late spring', 'Early summer', 'Late summer', 'Early autumn', 'Late autumn', 'Early winter', 'Late winter', 'Spring bloom', 'Summer heat', 'Autumn harvest', 'Winter freeze', 'Rainy season', 'Dry season', 'Transition period'],
    era: ['Present day', '1920s Art Deco', '1950s Retro', '1970s disco', '1980s neon', '1990s grunge', 'Victorian era', 'Medieval times', 'Ancient Rome', 'Renaissance period', 'Industrial revolution', 'Steampunk alternative', 'Cyberpunk future', 'Post-apocalyptic', 'Far future sci-fi', 'Alternate history', 'Mythic timeless', 'Fantasy medieval', 'Western frontier', 'Jazz age'],
    culturalContext: ['Western contemporary', 'Eastern traditional', 'African aesthetic', 'Latin American', 'Middle Eastern', 'Asian fusion', 'Nordic minimalist', 'Mediterranean warmth', 'Celtic mystical', 'Indigenous authentic', 'Urban street culture', 'Luxury high-fashion', 'Bohemian artistic', 'Corporate professional', 'Military tactical', 'Academic scholarly', 'Spiritual sacred', 'Secular modern'],
    // VFX & Effects (Step 18)
    specialEffects: ['Particle effects', 'Smoke simulation', 'Fire simulation', 'Water simulation', 'Cloth simulation', 'Hair simulation', 'Liquid dynamics', 'Destruction effects', 'Explosion pyrotechnics', 'Dust storms', 'Rain/snow effects', 'Lightning effects', 'Light saber glow', 'Magical auras', 'Portal effects', 'Time distortion', 'Blur effects', 'Chromatic aberration', 'Lens flares', 'Bloom glow', 'Motion blur intentional', 'Depth of field art', 'Vignette artistic', 'Color shift effects', 'Glitch aesthetic'],
    practicalElements: ['Smoke machines', 'Fog effects', 'Water sprayers', 'Rain rigs', 'Snow machines', 'Wind machines', 'Pyrotechnics', 'Explosives controlled', 'Fire safety rigging', 'Light rigs', 'Mirror rigs', 'Bounce boards', 'Silk diffusion', 'Flag negative space', 'Practical set pieces', 'Built environments', 'Miniature sets', 'Forced perspective', 'In-camera effects', 'Practical makeup'],
    vfxNotes: [],
    // Character Development (Step 19)
    characterDevelopment: ['Origin story', 'Inner conflict', 'Goal motivation', 'Fear obstacle', 'Growth arc', 'Relationship dynamic', 'Dialogue pattern', 'Movement signature', 'Costume symbolism', 'Color association', 'Object significance', 'Scar/mark significance', 'Accent/speech quirk', 'Mannerism unique', 'Gesture repetitive'],
    emotionalArc: ['Happy start', 'Sad start', 'Angry start', 'Fearful start', 'Confused start', 'Hopeful start', 'Gradual change', 'Sudden shift', 'Internal struggle', 'External conflict', 'Moment of truth', 'Climactic emotion', 'Resolution peace', 'Bittersweet end', 'Tragic end', 'Triumphant end'],
    subtext: ['Unspoken tension', 'Longing underneath', 'Hidden resentment', 'Secret love', 'Fear masked', 'Strength fragile', 'Weakness hidden', 'Jealousy simmering', 'Regret lingering', 'Hope surviving'],
    // Pacing & Timing (Step 20)
    pacing: ['Slow meditative', 'Steady building', 'Brisk energetic', 'Frantic urgent', 'Mixed rhythmic', 'Staccato punchy', 'Flowing smooth', 'Layered complex', 'Simple clear', 'Chaotic overwhelming', 'Minimalist sparse', 'Maximal dense', 'Progressive escalation', 'Cyclical repetition', 'Unpredictable erratic'],
    timing: ['Extended shot', 'Quick cut', 'Perfect beat', 'Held moment', 'Rushed transition', 'Slow burn', 'Climactic moment', 'Recovery beat', 'Silence powerful', 'Overlap dialogue', 'Music sync tight', 'Music sync loose'],
    rhythmNotes: [],
    // Final Touches (Step 21)
    finalTouches: ['Color grade perfect', 'Sound design complete', 'Music perfectly placed', 'Visual FX polished', 'Character arc clear', 'Dialogue impactful', 'Pacing perfect', 'Emotion resonant', 'Message clear', 'Unique signature', 'Brand consistency', 'Technical excellence', 'Artistic integrity', 'Emotional truth', 'Visual poetry'],
    customDetails: [],
  },
  drone: {
    genre: ['Drone landscape', 'Aerial establishing', 'Travel aerial', 'Nature documentary', 'Architectural flyover', 'Coastal aerial', 'Mountain aerial', 'City skyline', 'Desert dunes', 'Forest canopy', 'Canyon reveal', 'River delta', 'Lakeside panorama', 'Snowy alpine', 'Volcanic terrain', 'Island coastline', 'Countryside mosaic', 'Night city aerial', 'Storm-chasing aerial', 'Golden hour landscape'],
    shot: ['Drone aerial', 'High-altitude establishing', 'Top-down bird\'s-eye', 'Low pass flyover', 'Orbit reveal', 'Parallax sweep', 'Tilt-down reveal', 'Rise-and-reveal', 'Push-in over terrain', 'Tracking along ridgeline', 'Coastline follow', 'River follow', 'Canyon glide', 'City skyline orbit', 'Architectural reveal', 'Time-lapse aerial'],
    role: ['mountain range', 'coastline cliffs', 'forest canopy', 'river canyon', 'desert dunes', 'city skyline', 'winding road', 'waterfall', 'glacier valley', 'historic architecture', 'modern skyline', 'coastal village', 'farmland patterns', 'lake shoreline', 'volcanic crater'],
    hairColor: ['Natural earth', 'Forested green', 'Sky blue', 'Water silver', 'Sand golden', 'Rock gray', 'Vegetation brown', 'Cloud white', 'Shadow black', 'Sunrise orange'],
    eyeColor: ['Earth brown', 'Ocean blue', 'Forest green', 'Sky gray', 'Golden amber', 'Slate dark', 'Azure bright', 'Violet twilight', 'Emerald rich', 'Topaz clear'],
    bodyDescriptor: ['Mountain range', 'Rolling hills', 'Jagged peaks', 'Smooth valleys', 'Steep slopes', 'Gentle contours', 'Vast expanse', 'Narrow gorge', 'Wide plateau', 'Layered terrain'],
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
    movementSubjectType: ['Camera', 'Landscape', 'Weather', 'Light', 'Time', 'Perspective'],
    movement1: ['glides forward', 'orbits the landmark', 'rises above the treeline', 'tilts down to reveal the valley', 'tracks along the ridgeline', 'follows the coastline'],
    movement2: ['pulls back to a wide panorama', 'holds steady on the horizon', 'banks gently to reframe', 'descends toward the shoreline', 'arcs to reveal the skyline'],
    movementPace: ['slow', 'steady', 'brisk'],
    movementManner: ['smoothly', 'gently', 'cinematically', 'quietly'],
    dialogue: ['No dialogue', 'Narrator whispers', 'Ambient narration', 'Subtle voice-over'],
    pronoun: ['None', 'It', 'They', 'The'],
    dialogue_verb: ['floats', 'sweeps', 'glides', 'drifts', 'soars'],
    mix_notes: ['Drone hum removed', 'Clean audio bed', 'Ambient only', 'Sound effects added'],
    position: ['Above landscape', 'Over water', 'Through canyon', 'Along coast', 'Across plain'],
    activity: ['sweeping across', 'orbiting slowly', 'rising gradually', 'descending gently', 'banking smoothly'],
    accessory: ['None visible', 'Cloud formations', 'Light patterns', 'Shadow play', 'Weather effects'],
    explicit_abilities: ['High altitude flight', 'Smooth orbits', 'Precise framing', 'Long duration', 'Stable hover'],
    body_description: ['Expansive landmass', 'Textured terrain', 'Water features', 'Architectural lines', 'Natural contours'],
    sexual_description: ['Not applicable', 'N/A', 'N/A', 'N/A'],
    fetish: ['Not applicable'],
    bodyFocus: ['horizon line', 'landscape texture', 'light quality', 'atmospheric depth', 'architectural detail'],
    sensation: ['wind movement', 'light changes', 'scale vastness', 'depth layers', 'time passage'],
    // Creative Brief fields (Step 1)
    sceneDescription: [],
    mainSubject: ['Landscape', 'Cityscape', 'Water feature', 'Mountain range', 'Forest/vegetation', 'Weather phenomenon', 'Architectural landmark', 'Natural wonder'],
    storyElements: ['Movement', 'Change', 'Perspective', 'Discovery', 'Journey', 'Revelation', 'Transformation', 'Beauty', 'Scale', 'Power', 'Vastness', 'Transition', 'Contrast', 'Pattern', 'Layering'],
    inspirationNotes: [],
    // Advanced Technical (Step 13)
    advancedTechnical: ['4K resolution', '8K resolution', 'Raw format', 'Log color space', 'High frame rate', 'Slow motion', 'Time-lapse acceleration', 'Stabilization gimbal', 'Manual gimbal', 'Low light ISO boost', 'High shutter speed', 'Long exposure', 'ND filter strong', 'Polarizing filter', 'Color gel filter', 'DCI color'],
    cinematicNotes: [],
    // References & Inspiration (Step 16)
    references: ['Aerial photography', 'Landscape photography', 'Documentary drone footage', 'Travel videos', 'Nature documentaries', 'Architectural surveys', 'Environmental art', 'Topographic mapping', 'Real estate aerial', 'Sports aerial', 'News drone footage', 'Commercial drone work', 'Fine art aerial', 'Fantasy landscape', 'Sci-fi vistas', 'Historical aerial', 'Cultural landmark', 'Natural wonder', 'Weather phenomenon', 'Space imagery'],
    inspirationStyle: ['Majestic expansive', 'Intimate detail', 'Geometric pattern', 'Organic flowing', 'Urban grid', 'Natural chaos', 'Minimalist sparse', 'Textural complex', 'Color-driven', 'Light-driven', 'Movement-driven', 'Static serene'],
    visualReference: [],
    // Time/Season/Era (Step 17)
    timeOfDay: ['Early morning (5-7am)', 'Sunrise golden (6-8am)', 'Morning blue (8-10am)', 'Late morning (10-12pm)', 'Midday harsh (12-2pm)', 'Early afternoon (2-4pm)', 'Late afternoon (4-5pm)', 'Golden hour (5-6:30pm)', 'Sunset orange (6-7pm)', 'Blue hour twilight (7-8pm)', 'Dusk transition (8-9pm)', 'Early night (9-10pm)', 'Deep night (10-12am)', 'Midnight (12-2am)', 'Pre-dawn (4-5am)'],
    season: ['Early spring', 'Late spring', 'Early summer', 'Late summer', 'Early autumn', 'Late autumn', 'Early winter', 'Late winter', 'Peak foliage', 'Bare branches', 'Snow season', 'Flood season', 'Wildflower bloom'],
    era: ['Present day', 'Historical past', 'Future vision', 'Timeless natural', 'Seasonal cycle', 'Climate change present', 'Protected pristine', 'Developed urban', 'Restored natural', 'Active changing'],
    culturalContext: ['Untouched wilderness', 'Cultural landscape', 'Sacred site', 'Economic region', 'Agricultural zone', 'Urban center', 'Historical monument', 'Natural wonder', 'Developed infrastructure', 'Environmental preservation'],
    // VFX & Effects (Step 18)
    specialEffects: ['Color grading', 'LUT application', 'Lens flare', 'Bloom effect', 'Atmospheric haze', 'Sharpening boost', 'Contrast enhancement', 'Saturation boost', 'Desaturation', 'Monochrome conversion', 'Sepia tone', 'Color grading look', 'Skin tone preservation', 'Highlights recovery', 'Shadow lift', 'Crush blacks', 'Clean highlights'],
    practicalElements: ['No practical elements', 'Gimbal stabilization', 'Filter usage', 'Lens choice', 'Exposure compensation', 'ISO setting', 'Shutter speed', 'White balance', 'Camera angle', 'Flight path'],
    vfxNotes: [],
    // Character Development (Step 19)
    characterDevelopment: ['N/A', 'Environmental change', 'Light transformation', 'Weather development', 'Season shift', 'Day to night', 'Growth over time'],
    emotionalArc: ['Awe inspiring', 'Peaceful serene', 'Dramatic intense', 'Mysterious subtle', 'Joyful bright', 'Somber dark', 'Hopeful uplift'],
    subtext: [],
    // Pacing & Timing (Step 20)
    pacing: ['Slow meditative', 'Steady consistent', 'Brisk movement', 'Accelerating build', 'Decelerating calm', 'Variable rhythm'],
    timing: ['Extended hold', 'Quick transition', 'Perfect beat sync', 'Held moment', 'Music sync tight', 'Music sync loose'],
    rhythmNotes: [],
    // Final Touches (Step 21)
    finalTouches: ['Color grading complete', 'Sound design done', 'Music perfectly placed', 'Technical specs right', 'Emotional impact clear', 'Unique perspective', 'Stunning beauty', 'Compelling story', 'Technical excellence'],
    customDetails: [],
  },
  animation: {
    genre: ['Anime action', 'Pixar-style 3D', 'Hand-drawn 2D', 'Stop-motion cozy', 'Studio Ghibli vibe', 'Comic-book stylized', 'Claymation', 'Cel-shaded adventure', 'Retro cartoon', 'Fantasy animation', 'Sci-fi animation'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot', 'Panoramic sweep', 'Montage beat', 'Dutch angle', 'Bird\'s eye view', 'Low angle', 'High angle', 'Extreme close-up', 'Medium close-up', 'Two-shot', 'Point-of-view', 'Insert detail', 'Rack focus reveal'],
    role: ['hero character', 'sidekick', 'villain', 'cute creature', 'robot companion', 'magical student', 'space pilot', 'wandering adventurer', 'mystic mentor', 'comic relief', 'noble knight', 'wise elder', 'mysterious stranger', 'loyal companion', 'fearless leader'],
    hairColor: ['black', 'brown', 'blonde', 'red', 'silver', 'white', 'neon pink', 'neon blue', 'multicolored', 'pastel purple', 'mint green', 'golden yellow'],
    eyeColor: ['brown', 'green', 'blue', 'gray', 'gold', 'violet', 'heterochromia', 'ruby red', 'emerald green', 'sapphire blue', 'amber gold', 'silver white'],
    bodyDescriptor: ['tall', 'short', 'slender', 'athletic build', 'chibi proportions', 'heroic silhouette', 'exaggerated proportions', 'petite', 'lanky', 'stocky', 'graceful', 'muscular', 'ethereal'],
    wardrobe: ['stylized outfit', 'school uniform', 'fantasy armor', 'retro jumpsuit', 'hoodie streetwear', 'flowing cloak', 'colorful costume', 'simple silhouette', 'magical robes', 'tech-wear', 'battle gear', 'casual streetwear', 'formal attire', 'adventure gear', 'mystical garb'],
    pose: ['expressive gesture', 'dynamic action pose', 'mid-leap', 'dramatic turn', 'running stance', 'hero landing', 'quiet contemplative pose', 'power stance', 'peaceful sit', 'celebratory jump', 'determined walk', 'shocked expression', 'triumphant raise'],
    mood: ['Whimsical', 'Energetic', 'Dreamy', 'Triumphant', 'Mysterious', 'Playful', 'Heartfelt', 'Epic', 'Melancholic', 'Hopeful', 'Tense', 'Joyful', 'Somber', 'Adventurous'],
    lighting: ['Soft bounce', 'Golden hour', 'Neon rim light', 'Volumetric shafts', 'Moonlight', 'Studio key light', 'Painterly glow', 'Glowing magic', 'Harsh contrast', 'Soft diffuse', 'Colorful gels', 'Practical lamps', 'Silhouette back', 'Side light'],
    environment: ['Fantasy town', 'Neon city', 'Forest trail', 'Ancient temple', 'Space station', 'Coastal cliffs', 'Mountain cabin', 'Magical library', 'Toy workshop', 'Digital realm', 'School grounds', 'Castle halls', 'Underground cavern', 'Floating island', 'Bustling marketplace'],
    environmentTexture: ['painterly', 'cel-shaded', 'soft watercolor', 'hand-inked', 'clean vector', 'chunky clay texture', 'paper cutout texture', 'smooth gradient', 'textured brushwork', 'outlined bold', 'shaded soft', 'geometric clean'],
    weather: ['Clear', 'Soft rain', 'Snow flurry', 'Foggy morning', 'Starry night', 'Overcast', 'Sunny bright', 'Cloudy soft', 'Rainbow arc', 'Storm brewing', 'Magical mist', 'Aurora glow', 'Twilight dusk'],
    lightInteraction: ['wraps gently', 'paints rim highlights', 'diffuses softly', 'creates halos', 'glitters on surfaces', 'casts glow', 'sparkles magical', 'bounces playfully', 'shimmers ethereal', 'pulses energy', 'radiates warmth', 'flickers mystical'],
    sig1: ['hand-drawn linework', 'cel shading', 'painterly brush strokes', 'bouncy squash-and-stretch', 'clean outlines', 'vibrant color fills', 'soft glow effects', 'dynamic motion lines', 'expressive facial details', 'textured backgrounds', 'comic book dots', 'stylized shadows'],
    sig2: ['stylized motion blur', 'sparkle particles', 'soft bloom', 'film grain (subtle)', 'comic halftone texture', 'light rays', 'color pop', 'dynamic lighting', 'shadow accents', 'vignette fade', 'magical shine', 'dramatic flare'],
    sound: ['Cartoon ambience', 'City bustle (stylized)', 'Forest ambience', 'Quiet room tone', 'Playful crowd walla', 'Retro arcade room tone', 'Toy workshop ambience', 'Windy rooftop ambience', 'Magical shimmer bed', 'Fantasy forest hush', 'Space station hum', 'School bell ring', 'Temple bells toll', 'Castle stone echo'],
    sfx: ['Whoosh transitions', 'Impact hit', 'Sparkle chimes', 'Footsteps', 'Magic shimmer', 'UI beeps', 'Boing bounce', 'Cartoon slide whistle', 'Pop sparkle', 'Comic punch thwack', 'Glitch blip', 'Energy zap', 'Page flip', 'Bubble pop', 'Chime stinger', 'Power up sound', 'Transformation whoosh', 'Victory chime'],
    music: ['Upbeat orchestral', 'Lo-fi beat', 'Chiptune', 'Ambient pad', 'No music', 'Energetic pop', 'Cinematic adventure', 'Whimsical tune', 'Fantasy score', 'Retro synthwave', 'Magical theme', 'Adventure march', 'Battle theme', 'Emotional piano', 'Epic build'],
    cameraMove: ['Slow push', 'Lateral dolly', 'Orbit reveal', 'Whip pan', 'Tilt up', 'Arc shot', 'Locked-off tableau', 'Dynamic track', 'Quick zoom', 'Spin around', 'Floating drift'],
    lens: ['35mm spherical', '24mm wide', '50mm prime', 'Anamorphic 40mm', 'Stylized virtual camera', '85mm portrait', '16mm ultra-wide', 'Fish-eye stylized'],
    focusTarget: ['the character', 'the face', 'the eyes', 'the hands', 'the magical object', 'the backdrop', 'the action', 'the expression'],
    colorGrade: ['High saturation', 'Pastel dream', 'Vibrant colors', 'Matte pastel', 'Neo-noir cool', 'Warm golden', 'Toon-shaded', 'Comic book', 'Bright vivid', 'Muted soft', 'High contrast bold', 'Stylized pop'],
    framingNotes: ['rule of thirds', 'center-framed', 'dynamic diagonals', 'strong silhouettes', 'negative space', 'leading lines', 'balanced symmetry', 'tight crop'],
    movementSubjectType: ['Person', 'Object', 'Creature', 'Magic', 'Energy', 'Spirit'],
    movement1: ['runs in', 'turns dramatically', 'jumps into frame', 'reaches out', 'spins', 'flies in', 'materializes', 'charges forward', 'dashes speedily', 'glides gracefully'],
    movement2: ['lands and poses', 'stops and looks around', 'moves out of frame', 'smiles and waves', 'stands triumphant', 'sits peacefully', 'disappears mysteriously', 'fades gently', 'transforms completely', 'embraces ally'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'graceful', 'frantic', 'deliberate'],
    movementManner: ['confidently', 'playfully', 'dramatically', 'gracefully', 'heroically', 'mysteriously', 'cheerfully', 'solemnly'],
    dialogue: ['Character speaks', 'Internal monologue', 'Whispered thought', 'Shouted exclamation', 'Mysterious voice', 'No dialogue'],
    pronoun: ['They', 'He', 'She', 'I', 'We'],
    dialogue_verb: ['says', 'exclaims', 'whispers', 'shouts', 'murmurs', 'declares', 'questions', 'laughs'],
    mix_notes: ['Clear dialogue', 'Emotional delivery', 'Energetic tone', 'Soft whisper', 'Powerful shout'],
    position: ['center frame', 'left side', 'right side', 'background', 'foreground', 'elevated', 'lowered', 'off-screen'],
    activity: ['battling', 'exploring', 'discovering', 'learning', 'celebrating', 'mourning', 'thinking', 'creating'],
    accessory: ['magical staff', 'mystical pendant', 'ancient weapon', 'glowing crystal', 'enchanted scroll', 'power ring', 'mystical artifact', 'worn map', 'treasure chest', 'portal key'],
    explicit_abilities: ['Magic casting', 'Super strength', 'Flight ability', 'Time manipulation', 'Telepathy', 'Shape-shifting', 'Elemental control', 'Healing power', 'Invisibility', 'Teleportation'],
    body_description: ['Youthful features', 'Determined expression', 'Glowing eyes', 'Mystical aura', 'Marked with runes', 'Ethereal presence', 'Angular features', 'Round face', 'Expressive eyes', 'Graceful form'],
    sexual_description: ['Not applicable', 'N/A', 'N/A', 'N/A'],
    fetish: ['Not applicable'],
    bodyFocus: ['expressive eyes', 'dynamic hands', 'character features', 'action pose', 'costume details', 'magical effects', 'facial expression', 'silhouette shape'],
    sensation: ['magical energy', 'motion feeling', 'emotional resonance', 'dramatic tension', 'joyful energy', 'mysterious presence', 'peaceful calm', 'adventurous spirit'],
    // Creative Brief fields (Step 1)
    sceneDescription: [],
    mainSubject: ['Character hero', 'Creature/Monster', 'Object magical', 'Environment fantasy', 'Group ensemble', 'Abstract concept', 'Creature companion', 'Mystical artifact'],
    storyElements: ['Adventure quest', 'Character growth', 'Magical discovery', 'Friendship bond', 'Heroic sacrifice', 'Villain defeat', 'Secret revealed', 'Transformation power', 'Comedy moment', 'Emotional scene', 'Action battle', 'Mystery puzzle', 'Love connection', 'Betrayal shock', 'Victory celebration'],
    inspirationNotes: [],
    // Advanced Technical (Step 13)
    advancedTechnical: ['Hand-drawn animation', '3D CGI render', 'Stop-motion puppet', 'Motion capture data', 'Rotoscope animation', 'Particle effects', 'Cloth simulation', 'Hair simulation', 'Lighting render', 'Ambient occlusion', 'Subsurface scattering', 'Volumetric lighting', 'Ray tracing render', 'Shader complexity', 'Texture detail', 'Rig detail', 'Blend shape controls'],
    cinematicNotes: [],
    // References & Inspiration (Step 16)
    references: ['Studio Ghibli film', 'Pixar movie', 'Disney classic', 'DreamWorks style', 'Anime franchise', 'Comic book series', 'Video game cinematic', 'Storybook illustration', 'Art nouveau style', 'Manga aesthetic', 'CGI blockbuster', 'Stop-motion feature', 'Traditional animation', 'Rotoscope style', 'Anime-influenced', 'Western animation', 'Eastern animation', 'Indie animation', 'Experimental animation', 'Educational animation'],
    inspirationStyle: ['Whimsical playful', 'Heroic epic', 'Dark mysterious', 'Soft dreamy', 'Bright energetic', 'Muted artistic', 'Detailed hyper', 'Minimalist simple', 'Geometric clean', 'Organic flowing', 'Realistic grounded', 'Stylized exaggerated', 'Surreal fantastic', 'Horror eerie', 'Comedy slapstick'],
    visualReference: [],
    // Time/Season/Era (Step 17)
    timeOfDay: ['Early morning', 'Sunrise', 'Morning', 'Late morning', 'Midday', 'Early afternoon', 'Late afternoon', 'Golden hour', 'Sunset', 'Blue hour', 'Dusk', 'Early night', 'Deep night', 'Midnight', 'Pre-dawn'],
    season: ['Spring', 'Summer', 'Autumn', 'Winter', 'Eternal spring', 'Eternal winter', 'Magical season', 'Mixed seasons'],
    era: ['Fantasy timeless', 'Medieval fantasy', 'Steampunk adventure', 'Cyberpunk future', 'Historical period', 'Modern present', 'Post-apocalyptic', 'Magical realm', 'Outer space', 'Underground world', 'Underwater kingdom', 'Sky cities', 'Lost civilization', 'Alternate dimension', 'Dream world'],
    culturalContext: ['Western fantasy', 'Eastern mythology', 'African inspired', 'Asian fusion', 'Nordic mystical', 'Mediterranean culture', 'Indigenous culture', 'Urban modern', 'Rural traditional', 'Imaginary world'],
    // VFX & Effects (Step 18)
    specialEffects: ['Particle system', 'Sparkle effect', 'Glow aura', 'Light burst', 'Smoke cloud', 'Fire animation', 'Water splash', 'Lightning bolt', 'Portal effect', 'Teleport shimmer', 'Magic circle', 'Dust storm', 'Explosion effect', 'Impact hit', 'Trail effect', 'Bloom glow', 'Screen shake', 'Transition wipe', 'Dissolve fade', 'Glitch effect'],
    practicalElements: ['Animation rig', 'Motion capture', 'Keyframe animation', 'Procedural animation', 'Inverse kinematics', 'Forward kinematics', 'Blend shapes', 'Bone deformation', 'Muscle simulation', 'Dynamic physics'],
    vfxNotes: [],
    // Character Development (Step 19)
    characterDevelopment: ['Hero arc', 'Villain motivation', 'Sidekick loyalty', 'Character quirk', 'Personality trait', 'Skill/power mastery', 'Relationship growth', 'Conflict resolution', 'Inner transformation', 'External change'],
    emotionalArc: ['Hopeful beginning', 'Doubt midpoint', 'Determination peak', 'Sacrifice climax', 'Joy resolution', 'Sad farewell', 'Triumphant end', 'Bittersweet close'],
    subtext: ['Hidden power', 'Secret identity', 'Unspoken love', 'Inner doubt', 'True purpose', 'Dark past', 'Light future', 'Redemption chance'],
    // Pacing & Timing (Step 20)
    pacing: ['Slow thoughtful', 'Steady consistent', 'Brisk energetic', 'Frantic exciting', 'Variable mixed', 'Climactic intense', 'Resolution calm'],
    timing: ['Extended moment', 'Quick action', 'Perfect beat', 'Held pause', 'Overlapped action', 'Punchy rhythm', 'Smooth flow'],
    rhythmNotes: [],
    // Final Touches (Step 21)
    finalTouches: ['Animation polish', 'Effects finalize', 'Color grading done', 'Sound effects placed', 'Music score added', 'Dialogue clean', 'Render quality high', 'Composition balanced', 'Pacing perfect', 'Emotional impact strong'],
    customDetails: [],
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
    // Creative Brief fields (Step 1)
    sceneDescription: [],
    mainSubject: ['Person/Partner', 'Couple intimate', 'Solo intimate', 'Group scene', 'Body focus', 'Object/Accessory', 'Imagination fantasy', 'Sensory element'],
    storyElements: ['Seduction', 'Passion', 'Tenderness', 'Playfulness', 'Dominance', 'Submission', 'Exploration', 'Connection', 'Pleasure', 'Desire', 'Intimacy', 'Vulnerability', 'Power dynamic', 'Release', 'Satisfaction'],
    inspirationNotes: [],
    // Advanced Technical (Step 13)
    advancedTechnical: ['Shallow DOF', 'Bokeh dreamy', 'Soft focus beauty', 'Skin smoothing', 'Color grading warm', 'Color grading cool', 'Grain subtle texture', 'Noise reduction', 'Bloom glow enhanced', 'Lens flare subtle', 'Vignette darkening', 'Soft diffusion filter', 'Gloss highlights', 'Matte finish', 'Skin tone perfect', 'Blemish reduction', 'Eye brightening', 'Lip enhancement', 'Natural look', 'Artistic look'],
    cinematicNotes: [],
    // References & Inspiration (Step 16)
    references: ['Boudoir photography', 'Art nude tradition', 'Fashion editorial', 'Pin-up style', 'Erotic film', 'Romantic cinema', 'Jazz age', 'Vintage aesthetic', 'Contemporary sensual', 'Fine art nudity', 'Classical painting', 'Renaissance art', 'Modern artistic', 'Instagram aesthetic', 'Magazine spread', 'Luxury branding', 'Fashion photography', 'Beauty editorial', 'Music video style', 'Soft erotica'],
    inspirationStyle: ['Soft romantic', 'Bold confident', 'Tender intimate', 'Playful teasing', 'Sultry mysterious', 'Artistic tasteful', 'Luxurious decadent', 'Natural organic', 'Artistic abstract', 'Dramatic cinematic', 'Bright energetic', 'Dark moody', 'Ethereal dreamy', 'Elegant refined', 'Raw authentic'],
    visualReference: [],
    // Time/Season/Era (Step 17)
    timeOfDay: ['Early morning', 'Sunrise glow', 'Morning light', 'Late morning', 'Midday', 'Early afternoon', 'Late afternoon', 'Golden hour', 'Sunset', 'Blue hour', 'Dusk', 'Early night', 'Deep night', 'Midnight', 'Pre-dawn'],
    season: ['Spring renewal', 'Summer heat', 'Autumn warmth', 'Winter intimacy', 'No season', 'Timeless eternal'],
    era: ['Modern contemporary', 'Retro vintage', 'Victorian era', 'Art Deco', 'Timeless classic', 'Futuristic fantasy', 'Historical period', 'Romantic era', 'Jazz age', 'Contemporary luxury'],
    culturalContext: ['Western romance', 'Sensual tradition', 'Artistic community', 'Luxury lifestyle', 'Bohemian spirit', 'Modern fashion', 'Classic elegance', 'Urban contemporary', 'Natural authenticity', 'Spiritual sacred'],
    // VFX & Effects (Step 18)
    specialEffects: ['Bloom glow', 'Soft focus', 'Lens flare', 'Light leak', 'Vignette soft', 'Diffusion haze', 'Color shift', 'Saturation boost', 'Desaturation selective', 'Monochrome tint', 'Sepia tone', 'Skin smoothing', 'Shine removal', 'Glow enhancement', 'Sparkle effect', 'Particle shimmer', 'Motion blur artistic', 'Shallow DOF art', 'Film grain', 'Digital artifacts'],
    practicalElements: ['Soft lighting', 'Diffusion silk', 'Reflector bounce', 'Colored gels', 'Practical lamps', 'Candle light', 'Fabric drapes', 'Mirror reflection', 'Window light', 'Sheer curtains', 'Silk sheets', 'Soft props', 'Flower petals', 'Oil/lotion sheen', 'Moisture/sweat', 'Steam effect'],
    vfxNotes: [],
    // Character Development (Step 19)
    characterDevelopment: ['Confidence', 'Vulnerability', 'Desire shown', 'Comfort expressed', 'Pleasure visible', 'Surrender moment', 'Power dynamic', 'Connection building', 'Trust evident', 'Passion escalating'],
    emotionalArc: ['Anticipation start', 'Building arousal', 'Climactic moment', 'Satisfaction end', 'Tender aftermath', 'Vulnerable transition', 'Joyful connection', 'Intimate closure'],
    subtext: ['Hidden desire', 'True connection', 'Power play', 'Emotional release', 'Physical pleasure', 'Spiritual bond', 'Raw authenticity', 'Safe exploration'],
    // Pacing & Timing (Step 20)
    pacing: ['Slow sensual', 'Steady building', 'Passionate fast', 'Varied rhythm', 'Teasing staccato', 'Flowing smooth', 'Accelerating climax', 'Gentle resolution'],
    timing: ['Extended moment', 'Quick transition', 'Perfect beat', 'Lingering pause', 'Overlapped action', 'Rhythmic sync', 'Music tied close'],
    rhythmNotes: [],
    // Final Touches (Step 21)
    finalTouches: ['Color grading perfect', 'Skin tones beautiful', 'Mood established', 'Audio intimate', 'Pacing satisfying', 'Emotion authentic', 'Artistry evident', 'Tastefully done', 'Consent respected', 'Pleasure centered'],
    customDetails: [],
    // Movement presets
    //TODO: Customize these for NSFW context that show only when NSFW is Selected
    movementSubjectType: ['Person', 'Object', 'Animal', 'Fantasy Creature', 'Mythical Being', 'Robot', 'Alien', 'Doll', 'Puppet', 'Statue', 'Toy', 'Inanimate Object', 'Partner', 'Lover', 'Body', 'Limb', 'Gaze', 'Touch', 'Pose', 'Silhouette', 'Shadow', 'Reflection', 'Caress', 'Embrace', 'Whisper', 'Breath', 'Pulse', 'Heat', 'Desire', 'Intimacy', 'Seduction', 'Temptation', 'Allure', 'Passion', 'Tenderness', 'Boldness', 'Shyness', 'Playfulness', 'Teasing', 'Urgency', 'Deliberation', 'Hesitation', 'Confidence', 'Nervousness', 'Quietude', 'Carefulness', 'Casualness', 'Gracefulness', 'Awkwardness'],
    movement1: ['walks in', 'enters', 'moves into frame', 'is carried in', 'is wheeled in', 'is placed in frame', 'rolls in', 'crawls in', 'slithers in', 'flies in', 'glides in', 'materializes', 'emerges', 'appears suddenly', 'is lifted in', 'is pushed in', 'is pulled in', 'is dragged in', 'is tossed in', 'is spun in', 'is rolled in', 'is tumbled in', 'saunters in seductively', 'struts in confidently', 'tiptoes in quietly', 'rushes in urgently', 'ambles in relaxed', 'bounds in energetically', 'drifts in lazily', 'marches in determinedly', 'wanders in aimlessly', 'slides in smoothly', 'twirls into frame', 'leaps in dramatically', 'sneaks in covertly', 'bursts in excitedly', 'meanders in thoughtfully', 'advances in intently', 'retreats into frame', 'approaches in curiously', 'invades the space', 'occupies the frame', 'fills the view', 'dominates the entrance', 'commands attention', 'beckons invitingly', 'beckons teasingly', 'beckons urgently', 'beckons playfully', 'beckons seductively', 'beckons intimately', 'beckons passionately', 'beckons tenderly', 'beckons boldly', 'beckons shyly', 'beckons eagerly', 'beckons reluctantly', 'beckons smoothly', 'beckons hesitantly', 'beckons deliberately', 'beckons quickly', 'beckons slowly', 'beckons lightly', 'beckons heavily', 'beckons softly', 'beckons firmly', 'beckons gently', 'beckons abruptly', 'beckons fluidly', 'beckons stiffly', 'beckons lively', 'beckons sluggishly'],
    movement2: ['sits', 'stands', 'takes a seat', 'is set down', 'rests', 'moves out of frame', 'lies down', 'reclines', 'crouches', 'kneels', 'rises slowly', 'stands up', 'gets up', 'stretches out', 'turns away', 'walks out', 'exits frame', 'disappears', 'fades away', 'is lifted out', 'is pushed out', 'is pulled out', 'is dragged out', 'is tossed out', 'is spun out', 'is rolled out', 'is tumbled out', 'is carried out', 'reclines seductively', 'poses intimately', 'leans back enticingly', 'stretches languidly', 'arches invitingly', 'curls up warmly', 'sprawls comfortably', 'perches delicately', 'settles in cozily', 'lounges luxuriously', 'drapes elegantly', 'nests snugly', 'huddles closely', 'snuggles affectionately', 'embraces tightly', 'clasps hands', 'intertwines fingers', 'presses close', 'nuzzles softly', 'whispers intimately', 'breathes heavily', 'pulses with heat', 'radiates desire', 'glows with passion', 'shimmers in light', 'casts alluring shadows', 'reflects seductively', 'touches gently', 'caresses softly', 'strokes tenderly', 'explores curiously', 'lingers intimately', 'withdraws slowly', 'beckons invitingly', 'beckons teasingly', 'beckons urgently', 'beckons playfully', 'beckons seductively', 'beckons intimately', 'beckons passionately', 'beckons tenderly', 'beckons boldly', 'beckons shyly', 'beckons eagerly', 'beckons reluctantly', 'beckons smoothly', 'beckons hesitantly', 'beckons deliberately', 'beckons quickly', 'beckons slowly', 'beckons lightly', 'beckons heavily', 'beckons softly', 'beckons firmly', 'beckons gently', 'beckons abruptly', 'beckons fluidly', 'beckons stiffly', 'beckons lively', 'beckons sluggishly'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'hesitant', 'deliberate', 'leisurely', 'quick', 'urgent', 'casual', 'measured', 'fluid', 'jerky', 'graceful', 'awkward', 'smooth', 'stiff', 'lively', 'sluggish', 'energetic', 'teasingly slow', 'urgently', 'playfully', 'seductively', 'provocatively', 'intimately', 'passionately', 'tenderly', 'boldly', 'shyly', 'confidently', 'nervously', 'quietly', 'carefully', 'casually', 'gracefully', 'awkwardly', 'dramatically', 'subtly', 'intensely', 'lazily', 'energetically', 'thoughtfully', 'curiously', 'determinedly', 'aimlessly', 'smoothly', 'abruptly', 'gradually', 'suddenly', 'rhythmically', 'erratically', 'fluidly', 'staccato'],
    movementManner: ['confidently', 'nervously', 'quietly', 'carefully', 'casually', 'gracefully', 'awkwardly', 'sensually', 'playfully', 'boldly', 'shyly', 'eagerly', 'reluctantly', 'smoothly', 'hesitantly', 'deliberately', 'quickly', 'slowly', 'lightly', 'heavily', 'softly', 'firmly', 'gently', 'abruptly', 'fluidly', 'stiffly', 'lively', 'sluggishly', 'seductively', 'provocatively', 'intimately', 'passionately', 'tenderly', 'boldly', 'shyly', 'playfully', 'teasingly', 'urgently', 'deliberately', 'hesitantly', 'briskly', 'hurriedly', 'steadily', 'slowly', 'dramatically', 'subtly', 'intensely', 'lazily', 'energetically', 'thoughtfully', 'curiously', 'determinedly', 'aimlessly', 'smoothly', 'abruptly', 'gradually', 'suddenly', 'rhythmically', 'erratically', 'fluidly', 'staccato'],
  },
  photography: {
    genre: ['Portrait', 'Environmental portrait', 'Product shot', 'Fashion editorial', 'Landscape', 'Architectural', 'Street photography', 'Macro/Detail', 'Still life', 'Food styling', 'Beauty close-up', 'Headshot', 'Lifestyle', 'Documentary style', 'Event coverage', 'Travel', 'Nature', 'Wildlife', 'Underwater', 'Aerial', 'Long exposure', 'High-speed action', 'Astrophotography', 'Pet photography', 'Flat lay', 'Minimal', 'Fine art', 'Conceptual', 'Surreal', 'Vintage', 'Film noir'],
    shot: ['Wide establishing', 'Medium shot', 'Close-up', 'Extreme close-up', 'Portrait', 'Half-body', 'Full-body', 'Group shot', 'Detail shot', 'Environmental', 'Overhead flat lay', 'Low angle', 'High angle', 'Profile', 'Over-the-shoulder', 'Dutch tilt', 'Bird\'s eye view', 'Worm\'s eye view', 'Macro', 'Silhouette', 'Backlit', 'Reflected', 'Through frame', 'Shadow play', 'Symmetrical', 'Rule of thirds', 'Leading lines', 'Layered depth', 'Crop tight', 'Crop loose'],
    role: ['Model', 'Professional', 'Artist', 'Athlete', 'Performer', 'Subject', 'Product', 'Landscape', 'Object', 'Creature', 'Child', 'Elderly', 'Couple', 'Family', 'Group', 'Nobody', 'Hands only', 'Silhouette', 'Reflection', 'Shadow'],
    hairColor: ['black', 'dark brown', 'brown', 'auburn', 'red', 'blonde', 'platinum blonde', 'silver', 'white', 'gray', 'natural', 'styled'],
    eyeColor: ['brown', 'hazel', 'green', 'blue', 'gray', 'amber', 'natural', 'closed'],
    bodyDescriptor: ['tall', 'short', 'slender', 'athletic build', 'muscular build', 'curvy build', 'petite', 'plus-size', 'average', 'proportional'],
    lighting: ['Natural window light', 'Golden hour', 'Blue hour', 'Overcast soft', 'Studio softbox', 'Studio umbrella', 'Reflector fill', 'Ring light', 'Split light', 'Rim light', 'Backlit', 'Side light', 'Hard sunlight', 'Harsh shadows', 'Soft diffuse', 'Beauty dish', 'Octabox', 'Godox', 'Neon glow', 'Practical lights', 'LED panel', 'Strobe flash', 'Off-camera flash', 'Flash fill', 'Bounce fill', 'Snoot spotlight'],
    environment: ['Studio cyclorama', 'Brick wall', 'White backdrop', 'Black backdrop', 'Textured wall', 'Natural outdoor', 'Urban street', 'Forest', 'Beach', 'Mountains', 'Desert', 'City skyline', 'Park', 'Garden', 'Interior home', 'Office', 'Factory', 'Abandoned building', 'Water', 'Snow', 'Field', 'Library', 'Museum', 'Gallery', 'Architecture', 'Mirror', 'Window'],
    wardrobe: ['Tailored suit', 'Casual dress', 'Business attire', 'Sportswear', 'Formal gown', 'Denim & tee', 'Minimalist monochrome', 'Colorful', 'Textured fabric', 'Silk', 'Cotton', 'Leather', 'Knitwear', 'Accessories focus', 'Jewelry', 'Hat', 'Scarf', 'Sunglasses', 'Watch', 'Shoes featured', 'Hands only', 'Partial costume'],
    pose: ['Standing', 'Sitting', 'Lying down', 'Kneeling', 'Leaning', 'Arms at side', 'Arms crossed', 'Hand on hip', 'Hands clasped', 'Looking at camera', 'Looking away', 'Profile view', 'Over-shoulder', 'Dynamic movement', 'Candid moment', 'Relaxed', 'Formal', 'Hands in pockets', 'Hand through hair', 'Laughing', 'Smiling', 'Neutral expression', 'Head tilted', 'Chin down', 'Looking up'],
    cameraSettings: ['f/1.4 shallow depth', 'f/1.8 shallow depth', 'f/2.8 shallow depth', 'f/4 moderate depth', 'f/5.6 moderate depth', 'f/8 deep focus', 'f/11 deep focus', 'f/16 sharp throughout', 'ISO 100 clean', 'ISO 400 clean', 'ISO 1600 acceptable', 'ISO 3200 grainy', '1/1000 shutter', '1/500 shutter', '1/125 shutter', '1/60 shutter', '1/30 shutter', '1 second exposure', 'long exposure', 'burst mode', 'RAW format', 'JPEG format'],
    lens: ['35mm prime', '50mm prime', '85mm prime', '100mm macro', '24mm wide', '16mm ultra-wide', '135mm telephoto', '200mm telephoto', '50mm f/1.4', '85mm f/1.8', '100mm f/2.8 macro', '24-70mm zoom', '18-55mm kit lens', '70-300mm zoom', 'fisheye lens', 'tilt-shift lens', 'soft focus lens', 'macro lens'],
    colorGrade: ['Warm filmic', 'Cool tones', 'Vibrant colors', 'Muted pastels', 'Black & white', 'Monochrome', 'Sepia', 'High contrast', 'Low contrast', 'High saturation', 'Desaturated', 'Split tone', 'Color pop', 'Vintage look', 'Modern clean', 'Cinematic', 'Natural', 'Contrasty', 'Flat', 'Moody', 'Bright airy', 'Dark moody', 'Warm golden', 'Cool blue', 'Faded film'],
    aperture: ['f/0.95 ultra shallow', 'f/1.2 very shallow', 'f/1.4 shallow', 'f/1.8 shallow', 'f/2 moderate', 'f/2.8 moderate', 'f/4 balanced', 'f/5.6 balanced', 'f/8 deep', 'f/11 deep', 'f/16 very deep', 'f/22 maximum'],
    shutterSpeed: ['1/4000 fast', '1/2000 fast', '1/1000 fast', '1/500 moderate', '1/250 moderate', '1/125 moderate', '1/60 moderate', '1/30 slow', '1/15 slow', '1/8 slow', '1 second', '2 seconds', 'bulb mode'],
    iso: ['100 clean', '200 clean', '400 clean', '800 acceptable', '1600 acceptable', '3200 grainy', '6400 very grainy', 'auto ISO', 'low light boost'],
    whiteBalance: ['Daylight 5500K', 'Cloudy 6500K', 'Tungsten 3200K', 'Fluorescent 4000K', 'Flash 5500K', 'Candle warm', 'Cool blue', 'Warm orange', 'Auto WB', 'Custom WB', 'Kelvin dial'],
    composition: ['Rule of thirds', 'Center framed', 'Golden ratio', 'Leading lines', 'Symmetrical', 'Asymmetrical', 'Negative space', 'Layered depth', 'Framing within frame', 'Foreground interest', 'Shallow depth', 'Deep focus', 'Tight crop', 'Wide composition', 'Diagonal lines', 'Curved lines', 'Vertical emphasis', 'Horizontal emphasis'],
    weather: ['Clear sky', 'Blue sky', 'Cloudy soft', 'Overcast', 'Golden hour warm', 'Sunset orange', 'Sunrise pink', 'Storm dramatic', 'Rain glossy', 'Snow white', 'Fog misty', 'Frost cold', 'Dew dewy', 'Wind blown', 'Sunny bright', 'Shadowy', 'Backlit', 'Misty morning'],
    lightQuality: ['Hard direct sunlight', 'Soft diffused light', 'Golden warm', 'Blue cool', 'Mixed color temp', 'Volumetric rays', 'Rim lit', 'Silhouette backlit', 'Even exposure', 'High contrast shadows', 'Low contrast flat', 'Specular highlights', 'Diffuse reflection'],
    depthOfField: ['Extreme shallow', 'Shallow bokeh', 'Moderate depth', 'Deep throughout', 'Tack sharp', 'Creative blur', 'Macro magnification', 'Infinity focus'],
    postProcessing: ['RAW editing', 'Lightroom preset', 'Capture One', 'Photoshop edit', 'Dodge and burn', 'Clarity boost', 'Contrast enhance', 'Vibrance adjust', 'Saturation control', 'Tone curve', 'Shadow lift', 'Highlight recover', 'Grain reduction', 'Sharpening boost', 'Blur background', 'Remove blemish', 'Crop adjust'],
    style: ['Documentary', 'Fine art', 'Commercial', 'Editorial', 'Fine portrait', 'Environmental', 'Minimalist', 'Maximalist', 'Vintage aesthetic', 'Modern clean', 'Painterly', 'Graphic', 'Ethereal', 'Gritty', 'Polished', 'Raw', 'Stylized', 'Realistic', 'Dreamy', 'Cinematic'],
    mood: ['Calm serene', 'Energetic vibrant', 'Melancholic moody', 'Joyful bright', 'Romantic dreamy', 'Dramatic intense', 'Peaceful quiet', 'Playful fun', 'Professional serious', 'Intimate close', 'Powerful strong', 'Vulnerable tender', 'Elegant graceful', 'Rustic natural', 'Luxurious opulent'],
    texture: ['Smooth polished', 'Textured rough', 'Weathered aged', 'Clean pristine', 'Worn vintage', 'Metallic shiny', 'Matte flat', 'Glossy reflective', 'Soft silky', 'Grainy film', 'Organic natural', 'Geometric pattern'],
    subject: ['Single person', 'Multiple people', 'Couple', 'Family group', 'Still life object', 'Product item', 'Landscape scene', 'Architecture detail', 'Nature element', 'Abstract concept', 'Hands detail', 'Face close-up', 'Body parts', 'Food styled', 'Animal', 'Mixed composition'],
    purpose: ['Portfolio piece', 'Commercial client', 'Stock photography', 'Social media', 'Gallery display', 'Album cover', 'Book illustration', 'Web design', 'Print advertising', 'Catalog photo', 'Documentary evidence', 'Personal project'],
    sceneDescription: [],
    mainSubject: ['Person', 'People', 'Object', 'Landscape', 'Still life', 'Architecture', 'Nature', 'Animal', 'Food', 'Hands', 'Details', 'Abstract', 'Reflection', 'Shadow'],
    storyElements: ['Emotion', 'Motion', 'Texture', 'Color', 'Light play', 'Contrast', 'Composition', 'Depth', 'Scale', 'Perspective', 'Pattern', 'Simplicity', 'Complexity'],
    inspirationNotes: [],
    advancedTechnical: ['f/1.4 ultra shallow', 'f/2.8 shallow bokeh', 'f/5.6 moderate', 'f/11 deep focus', 'Manual focus', 'Autofocus tracking', 'Zone focusing', 'Zone focus technique', 'Exposure bracketing', 'ND filter long exposure', 'Polarizing filter effect', 'Gradient ND filter', 'Macro lens extension tubes', 'Wide-angle distortion', 'Telephoto compression', 'Fisheye barrel distortion', 'Tilt-shift effect', 'Motion blur intentional', 'Panning technique', 'Focus stacking', 'High-speed flash sync', 'Slow sync flash', 'Flash exposure comp', 'Ambient light balance', 'Gel color correction', 'Diffusion filter', 'Soft focus filter', 'Infrared photography', 'Ultraviolet light', 'Black light effect'],
    cinematicNotes: [],
    references: ['Instagram reference', 'Pinterest aesthetic', 'Photographer style', 'Magazine editorial', 'Fine art photography', 'Commercial photography', 'Advertising campaign', 'Fashion photography', 'Documentary style', 'Street photography movement', 'Fine art tradition', 'Classical painting reference', 'Contemporary art', 'Photography book', 'Photo essay style', 'Museum exhibition', 'Historical photography', 'Vintage aesthetic', 'Film photography', 'Digital photography'],
    inspirationStyle: ['Bold colorful', 'Minimalist monochrome', 'Maximalist busy', 'Fine art subtle', 'Commercial polished', 'Documentary raw', 'Vintage nostalgic', 'Modern clean', 'Painterly soft', 'Graphic sharp', 'Natural unretouched', 'Heavily edited', 'Ethereal dreamy', 'Gritty real', 'Cinematic moody', 'Bright airy', 'Dark moody', 'High contrast', 'Low contrast', 'Textural tactile'],
    visualReference: [],
    timeOfDay: ['Golden hour (5-6:30pm)', 'Blue hour (7-8pm)', 'Sunrise (6-8am)', 'Sunset (6-7pm)', 'Midday (12-2pm)', 'Morning light (8-10am)', 'Afternoon light (2-4pm)', 'Dusk (8-9pm)', 'Dawn (5-6am)', 'Night (after 9pm)', 'Twilight transition', 'Soft morning', 'Hard noon', 'Warm afternoon', 'Cool evening'],
    season: ['Spring bloom', 'Summer heat', 'Autumn colors', 'Winter frost', 'Early spring', 'Late spring', 'Early summer', 'Late summer', 'Early autumn', 'Late autumn', 'Early winter', 'Late winter'],
    era: ['Present day', 'Timeless', 'Retro 1970s', 'Retro 1980s', 'Retro 1990s', 'Vintage film', 'Classical art', 'Modern contemporary', 'Futuristic', 'Historical period', 'Art deco', 'Victorian era', 'Industrial age'],
    culturalContext: ['Western', 'Eastern', 'Urban contemporary', 'Rural traditional', 'High fashion', 'Casual street', 'Professional corporate', 'Artistic bohemian', 'Luxury lifestyle', 'Minimalist simple', 'Maximalist ornate', 'Natural organic'],
    specialEffects: ['None applied', 'Lens flare', 'Bloom glow', 'Light leak', 'Vignette', 'Chromatic aberration', 'Lens distortion', 'Motion blur', 'Double exposure', 'Intentional blur', 'Film grain', 'Dust particles', 'Bokeh balls', 'Light rays', 'Practical lighting effect', 'In-camera effect', 'Post-production effect'],
    practicalElements: ['Studio setup', 'Lighting rig', 'Reflector', 'Diffuser', 'Backdrop', 'Props', 'Styling', 'Positioning', 'Posing direction', 'Composition aid', 'Rule of thirds grid', 'Focus assist', 'Depth preview'],
    vfxNotes: [],
    characterDevelopment: ['Personality shine', 'Genuine expression', 'Connection made', 'Story suggested', 'Emotion captured', 'Authenticity', 'Vulnerability', 'Strength shown', 'Elegance displayed', 'Confidence present'],
    emotionalArc: ['Peaceful calm', 'Joyful bright', 'Serious contemplative', 'Playful fun', 'Romantic dreamy', 'Dramatic intense', 'Powerful strong', 'Vulnerable tender', 'Curious wondering', 'Confident assured'],
    subtext: ['Elegance underneath', 'Strength hidden', 'Vulnerability showing', 'Confidence present', 'Story implied', 'Mood atmospheric', 'Texture tactile', 'Light plays', 'Composition intentional'],
    pacing: ['Still moment', 'Frozen in time', 'Slow contemplation', 'Gentle flow', 'Dynamic movement', 'Action captured', 'Sequence series', 'Single decisive moment', 'Multiple layers', 'Layered depth'],
    timing: ['Perfect focus', 'Precise exposure', 'Moment captured', 'Movement frozen', 'Peak action', 'Expression perfect', 'Lighting ideal', 'Composition precise'],
    rhythmNotes: [],
    finalTouches: ['Exposure perfect', 'Focus tack sharp', 'Color accurate', 'Composition strong', 'Light beautiful', 'Mood established', 'Emotion captured', 'Technical excellence', 'Artistic vision', 'Unique perspective', 'Portfolio ready', 'Print quality'],
    customDetails: [],
  },
};

const STEPS = Array.from({ length: 22 }, (_, i) => i + 1);

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
  'storyElements',
]);

const STEP_FIELDS: Record<number, string[]> = {
  1: ['sceneDescription', 'mainSubject', 'storyElements', 'inspirationNotes'],
  2: ['genre', 'shot', 'framingNotes'],
  3: ['role', 'wardrobe', 'hairColor', 'eyeColor', 'bodyDescriptor'],
  4: ['pose', 'mood'],
  5: ['movementSubjectType', 'movementSubjectLabel', 'movement1', 'movement2', 'actions'],
  6: ['lighting', 'environment', 'environmentTexture', 'lightingIntensity'],
  7: ['cameraMove', 'lens', 'focusTarget'],
  8: ['colorGrade', 'weather'],
  9: ['lightInteraction', 'sig1', 'sig2'],
 10: ['sound', 'sfx'],
 11: ['music', 'mix_notes'],
 12: ['dialogue', 'pronoun', 'dialogue_verb'],
 13: ['advancedTechnical', 'cinematicNotes'],
 14: ['position', 'activity', 'accessory', 'explicit_abilities', 'body_description'],
 15: ['fetish', 'bodyFocus', 'sensation', 'sexual_description'],
 16: ['references', 'inspirationStyle', 'visualReference'],
 17: ['timeOfDay', 'season', 'era', 'culturalContext'],
 18: ['specialEffects', 'practicalElements', 'vfxNotes'],
 19: ['characterDevelopment', 'emotionalArc', 'subtext'],
 20: ['pacing', 'timing', 'rhythmNotes'],
 21: ['finalTouches', 'customDetails'],
 22: [],
};

const normalizeFieldKey = (field: string) => (field || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const ACTION_VALID_FIELDS = Array.from(new Set(Object.values(STEP_FIELDS).flat()));
const ACTION_NORMALIZED_FIELD_MAP = ACTION_VALID_FIELDS.reduce<Record<string, string>>((acc, field) => {
  acc[normalizeFieldKey(field)] = field;
  return acc;
}, {});

const ACTION_FIELD_ALIASES: Record<string, string> = {
  shotType: 'shot',
  shot_type: 'shot',
  shot_type_notes: 'framingNotes',
  camera: 'cameraMove',
  camera_move: 'cameraMove',
  cameraMovement: 'cameraMove',
  camera_movement: 'cameraMove',
  composition: 'framingNotes',
  framing: 'framingNotes',
  framing_notes: 'framingNotes',
  audio: 'sound',
  soundscape: 'sound',
  ambience: 'sound',
  subject: 'mainSubject',
  main_subject: 'mainSubject',
  location: 'environment',
  setting: 'environment',
  creativeBrief: 'sceneDescription',
  creative_brief: 'sceneDescription',
  scene_description: 'sceneDescription',
  sceneDescription: 'sceneDescription',
  description: 'sceneDescription',
  story: 'storyElements',
  time_of_day: 'timeOfDay',
};

// Helper: Get step number for a given field
const getStepForField = (fieldName: string): number | null => {
  for (const [stepNum, fields] of Object.entries(STEP_FIELDS)) {
    if (fields.includes(fieldName)) {
      return Number(stepNum);
    }
  }
  return null;
};

const TEMPLATES: Record<ModeId, { name: string; fields: Record<string, string> }[]> = {
  cinematic: [
    {
      name: 'Dramatic dialogue scene',
      fields: {
        genre_style: 'Drama',
        shot_type: 'Close-up portrait',
        subject_role: 'Protagonist',
        environment: 'Interior room',
        lighting: 'Dramatic side light',
        colorGrade: 'Cool moody',
        mood: 'Tense',
      },
    },
    {
      name: 'Action sequence',
      fields: {
        genre_style: 'Action thriller',
        shot_type: 'Dynamic tracking',
        subject_role: 'Hero',
        pose_action: 'Running',
        environment: 'Urban street',
        lighting: 'Natural daylight',
        colorGrade: 'Vibrant',
        cameraMove: 'Push follow',
      },
    },
  ],
  classic: [
    {
      name: 'Portrait setup',
      fields: {
        genre: 'Portrait',
        shot: 'Close-up',
        role: 'Model',
        wardrobe: 'Casual wear',
        environment: 'Studio',
        lighting: 'Soft window light',
        palette: 'Warm neutral',
    }
    },
  ],
  drone: [
    {
      name: 'Landscape reveal',
      fields: {
        genre: 'Landscape',
        shot: 'Wide aerial',
        role: 'Mountain vista',
        environment: 'Mountain terrain',
        lighting: 'Golden hour',
        weather: 'Clear',
        cameraMove: 'Slow drift',
      },
    },
  ],
  animation: [
    {
      name: 'Character intro',
      fields: {
        genre_style: 'Fantasy',
        shot_type: 'Hero shot',
        environment: 'Magical realm',
        lighting: 'Volumetric',
        mood: 'Adventurous',
      },
    },
  ],
  photography: [
    {
      name: 'Studio portrait',
      fields: {
        genre: 'Portrait',
        shot: 'Close-up headshot',
        lighting: 'Studio softbox',
        lightingIntensity: 'Soft',
        environment: 'White background',
        colorGrade: 'Clean neutral',
        mood: 'Professional',
      },
    },
    {
      name: 'Product photography',
      fields: {
        genre: 'Product',
        shot: 'Close-up detail',
        lighting: 'Studio cyclorama',
        lightingIntensity: 'Medium',
        environment: 'White studio',
        colorGrade: 'Bright clean',
        mood: 'Commercial',
      },
    },
    {
      name: 'Landscape photography',
      fields: {
        genre: 'Landscape',
        shot: 'Wide establishing',
        lighting: 'Golden hour',
        environment: 'Natural outdoor',
        colorGrade: 'Warm film',
        mood: 'Serene',
      },
    },
  ],
  nsfw: [
    {
      name: 'Intimate portrait',
      fields: {
        genre: 'Portrait',
        shot: 'Close-up',
        role: 'Model',
        environment: 'Bedroom',
        lighting: 'Soft warm light',
        mood: 'Romantic',
        position: 'Reclining',
      },
    },
  ],
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
  // Step 1: Creative Brief
  scene_description?: string;
  main_subject?: string;
  story_elements?: string;
  inspiration_notes?: string;
  // Step 13: Advanced Technical
  advanced_technical?: string;
  cinematic_notes?: string;
  // Step 16: References & Inspiration
  references?: string;
  inspiration_style?: string;
  visual_reference?: string;
  // Step 17: Time, Season & Era
  time_of_day?: string;
  season?: string;
  era?: string;
  cultural_context?: string;
  // Step 18: VFX & Effects
  special_effects?: string;
  practical_elements?: string;
  vfx_notes?: string;
  // Step 19: Character Development
  character_development?: string;
  emotional_arc?: string;
  subtext?: string;
  // Step 20: Pacing & Timing
  pacing?: string;
  timing?: string;
  rhythm_notes?: string;
  // Step 21: Final Touches
  final_touches?: string;
  custom_details?: string;
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
  // Extended fields for rich prompt building
  scene_description?: string;
  main_subject?: string;
  story_elements?: string;
  inspiration_notes?: string;
  advanced_technical?: string;
  cinematic_notes?: string;
  references?: string;
  inspiration_style?: string;
  visual_reference?: string;
  time_of_day?: string;
  season?: string;
  era?: string;
  cultural_context?: string;
  special_effects?: string;
  practical_elements?: string;
  vfx_notes?: string;
  character_development?: string;
  emotional_arc?: string;
  subtext?: string;
  pacing?: string;
  timing?: string;
  rhythm_notes?: string;
  final_touches?: string;
  custom_details?: string;
};

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
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
  const [introBase, setIntroBase] = useState<'film' | 'photo' | 'photography' | 'adult' | null>(null);
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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState('');
  const [historyViewModalOpen, setHistoryViewModalOpen] = useState(false);
  const [historyViewModalText, setHistoryViewModalText] = useState('');
  const [chatSystemPrompt, setChatSystemPrompt] = useState(DEFAULT_CHAT_SYSTEM_PROMPT);
  const [chatSystemPromptModalOpen, setChatSystemPromptModalOpen] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatDocked, setChatDocked] = useState(false);
  const [chatDockWidth, setChatDockWidth] = useState<number>(360);
  const [isResizingChatDock, setIsResizingChatDock] = useState(false);
  const chatResizeStartXRef = useRef<number | null>(null);
  const chatResizeStartWidthRef = useRef<number | null>(null);
  // Keyboard shortcuts modal state
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  // Unsaved changes indicator
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Undo/Redo system
  const [historyStack, setHistoryStack] = useState<Array<{
    values: Record<string, Record<string, string>>;
    mode: ModeId;
    step: number;
    timestamp: number;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isUndoRedoRef = useRef(false);
  // Action preview modal state
  const [actionPreviewOpen, setActionPreviewOpen] = useState(false);
  const [actionPreviewJson, setActionPreviewJson] = useState('');
  const [actionPreviewActions, setActionPreviewActions] = useState<Action[]>([]);
  const [actionPreviewErrors, setActionPreviewErrors] = useState<string[]>([]);
  const [actionPreviewRaw, setActionPreviewRaw] = useState('');
  const [actionPreviewDescriptions, setActionPreviewDescriptions] = useState<string[]>([]);
  const [actionPasteJson, setActionPasteJson] = useState('');
  const actionApplyModeRef = useRef<ModeId>(mode);
  const didHydrateRef = useRef(false);
  const didHydrateOptionSetsRef = useRef(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
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
    // Load chat settings
    const loadedChatSettings = loadChatSettings();
    if (loadedChatSettings) {
      if (loadedChatSettings.chatModel) setChatModel(loadedChatSettings.chatModel);
      if (typeof loadedChatSettings.chatDocked === 'boolean') setChatDocked(loadedChatSettings.chatDocked);
      if (typeof loadedChatSettings.chatDockWidth === 'number') setChatDockWidth(loadedChatSettings.chatDockWidth);
      if (typeof loadedChatSettings.chatSystemPrompt === 'string') setChatSystemPrompt(loadedChatSettings.chatSystemPrompt);
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
    if (!didHydrateRef.current) return;
    saveOllamaSettings(ollamaSettings);
  }, [ollamaSettings]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    const prev = loadChatSettings() || {};
    saveChatSettings({ ...prev, chatModel });
  }, [chatModel]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    const prev = loadChatSettings() || {};
    saveChatSettings({ ...prev, chatDocked });
  }, [chatDocked]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    const prev = loadChatSettings() || {};
    saveChatSettings({ ...prev, chatDockWidth });
  }, [chatDockWidth]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    const prev = loadChatSettings() || {};
    saveChatSettings({ ...prev, chatSystemPrompt });
  }, [chatSystemPrompt]);

  useEffect(() => {
    // Auto-scroll to bottom when messages update
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, chatSending]);

  useEffect(() => {
    actionApplyModeRef.current = mode;
  }, [mode]);

  // Dock resize handlers
  useEffect(() => {
    if (!isResizingChatDock) return;
    function onMouseMove(e: MouseEvent) {
      if (chatResizeStartXRef.current == null || chatResizeStartWidthRef.current == null) return;
      const delta = e.clientX - chatResizeStartXRef.current;
      const next = Math.min(640, Math.max(260, chatResizeStartWidthRef.current + delta));
      setChatDockWidth(next);
    }
    function onMouseUp() {
      setIsResizingChatDock(false);
      chatResizeStartXRef.current = null;
      chatResizeStartWidthRef.current = null;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizingChatDock]);

  // Get mode-specific system prompt for chat context
  const getModeSystemPrompt = (mode: ModeId): string => {
    const basePrompt = 'When expanding or refining prompts, output ONLY the expanded prompt in a markdown code block (```prompt ... ```) unless the user explicitly asks for feedback or explanation.';
    
    switch (mode) {
      case 'photography':
        return `${basePrompt} Focus on professional photography prompts for Stable Diffusion and Flux Dev. Include technical camera settings (aperture, ISO, shutter speed), lighting setup, composition techniques, lens specifications, and color grading style. Use realistic photography language with technical precision. Perfect for portraits, products, landscapes, macro, and commercial photography.`;
      case 'cinematic':
        return `${basePrompt} Focus on cinematic video prompts for the LTX Video model. Create detailed prompts with specific shot descriptions, camera movements, lighting with technical accuracy, integrated audio elements, and character performances.`;
      case 'drone':
        return `${basePrompt} Focus on aerial and landscape video prompts for the LTX Video model. Emphasize panoramic composition, drone movements, landscape features, environmental storytelling, and atmospheric conditions.`;
      case 'animation':
        return `${basePrompt} Focus on animation prompts for the LTX Video model. Include stylization details, character animation qualities, exaggerated or stylized movements, and animation-specific visual language.`;
      case 'classic':
        return `${basePrompt} Focus on general, versatile prompts for the LTX Video model. Create balanced descriptions suitable for any scene type with cohesive visual direction.`;
      case 'nsfw':
        return `${basePrompt} Focus on adult-oriented content prompts. Use professional, descriptive language while maintaining the adult nature of the content.`;
      default:
        return basePrompt;
    }
  };

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

  // Build an action executor bound to current handlers/state
  const actionExecutor = useMemo(() => {
    return new ActionExecutor(
      {
        onOpenSettings: () => setSettingsOpen(true),
        onSetMode: (m) => {
          actionApplyModeRef.current = m as ModeId;
          setMode(m as any);
        },
        onSetStep: (n) => setStep(n),
        onEditorToneChange: (t) => setEditorTone(t as any),
        onSetNsfwEnabled: (enabled) => setNsfwEnabled(enabled),
        onPreviewToggle: () => setPreviewOpen((v) => !v),
        onUpdateUiPref: (updater) => setUiPrefs((prev) => updater(prev)),
        onUpdateOllama: (updater) => setOllamaSettings((prev) => updater(prev)),
        onSetFieldValue: (field, value) =>
          setValues((prev) => {
            const targetMode = actionApplyModeRef.current || mode;
            return { ...prev, [targetMode]: { ...prev[targetMode], [field]: value } };
          }),
        onClearField: (field) =>
          setValues((prev) => {
            const targetMode = actionApplyModeRef.current || mode;
            const next = { ...prev, [targetMode]: { ...prev[targetMode] } };
            delete (next[targetMode] as any)[field];
            return next;
          }),
        onBulkSetValues: (entries) =>
          setValues((prev) => {
            const targetMode = actionApplyModeRef.current || mode;
            return { ...prev, [targetMode]: { ...prev[targetMode], ...entries } };
          }),
        onSetChatModel: (model) => setChatModel(model),
        onOpenChatSystemPrompt: () => setChatSystemPromptModalOpen(true),
        onSetChatMinimized: (min) => setChatMinimized(min),
        onShowToast: (msg) => showToast(msg),
      },
      { source: 'chat' }
    );
  }, [mode, showToast]);

  const normalizeFieldName = useCallback((field: string) => {
    if (!field) return field;
    if (ACTION_VALID_FIELDS.includes(field)) return field;
    const alias = ACTION_FIELD_ALIASES[field];
    if (alias) return alias;
    const normalized = ACTION_NORMALIZED_FIELD_MAP[normalizeFieldKey(field)];
    return normalized ?? field;
  }, []);

  const normalizeActions = useCallback((actions: Action[]) => {
    return actions.map((action) => {
      if (action.type === 'setFieldValue') {
        return { ...action, field: normalizeFieldName(action.field) };
      }
      if (action.type === 'clearField') {
        return { ...action, field: normalizeFieldName(action.field) };
      }
      if (action.type === 'bulkSetValues') {
        const mapped: Record<string, string> = {};
        for (const [key, value] of Object.entries(action.entries)) {
          mapped[normalizeFieldName(key)] = value;
        }
        return { ...action, entries: mapped };
      }
      return action;
    });
  }, [normalizeFieldName]);

  const applyActionsJson = useCallback(
    async (json: string, parsedActions?: Action[]) => {
      if (!json) return;
      actionApplyModeRef.current = mode;
      const actions = parsedActions ?? parseActions(json).actions;
      const normalized = normalizeActions(actions);
      await actionExecutor.execute(normalized, { skipErrors: true });
      if (!actions.some((a) => a.type === 'setStep')) {
        setStep(2);
      }
    },
    [actionExecutor, mode, normalizeActions]
  );

  const extractJsonPayload = useCallback((raw: string): string | null => {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenceMatch ? fenceMatch[1].trim() : raw.trim();
    const tryParse = (s: string) => {
      try { JSON.parse(s); return s; } catch { return null; }
    };
    const direct = tryParse(candidate);
    if (direct) return direct;
    const arrStart = candidate.indexOf('[');
    const arrEnd = candidate.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      const sliced = candidate.slice(arrStart, arrEnd + 1);
      const ok = tryParse(sliced);
      if (ok) return ok;
    }
    const objStart = candidate.indexOf('{');
    const objEnd = candidate.lastIndexOf('}');
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      const sliced = candidate.slice(objStart, objEnd + 1);
      const ok = tryParse(sliced);
      if (ok) return ok;
    }
    return null;
  }, []);

  const handleApplyActionsPreview = useCallback(async () => {
    await applyActionsJson(actionPreviewJson, actionPreviewActions);
    showToast('✅ Applied via actions');
    setActionPreviewOpen(false);
  }, [applyActionsJson, actionPreviewActions, actionPreviewJson, showToast]);

  const handleCopyActionsJson = useCallback(() => {
    if (!actionPreviewJson) return;
    navigator.clipboard.writeText(actionPreviewJson);
    showToast('Copied actions JSON');
  }, [actionPreviewJson, showToast]);

  const applyPastedActionsJson = useCallback(
    async (json: string) => {
      const cleaned = (json || '').trim();
      if (!cleaned) return;
      const payload = extractJsonPayload(cleaned) || cleaned;
      const { actions, errors } = parseActions(payload);
      if (errors.length > 0) {
        showToast(`⚠️ ${errors[0]}`);
      }
      await applyActionsJson(payload, actions);
      showToast('✅ Applied pasted actions');
    },
    [applyActionsJson, extractJsonPayload, showToast]
  );

  // Ask the LLM to convert a prompt into UI actions, then execute
  const applyPromptViaActions = useCallback(
    async (promptText: string) => {
      if (!ollamaSettings.enabled) {
        showToast('🔧 Enable Ollama in Settings first');
        return;
      }

      const modelToUse = chatModel || ollamaSettings.model;
      try {
        const systemSpec = `You are an assistant that outputs ONLY JSON for UI actions.\n\nTask: Given a creative prompt, produce a JSON ARRAY of actions to populate a wizard UI.\nSchema (strict):\n- setFieldValue { type: 'setFieldValue', field: string, value: string }\n- clearField { type: 'clearField', field: string }\n- bulkSetValues { type: 'bulkSetValues', entries: Record<string,string> }\n- setMode { type: 'setMode', value: 'cinematic'|'classic'|'drone'|'animation'|'photography'|'nsfw' }\n- setStep { type: 'setStep', value: number }\n- setEditorTone { type: 'setEditorTone', value: 'melancholic'|'balanced'|'energetic'|'dramatic' }\n- setNSFW { type: 'setNSFW', value: boolean }\n- togglePreview { type: 'togglePreview' }\n- openSettings { type: 'openSettings' }\n- updateUiPref { type: 'updateUiPref', key: string, value: any }\n- updateOllamaSetting { type: 'updateOllamaSetting', key: string, value: any }\n- setChatModel { type: 'setChatModel', value: string }\n- openChatSystemPrompt { type: 'openChatSystemPrompt' }\n- setChatMinimized { type: 'setChatMinimized', value: boolean }\n\nValid field names (must use exactly): ${ACTION_VALID_FIELDS.join(', ')}\n\nRules:\n- Output MUST be a valid JSON array. No markdown, no prose. No code fences.\n- Prefer bulkSetValues for multiple field updates.\n- Use only valid field names; do not invent new keys.\n- Do not include any wrapper besides the array.`;

        const response = await fetch(`${ollamaSettings.apiEndpoint}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: 'system', content: systemSpec },
              { role: 'user', content: `Create UI actions for this prompt to populate the wizard.\n\nPROMPT:\n${promptText}` },
            ],
            stream: false,
            options: { temperature: 0.2 },
            keep_alive: 0,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          const details = errorBody ? ` - ${errorBody}` : '';
          throw new Error(`HTTP ${response.status}${details}`);
        }
        const data = await response.json().catch(() => null);
        let content: string = data?.message?.content ?? '';
        if (!content) throw new Error('Empty response');
        setActionPreviewRaw(content);

        const jsonPayload = extractJsonPayload(content);
        if (!jsonPayload) throw new Error('Could not parse JSON actions');

        // Parse for preview list
        const { actions, errors } = parseActions(jsonPayload);
        const normalized = normalizeActions(actions);
        setActionPreviewJson(JSON.stringify(normalized, null, 2));
        setActionPreviewActions(normalized);
        setActionPreviewDescriptions(normalized.map(getActionDescription));
        setActionPreviewErrors(errors);
        setActionPreviewOpen(true);
        showToast(errors.length ? '⚠️ Review actions (some issues)' : 'Ready to apply actions');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`❌ Apply failed: ${msg}`);
      }
    },
    [extractJsonPayload, normalizeActions, ollamaSettings.enabled, ollamaSettings.apiEndpoint, ollamaSettings.model, chatModel, showToast]
  );

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
      case 1: return 'Creative brief';
      case 2: return 'Subject & framing';
      case 3: return mode === 'drone' ? 'Focus & surface detail' : 'Character & styling';
      case 4: return mode === 'drone' ? 'Motion & mood' : 'Pose & emotion';
      case 5: return 'Action beats';
      case 6: return 'Lighting & environment';
      case 7: return 'Camera & lens';
      case 8: return 'Grade & weather';
      case 9: return 'Light behavior & signatures';
      case 10: return mode === 'drone' ? 'Ambient soundscape' : 'Ambient & SFX';
      case 11: return 'Music & mix';
      case 12: return mode === 'drone' ? 'Optional narration' : 'Dialogue & speaker';
      case 13: return 'Technical & notes';
      case 14: return mode === 'nsfw' ? 'Position & activity' : 'NSFW position';
      case 15: return mode === 'nsfw' ? 'Body focus & sensation' : 'NSFW expression';
      case 16: return 'References & inspiration';
      case 17: return 'Time, season & era';
      case 18: return 'VFX & practicals';
      case 19: return 'Character development';
      case 20: return 'Pacing & rhythm';
      case 21: return 'Final polish';
      case 22: return 'Review & build';
      default: return `Step ${n}`;
    }
  }, [mode]);

  const summary = useMemo(() => ({ ...current, mode }), [current, mode]);

  // Calculate completed steps based on filled fields
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    const currentValues = values[mode] || {};
    
    for (let stepNum = 1; stepNum <= STEPS.length; stepNum++) {
      const fields = STEP_FIELDS[stepNum] || [];
      if (fields.length === 0) {
        // Step 22 (Review) is always considered complete if we have any values
        if (Object.keys(currentValues).length > 0) {
          completed.add(stepNum);
        }
        continue;
      }
      
      // Check if at least one field in this step has a value
      const hasValue = fields.some(field => {
        const value = currentValues[field];
        return value && value.trim().length > 0;
      });
      
      if (hasValue) {
        completed.add(stepNum);
      }
    }
    
    return completed;
  }, [values, mode]);

  // Track unsaved changes - compare current values with saved project
  useEffect(() => {
    if (!currentProjectId) {
      // No project loaded, consider unsaved if we have any values
      const hasAnyValues = Object.keys(values[mode] || {}).some(field => {
        const val = values[mode]?.[field];
        return val && val.trim().length > 0;
      });
      setHasUnsavedChanges(hasAnyValues);
      return;
    }

    // Compare with saved project
    const savedProject = projects.find(p => p.id === currentProjectId);
    if (!savedProject) {
      setHasUnsavedChanges(false);
      return;
    }

    // Check if current state differs from saved
    const hasChanges = mode !== savedProject.mode ||
                       nsfwEnabled !== savedProject.nsfwEnabled ||
                       JSON.stringify(values) !== JSON.stringify(savedProject.values);
    
    setHasUnsavedChanges(hasChanges);
  }, [values, mode, nsfwEnabled, currentProjectId, projects]);

  // Update undo/redo availability flags
  useEffect(() => {
    setCanUndo(historyIndex > 0);
    setCanRedo(historyIndex < historyStack.length - 1);
  }, [historyIndex, historyStack]);

  // Add to history when values change (but not during undo/redo)
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // Skip adding to history during initial hydration
    if (!didHydrateRef.current) return;

    const snapshot = {
      values: JSON.parse(JSON.stringify(values)),
      mode,
      step,
      timestamp: Date.now(),
    };

    setHistoryStack(prev => {
      // Remove any redo history when making a new change
      const newStack = prev.slice(0, historyIndex + 1);
      newStack.push(snapshot);
      
      // Limit history to 50 entries
      if (newStack.length > 50) {
        newStack.shift();
        return newStack;
      }
      
      return newStack;
    });

    setHistoryIndex(prev => {
      // Calculate the new index based on the current history length
      return prev + 1;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, mode, step]);

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
    // If hideNsfw is on and this is an NSFW field, don't render anything
    if (uiPrefs.hideNsfw && nsfwFields.includes(field)) {
      return null;
    }
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
    (text: string, tooltip?: string, keySeed?: string) => {
      // Get enhanced tooltip data if available
      const enhancedTooltip = keySeed ? getFieldTooltip(keySeed) : null;
      const tooltipContent = enhancedTooltip
        ? (
            <div className="field-tooltip-enhanced">
              <div className="field-tooltip-description">{enhancedTooltip.description}</div>
              <div className="field-tooltip-example">
                <strong>Example:</strong> {enhancedTooltip.example}
              </div>
            </div>
          )
        : tooltip;

      return (
        <span className="field-label">
          {text}
          {keySeed && MULTI_SELECT_FIELDS.has(keySeed) ? (
            <span className="field-multi" aria-label="Multi-select field">
              Multi-select
            </span>
          ) : null}
          {(tooltip || enhancedTooltip) ? (
            <Tooltip content={tooltipContent || tooltip || ''} position="top">
              <span className="field-tip-icon" tabIndex={0} aria-label="Field help">
                ?
              </span>
            </Tooltip>
          ) : null}
        </span>
      );
    },
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
    if (introBase === 'photography') {
      setMode('photography');
      return;
    }
    // film/photo both map to cinematic/classic depending on flavor.
    if (introCinematicFlavor) setMode('cinematic');
    else setMode('classic');
  }, [introBase, introCinematicFlavor]);

  useEffect(() => {
    // If hideNsfw is enabled and user is in NSFW mode, switch to cinematic
    if (uiPrefs.hideNsfw && mode === 'nsfw') {
      setMode('cinematic');
      setNsfwEnabled(false);
      showToast('🔒 NSFW hidden — switched to Cinematic mode');
    }
  }, [uiPrefs.hideNsfw, mode, showToast]);

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
      // Don't interfere with typing in input fields or textareas
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
      
      const ctrl = e.ctrlKey || e.metaKey;
      if (e.key === 'ArrowRight' && !isInput) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && !isInput) {
        e.preventDefault();
        handleBack();
      } else if (ctrl && e.key.toLowerCase() === 'r' && !isInput) {
        e.preventDefault();
        if (e.shiftKey) randomizeAll(); else randomizeStep();
      } else if (ctrl && e.key === '?' && !isInput) {
        e.preventDefault();
        setShortcutsModalOpen(true);
      } else if (ctrl && e.key.toLowerCase() === 'z' && !isInput) {
        e.preventDefault();
        performUndo();
      } else if (ctrl && e.key.toLowerCase() === 'y' && !isInput) {
        e.preventDefault();
        performRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode]);

  const performUndo = () => {
    if (historyIndex <= 0) {
      showToast('Nothing to undo');
      return;
    }

    const prevIndex = historyIndex - 1;
    const snapshot = historyStack[prevIndex];
    
    if (!snapshot) return;

    isUndoRedoRef.current = true;
    setValues(snapshot.values);
    setMode(snapshot.mode);
    setStep(snapshot.step);
    setHistoryIndex(prevIndex);
    showToast('Undo');
  };

  const performRedo = () => {
    if (historyIndex >= historyStack.length - 1) {
      showToast('Nothing to redo');
      return;
    }

    const nextIndex = historyIndex + 1;
    const snapshot = historyStack[nextIndex];
    
    if (!snapshot) return;

    isUndoRedoRef.current = true;
    setValues(snapshot.values);
    setMode(snapshot.mode);
    setStep(snapshot.step);
    setHistoryIndex(nextIndex);
    showToast('Redo');
  };

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
        let options = optionsForField(f);
        // For NSFW mode, only use NSFW-specific options for NSFW-only fields
        if (mode === 'nsfw' && nsfwEnabled) {
          const nsfwOnlyFields = ['position', 'activity', 'accessory', 'fetish', 'bodyFocus', 'sensation'];
          if (nsfwOnlyFields.includes(f)) {
            // Filter to only use NSFW mode's options for these fields
            options = (optionSets[mode]?.[f] || []);
          }
        }
        const picked = randomPick(options);
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

  // Tool: Add prompt to history (unlimited)
  const addToPromptHistory = (prompt: string) => {
    setPromptHistory((prev) => [
      { text: prompt, timestamp: new Date().toISOString(), mode },
      ...prev,
    ]);
    try {
      const history = [
        { text: prompt, timestamp: new Date().toISOString(), mode },
        ...promptHistory,
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
      showToast('🔧 Enable Ollama in Settings first');
      return;
    }
    if (!prompt) {
      showToast('⚠️ Fill in some fields to expand');
      return;
    }

    // Optionally refresh model list in background; don't block or false-negative if stale
    fetchOllamaModels();

    setOllamaOriginalPrompt(prompt);
    setOllamaExpanding(true);
    setOllamaError(null);
    setOllamaResult('');
    setOllamaSidePanelOpen(true);
    showToast('✨ Expanding with AI...');

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

      showToast('✅ Prompt expanded successfully');
      
      // Unload model after completion
      setTimeout(() => {
        unloadOllamaModel(ollamaSettings.model);
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to Ollama';
      setOllamaError(errorMsg);
      showToast(`❌ Error: ${errorMsg}`);
    } finally {
      setOllamaExpanding(false);
    }
  };

  const applyOllamaResult = () => {
    if (!ollamaResult) return;
    navigator.clipboard.writeText(ollamaResult);
    showToast('📋 Expanded prompt copied');
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    if (!ollamaSettings.enabled) {
      showToast('🔧 Enable Ollama in Settings first');
      return;
    }

    const userMessage = chatInput.trim();
    const modelToUse = chatModel || ollamaSettings.model;
    if (!modelToUse) {
      showToast('⚠️ Select an Ollama model first');
      return;
    }
    
    // Update chat messages before sending
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(updatedMessages);
    setChatInput('');
    // Reset textarea height
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
    }
    setChatSending(true);

    try {
      // Determine context based on current mode
      let modeContext = LTX_CONTEXT;
      if (mode === 'photography') {
        modeContext = PHOTOGRAPHY_CONTEXT;
      }

      const response = await fetch(`${ollamaSettings.apiEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            {
              role: 'system',
              content: `${chatSystemPrompt ? chatSystemPrompt + '\n\n' : ''}${NICOLE_BASE_SYSTEM_PROMPT}\n\n${modeContext}\n\nAdditional instructions:\n${getModeSystemPrompt(mode)}\n\nCURRENT USER'S PREVIEW PROMPT:\n${prompt}`,
            },
            ...updatedMessages,
          ],
          stream: true,
          options: {
            temperature: ollamaSettings.temperature,
          },
          keep_alive: 0,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        const details = errorBody ? ` - ${errorBody}` : '';
        throw new Error(`HTTP error! status: ${response.status}${details}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

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
                setChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: accumulatedText };
                  return updated;
                });
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      setTimeout(() => {
        unloadOllamaModel(modelToUse);
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to Ollama';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]);
      showToast(`Chat error: ${errorMsg}`);
    } finally {
      setChatSending(false);
    }
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
      <TopBar
        step={step}
        onStepChange={setStep}
        mode={mode}
        onModeChange={(next) => {
          setMode(next);
          setSettingsMode(next);
        }}
        uiPrefs={uiPrefs}
        previewOpen={previewOpen}
        onPreviewToggle={() => setPreviewOpen((v) => !v)}
        nsfwEnabled={nsfwEnabled}
        onNsfwToggle={() => setNsfwEnabled(!nsfwEnabled)}
        isStepLocked={isStepLocked}
        onToggleStepLock={toggleStepLock}
        onRandomizeStep={randomizeStep}
        onRandomizeAll={randomizeAll}
        onResetStep={resetCurrentStep}
        onResetWizard={resetWizard}
        onOpenProjects={() => setProjectsOpen(true)}
        onOpenSettings={() => {
          setSettingsMode(mode);
          setSettingsField('genre');
          setSettingsOpen(true);
        }}
        onOpenPresetCreator={() => setPresetCreatorOpen(true)}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenBatch={() => setBatchOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onExpandWithOllama={expandWithOllama}
        ollamaExpanding={ollamaExpanding}
        ollamaSettings={ollamaSettings}
        steps={STEPS}
        modes={MODES}
        stepTitle={stepTitle}
        onShowToast={showToast}
        completedSteps={completedSteps}
        hasUnsavedChanges={hasUnsavedChanges}
        onUndo={performUndo}
        onRedo={performRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="topbar-spacer" aria-hidden="true" />



      {/* Projects Modal Component */}
      <ProjectsModal
        projectsOpen={projectsOpen}
        setProjectsOpen={setProjectsOpen}
        projects={projects}
        currentProjectId={currentProjectId}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        labelForMode={labelForMode}
        createProject={createProject}
        saveCurrentProject={saveCurrentProject}
        importProject={importProject}
        loadProject={loadProject}
        exportProject={exportProject}
        deleteProject={deleteProject}
      />

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

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settingsMode={settingsMode}
        onSettingsModeChange={(mode) => {
          setSettingsMode(mode);
          setSettingsField('genre');
        }}
        settingsField={settingsField}
        onSettingsFieldChange={setSettingsField}
        uiPrefs={uiPrefs}
        onUiPrefsChange={setUiPrefs}
        ollamaSettings={ollamaSettings}
        onOllamaSettingsChange={setOllamaSettings}
        optionSets={optionSets}
        onOptionSetsChange={setOptionSets}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        settingsFilter={settingsFilter}
        onSettingsFilterChange={setSettingsFilter}
        newOption={newOption}
        onNewOptionChange={setNewOption}
        bulkOptions={bulkOptions}
        onBulkOptionsChange={setBulkOptions}
        recentlyAdded={recentlyAdded}
        onRemoveOption={removeOption}
        onResetModeToDefaults={resetModeToDefaults}
        onResetUiPrefs={resetUiPrefs}
        onAddOneOption={addOneOption}
        onAddBulkOptions={addBulkOptions}
        onFetchOllamaModels={fetchOllamaModels}
        ollamaAvailableModels={ollamaAvailableModels}
        ollamaLoadingModels={ollamaLoadingModels}
        suggestedFields={suggestedFields}
        onExportAllAppData={exportAllAppData}
        onImportAllAppData={importAllAppData}
        editorTone={editorTone}
        onEditorToneChange={setEditorTone}
        visualEmphasis={visualEmphasis}
        onVisualEmphasisChange={setVisualEmphasis}
        audioEmphasis={audioEmphasis}
        onAudioEmphasisChange={setAudioEmphasis}
        modes={MODES}
        isFavorite={isFavorite}
        detailLabelFor={detailLabelFor}
        audioLabelFor={audioLabelFor}
        labelForMode={labelForMode}
        DEFAULT_OPTION_SETS={DEFAULT_OPTION_SETS}
        DEFAULT_OLLAMA_SETTINGS={DEFAULT_OLLAMA_SETTINGS}
      />

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
                <h3 className="settings-title">All your prompts</h3>
                <p className="hint">Search, refine, and interact with your complete prompt library.</p>
              </div>
              <button className="ghost" type="button" onClick={() => setHistoryOpen(false)}>Close</button>
            </div>
            <div className="settings-body history-body">
              {promptHistory.length === 0 ? (
                <p className="hint">No prompts yet. Generate some to see them here!</p>
              ) : (
                <>
                  <div className="history-controls history-controls-full">
                    <input
                      type="text"
                      placeholder="Search history…"
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="history-search"
                      aria-label="Filter history"
                    />
                    <div className="history-stats">
                      {promptHistory.length} total
                    </div>
                    {historyFilter && (
                      <button
                        className="ghost small"
                        type="button"
                        onClick={() => setHistoryFilter('')}
                        title="Clear filter"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                    {promptHistory
                      .filter((item) => 
                        historyFilter === '' ||
                        item.text.toLowerCase().includes(historyFilter.toLowerCase()) ||
                        item.mode.toLowerCase().includes(historyFilter.toLowerCase())
                      )
                      .map((item, idx) => {
                        const date = new Date(item.timestamp);
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateStr = date.toLocaleDateString();
                        return (
                          <div key={idx} className="history-item-card">
                            <div className="history-header">
                              <div className="history-meta">
                                <span className="mode-badge">{item.mode}</span>
                                <span className="history-date" title={dateStr}>{dateStr}</span>
                              </div>
                              <span className="history-time">{timeStr}</span>
                            </div>
                            <p className="history-preview">{item.text}</p>
                            <div className="history-item-actions">
                              <button
                                className="ghost small"
                                type="button"
                                title="Copy to clipboard"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.text);
                                  showToast('Copied to clipboard');
                                }}
                              >
                                Copy
                              </button>
                              <button
                                className="ghost small"
                                type="button"
                                title="Send to chat for refinement"
                                onClick={() => {
                                  setChatInput(`Refine this prompt: ${item.text}`);
                                  setChatMessages([...chatMessages, { role: 'user', content: `Refine this prompt: ${item.text}` }]);
                                  setChatOpen(true);
                                  setTimeout(() => sendChatMessage(), 0);
                                }}
                              >
                                Chat
                              </button>
                              <button
                                className="ghost small"
                                type="button"
                                title="View full text in lightbox"
                                onClick={() => {
                                  setHistoryViewModalText(item.text);
                                  setHistoryViewModalOpen(true);
                                }}
                              >
                                View
                              </button>
                              <button
                                className="ghost small danger"
                                type="button"
                                title="Remove from history"
                                onClick={() => {
                                  setPromptHistory((prev) => {
                                    const updated = prev.filter((_, i) => i !== idx);
                                    try {
                                      window.localStorage.setItem('ltx_prompter_prompt_history_v1', JSON.stringify(updated));
                                    } catch {
                                      // ignore
                                    }
                                    return updated;
                                  });
                                  showToast('Removed from history');
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  
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
      <OllamaSidePanel
        isOpen={ollamaSidePanelOpen}
        onClose={() => {
          setOllamaSidePanelOpen(false);
          setOllamaResult('');
          setOllamaError(null);
        }}
        isExpanding={ollamaExpanding}
        result={ollamaResult}
        error={ollamaError}
        originalPrompt={ollamaOriginalPrompt}
        ollamaSettings={ollamaSettings}
        availableModels={ollamaAvailableModels}
        isPulling={ollamaPulling}
        pullProgress={ollamaPullProgress}
        onApplyResult={applyOllamaResult}
        onPullModelAndRetry={pullOllamaModelAndRetry}
        onShowToast={showToast}
      />

      <div className="progress">
        <div
          className={`progress-track progress-step-${step}`}
          aria-label={`Wizard progress: step ${step} of ${STEPS.length}`}
          role="progressbar"
        />
      </div>

      <div className={`main-layout ${chatOpen && chatDocked ? 'with-chat-dock' : ''}`} style={chatOpen && chatDocked ? ({ ['--chat-dock-width' as any]: `${chatDockWidth}px` } as any) : undefined}>
        {chatOpen && chatDocked && (
          <div style={{ position: 'relative' }}>
            <ChatPanel
              docked
              onToggleDock={() => setChatDocked(false)}
              onApplyPrompt={applyPromptViaActions}
              actionPreviewOpen={actionPreviewOpen}
              actionPreviewRaw={actionPreviewRaw}
              actionPreviewJson={actionPreviewJson}
              actionPreviewDescriptions={actionPreviewDescriptions}
              actionPreviewErrors={actionPreviewErrors}
              onApplyActionsPreview={handleApplyActionsPreview}
              onCopyActionsJson={handleCopyActionsJson}
              onCloseActionsPreview={() => setActionPreviewOpen(false)}
              chatOpen={true}
              setChatOpen={setChatOpen}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatModel={chatModel}
              setChatModel={setChatModel}
              chatSystemPrompt={chatSystemPrompt}
              setChatSystemPrompt={setChatSystemPrompt}
              chatSystemPromptModalOpen={chatSystemPromptModalOpen}
              setChatSystemPromptModalOpen={setChatSystemPromptModalOpen}
              chatMinimized={chatMinimized}
              setChatMinimized={setChatMinimized}
              chatSending={chatSending}
              ollamaSettings={ollamaSettings}
              ollamaAvailableModels={ollamaAvailableModels}
              prompt={prompt}
              mode={mode}
              editorTone={editorTone}
              labelForMode={labelForMode}
              showToast={showToast}
              sendChatMessage={sendChatMessage}
              addToPromptHistory={addToPromptHistory}
            />
            <div
              className="chat-resize-handle"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingChatDock(true);
                chatResizeStartXRef.current = e.clientX;
                chatResizeStartWidthRef.current = chatDockWidth;
              }}
            />
          </div>
        )}
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
                className={`mode-card ${introBase === 'photography' ? 'active' : ''}`}
                onClick={() => {
                  setIntroBase('photography');
                  setIntroStage(2);
                }}
              >
                <div className="mode-tag">Still image</div>
                <p className="mode-title">Photography</p>
                <p className="hint">Professional photo mode for Stable Diffusion & Flux Dev.</p>
              </button>

              {!uiPrefs.hideNsfw && (
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
              )}
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
            <h2>{mode === 'drone' ? 'Subject & vantage' : `Subject & ${captureWordTitle}`}</h2>
            <p className="hint">{mode === 'drone' ? 'Lock the aerial subject, vantage, and composition anchor.' : 'Pick subject focus, framing, and intent for the prompt foundation.'}</p>
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
            <h2>{mode === 'drone' ? 'Focus & surface detail' : 'Character & styling'}</h2>
            <p className="hint">{mode === 'drone' ? 'Keep it non-person: landmark, terrain, architecture, and surface cues.' : 'Define the subject, wardrobe, and key appearance cues.'}</p>
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
            <h2>{mode === 'drone' ? 'Motion & mood' : 'Pose & emotion'}</h2>
            <p className="hint">{mode === 'drone' ? 'Describe camera/scene motion and the emotional tone.' : 'Lock the pose and emotional read for the subject.'}</p>
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
            <h2>Light behavior & signatures</h2>
            <p className="hint">How the light behaves on surfaces plus your signature touches.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel(labelForField('lightInteraction'), 'Light behavior on surfaces (wraps, rims, scatters). Adds texture realism and helps avoid flat lighting.', 'lightInteraction')}
              <PickOrTypeField
                ariaLabel={labelForField('lightInteraction')}
                value={fieldValue('lightInteraction')}
                placeholder={examplePlaceholder(selects['lightInteraction'] || [])}
                listId={listIdFor('lightInteraction')}
                options={selects['lightInteraction'] || []}
                onChange={(v) => handleInput('lightInteraction', v)}
              />
            </label>

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

        <article className={`step ${step === 10 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 10</p>
            <h2>{mode === 'drone' ? 'Ambient soundscape' : 'Ambient & SFX'}</h2>
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

        <article className={`step ${step === 11 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 11</p>
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

        <article className={`step ${step === 12 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 12</p>
            <h2>{mode === 'drone' ? 'Optional narration' : 'Dialogue & speaker'}</h2>
            <p className="hint">{mode === 'drone' ? 'Add narration if needed; otherwise leave blank for a clean ambient bed.' : 'Optional dialogue line plus who says it and how.'}</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Dialogue line', 'Short line or narration. Leave blank to omit dialogue.', 'dialogue')}
              <textarea
                value={current.dialogue || ''}
                onChange={(e) => handleInput('dialogue', e.target.value)}
                rows={3}
                placeholder={'e.g., "We move on my mark," she whispers.'}
                aria-label="Dialogue line"
              />
            </label>

            <label className="field">
              {renderLabel('Speaker / pronoun', 'Who delivers the line; sets pronoun context.', 'pronoun')}
              <select
                value={current.pronoun || ''}
                onChange={(e) => handleInput('pronoun', e.target.value)}
                aria-label="Speaker or pronoun"
              >
                <option value="">Select speaker</option>
                {PRONOUNS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="field">
              {renderLabel('Delivery verb', 'Delivery style for the line (says, whispers, growls).', 'dialogue_verb')}
              <select
                value={current.dialogue_verb || ''}
                onChange={(e) => handleInput('dialogue_verb', e.target.value)}
                aria-label="Delivery verb"
              >
                <option value="">Select delivery</option>
                {DIALOGUE_VERBS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className={`step ${step === 13 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 13</p>
            <h2>Advanced technical</h2>
            <p className="hint">Technical specs and cinematic notes for enhanced quality.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Advanced technical', 'Frame rates, DOF, focus techniques, color science.', 'advancedTechnical')}
              {renderPickOrType('advancedTechnical')}
            </label>
            <label className="field">
              {renderLabel('Cinematic notes', 'Additional technical or creative notes.', 'cinematicNotes')}
              <input
                type="text"
                value={current.cinematicNotes || ''}
                onChange={(e) => handleInput('cinematicNotes', e.target.value)}
                placeholder="e.g., use practical lighting, avoid CGI feel"
                aria-label="Cinematic notes"
              />
            </label>
          </div>
        </article>

        {!uiPrefs.hideNsfw && (
          <>
            <article className={`step ${step === 14 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 14</p>
            <h2>{mode === 'nsfw' ? 'Position & activity' : 'NSFW position'}</h2>
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

        <article className={`step ${step === 15 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 15</p>
            <h2>{mode === 'nsfw' ? 'Body focus & sensation' : 'NSFW expression'}</h2>
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
          </>
        )}

        <article className={`step ${step === 16 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 16</p>
            <h2>References & inspiration</h2>
            <p className="hint">Film, photography, and artistic references that inform your style.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('References', 'Film references, photography styles, director aesthetics.', 'references')}
              {renderPickOrType('references')}
            </label>
            <label className="field">
              {renderLabel('Inspiration style', 'Overall creative direction and mood.', 'inspirationStyle')}
              {renderPickOrType('inspirationStyle')}
            </label>
            <label className="field">
              {renderLabel('Visual reference', 'Specific visual references or examples.', 'visualReference')}
              <input
                type="text"
                value={current.visualReference || ''}
                onChange={(e) => handleInput('visualReference', e.target.value)}
                placeholder="e.g., Blade Runner opening, Ansel Adams landscape"
                aria-label="Visual reference"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 17 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 17</p>
            <h2>Time, season & era</h2>
            <p className="hint">Temporal and cultural context for authenticity and atmosphere.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Time of day', 'Specific time for light quality and mood.', 'timeOfDay')}
              {renderPickOrType('timeOfDay')}
            </label>
            <label className="field">
              {renderLabel('Season', 'Seasonal atmosphere and environmental cues.', 'season')}
              {renderPickOrType('season')}
            </label>
            <label className="field">
              {renderLabel('Era', 'Historical period or time setting.', 'era')}
              {renderPickOrType('era')}
            </label>
            <label className="field">
              {renderLabel('Cultural context', 'Cultural or regional aesthetic.', 'culturalContext')}
              {renderPickOrType('culturalContext')}
            </label>
          </div>
        </article>

        <article className={`step ${step === 18 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 18</p>
            <h2>VFX & effects</h2>
            <p className="hint">Special effects, practical elements, and post-production notes.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Special effects', 'VFX, particle systems, and digital effects.', 'specialEffects')}
              {renderPickOrType('specialEffects')}
            </label>
            <label className="field">
              {renderLabel('Practical elements', 'On-set practical effects and rigging.', 'practicalElements')}
              {renderPickOrType('practicalElements')}
            </label>
            <label className="field">
              {renderLabel('VFX notes', 'Additional effects notes and requirements.', 'vfxNotes')}
              <input
                type="text"
                value={current.vfxNotes || ''}
                onChange={(e) => handleInput('vfxNotes', e.target.value)}
                placeholder="e.g., subtle augmentation, avoid over-processing"
                aria-label="VFX notes"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 19 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 19</p>
            <h2>Character development</h2>
            <p className="hint">Character arcs, emotional beats, and subtext.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Character development', 'Character growth, traits, and transformation.', 'characterDevelopment')}
              {renderPickOrType('characterDevelopment')}
            </label>
            <label className="field">
              {renderLabel('Emotional arc', 'Emotional journey from start to finish.', 'emotionalArc')}
              {renderPickOrType('emotionalArc')}
            </label>
            <label className="field">
              {renderLabel('Subtext', 'Underlying themes and unspoken elements.', 'subtext')}
              {renderPickOrType('subtext')}
            </label>
          </div>
        </article>

        <article className={`step ${step === 20 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 20</p>
            <h2>Pacing & timing</h2>
            <p className="hint">Rhythm, tempo, and beat timing for your scene.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Pacing', 'Overall rhythm and speed of the scene.', 'pacing')}
              {renderPickOrType('pacing')}
            </label>
            <label className="field">
              {renderLabel('Timing', 'Beat timing and transitions.', 'timing')}
              {renderPickOrType('timing')}
            </label>
            <label className="field">
              {renderLabel('Rhythm notes', 'Additional pacing notes and considerations.', 'rhythmNotes')}
              <input
                type="text"
                value={current.rhythmNotes || ''}
                onChange={(e) => handleInput('rhythmNotes', e.target.value)}
                placeholder="e.g., build tension slowly, quick climax"
                aria-label="Rhythm notes"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 21 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 21</p>
            <h2>Final touches</h2>
            <p className="hint">Polish and final creative details.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              {renderLabel('Final touches', 'Final polish elements and quality markers.', 'finalTouches')}
              {renderPickOrType('finalTouches')}
            </label>
            <label className="field">
              {renderLabel('Custom details', 'Any additional custom notes or details.', 'customDetails')}
              <input
                type="text"
                value={current.customDetails || ''}
                onChange={(e) => handleInput('customDetails', e.target.value)}
                placeholder="e.g., ensure brand consistency, maintain signature style"
                aria-label="Custom details"
              />
            </label>
          </div>
        </article>

        <article className={`step ${step === 22 ? 'active' : ''}`}>
          <div className="step-header">
            <p className="eyebrow">Step 22</p>
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
            
            {/* Step 1: Creative Brief */}
            <SummaryItem label="Scene description" value={current.sceneDescription || ''} fieldName="sceneDescription" onNavigate={setStep} />
            <SummaryItem label="Main subject" value={fieldValue('mainSubject')} fieldName="mainSubject" onNavigate={setStep} />
            <SummaryItem label="Story elements" value={fieldValue('storyElements')} fieldName="storyElements" onNavigate={setStep} />
            <SummaryItem label="Inspiration notes" value={current.inspirationNotes || ''} fieldName="inspirationNotes" onNavigate={setStep} />
            
            {/* Step 2: Genre & Shot */}
            <SummaryItem label="Genre" value={fieldValue('genre')} fieldName="genre" onNavigate={setStep} />
            <SummaryItem label={captureWordTitle} value={fieldValue('shot')} fieldName="shot" onNavigate={setStep} />
            <SummaryItem label="Framing notes" value={current.framingNotes || ''} fieldName="framingNotes" onNavigate={setStep} />
            
            {/* Step 3: Role & Wardrobe */}
            <SummaryItem label="Role" value={fieldValue('role')} fieldName="role" onNavigate={setStep} />
            <SummaryItem label="Wardrobe" value={fieldValue('wardrobe')} fieldName="wardrobe" onNavigate={setStep} />
            {mode !== 'drone' && (
              <>
                <SummaryItem label="Hair" value={fieldValue('hairColor')} fieldName="hairColor" onNavigate={setStep} />
                <SummaryItem label="Eyes" value={fieldValue('eyeColor')} fieldName="eyeColor" onNavigate={setStep} />
                <SummaryItem label="Body" value={fieldValue('bodyDescriptor')} fieldName="bodyDescriptor" onNavigate={setStep} />
              </>
            )}
            
            {/* Step 4: Pose & Mood */}
            <SummaryItem label="Pose" value={fieldValue('pose')} fieldName="pose" onNavigate={setStep} />
            <SummaryItem label="Mood" value={fieldValue('mood')} fieldName="mood" onNavigate={setStep} />
            
            {/* Step 5: Action beats */}
            <SummaryItem label="Actions" value={current.actions || ''} fieldName="actions" onNavigate={setStep} />
            
            {/* Step 6: Lighting & Environment */}
            <SummaryItem label="Lighting" value={fieldValue('lighting')} fieldName="lighting" onNavigate={setStep} />
            <SummaryItem label="Environment" value={fieldValue('environment')} fieldName="environment" onNavigate={setStep} />
            <SummaryItem label="Environment texture" value={fieldValue('environmentTexture')} fieldName="environmentTexture" onNavigate={setStep} />
            
            {/* Step 7: Camera & Lens */}
            <SummaryItem label="Camera" value={fieldValue('cameraMove')} fieldName="cameraMove" onNavigate={setStep} />
            <SummaryItem label="Lens" value={fieldValue('lens')} fieldName="lens" onNavigate={setStep} />
            
            {/* Step 8: Grade & Weather */}
            <SummaryItem label="Grade" value={fieldValue('colorGrade')} fieldName="colorGrade" onNavigate={setStep} />
            <SummaryItem label="Weather" value={fieldValue('weather')} fieldName="weather" onNavigate={setStep} />
            
            {/* Step 9: Light & signatures */}
            <SummaryItem label="Light FX" value={fieldValue('lightInteraction')} fieldName="lightInteraction" onNavigate={setStep} />
            <SummaryItem label="Signatures" value={[fieldValue('sig1'), fieldValue('sig2')].filter(Boolean).join(' · ')} fieldName="sig1" onNavigate={setStep} />
            
            {/* Step 10: Sound & SFX */}
            <SummaryItem label="Sound" value={fieldValue('sound')} fieldName="sound" onNavigate={setStep} />
            <SummaryItem label="SFX" value={fieldValue('sfx')} fieldName="sfx" onNavigate={setStep} />
            
            {/* Step 11: Music & Mix */}
            <SummaryItem label="Music" value={fieldValue('music')} fieldName="music" onNavigate={setStep} />
            <SummaryItem label="Mix notes" value={current.mix_notes || ''} fieldName="mix_notes" onNavigate={setStep} />
            
            {/* Step 12: Dialogue */}
            <SummaryItem label="Dialogue" value={current.dialogue || ''} fieldName="dialogue" onNavigate={setStep} />
            <SummaryItem label="Speaker" value={current.pronoun || ''} fieldName="pronoun" onNavigate={setStep} />
            <SummaryItem label="Delivery" value={current.dialogue_verb || ''} fieldName="dialogue_verb" onNavigate={setStep} />
            
            {/* Step 13: Advanced Technical */}
            <SummaryItem label="Advanced technical" value={fieldValue('advancedTechnical')} fieldName="advancedTechnical" onNavigate={setStep} />
            <SummaryItem label="Cinematic notes" value={current.cinematicNotes || ''} fieldName="cinematicNotes" onNavigate={setStep} />
            
            {/* Steps 14-15: NSFW */}
            {nsfwEnabled && (
              <>
                <SummaryItem label="Position" value={fieldValue('position')} fieldName="position" onNavigate={setStep} />
                <SummaryItem label="Activity" value={fieldValue('activity')} fieldName="activity" onNavigate={setStep} />
                <SummaryItem label="Accessory" value={fieldValue('accessory')} fieldName="accessory" onNavigate={setStep} />
                <SummaryItem label="Explicit abilities" value={current.explicit_abilities || ''} fieldName="explicit_abilities" onNavigate={setStep} />
                <SummaryItem label="Body description" value={current.body_description || ''} fieldName="body_description" onNavigate={setStep} />
                <SummaryItem label="Fetish" value={fieldValue('fetish')} fieldName="fetish" onNavigate={setStep} />
                <SummaryItem label="Body focus" value={fieldValue('bodyFocus')} fieldName="bodyFocus" onNavigate={setStep} />
                <SummaryItem label="Sensation" value={fieldValue('sensation')} fieldName="sensation" onNavigate={setStep} />
                <SummaryItem label="Sexual description" value={current.sexual_description || ''} fieldName="sexual_description" onNavigate={setStep} />
              </>
            )}
            
            {/* Step 16: References & Inspiration */}
            <SummaryItem label="References" value={fieldValue('references')} fieldName="references" onNavigate={setStep} />
            <SummaryItem label="Inspiration style" value={fieldValue('inspirationStyle')} fieldName="inspirationStyle" onNavigate={setStep} />
            <SummaryItem label="Visual reference" value={current.visualReference || ''} fieldName="visualReference" onNavigate={setStep} />
            
            {/* Step 17: Time, Season & Era */}
            <SummaryItem label="Time of day" value={fieldValue('timeOfDay')} fieldName="timeOfDay" onNavigate={setStep} />
            <SummaryItem label="Season" value={fieldValue('season')} fieldName="season" onNavigate={setStep} />
            <SummaryItem label="Era" value={fieldValue('era')} fieldName="era" onNavigate={setStep} />
            <SummaryItem label="Cultural context" value={fieldValue('culturalContext')} fieldName="culturalContext" onNavigate={setStep} />
            
            {/* Step 18: VFX & Effects */}
            <SummaryItem label="Special effects" value={fieldValue('specialEffects')} fieldName="specialEffects" onNavigate={setStep} />
            <SummaryItem label="Practical elements" value={fieldValue('practicalElements')} fieldName="practicalElements" onNavigate={setStep} />
            <SummaryItem label="VFX notes" value={current.vfxNotes || ''} fieldName="vfxNotes" onNavigate={setStep} />
            
            {/* Step 19: Character Development */}
            <SummaryItem label="Character development" value={fieldValue('characterDevelopment')} fieldName="characterDevelopment" onNavigate={setStep} />
            <SummaryItem label="Emotional arc" value={fieldValue('emotionalArc')} fieldName="emotionalArc" onNavigate={setStep} />
            <SummaryItem label="Subtext" value={fieldValue('subtext')} fieldName="subtext" onNavigate={setStep} />
            
            {/* Step 20: Pacing & Timing */}
            <SummaryItem label="Pacing" value={fieldValue('pacing')} fieldName="pacing" onNavigate={setStep} />
            <SummaryItem label="Timing" value={fieldValue('timing')} fieldName="timing" onNavigate={setStep} />
            <SummaryItem label="Rhythm notes" value={current.rhythmNotes || ''} fieldName="rhythmNotes" onNavigate={setStep} />
            
            {/* Step 21: Final Touches */}
            <SummaryItem label="Final touches" value={fieldValue('finalTouches')} fieldName="finalTouches" onNavigate={setStep} />
            <SummaryItem label="Custom details" value={current.customDetails || ''} fieldName="customDetails" onNavigate={setStep} />
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
            <div className="settings-divider" />
            <div className="output-head">
              <div>
                <p className="eyebrow">Apply Actions JSON</p>
                <h3>Paste to apply</h3>
              </div>
            </div>
            <textarea
              value={actionPasteJson}
              onChange={(e) => setActionPasteJson(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text) {
                  setActionPasteJson(text);
                  setTimeout(() => applyPastedActionsJson(text), 0);
                }
              }}
              rows={6}
              placeholder="Paste JSON actions here to apply immediately"
              aria-label="Paste actions JSON"
            />
            <div className="settings-actions">
              <button
                className="ghost"
                type="button"
                onClick={() => setActionPasteJson('')}
              >
                Clear
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => applyPastedActionsJson(actionPasteJson)}
              >
                Apply JSON
              </button>
            </div>
          </div>
        </article>
      </section>

      {/* Live Preview & Tools Sidebar */}
      <PreviewSidebar
        isOpen={previewOpen}
        onToggle={() => setPreviewOpen((v) => !v)}
        prompt={prompt}
        onCopyPrompt={copyPrompt}
        onSaveToHistory={addToPromptHistory}
        onShowToast={showToast}
        mode={mode}
        labelForMode={labelForMode}
        editorTone={editorTone}
        onToneChange={setEditorTone}
        visualEmphasis={visualEmphasis}
        onVisualEmphasisChange={setVisualEmphasis}
        audioEmphasis={audioEmphasis}
        onAudioEmphasisChange={setAudioEmphasis}
        detailLabelFor={detailLabelFor}
        audioLabelFor={audioLabelFor}
        ollamaSettings={ollamaSettings}
        onSendToChat={(text) => {
          setChatInput(text);
          setChatOpen(true);
        }}
        previewAnimTick={previewAnimTick}
      />
      </div>

      {/* Toast Notification */}
      <Toast message={toast} />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      <div className="sticky-nav-spacer" aria-hidden="true" />
      <footer className="sticky-nav" role="navigation" aria-label="Wizard navigation">
        <div className="sticky-nav-inner">
          <button
            className={`icon-btn chat-nav-btn ${ollamaSettings.enabled ? 'enabled' : 'disabled'}`}
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            title={ollamaSettings.enabled ? 'Chat with Ollama' : 'Enable Ollama in Settings'}
            aria-label="Open Ollama chat"
          >
            💬
          </button>
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

      {/* Chat Panel Component (floating when not docked) */}
      {chatOpen && !chatDocked && (
        <ChatPanel
          onToggleDock={() => setChatDocked(true)}
          onApplyPrompt={applyPromptViaActions}
          actionPreviewOpen={actionPreviewOpen}
          actionPreviewRaw={actionPreviewRaw}
          actionPreviewJson={actionPreviewJson}
          actionPreviewDescriptions={actionPreviewDescriptions}
          actionPreviewErrors={actionPreviewErrors}
          onApplyActionsPreview={handleApplyActionsPreview}
          onCopyActionsJson={handleCopyActionsJson}
          onCloseActionsPreview={() => setActionPreviewOpen(false)}
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatModel={chatModel}
          setChatModel={setChatModel}
          chatSystemPrompt={chatSystemPrompt}
          setChatSystemPrompt={setChatSystemPrompt}
          chatSystemPromptModalOpen={chatSystemPromptModalOpen}
          setChatSystemPromptModalOpen={setChatSystemPromptModalOpen}
          chatMinimized={chatMinimized}
          setChatMinimized={setChatMinimized}
          chatSending={chatSending}
          ollamaSettings={ollamaSettings}
          ollamaAvailableModels={ollamaAvailableModels}
          prompt={prompt}
          mode={mode}
          editorTone={editorTone}
          labelForMode={labelForMode}
          showToast={showToast}
          sendChatMessage={sendChatMessage}
          addToPromptHistory={addToPromptHistory}
        />
      )}

      {/* History View Modal Lightbox */}
      {historyViewModalOpen && (
        <div className="settings-overlay" onMouseDown={() => setHistoryViewModalOpen(false)}>
          <div className="settings-panel history-view-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="settings-head">
              <div>
                <h3 className="settings-title">Full Prompt</h3>
                <p className="hint">Complete prompt text from history</p>
              </div>
              <button 
                className="ghost small" 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(historyViewModalText);
                  showToast('Copied to clipboard');
                }}
                title="Copy to clipboard"
              >
                Copy
              </button>
              <button className="ghost" type="button" onClick={() => setHistoryViewModalOpen(false)}>Close</button>
            </div>
            <div className="settings-body history-view-body settings-body-single-col">
              <div className="history-view-content">
                {historyViewModalText}
              </div>
            </div>
          </div>
        </div>
      )}
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

function SummaryItem({ label, value, fieldName, onNavigate }: { label: string; value?: string; fieldName?: string; onNavigate?: (step: number) => void }) {
  const stepNum = fieldName ? getStepForField(fieldName) : null;
  const isClickable = stepNum && onNavigate;
  
  return (
    <div 
      className={`summary-item ${isClickable ? 'clickable summary-item-clickable' : ''}`}
      onClick={() => isClickable && onNavigate(stepNum)}
      title={isClickable ? `Go to step ${stepNum}` : undefined}
    >
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

  // New fields integration for paragraph format
  const contextBits = [] as string[];
  if (clean.scene_description) contextBits.push(`${lowercaseFirst(clean.scene_description)}`);
  if (clean.main_subject) contextBits.push(`focusing on ${lowercaseFirst(clean.main_subject)}`);
  if (clean.story_elements) contextBits.push(`with story elements of ${lowercaseFirst(clean.story_elements)}`);
  const contextText = contextBits.length ? `${contextBits.join(', ')}.` : '';

  const enhancementBits = [] as string[];
  if (clean.advanced_technical) enhancementBits.push(`technical approach: ${lowercaseFirst(clean.advanced_technical)}`);
  if (clean.cinematic_notes) enhancementBits.push(`cinematic notes: ${lowercaseFirst(clean.cinematic_notes)}`);
  if (clean.references) enhancementBits.push(`referencing ${lowercaseFirst(clean.references)}`);
  if (clean.inspiration_style) enhancementBits.push(`inspired by ${lowercaseFirst(clean.inspiration_style)}`);
  const enhancementText = enhancementBits.length ? ` Additional production details include ${enhancementBits.join('; ')}.` : '';

  const temporalBits = [] as string[];
  if (clean.time_of_day) temporalBits.push(lowercaseFirst(clean.time_of_day));
  if (clean.season) temporalBits.push(`during ${lowercaseFirst(clean.season)}`);
  if (clean.era) temporalBits.push(`set in ${lowercaseFirst(clean.era)}`);
  if (clean.cultural_context) temporalBits.push(`with ${lowercaseFirst(clean.cultural_context)} context`);
  const temporalText = temporalBits.length ? ` The temporal setting is ${temporalBits.join(', ')}.` : '';

  const effectsBits = [] as string[];
  if (clean.special_effects) effectsBits.push(`special effects: ${lowercaseFirst(clean.special_effects)}`);
  if (clean.practical_elements) effectsBits.push(`practical elements: ${lowercaseFirst(clean.practical_elements)}`);
  if (clean.vfx_notes) effectsBits.push(`VFX notes: ${lowercaseFirst(clean.vfx_notes)}`);
  const effectsText = effectsBits.length ? ` Effects work includes ${effectsBits.join('; ')}.` : '';

  const narrativeBits = [] as string[];
  if (clean.character_development) narrativeBits.push(`character development: ${lowercaseFirst(clean.character_development)}`);
  if (clean.emotional_arc) narrativeBits.push(`emotional arc: ${lowercaseFirst(clean.emotional_arc)}`);
  if (clean.subtext) narrativeBits.push(`subtext: ${lowercaseFirst(clean.subtext)}`);
  if (clean.pacing) narrativeBits.push(`pacing: ${lowercaseFirst(clean.pacing)}`);
  const narrativeText = narrativeBits.length ? ` The narrative layer emphasizes ${narrativeBits.join('; ')}.` : '';

  const finishingBits = [] as string[];
  if (clean.final_touches) finishingBits.push(lowercaseFirst(clean.final_touches));
  if (clean.custom_details) finishingBits.push(lowercaseFirst(clean.custom_details));
  const finishingText = finishingBits.length ? ` Final polish: ${finishingBits.join(', ')}.` : '';

  const core = [contextText, base, scene, temporalText, sound, dialogue, quality, mood, camera, enhancementText, effectsText, narrativeText, finishingText, nsfwText]
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

  // New fields from expanded steps
  const context = [] as string[];
  if (clean.scene_description) context.push(`Scene overview: ${lowercaseFirst(clean.scene_description)}`);
  if (clean.main_subject) context.push(`Main subject: ${lowercaseFirst(clean.main_subject)}`);
  if (clean.story_elements) context.push(`Story elements: ${lowercaseFirst(clean.story_elements)}`);
  if (clean.inspiration_notes) context.push(`Inspiration: ${lowercaseFirst(clean.inspiration_notes)}`);
  
  const technical = [] as string[];
  if (clean.advanced_technical) technical.push(`Technical approach: ${lowercaseFirst(clean.advanced_technical)}`);
  if (clean.cinematic_notes) technical.push(`Cinematic notes: ${lowercaseFirst(clean.cinematic_notes)}`);
  if (clean.references) technical.push(`References: ${lowercaseFirst(clean.references)}`);
  if (clean.inspiration_style) technical.push(`Style inspiration: ${lowercaseFirst(clean.inspiration_style)}`);
  if (clean.visual_reference) technical.push(`Visual reference: ${lowercaseFirst(clean.visual_reference)}`);
  
  const temporal = [] as string[];
  if (clean.time_of_day) temporal.push(`Time: ${lowercaseFirst(clean.time_of_day)}`);
  if (clean.season) temporal.push(`Season: ${lowercaseFirst(clean.season)}`);
  if (clean.era) temporal.push(`Era: ${lowercaseFirst(clean.era)}`);
  if (clean.cultural_context) temporal.push(`Cultural context: ${lowercaseFirst(clean.cultural_context)}`);
  
  const effects = [] as string[];
  if (clean.special_effects) effects.push(`Special effects: ${lowercaseFirst(clean.special_effects)}`);
  if (clean.practical_elements) effects.push(`Practical elements: ${lowercaseFirst(clean.practical_elements)}`);
  if (clean.vfx_notes) effects.push(`VFX notes: ${lowercaseFirst(clean.vfx_notes)}`);
  
  const narrative = [] as string[];
  if (clean.character_development) narrative.push(`Character development: ${lowercaseFirst(clean.character_development)}`);
  if (clean.emotional_arc) narrative.push(`Emotional arc: ${lowercaseFirst(clean.emotional_arc)}`);
  if (clean.subtext) narrative.push(`Subtext: ${lowercaseFirst(clean.subtext)}`);
  if (clean.pacing) narrative.push(`Pacing: ${lowercaseFirst(clean.pacing)}`);
  if (clean.timing) narrative.push(`Timing: ${lowercaseFirst(clean.timing)}`);
  if (clean.rhythm_notes) narrative.push(`Rhythm: ${lowercaseFirst(clean.rhythm_notes)}`);
  
  const finishing = [] as string[];
  if (clean.final_touches) finishing.push(`Final touches: ${lowercaseFirst(clean.final_touches)}`);
  if (clean.custom_details) finishing.push(`Custom details: ${lowercaseFirst(clean.custom_details)}`);

  return [
    formatLtx2Section('Creative Brief', context),
    formatLtx2Section('Core Actions', actions),
    formatLtx2Section('Visual Details', visuals),
    formatLtx2Section('Audio', audio),
    formatLtx2Section('Technical & Style', technical),
    formatLtx2Section('Temporal Context', temporal),
    formatLtx2Section('Effects & VFX', effects),
    formatLtx2Section('Narrative Elements', narrative),
    formatLtx2Section('Final Polish', finishing),
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
    const context = [] as string[];
    if (data.scene_description) context.push(`Scene: ${lowercaseFirst(data.scene_description)}`);
    if (data.main_subject) context.push(`Main subject: ${lowercaseFirst(data.main_subject)}`);
    if (data.story_elements) context.push(`Story elements: ${lowercaseFirst(data.story_elements)}`);
    if (data.inspiration_notes) context.push(`Inspiration: ${lowercaseFirst(data.inspiration_notes)}`);

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

    const technical = [] as string[];
    if (data.advanced_technical) technical.push(`Technical: ${lowercaseFirst(data.advanced_technical)}`);
    if (data.cinematic_notes) technical.push(`Cinematic notes: ${lowercaseFirst(data.cinematic_notes)}`);
    if (data.references) technical.push(`References: ${lowercaseFirst(data.references)}`);
    if (data.inspiration_style) technical.push(`Style inspiration: ${lowercaseFirst(data.inspiration_style)}`);
    if (data.visual_reference) technical.push(`Visual reference: ${lowercaseFirst(data.visual_reference)}`);

    const temporal = [] as string[];
    if (data.time_of_day) temporal.push(`Time: ${lowercaseFirst(data.time_of_day)}`);
    if (data.season) temporal.push(`Season: ${lowercaseFirst(data.season)}`);
    if (data.era) temporal.push(`Era: ${lowercaseFirst(data.era)}`);
    if (data.cultural_context) temporal.push(`Cultural context: ${lowercaseFirst(data.cultural_context)}`);

    const effects = [] as string[];
    if (data.special_effects) effects.push(`Special effects: ${lowercaseFirst(data.special_effects)}`);
    if (data.practical_elements) effects.push(`Practical elements: ${lowercaseFirst(data.practical_elements)}`);
    if (data.vfx_notes) effects.push(`VFX notes: ${lowercaseFirst(data.vfx_notes)}`);

    const narrative = [] as string[];
    if (data.character_development) narrative.push(`Character: ${lowercaseFirst(data.character_development)}`);
    if (data.emotional_arc) narrative.push(`Emotional arc: ${lowercaseFirst(data.emotional_arc)}`);
    if (data.subtext) narrative.push(`Subtext: ${lowercaseFirst(data.subtext)}`);
    if (data.pacing) narrative.push(`Pacing: ${lowercaseFirst(data.pacing)}`);
    if (data.timing) narrative.push(`Timing: ${lowercaseFirst(data.timing)}`);
    if (data.rhythm_notes) narrative.push(`Rhythm: ${lowercaseFirst(data.rhythm_notes)}`);

    const finishing = [] as string[];
    if (data.final_touches) finishing.push(`Final touches: ${lowercaseFirst(data.final_touches)}`);
    if (data.custom_details) finishing.push(`Custom details: ${lowercaseFirst(data.custom_details)}`);

    return [
      formatLtx2Section('Creative Brief', context),
      formatLtx2Section('Core Actions', coreActions),
      formatLtx2Section('Visual Details', visuals),
      formatLtx2Section('Audio', audio),
      formatLtx2Section('Technical & Style', technical),
      formatLtx2Section('Temporal Context', temporal),
      formatLtx2Section('Effects & VFX', effects),
      formatLtx2Section('Narrative Elements', narrative),
      formatLtx2Section('Final Polish', finishing),
    ].filter(Boolean).join('\n\n');
  }

  const envText = data.environment_texture ? `${lowercaseFirst(data.environment_texture)} ${lowercaseFirst(data.environment || 'the scene')}` : (lowercaseFirst(data.environment || 'the scene'));
  const intensityText = data.lighting_intensity ? ` with ${lowercaseFirst(data.lighting_intensity)} intensity` : '';
  
  const contextBits = [] as string[];
  if (data.scene_description) contextBits.push(lowercaseFirst(data.scene_description));
  if (data.main_subject) contextBits.push(`focusing on ${lowercaseFirst(data.main_subject)}`);
  if (data.story_elements) contextBits.push(`with ${lowercaseFirst(data.story_elements)}`);
  const contextText = contextBits.length ? `${contextBits.join(', ')}. ` : '';

  const bits = [] as string[];
  
  // Opening: shot + genre
  bits.push(`${withCaptureWord(data.shot, captureWord)}, ${lowercaseFirst(data.genre)}`);
  
  // Subject + wardrobe
  if (data.subject) {
    const subjectText = !isMinimal && data.wardrobe 
      ? `${lowercaseFirst(data.subject)}, ${lowercaseFirst(data.wardrobe)}`
      : lowercaseFirst(data.subject);
    bits.push(subjectText);
  }
  
  // Environment + lighting
  const envLightBits = [envText];
  envLightBits.push(`${lowercaseFirst(data.lighting)}${intensityText}`);
  if (!isMinimal && data.atmosphere && data.atmosphere !== 'clear air') {
    envLightBits.push(lowercaseFirst(data.atmosphere));
  }
  bits.push(envLightBits.join(', '));
  
  // Camera + framing
  if (data.camera) {
    const camText = !isMinimal && data.framing_notes
      ? `${lowercaseFirst(data.camera)}, ${lowercaseFirst(data.framing_notes)}`
      : lowercaseFirst(data.camera);
    bits.push(camText);
  }
  
  // Color + focus
  const visualBits = [];
  if (!isMinimal && data.palette) visualBits.push(lowercaseFirst(data.palette));
  if (data.focus_target) visualBits.push(`focus on ${lowercaseFirst(data.focus_target)}`);
  if (visualBits.length) bits.push(visualBits.join(', '));
  
  // Action
  if (data.action) bits.push(data.action);
  
  // Audio stack
  const audioBits = [];
  if (data.audio) audioBits.push(lowercaseFirst(naturalizeMulti(data.audio)));
  if (!isMinimal && data.sfx) audioBits.push(lowercaseFirst(naturalizeMulti(data.sfx)));
  if (data.music) audioBits.push(lowercaseFirst(data.music));
  if (data.mix_notes) audioBits.push(lowercaseFirst(data.mix_notes));
  if (audioBits.length) bits.push(audioBits.join(', '));
  
  // Dialogue
  if (data.dialogue) bits.push(`"${data.dialogue}"`);
  
  // Avoid
  if (!isMinimal && data.avoid) bits.push(`avoiding ${lowercaseFirst(data.avoid)}`);
  
  const enhancementBits = [] as string[];
  if (data.advanced_technical) enhancementBits.push(lowercaseFirst(data.advanced_technical));
  if (data.cinematic_notes) enhancementBits.push(lowercaseFirst(data.cinematic_notes));
  if (data.references) enhancementBits.push(`ref: ${lowercaseFirst(data.references)}`);
  if (data.inspiration_style) enhancementBits.push(lowercaseFirst(data.inspiration_style));

  const temporalBits = [] as string[];
  if (data.time_of_day) temporalBits.push(lowercaseFirst(data.time_of_day));
  if (data.season) temporalBits.push(lowercaseFirst(data.season));
  if (data.era) temporalBits.push(lowercaseFirst(data.era));
  if (data.cultural_context) temporalBits.push(lowercaseFirst(data.cultural_context));

  const effectsBits = [] as string[];
  if (data.special_effects) effectsBits.push(lowercaseFirst(data.special_effects));
  if (data.practical_elements) effectsBits.push(lowercaseFirst(data.practical_elements));
  if (data.vfx_notes) effectsBits.push(lowercaseFirst(data.vfx_notes));

  const narrativeBits = [] as string[];
  if (data.character_development) narrativeBits.push(lowercaseFirst(data.character_development));
  if (data.emotional_arc) narrativeBits.push(lowercaseFirst(data.emotional_arc));
  if (data.subtext) narrativeBits.push(lowercaseFirst(data.subtext));
  if (data.pacing) narrativeBits.push(lowercaseFirst(data.pacing));

  const finishingBits = [] as string[];
  if (data.final_touches) finishingBits.push(lowercaseFirst(data.final_touches));
  if (data.custom_details) finishingBits.push(lowercaseFirst(data.custom_details));

  // Assemble final sections
  const sections = [];
  if (contextText) sections.push(contextText.replace(/\.$/, ''));
  sections.push(bits.join(', '));
  if (temporalBits.length) sections.push(temporalBits.join(', '));
  if (enhancementBits.length) sections.push(enhancementBits.join(', '));
  if (effectsBits.length) sections.push(effectsBits.join(', '));
  if (narrativeBits.length) sections.push(narrativeBits.join(', '));
  if (finishingBits.length) sections.push(finishingBits.join(', '));

  return sections.join('. ') + '.';
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
      // Extended fields
      scene_description: (current.sceneDescription || '').trim(),
      main_subject: pick('mainSubject', ''),
      story_elements: pick('storyElements', ''),
      inspiration_notes: (current.inspirationNotes || '').trim(),
      advanced_technical: pick('advancedTechnical', ''),
      cinematic_notes: (current.cinematicNotes || '').trim(),
      references: pick('references', ''),
      inspiration_style: pick('inspirationStyle', ''),
      visual_reference: (current.visualReference || '').trim(),
      time_of_day: pick('timeOfDay', ''),
      season: pick('season', ''),
      era: pick('era', ''),
      cultural_context: pick('culturalContext', ''),
      special_effects: pick('specialEffects', ''),
      practical_elements: pick('practicalElements', ''),
      vfx_notes: (current.vfxNotes || '').trim(),
      character_development: pick('characterDevelopment', ''),
      emotional_arc: pick('emotionalArc', ''),
      subtext: pick('subtext', ''),
      pacing: pick('pacing', ''),
      timing: pick('timing', ''),
      rhythm_notes: (current.rhythmNotes || '').trim(),
      final_touches: pick('finalTouches', ''),
      custom_details: (current.customDetails || '').trim(),
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
    // Step 1: Creative Brief
    scene_description: (current.sceneDescription || '').trim(),
    main_subject: pick('mainSubject', ''),
    story_elements: pick('storyElements', ''),
    inspiration_notes: (current.inspirationNotes || '').trim(),
    // Step 13: Advanced Technical
    advanced_technical: pick('advancedTechnical', ''),
    cinematic_notes: (current.cinematicNotes || '').trim(),
    // Step 16: References & Inspiration
    references: pick('references', ''),
    inspiration_style: pick('inspirationStyle', ''),
    visual_reference: (current.visualReference || '').trim(),
    // Step 17: Time, Season & Era
    time_of_day: pick('timeOfDay', ''),
    season: pick('season', ''),
    era: pick('era', ''),
    cultural_context: pick('culturalContext', ''),
    // Step 18: VFX & Effects
    special_effects: pick('specialEffects', ''),
    practical_elements: pick('practicalElements', ''),
    vfx_notes: (current.vfxNotes || '').trim(),
    // Step 19: Character Development
    character_development: pick('characterDevelopment', ''),
    emotional_arc: pick('emotionalArc', ''),
    subtext: pick('subtext', ''),
    // Step 20: Pacing & Timing
    pacing: pick('pacing', ''),
    timing: pick('timing', ''),
    rhythm_notes: (current.rhythmNotes || '').trim(),
    // Step 21: Final Touches
    final_touches: pick('finalTouches', ''),
    custom_details: (current.customDetails || '').trim(),
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

function loadChatSettings(): { chatModel?: string; chatDocked?: boolean; chatDockWidth?: number; chatSystemPrompt?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CHAT_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveChatSettings(settings: { chatModel?: string; chatDocked?: boolean; chatDockWidth?: number; chatSystemPrompt?: string }) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
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
    const hideNsfw = parsed.hideNsfw ?? DEFAULT_UI_PREFS.hideNsfw;
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
      hideNsfw,
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






