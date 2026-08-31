import fs from 'fs';
import path from 'path';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const uploadsDir = path.resolve('uploads');
const testFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));

const fileA = path.parse(testFiles[0]).name;
const fileB = path.parse(testFiles[1]).name;

const samples = {};

(async () => {
  console.log('=== Capturing 1. VQA ===');
  samples.VQA = await processAnalysisRequest({
    query: 'Is there an airport terminal or runway visible in this satellite image?',
    fileIds: [fileA]
  }, 'vqa-real-sample-01');
  console.log('VQA status:', samples.VQA.result.status);
  console.log('VQA answer:', samples.VQA.result.answerText?.substring(0, 150));

  console.log('\nWaiting 15s for Groq TPM window to clear...');
  await sleep(15000);

  console.log('\n=== Capturing 2. CAPTIONING ===');
  samples.CAPTIONING = await processAnalysisRequest({
    query: 'Describe this satellite image in detail.',
    fileIds: [fileA]
  }, 'caption-real-sample-01');
  console.log('CAPTIONING status:', samples.CAPTIONING.result.status);
  console.log('CAPTIONING answer:', samples.CAPTIONING.result.answerText?.substring(0, 150));

  console.log('\nWaiting 15s for Groq TPM window to clear...');
  await sleep(15000);

  console.log('\n=== Capturing 3. VISUAL GROUNDING ===');
  samples.VISUAL_GROUNDING = await processAnalysisRequest({
    query: 'Where are the primary buildings and transportation routes located?',
    fileIds: [fileA]
  }, 'grounding-real-sample-01');
  console.log('GROUNDING status:', samples.VISUAL_GROUNDING.result.status);
  console.log('GROUNDING answer:', samples.VISUAL_GROUNDING.result.answerText?.substring(0, 150));

  console.log('\nWaiting 18s for Groq TPM window to clear...');
  await sleep(18000);

  console.log('\n=== Capturing 4. BI-TEMPORAL CHANGE ===');
  samples.BI_TEMPORAL = await processAnalysisRequest({
    query: 'What changed between these two satellite images?',
    fileIds: [fileA, fileB]
  }, 'change-real-sample-01');
  console.log('CHANGE status:', samples.BI_TEMPORAL.result.status);
  console.log('CHANGE answer:', samples.BI_TEMPORAL.result.answerText?.substring(0, 150));

  fs.writeFileSync('scratch/final_backend_sample_responses.json', JSON.stringify(samples, null, 2), 'utf-8');
  console.log('\n🎉 ALL 4 MISSIONS REAL RESPONSES SAVED TO scratch/final_backend_sample_responses.json');
})();
