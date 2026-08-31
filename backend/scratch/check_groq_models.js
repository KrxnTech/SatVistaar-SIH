import config from '../src/config/index.js';

async function checkGroqModels() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log('Status:', res.status);
    if (data.data) {
      console.log('Available models:', data.data.map(m => m.id));
    } else {
      console.log('Response:', data);
    }
  } catch (err) {
    console.error('Error fetching Groq models:', err);
  }
}

checkGroqModels();
