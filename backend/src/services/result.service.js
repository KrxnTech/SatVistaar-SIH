/**
 * Result Aggregator Service: Aggregates and normalizes specialist VLM tool results for API response
 * 
 * Normalized ToolResult schema:
 * {
 *   task: "VQA",
 *   answerText: "...",
 *   confidence: null,
 *   evidence: [],
 *   modelName: "...",
 *   modelVersion: "...",
 *   provider: "groq",
 *   parametersUsed: {},
 *   warnings: [],
 *   status: "success"
 * }
 */
export const aggregateToolResult = (toolResult) => {
  if (!toolResult) {
    return null;
  }

  return {
    task: toolResult.task || 'UNKNOWN',
    answerText: toolResult.answerText || null,
    confidence: typeof toolResult.confidence === 'number' ? toolResult.confidence : null,
    grounding: toolResult.grounding || null,
    evidence: Array.isArray(toolResult.evidence) ? toolResult.evidence : [],
    modelName: toolResult.modelName || 'unknown-model',
    modelVersion: toolResult.modelVersion || '1.0.0',
    provider: toolResult.provider || 'unknown',
    parametersUsed: toolResult.parametersUsed || {},
    warnings: Array.isArray(toolResult.warnings) ? toolResult.warnings : [],
    status: toolResult.status || 'success'
  };
};

export default {
  aggregateToolResult
};
