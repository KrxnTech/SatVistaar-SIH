import { INTENTS } from './intents.js';
import vqaTool from '../tools/vqa.tool.js';
import captionTool from '../tools/caption.tool.js';
import featureIdentificationTool from '../tools/featureIdentification.tool.js';
import changeAnalysisTool from '../tools/changeAnalysis.tool.js';
import opticalSarFusionTool from '../tools/opticalSarFusion.tool.js';

/**
 * Tool Registry mapping MVP intents to specialist VLM tool instances
 */
export const TOOL_REGISTRY = {
  [INTENTS.VQA]: vqaTool,
  [INTENTS.CAPTIONING]: captionTool,
  [INTENTS.FEATURE_IDENTIFICATION]: featureIdentificationTool,
  [INTENTS.CHANGE_ANALYSIS]: changeAnalysisTool,
  [INTENTS.OPTICAL_SAR_FUSION]: opticalSarFusionTool
};

/**
 * Returns specialist Tool instance for a given intent task
 * 
 * @param {string} intentName - Intent key
 * @returns {object|null} Specialist Tool instance or null
 */
export const getToolForIntent = (intentName) => {
  return TOOL_REGISTRY[intentName] || null;
};

export default TOOL_REGISTRY;
