import http from 'http';
import { computeGisMetadataForRoi } from './roi.service.js';

/**
 * SatVistaar Disaster Response Intelligence Service
 * Bridges Node.js Agent Controller with Python ML Specialist Disaster Engine.
 */

/**
 * Invokes Python ML /predict/disaster endpoint on port 5002
 */
export const executePythonDisasterInference = async ({
  disasterType = 'Flood',
  preImagePath = null,
  postImagePath = null,
  sarImagePath = null,
  postSarImagePath = null,
  imagePaths = [],
  roi = {},
  eventDetails = {},
  sensorMetadata = {},
  query = ''
}) => {
  const payload = JSON.stringify({
    disasterType,
    preImagePath,
    postImagePath,
    sarImagePath,
    postSarImagePath,
    imagePaths,
    roi,
    eventDetails,
    sensorMetadata,
    query
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5002,
        path: '/predict/disaster',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 30000
      },
      res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300 && parsed.success) {
              resolve(parsed.data);
            } else {
              reject(new Error(parsed.error?.message || `Disaster inference failed (${res.statusCode})`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Disaster service response: ${e.message}`));
          }
        });
      }
    );

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Disaster ML inference timed out'));
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Validates input imagery suitability and chronological ordering for disaster analysis
 */
export const validateDisasterInputs = ({ resolvedInputs = [], timestamps = [], disasterType = 'Flood' }) => {
  const warnings = [];
  const checks = [];

  if (!resolvedInputs || resolvedInputs.length === 0) {
    throw new Error('Disaster Response Mode requires at least one satellite raster (pre-event or post-event).');
  }

  // Check temporal chronological ordering if 2+ timestamps provided
  if (timestamps.length >= 2) {
    const d1 = new Date(timestamps[0]);
    const d2 = new Date(timestamps[1]);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
      if (d1 > d2) {
        warnings.push(`Chronological inversion detected: Pre-event observation (${timestamps[0]}) is later than post-event (${timestamps[1]}).`);
        checks.push({ name: 'temporal_order', status: 'warning', message: 'Chronological order inverted' });
      } else {
        checks.push({ name: 'temporal_order', status: 'pass', message: 'Pre/post temporal ordering confirmed' });
      }
    }
  }

  // Check modality availability
  const hasSar = resolvedInputs.some(inp => {
    const p = (inp.path || '').toLowerCase();
    const sensor = (inp.metadata?.sensor || '').toLowerCase();
    return p.includes('sar') || p.includes('radar') || p.includes('s1') || sensor.includes('sar');
  });

  const hasOptical = resolvedInputs.some(inp => {
    const p = (inp.path || '').toLowerCase();
    const sensor = (inp.metadata?.sensor || '').toLowerCase();
    return !p.includes('sar') && !p.includes('radar');
  });

  checks.push({
    name: 'modality_coverage',
    status: 'pass',
    message: hasSar && hasOptical
      ? 'Dual-stream Optical + SAR modalities available'
      : (hasSar ? 'SAR radar active (cloud-penetrating)' : 'Optical high-resolution active')
  });

  return { valid: true, warnings, checks, hasSar, hasOptical };
};

/**
 * Orchestrates complete disaster response analysis pipeline
 */
export const processDisasterAnalysis = async ({
  disasterType = 'Flood',
  resolvedInputs = [],
  roi = null,
  query = '',
  timestamps = [],
  eventDetails = {},
  sensorMetadata = {}
}) => {
  const inputValidation = validateDisasterInputs({ resolvedInputs, timestamps, disasterType });

  // Map pre / post / SAR image paths
  let prePath = null;
  let postPath = null;
  let sarPath = null;
  let postSarPath = null;

  resolvedInputs.forEach((inp, idx) => {
    const p = inp.path || '';
    const isSar = p.toLowerCase().includes('sar') || p.toLowerCase().includes('s1') || p.toLowerCase().includes('radar');
    if (isSar) {
      if (!sarPath) sarPath = p;
      else postSarPath = p;
    } else {
      if (!prePath) prePath = p;
      else postPath = p;
    }
  });

  // If only 1 optical image, treat it as post and duplicate for baseline comparison
  if (prePath && !postPath) {
    postPath = prePath;
  } else if (!prePath && postPath) {
    prePath = postPath;
  }

  // Fallback to first available if both still null
  if (!prePath && resolvedInputs.length > 0) {
    prePath = resolvedInputs[0].path;
    postPath = resolvedInputs[0].path;
  }

  // Enrich ROI GIS metadata
  const primaryMeta = resolvedInputs[0]?.metadata || {};
  const roiGis = roi ? computeGisMetadataForRoi(roi, primaryMeta) : null;

  const result = await executePythonDisasterInference({
    disasterType,
    preImagePath: prePath,
    postImagePath: postPath,
    sarImagePath: sarPath,
    postSarImagePath: postSarPath,
    imagePaths: resolvedInputs.map(i => i.path).filter(Boolean),
    roi: roiGis || {},
    eventDetails,
    sensorMetadata,
    query: query.trim()
  });

  return {
    ...result,
    validation: inputValidation,
    roi: roiGis
  };
};

export default {
  executePythonDisasterInference,
  validateDisasterInputs,
  processDisasterAnalysis
};
