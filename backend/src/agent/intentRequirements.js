import { INTENTS } from './intents.js';

/**
 * Requirements specification for each supported MVP task intent
 */
export const INTENT_REQUIREMENTS = {
  [INTENTS.VQA]: {
    minImages: 1,
    maxImages: 2,
    temporalPair: false,
    description: 'General Visual Question Answering (1 or 2 images)'
  },
  [INTENTS.CAPTIONING]: {
    minImages: 1,
    maxImages: 1,
    temporalPair: false,
    description: 'Image/Scene Description (1 image)'
  },
  [INTENTS.FEATURE_IDENTIFICATION]: {
    minImages: 1,
    maxImages: 1,
    temporalPair: false,
    description: 'Feature/Object Identification & approximate visual grounding (1 image)'
  },
  [INTENTS.CHANGE_ANALYSIS]: {
    minImages: 2,
    maxImages: 2,
    temporalPair: true,
    description: 'Simple Two-Image Vision-Language Change Analysis (strictly 2 images)'
  }
};

export default INTENT_REQUIREMENTS;
