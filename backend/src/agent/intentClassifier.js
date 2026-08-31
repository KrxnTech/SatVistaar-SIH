import { INTENTS } from './intents.js';

/**
 * Task / Intent Classification Engine for SatQuery AI First-Round MVP
 * DECISION 1: "What does the user want?"
 * 
 * @param {object} params
 * @param {string} params.query - Natural language user query
 * @param {Array<object>} params.inputs - Resolved input files with metadata
 * @param {string|null} [params.requestedTask=null] - Optional user requested task override
 * @param {boolean} [params.benchmarkMode=false] - Optional benchmark evaluation flag
 * @returns {{ intent: string, confidence: number, reason: string, warnings: Array<string> }}
 */
export const classifyIntent = ({ query, inputs = [], requestedTask = null, benchmarkMode = false }) => {
  const normalizedQuery = (query || '').toLowerCase().trim();
  const warnings = [];

  // If explicit requestedTask is provided and valid, honor it
  if (requestedTask && Object.values(INTENTS).includes(requestedTask)) {
    return {
      intent: requestedTask,
      confidence: 1.0,
      reason: `User explicitly specified requested task '${requestedTask}'.`,
      warnings
    };
  }

  let selectedIntent = null;
  let confidence = 0.0;
  let reason = '';

  // 1. CHANGE_ANALYSIS Pattern Match
  const changePatterns = [
    'what changed', 'show change', 'show changes', 'detect change', 'changed region',
    'difference between', 'changes between', 'compare', 'increased', 'decreased',
    'growth between', 'reduction between', 'before and after', 'second image'
  ];
  const isChangeQuery = changePatterns.some(pattern => normalizedQuery.includes(pattern));

  if (isChangeQuery || (inputs.length > 1 && (normalizedQuery.includes('change') || normalizedQuery.includes('between')))) {
    selectedIntent = INTENTS.CHANGE_ANALYSIS;
    confidence = 0.92;
    reason = 'The query requests Vision-Language based temporal visual change analysis across images.';
  }

  // 2. FEATURE_IDENTIFICATION Pattern Match
  if (!selectedIntent) {
    const featurePatterns = [
      'identify', 'locate', 'where is', 'where are', 'find the', 'point out',
      'highlight', 'detect', 'buildings', 'water bodies', 'water body', 'roads',
      'vegetation', 'agricultural', 'features', 'objects'
    ];
    if (featurePatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.FEATURE_IDENTIFICATION;
      confidence = 0.91;
      reason = 'The query requests feature or object visual identification / approximate grounding.';
    }
  }

  // 3. CAPTIONING Pattern Match
  if (!selectedIntent) {
    const captionPatterns = [
      'describe', 'caption', 'summarize', 'description of', 'summary of',
      'what does this scene look like', 'overview of'
    ];
    if (captionPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.CAPTIONING;
      confidence = 0.90;
      reason = 'The query requests a descriptive summary or scene description of the image.';
    }
  }

  // 4. VQA Pattern Match
  if (!selectedIntent) {
    const vqaPatterns = [
      'what is', 'is there', 'are there', 'how many', 'what type of',
      'can you see', 'does this', 'what color', 'is this', 'visible'
    ];
    if (vqaPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.VQA;
      confidence = 0.88;
      reason = 'The query asks a general visual question about image content.';
    }
  }

  // 5. Default Fallback / Out-of-scope intent detection
  if (!selectedIntent) {
    selectedIntent = INTENTS.UNKNOWN;
    confidence = 0.0;
    reason = 'Unable to classify task from query syntax or query requests unsupported specialized scientific analytics.';
    warnings.push('Query task is unclassified or out of MVP scope.');
  }

  // Input Warnings
  if (inputs.length === 1 && selectedIntent === INTENTS.CHANGE_ANALYSIS) {
    warnings.push('Change analysis queries require two image inputs.');
  }

  return {
    intent: selectedIntent,
    confidence,
    reason,
    warnings
  };
};

export default classifyIntent;
