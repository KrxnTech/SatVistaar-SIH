import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import config from '../config/index.js';

/**
 * Base VLM Model Provider interface
 */
export class BaseProvider {
  /**
   * @param {object} options
   * @param {string} options.name - Provider name ('groq', 'ollama', 'mock')
   */
  constructor({ name }) {
    this.name = name;
  }

  /**
   * Safe helper to convert an image file path to an optimized Base64 data URI for VLM inference
   * 
   * @param {string} filePath - Absolute or trusted relative file path
   * @returns {string} Base64 data URI string
   */
  imageToBase64DataUri(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Image file not found for VLM provider: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();

    // Use Python Pillow to load, convert TIFF/GeoTIFF/PNG/JPEG, downscale to 768x768 (reducing VLM tokens by 70%)
    const pyCmds = ['python', 'py', 'python3'];
    const pythonScript = "import sys, io, base64; from PIL import Image; img = Image.open(sys.argv[1]).convert('RGB'); img.thumbnail((768, 768)); buf = io.BytesIO(); img.save(buf, format='JPEG', quality=80); print(base64.b64encode(buf.getvalue()).decode('utf-8'))";

    for (const cmd of pyCmds) {
      try {
        const b64 = execSync(`${cmd} -c "${pythonScript}" "${filePath}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (b64 && b64.length > 50) {
          return `data:image/jpeg;base64,${b64}`;
        }
      } catch (e) {
        // try next command
      }
    }

    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';

    const buffer = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  /**
   * Safe helper to get raw base64 string without data URI prefix (required by Ollama)
   * 
   * @param {string} filePath - Absolute or trusted relative file path
   * @returns {string} Raw base64 string
   */
  imageToRawBase64(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Image file not found for VLM provider: ${filePath}`);
    }
    const pyCmds = ['python', 'py', 'python3'];
    const pythonScript = "import sys, io, base64; from PIL import Image; img = Image.open(sys.argv[1]).convert('RGB'); img.thumbnail((768, 768)); buf = io.BytesIO(); img.save(buf, format='JPEG', quality=80); print(base64.b64encode(buf.getvalue()).decode('utf-8'))";
    for (const cmd of pyCmds) {
      try {
        const b64 = execSync(`${cmd} -c "${pythonScript}" "${filePath}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (b64 && b64.length > 50) return b64;
      } catch (e) {
        // try next
      }
    }
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('base64');
  }

  /**
   * Abstract analysis method to be implemented by concrete providers
   * 
   * @param {object} params
   * @param {string} params.prompt - Natural language user prompt / query
   * @param {Array<string>} params.imagePaths - Trusted image file paths
   * @param {string} params.task - MVP Task name
   * @param {string} [params.modelName] - Provider model ID override
   * @returns {Promise<{ answerText: string, confidence: number|null, parametersUsed: object, warnings: Array<string> }>}
   */
  async analyze({ prompt, imagePaths = [], task, modelName }) {
    throw new Error(`Method analyze() not implemented for provider '${this.name}'`);
  }

  /**
   * Helper to execute fetch with a timeout controller
   * 
   * @param {string} url - Target URL
   * @param {object} options - Fetch options
   * @param {number} [timeoutMs=30000] - Timeout in milliseconds
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(url, options = {}, timeoutMs = config.vlmTimeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        const timeoutErr = new Error(`Provider '${this.name}' request timed out after ${timeoutMs}ms`);
        timeoutErr.code = 'VLM_TIMEOUT';
        throw timeoutErr;
      }
      throw error;
    }
  }
}

export default BaseProvider;
