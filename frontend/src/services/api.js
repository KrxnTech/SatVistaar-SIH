/**
 * SatVistaar Frontend API Client
 * Centralized service for all HTTP communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1';

/**
 * Helper to build full endpoint URL
 */
const getUrl = (endpoint) => `${API_BASE_URL}${API_PREFIX}${endpoint}`;

/**
 * Check backend health status
 * @returns {Promise<{ ok: boolean, status: string, message?: string }>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(getUrl('/health'), { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        status: data.data?.status || 'healthy',
        message: data.message
      };
    }
    // Fallback prefix alias
    const fallbackRes = await fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return { ok: true, status: data.data?.status || 'healthy', message: data.message };
    }
    return { ok: false, status: 'unhealthy' };
  } catch (err) {
    return { ok: false, status: 'offline', error: err.message };
  }
}

/**
 * Upload an image file to the backend
 * @param {File} file - Browser File object
 * @returns {Promise<{ success: boolean, fileId: string, metadata: object, error?: string }>}
 */
export async function uploadImageFile(file) {
  const formData = new FormData();
  formData.append('images', file);

  try {
    const res = await fetch(getUrl('/uploads'), {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error?.message || `Upload failed with status ${res.status}`);
    }

    const uploaded = data.data?.files?.[0];
    if (!uploaded) {
      throw new Error('No uploaded file metadata returned by server.');
    }

    const fileId = uploaded.id || uploaded.fileId || (uploaded.storedName ? uploaded.storedName.split('.')[0] : null);

    return {
      success: true,
      fileId,
      originalName: uploaded.originalName,
      size: uploaded.size,
      mimeType: uploaded.mimeType,
      metadata: uploaded
    };
  } catch (err) {
    console.error('[API uploadImageFile Error]:', err);
    throw err;
  }
}

/**
 * Fetch image metadata for an uploaded file
 * @param {string} fileId 
 * @returns {Promise<object>}
 */
export async function getImageMetadata(fileId) {
  try {
    const res = await fetch(getUrl(`/uploads/${fileId}/metadata`));
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.warn(`[API getImageMetadata Warning] Could not fetch metadata for ${fileId}:`, err);
    return null;
  }
}

/**
 * Send an analysis request to the backend
 * @param {object} params
 * @param {string} params.query - User natural language query
 * @param {string[]} params.fileIds - Array of 1 or 2 file IDs
 * @param {string} [params.requestedTask] - Optional task override
 * @returns {Promise<object>} Full backend JSON response
 */
export async function analyzeSatelliteImages({ query, fileIds, requestedTask = null, timestamps = null }) {
  if (!query || !query.trim()) {
    throw new Error('Please provide an analysis query.');
  }

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error('Please upload at least one satellite image.');
  }

  const payload = {
    query: query.trim(),
    fileIds,
    ...(requestedTask && { requestedTask }),
    ...(timestamps && timestamps.length > 0 && { timestamps })
  };

  try {
    const res = await fetch(getUrl('/analysis'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.message || data.error?.message || `Analysis request failed (${res.status})`;
      const err = new Error(errMsg);
      err.statusCode = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.error('[API analyzeSatelliteImages Error]:', err);
    throw err;
  }
}

export default {
  checkBackendHealth,
  uploadImageFile,
  getImageMetadata,
  analyzeSatelliteImages,
  API_BASE_URL
};
