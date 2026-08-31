/**
 * Base Specialist Tool Interface & Normalized ToolResult Construction
 */
export class BaseTool {
  /**
   * @param {object} config
   * @param {string} config.name - Tool name identifier
   * @param {string} config.task - Associated SatQuery intent task
   * @param {string} config.description - Description of tool capability
   * @param {string} [config.version='1.0.0'] - Tool version
   */
  constructor({ name, task, description, version = '1.0.0' }) {
    this.name = name;
    this.task = task;
    this.description = description;
    this.version = version;
  }

  /**
   * Executes the tool logic
   * 
   * @param {object} context - Analysis request context (query, input paths, modelSelection, etc.)
   * @returns {Promise<object>} Standardized ToolResult contract object
   */
  async execute(context) {
    throw new Error(`Execute method not implemented for tool ${this.name}`);
  }

  /**
   * Helper to construct a standardized ToolResult object
   */
  createResult({
    answerText = null,
    confidence = null,
    grounding = null,
    evidence = [],
    modelName = this.name,
    modelVersion = this.version,
    provider = 'vlm',
    parametersUsed = {},
    warnings = [],
    status = 'success'
  }) {
    return {
      task: this.task,
      answerText,
      confidence, // Default null for generic VLMs
      grounding,
      evidence,
      modelName,
      modelVersion,
      provider,
      parametersUsed,
      warnings,
      status
    };
  }
}

export default BaseTool;
