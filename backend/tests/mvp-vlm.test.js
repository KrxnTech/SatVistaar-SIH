import assert from 'assert';
import { INTENTS } from '../src/agent/intents.js';
import classifyIntent from '../src/agent/intentClassifier.js';
import evaluateCompatibility, { COMPATIBILITY_STATUS } from '../src/agent/compatibilityEngine.js';
import routeModel from '../src/agent/modelRouter.js';
import { getCandidateModels } from '../src/agent/modelRegistry.js';
import groqProvider from '../src/providers/groq.provider.js';
import ollamaProvider from '../src/providers/ollama.provider.js';
import vqaTool from '../src/tools/vqa.tool.js';
import captionTool from '../src/tools/caption.tool.js';
import featureIdentificationTool from '../src/tools/featureIdentification.tool.js';
import changeAnalysisTool from '../src/tools/changeAnalysis.tool.js';
import executePlanTools from '../src/agent/toolExecutor.js';

console.log('----------------------------------------------------');
console.log('🚀 Running SatVistaar VLM MVP Comprehensive Test Suite');
console.log('----------------------------------------------------');

let passedTests = 0;
let totalTests = 0;

const runTest = (name, testFn) => {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`✅ [TEST ${totalTests}] PASS: ${name}`);
  } catch (err) {
    console.error(`❌ [TEST ${totalTests}] FAIL: ${name}\n   Error: ${err.message}`);
  }
};

const runAsyncTest = async (name, testFn) => {
  totalTests++;
  try {
    await testFn();
    passedTests++;
    console.log(`✅ [TEST ${totalTests}] PASS: ${name}`);
  } catch (err) {
    console.error(`❌ [TEST ${totalTests}] FAIL: ${name}\n   Error: ${err.message}`);
  }
};

(async () => {
  // --- TASK CLASSIFICATION TESTS ---
  runTest('1. Intent Classifier - VQA', () => {
    const res = classifyIntent({ query: 'What is visible in this image?' });
    assert.strictEqual(res.intent, INTENTS.VQA);
  });

  runTest('2. Intent Classifier - Captioning', () => {
    const res = classifyIntent({ query: 'Describe this satellite image scene.' });
    assert.strictEqual(res.intent, INTENTS.CAPTIONING);
  });

  runTest('3. Intent Classifier - Feature Identification', () => {
    const res = classifyIntent({ query: 'Identify the buildings and water bodies in this image.' });
    assert.strictEqual(res.intent, INTENTS.FEATURE_IDENTIFICATION);
  });

  runTest('4. Intent Classifier - Change Analysis', () => {
    const res = classifyIntent({ query: 'What changed between these two images?' });
    assert.strictEqual(res.intent, INTENTS.CHANGE_ANALYSIS);
  });

  runTest('5. Intent Classifier - UNKNOWN for unsupported/ambiguous query', () => {
    const res = classifyIntent({ query: 'xyz123 random prompt' });
    assert.strictEqual(res.intent, INTENTS.UNKNOWN);
  });

  // --- COMPATIBILITY ENGINE TESTS ---
  runTest('6. Compatibility - 1 image + VQA -> READY', () => {
    const res = evaluateCompatibility({
      analysisRequest: { inputs: [{ fileId: 'img1' }] },
      intentResult: { name: INTENTS.VQA }
    });
    assert.strictEqual(res.status, COMPATIBILITY_STATUS.READY);
    assert.strictEqual(res.compatible, true);
  });

  runTest('7. Compatibility - 1 image + Captioning -> READY', () => {
    const res = evaluateCompatibility({
      analysisRequest: { inputs: [{ fileId: 'img1' }] },
      intentResult: { name: INTENTS.CAPTIONING }
    });
    assert.strictEqual(res.status, COMPATIBILITY_STATUS.READY);
    assert.strictEqual(res.compatible, true);
  });

  runTest('8. Compatibility - 1 image + Feature Identification -> READY', () => {
    const res = evaluateCompatibility({
      analysisRequest: { inputs: [{ fileId: 'img1' }] },
      intentResult: { name: INTENTS.FEATURE_IDENTIFICATION }
    });
    assert.strictEqual(res.status, COMPATIBILITY_STATUS.READY);
    assert.strictEqual(res.compatible, true);
  });

  runTest('9. Compatibility - 2 images + Change Analysis -> READY', () => {
    const res = evaluateCompatibility({
      analysisRequest: { inputs: [{ fileId: 'img1' }, { fileId: 'img2' }] },
      intentResult: { name: INTENTS.CHANGE_ANALYSIS }
    });
    assert.strictEqual(res.status, COMPATIBILITY_STATUS.READY);
    assert.strictEqual(res.compatible, true);
  });

  runTest('10. Compatibility - 1 image + Change Analysis -> ABSTAIN', () => {
    const res = evaluateCompatibility({
      analysisRequest: { inputs: [{ fileId: 'img1' }] },
      intentResult: { name: INTENTS.CHANGE_ANALYSIS }
    });
    assert.strictEqual(res.status, COMPATIBILITY_STATUS.ABSTAIN);
    assert.strictEqual(res.compatible, false);
  });

  // --- MODEL ROUTER TESTS ---
  runTest('11. Model Router - Selects available candidate models', () => {
    const candidateModels = getCandidateModels(INTENTS.VQA, 1);
    assert(candidateModels.length > 0);
  });

  runTest('12. Model Router - Respects task capability filtering', () => {
    const candidateModels = getCandidateModels(INTENTS.CHANGE_ANALYSIS, 2);
    assert(candidateModels.every(m => m.capabilities.includes(INTENTS.CHANGE_ANALYSIS)));
  });

  runTest('13. Model Router - Mock mode selection', () => {
    const route = routeModel({ task: INTENTS.VQA, imageCount: 1, forceMock: true });
    assert.strictEqual(route.isMock, true);
    assert.strictEqual(route.selectedModel.provider, 'mock');
  });

  runTest('14. Model Router - Fallback configuration', () => {
    const route = routeModel({ task: INTENTS.CHANGE_ANALYSIS, imageCount: 2 });
    assert(route.selectedModel !== null);
  });

  // --- SPECIALIST TOOLS TESTS ---
  await runAsyncTest('15. VQA Tool Execution', async () => {
    const res = await vqaTool.execute({
      query: 'What is visible?',
      imagePaths: ['uploads/test.jpg'],
      modelSelection: { isMock: true, selectedModel: { provider: 'mock' } }
    });
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.task, INTENTS.VQA);
    assert.strictEqual(res.confidence, null);
    assert(res.answerText.includes('Mock VQA'));
  });

  await runAsyncTest('16. Caption Tool Execution', async () => {
    const res = await captionTool.execute({
      query: 'Describe scene',
      imagePaths: ['uploads/test.jpg'],
      modelSelection: { isMock: true, selectedModel: { provider: 'mock' } }
    });
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.task, INTENTS.CAPTIONING);
    assert.strictEqual(res.confidence, null);
  });

  await runAsyncTest('17. Feature Identification Tool Execution', async () => {
    const res = await featureIdentificationTool.execute({
      query: 'Identify buildings',
      imagePaths: ['uploads/test.jpg'],
      modelSelection: { isMock: true, selectedModel: { provider: 'mock' } }
    });
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.task, INTENTS.FEATURE_IDENTIFICATION);
    assert(res.warnings[0].includes('Approximate visual grounding'));
  });

  await runAsyncTest('18. Change Analysis Tool Execution (2 images)', async () => {
    const res = await changeAnalysisTool.execute({
      query: 'What changed?',
      imagePaths: ['uploads/img1.jpg', 'uploads/img2.jpg'],
      modelSelection: { isMock: true, selectedModel: { provider: 'mock' } }
    });
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.task, INTENTS.CHANGE_ANALYSIS);
    assert(res.warnings[0].includes('Vision-Language Based Change Analysis'));
  });

  await runAsyncTest('19. Change Analysis Tool Execution (1 image failure)', async () => {
    const res = await changeAnalysisTool.execute({
      query: 'What changed?',
      imagePaths: ['uploads/img1.jpg'],
      modelSelection: { isMock: true, selectedModel: { provider: 'mock' } }
    });
    assert.strictEqual(res.status, 'failed');
  });

  await runAsyncTest('20. Tool Executor Integration', async () => {
    const executionPlan = {
      selectedIntent: INTENTS.VQA,
      status: 'READY',
      modelSelection: { isMock: true, selectedModel: { provider: 'mock' } }
    };
    const outcome = await executePlanTools({
      executionPlan,
      analysisContext: { query: 'Is there a river?', imagePaths: ['test.jpg'] }
    });
    assert(outcome.toolResult !== null);
    assert.strictEqual(outcome.toolResult.status, 'success');
    assert.strictEqual(outcome.executionMeta.toolName, 'vqa-tool');
  });

  console.log('----------------------------------------------------');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('----------------------------------------------------');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
})();
