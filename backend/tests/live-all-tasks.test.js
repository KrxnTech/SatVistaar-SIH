import fs from 'fs';
import path from 'path';
import assert from 'assert';
import config from '../src/config/index.js';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

console.log('====================================================');
console.log('🚀 SATVISTAAR REAL GROQ VLM TASK VALIDATION SUITE');
console.log('====================================================\n');

if (!config.groqApiKey || config.groqApiKey.trim().length === 0) {
  console.error('❌ GROQ_API_KEY is not configured.');
  process.exit(1);
}

const uploadsDir = path.resolve('uploads');
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.tif'));

if (files.length < 2) {
  console.error('❌ Need at least 2 uploaded images in uploads/ to run live change analysis test.');
  process.exit(1);
}

const imageA = path.parse(files[0]).name;
const imageB = path.parse(files[1]).name;

const reports = {};

(async () => {
  // ----------------------------------------------------
  // TEST 1 — GENERAL VQA
  // ----------------------------------------------------
  console.log('📌 Running TEST 1 — GENERAL VQA...');
  try {
    const res = await processAnalysisRequest({
      query: 'What is visible in this satellite image?',
      fileIds: [imageA]
    }, 'vqa-live-req-001');

    assert.strictEqual(res.intent.name, 'VQA');
    assert.strictEqual(res.compatibility.status, 'READY');
    assert.strictEqual(res.executionPlan.modelSelection.selectedModel.provider, 'groq');
    assert.strictEqual(res.executionPlan.modelSelection.isMock, false);
    assert.strictEqual(res.result.provider, 'groq');
    assert.strictEqual(res.result.status, 'success');
    assert.strictEqual(res.trace.finalStatus, 'success');
    assert(res.result.answerText && res.result.answerText.length > 20);

    reports.TEST_1_VQA = {
      Status: 'PASS',
      Intent: res.intent.name,
      Provider: res.result.provider,
      Model: res.result.modelName,
      Mock: res.executionPlan.modelSelection.isMock,
      Response: res.result.answerText.substring(0, 300) + '...',
      Trace: res.trace.finalStatus
    };
    console.log('✅ TEST 1 — GENERAL VQA: PASS\n');
  } catch (err) {
    console.error('❌ TEST 1 — GENERAL VQA: FAIL:', err.message);
    reports.TEST_1_VQA = { Status: 'FAIL', Error: err.message };
  }

  await new Promise(r => setTimeout(r, 2000));

  // ----------------------------------------------------
  // TEST 2 — IMAGE / SCENE DESCRIPTION
  // ----------------------------------------------------
  console.log('📌 Running TEST 2 — IMAGE / SCENE DESCRIPTION...');
  try {
    const res = await processAnalysisRequest({
      query: 'Describe this satellite image in detail.',
      fileIds: [imageA]
    }, 'caption-live-req-002');

    assert.strictEqual(res.intent.name, 'CAPTIONING');
    assert.strictEqual(res.compatibility.status, 'READY');
    assert.strictEqual(res.executionPlan.modelSelection.selectedModel.provider, 'groq');
    assert.strictEqual(res.executionPlan.modelSelection.isMock, false);
    assert.strictEqual(res.result.provider, 'groq');
    assert.strictEqual(res.result.status, 'success');
    assert.strictEqual(res.trace.finalStatus, 'success');
    assert(res.result.answerText && res.result.answerText.length > 20);

    reports.TEST_2_CAPTIONING = {
      Status: 'PASS',
      Intent: res.intent.name,
      Provider: res.result.provider,
      Model: res.result.modelName,
      Mock: res.executionPlan.modelSelection.isMock,
      Response: res.result.answerText.substring(0, 300) + '...',
      Trace: res.trace.finalStatus
    };
    console.log('✅ TEST 2 — IMAGE / SCENE DESCRIPTION: PASS\n');
  } catch (err) {
    console.error('❌ TEST 2 — IMAGE / SCENE DESCRIPTION: FAIL:', err.message);
    reports.TEST_2_CAPTIONING = { Status: 'FAIL', Error: err.message };
  }

  await new Promise(r => setTimeout(r, 10000));

  // ----------------------------------------------------
  // TEST 3 — TWO-IMAGE CHANGE ANALYSIS
  // ----------------------------------------------------
  console.log('📌 Running TEST 3 — TWO-IMAGE CHANGE ANALYSIS...');
  try {
    const res = await processAnalysisRequest({
      query: 'What changed between these two satellite images?',
      fileIds: [imageA, imageB]
    }, 'change-live-req-003');

    assert.strictEqual(res.intent.name, 'CHANGE_ANALYSIS');
    assert.strictEqual(res.compatibility.status, 'READY');
    assert.strictEqual(res.compatibility.requirements.minImages, 2);
    assert.strictEqual(res.compatibility.requirements.maxImages, 2);
    assert.strictEqual(res.executionPlan.modelSelection.selectedModel.provider, 'groq');
    assert.strictEqual(res.executionPlan.modelSelection.isMock, false);
    assert.strictEqual(res.result.provider, 'groq');
    assert.strictEqual(res.result.status, 'success');
    assert.strictEqual(res.trace.finalStatus, 'success');
    assert(res.result.answerText && res.result.answerText.length > 20);

    reports.TEST_3_CHANGE_ANALYSIS = {
      Status: 'PASS',
      Intent: res.intent.name,
      Provider: res.result.provider,
      Model: res.result.modelName,
      Mock: res.executionPlan.modelSelection.isMock,
      Response: res.result.answerText.substring(0, 300) + '...',
      Trace: res.trace.finalStatus
    };
    console.log('✅ TEST 3 — TWO-IMAGE CHANGE ANALYSIS: PASS\n');
  } catch (err) {
    console.error('❌ TEST 3 — TWO-IMAGE CHANGE ANALYSIS: FAIL:', err.message);
    reports.TEST_3_CHANGE_ANALYSIS = { Status: 'FAIL', Error: err.message };
  }

  // ----------------------------------------------------
  // NEGATIVE TESTS
  // ----------------------------------------------------
  console.log('📌 Running NEGATIVE TESTS...');
  reports.NEGATIVE_TESTS = {};

  // Neg A: One image + change query -> ABSTAIN
  try {
    const res = await processAnalysisRequest({
      query: 'What changed?',
      fileIds: [imageA]
    }, 'neg-a-req-004');

    assert.strictEqual(res.compatibility.status, 'ABSTAIN');
    assert.strictEqual(res.compatibility.compatible, false);
    assert.strictEqual(res.result, null);
    assert.strictEqual(res.trace.finalStatus, 'abstained');
    reports.NEGATIVE_TESTS.One_Image_Change = 'PASS (ABSTAINED correctly)';
    console.log('✅ Negative Test A (1 image change query -> ABSTAIN): PASS');
  } catch (err) {
    console.error('❌ Negative Test A FAIL:', err.message);
    reports.NEGATIVE_TESTS.One_Image_Change = `FAIL (${err.message})`;
  }

  // Neg B: No files array -> Validation error 400
  try {
    await processAnalysisRequest({ query: 'What is visible?', fileIds: [] }, 'neg-b-req-005');
    reports.NEGATIVE_TESTS.No_Files = 'FAIL (Did not throw validation error)';
  } catch (err) {
    if (err.code === 'INVALID_FILE_IDS' && err.statusCode === 400) {
      reports.NEGATIVE_TESTS.No_Files = 'PASS (Returned 400 INVALID_FILE_IDS correctly)';
      console.log('✅ Negative Test B (No files -> 400 Error): PASS');
    } else {
      reports.NEGATIVE_TESTS.No_Files = `FAIL (Unexpected error ${err.code})`;
    }
  }

  // Neg C: Invalid fileId -> 404 FILE_NOT_FOUND
  try {
    await processAnalysisRequest({ query: 'What is visible?', fileIds: ['non-existent-file-id-999'] }, 'neg-c-req-006');
    reports.NEGATIVE_TESTS.Invalid_File = 'FAIL (Did not throw FILE_NOT_FOUND)';
  } catch (err) {
    if (err.code === 'FILE_NOT_FOUND' && err.statusCode === 404) {
      reports.NEGATIVE_TESTS.Invalid_File = 'PASS (Returned 404 FILE_NOT_FOUND correctly)';
      console.log('✅ Negative Test C (Invalid fileId -> 404 Not Found): PASS');
    } else {
      reports.NEGATIVE_TESTS.Invalid_File = `FAIL (Unexpected error ${err.code})`;
    }
  }

  // Neg D: Ambiguous query -> UNKNOWN intent -> ABSTAIN
  try {
    const res = await processAnalysisRequest({
      query: 'xyz123 random prompt',
      fileIds: [imageA]
    }, 'neg-d-req-007');

    assert.strictEqual(res.intent.name, 'UNKNOWN');
    assert.strictEqual(res.compatibility.status, 'ABSTAIN');
    reports.NEGATIVE_TESTS.Unknown_Request = 'PASS (UNKNOWN intent -> ABSTAIN correctly)';
    console.log('✅ Negative Test D (Unknown request -> UNKNOWN / ABSTAIN): PASS');
  } catch (err) {
    console.error('❌ Negative Test D FAIL:', err.message);
    reports.NEGATIVE_TESTS.Unknown_Request = `FAIL (${err.message})`;
  }

  console.log('\n====================================================');
  console.log('📊 FINAL LIVE TASK VALIDATION SUMMARY');
  console.log('====================================================');
  console.log(JSON.stringify(reports, null, 2));
  console.log('====================================================');
})();
