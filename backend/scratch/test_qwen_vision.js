import config from '../src/config/index.js';

(async () => {
  const model = 'qwen/qwen3.6-27b';
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: 'Describe this satellite image.' }
        ],
        max_tokens: 100
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
