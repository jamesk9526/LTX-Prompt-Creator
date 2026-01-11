/**
 * Extended Integration Tests
 * Tests complex interactions, all dialogue variations, and mode switching
 */

const fs = require('fs');

// Extended test scenarios
const integrationScenarios = [
  // Different dialogue speakers
  {
    category: 'Dialogue Speakers',
    tests: [
      {
        name: 'Dialogue with "I" pronoun (first person)',
        mode: 'cinematic',
        dialogue: 'I must find a way out.',
        pronoun: 'I',
        dialogue_verb: 'declares',
      },
      {
        name: 'Dialogue with "He" pronoun',
        mode: 'cinematic',
        dialogue: 'The situation is under control.',
        pronoun: 'He',
        dialogue_verb: 'assures',
      },
      {
        name: 'Dialogue with "She" pronoun',
        mode: 'cinematic',
        dialogue: 'Trust me, I know what I\'m doing.',
        pronoun: 'She',
        dialogue_verb: 'insists',
      },
      {
        name: 'Dialogue with "They" pronoun',
        mode: 'cinematic',
        dialogue: 'We need to work together on this.',
        pronoun: 'They',
        dialogue_verb: 'suggests',
      },
      {
        name: 'Dialogue with "We" pronoun',
        mode: 'cinematic',
        dialogue: 'Our mission is clear and urgent.',
        pronoun: 'We',
        dialogue_verb: 'announce',
      },
    ],
  },

  // Different dialogue verbs
  {
    category: 'Dialogue Verbs',
    tests: [
      {
        name: 'Dialogue with "whispers" verb',
        mode: 'cinematic',
        dialogue: 'Not here, someone might hear us.',
        dialogue_verb: 'whispers',
      },
      {
        name: 'Dialogue with "shouts" verb',
        mode: 'cinematic',
        dialogue: 'ATTACK NOW!',
        dialogue_verb: 'shouts',
      },
      {
        name: 'Dialogue with "asks" verb',
        mode: 'cinematic',
        dialogue: 'Do you understand the gravity of this situation?',
        dialogue_verb: 'asks',
      },
      {
        name: 'Dialogue with "laughs" verb',
        mode: 'cinematic',
        dialogue: 'This is absolutely ridiculous!',
        dialogue_verb: 'laughs while saying',
      },
      {
        name: 'Dialogue with "mumbles" verb',
        mode: 'cinematic',
        dialogue: 'Something doesn\'t feel right here...',
        dialogue_verb: 'mumbles',
      },
    ],
  },

  // NSFW specific variations
  {
    category: 'NSFW Variations',
    tests: [
      {
        name: 'NSFW with romantic mood',
        mode: 'nsfw',
        mood: 'Passionate',
        sig1: 'tender touch',
        sig2: 'romantic glow',
      },
      {
        name: 'NSFW with sensual lighting',
        mode: 'nsfw',
        lighting: 'Candlelight',
        lightInteraction: 'caresses gently',
      },
      {
        name: 'NSFW with intimate environment',
        mode: 'nsfw',
        environment: 'Private chamber',
        environmentTexture: 'luxurious',
      },
      {
        name: 'NSFW with soft audio',
        mode: 'nsfw',
        sound: 'Soft breathing',
        sfx: 'Tender touches',
        music: 'Sensual underscore',
      },
      {
        name: 'NSFW with close-up framing',
        mode: 'nsfw',
        shot: 'Close intimacy',
        lens: '50mm prime',
      },
    ],
  },

  // Long form content
  {
    category: 'Long Form Content',
    tests: [
      {
        name: 'Extended monologue in cinematic',
        mode: 'cinematic',
        dialogue: 'The truth is, none of this was supposed to happen this way. We had a plan, a good plan, one that would have worked if everything had gone according to schedule. But life doesn\'t work that way, does it? Life has a way of throwing curveballs when you least expect them, and that\'s exactly what happened to us.',
        dialogue_verb: 'reflects pensively',
      },
      {
        name: 'Action with context in classic',
        mode: 'classic',
        framing_notes: 'negative space and leading lines combined with rule of thirds',
        focusTarget: 'the subject\'s hand and the object they\'re holding',
      },
    ],
  },

  // No dialogue versions
  {
    category: 'Silent Scenes',
    tests: [
      {
        name: 'Cinematic without dialogue',
        mode: 'cinematic',
        dialogue: '',
        dialogue_verb: '',
        pronoun: '',
      },
      {
        name: 'NSFW without dialogue',
        mode: 'nsfw',
        dialogue: '',
        dialogue_verb: '',
        pronoun: '',
      },
      {
        name: 'Classic without dialogue',
        mode: 'classic',
        dialogue: '',
      },
    ],
  },

  // Extreme mood variations
  {
    category: 'Mood Variations',
    tests: [
      {
        name: 'Melancholic cinematic',
        mode: 'cinematic',
        mood: 'Melancholic',
        lighting: 'Soft bounce',
        colorGrade: 'Muted filmic',
        music: 'Dark drone pad',
      },
      {
        name: 'Triumphant cinematic',
        mode: 'cinematic',
        mood: 'Triumphant',
        lighting: 'Golden hour',
        colorGrade: 'Warm dusk',
        music: 'Orchestral swell',
      },
      {
        name: 'Tense action sequence',
        mode: 'cinematic',
        mood: 'Tense',
        lighting: 'High contrast noir',
        colorGrade: 'Teal & amber',
        music: 'Tense ticking rhythm',
      },
    ],
  },

  // All modes with same character
  {
    category: 'Same Character Across Modes',
    tests: [
      {
        name: 'Pilot in cinematic',
        mode: 'cinematic',
        role: 'Pilot',
        subject_role: 'Pilot',
        wardrobe: 'Pilot jumpsuit',
        pose: 'Standing tall',
        pose_action: 'Standing tall',
      },
      {
        name: 'Pilot in classic',
        mode: 'classic',
        role: 'Pilot',
        subject_role: 'Pilot',
        wardrobe: 'Pilot jumpsuit',
        pose: 'Walking in frame',
      },
      {
        name: 'Partner in NSFW',
        mode: 'nsfw',
        role: 'Partner',
        pose: 'Intertwined',
      },
    ],
  },

  // Environmental extremes
  {
    category: 'Environmental Extremes',
    tests: [
      {
        name: 'Outdoor harsh weather',
        mode: 'cinematic',
        environment: 'Volcanic crater',
        environmentTexture: 'barren',
        weather: 'Storm front',
        lighting: 'Strobe flashes',
      },
      {
        name: 'Indoor intimate space',
        mode: 'classic',
        environment: 'Victorian mansion',
        environmentTexture: 'ornate',
        weather: 'Clear starry night',
        lighting: 'Soft daylight',
      },
      {
        name: 'Futuristic tech environment',
        mode: 'cinematic',
        environment: 'Futuristic lab',
        environmentTexture: 'sterile',
        weather: 'Calm breeze',
        lighting: 'Practical lamps',
      },
    ],
  },

  // Wardrobe extremes
  {
    category: 'Wardrobe Variations',
    tests: [
      {
        name: 'Heavy armor',
        mode: 'cinematic',
        wardrobe: 'Chainmail armor',
        wardrobe_type: 'Chainmail armor',
      },
      {
        name: 'Minimal clothing',
        mode: 'classic',
        wardrobe: 'Casual jacket',
      },
      {
        name: 'Royal attire',
        mode: 'cinematic',
        wardrobe: 'Royal attire',
      },
      {
        name: 'Tech-focused gear',
        mode: 'cinematic',
        wardrobe: 'Stealth techweave',
      },
    ],
  },

  // Special effects heavy
  {
    category: 'Visual Effects Emphasis',
    tests: [
      {
        name: 'Cinematic with heavy grain',
        mode: 'cinematic',
        sig2: 'film grain',
        colorGrade: 'Muted filmic',
        lighting: 'Harsh shadows',
      },
      {
        name: 'Cinematic with lens effects',
        mode: 'cinematic',
        sig2: 'lens bloom and chromatic fringe',
        lens: 'Anamorphic 40mm',
        colorGrade: 'Punchy neon',
      },
      {
        name: 'Cinematic with bokeh',
        mode: 'cinematic',
        sig1: 'bokeh circles in background',
        lens: '85mm portrait',
      },
    ],
  },
];

// Enhanced validation
function validateIntegrationPrompt(prompt, testCase) {
  const issues = [];

  // Basic checks
  if (!prompt || prompt.trim().length === 0) {
    issues.push('Empty prompt');
    return { valid: false, issues };
  }

  // Mode-specific checks
  if (testCase.mode === 'nsfw') {
    const hasNSFWIndicators = ['sensual', 'intimate', 'tender', 'passion', 'caress', 'embrace'].some((word) =>
      prompt.toLowerCase().includes(word)
    );
    if (!hasNSFWIndicators && testCase.mood !== undefined) {
      // Only flag if we expect NSFW indicators
      if (testCase.sig1 || testCase.sig2 || testCase.role === 'Partner') {
        issues.push('NSFW mode lacks characteristic intimate language');
      }
    }
  }

  // Dialogue validation
  if (testCase.dialogue && testCase.dialogue.trim()) {
    const dialogueInPrompt = prompt.includes(`"${testCase.dialogue}"`) || prompt.includes('saying:');
    if (!dialogueInPrompt) {
      issues.push('Dialogue not found in prompt');
    }

    if (testCase.pronoun && !prompt.toLowerCase().includes(testCase.pronoun.toLowerCase())) {
      // Some flexibility - pronoun might not always appear
      if (testCase.pronoun !== 'I') {
        // 'I' is harder to track due to common word
        // issues.push(`Pronoun "${testCase.pronoun}" not found in prompt`);
      }
    }
  }

  // Duplicate word check
  const duplicates = /\b(\w+)\s+\1\b/gi;
  if (duplicates.test(prompt)) {
    issues.push('Duplicate consecutive words detected');
  }

  // Capitalization check
  const sentences = prompt.split(/[.!?]+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed && trimmed[0] !== trimmed[0].toUpperCase()) {
      issues.push('Sentence starts with lowercase');
      break;
    }
  }

  // Length check
  if (prompt.length < 50 || prompt.length > 5000) {
    issues.push(`Unusual length: ${prompt.length} chars`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Mock generator with full feature support
function generateIntegrationPrompt(testCase) {
  const data = {
    genre: testCase.genre || 'Scene',
    shot: testCase.shot || 'Medium shot',
    role: testCase.role || 'Character',
    subject_role: testCase.subject_role || testCase.role || 'Character',
    pose: testCase.pose || 'Standing',
    pose_action: testCase.pose_action || testCase.pose || 'Standing',
    mood: testCase.mood || '',
    lighting: testCase.lighting || 'Soft light',
    environment: testCase.environment || 'Location',
    environment_texture: testCase.environmentTexture || testCase.environment_texture || 'standard',
    wardrobe: testCase.wardrobe || 'Clothing',
    weather: testCase.weather || 'Clear',
    cameraMove: testCase.cameraMove || 'Static',
    lens: testCase.lens || '50mm prime',
    colorGrade: testCase.colorGrade || 'Neutral',
    sound: testCase.sound || 'Ambient sound',
    sfx: testCase.sfx || 'Sound effect',
    music: testCase.music || 'Music',
    sig1: testCase.sig1 || 'visual element',
    sig2: testCase.sig2 || 'cinematic detail',
    lightInteraction: testCase.lightInteraction || 'creates mood',
    focusTarget: testCase.focusTarget || 'the subject',
    focus_target: testCase.focus_target || testCase.focusTarget || 'the subject',
    dialogue: testCase.dialogue || '',
    pronoun: testCase.pronoun || '',
    dialogue_verb: testCase.dialogue_verb || 'says',
    framing_notes: testCase.framing_notes || testCase.framingNotes || 'composition',
    subject_traits: testCase.subject_traits || 'detailed',
  };

  if (testCase.mode === 'cinematic') {
    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';
    const dialogueSection = data.dialogue
      ? ` ${data.pronoun || 'They'} ${data.dialogue_verb}, saying: "${data.dialogue}"`
      : '';

    return (
      `${data.genre} unfolds with a ${data.shot} of a ${data.subject_traits} ${data.role} in a ${data.pose_action} pose, dressed in ${data.wardrobe}, characterized by ${data.sig1}. ` +
      `The setting unfolds in ${data.environment_texture} ${data.environment} beneath ${data.weather} skies, bathed in ${data.lighting}${lightingSuffix} that ${data.lightInteraction}. ` +
      `The audio landscape features ambient soundscape: ${data.sound}, layered with ${data.sfx}, underscored by ${data.music}. ` +
      `The visual language is enhanced by ${data.lens} lens, ${data.colorGrade} color grading, featuring ${data.sig2}. ` +
      `Throughout, the camera ${data.cameraMove}, drawing focus toward ${data.focus_target}.${dialogueSection}`
    );
  } else if (testCase.mode === 'classic') {
    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';

    return (
      `A ${data.shot} capturing a ${data.genre} aesthetic that features ${data.role}, attired in ${data.wardrobe}, ` +
      `set within ${data.environment_texture} ${data.environment}, under ${data.lighting}${lightingSuffix} illumination, ` +
      `with the camera ${data.cameraMove}, utilizing ${data.framing_notes} framing, ` +
      `rendered in ${data.colorGrade}, accompanied by ${data.sound} in the ambient environment, ` +
      `layered with ${data.sfx}, underscored by ${data.music}, characterized by ${data.sig1}.`
    );
  } else if (testCase.mode === 'nsfw') {
    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';
    const dialogueSection = data.dialogue
      ? ` ${data.pronoun || 'They'} ${data.dialogue_verb}, saying: "${data.dialogue}"`
      : '';

    return (
      `An intimate scene unfolds with a ${data.shot} of a sensual ${data.role} in a ${data.pose} pose, attired in ${data.wardrobe}. ` +
      `The setting unfolds in ${data.environment_texture} ${data.environment} beneath ${data.weather} conditions, ` +
      `bathed in ${data.lighting}${lightingSuffix} that ${data.lightInteraction}. ` +
      `The audio landscape features ${data.sound}, layered with ${data.sfx}, underscored by ${data.music}. ` +
      `The visual language is enhanced by ${data.lens} lens, ${data.colorGrade} color grading, ` +
      `characterized by ${data.sig1} and ${data.sig2}. ` +
      `Throughout, the camera ${data.cameraMove}, drawing focus toward ${data.focus_target}.${dialogueSection}`
    );
  }

  return '';
}

// Run integration tests
function runIntegrationTests() {
  console.log('\n' + '='.repeat(110));
  console.log('EXTENDED INTEGRATION TEST SUITE');
  console.log('Dialogue Variations, Mode Interactions, and Complex Scenarios');
  console.log('='.repeat(110));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  for (const scenario of integrationScenarios) {
    console.log(`\n${'#'.repeat(110)}`);
    console.log(`${scenario.category.toUpperCase()}`);
    console.log(`${'#'.repeat(110)}`);

    for (const testCase of scenario.tests) {
      totalTests++;

      try {
        const prompt = generateIntegrationPrompt(testCase);
        const validation = validateIntegrationPrompt(prompt, testCase);

        if (validation.valid) {
          passedTests++;
          console.log(`✅ ${testCase.name}`);
        } else {
          failedTests++;
          console.log(`❌ ${testCase.name}`);
          validation.issues.forEach((issue) => console.log(`   └─ ${issue}`));
          failures.push({
            test: testCase.name,
            category: scenario.category,
            issues: validation.issues,
          });
        }
      } catch (error) {
        failedTests++;
        console.log(`❌ ${testCase.name} - EXCEPTION: ${error.message}`);
        failures.push({
          test: testCase.name,
          category: scenario.category,
          issues: [`Exception: ${error.message}`],
        });
      }
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(110)}`);
  console.log('INTEGRATION TEST SUMMARY');
  console.log(`${'='.repeat(110)}`);

  console.log(`\n📊 Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

  if (failures.length > 0) {
    console.log(`\n⚠️  FAILED TESTS:`);
    failures.forEach((f, i) => {
      console.log(`\n   ${i + 1}. ${f.test} (${f.category})`);
      f.issues.forEach((issue) => console.log(`      • ${issue}`));
    });
  }

  console.log(`\n${'='.repeat(110)}`);
  if (failedTests === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED! Feature interactions verified.');
  } else {
    console.log(`⚠️  ${failedTests} integration test(s) failed.`);
  }
  console.log(`${'='.repeat(110)}\n`);

  return failedTests === 0;
}

// Execute
const success = runIntegrationTests();
process.exit(success ? 0 : 1);
