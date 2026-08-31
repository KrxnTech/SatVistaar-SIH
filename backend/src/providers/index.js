import groqProvider from './groq.provider.js';
import ollamaProvider from './ollama.provider.js';

export const PROVIDERS = {
  groq: groqProvider,
  ollama: ollamaProvider
};

/**
 * Gets a VLM provider instance by key name
 * 
 * @param {string} providerName - 'groq' or 'ollama'
 * @returns {object|null} Provider instance or null
 */
export const getProvider = (providerName) => {
  return PROVIDERS[providerName] || null;
};

export default PROVIDERS;
