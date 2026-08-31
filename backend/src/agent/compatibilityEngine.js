import { INTENTS } from './intents.js';
import { INTENT_REQUIREMENTS } from './intentRequirements.js';

export const COMPATIBILITY_STATUS = {
  READY: 'READY',
  ABSTAIN: 'ABSTAIN',
  UNKNOWN: 'UNKNOWN',
  ERROR: 'ERROR'
};

/**
 * Evaluates whether an analysis request and classified intent are compatible with uploaded image inputs
 * 
 * @param {object} params
 * @param {object} params.analysisRequest - Normalized analysis request
 * @param {object} params.intentResult - Classified intent result
 * @param {object|null} [params.pairValidation=null] - Pair validation metadata for 2 images
 * @returns {object} CompatibilityResult contract object
 */
export const evaluateCompatibility = ({ analysisRequest, intentResult, pairValidation = null }) => {
  const { inputs = [] } = analysisRequest || {};
  const intentName = intentResult?.name || INTENTS.UNKNOWN;
  const reqs = INTENT_REQUIREMENTS[intentName] || null;

  const reasons = [];
  const warnings = [...(intentResult?.warnings || [])];

  // 1. UNKNOWN Intent Case
  if (intentName === INTENTS.UNKNOWN) {
    return {
      compatible: false,
      status: COMPATIBILITY_STATUS.ABSTAIN,
      selectedIntent: INTENTS.UNKNOWN,
      reasons: ['Unable to determine workflow intent or requested operation is outside supported MVP scope.'],
      warnings,
      requirements: null
    };
  }

  let status = COMPATIBILITY_STATUS.READY;
  let isCompatible = true;

  // 2. File Count & Two-Image Workflow Checks
  if (intentName === INTENTS.CHANGE_ANALYSIS) {
    if (inputs.length !== 2) {
      status = COMPATIBILITY_STATUS.ABSTAIN;
      isCompatible = false;
      reasons.push('Vision-Language change analysis requires exactly two image inputs (Image A and Image B).');
    }
  } else if ((intentName === INTENTS.CAPTIONING || intentName === INTENTS.FEATURE_IDENTIFICATION) && inputs.length > 1) {
    status = COMPATIBILITY_STATUS.ABSTAIN;
    isCompatible = false;
    reasons.push(`${intentName} task requires exactly one image input.`);
  }

  // 3. Pair Geospatial Metadata Checks (for 2 images)
  if (inputs.length === 2 && pairValidation && pairValidation.checks) {
    const crsCheck = pairValidation.checks.find(c => c.name === 'crs');
    if (crsCheck && crsCheck.status === 'fail') {
      warnings.push('Images have different CRS. Visual alignment will be estimated by VLM.');
    }

    const boundsCheck = pairValidation.checks.find(c => c.name === 'bounds');
    if (boundsCheck && boundsCheck.status === 'fail') {
      warnings.push('Spatial extents do not overlap according to bounding box metadata.');
    }
  }

  return {
    compatible: isCompatible,
    status,
    selectedIntent: intentName,
    reasons,
    warnings,
    requirements: reqs
  };
};

export default evaluateCompatibility;
