import fs from 'fs';
import path from 'path';
import config from '../src/config/index.js';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

console.log('------------------------------------------');
console.log('SatVistaar Live Ollama VLM Test');
console.log('------------------------------------------\n');

const baseUrl = (config.ollamaBaseUrl || 'http://localhost:11434').replace(/\/+$/, '');
const modelName = config.ollamaModel || 'qwen2-vl';

console.log(`Configured Ollama Base URL: ${baseUrl}`);
console.log(`Configured Ollama Model: ${modelName}\n`);

(async () => {
  // Step 1: Health / Reachability check
  let isReachable = false;
  let modelsAvailable = [];

  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      isReachable = true;
      modelsAvailable = (data.models || []).map(m => m.name);
    }
  } catch (err) {
    isReachable = false;
  }

  if (!isReachable) {
    console.log('Status: FAILED');
    console.log(`Reason: Ollama local server is not reachable at ${baseUrl}. Required Ollama vision model '${modelName}' is not installed or Ollama service is offline.\n`);
    console.log('------------------------------------------');
    process.exit(1);
  }

  const hasModel = modelsAvailable.some(m => m === modelName || m.startsWith(modelName));
  if (!hasModel) {
    console.log('Status: FAILED');
    console.log(`Reason: Required Ollama vision model '${modelName}' is not installed locally. Available models: ${modelsAvailable.join(', ') || 'None'}\n`);
    console.log('------------------------------------------');
    process.exit(1);
  }

  // Step 2: Resolve one known uploaded image
  const uploadsDir = path.resolve('uploads');
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.tif'));

  if (files.length === 0) {
    console.log('Status: FAILED');
    console.log('Reason: No uploaded images available in uploads/ directory.\n');
    console.log('------------------------------------------');
    process.exit(1);
  }

  const fileId = path.parse(files[0]).name;

  try {
    // Force MODEL_PROVIDER=ollama for live Ollama test
    const originalProvider = config.modelProvider;
    config.modelProvider = 'ollama';

    const response = await processAnalysisRequest({
      query: 'What is visible in this satellite image?',
      fileIds: [fileId]
    }, 'live-ollama-req-001');

    config.modelProvider = originalProvider;

    const result = response.result;

    if (!result || result.status !== 'success') {
      console.log('Status: FAILED');
      console.log(`Reason: Ollama execution failed: ${result?.warnings || 'Unknown error'}\n`);
      console.log('------------------------------------------');
      process.exit(1);
    }

    console.log(`Provider: ${result.provider}`);
    console.log(`Model: ${result.modelName}`);
    console.log(`Task: ${result.task}`);
    console.log(`Status: ${result.status.toUpperCase()}\n`);
    console.log('Answer:');
    console.log(result.answerText);
    console.log('\n------------------------------------------');
  } catch (err) {
    console.log('Status: FAILED');
    console.log(`Reason: Exception during Ollama execution: ${err.message}\n`);
    console.log('------------------------------------------');
    process.exit(1);
  }
})();
