import path from 'path';
import config from '../src/config/index.js';
import { BaseProvider } from '../src/providers/base.provider.js';

const provider = new BaseProvider({ name: 'test' });
const tiffPath = path.resolve('uploads/13ba76c6-5cb6-4306-9e25-c7aa1b592358.tif');
const dataUri = provider.imageToBase64DataUri(tiffPath);

(async () => {
  console.log('Sending converted TIFF PNG to Groq model qwen/qwen3.6-27b...');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'What is visible in this satellite image?' }, { type: 'image_url', image_url: { url: dataUri } }] }
      ],
      max_tokens: 150
    })
  });

  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('ANSWER:', data.choices?.[0]?.message?.content);
})();
