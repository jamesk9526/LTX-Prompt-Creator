/**
 * Integration Test: Quality Analyzer with Mocked Ollama
 * 
 * This demonstrates how to test the quality analyzer in a full integration context
 * with a mocked Ollama API server.
 */

const { parseQualityAnalysis, mockResponses } = require('./quality-analyzer.test.js');

/**
 * Simulates a full Ollama API response cycle
 */
async function simulateOllamaAnalysis(promptText, mode = 'cinematic') {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

  // Pick a random mock response (simulating different model outputs)
  const responseFormats = Object.values(mockResponses);
  const randomResponse = responseFormats[Math.floor(Math.random() * responseFormats.length)];
  
  // Parse the response
  const result = parseQualityAnalysis(
    typeof randomResponse === 'string' ? randomResponse : JSON.stringify(randomResponse)
  );

  return {
    prompt: promptText,
    mode,
    analysis: result,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test: Multiple concurrent analysis requests
 */
async function testConcurrentAnalysis() {
  console.log('\n📊 Testing concurrent analysis requests...');
  
  const prompts = [
    'A cinematic shot of a hero entering a dark warehouse',
    'Drone footage of mountains at sunrise',
    'Anime battle scene with dynamic camera movement',
    'Close-up portrait with volumetric lighting',
    'Wide establishing shot of a futuristic city'
  ];

  const startTime = Date.now();
  const results = await Promise.all(
    prompts.map(prompt => simulateOllamaAnalysis(prompt))
  );
  const duration = Date.now() - startTime;

  console.log(`✅ Processed ${results.length} prompts in ${duration}ms`);
  
  // Validate results
  results.forEach((result, idx) => {
    const { score, strengths, improvements, missing } = result.analysis;
    console.log(`  ${idx + 1}. Score: ${score}/100, Strengths: ${strengths.length}, Improvements: ${improvements.length}`);
  });

  return results;
}

/**
 * Test: Quality distribution
 */
async function testQualityDistribution() {
  console.log('\n📈 Testing quality score distribution...');
  
  const analyses = [];
  const iterations = 20;

  for (let i = 0; i < iterations; i++) {
    const result = await simulateOllamaAnalysis(`Test prompt ${i + 1}`);
    analyses.push(result.analysis.score);
  }

  // Calculate statistics
  const min = Math.min(...analyses);
  const max = Math.max(...analyses);
  const avg = (analyses.reduce((a, b) => a + b, 0) / analyses.length).toFixed(1);
  const median = analyses.sort((a, b) => a - b)[Math.floor(analyses.length / 2)];

  // Distribution buckets
  const buckets = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-100': 0,
  };

  analyses.forEach(score => {
    if (score === 0) buckets['0-25']++;
    else if (score <= 50) buckets['26-50']++;
    else if (score <= 75) buckets['51-75']++;
    else buckets['76-100']++;
  });

  console.log(`  Sample size: ${iterations}`);
  console.log(`  Min: ${min}, Max: ${max}, Avg: ${avg}, Median: ${median}`);
  console.log(`  Distribution:`);
  Object.entries(buckets).forEach(([bucket, count]) => {
    const percent = ((count / iterations) * 100).toFixed(0);
    console.log(`    ${bucket}: ${count} (${percent}%)`);
  });

  return { min, max, avg, median, buckets };
}

/**
 * Test: Response time performance
 */
async function testPerformance() {
  console.log('\n⏱️ Testing response time performance...');
  
  const iterations = 50;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await simulateOllamaAnalysis(`Test ${i}`);
    const duration = Date.now() - start;
    times.push(duration);
  }

  const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

  console.log(`  Iterations: ${iterations}`);
  console.log(`  Avg response: ${avg}ms`);
  console.log(`  Min: ${min}ms, Max: ${max}ms`);
  console.log(`  P95: ${p95}ms (95th percentile)`);

  return { avg, min, max, p95 };
}

/**
 * Test: Edge case handling under stress
 */
async function testStressConditions() {
  console.log('\n🔥 Testing stress conditions...');
  
  const testCases = [
    { name: 'Empty prompt', prompt: '' },
    { name: 'Very long prompt', prompt: 'A'.repeat(5000) },
    { name: 'Special characters', prompt: '!@#$%^&*()[]{}' },
    { name: 'Unicode emoji', prompt: '🎬🎥📹✨🌟' },
    { name: 'Multiple newlines', prompt: '\n\n\n\n' },
  ];

  console.log(`  Testing ${testCases.length} edge cases...`);

  for (const testCase of testCases) {
    try {
      const result = await simulateOllamaAnalysis(testCase.prompt);
      const score = result.analysis.score;
      console.log(`  ✅ ${testCase.name}: score=${score}`);
    } catch (error) {
      console.log(`  ❌ ${testCase.name}: ${error.message}`);
    }
  }
}

/**
 * Test: Score consistency for same prompt
 */
async function testConsistency() {
  console.log('\n🔄 Testing score consistency...');
  
  const testPrompt = 'A cinematic wide shot of a hero walking through a neon-lit city at night with volumetric lighting';
  const iterations = 5;
  const scores = [];

  console.log(`  Analyzing same prompt ${iterations} times...`);

  for (let i = 0; i < iterations; i++) {
    const result = await simulateOllamaAnalysis(testPrompt);
    scores.push(result.analysis.score);
    console.log(`    Attempt ${i + 1}: score=${result.analysis.score}`);
  }

  // Check if scores are reasonably consistent (within 20 points)
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const variance = max - min;
  const isConsistent = variance <= 20;

  console.log(`  Variance: ${variance} points`);
  console.log(`  Consistency: ${isConsistent ? '✅ GOOD' : '⚠️  HIGH'}`);

  return { scores, variance, isConsistent };
}

/**
 * Run all integration tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 QUALITY ANALYZER INTEGRATION TESTS');
  console.log('='.repeat(70));

  try {
    await testConcurrentAnalysis();
    await testQualityDistribution();
    await testPerformance();
    await testStressConditions();
    await testConsistency();

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL INTEGRATION TESTS COMPLETED');
    console.log('='.repeat(70) + '\n');

    return 0;
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    return 1;
  }
}

// Export for use in other test suites
module.exports = {
  simulateOllamaAnalysis,
  testConcurrentAnalysis,
  testQualityDistribution,
  testPerformance,
  testStressConditions,
  testConsistency,
  runAllTests,
};

// Run if executed directly
if (require.main === module) {
  runAllTests().then(exitCode => process.exit(exitCode));
}
