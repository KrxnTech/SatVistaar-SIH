import { VALID_REQUESTED_TASKS } from '../agent/intents.js';
import classifyIntent from '../agent/intentClassifier.js';
import evaluateCompatibility, { COMPATIBILITY_STATUS } from '../agent/compatibilityEngine.js';
import buildExecutionPlan from '../agent/executionPlanner.js';
import executePlanTools from '../agent/toolExecutor.js';
import ExecutionTraceBuilder from '../agent/executionTrace.js';
import { aggregateToolResult } from './result.service.js';
import resolveStoredFile from '../utils/fileResolver.js';
import { extractImageMetadata } from './preprocessing.service.js';
import { validateImagePair } from './pairValidation.service.js';

/**
 * Validates raw incoming analysis request parameters
 */
const validateAnalysisInput = ({ query, fileIds, requestedTask, benchmarkMode }) => {
  // Query Validation
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    const err = new Error('Query parameter is required and must be a non-empty string.');
    err.code = 'INVALID_QUERY';
    err.statusCode = 400;
    throw err;
  }

  if (query.trim().length > 1000) {
    const err = new Error('Query parameter exceeds maximum length of 1000 characters.');
    err.code = 'QUERY_TOO_LONG';
    err.statusCode = 400;
    throw err;
  }

  // File IDs Validation
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    const err = new Error('fileIds parameter is required and must be a non-empty array of 1 or 2 file IDs.');
    err.code = 'INVALID_FILE_IDS';
    err.statusCode = 400;
    throw err;
  }

  if (fileIds.length > 2) {
    const err = new Error('Maximum of 2 image file IDs allowed per analysis request.');
    err.code = 'TOO_MANY_FILE_IDS';
    err.statusCode = 400;
    throw err;
  }

  for (const id of fileIds) {
    if (!id || typeof id !== 'string') {
      const err = new Error('Every fileId in the fileIds array must be a valid string.');
      err.code = 'INVALID_FILE_ID';
      err.statusCode = 400;
      throw err;
    }
  }

  // Requested Task Validation
  if (requestedTask !== undefined && requestedTask !== null) {
    if (!VALID_REQUESTED_TASKS.includes(requestedTask)) {
      const err = new Error(`Requested task '${requestedTask}' is invalid. Allowed: ${VALID_REQUESTED_TASKS.join(', ')}`);
      err.code = 'INVALID_REQUESTED_TASK';
      err.statusCode = 400;
      throw err;
    }
  }

  // Benchmark Mode Validation
  if (benchmarkMode !== undefined && benchmarkMode !== null && typeof benchmarkMode !== 'boolean') {
    const err = new Error('benchmarkMode must be a boolean value.');
    err.code = 'INVALID_BENCHMARK_MODE';
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Service processing analysis request through the full VLM-backed lifecycle:
 * 1. Request validation & stored file path resolution
 * 2. Preprocessing metadata extraction & pair validation
 * 3. Task / Intent classification
 * 4. Agentic compatibility evaluation
 * 5. Model Router selection (Groq / Ollama / Mock)
 * 6. VLM Tool execution
 * 7. Execution Trace generation & Result aggregation
 * 
 * @param {object} rawParams - Request parameters
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<object>} Complete analysis payload
 */
export const processAnalysisRequest = async (rawParams, requestId) => {
  const traceBuilder = new ExecutionTraceBuilder(requestId);
  const { query, fileIds, requestedTask = null, benchmarkMode = false, timestamps = [] } = rawParams || {};

  // 1. Validate parameters
  validateAnalysisInput({ query, fileIds, requestedTask, benchmarkMode });

  // 2. Resolve file IDs to trusted stored file paths and gather metadata
  const resolvedInputs = [];

  for (let idx = 0; idx < fileIds.length; idx++) {
    const fileId = fileIds[idx];
    const resolved = resolveStoredFile(fileId);
    if (!resolved.valid) {
      const err = new Error(resolved.error.message);
      err.code = resolved.error.code;
      err.statusCode = resolved.error.statusCode;
      throw err;
    }

    let metadata = null;
    try {
      const metaResult = await extractImageMetadata(fileId);
      metadata = metaResult.metadata || metaResult;
    } catch (metaErr) {
      metadata = {
        fileId,
        isGeoreferenced: false,
        warnings: ['Geospatial metadata extraction unavailable at analysis request time.']
      };
    }

    // Attach provided custom/bi-temporal timestamp if present
    if (timestamps && timestamps[idx]) {
      metadata.timestamp = timestamps[idx];
    }

    resolvedInputs.push({
      fileId,
      path: resolved.absolutePath,
      metadata
    });
  }

  // Gather pair validation metadata if 2 images are provided
  let pairValidation = null;
  if (fileIds.length === 2) {
    try {
      pairValidation = await validateImagePair(fileIds, timestamps);
    } catch (pairErr) {
      pairValidation = {
        compatible: false,
        checks: [
          { name: 'dimensions', status: 'warning', message: 'Pair validation unavailable' }
        ]
      };
    }
  }

  // 3. Construct AnalysisRequest contract object
  const analysisRequest = {
    requestId: requestId || null,
    query: query.trim(),
    inputs: resolvedInputs.map(i => ({ fileId: i.fileId, metadata: i.metadata })),
    requestedTask: requestedTask || null,
    benchmarkMode: Boolean(benchmarkMode)
  };

  // 4. Intent Classification
  const classification = classifyIntent({
    query: analysisRequest.query,
    inputs: analysisRequest.inputs,
    requestedTask: analysisRequest.requestedTask,
    benchmarkMode: analysisRequest.benchmarkMode
  });

  const intentResult = {
    name: classification.intent,
    confidence: classification.confidence,
    reason: classification.reason,
    warnings: classification.warnings
  };

  traceBuilder.addEvent('INTENT_SELECTED', { intent: intentResult.name, confidence: intentResult.confidence });

  // 5. Compatibility Engine
  const compatibilityResult = evaluateCompatibility({
    analysisRequest,
    intentResult,
    pairValidation
  });

  traceBuilder.addEvent('COMPATIBILITY_CHECKED', { status: compatibilityResult.status, compatible: compatibilityResult.compatible });

  // 6. Execution Planning & Model Router Selection
  const executionPlan = buildExecutionPlan({
    compatibilityResult,
    intentResult,
    imageCount: fileIds.length,
    query: analysisRequest.query
  });

  if (executionPlan.modelSelection?.selectedModel) {
    traceBuilder.addEvent('MODEL_ROUTED', {
      selectedModel: executionPlan.modelSelection.selectedModel.name,
      provider: executionPlan.modelSelection.selectedModel.provider,
      reason: executionPlan.modelSelection.reason
    });
  }

  // 7. Tool Execution & Result Aggregation
  let rawToolResult = null;
  let executionMeta = null;

  if (compatibilityResult.status === COMPATIBILITY_STATUS.READY) {
    traceBuilder.addEvent('TOOL_STARTED', { intent: intentResult.name });

    const imagePaths = resolvedInputs.map(i => i.path).filter(Boolean);

    const executionOutcome = await executePlanTools({
      executionPlan,
      analysisContext: {
        requestId,
        query: analysisRequest.query,
        fileIds,
        imagePaths,
        inputs: analysisRequest.inputs,
        intent: intentResult
      }
    });

    rawToolResult = executionOutcome.toolResult;
    executionMeta = executionOutcome.executionMeta;

    traceBuilder.addEvent('TOOL_COMPLETED', {
      toolName: executionMeta?.toolName,
      status: rawToolResult?.status,
      durationMs: executionMeta?.durationMs
    });
  }

  // 8. Result Aggregation & Trace Generation
  const result = aggregateToolResult(rawToolResult);
  const trace = traceBuilder.buildTrace({
    selectedIntent: intentResult.name,
    compatibilityResult,
    executionMeta,
    toolResult: rawToolResult
  });

  return {
    analysisRequest,
    intent: intentResult,
    compatibility: compatibilityResult,
    executionPlan,
    result,
    trace
  };
};

export default {
  processAnalysisRequest
};
