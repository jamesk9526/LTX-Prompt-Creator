/**
 * Quality Analyzer Test Suite
 * Tests the 🔍 Analyze Quality feature with various prompt scenarios
 */

const fs = require('fs');
const path = require('path');

/**
 * Mock Ollama API responses for testing JSON parsing
 */
const mockResponses = {
  // Valid JSON response (well-formatted)
  validJSON: {
    score: 85,
    strengths: ['Clear visual direction', 'Good technical details', 'Compelling mood'],
    improvements: ['Add more character details', 'Specify lighting setup'],
    missing: ['Camera movement', 'Audio design']
  },

  // JSON wrapped in text (common Ollama behavior)
  jsonInText: `The prompt has good visual elements. Here's the analysis:
{
  "score": 78,
  "strengths": ["descriptive language", "specific mood"],
  "improvements": ["more technical specs"],
  "missing": ["wardrobe details"]
}
Additional commentary here.`,

  // Malformed but parseable JSON
  malformedJSON: `{
    "score": 65,
    "strengths": ["has structure"],
    "improvements": ["needs more detail"],
    "missing": ["color grade"]
  }`,

  // Multiple JSON objects (should extract first one)
  multipleJSON: `First analysis:
{
  "score": 72,
  "strengths": ["good start"],
  "improvements": ["expand details"],
  "missing": ["finesse"]
}
Second analysis would be here.`,

  // JSON as string with escaping
  escapedJSON: `{\\"score\\": 88, \\"strengths\\": [\\"excellent\\"], \\"improvements\\": [], \\"missing\\": []}`,

  // Array format (some models might return this)
  arrayResponse: `[
    {
      "score": 92,
      "feedback": "excellent prompt quality"
    }
  ]`,

  // Plain text response (no JSON)
  noJSON: `This is a good prompt with clear direction and solid technical specifications.
The mood is well-established and visual elements are descriptive.
Could improve by adding more character details and wardrobe descriptions.`,

  // Empty response
  empty: '',

  // Only score as number
  numberOnly: '82'
};

/**
 * Parse quality analysis from Ollama response
 * Mimics the actual function logic
 */
function parseQualityAnalysis(responseText) {
  // Ollama returns response as text, may contain JSON embedded
  let text = responseText || '';

  // Unescape if needed (for escaped JSON responses)
  if (text.includes('\\"')) {
    try {
      text = JSON.parse(`"${text}"`);
    } catch {
      // Not a fully escaped string, continue as-is
    }
  }

  // Try to extract JSON from the response
  let analysis = {};
  try {
    // First try to parse the entire response
    analysis = JSON.parse(text);
  } catch {
    // If that fails, try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch {
        // If JSON parsing fails, return default
        console.warn('Could not parse Ollama response as JSON:', text);
        return {
          score: 0,
          strengths: [],
          improvements: [],
          missing: [],
        };
      }
    } else {
      console.warn('No JSON found in Ollama response:', text);
      return {
        score: 0,
        strengths: [],
        improvements: [],
        missing: [],
      };
    }
  }

  return {
    score: Math.min(100, Math.max(0, parseInt(analysis.score) || 0)),
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
    missing: Array.isArray(analysis.missing) ? analysis.missing : [],
  };
}

/**
 * Test suite
 */
const tests = {
  // ✅ PARSING TESTS
  'should parse valid JSON response': () => {
    const result = parseQualityAnalysis(JSON.stringify(mockResponses.validJSON));
    assert(result.score === 85, `Expected score 85, got ${result.score}`);
    assert(result.strengths.length === 3, `Expected 3 strengths, got ${result.strengths.length}`);
    assert(result.improvements.length === 2, `Expected 2 improvements, got ${result.improvements.length}`);
    assert(result.missing.length === 2, `Expected 2 missing, got ${result.missing.length}`);
    console.log('✅ Valid JSON parsing works');
  },

  'should parse JSON embedded in text': () => {
    const result = parseQualityAnalysis(mockResponses.jsonInText);
    assert(result.score === 78, `Expected score 78, got ${result.score}`);
    assert(result.strengths.length === 2, `Expected 2 strengths, got ${result.strengths.length}`);
    assert(result.improvements[0] === 'more technical specs', 'Improvement mismatch');
    console.log('✅ JSON in text parsing works');
  },

  'should parse malformed but valid JSON': () => {
    const result = parseQualityAnalysis(mockResponses.malformedJSON);
    assert(result.score === 65, `Expected score 65, got ${result.score}`);
    assert(result.improvements[0] === 'needs more detail', 'Improvement mismatch');
    console.log('✅ Malformed JSON parsing works');
  },

  'should extract first JSON from multiple objects': () => {
    const result = parseQualityAnalysis(mockResponses.multipleJSON);
    assert(result.score === 72, `Expected score 72 (first JSON), got ${result.score}`);
    assert(result.strengths[0] === 'good start', 'Should extract first JSON strengths');
    console.log('✅ Multiple JSON extraction works');
  },

  'should handle empty response gracefully': () => {
    const result = parseQualityAnalysis(mockResponses.empty);
    assert(result.score === 0, 'Empty should return score 0');
    assert(result.strengths.length === 0, 'Empty should return no strengths');
    assert(result.improvements.length === 0, 'Empty should return no improvements');
    console.log('✅ Empty response handling works');
  },

  'should handle plain text (no JSON) gracefully': () => {
    const result = parseQualityAnalysis(mockResponses.noJSON);
    assert(result.score === 0, 'No JSON should return score 0');
    assert(Array.isArray(result.strengths), 'Should return empty array for strengths');
    assert(Array.isArray(result.improvements), 'Should return empty array for improvements');
    console.log('✅ Plain text handling works (returns defaults)');
  },

  // ✅ SCORE VALIDATION TESTS
  'should clamp score between 0-100': () => {
    const overScore = parseQualityAnalysis(JSON.stringify({ score: 150, strengths: [], improvements: [], missing: [] }));
    assert(overScore.score === 100, `Score should be clamped to 100, got ${overScore.score}`);

    const negScore = parseQualityAnalysis(JSON.stringify({ score: -50, strengths: [], improvements: [], missing: [] }));
    assert(negScore.score === 0, `Score should be clamped to 0, got ${negScore.score}`);

    console.log('✅ Score clamping works (0-100 range)');
  },

  'should handle non-numeric scores': () => {
    const result = parseQualityAnalysis(JSON.stringify({ score: 'invalid', strengths: [], improvements: [], missing: [] }));
    assert(result.score === 0, `Invalid score should default to 0, got ${result.score}`);
    console.log('✅ Non-numeric score handling works');
  },

  'should handle missing score field': () => {
    const result = parseQualityAnalysis(JSON.stringify({ strengths: [], improvements: [], missing: [] }));
    assert(result.score === 0, `Missing score should default to 0, got ${result.score}`);
    console.log('✅ Missing score field handling works');
  },

  // ✅ ARRAY VALIDATION TESTS
  'should validate strengths array': () => {
    const result = parseQualityAnalysis(JSON.stringify({
      score: 80,
      strengths: ['good', 'excellent'],
      improvements: [],
      missing: []
    }));
    assert(Array.isArray(result.strengths), 'Strengths should be array');
    assert(result.strengths.length === 2, `Expected 2 strengths, got ${result.strengths.length}`);
    console.log('✅ Strengths array validation works');
  },

  'should handle non-array strengths': () => {
    const result = parseQualityAnalysis(JSON.stringify({
      score: 80,
      strengths: 'not an array',
      improvements: [],
      missing: []
    }));
    assert(Array.isArray(result.strengths), 'Should convert non-array to empty array');
    assert(result.strengths.length === 0, 'Should default to empty array');
    console.log('✅ Non-array strengths handling works');
  },

  'should handle missing array fields': () => {
    const result = parseQualityAnalysis(JSON.stringify({ score: 80 }));
    assert(Array.isArray(result.strengths), 'Missing strengths should be empty array');
    assert(Array.isArray(result.improvements), 'Missing improvements should be empty array');
    assert(Array.isArray(result.missing), 'Missing missing should be empty array');
    console.log('✅ Missing array fields handling works');
  },

  // ✅ REAL-WORLD SCENARIO TESTS
  'should handle quality prompt analysis': () => {
    const qualityPrompt = {
      score: 89,
      strengths: [
        'Excellent visual composition',
        'Clear emotional arc',
        'Technical specifications provided'
      ],
      improvements: [
        'Could specify camera movement more precisely'
      ],
      missing: [
        'Audio design elements',
        'Color grading preferences'
      ]
    };
    const result = parseQualityAnalysis(JSON.stringify(qualityPrompt));
    assert(result.score >= 80, 'Quality prompt should score 80+');
    assert(result.strengths.length >= 3, 'Quality prompt should have multiple strengths');
    console.log('✅ Quality prompt analysis works');
  },

  'should handle poor quality prompt': () => {
    const poorPrompt = {
      score: 35,
      strengths: [
        'Has some direction'
      ],
      improvements: [
        'Very vague descriptions',
        'Missing technical details',
        'Unclear mood and atmosphere',
        'No character information'
      ],
      missing: [
        'Lighting specifications',
        'Camera angles',
        'Wardrobe details',
        'Environment description',
        'Camera movement',
        'Color grade'
      ]
    };
    const result = parseQualityAnalysis(JSON.stringify(poorPrompt));
    assert(result.score <= 50, 'Poor prompt should score below 50');
    assert(result.improvements.length > 3, 'Poor prompt should have many improvements');
    assert(result.missing.length > 4, 'Poor prompt should be missing many elements');
    console.log('✅ Poor prompt analysis works');
  },

  'should handle edge case: zero value fields': () => {
    const result = parseQualityAnalysis(JSON.stringify({
      score: 0,
      strengths: [],
      improvements: [],
      missing: []
    }));
    assert(result.score === 0, 'Zero score should be valid');
    assert(result.strengths.length === 0, 'Empty arrays should be preserved');
    console.log('✅ Zero value fields handling works');
  },

  'should handle edge case: very high scores': () => {
    const result = parseQualityAnalysis(JSON.stringify({
      score: 999,
      strengths: ['Perfect prompt'],
      improvements: [],
      missing: []
    }));
    assert(result.score === 100, 'Score should cap at 100');
    console.log('✅ Very high score capping works');
  },

  // ✅ INTEGRATION TESTS
  'should produce consistent results across multiple calls': () => {
    const testData = JSON.stringify(mockResponses.validJSON);
    const result1 = parseQualityAnalysis(testData);
    const result2 = parseQualityAnalysis(testData);
    const result3 = parseQualityAnalysis(testData);
    
    assert(result1.score === result2.score && result2.score === result3.score, 'Results should be consistent');
    assert(JSON.stringify(result1) === JSON.stringify(result2), 'Multiple calls should produce identical results');
    console.log('✅ Consistent results across multiple calls');
  },

  'should handle rapid successive calls': () => {
    const responses = [
      mockResponses.jsonInText,
      mockResponses.validJSON,
      mockResponses.malformedJSON,
      mockResponses.empty,
      mockResponses.noJSON
    ];
    
    responses.forEach((response, idx) => {
      const result = parseQualityAnalysis(
        typeof response === 'string' ? response : JSON.stringify(response)
      );
      assert(typeof result.score === 'number', `Call ${idx + 1} should return number score`);
      assert(Array.isArray(result.strengths), `Call ${idx + 1} should return strengths array`);
    });
    console.log('✅ Rapid successive calls work correctly');
  },
};

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

/**
 * Run all tests
 */
function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 QUALITY ANALYZER TEST SUITE');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  Object.entries(tests).forEach(([testName, testFn]) => {
    try {
      testFn();
      passed++;
      results.push({ name: testName, status: 'PASS', error: null });
    } catch (error) {
      failed++;
      results.push({ name: testName, status: 'FAIL', error: error.message });
      console.error(error.message);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Quality analyzer is working correctly.\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. See details above.\n`);
  }

  // Detailed results
  if (failed > 0) {
    console.log('FAILED TESTS:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  • ${r.name}`);
        console.log(`    ${r.error}`);
      });
  }

  console.log('='.repeat(60) + '\n');

  return failed === 0 ? 0 : 1;
}

// Export for use in other tests
module.exports = {
  parseQualityAnalysis,
  mockResponses,
  runTests,
};

// Run tests if executed directly
if (require.main === module) {
  const exitCode = runTests();
  process.exit(exitCode);
}
