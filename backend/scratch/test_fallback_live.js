import { executePlanTools } from '../src/agent/toolExecutor.js';

(async () => {
  const executionPlan = {
    selectedIntent: 'VQA',
    status: 'READY',
    modelSelection: {
      isMock: false,
      selectedModel: { id: 'invalid-primary', name: 'Invalid Primary Model', provider: 'groq', model: 'invalid-model-name-xyz' },
      fallbackModel: { id: 'groq-qwen38', name: 'Groq Qwen3.8-27B Vision', provider: 'groq', model: 'qwen/qwen3.8-27b' }
    }
  };

  const outcome = await executePlanTools({
    executionPlan,
    analysisContext: {
      query: 'Is there water in this image?',
      imagePaths: ['uploads/13d03a34-5a2b-4b8f-a813-0013c09f115f.jpeg']
    }
  });

  console.log('Tool Result Status:', outcome.toolResult?.status);
  console.log('Provider:', outcome.toolResult?.provider);
  console.log('Model Name:', outcome.toolResult?.modelName);
  console.log('Answer Text:', outcome.toolResult?.answerText);
  console.log('Warnings:', outcome.toolResult?.warnings);
})();
