import { getToolForIntent } from './toolRegistry.js';

/**
 * Tool Executor Layer: Safely executes resolved specialist tools with Model Router selection and optional 1-step fallback
 * 
 * @param {object} params
 * @param {object} params.executionPlan - Planned execution details
 * @param {object} params.analysisContext - Analysis request context (requestId, query, imagePaths, intent, etc.)
 * @returns {Promise<{ toolResult: object|null, executionMeta: { toolName: string, version: string, durationMs: number, startedAt: string, endedAt: string, provider: string, model: string } }>}
 */
export const executePlanTools = async ({ executionPlan, analysisContext }) => {
  const selectedIntent = executionPlan?.selectedIntent;
  
  if (executionPlan?.status !== 'READY' || !selectedIntent) {
    return {
      toolResult: null,
      executionMeta: null
    };
  }

  const toolInstance = getToolForIntent(selectedIntent);
  if (!toolInstance) {
    const failedResult = {
      task: selectedIntent,
      answerText: null,
      confidence: null,
      evidence: [],
      modelName: 'unknown-tool',
      modelVersion: '1.0.0',
      provider: 'none',
      parametersUsed: {},
      warnings: [`No registered tool found for intent '${selectedIntent}'.`],
      status: 'failed'
    };
    return {
      toolResult: failedResult,
      executionMeta: {
        toolName: 'unknown-tool',
        version: '1.0.0',
        durationMs: 0,
        provider: 'none',
        model: 'unknown',
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString()
      }
    };
  }

  const startTime = Date.now();
  const startedAt = new Date(startTime).toISOString();

  let toolResult = null;
  const modelSelection = executionPlan.modelSelection || {};

  try {
    // 1. Primary execution attempt
    const fullContext = {
      ...analysisContext,
      modelSelection
    };

    toolResult = await toolInstance.execute(fullContext);

    // 2. Deterministic Fallback Policy: If primary model fails and fallback model is configured
    if (toolResult && toolResult.status === 'failed' && modelSelection.fallbackModel) {
      const fallbackModelSelection = {
        ...modelSelection,
        selectedModel: modelSelection.fallbackModel,
        fallbackModel: null,
        isMock: modelSelection.fallbackModel.provider === 'mock' || modelSelection.isMock,
        reason: `Primary model failed. Attempting fallback model '${modelSelection.fallbackModel.name}'.`
      };

      const fallbackResult = await toolInstance.execute({
        ...analysisContext,
        modelSelection: fallbackModelSelection
      });

      if (fallbackResult && fallbackResult.status === 'success') {
        toolResult = {
          ...fallbackResult,
          warnings: [
            `Primary model failed. Fallback model '${modelSelection.fallbackModel.name}' succeeded.`,
            ...(fallbackResult.warnings || [])
          ]
        };
      }
    }
  } catch (error) {
    toolResult = {
      task: toolInstance.task,
      answerText: null,
      confidence: null,
      evidence: [],
      modelName: toolInstance.name,
      modelVersion: toolInstance.version,
      provider: modelSelection.selectedModel?.provider || 'unknown',
      parametersUsed: {},
      warnings: [`Tool execution exception: ${error.message}`],
      status: 'failed'
    };
  }

  const endTime = Date.now();
  const endedAt = new Date(endTime).toISOString();
  const durationMs = Math.max(0, endTime - startTime);

  return {
    toolResult,
    executionMeta: {
      toolName: toolInstance.name,
      version: toolInstance.version,
      provider: toolResult?.provider || modelSelection.selectedModel?.provider || 'unknown',
      model: toolResult?.modelVersion || modelSelection.selectedModel?.model || 'unknown',
      durationMs,
      startedAt,
      endedAt
    }
  };
};

export default executePlanTools;
