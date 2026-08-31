import fs from 'fs';
import path from 'path';
import config from '../src/config/index.js';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

console.log('------------------------------------------');
console.log('SatVistaar Live Groq VLM Smoke Test');
console.log('------------------------------------------\n');

if (!config.groqApiKey || config.groqApiKey.trim().length === 0) {
  console.error('❌ GROQ_API_KEY is not configured.');
  process.exit(1);
}

if (!config.groqModel || config.groqModel.trim().length === 0) {
  console.error('❌ GROQ_MODEL is not configured.');
  process.exit(1);
}

// Find a real uploaded image in uploads/
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  console.error('❌ Uploads directory not found.');
  process.exit(1);
}

const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
if (files.length === 0) {
  console.error('❌ No uploaded files available in uploads/ for live smoke test.');
  process.exit(1);
}

// Select a valid image file (e.g. .jpg or .png or .tif)
const targetFile = files.find(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.tif')) || files[0];
const fileId = path.parse(targetFile).name;

(async () => {
  try {
    const response = await processAnalysisRequest({
      query: 'What is visible in this satellite image?',
      fileIds: [fileId]
    }, 'smoke-test-req-001');

    const result = response.result;
    const trace = response.trace;

    if (!result || result.status !== 'success') {
      console.error('❌ Live Groq Analysis Failed:', result?.warnings || 'Unknown error');
      process.exit(1);
    }

    console.log(`Provider: ${result.provider}`);
    console.log(`Model: ${result.modelName}`);
    console.log(`Task: ${result.task}`);
    console.log(`Image: ${fileId}`);
    console.log(`Status: ${result.status.toUpperCase()}\n`);
    console.log('Answer:');
    console.log(result.answerText);
    console.log('\n------------------------------------------');

    if (result.provider !== 'groq') {
      console.error(`❌ Expected provider "groq" but received "${result.provider}"`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Live Groq Smoke Test Exception:', err.message);
    process.exit(1);
  }
})();
