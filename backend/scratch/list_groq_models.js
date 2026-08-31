import config from '../src/config/index.js';

(async () => {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`
      }
    });
    const data = await res.json();
    console.log('GROQ MODELS:', data.data?.map(m => m.id));
  } catch (e) {
    console.error(e);
  }
})();
