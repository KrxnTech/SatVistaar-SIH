process.env.ML_MODE = 'real';
process.env.MODEL_PROVIDER = 'python_ml';

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import config from '../src/config/index.js';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

console.log('================================================================');
console.log('🛰️  SATVISTAAR PYTHON ML MICROSERVICE LIVE VALIDATION SUITE');
console.log('================================================================\n');

config.mlMode = 'real';
config.modelProvider = 'python_ml';

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create dummy image files if none present in uploads/
const testImageA = path.join(uploadsDir, 'test-scene-a.png');
const testImageB = path.join(uploadsDir, 'test-scene-b.png');

const validPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(testImageA, validPngBuffer);
fs.writeFileSync(testImageB, validPngBuffer);

const fileIdA = 'test-scene-a';
const fileIdB = 'test-scene-b';

const results = {};

(async () => {
  // ----------------------------------------------------
  // TEST 1 — Microservice Health Endpoint
  // ----------------------------------------------------
  console.log('📌 Running TEST 1 — Health Check (http://localhost:5002/health)...');
  try {
    const healthRes = await fetch('http://localhost:5002/health');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');
    assert.strictEqual(healthData.service, 'satquery-ml-inference-python');
    console.log('✅ TEST 1 — Health Check: PASS\n');
    results.TEST_1_HEALTH = { Status: 'PASS', Service: healthData.service, Device: healthData.device };
  } catch (err) {
    console.error('❌ TEST 1 — Health Check: FAIL:', err.message);
    results.TEST_1_HEALTH = { Status: 'FAIL', Error: err.message };
  }

  // ----------------------------------------------------
  // TEST 2 — Task 1: General VQA
  // ----------------------------------------------------
  console.log('📌 Running TEST 2 — Task 1: VQA via Python ML Engine...');
  try {
    const res = await processAnalysisRequest({
      query: 'What is visible in this satellite image?',
      fileIds: [fileIdA]
    }, 'req-vqa-001');

    assert.strictEqual(res.intent.name, 'VQA');
    assert.strictEqual(res.compatibility.status, 'READY');
    assert.strictEqual(res.result.provider, 'python_ml');
    assert.strictEqual(res.result.status, 'success');
    assert(res.result.answerText && res.result.answerText.length > 10);

    console.log('✅ TEST 2 — Task 1: VQA PASS');
    console.log(`   Answer: "${res.result.answerText}"\n`);
    results.TEST_2_VQA = { Status: 'PASS', Provider: res.result.provider, Answer: res.result.answerText };
  } catch (err) {
    console.error('❌ TEST 2 — Task 1: VQA FAIL:', err.message);
    results.TEST_2_VQA = { Status: 'FAIL', Error: err.message };
  }

  // ----------------------------------------------------
  // TEST 3 — Task 2: Captioning & Scene Description
  // ----------------------------------------------------
  console.log('📌 Running TEST 3 — Task 2: Captioning via Python ML Engine...');
  try {
    const res = await processAnalysisRequest({
      query: 'Describe this satellite image in detail.',
      fileIds: [fileIdA]
    }, 'req-cap-002');

    assert.strictEqual(res.intent.name, 'CAPTIONING');
    assert.strictEqual(res.compatibility.status, 'READY');
    assert.strictEqual(res.result.provider, 'python_ml');
    assert.strictEqual(res.result.status, 'success');

    console.log('✅ TEST 3 — Task 2: Captioning PASS');
    console.log(`   Answer: "${res.result.answerText}"\n`);
    results.TEST_3_CAPTIONING = { Status: 'PASS', Provider: res.result.provider, Answer: res.result.answerText };
  } catch (err) {
    console.error('❌ TEST 3 — Task 2: Captioning FAIL:', err.message);
    results.TEST_3_CAPTIONING = { Status: 'FAIL', Error: err.message };
  }

  // ----------------------------------------------------
  // TEST 4 — Task 3: Feature Grounding
  // ----------------------------------------------------
  console.log('📌 Running TEST 4 — Task 3: Feature Grounding via Python ML Engine...');
  try {
    const res = await processAnalysisRequest({
      query: 'Locate water bodies and buildings',
      fileIds: [fileIdA]
    }, 'req-ground-003');

    assert.strictEqual(res.intent.name, 'FEATURE_IDENTIFICATION');
    assert.strictEqual(res.result.provider, 'python_ml');
    assert.strictEqual(res.result.status, 'success');
    assert(res.result.grounding && res.result.grounding.regions.length > 0, 'Should include grounding regions');

    console.log('✅ TEST 4 — Task 3: Feature Grounding PASS');
    console.log(`   Grounding Regions: ${res.result.grounding.regions.length} region(s) detected\n`);
    results.TEST_4_GROUNDING = {
      Status: 'PASS',
      Provider: res.result.provider,
      RegionsCount: res.result.grounding.regions.length,
      FirstRegion: res.result.grounding.regions[0]
    };
  } catch (err) {
    console.error('❌ TEST 4 — Task 3: Feature Grounding FAIL:', err.message);
    results.TEST_4_GROUNDING = { Status: 'FAIL', Error: err.message };
  }

  // ----------------------------------------------------
  // TEST 5 — Task 4: Bi-Temporal Change Analysis
  // ----------------------------------------------------
  console.log('📌 Running TEST 5 — Task 4: Change Analysis via Python ML Engine...');
  try {
    const res = await processAnalysisRequest({
      query: 'What changed between baseline and comparison image?',
      fileIds: [fileIdA, fileIdB]
    }, 'req-change-004');

    assert.strictEqual(res.intent.name, 'CHANGE_ANALYSIS');
    assert.strictEqual(res.result.provider, 'python_ml');
    assert.strictEqual(res.result.status, 'success');

    console.log('✅ TEST 5 — Task 4: Change Analysis PASS');
    console.log(`   Summary: "${res.result.answerText}"\n`);
    results.TEST_5_CHANGE_ANALYSIS = { Status: 'PASS', Provider: res.result.provider, Summary: res.result.answerText };
  } catch (err) {
    console.error('❌ TEST 5 — Task 4: Change Analysis FAIL:', err.message);
    results.TEST_5_CHANGE_ANALYSIS = { Status: 'FAIL', Error: err.message };
  }

  console.log('================================================================');
  console.log('📊 PYTHON ML LIVE VALIDATION SUMMARY REPORT');
  console.log('================================================================');
  console.log(JSON.stringify(results, null, 2));
  console.log('================================================================\n');

  const failedTests = Object.values(results).filter(r => r.Status === 'FAIL');
  if (failedTests.length > 0) {
    process.exit(1);
  }
})();
