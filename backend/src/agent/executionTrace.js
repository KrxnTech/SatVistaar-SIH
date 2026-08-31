/**
 * Class representing an in-memory execution trace logger for an analysis request
 */
export class ExecutionTraceBuilder {
  constructor(requestId, startTime = Date.now()) {
    this.requestId = requestId || null;
    this.startTime = startTime;
    this.startedAt = new Date(startTime).toISOString();
    this.events = [];
    this.addEvent('REQUEST_RECEIVED');
  }

  /**
   * Adds a structured event to the execution trace log
   * 
   * @param {string} type - Event type name
   * @param {object} [data={}] - Event payload details
   */
  addEvent(type, data = {}) {
    this.events.push({
      type,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Builds the final ExecutionTrace contract object
   * 
   * @param {object} params
   * @param {string} params.selectedIntent - Intent name
   * @param {object} params.compatibilityResult - Evaluation result from compatibility engine
   * @param {object|null} params.executionMeta - Tool execution timing metadata
   * @param {object|null} params.toolResult - Specialist tool result
   * @returns {object} ExecutionTrace contract object
   */
  buildTrace({ selectedIntent, compatibilityResult, executionMeta, toolResult }) {
    const endTime = Date.now();
    const endedAt = new Date(endTime).toISOString();
    const durationMs = Math.max(0, endTime - this.startTime);

    this.addEvent('RESPONSE_READY');

    const status = compatibilityResult?.status || 'UNKNOWN';
    let finalStatus = 'unknown';
    let selectedTools = [];
    let modelVersions = {};

    if (status === 'ABSTAIN') {
      finalStatus = 'abstained';
    } else if (status === 'UNKNOWN') {
      finalStatus = 'unknown';
    } else if (status === 'READY') {
      if (toolResult && toolResult.status === 'failed') {
        finalStatus = 'failed';
      } else if (toolResult && toolResult.status === 'success') {
        finalStatus = 'success';
      } else {
        finalStatus = 'success';
      }

      if (executionMeta?.toolName) {
        selectedTools.push({
          name: executionMeta.toolName,
          version: executionMeta.version
        });
        modelVersions[executionMeta.toolName] = executionMeta.version;
      }
    }

    return {
      requestId: this.requestId,
      selectedIntent: selectedIntent || 'UNKNOWN',
      validationResults: compatibilityResult?.reasons || [],
      selectedTools,
      startedAt: this.startedAt,
      endedAt,
      durationMs,
      modelVersions,
      parameters: {},
      outputReferences: (toolResult?.evidence || []).map(e => ({
        type: e.type,
        source: e.source,
        description: e.description || null
      })),
      events: this.events,
      finalStatus
    };
  }
}

export default ExecutionTraceBuilder;
