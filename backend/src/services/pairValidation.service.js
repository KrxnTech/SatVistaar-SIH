import { extractImageMetadata } from './preprocessing.service.js';

/**
 * Checks spatial bounding boxes overlap
 */
const checkBoundsOverlap = (b1, b2) => {
  if (!b1 || !b2) return false;
  const noOverlap = b1.right <= b2.left || b1.left >= b2.right || b1.top <= b2.bottom || b1.bottom >= b2.top;
  return !noOverlap;
};

/**
 * Service performing pair compatibility inspection between 2 uploaded remote sensing images
 * 
 * @param {Array<string>} fileIds - Array of exactly 2 file IDs
 * @returns {Promise<object>} Pair compatibility breakdown
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

  // 1. Dimensions Check
  const dimsMatch = meta1.width === meta2.width && meta1.height === meta2.height;
  checks.push({
    name: 'dimensions',
    status: dimsMatch ? 'pass' : 'fail',
    message: dimsMatch
      ? `Dimensions match (${meta1.width}x${meta1.height})`
      : `Dimension mismatch (${meta1.width}x${meta1.height} vs ${meta2.width}x${meta2.height})`
  });
  if (!dimsMatch) isCompatible = false;

  // 2. CRS Check
  if (meta1.crs && meta2.crs) {
    const crsMatch = meta1.crs === meta2.crs;
    checks.push({
      name: 'crs',
      status: crsMatch ? 'pass' : 'fail',
      message: crsMatch ? `CRS matches (${meta1.crs})` : `CRS mismatch (${meta1.crs} vs ${meta2.crs})`
    });
    if (!crsMatch) isCompatible = false;
  } else {
    checks.push({
      name: 'crs',
      status: 'warning',
      message: 'CRS information unavailable for one or both images'
    });
    isCompatible = false;
  }

  // 3. Bounds Overlap Check
  if (meta1.bounds && meta2.bounds) {
    const overlap = checkBoundsOverlap(meta1.bounds, meta2.bounds);
    checks.push({
      name: 'bounds',
      status: overlap ? 'pass' : 'fail',
      message: overlap ? 'Spatial extents overlap' : 'Spatial extents do not overlap'
    });
    if (!overlap) isCompatible = false;
  } else {
    checks.push({
      name: 'bounds',
      status: 'warning',
      message: 'Geospatial bounds unavailable for spatial overlap verification'
    });
    isCompatible = false;
  }

  // 4. Timestamp Availability
  const hasTs1 = Boolean(meta1.timestamp);
  const hasTs2 = Boolean(meta2.timestamp);
  let tsMessage = 'Acquisition timestamp unavailable for one or both images';
  if (hasTs1 && hasTs2) {
    tsMessage = `Bi-temporal timestamps available: ${meta1.timestamp} (Old / T1) → ${meta2.timestamp} (New / T2)`;
  }
  checks.push({
    name: 'timestamp',
    status: hasTs1 && hasTs2 ? 'pass' : 'warning',
    message: tsMessage
  });

  // 5. Modality Metadata Availability
  checks.push({
    name: 'modality',
    status: 'warning',
    message: 'Modality metadata unavailable (deferred to future classification layer)'
  });

  return {
    compatible: isCompatible,
    checks,
    metadata: [meta1, meta2]
  };
};

export default {
  validateImagePair
};
