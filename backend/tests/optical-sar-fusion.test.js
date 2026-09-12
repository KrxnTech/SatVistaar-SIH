import assert from 'assert';
import config from '../src/config/index.js';
import { INTENTS } from '../src/agent/intents.js';
import classifyIntent from '../src/agent/intentClassifier.js';
import evaluateCompatibility, { COMPATIBILITY_STATUS } from '../src/agent/compatibilityEngine.js';
import buildExecutionPlan from '../src/agent/executionPlanner.js';
import opticalSarFusionTool from '../src/tools/opticalSarFusion.tool.js';
import { getToolForIntent } from '../src/agent/toolRegistry.js';
import { aggregateToolResult } from '../src/services/result.service.js';

console.log('====================================================');
console.log('🛰️ SATVISTAAR OPTICAL + SAR FUSION UNIT TEST SUITE');
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
  // Test 1: Explicit requestedTask === 'OPTICAL_SAR_FUSION'
  test('1. Explicit requestedTask OPTICAL_SAR_FUSION classifies with confidence 1.0', () => {
    const classification = classifyIntent({
      query: 'Analyze these images',
      inputs: [{ fileId: 'opt-1' }, { fileId: 'sar-1' }],
      requestedTask: INTENTS.OPTICAL_SAR_FUSION
    });
    assert.strictEqual(classification.intent, INTENTS.OPTICAL_SAR_FUSION);
    assert.strictEqual(classification.confidence, 1.0);
  });

  // Test 2: Natural Language Query containing Optical and SAR keywords
  test('2. Query "Use optical and SAR together to identify built-up areas" classifies as OPTICAL_SAR_FUSION', () => {
    const classification = classifyIntent({
      query: 'Use optical and SAR together to identify built-up and water areas',
      inputs: [{ fileId: 'opt-1' }, { fileId: 'sar-1' }]
    });
    assert.strictEqual(classification.intent, INTENTS.OPTICAL_SAR_FUSION);
    assert(classification.confidence >= 0.90);
  });

  // Test 3: Natural Language Query with radar backscatter keywords
  test('3. Query "Fuse radar backscatter with multispectral imagery" classifies as OPTICAL_SAR_FUSION', () => {
    const classification = classifyIntent({
      query: 'Fuse radar backscatter with multispectral imagery to detect flood extents',
      inputs: [{ fileId: 'opt-1' }, { fileId: 'sar-1' }]
    });
    assert.strictEqual(classification.intent, INTENTS.OPTICAL_SAR_FUSION);
  });

  // Test 4: Tool Registry maps OPTICAL_SAR_FUSION to opticalSarFusionTool
  test('4. Tool registry resolves opticalSarFusionTool for OPTICAL_SAR_FUSION intent', () => {
    const tool = getToolForIntent(INTENTS.OPTICAL_SAR_FUSION);
    assert(tool !== null);
    assert.strictEqual(tool.name, 'optical-sar-fusion-tool');
    assert.strictEqual(tool.task, INTENTS.OPTICAL_SAR_FUSION);
  });

  // Test 5: Compatibility Engine ABSTAINS when only 1 image is provided
  test('5. Compatibility Engine returns ABSTAIN when only 1 image provided for fusion', () => {
    const analysisRequest = {
      query: 'Fuse optical and SAR',
      inputs: [{ fileId: 'opt-1' }]
    };
    const intentResult = { name: INTENTS.OPTICAL_SAR_FUSION, confidence: 0.95 };
    const compat = evaluateCompatibility({ analysisRequest, intentResult });
    assert.strictEqual(compat.status, COMPATIBILITY_STATUS.ABSTAIN);
    assert.strictEqual(compat.compatible, false);
    assert(compat.reasons.some(r => r.includes('strictly two image inputs')));
  });

  // Test 6: Compatibility Engine READY when 2 images provided with spatial overlap
  test('6. Compatibility Engine returns READY when 2 images provided with spatial overlap', () => {
    const analysisRequest = {
      query: 'Fuse optical and SAR',
      inputs: [{ fileId: 'opt-1' }, { fileId: 'sar-1' }]
    };
    const intentResult = { name: INTENTS.OPTICAL_SAR_FUSION, confidence: 0.95 };
    const pairValidation = {
      compatible: true,
      checks: [
        { name: 'format', status: 'pass' },
        { name: 'dimensions', status: 'pass' },
        { name: 'crs', status: 'pass' },
        { name: 'bounds', status: 'pass' }
      ],
      fusionReadiness: { status: 'READY' }
    };
    const compat = evaluateCompatibility({ analysisRequest, intentResult, pairValidation });
    assert.strictEqual(compat.status, COMPATIBILITY_STATUS.READY);
    assert.strictEqual(compat.compatible, true);
  });

  // Test 7: Compatibility Engine ABSTAINS when bounds check fails (no spatial overlap)
  test('7. Compatibility Engine returns ABSTAIN when images have no spatial overlap', () => {
    const analysisRequest = {
      query: 'Fuse optical and SAR',
      inputs: [{ fileId: 'opt-1' }, { fileId: 'sar-1' }]
    };
    const intentResult = { name: INTENTS.OPTICAL_SAR_FUSION, confidence: 0.95 };
    const pairValidation = {
      compatible: false,
      checks: [
        { name: 'format', status: 'pass' },
        { name: 'bounds', status: 'fail' }
      ],
      fusionReadiness: { status: 'NOT_READY', reasons: ['No spatial overlap'] }
    };
    const compat = evaluateCompatibility({ analysisRequest, intentResult, pairValidation });
    assert.strictEqual(compat.status, COMPATIBILITY_STATUS.ABSTAIN);
    assert.strictEqual(compat.compatible, false);
    assert(compat.reasons.some(r => r.includes('spatial overlap')));
  });

  // Test 8: Execution Planner generates plan for OPTICAL_SAR_FUSION
  test('8. Execution Planner constructs valid plan for OPTICAL_SAR_FUSION', () => {
    const compatibilityResult = { status: COMPATIBILITY_STATUS.READY, compatible: true, warnings: [] };
    const intentResult = { name: INTENTS.OPTICAL_SAR_FUSION, confidence: 0.95 };
    const plan = buildExecutionPlan({ compatibilityResult, intentResult, imageCount: 2, query: 'Optical SAR analysis' });

    assert.strictEqual(plan.status, COMPATIBILITY_STATUS.READY);
    assert.strictEqual(plan.selectedIntent, INTENTS.OPTICAL_SAR_FUSION);
    assert.strictEqual(plan.selectedTools[0].name, 'optical-sar-fusion-tool');
    assert(plan.modelSelection !== null);
  });

  // Test 9: Specialist Tool execution returns structured findings and modality agreement
  await asyncTest('9. OpticalSarFusionTool executes and returns complete multimodal dossier', async () => {
    const context = {
      query: 'Use optical and SAR together to detect built-up and water features',
      imagePaths: ['uploads/mock_optical.tif', 'uploads/mock_sar.tif'],
      modelSelection: {
        selectedModel: { id: 'mock-fusion', name: 'Mock Fusion Engine', provider: 'mock' },
        isMock: true
      },
      inputs: [
        { fileId: 'opt-1', metadata: { sensor: 'Sentinel-2', bands: 4 } },
        { fileId: 'sar-1', metadata: { sensor: 'Sentinel-1', polarization: 'VV/VH' } }
      ]
    };

    const outcome = await opticalSarFusionTool.execute(context);
    assert.strictEqual(outcome.status, 'success');
    assert.strictEqual(outcome.task, INTENTS.OPTICAL_SAR_FUSION);
    assert(outcome.confidence >= 0.85);

    // Verify structured fields
    assert(Array.isArray(outcome.opticalFindings) && outcome.opticalFindings.length > 0, 'Missing optical findings');
    assert(Array.isArray(outcome.sarFindings) && outcome.sarFindings.length > 0, 'Missing SAR findings');
    assert(Array.isArray(outcome.fusionFindings) && outcome.fusionFindings.length > 0, 'Missing fusion findings');
    assert(Array.isArray(outcome.modalityAgreement) && outcome.modalityAgreement.length > 0, 'Missing modality agreement');
    assert(outcome.confidenceBreakdown !== null, 'Missing confidence breakdown');
    assert(outcome.confidenceBreakdown.overallConfidence > 0);
    assert(outcome.uncertaintyAnalysis !== null, 'Missing uncertainty analysis');
    assert(outcome.grounding !== null, 'Missing grounding regions');
  });

  // Test 10: Result Aggregator passes through fusion data
  test('10. Result Aggregator normalizes and preserves all fusion properties', () => {
    const rawTool = {
      task: INTENTS.OPTICAL_SAR_FUSION,
      answerText: 'Fusion complete',
      confidence: 0.91,
      opticalFindings: ['Opt 1', 'Opt 2'],
      sarFindings: ['SAR 1', 'SAR 2'],
      fusionFindings: ['Fused 1'],
      modalityAgreement: [{ region: 'R1', classification: 'OPTICAL + SAR AGREEMENT' }],
      confidenceBreakdown: { overallConfidence: 0.91, opticalEvidence: 0.93, sarEvidence: 0.89, crossModalAgreement: 0.90 },
      uncertaintyAnalysis: 'Low radar return on runway',
      status: 'success'
    };

    const aggregated = aggregateToolResult(rawTool);
    assert.strictEqual(aggregated.task, INTENTS.OPTICAL_SAR_FUSION);
    assert.strictEqual(aggregated.opticalFindings.length, 2);
    assert.strictEqual(aggregated.sarFindings.length, 2);
    assert.strictEqual(aggregated.fusionFindings.length, 1);
    assert.strictEqual(aggregated.modalityAgreement.length, 1);
    assert.strictEqual(aggregated.confidenceBreakdown.overallConfidence, 0.91);
    assert(aggregated.uncertaintyAnalysis.includes('runway'));
  });

  console.log('\n====================================================');
  console.log(`📊 FUSION TEST SUMMARY: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
})();
