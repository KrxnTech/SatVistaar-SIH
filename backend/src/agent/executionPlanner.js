import { COMPATIBILITY_STATUS } from './compatibilityEngine.js';
import { getToolForIntent } from './toolRegistry.js';
import routeModel from './modelRouter.js';

/**
 * Builds execution plan for downstream tool and VLM invocation
 * 
 * @param {object} params
 * @param {object} params.compatibilityResult - Evaluation result from compatibility engine
 * @param {object} params.intentResult - Classified intent result
 * @param {number} [params.imageCount=1] - Number of input images
 * @param {string} [params.query=''] - Natural language query
 * @returns {object} ExecutionPlan contract object
 */
export const buildExecutionPlan = ({ compatibilityResult, intentResult, imageCount = 1, query = '' }) => {
  const status = compatibilityResult?.status || COMPATIBILITY_STATUS.UNKNOWN;
  const intentName = intentResult?.name || 'UNKNOWN';

  if (status === COMPATIBILITY_STATUS.READY) {
    const tool = getToolForIntent(intentName);
    const modelSelection = routeModel({ task: intentName, imageCount, query });

    const selectedTools = tool ? [{
      name: tool.name,
      task: tool.task,
      version: tool.version,
      description: tool.description,
      model: modelSelection.selectedModel ? modelSelection.selectedModel.model : 'unknown',
      provider: modelSelection.selectedModel ? modelSelection.selectedModel.provider : 'unknown'
    }] : [];

    return {
      selectedIntent: intentName,
      status: COMPATIBILITY_STATUS.READY,
      selectedTools,
      modelSelection,
      warnings: compatibilityResult?.warnings || []
    };
  }

  if (status === COMPATIBILITY_STATUS.ABSTAIN) {
    const combinedWarnings = [
      ...(compatibilityResult?.reasons || []),
      ...(compatibilityResult?.warnings || [])
    ];

    return {
      selectedIntent: intentName,
      status: COMPATIBILITY_STATUS.ABSTAIN,
      selectedTools: [],
      modelSelection: null,
      warnings: combinedWarnings
    };
  }

  // UNKNOWN or ERROR
  return {
    selectedIntent: 'UNKNOWN',
    status: COMPATIBILITY_STATUS.UNKNOWN,
    selectedTools: [],
    modelSelection: null,
    warnings: ['Unable to determine workflow.']
  };
};

export default buildExecutionPlan;
