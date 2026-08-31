import fs from 'fs';
import path from 'path';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

const uploadsDir = path.resolve('uploads');
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
const imageA = path.parse(files[0]).name;
const imageB = path.parse(files[1]).name;

(async () => {
  console.log('Testing Captioning with imageA:', imageA);
  const res2 = await processAnalysisRequest({
    query: 'Describe this satellite image in detail.',
    fileIds: [imageA]
  }, 'caption-debug-01');
  console.log('Captioning result status:', res2.result?.status);
  console.log('Captioning result:', JSON.stringify(res2.result, null, 2));

  console.log('\nTesting Change Analysis with imageA and imageB:', imageA, imageB);
  const res3 = await processAnalysisRequest({
    query: 'What changed between these two satellite images?',
    fileIds: [imageA, imageB]
  }, 'change-debug-01');
  console.log('Change analysis result status:', res3.result?.status);
  console.log('Change analysis result:', JSON.stringify(res3.result, null, 2));
})();
