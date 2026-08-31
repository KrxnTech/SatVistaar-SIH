/**
 * SatQuery AI First-Round MVP Supported Task Intents
 */
export const INTENTS = {
  VQA: 'VQA',
  CAPTIONING: 'CAPTIONING',
  FEATURE_IDENTIFICATION: 'FEATURE_IDENTIFICATION',
  CHANGE_ANALYSIS: 'CHANGE_ANALYSIS',
  UNKNOWN: 'UNKNOWN'
};

/**
 * List of valid supported MVP tasks for user requestedTask validation
 */
export const VALID_REQUESTED_TASKS = [
  INTENTS.VQA,
  INTENTS.CAPTIONING,
  INTENTS.FEATURE_IDENTIFICATION,
  INTENTS.CHANGE_ANALYSIS
];

export default INTENTS;
