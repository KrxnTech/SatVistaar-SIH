import config from '../config/index.js';
import { getCandidateModels } from './modelRegistry.js';

/**
 * Intelligent Model Router Layer
 * Receives task requirements, image count, modality, and provider availability
 * to select ONE primary VLM model and ONE secondary fallback VLM model
 * using empirical benchmark priorities.
 * 
 * @param {object} params
 * @param {string} params.task - MVP task ('VQA', 'CAPTIONING', 'FEATURE_IDENTIFICATION', 'CHANGE_ANALYSIS')
 * @param {number} [params.imageCount=1] - Number of input images (1 or 2)
 * @param {string} [params.query=''] - User query string
 * @param {boolean} [params.forceMock=false] - Optional mock override flag
 * @returns {{ selectedModel: object|null, fallbackModel: object|null, reason: string, isMock: boolean }}
 */
export const routeModel = ({ task, imageCount = 1, query = '', forceMock = false }) => {
  const isMockMode = forceMock || config.mlMode === 'mock' || config.modelProvider === 'mock';

  if (isMockMode) {
    return {
      selectedModel: {
        id: 'mock-vlm',
        name: 'Mock Vision-Language Model',
        provider: 'mock',
        model: 'satquery-mock-vlm-v1',
        capabilities: [task],
        supportsMultipleImages: true
      },
      fallbackModel: null,
      reason: 'Mock mode active (ML_MODE=mock). Operating in synthetic response mode.',
      isMock: true
    };
  }

  // STEP 1-3: Filter candidate models by enabled status, task capability, and image count
  const candidateModels = getCandidateModels(task, imageCount);

  if (candidateModels.length === 0) {
    return {
      selectedModel: null,
      fallbackModel: null,
      reason: `No registered models support task '${task}' with ${imageCount} image input(s).`,
      isMock: false
    };
  }

  // STEP 4-5: Filter by explicit provider preference or auto benchmark priority
  const preferredProvider = (config.modelProvider || 'auto').toLowerCase();

  let primaryModel = null;
  let fallbackModel = null;

  if (preferredProvider && preferredProvider !== 'auto') {
    primaryModel = candidateModels.find(m => m.provider === preferredProvider) || candidateModels[0];
    fallbackModel = candidateModels.find(m => m.id !== primaryModel.id) || null;
  } else {
    // Auto Mode: Highest benchmark priority candidate
    primaryModel = candidateModels[0];
    fallbackModel = candidateModels.find(m => m.id !== primaryModel.id) || null;
  }

  const priorityScore = primaryModel.taskPriority?.[task] ?? 1;
  const reason = `Selected '${primaryModel.name}' (${primaryModel.provider}) for ${task} task based on top benchmark priority ranking (Priority: #${priorityScore}, Multi-Image: ${imageCount > 1 ? 'Enforced' : 'Supported'}). Fallback: ${fallbackModel ? `'${fallbackModel.name}' (${fallbackModel.provider})` : 'None'}.`;

  return {
    selectedModel: primaryModel,
    fallbackModel,
    reason,
    isMock: false
  };
};

export default routeModel;
