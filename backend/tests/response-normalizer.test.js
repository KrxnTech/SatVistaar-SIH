import assert from 'assert';
import { normalizeVLMResponse } from '../src/services/responseNormalizer.js';

console.log('====================================================');
console.log('🚀 SATVISTAAR VLM RESPONSE NORMALIZER COMPREHENSIVE TEST SUITE');
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

// TEST 1: Closed <think> block
test('TEST 1: Closed <think> block', () => {
  const raw = `<think>\ninternal reasoning...\n</think>\n\nThe image shows a large stadium with a parking structure.`;
  const res = normalizeVLMResponse(raw, 'VQA');
  assert(!res.answerText.includes('<think>'));
  assert.strictEqual(res.answerText, 'The image shows a large stadium with a parking structure.');
});

// TEST 2: Unclosed <think> block after valid answer
test('TEST 2: Unclosed <think> block after valid answer', () => {
  const raw = `The image shows an airport terminal.\n<think>\nLet me inspect further...\nNo closing tag`;
  const res = normalizeVLMResponse(raw, 'CAPTIONING');
  assert(!res.answerText.includes('<think>'));
  assert(!res.answerText.includes('Let me inspect'));
  assert.strictEqual(res.answerText, 'The image shows an airport terminal.');
  assert(res.warnings.some(w => w.includes('Unclosed provider reasoning block')));
});

// TEST 3: Unclosed <think> with NO answer before it
test('TEST 3: Unclosed <think> with NO answer before it', () => {
  const raw = `<think>\nLet me inspect the image...\nI should reconsider...`;
  const res = normalizeVLMResponse(raw, 'CAPTIONING');
  assert(!res.answerText.includes('<think>'));
  assert(res.isLowQuality);
  assert(res.answerText.length > 0); // Safe fallback text returned
});

// TEST 4: Closed <analysis> block
test('TEST 4: Closed <analysis> block', () => {
  const raw = `<analysis>\nInternal evaluation...\n</analysis>\nVisible buildings in central zone.`;
  const res = normalizeVLMResponse(raw, 'FEATURE_IDENTIFICATION');
  assert(!res.answerText.includes('<analysis>'));
  assert.strictEqual(res.answerText, 'Visible buildings in central zone.');
});

// TEST 5: Normal text containing word "actually"
test('TEST 5: Normal text containing word "actually"', () => {
  const raw = `The central field actually contains an athletic track.`;
  const res = normalizeVLMResponse(raw, 'VQA');
  assert.strictEqual(res.answerText, raw);
});

// TEST 6: Normal caption
test('TEST 6: Normal caption', () => {
  const raw = `High-resolution aerial view of a harbor facility with container docks and anchored ships.`;
  const res = normalizeVLMResponse(raw, 'CAPTIONING');
  assert.strictEqual(res.answerText, raw);
  assert.strictEqual(res.isLowQuality, false);
});

// TEST 7: Generic caption
test('TEST 7: Generic caption detected as low quality', () => {
  const raw = `The image has been analyzed. No further remarkable geographical anomalies detected.`;
  const res = normalizeVLMResponse(raw, 'CAPTIONING');
  assert.strictEqual(res.isLowQuality, true);
  assert(res.warnings.some(w => w.includes('generic filler')));
});

// TEST 8: Repeated paragraphs
test('TEST 8: Repeated paragraphs deduplicated', () => {
  const raw = `Runway parallel to coastline.\nRunway parallel to coastline.`;
  const res = normalizeVLMResponse(raw, 'CAPTIONING');
  assert.strictEqual(res.answerText, 'Runway parallel to coastline.');
});

// TEST 9: VQA response
test('TEST 9: VQA response clean', () => {
  const raw = `Yes, several large commercial buildings are visible near the intersection.`;
  const res = normalizeVLMResponse(raw, 'VQA');
  assert.strictEqual(res.answerText, raw);
});

// TEST 10: Feature identification response
test('TEST 10: Feature identification response clean', () => {
  const raw = `- Water: River along the west border.\n- Buildings: Urban core in the south.`;
  const res = normalizeVLMResponse(raw, 'FEATURE_IDENTIFICATION');
  assert.strictEqual(res.answerText, raw);
});

// TEST 11: Change analysis response
test('TEST 11: Change analysis response clean', () => {
  const raw = `Observed changes:\n- Image B shows site clearing in northern sector.`;
  const res = normalizeVLMResponse(raw, 'CHANGE_ANALYSIS');
  assert.strictEqual(res.answerText, raw);
});

console.log('\n====================================================');
console.log(`📊 TEST SUMMARY: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
console.log('====================================================\n');

if (passed !== total) {
  process.exit(1);
}
