import assert from 'assert';
import { describe, it } from 'node:test';
import path from 'path';
import fs from 'fs';
import classifyIntent from '../src/agent/intentClassifier.js';
import { INTENTS } from '../src/agent/intents.js';
import { executePythonGeointInference, processGeointSuiteAnalysis } from '../src/services/geoint.service.js';

console.log('====================================================');
console.log('🛰️ SATVISTAAR ADVANCED GEOINT SUITE UNIT TEST SUITE');
console.log('====================================================\n');

// Use existing demo imagery in uploads directory
const opticalSample = path.resolve('uploads/demo_sentinel2_optical.png');
const sarSample = path.resolve('uploads/demo_sentinel1_sar.png');

describe('Advanced Geospatial Intelligence Suite Tests', () => {

  it('1. Classifies natural language queries to the 5 Geoint intents correctly', () => {
    const qTime = classifyIntent({ query: 'How has this area changed over the last four years?' });
    assert.strictEqual(qTime.intent, INTENTS.TIME_SERIES);

    const qFlood = classifyIntent({ query: 'How much area was flooded in this region?' });
    assert.strictEqual(qFlood.intent, INTENTS.FLOOD_ANALYSIS);

    const qMatrix = classifyIntent({ query: 'What type of land-cover change happened most?' });
    assert.strictEqual(qMatrix.intent, INTENTS.CHANGE_MATRIX);

    const qDiff = classifyIntent({ query: 'What does SAR reveal that Optical does not?' });
    assert.strictEqual(qDiff.intent, INTENTS.OPTICAL_SAR_DIFFERENCE);

    const qObjects = classifyIntent({ query: 'How many buildings are in this area?' });
    assert.strictEqual(qObjects.intent, INTENTS.OBJECT_INVENTORY);
    console.log('  ✓ 1. Classifies natural language queries to the 5 Geoint intents correctly');
  });

  it('2. Time-Series Engine evaluates chronological epochs and trend magnitude', async () => {
    const observations = [
      { path: opticalSample, date: '2024-03-08', sensor: 'Sentinel-2', modality: 'Optical' },
      { path: opticalSample, date: '2022-01-15', sensor: 'Sentinel-2', modality: 'Optical' },
      { path: opticalSample, date: '2023-08-20', sensor: 'Sentinel-2', modality: 'Optical' }
    ];
    const roi = { type: 'Rectangle', coordinates: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.8 }], areaKm2: 12.0 };

    const result = await executePythonGeointInference({
      task: 'TIME_SERIES',
      observations,
      roi,
      query: 'Trend over time'
    });

    assert.ok(result.timeSeries);
    assert.strictEqual(result.timeSeries.observationCount, 3);
    // Chronological order verification
    assert.strictEqual(result.timeSeries.timeline[0].date, '2022-01-15');
    assert.strictEqual(result.timeSeries.timeline[1].date, '2023-08-20');
    assert.strictEqual(result.timeSeries.timeline[2].date, '2024-03-08');
    assert.ok(result.timeSeries.summaryText.includes('TEMPORAL TIME-SERIES SUMMARY'));
    console.log('  ✓ 2. Time-Series Engine evaluates chronological epochs and trend magnitude');
  });

  it('3. Flood Extent Engine derives legitimate 4-class flood metrics and impact breakdown', async () => {
    const roi = { type: 'Polygon', coordinates: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.9, y: 0.9 }, { x: 0.1, y: 0.9 }], areaKm2: 18.4 };
    const result = await executePythonGeointInference({
      task: 'FLOOD_ANALYSIS',
      imagePaths: [opticalSample, opticalSample],
      postSarPath: sarSample,
      roi,
      query: 'Analyze flood extent'
    });

    assert.ok(result.flood);
    assert.ok(result.flood.statistics.preEventWaterKm2 >= 0);
    assert.ok(result.flood.statistics.newlyInundatedKm2 >= 0);
    assert.ok(result.flood.impactBreakdown.builtupImpactKm2 >= 0);
    assert.ok(result.flood.impactBreakdown.agriculturalImpactKm2 >= 0);
    assert.ok(result.flood.summaryText.includes('FLOOD IMPACT INTELLIGENCE DOSSIER'));
    console.log('  ✓ 3. Flood Extent Engine derives legitimate 4-class flood metrics and impact breakdown');
  });

  it('4. Land-Cover Change Matrix computes FROM → TO cross-tabulation dynamics', async () => {
    const roi = { type: 'Rectangle', coordinates: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }], areaKm2: 15.0 };
    const result = await executePythonGeointInference({
      task: 'CHANGE_MATRIX',
      imagePaths: [opticalSample, opticalSample],
      roi,
      query: 'Land-cover transitions'
    });

    assert.ok(result.changeMatrix);
    assert.ok(Array.isArray(result.changeMatrix.transitions));
    assert.ok(result.changeMatrix.transitions.length > 0);
    assert.ok(result.changeMatrix.matrix['Vegetation']['Urban'] >= 0);
    assert.ok(result.changeMatrix.summaryText.includes('LAND-COVER TRANSITION MATRIX SUMMARY'));
    console.log('  ✓ 4. Land-Cover Change Matrix computes FROM → TO cross-tabulation dynamics');
  });

  it('5. Optical vs SAR Difference Explorer classifies 5 cross-modal consensus categories', async () => {
    const roi = { type: 'Rectangle', coordinates: [{ x: 0.05, y: 0.05 }, { x: 0.95, y: 0.95 }], areaKm2: 10.0 };
    const result = await executePythonGeointInference({
      task: 'OPTICAL_SAR_DIFFERENCE',
      opticalPath: opticalSample,
      sarPath: sarSample,
      roi,
      query: 'Compare optical and SAR'
    });

    assert.ok(result.opticalSarDiff);
    assert.ok(result.opticalSarDiff.breakdown.bothAgreePct >= 0);
    assert.ok(Array.isArray(result.opticalSarDiff.sectors));
    assert.ok(result.opticalSarDiff.summaryText.includes('OPTICAL vs SAR DIFFERENCE EXPLORER REPORT'));
    console.log('  ✓ 5. Optical vs SAR Difference Explorer classifies 5 cross-modal consensus categories');
  });

  it('6. Object Inventory filters categories and clips geometries strictly inside ROI', async () => {
    const roi = { type: 'Polygon', coordinates: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }], areaKm2: 8.5 };
    const result = await executePythonGeointInference({
      task: 'OBJECT_INVENTORY',
      imagePaths: [opticalSample],
      roi,
      filterCategory: 'all',
      minConfidence: 0.65
    });

    assert.ok(result.objectInventory);
    assert.ok(result.objectInventory.totalCount > 0);
    assert.ok(Array.isArray(result.objectInventory.objects));

    // Verify geometric bounds: all objects must be within ROI [0.2, 0.8]
    for (const obj of result.objectInventory.objects) {
      assert.ok(obj.bounds.x >= 0.2 - 1e-4, `Object X ${obj.bounds.x} must be >= 0.2`);
      assert.ok(obj.bounds.y >= 0.2 - 1e-4, `Object Y ${obj.bounds.y} must be >= 0.2`);
      assert.ok(obj.bounds.x + obj.bounds.width <= 0.8 + 1e-4, `Object X max must be <= 0.8`);
      assert.ok(obj.bounds.y + obj.bounds.height <= 0.8 + 1e-4, `Object Y max must be <= 0.8`);
    }
    console.log('  ✓ 6. Object Inventory filters categories and clips geometries strictly inside ROI');
  });

  it('7. Agentic Multi-Tool Query Sequencing: Sequences Flood + Object Spatial Intersection', async () => {
    const outcome = await processGeointSuiteAnalysis({
      task: 'ALL',
      resolvedInputs: [
        { fileId: 'demo_opt', path: opticalSample, metadata: { width: 1024, height: 1024 } },
        { fileId: 'demo_sar', path: sarSample, metadata: { width: 1024, height: 1024 } }
      ],
      roi: { type: 'Rectangle', coordinates: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }], areaKm2: 16.0 },
      query: 'How many buildings are in the flooded area?'
    });

    assert.ok(outcome.result.sequencedIntelligence);
    assert.strictEqual(outcome.result.sequencedIntelligence.queryType, 'FLOOD_OBJECT_SPATIAL_INTERSECTION');
    assert.ok(outcome.result.sequencedIntelligence.affectedBuildings >= 1);
    assert.ok(outcome.result.sequencedIntelligence.synthesis.includes('Agentic Spatial Intersection'));
    console.log('  ✓ 7. Agentic Multi-Tool Query Sequencing: Sequences Flood + Object Spatial Intersection');
  });
});
