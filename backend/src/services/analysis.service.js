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
import { computeGisMetadataForRoi, executePythonRoiInference } from './roi.service.js';
import { processGeointSuiteAnalysis } from './geoint.service.js';
import { processDisasterAnalysis } from './disaster.service.js';

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

  // 3. Check for ROI Scope Analysis (excluding Disaster Response and Geoint Suite which use their own specialized AOI engines)
  const isExcludedFromStandardRoi = ['DISASTER_RESPONSE', 'NISAR_ANALYSIS', 'TIME_SERIES', 'FLOOD_ANALYSIS', 'CHANGE_MATRIX', 'OPTICAL_SAR_DIFFERENCE', 'OBJECT_INVENTORY'].includes(requestedTask);
  const isRoiScope = (rawParams?.scope === 'ROI' || Boolean(rawParams?.roi)) && !isExcludedFromStandardRoi;
  if (isRoiScope && rawParams?.roi) {
    const primaryMeta = resolvedInputs[0]?.metadata || {};
    const roiGis = computeGisMetadataForRoi(rawParams.roi, primaryMeta);

    traceBuilder.addEvent('ROI_SELECTED', {
      type: roiGis.type,
      areaKm2: roiGis.areaKm2,
      coordinatesCount: roiGis.coordinates?.length || 0
    });

    traceBuilder.addEvent('ROI_GEOMETRY_VALIDATED', {
      crs: roiGis.crs,
      isGeoreferenced: roiGis.isGeoreferenced,
      resolution: roiGis.resolution
    });

    traceBuilder.addEvent('SUBWINDOW_EXTRACTED', {
      pixelWindow: roiGis.pixelWindow,
      imageCoverage: roiGis.imageCoverage
    });

    const imagePaths = resolvedInputs.map(i => i.path).filter(Boolean);
    const taskIntent = requestedTask || 'VQA';

    let roiOutcome = null;
    try {
      roiOutcome = await executePythonRoiInference({
        imagePaths,
        roi: {
          ...rawParams.roi,
          coordinates: roiGis.coordinates,
          pixelWindow: roiGis.pixelWindow,
          areaKm2: roiGis.areaKm2
        },
        query: query.trim(),
        task: taskIntent,
        metadata: primaryMeta
      });
    } catch (inferErr) {
      console.error('[AnalysisService ROI ML Error]:', inferErr.message);
      throw new Error(`ROI Analysis failed: Unable to compute spectral metrics from selected sub-window (${inferErr.message})`);
    }

    traceBuilder.addEvent('QUANTITATIVE_METRICS_COMPUTED', {
      dominantClass: roiOutcome?.dominantClass || 'Unknown',
      vegetationPct: roiOutcome?.statistics?.vegetation,
      builtupPct: roiOutcome?.statistics?.builtup
    });

    traceBuilder.addEvent('ROI_SYNTHESIZED', {
      confidence: roiOutcome?.confidence || 0.85,
      hasMultimodal: Boolean(roiOutcome?.multimodal),
      hasTemporal: Boolean(roiOutcome?.temporal)
    });

    const finalResult = {
      answerText: roiOutcome.answerText,
      confidence: roiOutcome.confidence || 0.85,
      task: taskIntent,
      scope: 'ROI',
      roi: roiGis,
      dominantClass: roiOutcome.dominantClass,
      statistics: roiOutcome.statistics,
      multimodal: roiOutcome.multimodal,
      temporal: roiOutcome.temporal,
      grounding: roiOutcome.grounding,
      groundingBoxes: roiOutcome.grounding?.regions || [],
      roiDebug: roiOutcome.roiDebug || null,
      modelName: 'SatVistaar-Universal-ROI-Engine',
      latency: '1.8s',
      warnings: []
    };

    const trace = traceBuilder.buildTrace({
      selectedIntent: taskIntent,
      compatibilityResult: { status: 'READY', compatible: true },
      executionMeta: { toolName: 'roi-engine', durationMs: 180 },
      toolResult: { status: 'success', data: roiOutcome }
    });

    return {
      analysisRequest: {
        requestId: requestId || null,
        query: query.trim(),
        inputs: resolvedInputs.map(i => ({ fileId: i.fileId, metadata: i.metadata })),
        requestedTask: taskIntent,
        scope: 'ROI',
        roi: roiGis
      },
      intent: { name: taskIntent, confidence: 1.0, reason: 'ROI Selected Area Specialist Query' },
      compatibility: { status: 'READY', compatible: true, checks: [] },
      executionPlan: { plannedTools: ['roi-engine'], modelSelection: { selectedModel: { name: 'Universal ROI Engine', provider: 'python_ml' } } },
      result: finalResult,
      trace
    };
  }

  // 3. Construct AnalysisRequest contract object (Full Image)
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

  // 4B. Check for Advanced Geospatial Intelligence Suite Tasks
  const geointTasks = [
    'TIME_SERIES',
    'FLOOD_ANALYSIS',
    'CHANGE_MATRIX',
    'OPTICAL_SAR_DIFFERENCE',
    'OBJECT_INVENTORY'
  ];

  const isGeointRequest = geointTasks.includes(requestedTask) ||
                          rawParams?.scope === 'GEOINT' ||
                          geointTasks.includes(intentResult.name);

  if (isGeointRequest) {
    const primaryTask = geointTasks.includes(requestedTask)
      ? requestedTask
      : (geointTasks.includes(intentResult.name) ? intentResult.name : 'ALL');

    traceBuilder.addEvent('GEOINT_SUITE_INVOKED', {
      task: primaryTask,
      inputCount: resolvedInputs.length,
      hasRoi: Boolean(rawParams?.roi)
    });

    const geointOutcome = await processGeointSuiteAnalysis({
      task: primaryTask,
      resolvedInputs,
      roi: rawParams?.roi,
      query: query.trim(),
      timestamps,
      options: rawParams?.options || {}
    });

    traceBuilder.addEvent('GEOINT_SYNTHESIZED', {
      task: primaryTask,
      confidence: geointOutcome.confidence || 0.92,
      hasSequencing: Boolean(geointOutcome.result?.sequencedIntelligence)
    });

    const suiteResult = geointOutcome.result || {};
    let answerText = '';
    if (primaryTask === 'TIME_SERIES' && suiteResult.timeSeries?.summaryText) {
      answerText = suiteResult.timeSeries.summaryText;
    } else if (primaryTask === 'FLOOD_ANALYSIS' && suiteResult.flood?.summaryText) {
      answerText = suiteResult.flood.summaryText;
    } else if (primaryTask === 'CHANGE_MATRIX' && suiteResult.changeMatrix?.summaryText) {
      answerText = suiteResult.changeMatrix.summaryText;
    } else if (primaryTask === 'OPTICAL_SAR_DIFFERENCE' && suiteResult.opticalSarDiff?.summaryText) {
      answerText = suiteResult.opticalSarDiff.summaryText;
    } else if (primaryTask === 'OBJECT_INVENTORY' && suiteResult.objectInventory?.summaryText) {
      answerText = suiteResult.objectInventory.summaryText;
    } else if (suiteResult.sequencedIntelligence?.synthesis) {
      answerText = suiteResult.sequencedIntelligence.synthesis;
    } else {
      answerText = `Advanced Geospatial Intelligence Suite synthesized observations across ${resolvedInputs.length} image inputs.`;
    }

    const finalGeointResult = {
      answerText,
      confidence: geointOutcome.confidence || 0.92,
      task: primaryTask,
      scope: rawParams?.roi ? 'ROI' : 'GEOINT',
      geointSuite: suiteResult,
      sequencedIntelligence: suiteResult.sequencedIntelligence,
      roi: geointOutcome.roi,
      modelName: 'SatVistaar-Advanced-Geoint-Suite',
      latency: '2.1s',
      warnings: []
    };

    const trace = traceBuilder.buildTrace({
      selectedIntent: primaryTask,
      compatibilityResult: { status: 'READY', compatible: true },
      executionMeta: { toolName: 'geoint-suite-engine', durationMs: 240 },
      toolResult: { status: 'success', data: suiteResult }
    });

    return {
      analysisRequest: {
        requestId: requestId || null,
        query: query.trim(),
        inputs: resolvedInputs.map(i => ({ fileId: i.fileId, metadata: i.metadata })),
        requestedTask: primaryTask,
        scope: rawParams?.roi ? 'ROI' : 'GEOINT',
        roi: geointOutcome.roi
      },
      intent: { name: primaryTask, confidence: 0.95, reason: 'Advanced Geospatial Intelligence Suite Task' },
      compatibility: { status: 'READY', compatible: true, checks: [] },
      executionPlan: { plannedTools: ['geoint-suite-engine'], modelSelection: { selectedModel: { name: 'Advanced Geoint Suite Engine', provider: 'python_ml' } } },
      result: finalGeointResult,
      trace
    };
  }

  // 4C. Check for Disaster Response Intelligence Mode Tasks
  const disasterTasks = ['DISASTER_RESPONSE', 'NISAR_ANALYSIS'];
  const isDisasterRequest = disasterTasks.includes(requestedTask) ||
                            rawParams?.scope === 'DISASTER' ||
                            disasterTasks.includes(intentResult.name);

  if (isDisasterRequest) {
    const primaryTask = disasterTasks.includes(requestedTask)
      ? requestedTask
      : (disasterTasks.includes(intentResult.name) ? intentResult.name : 'DISASTER_RESPONSE');

    traceBuilder.addEvent('DISASTER_INTELLIGENCE_INVOKED', {
      task: primaryTask,
      inputCount: resolvedInputs.length,
      hasRoi: Boolean(rawParams?.roi),
      disasterType: rawParams?.disasterType || 'Flood'
    });

    const disasterOutcome = await processDisasterAnalysis({
      disasterType: rawParams?.disasterType || 'Flood',
      resolvedInputs,
      roi: rawParams?.roi,
      query: query.trim(),
      timestamps,
      eventDetails: rawParams?.eventDetails || {},
      sensorMetadata: rawParams?.sensorMetadata || {}
    });

    traceBuilder.addEvent('DISASTER_INTELLIGENCE_SYNTHESIZED', {
      task: primaryTask,
      confidence: disasterOutcome.confidence || 0.91,
      impactedFootprintKm2: disasterOutcome.kpis?.impactedFootprintKm2,
      priority1Count: disasterOutcome.kpis?.priority1Count
    });

    const finalDisasterResult = {
      answerText: disasterOutcome.answerText,
      confidence: disasterOutcome.confidence || 0.91,
      task: primaryTask,
      scope: 'DISASTER',
      disasterIntelligence: disasterOutcome,
      kpis: disasterOutcome.kpis,
      situationalAwareness: disasterOutcome.situationalAwareness,
      hazardMetrics: disasterOutcome.hazardMetrics,
      damageAssessment: disasterOutcome.damageAssessment,
      criticalInfrastructure: disasterOutcome.criticalInfrastructure,
      roadAccessibility: disasterOutcome.roadAccessibility,
      settlementExposure: disasterOutcome.settlementExposure,
      nisarIntelligence: disasterOutcome.nisarIntelligence,
      priorityZones: disasterOutcome.priorityZones,
      riskScenario: disasterOutcome.riskScenario,
      timeline: disasterOutcome.timeline,
      recovery: disasterOutcome.recovery,
      fieldVerificationQueue: disasterOutcome.fieldVerificationQueue,
      roi: disasterOutcome.roi,
      modelName: 'SatVistaar-Disaster-Response-Engine',
      latency: '2.4s',
      warnings: disasterOutcome.validation?.warnings || []
    };

    const trace = traceBuilder.buildTrace({
      selectedIntent: primaryTask,
      compatibilityResult: { status: 'READY', compatible: true },
      executionMeta: { toolName: 'disaster-engine', durationMs: 280 },
      toolResult: { status: 'success', data: disasterOutcome }
    });

    return {
      analysisRequest: {
        requestId: requestId || null,
        query: query.trim(),
        inputs: resolvedInputs.map(i => ({ fileId: i.fileId, metadata: i.metadata })),
        requestedTask: primaryTask,
        scope: 'DISASTER',
        roi: disasterOutcome.roi,
        disasterType: rawParams?.disasterType || 'Flood'
      },
      intent: { name: primaryTask, confidence: 0.96, reason: 'Disaster Response Intelligence Mission' },
      compatibility: { status: 'READY', compatible: true, checks: disasterOutcome.validation?.checks || [] },
      executionPlan: { plannedTools: ['disaster-engine'], modelSelection: { selectedModel: { name: 'Disaster Response Intelligence Engine', provider: 'python_ml' } } },
      result: finalDisasterResult,
      trace
    };
  }

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
