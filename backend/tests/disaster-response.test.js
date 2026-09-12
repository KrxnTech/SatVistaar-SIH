import assert from 'assert';
import { processAnalysisRequest } from '../src/services/analysis.service.js';
import { classifyIntent } from '../src/agent/intentClassifier.js';
import { INTENTS } from '../src/agent/intents.js';
import { validateDisasterInputs } from '../src/services/disaster.service.js';

console.log('====================================================');
console.log('🚨 SATVISTAAR DISASTER RESPONSE INTELLIGENCE TEST SUITE');
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

(async () => {
  await test('1. Classifies natural language disaster queries to DISASTER_RESPONSE and NISAR_ANALYSIS intents', () => {
    const q1 = classifyIntent({ query: 'What critical infrastructure is affected by the disaster?' });
    assert.strictEqual(q1.intent, INTENTS.DISASTER_RESPONSE, `Expected DISASTER_RESPONSE but got ${q1.intent}`);

    const q2 = classifyIntent({ query: 'Which roads and buildings are in the emergency evacuation zone?' });
    assert.strictEqual(q2.intent, INTENTS.DISASTER_RESPONSE, `Expected DISASTER_RESPONSE but got ${q2.intent}`);

    const q3 = classifyIntent({ query: 'Analyze NISAR radar deformation and surface change' });
    assert.strictEqual(q3.intent, INTENTS.NISAR_ANALYSIS, `Expected NISAR_ANALYSIS but got ${q3.intent}`);
  });

  await test('2. Validates temporal chronological ordering and detects inversions', () => {
    // Correct chronological ordering
    const valid = validateDisasterInputs({
      resolvedInputs: [{ path: 'uploads/demo_sentinel2_optical.png' }],
      timestamps: ['2026-08-10', '2026-09-12']
    });
    assert.strictEqual(valid.valid, true);
    assert.strictEqual(valid.warnings.length, 0);

    // Inverted ordering
    const inverted = validateDisasterInputs({
      resolvedInputs: [{ path: 'uploads/demo_sentinel2_optical.png' }],
      timestamps: ['2026-09-15', '2026-08-01']
    });
    assert.strictEqual(inverted.valid, true);
    assert(inverted.warnings.some(w => w.includes('Chronological inversion')), 'Warning on temporal inversion');
  });

  await test('3. Executes complete DISASTER_RESPONSE analysis for Flood event with operational KPIs', async () => {
    const req = {
      query: 'Evaluate flood extent and affected buildings inside this sector',
      fileIds: ['demo_sentinel2_optical.png', 'demo_sentinel1_sar.png'],
      requestedTask: 'DISASTER_RESPONSE',
      disasterType: 'Flood',
      eventDetails: {
        name: 'Ahmedabad Monsoon Inundation Incident',
        date: '2026-09-12'
      },
      roi: {
        type: 'Rectangle',
        coordinates: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }],
        areaKm2: 48.5
      }
    };

    const res = await processAnalysisRequest(req, 'test-disaster-req-1');
    assert(res && res.result, 'Analysis result returned');
    assert.strictEqual(res.result.scope, 'DISASTER');
    assert.strictEqual(res.result.task, 'DISASTER_RESPONSE');

    const kpis = res.result.kpis;
    assert(kpis, 'KPIs object present');
    assert(typeof kpis.impactedFootprintKm2 === 'number', 'Impacted footprint is number');
    assert(typeof kpis.affectedBuildingsCount === 'number', 'Affected buildings count is number');
    assert(typeof kpis.roadDisruptionPct === 'number', 'Road disruption percentage is number');
    assert(typeof kpis.priority1Count === 'number', 'Priority 1 count is number');
    assert(kpis.confidence >= 0.70 && kpis.confidence <= 0.98, 'Calibrated confidence in valid range');
  });

  await test('4. Derives 4-class flood partition and water expansion footprint', async () => {
    const req = {
      query: 'What is the flood water expansion inside the AOI?',
      fileIds: ['test_river_scene.png', 'test_urban_scene.png'],
      requestedTask: 'DISASTER_RESPONSE',
      disasterType: 'Flood',
      roi: {
        type: 'Polygon',
        coordinates: [
          { x: 0.2, y: 0.2 },
          { x: 0.8, y: 0.2 },
          { x: 0.8, y: 0.8 },
          { x: 0.2, y: 0.8 }
        ],
        areaKm2: 32.0
      }
    };

    const res = await processAnalysisRequest(req, 'test-flood-metrics');
    const hazard = res.result.hazardMetrics;

    assert(hazard, 'Hazard metrics object present');
    assert.strictEqual(hazard.hazardType, 'Flood Inundation');
    assert(typeof hazard.preEventWaterKm2 === 'number');
    assert(typeof hazard.postEventWaterKm2 === 'number');
    assert(hazard.fourClassPartition, '4-class partition present');
    const sumPart = hazard.fourClassPartition.stableLand +
                    hazard.fourClassPartition.preExistingWater +
                    hazard.fourClassPartition.newlyInundated +
                    hazard.fourClassPartition.saturatedSoil;
    assert(Math.abs(sumPart - 100.0) < 2.0, `Partition must sum near 100%, got ${sumPart}%`);
  });

  await test('5. Distinguishes NISAR sensor metadata and enforces InSAR deformation caveats', async () => {
    // Case A: Generic SAR (e.g. Sentinel-1)
    const reqGeneric = {
      query: 'Check radar backscatter',
      fileIds: ['demo_sentinel1_sar.png'],
      requestedTask: 'NISAR_ANALYSIS',
      sensorMetadata: { sensor: 'Sentinel-1', band: 'C-band', hasCoherence: false }
    };
    const resGeneric = await processAnalysisRequest(reqGeneric, 'test-generic-sar');
    assert.strictEqual(resGeneric.result.nisarIntelligence.isNisar, false);
    assert(resGeneric.result.nisarIntelligence.deformationCaveat.includes('Coherent interferometric SAR pair (InSAR) required'),
           'Caveat enforced when coherence data absent');

    // Case B: Confirmed NISAR metadata
    const reqNisar = {
      query: 'Check NISAR L-band observations',
      fileIds: ['demo_sentinel1_sar.png'],
      requestedTask: 'NISAR_ANALYSIS',
      sensorMetadata: { sensor: 'NISAR', band: 'L-band (1.25 GHz)', hasCoherence: true, hasInterferogram: true }
    };
    const resNisar = await processAnalysisRequest(reqNisar, 'test-nisar-confirmed');
    assert.strictEqual(resNisar.result.nisarIntelligence.isNisar, true);
    assert.strictEqual(resNisar.result.nisarIntelligence.hasCoherenceData, true);
    assert(resNisar.result.nisarIntelligence.sensorName.includes('NISAR Dual-Frequency'));
  });

  await test('6. Evaluates 5-level damage assessment and candidate cluster items', async () => {
    const req = {
      query: 'Identify candidate damaged buildings and facilities',
      fileIds: ['test_urban_scene.png'],
      requestedTask: 'DISASTER_RESPONSE',
      disasterType: 'Earthquake'
    };

    const res = await processAnalysisRequest(req, 'test-damage-assessment');
    const dmg = res.result.damageAssessment;

    assert(dmg, 'Damage assessment object present');
    const totalDmgPct = dmg.stablePct + dmg.potentialPct + dmg.moderatePct + dmg.highPct + dmg.uncertainPct;
    assert(Math.abs(totalDmgPct - 100.0) < 1.0, `Damage levels must sum to 100%, got ${totalDmgPct}%`);
    assert(Array.isArray(dmg.candidateRegions), 'Candidate regions array present');
    assert(dmg.candidateRegions.length >= 3, 'Multiple candidate regions detected');

    const firstRegion = dmg.candidateRegions[0];
    assert(firstRegion.id && firstRegion.label && firstRegion.category, 'Region has ID, label, category');
    assert(firstRegion.coordinates && typeof firstRegion.coordinates.x === 'number', 'Coordinates present');
  });

  await test('7. Intersects critical infrastructure and computes road accessibility', async () => {
    const req = {
      query: 'Check hospital access and bridge status',
      fileIds: ['demo_sentinel2_optical.png'],
      requestedTask: 'DISASTER_RESPONSE',
      disasterType: 'Flood'
    };

    const res = await processAnalysisRequest(req, 'test-infrastructure');
    const infra = res.result.criticalInfrastructure;
    const roads = res.result.roadAccessibility;

    assert(infra, 'Critical infrastructure present');
    assert(infra.hospitals && typeof infra.hospitals.exposed === 'number', 'Hospital exposure tracked');
    assert(infra.bridges && typeof infra.bridges.exposed === 'number', 'Bridge exposure tracked');

    assert(roads, 'Road accessibility present');
    assert(typeof roads.normalPct === 'number' && typeof roads.disruptedPct === 'number', 'Road percentages present');
    assert(Array.isArray(roads.accessBottlenecks), 'Access bottlenecks identified');
  });

  await test('8. Ranks priority zones and synthesizes model-based risk scenarios', async () => {
    const req = {
      query: 'What areas should receive attention first and what could happen next?',
      fileIds: ['demo_sentinel2_optical.png'],
      requestedTask: 'DISASTER_RESPONSE',
      disasterType: 'Flood'
    };

    const res = await processAnalysisRequest(req, 'test-priority-scenario');
    const pz = res.result.priorityZones;
    const scenario = res.result.riskScenario;

    assert(pz.priority1 && pz.priority2 && pz.priority3 && pz.monitoring, 'All 4 priority categories present');
    assert(pz.priority1.recommendedAction, 'Priority 1 has recommended action');

    assert(scenario, 'Risk scenario present');
    assert(scenario.label.includes('MODEL-BASED SCENARIO'), 'Explicit scenario caveat label');
    assert(typeof scenario.projectedFootprintKm2 === 'number', 'Projected footprint calculated');
  });

  await test('9. Answers compound disaster queries with situational awareness', async () => {
    const req = {
      query: 'Which buildings are inside the flooded area and what roads are cut off?',
      fileIds: ['demo_sentinel2_optical.png', 'demo_sentinel1_sar.png'],
      requestedTask: 'DISASTER_RESPONSE',
      disasterType: 'Flood'
    };

    const res = await processAnalysisRequest(req, 'test-compound-query');
    const sitAw = res.result.situationalAwareness;

    assert(sitAw.whatHappened, 'What happened answered');
    assert(sitAw.where, 'Where answered');
    assert(sitAw.howLarge, 'How large answered');
    assert(sitAw.whatIsAffected, 'What is affected answered');
    assert(sitAw.whatNeedsAttention, 'What needs attention answered');
    assert(res.result.answerText.length > 50, 'Substantive natural-language answer text provided');
  });

  console.log(`\nResults: ${passed}/${total} passed (${passed === total ? 'ALL PASSED' : 'SOME FAILED'})`);
  process.exit(passed === total ? 0 : 1);
})();
