import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file located at root of backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  preprocessingServiceUrl: process.env.PREPROCESSING_SERVICE_URL || 'http://localhost:5001',
  preprocessingTimeoutMs: parseInt(process.env.PREPROCESSING_TIMEOUT_MS || '5000', 10),
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5002',
  mlServiceTimeoutMs: parseInt(process.env.ML_SERVICE_TIMEOUT_MS || '10000', 10),
  mlMode: (process.env.MOCK_MODE === 'false' ? 'real' : (process.env.ML_MODE || 'real')).toLowerCase(),
  
  // VLM Provider & Model Configurations
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'qwen/qwen3.6-27b',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2-vl',
  modelProvider: (process.env.DEFAULT_MODEL_PROVIDER || process.env.MODEL_PROVIDER || 'python_ml').toLowerCase(), // 'python_ml' | 'groq' | 'ollama' | 'auto'
  modelRouterMode: (process.env.MODEL_ROUTER_MODE || 'priority').toLowerCase(), // 'priority' | 'fallback'
  vlmTimeoutMs: parseInt(process.env.VLM_TIMEOUT_MS || '30000', 10),

  // Authentication & Security Configurations
  jwtSecret: process.env.JWT_SECRET || 'satvistaar_jwt_development_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || '',

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
};

export default config;
