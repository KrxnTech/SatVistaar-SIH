import fs from 'fs';
import path from 'path';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

const uploadsDir = path.resolve('uploads');
const testFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));

const fileA = path.parse(testFiles[0]).name;
const fileB = path.parse(testFiles[1]).name;

(async () => {
  console.log('Capturing Live Bi-Temporal Change Analysis...');
  const resChange = await processAnalysisRequest({
    query: 'What visual differences and land-cover changes exist between these two satellite images?',
    fileIds: [fileA, fileB]
  }, 'final-bitemporal-sample-live');

  console.log('Change analysis status:', resChange.result?.status);
  console.log('Answer Text:\n', resChange.result?.answerText);

  // Read existing samples and update BI_TEMPORAL
  const existing = JSON.parse(fs.readFileSync('scratch/final_backend_sample_responses.json', 'utf-8'));
  existing.BI_TEMPORAL = resChange;
  fs.writeFileSync('scratch/final_backend_sample_responses.json', JSON.stringify(existing, null, 2), 'utf-8');
  console.log('\nUpdated BI_TEMPORAL in scratch/final_backend_sample_responses.json!');
})();
