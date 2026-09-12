import assert from 'assert';
import {
  computeGisMetadataForRoi,
  haversineDistanceMeters,
  sphericalPolygonAreaMeters,
  pixelPolygonArea
} from '../src/services/roi.service.js';
import { processAnalysisRequest } from '../src/services/analysis.service.js';

console.log('====================================================');
console.log('🛰️ SATVISTAAR UNIVERSAL ROI ANALYSIS UNIT TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let total = 0;

const test = async (name, fn) => {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
};

const sampleGeoMetadata = {
  width: 1024,
  height: 1024,
  crs: 'EPSG:4326',
  isGeoreferenced: true,
  bounds: {
    left: 72.80,
    bottom: 18.90,
    right: 73.00,
    top: 19.10
  }
};

const sampleNonGeoMetadata = {
  width: 800,
  height: 600,
  crs: null,
  isGeoreferenced: false,
  bounds: null
};

(async () => {
  await test('1. Calculates accurate Haversine geodesic distance in meters', () => {
    const dist = haversineDistanceMeters(18.90, 72.80, 19.10, 73.00);
    assert(dist > 28000, 'Distance should be greater than 28 km');
    assert(dist < 35000, 'Distance should be less than 35 km');
  });

  await test('2. Computes GIS metrics correctly for Polygon ROI on georeferenced raster', () => {
    const polygonRoi = {
      type: 'Polygon',
      coordinates: [
        { x: 0.2, y: 0.2 },
        { x: 0.8, y: 0.2 },
        { x: 0.8, y: 0.7 },
        { x: 0.2, y: 0.7 }
      ]
    };

    const gis = computeGisMetadataForRoi(polygonRoi, sampleGeoMetadata);

    assert.strictEqual(gis.type, 'Polygon');
    assert.strictEqual(gis.isGeoreferenced, true);
    assert.strictEqual(gis.crs, 'EPSG:4326');
    assert(gis.areaKm2 > 0, 'Area should be positive');
    assert(gis.perimeterKm > 0, 'Perimeter should be positive');
    assert(gis.center.lat > 18.90 && gis.center.lat < 19.10, 'Center lat within bounds');
    assert(gis.center.lon > 72.80 && gis.center.lon < 73.00, 'Center lon within bounds');
    assert(gis.pixelWindow.width > 500, 'Pixel width calculated');
    assert(gis.pixelWindow.height > 400, 'Pixel height calculated');
  });

  await test('3. Computes metrics gracefully for non-georeferenced images without fabricating CRS', () => {
    const rectRoi = {
      type: 'Rectangle',
      coordinates: [
        { x: 0.1, y: 0.1 },
        { x: 0.5, y: 0.5 }
      ]
    };

    const gis = computeGisMetadataForRoi(rectRoi, sampleNonGeoMetadata);

    assert.strictEqual(gis.type, 'Rectangle');
    assert.strictEqual(gis.isGeoreferenced, false);
    assert(gis.crs.includes('Geospatial coordinates unavailable'), 'Transparent CRS notice');
    assert.strictEqual(gis.pixelWindow.width, 320);
    assert.strictEqual(gis.pixelWindow.height, 240);
    assert.strictEqual(gis.center.x, 0.3);
    assert.strictEqual(gis.center.y, 0.3);
  });

  await test('4. Handles Point ROI with automatic buffer polygon expansion', () => {
    const pointRoi = {
      type: 'Point',
      coordinates: [{ x: 0.5, y: 0.5 }]
    };

    const gis = computeGisMetadataForRoi(pointRoi, sampleGeoMetadata);

    assert.strictEqual(gis.type, 'Point');
    assert.strictEqual(gis.coordinates.length, 4, 'Buffer box has 4 corners');
    assert(gis.pixelWindow.width > 50, 'Buffer width calculated');
  });

  await test('5. Executes processAnalysisRequest in ROI scope with full execution trace', async () => {
    const req = {
      query: 'What is the dominant land cover inside this selected region?',
      fileIds: ['demo_sentinel2_optical.png'],
      requestedTask: 'VQA',
      scope: 'ROI',
      roi: {
        type: 'Polygon',
        coordinates: [
          { x: 0.25, y: 0.25 },
          { x: 0.75, y: 0.25 },
          { x: 0.75, y: 0.75 },
          { x: 0.25, y: 0.75 }
        ]
      }
    };

    const res = await processAnalysisRequest(req, 'test-roi-req-1');

    assert(res, 'Result returned');
    assert.strictEqual(res.result.scope, 'ROI');
    assert(res.result.dominantClass, 'Dominant class computed');
    assert(res.result.statistics, 'Statistics object present');
    assert.strictEqual(res.result.statistics.isCalculated, true);
    assert(typeof res.result.statistics.vegetation === 'number', 'Vegetation % is number');
    assert(typeof res.result.statistics.builtup === 'number', 'Built-up % is number');
    assert(res.trace, 'Trace object present');
    assert(res.trace.events.length >= 4, 'Multiple trace events recorded');
  });

  await test('6. Urban Built-up Sub-window is correctly classified as Built-up (NOT Water Body)', async () => {
    const urbanReq = {
      query: 'Analyze land cover within this urban neighborhood',
      fileIds: ['test_urban_scene.png'],
      requestedTask: 'VQA',
      scope: 'ROI',
      roi: {
        type: 'Rectangle',
        coordinates: [
          { x: 0.1, y: 0.1 },
          { x: 0.9, y: 0.9 }
        ]
      }
    };

    const res = await processAnalysisRequest(urbanReq, 'test-urban-roi');
    const stats = res.result.statistics;

    assert.strictEqual(res.result.dominantClass, 'Built-up', `Expected Built-up but got ${res.result.dominantClass}`);
    assert(stats.builtup > 50, `Built-up should be > 50%, got ${stats.builtup}%`);
    assert(stats.water === 0, `Water should be 0% for urban area, got ${stats.water}%`);
  });

  await test('7. River Sub-window is correctly classified as Water Body (NOT Bare Soil)', async () => {
    const riverReq = {
      query: 'Examine this water body sector',
      fileIds: ['test_river_scene.png'],
      requestedTask: 'VQA',
      scope: 'ROI',
      roi: {
        type: 'Rectangle',
        coordinates: [
          // Tight box directly over the center river bend
          { x: 0.50, y: 0.35 },
          { x: 0.65, y: 0.60 }
        ]
      }
    };

    const res = await processAnalysisRequest(riverReq, 'test-river-roi');
    const stats = res.result.statistics;

    assert.strictEqual(res.result.dominantClass, 'Water Body', `Expected Water Body but got ${res.result.dominantClass}`);
    assert(stats.water > 50, `Water should be > 50%, got ${stats.water}%`);
    assert(stats.bareSoil === 0, `Bare soil should be 0%, got ${stats.bareSoil}%`);
  });

  await test('8. Land-cover percentages strictly sum to 100.0% with mutual exclusivity', async () => {
    const testReq = {
      query: 'Examine land cover',
      fileIds: ['test_urban_scene.png'],
      requestedTask: 'VQA',
      scope: 'ROI',
      roi: {
        type: 'Rectangle',
        coordinates: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.8 }]
      }
    };

    const res = await processAnalysisRequest(testReq, 'test-sum-roi');
    const stats = res.result.statistics;
    const totalPct = stats.vegetation + stats.builtup + stats.water + stats.bareSoil;

    assert(Math.abs(totalPct - 100.0) < 0.2, `Percentages must sum to 100%, got ${totalPct}%`);
    assert(stats.vegetation >= 0 && stats.builtup >= 0 && stats.water >= 0 && stats.bareSoil >= 0, 'No negative percentages');
  });

  await test('9. ROI Telemetry returns extracted crop thumbnail and OpenCV spatial metrics', async () => {
    const testReq = {
      query: 'Check telemetry metrics',
      fileIds: ['test_urban_scene.png'],
      requestedTask: 'VQA',
      scope: 'ROI',
      roi: {
        type: 'Rectangle',
        coordinates: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.8 }]
      }
    };

    const res = await processAnalysisRequest(testReq, 'test-telemetry-roi');
    const debug = res.result.roiDebug;

    assert(debug, 'roiDebug object must be present in result');
    assert(debug.cropThumbnailUrl && debug.cropThumbnailUrl.startsWith('data:image/jpeg;base64,'), 'Valid base64 crop thumbnail generated');
    assert(debug.cropDimensions && debug.cropDimensions.length === 2, 'Crop dimensions [h, w] present');
    assert(debug.texture && typeof debug.texture.edgeDensity === 'number', 'Canny edge density present');
    assert(debug.texture.edgeDensity > 0.1, `Urban edge density should be > 0.1, got ${debug.texture.edgeDensity}`);
    assert(debug.spectral && typeof debug.spectral.meanVari === 'number', 'Spectral VARI index present');
  });

  await test('10. Confidence is dynamically calculated and calibrated (not hardcoded 0.93)', async () => {
    const reqUrban = {
      query: 'Land cover check',
      fileIds: ['test_urban_scene.png'],
      requestedTask: 'VQA',
      scope: 'ROI',
      roi: { type: 'Rectangle', coordinates: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }] }
    };

    const res = await processAnalysisRequest(reqUrban, 'test-conf-roi');
    assert(typeof res.result.confidence === 'number', 'Confidence is a number');
    assert(res.result.confidence !== 0.93, `Confidence must not be hardcoded 0.93, got ${res.result.confidence}`);
    assert(res.result.confidence >= 0.70 && res.result.confidence <= 0.99, 'Confidence is within valid 0.70-0.99 range');
  });

  console.log(`\nResults: ${passed}/${total} passed (${passed === total ? 'ALL PASSED' : 'SOME FAILED'})`);
  process.exit(passed === total ? 0 : 1);
})();
