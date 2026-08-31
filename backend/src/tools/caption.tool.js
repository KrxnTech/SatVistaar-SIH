import BaseTool from './base.tool.js';
import { INTENTS } from '../agent/intents.js';
import { getProvider } from '../providers/index.js';

import normalizeVLMResponse from '../services/responseNormalizer.js';

export class CaptionTool extends BaseTool {
  constructor() {
    super({
      name: 'caption-tool',
      task: INTENTS.CAPTIONING,
      description: 'Image and scene description specialist tool powered by VLMs',
      version: '1.0.0'
    });
  }

  async execute(context) {
    const { query, imagePaths = [], modelSelection = {} } = context;
    const { selectedModel, isMock } = modelSelection;

    const userQuery = (query && typeof query === 'string' && query.trim().length > 0) 
      ? query.trim() 
      : 'Describe this satellite image in detail.';

    // Synthetic Mock Response handling
    if (isMock || !selectedModel || selectedModel.provider === 'mock') {
      return this.createResult({
        answerText: `[Mock Captioning] High-resolution remote sensing scene overview: The image displays a mixed landscape featuring built-up residential structures, connected road networks, agricultural fields, and natural vegetation cover.`,
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

      // Single Retry rule if caption response is generic or low quality
      if (normalized.isLowQuality) {
        combinedWarnings.push('Initial provider response was insufficient; a single quality retry was requested.');
        try {
          const retryResponse = await providerInstance.analyze({
            prompt: `${userQuery}\nPlease provide a detailed visual description of visible features.`,
            imagePaths,
            task: this.task,
            modelName: selectedModel.model
          });
          const retryNormalized = normalizeVLMResponse(retryResponse.answerText, this.task);
          if (!retryNormalized.isLowQuality && retryNormalized.answerText) {
            normalized = retryNormalized;
          }
        } catch (retryErr) {
          combinedWarnings.push(`Quality retry failed: ${retryErr.message}`);
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
        status: 'success'
      });
    } catch (err) {
      return this.createResult({
        answerText: null,
        confidence: null,
        evidence: [],
        modelName: selectedModel.name || 'vlm',
        provider: selectedModel.provider || 'unknown',
        warnings: [`Captioning VLM execution failed: ${err.message}`],
        status: 'failed'
      });
    }
  }
}

export const captionTool = new CaptionTool();
export default captionTool;
