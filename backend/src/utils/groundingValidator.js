/**
 * Visual Grounding Region Validator & Parser
 * 
 * Safely parses, validates, and clamps normalized 0..1 bounding regions for Visual Grounding.
 */

/**
 * Validates and clamps an array of raw grounding region objects
 * 
 * @param {Array<object>} rawRegions - Raw region objects from VLM or parser
 * @param {number} [maxRegions=10] - Maximum allowed regions
 * @returns {Array<{ label: string, x: number, y: number, width: number, height: number, confidence: number|null }>}
 */
export const validateGroundingRegions = (rawRegions, maxRegions = 10) => {
  if (!rawRegions || !Array.isArray(rawRegions) || rawRegions.length === 0) {
    return [];
  }

  const validRegions = [];

  for (const raw of rawRegions) {
    if (!raw || typeof raw !== 'object') continue;

    let x = parseFloat(raw.x);
    let y = parseFloat(raw.y);
    let width = parseFloat(raw.width);
    let height = parseFloat(raw.height);

    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      continue;
    }

    // Safe Clamping between 0 and 1
    x = Math.max(0, Math.min(x, 1));
    y = Math.max(0, Math.min(y, 1));

    // Ensure width and height remain within image boundaries
    width = Math.max(0.02, Math.min(width, 1 - x));
    height = Math.max(0.02, Math.min(height, 1 - y));

    let confidence = null;
    if (raw.confidence !== undefined && raw.confidence !== null) {
      const confNum = parseFloat(raw.confidence);
      if (!isNaN(confNum) && confNum >= 0 && confNum <= 1) {
        confidence = Math.round(confNum * 100) / 100;
      }
    }

    const label = (raw.label && typeof raw.label === 'string') 
      ? raw.label.trim().substring(0, 50) 
      : 'Feature';

    validRegions.push({
      label,
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      width: Math.round(width * 1000) / 1000,
      height: Math.round(height * 1000) / 1000,
      confidence
    });

    if (validRegions.length >= maxRegions) break;
  }

  return validRegions;
};

/**
 * Extracts structured JSON regions from VLM response text if present
 * 
 * @param {string} text - Raw output string
 * @returns {{ cleanText: string, regions: Array<object> }}
 */
export const extractGroundingFromText = (text) => {
  if (!text || typeof text !== 'string') {
    return { cleanText: '', regions: [] };
  }

  let cleanText = text;
  let rawRegions = [];

  // Try extracting JSON code block containing regions
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match;

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.regions && Array.isArray(parsed.regions)) {
        rawRegions = parsed.regions;
        if (parsed.answer && typeof parsed.answer === 'string') {
          cleanText = parsed.answer;
        }
        break;
      } else if (Array.isArray(parsed) && parsed[0]?.x !== undefined) {
        rawRegions = parsed;
        break;
      }
    } catch (e) {
      // Non-JSON code block, ignore
    }
  }

  // If no regions found in code block, search for JSON object inline
  if (rawRegions.length === 0) {
    const inlineJsonRegex = /\{\s*"answer"[\s\S]*?"regions"\s*:\s*\[[\s\S]*?\]\s*\}/gi;
    const inlineMatch = inlineJsonRegex.exec(text);
    if (inlineMatch) {
      try {
        const parsed = JSON.parse(inlineMatch[0]);
        if (parsed.regions && Array.isArray(parsed.regions)) {
          rawRegions = parsed.regions;
          if (parsed.answer) cleanText = parsed.answer;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Clean out raw JSON code blocks from final answer text
  cleanText = cleanText.replace(/```(?:json)?\s*[\s\S]*?\s*```/gi, '').trim();

  const validatedRegions = validateGroundingRegions(rawRegions);

  return {
    cleanText,
    regions: validatedRegions
  };
};

export default {
  validateGroundingRegions,
  extractGroundingFromText
};
