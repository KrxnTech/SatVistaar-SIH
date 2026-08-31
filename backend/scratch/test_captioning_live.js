import fs from 'fs';
import path from 'path';
import config from '../src/config/index.js';
import groqProvider from '../src/providers/groq.provider.js';

const uploadsDir = path.resolve('uploads');
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.tif'));

if (files.length === 0) {
  console.error('No upload files found.');
  process.exit(1);
}

const targetPath = path.join(uploadsDir, files[0]);

(async () => {
  try {
    const res = await groqProvider.analyze({
      prompt: 'You are a satellite imagery visual analysis assistant. Analyze the supplied satellite image and provide a factual visual description. Describe ONLY information that is visually observable in the image.',
      imagePaths: [targetPath],
      task: 'CAPTIONING',
      modelName: 'qwen/qwen3.6-27b'
    });

    console.log('RAW GROQ VLM RESULT:');
    console.log(res);
  } catch (err) {
    console.error('GROQ ERROR:', err);
  }
})();
