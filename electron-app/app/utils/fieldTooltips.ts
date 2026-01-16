// Field tooltips with examples and descriptions
export const FIELD_TOOLTIPS: Record<string, { description: string; example: string }> = {
  // Step 1: Creative Brief
  sceneDescription: {
    description: 'High-level overview of your scene concept and visual mood',
    example: 'A tense confrontation in a dimly lit warehouse at sunset'
  },
  mainSubject: {
    description: 'Primary character or object that drives the scene',
    example: 'A determined detective in a worn trench coat'
  },
  storyElements: {
    description: 'Key narrative beats or emotional moments to capture',
    example: 'Realization of betrayal, hesitant eye contact, clenched fists'
  },
  inspirationNotes: {
    description: 'Visual references or artistic influences for the scene',
    example: 'Film noir lighting like Blade Runner 2049, gritty realism'
  },

  // Step 2: Subject & Framing
  genre: {
    description: 'Overall stylistic approach and tone for the video',
    example: 'Neo-noir thriller, Romantic drama, Sci-fi action'
  },
  shot: {
    description: 'Camera framing and composition type',
    example: 'Medium close-up, Wide establishing shot, Over-the-shoulder'
  },
  framingNotes: {
    description: 'Additional composition details and visual balance',
    example: 'Subject in lower third, leading lines to background, rule of thirds'
  },

  // Step 3: Character & Styling
  role: {
    description: 'Character type or archetype in the scene',
    example: 'World-weary detective, Young entrepreneur, Rebel leader'
  },
  wardrobe: {
    description: 'Clothing style, colors, and texture details',
    example: 'Tailored navy suit, weathered leather jacket, flowing silk gown'
  },
  hairColor: {
    description: 'Hair color and style characteristics',
    example: 'Auburn wavy shoulder-length, Silver crew cut, Jet black pixie'
  },
  eyeColor: {
    description: 'Eye color and expression quality',
    example: 'Piercing blue, Warm hazel, Deep brown with intensity'
  },
  bodyDescriptor: {
    description: 'Physical build and presence',
    example: 'Athletic and lean, Stocky and imposing, Graceful and petite'
  },

  // Step 4: Pose & Emotion
  pose: {
    description: 'Body language and physical positioning',
    example: 'Leaning forward intently, Arms crossed defensively, Relaxed slouch'
  },
  mood: {
    description: 'Emotional state and facial expression',
    example: 'Contemplative and distant, Anxious anticipation, Quiet confidence'
  },

  // Step 5: Action Beats
  movementSubjectType: {
    description: 'What type of entity is moving',
    example: 'Character, Vehicle, Camera, Object'
  },
  movementSubjectLabel: {
    description: 'Specific name or description of the moving element',
    example: 'The detective, Vintage motorcycle, Main camera'
  },
  movement1: {
    description: 'Primary action or motion happening',
    example: 'Walking slowly forward, Turning head sharply, Rising from chair'
  },
  movement2: {
    description: 'Secondary or simultaneous movement',
    example: 'While glancing over shoulder, As hands gesture, During deep breath'
  },
  actions: {
    description: 'Specific activities or interactions occurring',
    example: 'Picking up photograph, Lighting cigarette, Opening door cautiously'
  },

  // Step 6: Lighting & Environment
  lighting: {
    description: 'Light quality, direction, and atmospheric effects',
    example: 'Harsh overhead fluorescent, Soft window light from left, Golden hour glow'
  },
  environment: {
    description: 'Location setting and spatial context',
    example: 'Abandoned warehouse interior, Bustling city street, Minimalist apartment'
  },
  environmentTexture: {
    description: 'Surface qualities and material details of the space',
    example: 'Weathered brick walls, Polished marble floors, Rusted metal beams'
  },
  lightingIntensity: {
    description: 'Brightness level and contrast ratio',
    example: 'Low-key dramatic, Bright and airy, Moody with deep shadows'
  },

  // Step 7: Camera & Lens
  cameraMove: {
    description: 'Camera motion and tracking behavior',
    example: 'Slow dolly push, Handheld following, Static locked-off, Crane rising'
  },
  lens: {
    description: 'Focal length and optical characteristics',
    example: '85mm portrait, 24mm wide-angle, 200mm telephoto, 50mm standard'
  },
  focusTarget: {
    description: 'What the lens is focused on',
    example: 'Subject\'s eyes, Background action, Foreground object with rack focus'
  },

  // Step 8: Grade & Weather
  colorGrade: {
    description: 'Color palette and tonal adjustments',
    example: 'Teal and orange blockbuster, Desaturated cool tones, Warm sepia vintage'
  },
  weather: {
    description: 'Atmospheric conditions and environmental effects',
    example: 'Light rain with mist, Clear golden hour, Heavy overcast, Swirling fog'
  },

  // Step 9: Light Behavior & Signatures
  lightInteraction: {
    description: 'How light interacts with surfaces and particles',
    example: 'Dust motes in shaft, Lens flare from window, Shadows dancing'
  },
  sig1: {
    description: 'Distinctive visual element or signature detail #1',
    example: 'Venetian blind shadows, Neon sign reflection, Steam rising'
  },
  sig2: {
    description: 'Distinctive visual element or signature detail #2',
    example: 'Rain streaks on glass, Smoke trails, Flickering overhead light'
  },

  // Step 10: Ambient & SFX
  sound: {
    description: 'Background audio atmosphere and environmental sounds',
    example: 'Distant traffic hum, Wind through trees, Muffled conversation'
  },
  sfx: {
    description: 'Specific sound effects tied to actions',
    example: 'Footsteps on gravel, Door creak, Glass clink, Papers rustling'
  },

  // Step 11: Music & Mix
  music: {
    description: 'Musical score characteristics and emotional tone',
    example: 'Tense strings building, Melancholic piano, Driving synth pulse'
  },
  mix_notes: {
    description: 'Audio balance and mixing priorities',
    example: 'Dialogue prominent, Ambient pushed back, Music swells in peaks'
  },

  // Step 12: Dialogue & Speaker
  dialogue: {
    description: 'Exact words spoken by characters',
    example: '"I told you not to come here." or "What do you mean by that?"'
  },
  pronoun: {
    description: 'Speaker reference pronoun',
    example: 'He, She, They'
  },
  dialogue_verb: {
    description: 'How the dialogue is delivered',
    example: 'Says quietly, Shouts angrily, Whispers urgently, Mutters under breath'
  },

  // Step 13: Technical & Notes
  advancedTechnical: {
    description: 'Advanced camera settings and technical specifications',
    example: 'Shallow DOF f/2.8, 24fps cinematic, Anamorphic 2.39:1, Film grain'
  },
  cinematicNotes: {
    description: 'Additional creative direction and fine-tuning',
    example: 'Emphasize isolation, Hitchcockian tension, Dreamlike quality'
  },

  // Step 14: NSFW Position & Activity (if applicable)
  position: {
    description: 'Physical positioning of subjects',
    example: 'Standing, Seated, Reclining'
  },
  activity: {
    description: 'Type of action or interaction',
    example: 'Descriptive activity details'
  },
  accessory: {
    description: 'Props or additional elements',
    example: 'Relevant accessories'
  },

  // Step 16: References & Inspiration
  references: {
    description: 'Specific works or artists that inspire the aesthetic',
    example: 'Roger Deakins cinematography, Edward Hopper paintings, Wong Kar-wai films'
  },
  inspirationStyle: {
    description: 'Artistic movement or visual style reference',
    example: 'Film noir, French New Wave, German Expressionism, Minimalism'
  },
  visualReference: {
    description: 'Direct visual comparison or mood board element',
    example: 'Like the opening of Drive, Reminiscent of Nighthawks painting'
  },

  // Step 17: Time, Season & Era
  timeOfDay: {
    description: 'Specific time and associated light quality',
    example: 'Blue hour dusk, Harsh midday, Pre-dawn darkness, Golden afternoon'
  },
  season: {
    description: 'Time of year and seasonal characteristics',
    example: 'Late autumn with bare trees, Peak summer heat, Early spring bloom'
  },
  era: {
    description: 'Historical period and temporal setting',
    example: '1940s noir era, Contemporary 2020s, Near-future 2040s, Victorian 1890s'
  },
  culturalContext: {
    description: 'Cultural setting and geographical specificity',
    example: 'Manhattan Financial District, Tokyo neon streets, Rural American Midwest'
  },

  // Step 18: VFX & Practicals
  specialEffects: {
    description: 'Digital or practical visual effects elements',
    example: 'Holographic displays, Particle embers, Light rays, Digital glitches'
  },
  practicalElements: {
    description: 'On-set practical effects and real elements',
    example: 'Real smoke machine, Practical sparks, Water spray, Falling leaves'
  },
  vfxNotes: {
    description: 'Specific notes for effects integration',
    example: 'Subtle enhancement only, Seamless blend with reality, Stylized treatment'
  },

  // Step 19: Character Development
  characterDevelopment: {
    description: 'Character arc and internal journey',
    example: 'Moment of realization, Shift from confidence to doubt, Acceptance of truth'
  },
  emotionalArc: {
    description: 'Emotional progression throughout the scene',
    example: 'Anger melting to sadness, Hope building to determination, Fear to courage'
  },
  subtext: {
    description: 'Underlying meaning beneath surface action',
    example: 'Unspoken attraction, Hidden agenda, Past regret surfacing'
  },

  // Step 20: Pacing & Rhythm
  pacing: {
    description: 'Speed and tempo of scene progression',
    example: 'Slow burn tension, Quick cutting action, Contemplative lingering'
  },
  timing: {
    description: 'Specific beat timing and duration notes',
    example: 'Hold on face 3 seconds, Quick glance 1 beat, Long pause before response'
  },
  rhythmNotes: {
    description: 'Overall rhythmic feel and flow',
    example: 'Staccato edits, Flowing continuous, Syncopated with music'
  },

  // Step 21: Final Polish
  finalTouches: {
    description: 'Last details and finishing enhancements',
    example: 'Subtle vignette, Light bloom on highlights, Texture overlay'
  },
  customDetails: {
    description: 'Any other specific details not covered above',
    example: 'Brand logo visible on cup, Specific tattoo on wrist, Scar on left cheek'
  }
};

export const getFieldTooltip = (fieldName: string): { description: string; example: string } | null => {
  return FIELD_TOOLTIPS[fieldName] || null;
};
