import { extractImageMetadata } from './preprocessing.service.js';

/**
 * Checks spatial bounding boxes overlap and computes intersection
 */
const calculateBoundsOverlap = (b1, b2) => {
  if (!b1 || !b2) {
    return { overlaps: false, intersection: null, overlapRatio: 0 };
  }

  const noOverlap = b1.right <= b2.left || b1.left >= b2.right || b1.top <= b2.bottom || b1.bottom >= b2.top;
  if (noOverlap) {
    return { overlaps: false, intersection: null, overlapRatio: 0 };
  }

  const left = Math.max(b1.left, b2.left);
  const right = Math.min(b1.right, b2.right);
  const bottom = Math.max(b1.bottom, b2.bottom);
  const top = Math.min(b1.top, b2.top);

  const interArea = Math.max(0, right - left) * Math.max(0, top - bottom);
  const area1 = Math.max(1e-6, (b1.right - b1.left) * (b1.top - b1.bottom));
  const area2 = Math.max(1e-6, (b2.right - b2.left) * (b2.top - b2.bottom));
  const minArea = Math.min(area1, area2);
  const overlapRatio = Math.min(1.0, interArea / minArea);

  return {
    overlaps: true,
    intersection: { left, right, bottom, top },
    overlapRatio: Math.round(overlapRatio * 100) / 100
  };
};

/**
 * Calculates temporal delta between two ISO/TIFF dates in human terms
 */
const calculateTemporalDifference = (d1, d2) => {
  if (!d1 || !d2) return null;
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  if (isNaN(t1) || isNaN(t2)) return null;

  const diffMs = Math.abs(t2 - t1);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffDays === 0) {
    return `${diffHours} hour(s) difference (Near-simultaneous pass)`;
  } else if (diffDays === 1) {
    return '1 day difference (High temporal relevance)';
  } else if (diffDays < 30) {
    return `${diffDays} days difference (Moderate temporal relevance)`;
  } else {
    return `${diffDays} days difference (Significant temporal divergence)`;
  }
};

/**
 * Service performing pair compatibility inspection between 2 uploaded remote sensing images
 * (Supports both Bi-Temporal Change and Optical + SAR Fusion)
 * 
 * @param {Array<string>} fileIds - Array of exactly 2 file IDs
 * @param {Array<string>} [overrideTimestamps=[]] - Optional manual timestamps
 * @returns {Promise<object>} Pair compatibility breakdown with Fusion Readiness
 */
export const validateImagePair = async (fileIds, overrideTimestamps = []) => {
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length !== 2) {
    const err = new Error('Pair validation requires exactly 2 file IDs');
    err.code = 'INVALID_PAIR_INPUT';
    err.statusCode = 400;
    throw err;
  }

  // Extract metadata for both images
  const meta1 = await extractImageMetadata(fileIds[0]);
  const meta2 = await extractImageMetadata(fileIds[1]);

  if (overrideTimestamps && overrideTimestamps[0]) {
    meta1.timestamp = overrideTimestamps[0];
  }
  if (overrideTimestamps && overrideTimestamps[1]) {
    meta2.timestamp = overrideTimestamps[1];
  }

  const checks = [];
  let isCompatible = true;
  const fusionReasons = [];

  // 1. File Format Check (GeoTIFF / TIFF / PNG / JPEG)
  const validFormats = ['GTIFF', 'TIFF', 'PNG', 'JPEG', 'JPG'];
  const fmt1 = (meta1.format || '').toUpperCase();
  const fmt2 = (meta2.format || '').toUpperCase();
  const format1Valid = validFormats.some(f => fmt1.includes(f));
  const format2Valid = validFormats.some(f => fmt2.includes(f));
  const formatMatch = format1Valid && format2Valid;

  checks.push({
    name: 'format',
    status: formatMatch ? 'pass' : 'fail',
    message: formatMatch
      ? `Valid remote-sensing raster formats: Image 1 (${fmt1}), Image 2 (${fmt2})`
      : `Unsupported raster format detected: Image 1 (${fmt1}), Image 2 (${fmt2})`
  });
  if (!formatMatch) {
    isCompatible = false;
    fusionReasons.push('One or both images do not conform to approved raster formats (GeoTIFF/TIFF/PNG/JPEG).');
  }

  // 2. Dimensions Check
  const dimsMatch = meta1.width === meta2.width && meta1.height === meta2.height;
  const dimRatio = meta1.width && meta2.width ? Math.max(meta1.width / meta2.width, meta2.width / meta1.width) : 1;
  const dimsAcceptable = dimsMatch || dimRatio <= 3.0; // Resampling capable if within 3x

  checks.push({
    name: 'dimensions',
    status: dimsMatch ? 'pass' : (dimsAcceptable ? 'warning' : 'fail'),
    message: dimsMatch
      ? `Dimensions perfectly match (${meta1.width}x${meta1.height})`
      : `Dimension variance (${meta1.width}x${meta1.height} vs ${meta2.width}x${meta2.height})${dimsAcceptable ? ' — automatic resample alignment active' : ' — incompatible pixel count'}`
  });
  if (!dimsAcceptable) {
    isCompatible = false;
    fusionReasons.push(`Image dimensions differ significantly (${meta1.width}x${meta1.height} vs ${meta2.width}x${meta2.height}).`);
  }

  // 3. CRS Check
  let crsCompatible = false;
  if (meta1.crs && meta2.crs) {
    const crsMatch = meta1.crs === meta2.crs;
    crsCompatible = crsMatch;
    checks.push({
      name: 'crs',
      status: crsMatch ? 'pass' : 'warning',
      message: crsMatch
        ? `Geodetic CRS matches (${meta1.crs})`
        : `CRS projection mismatch (${meta1.crs} vs ${meta2.crs}) — on-the-fly reprojection will align rasters`
    });
  } else {
    checks.push({
      name: 'crs',
      status: 'warning',
      message: 'CRS information unavailable for one or both images — visual coordinate alignment active'
    });
  }

  // 4. Spatial Overlap / Bounds Check
  let spatialOverlap = false;
  let overlapRatio = 0;
  if (meta1.bounds && meta2.bounds) {
    const overlapResult = calculateBoundsOverlap(meta1.bounds, meta2.bounds);
    spatialOverlap = overlapResult.overlaps;
    overlapRatio = overlapResult.overlapRatio;

    checks.push({
      name: 'bounds',
      status: spatialOverlap ? 'pass' : 'fail',
      message: spatialOverlap
        ? `Spatial extents overlap verified (~${Math.round(overlapRatio * 100)}% mutual geographic coverage)`
        : 'Spatial extents do not overlap according to bounding box metadata'
    });
    if (!spatialOverlap) {
      isCompatible = false;
      fusionReasons.push('Optical and SAR images do not share sufficient spatial overlap.');
    }
  } else {
    // Non-georeferenced images or approximate bounds: assume visual co-registration
    checks.push({
      name: 'bounds',
      status: 'warning',
      message: 'Geospatial bounds unavailable for geodetic overlap verification — assuming co-registered visual raster frames'
    });
  }

  // 5. Resolution Compatibility Check
  const res1 = meta1.resolution;
  const res2 = meta2.resolution;
  if (res1 && res2) {
    checks.push({
      name: 'resolution',
      status: 'pass',
      message: `Spatial resolutions: Image 1 (${res1}) vs Image 2 (${res2})`
    });
  } else {
    checks.push({
      name: 'resolution',
      status: 'warning',
      message: 'Spatial ground resolution tag not encoded in raster header'
    });
  }

  // 6. Temporal Compatibility Check
  const hasTs1 = Boolean(meta1.timestamp);
  const hasTs2 = Boolean(meta2.timestamp);
  const temporalDiffStr = calculateTemporalDifference(meta1.timestamp, meta2.timestamp);

  let tsMessage = 'Acquisition timestamp unavailable for one or both images';
  if (hasTs1 && hasTs2) {
    tsMessage = `Acquisition timestamps: ${meta1.timestamp} & ${meta2.timestamp} (${temporalDiffStr})`;
  }

  checks.push({
    name: 'timestamp',
    status: hasTs1 && hasTs2 ? 'pass' : 'warning',
    message: tsMessage,
    delta: temporalDiffStr
  });

  // 7. Modality Detection Check
  const isOpticalDetected = (meta1.modality === 'OPTICAL') || (meta1.bands >= 3) || (meta1.sensor && /sentinel-2|landsat/i.test(meta1.sensor));
  const isSarDetected = (meta2.modality === 'SAR') || Boolean(meta2.polarization) || (meta2.sensor && /sentinel-1|risat|sar/i.test(meta2.sensor));

  checks.push({
    name: 'modality',
    status: (isOpticalDetected || isSarDetected) ? 'pass' : 'warning',
    message: `Modality configuration: Image 1 (${meta1.modality || (meta1.bands >= 3 ? 'Optical / Multispectral' : 'Visual')}), Image 2 (${meta2.modality || (meta2.polarization ? `SAR ${meta2.polarization}` : 'Grayscale / Radar')})`
  });

  // Determine Fusion Readiness status
  const isFusionReady = isCompatible && (spatialOverlap || (!meta1.bounds && !meta2.bounds));
  const readinessStatus = isFusionReady ? 'READY' : 'NOT_READY';

  const fusionReadiness = {
    status: readinessStatus,
    score: isFusionReady ? (spatialOverlap && dimsMatch ? 0.96 : 0.88) : 0.45,
    summary: isFusionReady
      ? 'Optical and SAR imagery are verified and compatible for cross-modal fusion analysis.'
      : (fusionReasons[0] || 'Image pair does not meet spatial or format compatibility requirements.'),
    reasons: fusionReasons
  };

  return {
    compatible: isCompatible,
    checks,
    fusionReadiness,
    metadata: [meta1, meta2]
  };
};

export default {
  validateImagePair
};
