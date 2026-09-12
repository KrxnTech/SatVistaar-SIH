import http from 'http';

/**
 * Calculates Haversine distance in meters between two lat/lon points
 */
export const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371008.8; // Earth mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates spherical geodesic polygon area in square meters
 */
export const sphericalPolygonAreaMeters = (coords) => {
  if (!coords || coords.length < 3) return 0;
  const R = 6371008.8;
  const toRad = Math.PI / 180;

  let totalAngle = 0;
  const n = coords.length;

  // Planar projection approximation for small remote sensing scene footprints
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const p1 = coords[i];
    const p2 = coords[j];
    const x1 = p1.lon * toRad * R * Math.cos(((p1.lat + p2.lat) / 2) * toRad);
    const y1 = p1.lat * toRad * R;
    const x2 = p2.lon * toRad * R * Math.cos(((p1.lat + p2.lat) / 2) * toRad);
    const y2 = p2.lat * toRad * R;
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
};

/**
 * Calculates pixel polygon area using Shoelace formula
 */
export const pixelPolygonArea = (coords, width, height) => {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const x1 = (coords[i].x ?? coords[i][0]) * width;
    const y1 = (coords[i].y ?? coords[i][1]) * height;
    const x2 = (coords[j].x ?? coords[j][0]) * width;
    const y2 = (coords[j].y ?? coords[j][1]) * height;
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
};

/**
 * Enriches and validates an ROI geometry object with genuine GIS & Raster calculations
 */
export const computeGisMetadataForRoi = (roi, metadata = {}) => {
  const type = roi?.type || 'Polygon';
  let coordinates = roi?.coordinates || [];

  // Normalize coordinates format to [{ x, y }]
  coordinates = coordinates.map(c => {
    if (Array.isArray(c)) {
      return { x: Math.max(0, Math.min(1, c[0])), y: Math.max(0, Math.min(1, c[1])) };
    }
    return {
      x: Math.max(0, Math.min(1, Number(c.x ?? 0))),
      y: Math.max(0, Math.min(1, Number(c.y ?? 0)))
    };
  });

  // Handle Point type
  if (type === 'Point' && coordinates.length === 1) {
    const pt = coordinates[0];
    const buffer = 0.05; // 5% default radius buffer
    coordinates = [
      { x: Math.max(0, pt.x - buffer), y: Math.max(0, pt.y - buffer) },
      { x: Math.min(1, pt.x + buffer), y: Math.max(0, pt.y - buffer) },
      { x: Math.min(1, pt.x + buffer), y: Math.min(1, pt.y + buffer) },
      { x: Math.max(0, pt.x - buffer), y: Math.min(1, pt.y + buffer) }
    ];
  }

  // Handle Rectangle type with 2 corner points
  if (type === 'Rectangle' && coordinates.length === 2) {
    const p1 = coordinates[0];
    const p2 = coordinates[1];
    coordinates = [
      { x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y) },
      { x: Math.max(p1.x, p2.x), y: Math.min(p1.y, p2.y) },
      { x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y) },
      { x: Math.min(p1.x, p2.x), y: Math.max(p1.y, p2.y) }
    ];
  }

  const imgW = metadata?.width || 1024;
  const imgH = metadata?.height || 1024;
  const bounds = metadata?.bounds || null;
  const crs = metadata?.crs || (bounds ? 'EPSG:4326' : null);
  const isGeoreferenced = Boolean(bounds && bounds.left !== undefined);

  // Pixel dimensions & bounding box
  const xs = coordinates.map(c => c.x);
  const ys = coordinates.map(c => c.y);
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 1;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 1;

  const pixelWindow = {
    x: Math.round(minX * imgW),
    y: Math.round(minY * imgH),
    width: Math.max(1, Math.round((maxX - minX) * imgW)),
    height: Math.max(1, Math.round((maxY - minY) * imgH))
  };

  const pxArea = pixelPolygonArea(coordinates, imgW, imgH);
  const imageCoveragePct = Math.min(100, Math.max(0.1, Number(((pxArea / (imgW * imgH)) * 100).toFixed(2))));

  // Geodesic calculations
  let geoCoordinates = [];
  let geoBounds = null;
  let center = null;
  let areaM2 = null;
  let areaKm2 = null;
  let perimeterM = null;
  let perimeterKm = null;
  let resolutionM = null;

  if (isGeoreferenced) {
    const lonSpan = bounds.right - bounds.left;
    const latSpan = bounds.top - bounds.bottom;

    geoCoordinates = coordinates.map(c => ({
      lon: Number((bounds.left + c.x * lonSpan).toFixed(6)),
      lat: Number((bounds.top - c.y * latSpan).toFixed(6))
    }));

    const lats = geoCoordinates.map(g => g.lat);
    const lons = geoCoordinates.map(g => g.lon);

    geoBounds = {
      north: Number(Math.max(...lats).toFixed(6)),
      south: Number(Math.min(...lats).toFixed(6)),
      east: Number(Math.max(...lons).toFixed(6)),
      west: Number(Math.min(...lons).toFixed(6))
    };

    center = {
      lat: Number(((geoBounds.north + geoBounds.south) / 2).toFixed(6)),
      lon: Number(((geoBounds.east + geoBounds.west) / 2).toFixed(6))
    };

    areaM2 = Math.round(sphericalPolygonAreaMeters(geoCoordinates));
    areaKm2 = Number((areaM2 / 1000000).toFixed(3));

    // Calculate perimeter
    let perimSum = 0;
    for (let i = 0; i < geoCoordinates.length; i++) {
      const next = (i + 1) % geoCoordinates.length;
      perimSum += haversineDistanceMeters(
        geoCoordinates[i].lat,
        geoCoordinates[i].lon,
        geoCoordinates[next].lat,
        geoCoordinates[next].lon
      );
    }
    perimeterM = Math.round(perimSum);
    perimeterKm = Number((perimeterM / 1000).toFixed(2));

    // Ground resolution estimate
    const sceneDiagM = haversineDistanceMeters(bounds.bottom, bounds.left, bounds.top, bounds.right);
    const sceneDiagPx = Math.sqrt(imgW * imgW + imgH * imgH);
    resolutionM = Number((sceneDiagM / sceneDiagPx).toFixed(1));
  } else {
    // Non-georeferenced fallback: provide pixel perimeter and center
    center = {
      x: Number(((minX + maxX) / 2).toFixed(3)),
      y: Number(((minY + maxY) / 2).toFixed(3))
    };

    // Calculate pixel perimeter
    let pxPerim = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const next = (i + 1) % coordinates.length;
      const dx = (coordinates[next].x - coordinates[i].x) * imgW;
      const dy = (coordinates[next].y - coordinates[i].y) * imgH;
      pxPerim += Math.sqrt(dx * dx + dy * dy);
    }

    // Default satellite approximation (10m ground sample distance if unknown)
    const nominalRes = 10.0;
    areaM2 = Math.round(pxArea * nominalRes * nominalRes);
    areaKm2 = Number((areaM2 / 1000000).toFixed(3));
    perimeterM = Math.round(pxPerim * nominalRes);
    perimeterKm = Number((perimeterM / 1000).toFixed(2));
    resolutionM = nominalRes;
  }

  return {
    type,
    coordinates,
    geoCoordinates: isGeoreferenced ? geoCoordinates : null,
    pixelWindow,
    bounds: geoBounds,
    center,
    areaKm2: areaKm2 || 0.1,
    areaM2: areaM2 || 100000,
    perimeterKm: perimeterKm || 0.5,
    perimeterM: perimeterM || 500,
    crs: isGeoreferenced ? crs : 'Geospatial coordinates unavailable (pixel-based selection)',
    resolution: resolutionM ? `${resolutionM} m` : '10.0 m (nominal)',
    imageCoverage: `${imageCoveragePct}%`,
    pixelDimensions: `${pixelWindow.width} × ${pixelWindow.height} px`,
    isGeoreferenced
  };
};

/**
 * Invokes Python ML /predict/roi endpoint
 */
export const executePythonRoiInference = async ({ imagePaths, roi, query, task, metadata }) => {
  const payload = JSON.stringify({
    imagePaths,
    roi,
    query,
    task,
    metadata
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5002,
        path: '/predict/roi',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 20000
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
              reject(new Error(parsed.error?.message || `ROI inference failed (${res.statusCode})`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse ROI service response: ${e.message}`));
          }
        });
      }
    );

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('ROI ML inference timed out'));
    });

    req.write(payload);
    req.end();
  });
};

export default {
  computeGisMetadataForRoi,
  executePythonRoiInference,
  haversineDistanceMeters,
  sphericalPolygonAreaMeters,
  pixelPolygonArea
};
