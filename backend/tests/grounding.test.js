import assert from 'assert';
import { validateGroundingRegions, extractGroundingFromText } from '../src/utils/groundingValidator.js';
import featureIdentificationTool from '../src/tools/featureIdentification.tool.js';

console.log('====================================================');
console.log('🚀 SATVISTAAR VISUAL GROUNDING REGION TEST SUITE');
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

// TEST 1: One valid grounding region
test('TEST 1: One valid grounding region', () => {
  const input = [{ label: 'water', x: 0.15, y: 0.45, width: 0.25, height: 0.20, confidence: 0.85 }];
  const valid = validateGroundingRegions(input);
  assert.strictEqual(valid.length, 1);
  assert.strictEqual(valid[0].label, 'water');
  assert.strictEqual(valid[0].x, 0.15);
  assert.strictEqual(valid[0].confidence, 0.85);
});

// TEST 2: Multiple valid grounding regions
test('TEST 2: Multiple valid grounding regions', () => {
  const input = [
    { label: 'building', x: 0.1, y: 0.2, width: 0.15, height: 0.15, confidence: 0.9 },
    { label: 'building', x: 0.6, y: 0.5, width: 0.20, height: 0.20, confidence: 0.88 }
  ];
  const valid = validateGroundingRegions(input);
  assert.strictEqual(valid.length, 2);
});

// TEST 3: Empty / No grounding regions
test('TEST 3: Empty / No grounding regions', () => {
  const valid = validateGroundingRegions([]);
  assert.strictEqual(valid.length, 0);
});

// TEST 4: Invalid coordinates (NaN / non-numeric discarded)
test('TEST 4: Invalid coordinates discarded', () => {
  const input = [{ label: 'bad', x: 'invalid', y: 0.5, width: 0.2, height: 0.2 }];
  const valid = validateGroundingRegions(input);
  assert.strictEqual(valid.length, 0);
});

// TEST 5: Coordinates outside 0-1 safely clamped
test('TEST 5: Coordinates outside 0-1 safely clamped', () => {
  const input = [{ label: 'oversized', x: -0.1, y: 0.8, width: 0.5, height: 0.5 }];
  const valid = validateGroundingRegions(input);
  assert.strictEqual(valid.length, 1);
  assert.strictEqual(valid[0].x, 0);
  assert.strictEqual(valid[0].height, 0.2); // Clamped so y + height <= 1 (0.8 + 0.2 = 1.0)
});

// TEST 6: Missing confidence handled
test('TEST 6: Missing confidence handled without crashing', () => {
  const input = [{ label: 'road', x: 0.2, y: 0.2, width: 0.3, height: 0.3 }];
  const valid = validateGroundingRegions(input);
  assert.strictEqual(valid.length, 1);
  assert.strictEqual(valid[0].confidence, null);
});

// TEST 7: Extract JSON grounding from VLM text
test('TEST 7: Extract JSON grounding from VLM response text', () => {
  const rawText = `Water appears in the lower left section.\n\`\`\`json\n{\n  "answer": "Water is visible along the shoreline.",\n  "regions": [\n    { "label": "water", "x": 0.12, "y": 0.5, "width": 0.3, "height": 0.4, "confidence": 0.91 }\n  ]\n}\n\`\`\``;
  const extracted = extractGroundingFromText(rawText);
  assert.strictEqual(extracted.cleanText, 'Water is visible along the shoreline.');
  assert.strictEqual(extracted.regions.length, 1);
  assert.strictEqual(extracted.regions[0].confidence, 0.91);
});

// TEST 8: Mock Feature Identification tool execution
test('TEST 8: Mock Feature Identification tool returns grounding regions', async () => {
  const result = await featureIdentificationTool.execute({
    query: 'Where is water?',
    imagePaths: ['uploads/sample.jpg'],
    modelSelection: { isMock: true }
  });
  assert.strictEqual(result.status, 'success');
  assert(result.grounding);
  assert.strictEqual(result.grounding.isMock, true);
  assert(result.grounding.regions.length > 0);
});

console.log('\n====================================================');
console.log(`📊 GROUNDING TEST SUMMARY: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
console.log('====================================================\n');

if (passed !== total) {
  process.exit(1);
}
