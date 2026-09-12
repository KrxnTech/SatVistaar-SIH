import { INTENTS } from './intents.js';

/**
 * Task / Intent Classification Engine for SatVistaar Geospatial Vision AI
 * 
 * @param {object} params
 * @param {string} params.query - Natural language user query
 * @param {Array<object>} params.inputs - Resolved input files with metadata
 * @param {string|null} [params.requestedTask=null] - Optional user requested task override
 * @param {boolean} [params.benchmarkMode=false] - Optional benchmark evaluation flag
 * @returns {{ intent: string, confidence: number, reason: string, warnings: Array<string> }}
 */
export const classifyIntent = ({ query, inputs = [], requestedTask = null, benchmarkMode = false }) => {
  const normalizedQuery = (query || '').toLowerCase().trim();
  const warnings = [];

  // If explicit requestedTask is provided and valid, honor it
  if (requestedTask && Object.values(INTENTS).includes(requestedTask)) {
    return {
      intent: requestedTask,
      confidence: 1.0,
      reason: `User explicitly specified requested task '${requestedTask}'.`,
      warnings
    };
  }

  let selectedIntent = null;
  let confidence = 0.0;
  let reason = '';

  // 1. FLOOD_ANALYSIS Pattern Match
  const floodPatterns = [
    'flood', 'flooded', 'flooding', 'inundat', 'inundation', 'submerged',
    'water expansion', 'water overflow', 'new water', 'newly inundated', 'flood impact'
  ];
  if (floodPatterns.some(pattern => normalizedQuery.includes(pattern))) {
    selectedIntent = INTENTS.FLOOD_ANALYSIS;
    confidence = 0.96;
    reason = 'The query requests flood extent, inundation boundary, or disaster hydrological impact analysis.';
  }

  // 2. TIME_SERIES Pattern Match
  if (!selectedIntent) {
    const timeSeriesPatterns = [
      'time-series', 'time series', 'timeline', 'over time', 'over the last',
      'over five years', 'over four years', 'over three years', 'between 202',
      'across years', 'temporal trend', 'multi-temporal', 'multi-epoch',
      'largest change occur', 'decline over time', 'increase over time', 'which year'
    ];
    if (timeSeriesPatterns.some(pattern => normalizedQuery.includes(pattern)) || inputs.length > 2) {
      selectedIntent = INTENTS.TIME_SERIES;
      confidence = 0.95;
      reason = 'The query requests multi-epoch temporal time-series trend analysis across chronological imagery observations.';
    }
  }

  // 3. CHANGE_MATRIX Pattern Match
  if (!selectedIntent) {
    const matrixPatterns = [
      'change matrix', 'transition matrix', 'land-cover change', 'land cover change',
      'what type of land-cover change', 'what type of land cover change',
      'became built-up', 'became built up', 'became urban', 'vegetation to urban',
      'agriculture to urban', 'land to water', 'water to land', 'transition from', 'converted to'
    ];
    if (matrixPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.CHANGE_MATRIX;
      confidence = 0.94;
      reason = 'The query requests categorical land-cover transition cross-tabulation dynamics (FROM → TO matrix).';
    }
  }

  // 4. OPTICAL_SAR_DIFFERENCE Pattern Match
  if (!selectedIntent) {
    const diffPatterns = [
      'optical vs sar', 'sar vs optical', 'optical and sar difference',
      'what does sar reveal', 'where do the two modalities disagree',
      'where do modalities disagree', 'modality disagreement', 'disagree',
      'structures more apparent in sar', 'difference between the two observations',
      'optical-dominant', 'sar-dominant'
    ];
    if (diffPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.OPTICAL_SAR_DIFFERENCE;
      confidence = 0.95;
      reason = 'The query requests Optical vs SAR cross-modal difference exploration and sensor consensus analysis.';
    }
  }

  // 5. OBJECT_INVENTORY Pattern Match
  if (!selectedIntent) {
    const inventoryPatterns = [
      'how many buildings', 'count buildings', 'building count', 'how many structures',
      'object inventory', 'inventory of', 'list objects', 'count objects', 'how many roads',
      'how many water bodies', 'number of buildings', 'count of structures', 'object summary'
    ];
    if (inventoryPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.OBJECT_INVENTORY;
      confidence = 0.93;
      reason = 'The query requests a structured object inventory count and category catalog inside the spatial area.';
    }
  }

  // 6. OPTICAL_SAR_FUSION Pattern Match
  if (!selectedIntent) {
    const fusionPatterns = [
      'optical and sar', 'sar and optical', 'optical + sar', 'sar + optical',
      'optical with sar', 'sar with optical', 'radar and optical', 'optical and radar',
      'fuse', 'fusion', 'fused', 'cross-modal', 'backscatter', 'double-bounce',
      'specular reflection', 'sentinel-1 and sentinel-2', 'sentinel-2 and sentinel-1',
      'multispectral and sar', 'sar and multispectral'
    ];
    const isFusionQuery = fusionPatterns.some(pattern => normalizedQuery.includes(pattern));

    if (isFusionQuery || (inputs.length === 2 && (normalizedQuery.includes('sar') || normalizedQuery.includes('radar')))) {
      selectedIntent = INTENTS.OPTICAL_SAR_FUSION;
      confidence = 0.95;
      reason = 'The query requests joint multimodal cross-modal Optical + SAR fusion intelligence.';
    }
  }

  // 6b. DISASTER_RESPONSE Pattern Match
  if (!selectedIntent) {
    const disasterPatterns = [
      'disaster', 'emergency', 'evacuation', 'cyclone', 'earthquake', 'landslide',
      'wildfire', 'damage assessment', 'damaged building', 'damaged road', 'infrastructure risk',
      'priority zone', 'priority 1', 'what happened', 'field verification', 'affected areas',
      'what is affected', 'what needs attention', 'response planning', 'hazard extent'
    ];
    if (disasterPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.DISASTER_RESPONSE;
      confidence = 0.96;
      reason = 'The query requests operational disaster response decision-support intelligence.';
    }
  }

  // 6c. NISAR_ANALYSIS Pattern Match
  if (!selectedIntent) {
    const nisarPatterns = [
      'nisar', 'l-band', 's-band', 'interferometr', 'deformation map', 'sar disaster',
      'radar change', 'sar structural', 'coherence map', 'surface deformation'
    ];
    if (nisarPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.NISAR_ANALYSIS;
      confidence = 0.95;
      reason = 'The query requests NISAR / SAR-focused radar disaster intelligence or structural deformation analysis.';
    }
  }

  // 7. CHANGE_ANALYSIS Pattern Match
  if (!selectedIntent) {
    const changePatterns = [
      'what changed', 'show change', 'show changes', 'detect change', 'changed region',
      'difference between', 'changes between', 'compare', 'increased', 'decreased',
      'growth between', 'reduction between', 'before and after', 'second image'
    ];
    const isChangeQuery = changePatterns.some(pattern => normalizedQuery.includes(pattern));

    if (isChangeQuery || (inputs.length > 1 && (normalizedQuery.includes('change') || normalizedQuery.includes('between')))) {
      selectedIntent = INTENTS.CHANGE_ANALYSIS;
      confidence = 0.92;
      reason = 'The query requests Vision-Language based temporal visual change analysis across images.';
    }
  }

  // 8. FEATURE_IDENTIFICATION Pattern Match
  if (!selectedIntent) {
    const featurePatterns = [
      'identify', 'locate', 'where is', 'where are', 'find the', 'point out',
      'highlight', 'detect', 'buildings', 'water bodies', 'water body', 'roads',
      'vegetation', 'agricultural', 'features', 'objects'
    ];
    if (featurePatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.FEATURE_IDENTIFICATION;
      confidence = 0.91;
      reason = 'The query requests feature or object visual identification / approximate grounding.';
    }
  }

  // 9. CAPTIONING Pattern Match
  if (!selectedIntent) {
    const captionPatterns = [
      'describe', 'caption', 'summarize', 'description of', 'summary of',
      'what does this scene look like', 'overview of'
    ];
    if (captionPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.CAPTIONING;
      confidence = 0.90;
      reason = 'The query requests a descriptive summary or scene description of the image.';
    }
  }

  // 10. VQA Pattern Match
  if (!selectedIntent) {
    const vqaPatterns = [
      'what is', 'is there', 'are there', 'how many', 'what type of',
      'can you see', 'does this', 'what color', 'is this', 'visible'
    ];
    if (vqaPatterns.some(pattern => normalizedQuery.includes(pattern))) {
      selectedIntent = INTENTS.VQA;
      confidence = 0.88;
      reason = 'The query asks a general visual question about image content.';
    }
  }

  // 11. Default Fallback / Out-of-scope intent detection
  if (!selectedIntent) {
    selectedIntent = INTENTS.UNKNOWN;
    confidence = 0.0;
    reason = 'Unable to classify task from query syntax or query requests unsupported specialized scientific analytics.';
    warnings.push('Query task is unclassified or out of MVP scope.');
  }

  // Input Warnings
  if (inputs.length === 1 && (selectedIntent === INTENTS.CHANGE_ANALYSIS || selectedIntent === INTENTS.CHANGE_MATRIX || selectedIntent === INTENTS.FLOOD_ANALYSIS)) {
    warnings.push(`${selectedIntent} queries work best with two image inputs (baseline and post-event).`);
  }
  if (inputs.length === 1 && (selectedIntent === INTENTS.OPTICAL_SAR_FUSION || selectedIntent === INTENTS.OPTICAL_SAR_DIFFERENCE)) {
    warnings.push('Optical + SAR queries require two image inputs (one Optical and one SAR raster).');
  }

  return {
    intent: selectedIntent,
    confidence,
    reason,
    warnings
  };
};

export default classifyIntent;
