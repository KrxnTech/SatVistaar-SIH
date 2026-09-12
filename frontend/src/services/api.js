/**
 * SatVistaar Frontend API Client
 * Centralized service for all HTTP communication with the backend
 */

// 1. API Base URL resolution: Environment variable or production Render fallback
const envApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
).trim().replace(/\/+$/, '');

export const API_BASE_URL = envApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://satvistaar.onrender.com');
const API_PREFIX = '/api/v1';

/**
 * Helper to build full endpoint URL
 */
export const getUrl = (endpoint) => `${API_BASE_URL}${API_PREFIX}${endpoint}`;

/**
 * Persistent JWT Bearer token management (for resilient cross-origin auth between Vercel & Render)
 */
export const AUTH_TOKEN_KEY = 'satvistaar_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota or access errors in restricted browser modes
  }
}

export function getAuthHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Robust response parser: handles both valid JSON and server/proxy HTML error responses
 */
async function parseResponse(res, defaultErrMsg = 'Request failed') {
  const contentType = res.headers.get('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      const cleanSnippet = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
      const err = new Error(`Server error (${res.status}): ${cleanSnippet || res.statusText || 'Endpoint unavailable'}`);
      err.statusCode = res.status;
      throw err;
    }
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: true, message: text };
    }
  }

  if (!res.ok) {
    const errMsg = data.message || data.error?.message || `${defaultErrMsg} (${res.status})`;
    const err = new Error(errMsg);
    err.statusCode = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Check backend health status
 * @returns {Promise<{ ok: boolean, status: string, message?: string }>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(getUrl('/health'), {
      credentials: 'include',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await parseResponse(res);
      return {
        ok: true,
        status: data.data?.status || 'healthy',
        message: data.message
      };
    }
    // Fallback prefix alias
    const fallbackRes = await fetch(`${API_BASE_URL}/api/health`, {
      credentials: 'include',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(4000)
    });
    if (fallbackRes.ok) {
      const data = await parseResponse(fallbackRes);
      return { ok: true, status: data.data?.status || 'healthy', message: data.message };
    }
    return { ok: false, status: 'unhealthy' };
  } catch (err) {
    return { ok: false, status: 'offline', error: err.message };
  }
}

/**
 * Register a new user account
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ success: boolean, user: object, message?: string }>}
 */
export async function registerUser({ name, email, password }) {
  const res = await fetch(getUrl('/auth/register'), {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    credentials: 'include',
    body: JSON.stringify({ name, email, password })
  });

  const data = await parseResponse(res, 'Registration failed');
  const token = data.data?.token || data.token;
  if (token) {
    setStoredToken(token);
  }

  return data.data || data;
}

/**
 * Log in with user credentials
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ success: boolean, user: object, message?: string }>}
 */
export async function loginUser({ email, password }) {
  const res = await fetch(getUrl('/auth/login'), {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await parseResponse(res, 'Invalid email or password');
  const token = data.data?.token || data.token;
  if (token) {
    setStoredToken(token);
  }

  return data.data || data;
}

/**
 * Log out current session
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function logoutUser() {
  try {
    const res = await fetch(getUrl('/auth/logout'), {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await parseResponse(res, 'Logout failed');
    return data;
  } catch (err) {
    console.warn('[API logoutUser Warning]:', err);
    return { success: true };
  } finally {
    setStoredToken(null);
  }
}

/**
 * Retrieve authenticated user profile
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  try {
    const res = await fetch(getUrl('/auth/me'), {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        setStoredToken(null);
      }
      return null;
    }

    const data = await parseResponse(res, 'Failed to fetch current user');
    return data.data?.user || data.user || null;
  } catch (err) {
    console.warn('[API getCurrentUser Warning]:', err);
    return null;
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
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData
    });

    const data = await parseResponse(res, 'Upload failed');
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
    const res = await fetch(getUrl(`/uploads/${fileId}/metadata`), {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await parseResponse(res, 'Could not fetch image metadata');
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
      headers: getAuthHeaders({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await parseResponse(res, 'Analysis request failed');
    return data;
  } catch (err) {
    console.error('[API analyzeSatelliteImages Error]:', err);
    throw err;
  }
}

/**
 * Send an ROI Selected Area analysis request to the backend
 * @param {object} params
 * @param {string} params.query - ROI specific question
 * @param {string[]} params.fileIds - Array of 1 or 2 file IDs
 * @param {string} params.requestedTask - Primary analysis task
 * @param {object} params.roi - ROI geometry object with coordinates and bounds
 * @param {string[]} [params.timestamps] - Optional timestamps
 * @returns {Promise<object>} Full backend JSON response
 */
export async function analyzeRoiRegion({ query, fileIds, requestedTask, roi, timestamps = null }) {
  if (!query || !query.trim()) {
    throw new Error('Please provide an ROI analysis question.');
  }

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error('Please upload at least one satellite image.');
  }

  if (!roi || !roi.coordinates || roi.coordinates.length < 2) {
    throw new Error('Please select an area on the satellite image first.');
  }

  const payload = {
    query: query.trim(),
    fileIds,
    requestedTask,
    scope: 'ROI',
    roi,
    ...(timestamps && timestamps.length > 0 && { timestamps })
  };

  try {
    const res = await fetch(getUrl('/analysis'), {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await parseResponse(res, 'ROI analysis failed');
    return data;
  } catch (err) {
    console.error('[API analyzeRoiRegion Error]:', err);
    throw err;
  }
}

/**
 * Run Advanced Geospatial Intelligence Suite analysis
 * (Time-Series, Flood, Change Matrix, Optical vs SAR Difference, Object Inventory)
 */
export async function analyzeGeointSuite({
  task = 'ALL',
  fileIds = [],
  roi = null,
  query = '',
  timestamps = [],
  options = {}
}) {
  const payload = {
    query: query?.trim() || `Advanced Geospatial Suite ${task} analysis`,
    fileIds,
    requestedTask: task,
    scope: roi ? 'ROI' : 'GEOINT',
    ...(roi && { roi }),
    ...(timestamps && timestamps.length > 0 && { timestamps }),
    options
  };

  try {
    const res = await fetch(getUrl('/analysis'), {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await parseResponse(res, 'Geospatial Suite analysis failed');
    return data;
  } catch (err) {
    console.error('[API analyzeGeointSuite Error]:', err);
    throw err;
  }
}

/**
 * Run Dedicated Disaster Response Intelligence Mode analysis
 * (Flood, Cyclone, Landslide, Wildfire, Earthquake, NISAR SAR analytics)
 */
export async function analyzeDisaster({
  disasterType = 'FLOOD',
  fileIds = [],
  roi = null,
  query = '',
  timestamps = [],
  sensorModality = 'AUTO',
  options = {}
}) {
  const isNisar = options.isNisar || sensorModality === 'NISAR';
  const payload = {
    query: query?.trim() || `Disaster Response Intelligence: ${disasterType}`,
    fileIds,
    requestedTask: isNisar ? 'NISAR_ANALYSIS' : 'DISASTER_RESPONSE',
    disasterType,
    sensorModality,
    scope: 'DISASTER',
    ...(roi && { roi }),
    ...(timestamps && timestamps.length > 0 && { timestamps }),
    options: {
      ...options,
      disasterType,
      sensorModality
    }
  };

  try {
    const res = await fetch(getUrl('/analysis'), {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await parseResponse(res, 'Disaster Response analysis failed');
    return data;
  } catch (err) {
    console.error('[API analyzeDisaster Error]:', err);
    throw err;
  }
}

export default {
  checkBackendHealth,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  uploadImageFile,
  getImageMetadata,
  analyzeSatelliteImages,
  analyzeRoiRegion,
  analyzeGeointSuite,
  analyzeDisaster,
  getStoredToken,
  setStoredToken,
  API_BASE_URL
};
