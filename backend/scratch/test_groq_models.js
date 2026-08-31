import config from '../src/config/index.js';

const apiKey = config.groqApiKey;

const candidateModels = [
  'llama-3.2-90b-vision-preview',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'meta-llama/llama-3.2-90b-vision-instruct',
  'qwen-2.5-vl-72b-instruct',
  'llava-v1.5-7b-navit'
];

(async () => {
  for (const model of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Model '${model}' is ACTIVE on Groq!`);
      } else {
        console.log(`❌ Model '${model}' failed: ${data.error?.message || res.status}`);
      }
    } catch (e) {
      console.log(`❌ Model '${model}' error: ${e.message}`);
    }
  }
})();
