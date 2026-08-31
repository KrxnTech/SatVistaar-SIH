import assert from 'assert';
import config from '../src/config/index.js';
import routeModel from '../src/agent/modelRouter.js';
import { MODEL_REGISTRY, getCandidateModels } from '../src/agent/modelRegistry.js';
import executePlanTools from '../src/agent/toolExecutor.js';

console.log('====================================================');
console.log('🚀 SATVISTAAR INTELLIGENT MODEL ROUTER TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let total = 0;

const test = (name, fn) => {
  total++;
  try {
    fn();
    passed++;
    console.log(`✅ [TEST ${total}] PASS: ${name}`);
  } catch (err) {
    console.error(`❌ [TEST ${total}] FAIL: ${name}\n   Error: ${err.message}`);
  }
};

const asyncTest = async (name, fn) => {
  total++;
  try {
    await fn();
    passed++;
    console.log(`✅ [TEST ${total}] PASS: ${name}`);
  } catch (err) {
    console.error(`❌ [TEST ${total}] FAIL: ${name}\n   Error: ${err.message}`);
  }
};

(async () => {
  // Test 1: VQA selects top benchmark-priority model
  test('1. VQA routing selects top benchmark priority model (qwen3.8-27b)', () => {
    const route = routeModel({ task: 'VQA', imageCount: 1 });
    assert.strictEqual(route.isMock, false);
    assert.strictEqual(route.selectedModel.id, 'groq-qwen38');
    assert.strictEqual(route.selectedModel.provider, 'groq');
  });

  // Test 2: Captioning selects top benchmark-priority model
  test('2. Captioning routing selects top benchmark priority model (qwen3.8-27b)', () => {
    const route = routeModel({ task: 'CAPTIONING', imageCount: 1 });
    assert.strictEqual(route.isMock, false);
    assert.strictEqual(route.selectedModel.id, 'groq-qwen38');
  });

  // Test 3: Feature Identification selects top benchmark-priority model
  test('3. Feature Identification selects top benchmark priority model (qwen3.8-27b)', () => {
    const route = routeModel({ task: 'FEATURE_IDENTIFICATION', imageCount: 1 });
    assert.strictEqual(route.isMock, false);
    assert.strictEqual(route.selectedModel.id, 'groq-qwen38');
  });

  // Test 4: Change Analysis selects top multi-image benchmark model (qwen3.8-27b)
  test('4. Change Analysis selects multi-image benchmark model (qwen3.8-27b)', () => {
    const route = routeModel({ task: 'CHANGE_ANALYSIS', imageCount: 2 });
    assert.strictEqual(route.isMock, false);
    assert.strictEqual(route.selectedModel.id, 'groq-qwen38');
    assert.strictEqual(route.selectedModel.supportsMultipleImages, true);
  });

  // Test 5: Disabled model is ignored
  test('5. Disabled model is ignored by router', () => {
    const targetModel = MODEL_REGISTRY.find(m => m.id === 'groq-qwen36');
    targetModel.enabled = false;

    const route = routeModel({ task: 'VQA', imageCount: 1 });
    assert.strictEqual(route.selectedModel.id, 'groq-qwen38');

    targetModel.enabled = true; // Restore
  });

  // Test 6: Unsupported task model is ignored
  test('6. Model without required capability is ignored', () => {
    const candidates = getCandidateModels('NON_EXISTENT_TASK', 1);
    assert.strictEqual(candidates.length, 0);

    const route = routeModel({ task: 'NON_EXISTENT_TASK', imageCount: 1 });
    assert.strictEqual(route.selectedModel, null);
  });

  // Test 7: Provider preference override
  test('7. Model Router respects explicit MODEL_PROVIDER configuration', () => {
    const origProvider = config.modelProvider;
    config.modelProvider = 'groq';

    const route = routeModel({ task: 'VQA', imageCount: 1 });
    assert.strictEqual(route.selectedModel.provider, 'groq');

    config.modelProvider = origProvider;
  });

  // Test 8: Fallback execution when primary provider fails
  await asyncTest('8. Tool Executor uses fallback model when primary provider fails', async () => {
    const executionPlan = {
      selectedIntent: 'VQA',
      status: 'READY',
      modelSelection: {
        isMock: false,
        selectedModel: { id: 'invalid-model', name: 'Invalid Primary Model', provider: 'invalid-provider', model: 'invalid-model-name' },
        fallbackModel: { id: 'mock-vlm', name: 'Mock Fallback VLM', provider: 'mock', model: 'satquery-mock-vlm-v1' }
      }
    };

    const outcome = await executePlanTools({
      executionPlan,
      analysisContext: { query: 'What is visible?', imagePaths: ['uploads/4204c4a8-1e4e-4603-9d4d-c48e064a5970.jpg'] }
    });

    assert.strictEqual(outcome.toolResult.status, 'success');
    assert.strictEqual(outcome.toolResult.provider, 'mock');
    assert(outcome.toolResult.warnings.some(w => w.includes('Fallback model')));
  });

  // Test 9: Clean failure when both primary and fallback models fail
  await asyncTest('9. Tool Executor fails cleanly when both primary and fallback fail', async () => {
    const executionPlan = {
      selectedIntent: 'VQA',
      status: 'READY',
      modelSelection: {
        isMock: false,
        selectedModel: { id: 'invalid-1', name: 'Invalid Model 1', provider: 'groq', model: 'invalid-model-1' },
        fallbackModel: { id: 'invalid-2', name: 'Invalid Model 2', provider: 'groq', model: 'invalid-model-2' }
      }
    };

    const outcome = await executePlanTools({
      executionPlan,
      analysisContext: { query: 'What is visible?', imagePaths: ['uploads/4204c4a8-1e4e-4603-9d4d-c48e064a5970.jpg'] }
    });

    assert.strictEqual(outcome.toolResult.status, 'failed');
    assert.strictEqual(outcome.executionMeta.toolName, 'vqa-tool');
  });

  // Test 10: Multi-image model enforcement for Change Analysis
  test('10. Multi-image models are enforced when imageCount > 1', () => {
    const candidates = getCandidateModels('CHANGE_ANALYSIS', 2);
    assert(candidates.every(m => m.supportsMultipleImages === true));
  });

  // Test 11: Mock mode still selects mock
  test('11. Mock mode active selects mock provider', () => {
    const route = routeModel({ task: 'VQA', imageCount: 1, forceMock: true });
    assert.strictEqual(route.isMock, true);
    assert.strictEqual(route.selectedModel.provider, 'mock');
  });

  // Test 12: Live mode never selects mock
  test('12. Live mode never returns mock model', () => {
    const route = routeModel({ task: 'VQA', imageCount: 1, forceMock: false });
    assert.strictEqual(route.isMock, false);
    assert.notStrictEqual(route.selectedModel.provider, 'mock');
  });

  console.log('\n====================================================');
  console.log(`📊 ROUTER TEST SUMMARY: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
})();
