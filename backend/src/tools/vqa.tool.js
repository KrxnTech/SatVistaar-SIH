import BaseTool from './base.tool.js';
import { INTENTS } from '../agent/intents.js';
import { getProvider } from '../providers/index.js';

import normalizeVLMResponse from '../services/responseNormalizer.js';

export class VqaTool extends BaseTool {
  constructor() {
    super({
      name: 'vqa-tool',
      task: INTENTS.VQA,
      description: 'General Visual Question Answering tool backed by Vision-Language Models',
      version: '1.0.0'
    });
  }

  async execute(context) {
    const { query, imagePaths = [], modelSelection = {} } = context;
    const { selectedModel, isMock } = modelSelection;

    const userQuery = (query && typeof query === 'string' && query.trim().length > 0) 
      ? query.trim() 
      : 'What is visible in this satellite image?';

    // Synthetic Mock Response handling
    if (isMock || !selectedModel || selectedModel.provider === 'mock') {
      return this.createResult({
        answerText: `[Mock VQA] Analysis of visual query "${userQuery}": Visible features include built-up infrastructure, transportation corridors, and land surface details.`,
        confidence: null,
        evidence: [],
        modelName: 'mock-vlm',
        modelVersion: '1.0.0',
        provider: 'mock',
        parametersUsed: { mode: 'mock' },
        warnings: ['Mock mode active. No live VLM provider API call was executed.'],
        status: 'success'
      });
    }

    try {
      const providerInstance = getProvider(selectedModel.provider);
      if (!providerInstance) {
        throw new Error(`Provider instance '${selectedModel.provider}' not registered.`);
      }

      let vlmResponse = await providerInstance.analyze({
        prompt: userQuery,
        imagePaths,
        task: this.task,
        modelName: selectedModel.model
      });

      let normalized = normalizeVLMResponse(vlmResponse.answerText, this.task);
      const combinedWarnings = [...(vlmResponse.warnings || []), ...(normalized.warnings || [])];

      // Single Retry rule if answer is empty or generic
      if (normalized.isLowQuality) {
        combinedWarnings.push('Initial VQA provider response was generic; a single quality retry was requested.');
        try {
          const retryResponse = await providerInstance.analyze({
            prompt: `${userQuery}\nPlease answer the question directly based on concrete visible features.`,
            imagePaths,
            task: this.task,
            modelName: selectedModel.model
          });
          const retryNormalized = normalizeVLMResponse(retryResponse.answerText, this.task);
          if (!retryNormalized.isLowQuality && retryNormalized.answerText) {
            normalized = retryNormalized;
          }
        } catch (retryErr) {
          combinedWarnings.push(`VQA quality retry failed: ${retryErr.message}`);
        }
      }

      return this.createResult({
        answerText: normalized.answerText,
        confidence: vlmResponse.confidence,
        evidence: [],
        modelName: selectedModel.name || selectedModel.model,
        modelVersion: selectedModel.model,
        provider: selectedModel.provider,
        parametersUsed: vlmResponse.parametersUsed,
        warnings: combinedWarnings,
        status: normalized.isLowQuality ? 'partial' : 'success'
      });
    } catch (err) {
      return this.createResult({
        answerText: null,
        confidence: null,
        evidence: [],
        modelName: selectedModel.name || 'vlm',
        provider: selectedModel.provider || 'unknown',
        warnings: [`VLM execution failed: ${err.message}`],
        status: 'failed'
      });
    }
  }
}

export const vqaTool = new VqaTool();
export default vqaTool;
