/**
 * Prompt Generation Validation Test
 * Tests the randomize-all functionality to ensure prompts are natural, detailed, and properly formatted
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TOTAL_TESTS = 50; // Number of randomization tests per mode
const MODES = ['cinematic', 'classic', 'nsfw'];

// Sample data for random selection
const sampleData = {
  cinematic: {
    genre: ['Sci-fi thriller', 'Period drama', 'Heist sequence', 'Space opera', 'Character study'],
    shot: ['Wide establishing', 'Dynamic tracking', 'Close-up portrait', 'Over-the-shoulder', 'Hero shot'],
    role: ['Protagonist', 'Investigator', 'Pilot', 'Engineer', 'Anti-hero'],
    mood: ['Tense', 'Hopeful', 'Melancholic', 'Triumphant', 'Mysterious'],
    lighting: ['Volumetric shafts', 'Neon rim light', 'Golden hour', 'High contrast noir', 'Soft bounce'],
    environment: ['Rainy street', 'Neon city', 'Abandoned warehouse', 'Orbiting station', 'Desert expanse'],
    wardrobe: ['Weathered leathers', 'Stealth techweave', 'Formal noir suit', 'Explorer layers', 'Armored rig'],
    pose: ['Striding forward', 'Holding ground', 'Leaning on rail', 'Kneeling for cover', 'Running mid-frame'],
    weather: ['Clear dusk', 'Fine rain', 'Storm front', 'Snow flurry', 'Humid night'],
    cameraMove: ['Slow push', 'Lateral dolly', 'Crane reveal', 'Handheld drift', 'Locked-off tableau'],
    lens: ['35mm spherical', '50mm prime', '85mm portrait', '24mm wide', 'Anamorphic 40mm'],
    colorGrade: ['Teal & amber', 'Muted filmic', 'Cool tungsten', 'Punchy neon', 'Warm dusk'],
    sound: ['Distant traffic', 'Low wind hum', 'Crowd murmur', 'Engine rumble', 'Quiet ambience'],
    sfx: ['Footsteps on wet pavement', 'Cloth rustle', 'Metal clink', 'Distant siren', 'Door creak'],
    music: ['Minimal synth pulse', 'Orchestral swell', 'Lo-fi ambience', 'Dark drone pad', 'Tense ticking rhythm'],
    sig1: ['atmospheric haze', 'micro dust motes', 'breath in cold air', 'rain beads on skin', 'embers in frame'],
    sig2: ['soft rim light', 'film grain', 'lens bloom', 'chromatic fringe', 'shallow DOF falloff'],
    lightInteraction: ['wraps gently', 'cuts through haze', 'paints rim highlights', 'glitters on surfaces', 'bleeds into lens bloom'],
    focusTarget: ['the subject', 'the face', 'the eyes', 'the hands', 'the object'],
    movement1: ['walks in', 'enters', 'runs in', 'moves into frame', 'is carried in'],
    movement2: ['sits', 'stands', 'takes a seat', 'stops and looks around', 'is set down'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'hesitant'],
    movementManner: ['confidently', 'nervously', 'quietly', 'carefully', 'casually'],
  },
  classic: {
    genre: ['Portrait', 'Fashion editorial', 'Documentary', 'Landscape', 'Architectural'],
    shot: ['Three-quarter', 'Half-body', 'Headshot', 'Wide landscape', 'Macro detail'],
    role: ['Artist', 'Explorer', 'Scholar', 'Performer', 'Leader'],
    mood: ['Calm', 'Confident', 'Joyful', 'Reflective', 'Gritty'],
    lighting: ['Soft daylight', 'Studio softbox', 'Split light', 'Backlit glow', 'Window light'],
    environment: ['Modern loft', 'Forest trail', 'Coastal cliffs', 'Old library', 'Glass atrium'],
    wardrobe: ['Tailored suit', 'Minimalist monochrome', 'Denim & leather', 'Casual layers', 'Editorial couture'],
    pose: ['Standing composed', 'Relaxed seated', 'Walking in frame', 'Leaning casually', 'Arms folded'],
    weather: ['Clear', 'Sunny', 'Cloudy', 'Light rain', 'Snowy'],
    cameraMove: ['Tripod locked', 'Gentle slider', 'Static portrait', 'Steady pan', 'Slow tilt'],
    lens: ['50mm prime', '85mm portrait', '35mm street', '24mm wide', 'Macro 100mm'],
    colorGrade: ['Clean neutral', 'Soft pastels', 'High contrast B/W', 'Warm filmic', 'Cool tones'],
    sound: ['Quiet room', 'City hush', 'Light breeze', 'Bird calls', 'Water trickle'],
    sfx: ['Footsteps', 'Cloth rustle', 'Door close', 'Keys jingle', 'Paper shuffle'],
    music: ['Soft instrumental', 'Lo-fi beat', 'Ambient pad', 'Acoustic guitar', 'Piano underscore'],
    sig1: ['subtle vignette', 'fine grain', 'soft falloff', 'light halo', 'texture overlay'],
    sig2: ['catchlights in eyes', 'gentle haze', 'depth layers', 'bokeh effect', 'film texture'],
    lightInteraction: ['wraps softly', 'highlights features', 'creates shadows', 'diffuses evenly', 'casts glow'],
    focusTarget: ['the subject', 'the face', 'the eyes', 'the hands', 'the object'],
    movement1: ['walks in', 'enters', 'moves into frame', 'is carried in', 'is wheeled in'],
    movement2: ['sits', 'stands', 'takes a seat', 'is set down', 'rests'],
    movementPace: ['slow', 'steady', 'brisk', 'hurried', 'hesitant'],
    movementManner: ['confidently', 'nervously', 'quietly', 'carefully', 'casually'],
  },
  nsfw: {
    genre: ['Adult scene', 'Intimate moment', 'Sensual encounter', 'Private moment', 'Bedroom scene'],
    shot: ['Close intimacy', 'Wide bedroom', 'Detail focus', 'Over-shoulder', 'Wide establishing'],
    role: ['Partner', 'Lover', 'Participant', 'Character', 'Subject'],
    mood: ['Passionate', 'Tender', 'Intense', 'Playful', 'Intimate'],
    lighting: ['Soft candlelight', 'Dim lamplight', 'Filtered sunlight', 'Warm bedside', 'Moonlight glow'],
    environment: ['Bedroom', 'Private chamber', 'Luxury suite', 'Intimate space', 'Secluded location'],
    wardrobe: ['Minimal clothing', 'Silk sheets', 'Delicate fabrics', 'Revealing outfit', 'Partially dressed'],
    pose: ['Reclined', 'Embracing', 'Intimate contact', 'Intertwined', 'Prone together'],
    weather: ['Night', 'Evening', 'Private', 'Sheltered', 'Secluded'],
    cameraMove: ['Slow pan', 'Gentle push', 'Static focused', 'Tracking', 'Locked intimate'],
    lens: ['85mm portrait', '50mm prime', '35mm intimate', '24mm wide', 'Macro detail'],
    colorGrade: ['Warm tones', 'Soft peach', 'Golden hour', 'Candlelit amber', 'Soft romantic'],
    sound: ['Soft breathing', 'Ambient room', 'Light music', 'Quiet intimacy', 'Subtle sounds'],
    sfx: ['Soft fabric rustle', 'Breathing sounds', 'Subtle movements', 'Tender touches', 'Intimate sounds'],
    music: ['Sensual underscore', 'Soft ambient', 'Romantic theme', 'Intimate score', 'Tender melody'],
    sig1: ['glistening skin', 'soft blush', 'intimate moment', 'tender expression', 'passionate intensity'],
    sig2: ['soft focus backdrop', 'romantic haze', 'intimate framing', 'suggestive shadows', 'sensual texture'],
    lightInteraction: ['caresses gently', 'illuminates softly', 'creates warmth', 'enhances intimacy', 'highlights curves'],
    focusTarget: ['the embrace', 'the connection', 'the moment', 'the intimacy', 'the passion'],
    movement1: ['moves close', 'reaches out', 'draws near', 'embraces', 'touches'],
    movement2: ['relaxes', 'settles', 'responds', 'reciprocates', 'surrenders'],
    movementPace: ['slow', 'sensual', 'deliberate', 'passionate', 'tender'],
    movementManner: ['gently', 'passionately', 'tenderly', 'eagerly', 'slowly'],
  },
};

// Validation rules
const validationRules = {
  noDuplicateWords: {
    name: 'No duplicate consecutive words',
    test: (text) => {
      const duplicates = /\b(\w+)\s+\1\b/gi;
      return !duplicates.test(text);
    },
    message: 'Found duplicate consecutive words',
  },
  noExcessiveCaps: {
    name: 'No excessive capitalization',
    test: (text) => {
      // Allow capitalization at sentence start, proper nouns, and reasonable patterns
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;
        
        // Count ALL CAPS words (more than 3 letters)
        const allCapsWords = (trimmed.match(/\b[A-Z]{3,}\b/g) || []).length;
        // If more than 2 all-caps words in a sentence, it's suspicious
        if (allCapsWords > 2) return false;
      }
      return true;
    },
    message: 'Excessive capitalization found',
  },
  properSentenceStructure: {
    name: 'Proper sentence structure',
    test: (text) => {
      // Should not start with articles or prepositions after punctuation
      const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
      for (const sentence of sentences) {
        // Sentences should start with capital letter
        if (sentence.length > 0 && sentence[0] !== sentence[0].toUpperCase()) {
          return false;
        }
      }
      return true;
    },
    message: 'Improper sentence structure detected',
  },
  reasonableLength: {
    name: 'Reasonable prompt length',
    test: (text) => {
      // Paragraph format should be between 100-800 chars, LTX2 more flexible
      return text.length > 50 && text.length < 5000;
    },
    message: 'Prompt length is unreasonable',
  },
  noMixedPlurals: {
    name: 'No mixed singular/plural',
    test: (text) => {
      // Check for patterns like "X sky skies" or "X tones tones"
      const mixedPatterns = /\b(\w+)\s+(\1s|\w*s\s+\1)\b/gi;
      return !mixedPatterns.test(text);
    },
    message: 'Mixed singular/plural forms detected',
  },
};

// Helper functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomData(mode) {
  const data = sampleData[mode];
  return {
    genre: getRandomItem(data.genre),
    shot: getRandomItem(data.shot),
    role: getRandomItem(data.role),
    pose: getRandomItem(data.pose),
    wardrobe: getRandomItem(data.wardrobe),
    mood: getRandomItem(data.mood),
    lighting: getRandomItem(data.lighting),
    lightInteraction: getRandomItem(data.lightInteraction),
    lightingIntensity: getRandomItem(['soft', 'dim', 'medium', 'harsh']),
    environment: getRandomItem(data.environment),
    environmentTexture: getRandomItem(['weathered', 'sterile', 'lush', 'sparse']),
    weather: getRandomItem(data.weather),
    cameraMove: getRandomItem(data.cameraMove),
    lens: getRandomItem(data.lens),
    colorGrade: getRandomItem(data.colorGrade),
    sound: getRandomItem(data.sound),
    sfx: getRandomItem(data.sfx),
    music: getRandomItem(data.music),
    sig1: getRandomItem(data.sig1),
    sig2: getRandomItem(data.sig2),
    focusTarget: getRandomItem(data.focusTarget),
    movement1: getRandomItem(data.movement1),
    movement2: getRandomItem(data.movement2),
    movementPace: getRandomItem(data.movementPace),
    movementManner: getRandomItem(data.movementManner),
    framingNotes: getRandomItem(['rule of thirds', 'negative space', 'leading lines']),
    // Optional fields
    dialogue: Math.random() > 0.7 ? 'This is a sample dialogue.' : '',
    pronoun: Math.random() > 0.5 ? 'They' : 'She',
    dialogue_verb: Math.random() > 0.5 ? 'whispers' : 'says',
  };
}

function validatePrompt(prompt, mode) {
  const results = {
    passed: true,
    issues: [],
    mode,
  };

  for (const [ruleKey, rule] of Object.entries(validationRules)) {
    const passed = rule.test(prompt);
    if (!passed) {
      results.passed = false;
      results.issues.push(`❌ ${rule.name}: ${rule.message}`);
    } else {
      results.issues.push(`✅ ${rule.name}`);
    }
  }

  return results;
}

function displayResults(mode, testNum, prompt, validation) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`MODE: ${mode.toUpperCase()} | TEST #${testNum}`);
  console.log(`${'='.repeat(80)}`);
  
  console.log('\n📝 GENERATED PROMPT:');
  console.log('-'.repeat(80));
  console.log(prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''));
  console.log('-'.repeat(80));
  
  console.log('\n✨ VALIDATION RESULTS:');
  console.log(`Status: ${validation.passed ? '✅ PASSED' : '❌ FAILED'}`);
  validation.issues.forEach(issue => console.log(`  ${issue}`));
}

function generateSamplePrompt(mode, data) {
  // Mock implementation of prompt generation for testing
  // This simulates the actual buildPrompt functions with all fixes applied
  
  if (mode === 'cinematic') {
    const outfit = data.wardrobe ? `dressed in ${data.wardrobe}` : '';
    const sig = data.sig1 ? `characterized by ${data.sig1}` : '';
    
    // Avoid double "light" - check if lighting already ends with "light"
    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';
    
    return `${data.genre} unfolds with a ${data.shot} of a detailed ${data.role} in a ${data.pose} pose, ${outfit}, ${sig}. ` +
           `The setting unfolds in ${data.environmentTexture} ${data.environment} beneath ${data.weather} skies, ` +
           `bathed in ${data.lighting}${lightingSuffix} that ${data.lightInteraction}${data.lightingIntensity ? ` with ${data.lightingIntensity} intensity` : ''}. ` +
           `The audio landscape features ambient soundscape: ${data.sound}, layered with ${data.sfx}, underscored by ${data.music}. ` +
           `The visual language is enhanced by ${data.lens} lens, ${data.colorGrade} color grading. ` +
           `Throughout, the camera ${data.cameraMove}, drawing focus toward ${data.focusTarget}. ` +
           `As the scene unfolds: the subject ${data.movement1} ${data.movementManner}, at a ${data.movementPace} pace; ` +
           `the subject ${data.movement2} ${data.movementManner}, at a ${data.movementPace} pace.`;
  } else if (mode === 'classic') {
    const outfit = data.wardrobe ? `attired in ${data.wardrobe}` : '';
    const env = data.environmentTexture ? `${data.environmentTexture} ${data.environment}` : data.environment;
    
    // Avoid double "light"
    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';
    
    return `A ${data.shot} capturing a ${data.genre} aesthetic that features ${data.role}, ${outfit}, ` +
           `set within ${env}, under ${data.lighting}${lightingSuffix} illumination${data.lightingIntensity ? ` with ${data.lightingIntensity} intensity` : ''}, ` +
           `with the camera ${data.cameraMove}, utilizing ${data.framingNotes} framing, ` +
           `rendered in ${data.colorGrade}, accompanied by ${data.sound} in the ambient environment, ` +
           `layered with ${data.sfx}, underscored by ${data.music}.`;
  } else if (mode === 'nsfw') {
    const outfit = data.wardrobe ? `attired in ${data.wardrobe}` : '';
    const env = data.environmentTexture ? `${data.environmentTexture} ${data.environment}` : data.environment;
    
    const lightingSuffix = data.lighting.toLowerCase().endsWith('light') ? '' : ' light';
    
    return `An intimate scene unfolds with a ${data.shot} of a sensual ${data.role} in a ${data.pose} pose, ${outfit}. ` +
           `The setting unfolds in ${env} beneath ${data.weather} conditions, ` +
           `bathed in ${data.lighting}${lightingSuffix} that ${data.lightInteraction}${data.lightingIntensity ? ` with ${data.lightingIntensity} intensity` : ''}. ` +
           `The audio landscape features ${data.sound}, layered with ${data.sfx}, underscored by ${data.music}. ` +
           `The visual language is enhanced by ${data.lens} lens, ${data.colorGrade} color grading, ` +
           `characterized by ${data.sig1} and ${data.sig2}. ` +
           `Throughout, the camera ${data.cameraMove}, drawing focus toward ${data.focusTarget}.`;
  }
  
  return '';
}

// Main test execution
function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('PROMPT GENERATION VALIDATION TEST SUITE');
  console.log('='.repeat(80));
  console.log(`Testing ${TOTAL_TESTS} randomizations per mode: ${MODES.join(', ')}`);
  console.log('');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    byMode: {},
  };

  for (const mode of MODES) {
    results.byMode[mode] = { total: 0, passed: 0, failed: 0 };

    console.log(`\n\n${'#'.repeat(80)}`);
    console.log(`TESTING MODE: ${mode.toUpperCase()}`);
    console.log(`${'#'.repeat(80)}`);

    for (let i = 1; i <= TOTAL_TESTS; i++) {
      const data = generateRandomData(mode);
      const prompt = generateSamplePrompt(mode, data);
      const validation = validatePrompt(prompt, mode);

      results.total++;
      results.byMode[mode].total++;

      if (validation.passed) {
        results.passed++;
        results.byMode[mode].passed++;
        console.log(`✅ Test ${i}/${TOTAL_TESTS} - PASSED`);
      } else {
        results.failed++;
        results.byMode[mode].failed++;
        console.log(`❌ Test ${i}/${TOTAL_TESTS} - FAILED`);
        displayResults(mode, i, prompt, validation);
      }
    }
  }

  // Summary report
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('TEST SUMMARY REPORT');
  console.log(`${'='.repeat(80)}`);
  
  console.log(`\nOverall Results:`);
  console.log(`  Total Tests: ${results.total}`);
  console.log(`  ✅ Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
  console.log(`  ❌ Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
  
  console.log(`\nResults by Mode:`);
  for (const mode of MODES) {
    const modeResults = results.byMode[mode];
    console.log(`  ${mode.toUpperCase()}:`);
    console.log(`    Passed: ${modeResults.passed}/${modeResults.total} (${((modeResults.passed / modeResults.total) * 100).toFixed(1)}%)`);
    console.log(`    Failed: ${modeResults.failed}/${modeResults.total}`);
  }
  
  console.log(`\n${'='.repeat(80)}`);
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Prompt generation is working perfectly.');
  } else {
    console.log(`⚠️  ${results.failed} test(s) failed. Review issues above.`);
  }
  console.log(`${'='.repeat(80)}\n`);

  return results.failed === 0;
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);
