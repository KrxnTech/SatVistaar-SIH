import fs from 'fs';
import path from 'path';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

const uploadsDir = path.resolve('uploads');
const testFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
const fileA = path.parse(testFiles[0]).name;

(async () => {
  console.log('Capturing VQA query...');
  const vqaRes = await processAnalysisRequest({
    query: 'Is there an airport runway or aircraft visible in this satellite image?',
    fileIds: [fileA]
  }, 'vqa-real-sample-final');

  const existing = JSON.parse(fs.readFileSync('scratch/final_backend_sample_responses.json', 'utf-8'));
  existing.VQA = vqaRes;
  fs.writeFileSync('scratch/final_backend_sample_responses.json', JSON.stringify(existing, null, 2), 'utf-8');
  console.log('VQA status:', vqaRes.result.status);
  console.log('VQA answer:', vqaRes.result.answerText);
})();
