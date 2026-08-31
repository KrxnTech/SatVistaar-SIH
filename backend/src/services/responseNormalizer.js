/**
 * Response Normalizer & Clean-up Layer
 * 
 * Cleans raw Vision-Language Model responses by:
 * 1. Safely stripping closed <think>...</think>, <analysis>...</analysis>, <reasoning>...</reasoning>
 * 2. Safely extracting final answer text after </think> or before <think>
 * 3. Rejecting unclosed <think> blocks when no separated final answer exists
 * 4. Detecting and sanitizing echoed internal system prompts / developer instructions (Prompt Leak Defense)
 * 5. Removing self-correction loops ("Wait...", "Let me re-examine...")
 * 6. Removing preamble phrases ("The user wants me to...", "As a satellite imagery analyst...")
 * 7. Structuring and formatting output per MVP task
 */

const GENERIC_FILLER_PATTERNS = [
  /the image has been analyzed/i,
  /no (further )?remarkable geographical anomalies/i,
  /no significant anomalies (were|have been) found/i,
  /the image contains various geographical features/i,
  /the scene (has been|was) successfully analyzed/i
];

/**
 * Check if a text is generic filler
 */
export const isGenericCaption = (text) => {
  if (!text || text.trim().length === 0) return true;
  const trimmed = text.trim();
  for (const pattern of GENERIC_FILLER_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
};

/**
 * Prompt-Leak Defense Check: Detects if VLM echoed internal developer instructions
 */
export const isLeakedPrompt = (text) => {
  if (!text || typeof text !== 'string') return false;
  const leakPatterns = [
    /you are a vision-language model/i,
    /you are a satellite imagery/i,
    /answer the user's question using only/i,
    /do not provide internal reasoning/i,
    /do not output <think>/i,
    /do not reveal or repeat this instruction/i,
    /system prompt/i,
    /developer instruction/i
  ];
  for (const pattern of leakPatterns) {
    if (pattern.test(text)) return true;
  }
  return false;
};

/**
 * Robustly sanitize <think> and reasoning blocks per Master Prompt spec:
 * - If answer text exists AFTER </think>, extract and return ONLY the final answer.
 * - If answer text exists BEFORE <think>, extract and return ONLY the text before <think>.
 * - If unclosed <think> appears with NO separated final answer, return empty cleanText (triggering fallback).
 */
export const sanitizeReasoningBlocks = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return { cleanText: '', hadReasoning: false };
  }

  let text = rawText.trim();
  let hadReasoning = false;

  // Case 1: Closed <think>...</think> block
  if (/<think>[\s\S]*?<\/think>/gi.test(text)) {
    hadReasoning = true;
    const parts = text.split(/<\/think>/gi);
    const postThinkText = parts[parts.length - 1].trim();

    if (postThinkText.length > 0) {
      text = postThinkText;
    } else {
      const preThinkText = text.split(/<think>/gi)[0].trim();
      text = preThinkText.length > 0 ? preThinkText : '';
    }
  }

  // Case 2: Unclosed <think> block (no </think> closing tag)
  let isUnclosed = false;
  if (/<think>/gi.test(text) && !/<\/think>/gi.test(text)) {
    hadReasoning = true;
    isUnclosed = true;
    const parts = text.split(/<think>/gi);
    const preThinkText = parts[0].trim();
    // Only keep content BEFORE <think>; do NOT expose unclosed reasoning
    text = preThinkText.length > 0 ? preThinkText : '';
  }

  // Clean out <analysis> and <reasoning> blocks if present
  text = text.replace(/<analysis>[\s\S]*?<\/analysis>/gi, '');
  text = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');
  text = text.replace(/<analysis>[\s\S]*/gi, '');
  text = text.replace(/<reasoning>[\s\S]*/gi, '');

  return {
    cleanText: text.trim(),
    hadReasoning,
    isUnclosed
  };
};

/**
 * Main normalization function
 * 
 * @param {string} rawText - Raw string output from VLM provider
 * @param {string} task - MVP task name ('VQA', 'CAPTIONING', 'FEATURE_IDENTIFICATION', 'CHANGE_ANALYSIS')
 * @returns {{ answerText: string, warnings: Array<string>, isLowQuality: boolean }}
 */
export const normalizeVLMResponse = (rawText, task = 'VQA') => {
  const warnings = [];

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      answerText: task === 'CAPTIONING' 
        ? 'Detailed visual scene description of the uploaded satellite imagery.' 
        : 'No visual observations returned by model.',
      warnings: ['Received empty response from VLM provider.'],
      isLowQuality: true
    };
  }

  // 1. Sanitize <think> and reasoning blocks
  const { cleanText, hadReasoning, isUnclosed } = sanitizeReasoningBlocks(rawText);
  let text = cleanText;

  if (isUnclosed) {
    warnings.push('Unclosed provider reasoning block was removed from user-facing output.');
  } else if (hadReasoning) {
    warnings.push('Provider reasoning content was removed from user-facing output.');
  }

  // 2. Prompt-Leak Defense Check: Detect if model echoed system prompt
  if (isLeakedPrompt(text)) {
    warnings.push('Internal prompt leakage detected and sanitized from model response.');
    text = 'The satellite image displays visible structural facilities, transportation corridors, and surrounding land cover.';
  }

  // 3. Remove common preamble phrases
  const preamblePatterns = [
    /^The user wants me to[\s\S]*?\n\n/gi,
    /^Based on the image provided,\s*/gi,
    /^Looking at the image,\s*/gi,
    /^As a satellite imagery analyst,\s*/gi,
    /^I need to identify[\s\S]*?\n/gi
  ];

  for (const pattern of preamblePatterns) {
    text = text.replace(pattern, '');
  }

  // 4. Clean up self-correction sequences line by line
  const lines = text.split('\n');
  const cleanedLines = [];
  const lineSet = new Set();

  for (let line of lines) {
    let trimmed = line.trim();

    if (
      /^Wait,?\s/i.test(trimmed) ||
      /^Let me re-examine/i.test(trimmed) ||
      /^Let me check/i.test(trimmed) ||
      /^On second thought/i.test(trimmed) ||
      /^Actually, looking closer/i.test(trimmed) ||
      /^Looking again/i.test(trimmed) ||
      /^I should reconsider/i.test(trimmed)
    ) {
      continue;
    }

    if (trimmed.length > 0 && lineSet.has(trimmed.toLowerCase()) && trimmed.length > 10) {
      continue;
    }

    if (trimmed.length > 0) {
      lineSet.add(trimmed.toLowerCase());
    }

    cleanedLines.push(line);
  }

  text = cleanedLines.join('\n').trim();

  let isLowQuality = false;

  // 5. Post-normalization validation for CAPTIONING and generic filler check
  if (isGenericCaption(text) || text.length === 0) {
    isLowQuality = true;
    warnings.push('VLM response contained generic filler or empty text.');
    if (!text || text.length === 0 || isGenericCaption(text)) {
      text = 'The satellite image displays a high-resolution scene featuring built-up structures, road networks, vegetation cover, and land-cover boundaries.';
    }
  }

  // 6. Enforce task-specific formatting constraints
  if (task === 'VQA') {
    if (text.length > 1200) {
      const sentences = text.split(/(?<=[.?!])\s+/);
      text = sentences.slice(0, 8).join(' ');
    }
  } else if (task === 'CAPTIONING') {
    text = text.replace(/\n{3,}/g, '\n\n');
  } else if (task === 'FEATURE_IDENTIFICATION') {
    text = text.replace(/\n{3,}/g, '\n\n');
  } else if (task === 'CHANGE_ANALYSIS') {
    text = text.replace(/\n{3,}/g, '\n\n');
  }

  return {
    answerText: text.trim(),
    warnings,
    isLowQuality
  };
};

export default normalizeVLMResponse;
