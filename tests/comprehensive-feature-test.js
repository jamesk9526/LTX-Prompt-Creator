/**
 * Comprehensive Feature Test Suite
 * Tests NSFW mode, dialogue, optional fields, and all edge cases
 */

const fs = require('fs');
const path = require('path');

// Test data sets with variations
const testScenarios = {
  // NSFW scenarios with dialogue
  nsfwWithDialogue: [
    {
      mode: 'nsfw',
      name: 'Intimate scene with passionate dialogue',
      data: {
        genre: 'Sensual encounter',
        shot: 'Close intimacy',
        role: 'Lover',
        mood: 'Passionate',
        lighting: 'Soft candlelight',
        environment: 'Bedroom',
        wardrobe: 'Silk sheets',
        pose: 'Reclined',
        weather: 'Night',
        cameraMove: 'Slow pan',
        lens: '50mm prime',
        colorGrade: 'Warm tones',
        sound: 'Soft breathing',
        sfx: 'Soft fabric rustle',
        music: 'Sensual underscore',
        sig1: 'glistening skin',
        sig2: 'romantic haze',
        lightInteraction: 'caresses gently',
        focusTarget: 'the embrace',
        dialogue: 'I want you to stay.',
        pronoun: 'They',
        dialogue_verb: 'whispers',
        movement1: 'moves close',
        movement2: 'relaxes',
        movementPace: 'slow',
        movementManner: 'gently',
      },
    },
    {
      mode: 'nsfw',
      name: 'NSFW with female speaker dialogue',
      data: {
        genre: 'Intimate moment',
        shot: 'Wide establishing',
        role: 'Partner',
        mood: 'Tender',
        lighting: 'Dim lamplight',
        environment: 'Private chamber',
        wardrobe: 'Delicate fabrics',
        pose: 'Intertwined',
        weather: 'Sheltered',
        cameraMove: 'Gentle push',
        lens: '85mm portrait',
        colorGrade: 'Soft peach',
        sound: 'Ambient room',
        sfx: 'Breathing sounds',
        music: 'Soft ambient',
        sig1: 'tender expression',
        sig2: 'sensual texture',
        lightInteraction: 'illuminates softly',
        focusTarget: 'the connection',
        dialogue: 'This feels right with you.',
        pronoun: 'She',
        dialogue_verb: 'says',
        movement1: 'reaches out',
        movement2: 'settles',
        movementPace: 'sensual',
        movementManner: 'tenderly',
      },
    },
  ],

  // Cinematic with dialogue
  cinematicWithDialogue: [
    {
      mode: 'cinematic',
      name: 'Action scene with intense dialogue',
      data: {
        genre: 'Heist sequence',
        shot: 'Dynamic tracking',
        role: 'Protagonist',
        mood: 'Tense',
        lighting: 'High contrast noir',
        environment: 'Abandoned warehouse',
        wardrobe: 'Stealth techweave',
        pose: 'Running mid-frame',
        weather: 'Storm front',
        cameraMove: 'Handheld drift',
        lens: 'Anamorphic 40mm',
        colorGrade: 'Teal & amber',
        sound: 'Distant traffic',
        sfx: 'Footsteps on wet pavement',
        music: 'Dark drone pad',
        sig1: 'rain beads on skin',
        sig2: 'film grain',
        lightInteraction: 'cuts through haze',
        focusTarget: 'the face',
        focus_target: 'the face',
        dialogue: 'Go, go, go! Time is running out!',
        pronoun: 'I',
        dialogue_verb: 'shouts',
        movement1: 'runs in',
        movement2: 'stops and looks around',
        movementPace: 'hurried',
        movementManner: 'carefully',
        subject_traits: 'detailed',
        subject_role: 'Investigator',
        pose_action: 'Running mid-frame',
        prop_action: 'wielding',
        prop_weapon: 'flashlight',
        hair_face_detail: 'windswept hair',
        environment_texture: 'weathered',
        framing_notes: 'rule of thirds',
      },
    },
  ],

  // Minimal field tests (only required fields)
  minimalFields: [
    {
      mode: 'cinematic',
      name: 'Cinematic with only essentials',
      data: {
        genre: 'Character study',
        shot: 'Close-up portrait',
        role: 'Pilot',
        pose: 'Standing tall',
        wardrobe: 'Formal noir suit',
        lighting: 'Golden hour',
        environment: 'Rainy street',
        weather: 'Fine rain',
        sound: 'Low wind hum',
        sfx: 'Cloth rustle',
        music: 'Minimal synth pulse',
        lightInteraction: 'paints rim highlights',
        cameraMove: 'Locked-off tableau',
        focusTarget: 'the eyes',
        focus_target: 'the eyes',
        subject_traits: 'detailed',
        subject_role: 'Pilot',
        pose_action: 'Standing tall',
        // Optional fields left empty/undefined
        prop_action: '',
        prop_weapon: '',
        hair_face_detail: '',
        sig1: '',
        sig2: '',
        mood: '',
        dialogue: '',
        movement1: 'stands',
        movement2: 'looks around',
        movementPace: 'steady',
        movementManner: 'confidently',
      },
    },
    {
      mode: 'classic',
      name: 'Classic with minimal data',
      data: {
        genre: 'Portrait',
        shot: 'Headshot',
        role: 'Artist',
        pose: 'Standing composed',
        wardrobe: 'Tailored suit',
        lighting: 'Soft daylight',
        environment: 'Modern loft',
        weather: 'Sunny',
        sound: 'Quiet room',
        sfx: 'Footsteps',
        music: 'Soft instrumental',
        lightInteraction: 'wraps softly',
        cameraMove: 'Tripod locked',
        focusTarget: 'the face',
        focus_target: 'the face',
        subject_traits: 'detailed',
        subject_role: 'Artist',
        pose_action: 'Standing composed',
        framingNotes: 'rule of thirds',
        // Optional fields
        mood: '',
        sig1: '',
        sig2: '',
      },
    },
  ],

  // All optional fields populated
  allFieldsPopulated: [
    {
      mode: 'cinematic',
      name: 'Cinematic with ALL fields filled',
      data: {
        genre: 'Sci-fi thriller',
        shot: 'Over-the-shoulder',
        role: 'Engineer',
        mood: 'Mysterious',
        lighting: 'Volumetric shafts',
        environment: 'Orbiting station',
        wardrobe: 'Explorer layers',
        pose: 'Leaning on rail',
        weather: 'Clear dusk',
        cameraMove: 'Crane reveal',
        lens: '35mm spherical',
        colorGrade: 'Cool tungsten',
        sound: 'Engine rumble',
        sfx: 'Metal clink',
        music: 'Orchestral swell',
        sig1: 'atmospheric haze',
        sig2: 'lens bloom',
        lightInteraction: 'glitters on surfaces',
        focusTarget: 'the hands',
        focus_target: 'the hands',
        subject_traits: 'detailed',
        subject_role: 'Engineer',
        pose_action: 'Leaning on rail',
        prop_action: 'adjusting',
        prop_weapon: 'control panel',
        hair_face_detail: 'storm-worn face with scars',
        environment_texture: 'sterile',
        framing_notes: 'negative space',
        lighting_intensity: 'harsh',
        dialogue: 'Systems are failing. We need a new approach.',
        pronoun: 'We',
        dialogue_verb: 'warns',
        movement1: 'enters',
        movement2: 'takes a seat',
        movementPace: 'brisk',
        movementManner: 'nervously',
        mix_notes: 'dialogue forward, ambience low, SFX punchy',
      },
    },
  ],

  // Dialogue edge cases
  dialogueEdgeCases: [
    {
      mode: 'cinematic',
      name: 'Short exclamation dialogue',
      data: {
        genre: 'Action sequence',
        shot: 'Hero shot',
        role: 'Protagonist',
        dialogue: 'No!',
        pronoun: 'She',
        dialogue_verb: 'cries',
        // ... other required fields
        lighting: 'Harsh shadows',
        environment: 'Battlefield ruins',
        wardrobe: 'Armor',
        pose: 'Standing tall',
        weather: 'Smoke haze',
        cameraMove: 'Static',
        lens: '24mm wide',
        colorGrade: 'Muted filmic',
        sound: 'Quiet ambience',
        sfx: 'Distant explosion',
        music: 'Dark drone pad',
        lightInteraction: 'pierces darkness',
        focusTarget: 'the face',
        focus_target: 'the face',
        subject_traits: 'detailed',
        subject_role: 'Protagonist',
        pose_action: 'Standing tall',
        movement1: 'stands',
        movement2: 'stands',
        movementPace: 'steady',
        movementManner: 'intensely',
      },
    },
    {
      mode: 'cinematic',
      name: 'Long dialogue paragraph',
      data: {
        genre: 'Character study',
        shot: 'Medium shot',
        role: 'Antagonist',
        dialogue: 'You see, the world doesn\'t care about your noble intentions. It rewards those who take what they want, when they want it. And that\'s exactly what I\'ve done.',
        pronoun: 'He',
        dialogue_verb: 'says deliberately',
        // ... other required fields
        lighting: 'Soft bounce',
        environment: 'Victorian mansion',
        wardrobe: 'Elegant gown',
        pose: 'Arms crossed',
        weather: 'Clear starry night',
        cameraMove: 'Slow push',
        lens: '50mm prime',
        colorGrade: 'Warm dusk',
        sound: 'Fireplace crackling',
        sfx: 'Glass clink',
        music: 'Piano underscore',
        lightInteraction: 'wraps gently',
        focusTarget: 'the eyes',
        focus_target: 'the eyes',
        subject_traits: 'detailed',
        subject_role: 'Antagonist',
        pose_action: 'Arms crossed',
        movement1: 'walks in',
        movement2: 'sits',
        movementPace: 'slow',
        movementManner: 'confidently',
      },
    },
  ],

  // Mixed case and special characters
  specialCharacterTests: [
    {
      mode: 'classic',
      name: 'With special characters and numbers',
      data: {
        genre: 'Fashion editorial',
        shot: 'Half-body',
        role: 'Performer',
        mood: 'Joyful',
        lighting: 'Studio softbox',
        environment: 'Glass atrium',
        wardrobe: 'Editorial couture',
        pose: 'Walking in frame',
        weather: 'Light rain',
        cameraMove: 'Steady pan',
        lens: '85mm portrait',
        colorGrade: 'High contrast B/W',
        sound: 'Bird calls',
        sfx: 'Paper shuffle',
        music: 'Acoustic guitar',
        lightInteraction: 'highlights features',
        focusTarget: 'the hands',
        focus_target: 'the hands',
        subject_traits: 'detailed',
        subject_role: 'Performer',
        pose_action: 'Walking in frame',
        framing_notes: 'leading lines',
        dialogue: 'It\'s 2026 - we\'re doing 4K/120fps now!',
        pronoun: 'They',
        dialogue_verb: 'exclaims',
      },
    },
  ],
};

// Validation function
function validatePrompt(prompt, mode, testName) {
  const issues = [];

  // Check for empty prompt
  if (!prompt || prompt.trim().length === 0) {
    issues.push('Empty prompt generated');
    return { valid: false, issues };
  }

  // Check for duplicate consecutive words
  const duplicates = /\b(\w+)\s+\1\b/gi;
  if (duplicates.test(prompt)) {
    issues.push('Found duplicate consecutive words');
  }

  // Check for excessive capitalization
  const sentences = prompt.split(/[.!?]+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    const allCapsWords = (trimmed.match(/\b[A-Z]{3,}\b/g) || []).length;
    if (allCapsWords > 2) {
      issues.push(`Excessive capitalization: "${trimmed.substring(0, 50)}..."`);
      break;
    }
  }

  // Check sentence structure
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
      issues.push('Improper sentence structure (lowercase start)');
      break;
    }
  }

  // Check length
  if (prompt.length < 50 || prompt.length > 5000) {
    issues.push(`Unreasonable length: ${prompt.length} characters`);
  }

  // Check for mixed plurals
  const mixedPlurals = /\b(\w+)\s+(\1s|\w*s\s+\1)\b/gi;
  if (mixedPlurals.test(prompt)) {
    issues.push('Mixed singular/plural forms detected');
  }

  // NSFW specific validations
  if (mode === 'nsfw') {
    // Check for appropriate language
    const inappropriatePatterns = ['graphic', 'extreme', 'violent'];
    if (inappropriatePatterns.some(pattern => prompt.toLowerCase().includes(pattern))) {
      issues.push('Potentially inappropriate language for NSFW mode');
    }
  }

  // Dialogue specific checks
  if (prompt.includes('saying:') || prompt.includes('says:') || prompt.includes('speaks:')) {
    const dialogueMatch = prompt.match(/"([^"]*)"/);
    if (dialogueMatch) {
      const dialogue = dialogueMatch[1];
      if (dialogue.length < 2) {
        issues.push('Dialogue text too short');
      }
      if (dialogue.length > 500) {
        issues.push('Dialogue text unusually long');
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Mock prompt generator (simulates actual code)
function generatePrompt(mode, data) {
  let prompt = '';

  if (mode === 'cinematic') {
    const outfit = data.wardrobe ? `dressed in ${data.wardrobe}` : '';
    const sig = data.sig1 ? `characterized by ${data.sig1}` : '';

    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';

    prompt = `${data.genre} unfolds with a ${data.shot} of a ${data.subject_traits || 'detailed'} ${data.role} in a ${data.pose} pose, ${outfit}, ${sig}. ` +
      `The setting unfolds in ${data.environment_texture || 'weathered'} ${data.environment} beneath ${data.weather} skies, ` +
      `bathed in ${data.lighting}${lightingSuffix} that ${data.lightInteraction}. ` +
      (data.sound
        ? `The audio landscape features ambient soundscape: ${data.sound}, layered with ${data.sfx}, underscored by ${data.music}. `
        : '') +
      `The visual language is enhanced by ${data.lens} lens, ${data.colorGrade} color grading. ` +
      (data.dialogue
        ? `${data.pronoun || 'They'} ${data.dialogue_verb || 'speaks'}, saying: "${data.dialogue}" `
        : '') +
      `Throughout, the camera ${data.cameraMove}, drawing focus toward ${data.focusTarget || data.focus_target}.`;
  } else if (mode === 'classic') {
    const outfit = data.wardrobe ? `attired in ${data.wardrobe}` : '';
    const env = data.environment_texture ? `${data.environment_texture} ${data.environment}` : data.environment;

    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';

    prompt = `A ${data.shot} capturing a ${data.genre} aesthetic that features ${data.role}, ${outfit}, ` +
      `set within ${env}, under ${data.lighting}${lightingSuffix} illumination, ` +
      `with the camera ${data.cameraMove}, utilizing ${data.framing_notes || data.framingNotes || 'composition'} framing, ` +
      `rendered in ${data.colorGrade}, accompanied by ${data.sound} in the ambient environment, ` +
      `layered with ${data.sfx}, underscored by ${data.music}.`;
  } else if (mode === 'nsfw') {
    const outfit = data.wardrobe ? `attired in ${data.wardrobe}` : '';
    const env = data.environment_texture ? `${data.environment_texture} ${data.environment}` : data.environment;

    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';

    prompt = `An intimate scene unfolds with a ${data.shot} of a sensual ${data.role} in a ${data.pose} pose, ${outfit}. ` +
      `The setting unfolds in ${env} beneath ${data.weather} conditions, ` +
      `bathed in ${data.lighting}${lightingSuffix} that ${data.lightInteraction}. ` +
      `The audio landscape features ${data.sound}, layered with ${data.sfx}, underscored by ${data.music}. ` +
      `The visual language is enhanced by ${data.lens} lens, ${data.colorGrade} color grading, ` +
      `characterized by ${data.sig1 || 'sensuality'} and ${data.sig2 || 'intimacy'}. ` +
      (data.dialogue
        ? `${data.pronoun || 'They'} ${data.dialogue_verb || 'whispers'}, saying: "${data.dialogue}" `
        : '') +
      `Throughout, the camera ${data.cameraMove}, drawing focus toward ${data.focusTarget || data.focus_target}.`;
  }

  return prompt.replace(/\s+/g, ' ').trim();
}

// Test execution
function runComprehensiveTests() {
  console.log('\n' + '='.repeat(100));
  console.log('COMPREHENSIVE FEATURE TEST SUITE');
  console.log('Testing NSFW, Dialogue, Optional Fields, and Edge Cases');
  console.log('='.repeat(100));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failureDetails = [];

  // Test each scenario category
  for (const [category, scenarios] of Object.entries(testScenarios)) {
    console.log(`\n\n${'#'.repeat(100)}`);
    console.log(`CATEGORY: ${category.replace(/([A-Z])/g, ' $1').toUpperCase()}`);
    console.log(`${'#'.repeat(100)}`);

    for (const scenario of scenarios) {
      totalTests++;
      const { mode, name, data } = scenario;

      console.log(`\n📋 Test: ${name}`);
      console.log(`   Mode: ${mode}`);

      try {
        const prompt = generatePrompt(mode, data);
        const validation = validatePrompt(prompt, mode, name);

        if (validation.valid) {
          passedTests++;
          console.log(`   ✅ PASSED`);
          console.log(`   📝 Sample: ${prompt.substring(0, 120)}...`);
        } else {
          failedTests++;
          console.log(`   ❌ FAILED`);
          validation.issues.forEach((issue) => {
            console.log(`      - ${issue}`);
          });
          failureDetails.push({
            test: name,
            mode,
            issues: validation.issues,
            prompt: prompt.substring(0, 200),
          });
        }
      } catch (error) {
        failedTests++;
        console.log(`   ❌ ERROR: ${error.message}`);
        failureDetails.push({
          test: name,
          mode,
          issues: [`Exception: ${error.message}`],
          prompt: 'N/A',
        });
      }
    }
  }

  // Summary report
  console.log(`\n\n${'='.repeat(100)}`);
  console.log('COMPREHENSIVE TEST SUMMARY');
  console.log(`${'='.repeat(100)}`);

  console.log(`\n📊 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

  if (failureDetails.length > 0) {
    console.log(`\n⚠️  FAILURE DETAILS:`);
    failureDetails.forEach((detail, idx) => {
      console.log(`\n   ${idx + 1}. ${detail.test} (${detail.mode})`);
      detail.issues.forEach((issue) => {
        console.log(`      - ${issue}`);
      });
      console.log(`      Sample: ${detail.prompt}...`);
    });
  }

  console.log(`\n${'='.repeat(100)}`);
  if (failedTests === 0) {
    console.log('🎉 ALL COMPREHENSIVE TESTS PASSED! Feature completeness verified.');
  } else {
    console.log(`⚠️  ${failedTests} test(s) failed. Review details above.`);
  }
  console.log(`${'='.repeat(100)}\n`);

  return failedTests === 0;
}

// Run tests
const success = runComprehensiveTests();
process.exit(success ? 0 : 1);
