import BaseProvider from './base.provider.js';
import groqProvider from './groq.provider.js';
import config from '../config/index.js';

/**
 * Python ML Microservice VLM & Computer Vision Provider Adapter
 * Integrates local PyTorch/Flask ML inference engine with automatic fallback to Groq Cloud VLM.
 */
export class PythonMLProvider extends BaseProvider {
  constructor() {
    super({ name: 'python_ml' });
    this.baseUrl = process.env.ML_INFERENCE_URL || 'http://localhost:5002';
  }

  /**
   * Checks if Python ML provider configuration is active
   */
  isConfigured() {
    return true;
  }

  /**
   * Calls Python ML inference server for VQA, NDWI, or Change Detection with Groq fallback
   */
  async analyze({ prompt, userQuery, imagePaths = [], task, modelName }) {
    const serviceUrl = this.baseUrl.replace(/\/+$/, '');

    try {
      let endpoint = `${serviceUrl}/predict/vqa`;
      let payloadBody = { prompt, imagePaths, task };

      if (task === 'CHANGE_ANALYSIS' && imagePaths.length >= 2) {
        endpoint = `${serviceUrl}/predict/change`;
        payloadBody = {
          imagePath1: imagePaths[0],
          imagePath2: imagePaths[1],
          threshold: 30,
          prompt,
          query: userQuery || prompt
        };
      }

      // 1. Direct call to Python ML Inference microservice
      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody)
      }, config.vlmTimeoutMs || 30000);

      if (!response.ok) {
        throw new Error(`Python ML microservice returned HTTP status ${response.status}`);
      }

      const payload = await response.json();
      if (!payload.success || !payload.data) {
        throw new Error(payload.error?.message || 'Invalid response structure from Python ML microservice');
      }

      const resData = payload.data;
      const answerText = resData.answerText || resData.summary || `[Python ML Engine] Analysis complete.`;
      const boxes = resData.groundingBoxes || resData.boundingBoxes || resData.bounding_boxes || resData.regions || [];

      return {
        answerText,
        confidence: resData.confidence || 0.88,
        groundingBoxes: boxes,
        boundingBoxes: boxes,
        bounding_boxes: boxes,
        regions: boxes,
        evidence: resData.evidence || [
          {
            type: 'approximate_location',
            source: 'python_ml',
            description: `Python ML Computer Vision Grounding (${boxes.length} region(s) identified)`
          }
        ],
        changedPercentage: resData.changedPercentage,
        meanDiffIntensity: resData.meanDiffIntensity,
        parametersUsed: {
          model: modelName || 'python-ml-vlm',
          provider: 'python_ml',
          device: resData.device || 'cpu',
          metadata: resData.metadata || {}
        },
        warnings: []
      };

    } catch (error) {
      // 2. Fallback execution to Groq provider if Python ML microservice is offline or errors
      console.warn(`[PythonMLProvider] Microservice unavailable (${error.message}). Executing fallback to Groq provider...`);

      if (groqProvider.isAvailable()) {
        const groqResult = await groqProvider.analyze({ prompt, imagePaths, task, modelName });
        return {
          ...groqResult,
          warnings: [
            `Python ML service unavailable (${error.message}). Executed fallback via Groq Cloud VLM.`,
            ...(groqResult.warnings || [])
          ]
        };
      }

      // If fallback groq is also unavailable, throw error
      const connErr = new Error(`Python ML Microservice unavailable at ${serviceUrl} and fallback provider unavailable: ${error.message}`);
      connErr.code = 'PYTHON_ML_UNAVAILABLE';
      throw connErr;
    }
  }
}

export const pythonMLProvider = new PythonMLProvider();
export default pythonMLProvider;
