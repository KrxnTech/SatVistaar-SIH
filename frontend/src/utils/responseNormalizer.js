/**
 * Response Normalizer & Clean-up Layer (Frontend Safety)
 * Converts raw backend response into a structured, reliable UI view model
 */

/**
 * Strips <think>...</think> and unclosed <think> blocks
 */
export function sanitizeThinkBlocks(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();

  // Closed <think>...</think>
  if (/<think>[\s\S]*?<\/think>/gi.test(cleaned)) {
    const parts = cleaned.split(/<\/think>/gi);
    const postThink = parts[parts.length - 1].trim();
    if (postThink.length > 0) {
      cleaned = postThink;
    } else {
      const preThink = cleaned.split(/<think>/gi)[0].trim();
      cleaned = preThink || '';
    }
  }

  // Unclosed <think> (no closing tag)
  if (/<think>/gi.test(cleaned) && !/<\/think>/gi.test(cleaned)) {
    const parts = cleaned.split(/<think>/gi);
    const preThink = parts[0].trim();
    cleaned = preThink || '';
  }

  // Strip <analysis> and <reasoning> tags
  cleaned = cleaned.replace(/<analysis>[\s\S]*?<\/analysis>/gi, '');
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');
  cleaned = cleaned.replace(/<analysis>[\s\S]*/gi, '');
  cleaned = cleaned.replace(/<reasoning>[\s\S]*/gi, '');

  return cleaned.trim();
}

/**
 * Normalizes bounding box coordinates to ensure 0.0 <= val <= 1.0
 */
export function normalizeRegionBox(region) {
  if (!region || typeof region !== 'object') return null;

  let x = parseFloat(region.x ?? region.left ?? 0);
  let y = parseFloat(region.y ?? region.top ?? 0);
  let width = parseFloat(region.width ?? region.w ?? 0.2);
  let height = parseFloat(region.height ?? region.h ?? 0.2);

  // If coordinates were in pixels (e.g. 0-1000 range), clamp or normalize
  if (x > 1.0 || y > 1.0 || width > 1.0 || height > 1.0) {
    if (x > 100 || y > 100) {
      // Assuming 1000x1000 basis
      x = x / 1000;
      y = y / 1000;
      width = width / 1000;
      height = height / 1000;
    } else {
      // Percentage basis 0-100
      x = x / 100;
      y = y / 100;
      width = width / 100;
      height = height / 100;
    }
  }

  // Safe clamping
  x = Math.max(0, Math.min(0.95, isNaN(x) ? 0 : x));
  y = Math.max(0, Math.min(0.95, isNaN(y) ? 0 : y));
  width = Math.max(0.02, Math.min(1.0 - x, isNaN(width) ? 0.2 : width));
  height = Math.max(0.02, Math.min(1.0 - y, isNaN(height) ? 0.2 : height));

  return {
    label: region.label || region.name || 'Detected Feature',
    x,
    y,
    width,
    height,
    confidence: typeof region.confidence === 'number' ? region.confidence : null
  };
}

/**
 * Main normalizer function
 * @param {object} rawResponse - Raw JSON from POST /api/analysis
 * @returns {object} Normalized view model
 */
export function normalizeAnalysisResponse(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return {
      isValid: false,
      error: 'Empty or invalid response received from backend.',
      raw: rawResponse
    };
  }

  // Unwrap envelope if present
  const data = rawResponse.data || rawResponse;
  const analysisRequest = data.analysisRequest || {};
  const intent = data.intent || {};
  const compatibility = data.compatibility || {};
  const executionPlan = data.executionPlan || {};
  const result = data.result || {};
  const trace = data.trace || {};
  const requestId = rawResponse.requestId || analysisRequest.requestId || trace.requestId || 'N/A';

  // Extract task and status
  const task = result.task || intent.name || 'VQA';
  const status = result.status || (compatibility.status === 'ABSTAIN' ? 'abstained' : 'success');

  // Sanitize answerText
  let answerText = result.answerText || '';
  answerText = sanitizeThinkBlocks(answerText);

  // If answerText is empty and status is ABSTAIN
  if (!answerText && compatibility.status === 'ABSTAIN') {
    const reasons = compatibility.reasons || [];
    answerText = reasons.length > 0 
      ? `Analysis abstained: ${reasons.join(' ')}` 
      : 'Analysis could not proceed because the input requirements were not met.';
  } else if (!answerText) {
    answerText = 'No analysis response was returned by the VLM.';
  }

  // Normalize Grounding regions if present
  let grounding = null;
  const rawGrounding = result.grounding || null;
  if (rawGrounding && Array.isArray(rawGrounding.regions) && rawGrounding.regions.length > 0) {
    const validRegions = rawGrounding.regions
      .map(normalizeRegionBox)
      .filter(Boolean);

    grounding = {
      type: rawGrounding.type || 'approximate',
      isMock: Boolean(rawGrounding.isMock),
      regions: validRegions
    };
  }

  // Collect warnings
  const warnings = [
    ...(result.warnings || []),
    ...(compatibility.warnings || []),
    ...(executionPlan.warnings || [])
  ].filter((w, idx, self) => typeof w === 'string' && w.trim().length > 0 && self.indexOf(w) === idx);

  // Calculate latency
  const durationMs = trace.durationMs ?? (trace.endedAt && trace.startedAt 
    ? Math.max(0, new Date(trace.endedAt).getTime() - new Date(trace.startedAt).getTime()) 
    : null);

  const formattedLatency = durationMs !== null 
    ? `${(durationMs / 1000).toFixed(2)}s` 
    : 'N/A';

  return {
    isValid: true,
    requestId,
    task,
    status,
    answerText,
    provider: result.provider || executionPlan.modelSelection?.selectedModel?.provider || 'groq',
    modelName: result.modelName || executionPlan.modelSelection?.selectedModel?.name || 'VLM',
    modelVersion: result.modelVersion || executionPlan.modelSelection?.selectedModel?.model || 'N/A',
    confidence: typeof result.confidence === 'number' ? `${Math.round(result.confidence * 100)}%` : null,
    latency: formattedLatency,
    durationMs,
    grounding,
    evidence: result.evidence || [],
    warnings,
    compatibility: {
      status: compatibility.status || 'READY',
      compatible: compatibility.compatible ?? true,
      requirements: compatibility.requirements || {}
    },
    intent: {
      name: intent.name || task,
      confidence: typeof intent.confidence === 'number' ? intent.confidence : null,
      reason: intent.reason || ''
    },
    trace: {
      events: trace.events || [],
      finalStatus: trace.finalStatus || status
    },
    inputs: analysisRequest.inputs || [],
    raw: rawResponse
  };
}

export default normalizeAnalysisResponse;
