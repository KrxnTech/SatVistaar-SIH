import fs from 'fs';
import path from 'path';
import config from '../src/config/index.js';

const uploadsDir = path.resolve('uploads');
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.tif'));
const imgPath = path.join(uploadsDir, files[0]);

const base64Img = fs.readFileSync(imgPath).toString('base64');
const ext = path.extname(imgPath).toLowerCase().replace('.', '');
const mimeType = ext === 'png' ? 'image/png' : (ext === 'tif' || ext === 'tiff' ? 'image/tiff' : 'image/jpeg');
const dataUri = `data:${mimeType};base64,${base64Img}`;

(async () => {
  const model = 'qwen/qwen3.6-27b';
  console.log('Sending request to Groq with model:', model);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a satellite imagery analyst.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is visible in this image?' },
            { type: 'image_url', image_url: { url: dataUri } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 100
    })
  });

  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('DATA:', JSON.stringify(data, null, 2));
})();
