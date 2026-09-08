import groqProvider from './groq.provider.js';
import ollamaProvider from './ollama.provider.js';
import pythonMLProvider from './python_ml.provider.js';

export const PROVIDERS = {
  groq: groqProvider,
  ollama: ollamaProvider,
  python_ml: pythonMLProvider
};

/**
 * Gets a VLM provider instance by key name
 * 
 * @param {string} providerName - 'groq', 'ollama', or 'python_ml'
 * @returns {object|null} Provider instance or null
 */
export const getProvider = (providerName) => {
  return PROVIDERS[providerName] || null;
};

export default PROVIDERS;

