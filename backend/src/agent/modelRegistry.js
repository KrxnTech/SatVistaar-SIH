import config from '../config/index.js';

/**
 * Model Registry defining candidate Vision-Language Models, provider mappings, capabilities,
 * and benchmark-derived task priorities.
 */
export const MODEL_REGISTRY = [
  {
    id: 'groq-qwen38',
    name: 'Groq Qwen3.8-27B Vision',
    provider: 'groq',
    model: config.groqModel || 'qwen/qwen3.8-27b',
    capabilities: ['VQA', 'CAPTIONING', 'FEATURE_IDENTIFICATION', 'CHANGE_ANALYSIS'],
    supportsMultipleImages: true,
    enabled: true,
    taskPriority: {
      VQA: 1,
      CAPTIONING: 1,
      FEATURE_IDENTIFICATION: 1,
      CHANGE_ANALYSIS: 1
    }
  },
  {
    id: 'groq-qwen36',
    name: 'Groq Qwen3.6-27B Vision',
    provider: 'groq',
    model: 'qwen/qwen3.6-27b',
    capabilities: ['VQA', 'CAPTIONING', 'FEATURE_IDENTIFICATION', 'CHANGE_ANALYSIS'],
    supportsMultipleImages: true,
    enabled: true,
    taskPriority: {
      VQA: 2,
      CAPTIONING: 2,
      FEATURE_IDENTIFICATION: 2,
      CHANGE_ANALYSIS: 2
    }
  },
  {
    id: 'ollama-qwen-vl',
    name: 'Ollama Qwen2-VL Local',
    provider: 'ollama',
    model: config.ollamaModel || 'qwen2-vl',
    capabilities: ['VQA', 'CAPTIONING', 'FEATURE_IDENTIFICATION', 'CHANGE_ANALYSIS'],
    supportsMultipleImages: true,
    enabled: true,
    taskPriority: {
      VQA: 3,
      CAPTIONING: 3,
      FEATURE_IDENTIFICATION: 3,
      CHANGE_ANALYSIS: 3
    }
  },
  {
    id: 'ollama-llama-vision',
    name: 'Ollama Llama-3.2 Vision Local',
    provider: 'ollama',
    model: 'llama3.2-vision',
    capabilities: ['VQA', 'CAPTIONING', 'FEATURE_IDENTIFICATION', 'CHANGE_ANALYSIS'],
    supportsMultipleImages: true,
    enabled: true,
    taskPriority: {
      VQA: 4,
      CAPTIONING: 4,
      FEATURE_IDENTIFICATION: 4,
      CHANGE_ANALYSIS: 4
    }
  }
];

/**
 * Retrieves candidate models for a task sorted by task-specific benchmark priority
 * 
 * @param {string} task - MVP task name
 * @param {number} [imageCount=1] - Number of image inputs
 * @returns {Array<object>} Sorted model candidates
 */
export const getCandidateModels = (task, imageCount = 1) => {
  return MODEL_REGISTRY.filter((m) => {
    if (!m.enabled) return false;
    if (!m.capabilities.includes(task)) return false;
    if (imageCount > 1 && !m.supportsMultipleImages) return false;
    return true;
  }).sort((a, b) => {
    const pA = a.taskPriority?.[task] ?? 99;
    const pB = b.taskPriority?.[task] ?? 99;
    return pA - pB;
  });
};

export default MODEL_REGISTRY;
