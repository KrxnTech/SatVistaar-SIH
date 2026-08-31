import BaseTool from './base.tool.js';
import { INTENTS } from '../agent/intents.js';
import { getProvider } from '../providers/index.js';

import normalizeVLMResponse from '../services/responseNormalizer.js';

export class ChangeAnalysisTool extends BaseTool {
  constructor() {
    super({
      name: 'change-analysis-tool',
      task: INTENTS.CHANGE_ANALYSIS,
      description: 'Vision-Language Based Change Analysis tool for temporal visual comparison between two images',
      version: '1.0.0'
    });
  }

  async execute(context) {
    const { query, imagePaths = [], modelSelection = {}, inputs = [] } = context;
    const { selectedModel, isMock } = modelSelection;

    const metaA = inputs[0]?.metadata || {};
    const metaB = inputs[1]?.metadata || {};
    const dateA = metaA.timestamp || 'T1 (Older Reference)';
    const dateB = metaB.timestamp || 'T2 (Newer Comparison)';

    if (imagePaths.length < 2) {
      return this.createResult({
        answerText: null,
        confidence: null,
        evidence: [],
        modelName: this.name,
        warnings: ['Vision-Language Based Change Analysis requires exactly two input images.'],
        status: 'failed'
      });
    }

    // Synthetic Mock Response handling
    if (isMock || !selectedModel || selectedModel.provider === 'mock') {
      return this.createResult({
        answerText: `[Mock Vision-Language Based Change Analysis]\nBi-Temporal comparison between Image A (Baseline: ${dateA}) and Image B (Comparison: ${dateB}) for query "${query}":\n1. Urban Expansion: New building construction and site clearing visible in Image B across central regions.\n2. Vegetation Modifications: Reduction in green canopy density in northern agricultural plots.\n3. Infrastructure Development: Extension of paved access roads visible in Image B.\nNote: This analysis represents Vision-Language based visual comparison and is not a pixel-level calibrated remote sensing change map.`,
        confidence: null,
        evidence: [
          {
            type: 'bitemporal_comparison',
            source: 'vlm-visual-comparison',
            description: 'Vision-Language Based Change Analysis'
          }
        ],
        modelName: 'mock-vlm',
        modelVersion: '1.0.0',
        provider: 'mock',
        parametersUsed: { mode: 'mock' },
        warnings: [
          'Vision-Language Based Change Analysis notice: Results are based on visual VLM comparison and do not constitute a scientifically validated pixel-level change detection raster model.'
        ],
        status: 'success'
      });
    }

    const promptText = `You are comparing two satellite or aerial images for bi-temporal change analysis.
Image A is the older baseline imagery (Acquired: ${dateA}).
Image B is the newer comparison imagery (Acquired: ${dateB}).
Identify observable visual differences between Image A and Image B.
Focus on:
- buildings, roads, vegetation, water, infrastructure, land-cover changes, visible construction or removal, major spatial changes.

Formatting Guidelines:
- Highlight Image A (${dateA}) and Image B (${dateB}) clearly.
- Use bullet points with bold descriptive titles for each change category (e.g., "- **Removal of Tree Canopy**: ...", "- **Construction/Development**: ...").
- Make important changing words and observations bold (e.g., **completely removed**, **cleared**, **new construction**, **expanded**, **built-up**, **dense vegetation**, **consistent**).
- Include an "In summary, ..." closing line highlighting the primary change.
Do not invent changes.
If no clear change can be established, state so explicitly.
Return ONLY the final comparison without internal reasoning or <think> blocks.
User Query: ${query}`;

    try {
      const providerInstance = getProvider(selectedModel.provider);
      if (!providerInstance) {
        throw new Error(`Provider instance '${selectedModel.provider}' not registered.`);
      }
      let vlmResponse = await providerInstance.analyze({
        prompt: promptText,
        imagePaths,
        task: this.task,
        modelName: selectedModel.model
      });

      let normalized = normalizeVLMResponse(vlmResponse.answerText, this.task);
      const combinedWarnings = [
        'Vision-Language Based Change Analysis notice: Results are based on visual VLM comparison and do not constitute a scientifically validated pixel-level change detection raster model.',
        ...(vlmResponse.warnings || []),
        ...(normalized.warnings || [])
      ];

      // Single Retry rule if answer is empty or generic
      if (normalized.isLowQuality) {
        combinedWarnings.push('Initial Change Analysis provider response was generic; a single quality retry was requested.');
        try {
          const retryResponse = await providerInstance.analyze({
            prompt: `${promptText}\nIMPORTANT: Compare the specific visible objects and land cover differences between Image A and Image B directly.`,
            imagePaths,
            task: this.task,
            modelName: selectedModel.model
          });
          const retryNormalized = normalizeVLMResponse(retryResponse.answerText, this.task);
          if (!retryNormalized.isLowQuality && retryNormalized.answerText) {
            normalized = retryNormalized;
          }
        } catch (retryErr) {
          combinedWarnings.push(`Change Analysis quality retry failed: ${retryErr.message}`);
        }
      }

      return this.createResult({
        answerText: normalized.answerText,
        confidence: vlmResponse.confidence,
        evidence: [
          {
            type: 'bitemporal_comparison',
            source: selectedModel.provider,
            description: 'Vision-Language Based Change Analysis'
          }
        ],
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
        warnings: [`Change Analysis VLM execution failed: ${err.message}`],
        status: 'failed'
      });
    }
  }
}

export const changeAnalysisTool = new ChangeAnalysisTool();
export default changeAnalysisTool;
