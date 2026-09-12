import fs from 'fs';
import path from 'path';
import { generateToken } from '../src/auth/auth.service.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🌐 SATVISTAAR E2E MULTIMODAL & REGRESSION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Test ${total}: ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${message}`);
    }
  }

  try {
    // Generate valid test token
    const token = generateToken({
      id: 'test_operator_admin',
      email: 'operator@satvistaar.isro.gov.in',
      name: 'SatVistaar Test Operator',
      role: 'ADMIN'
    });
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };

    // 1. Upload Optical and SAR test rasters
    const optPath = path.resolve('uploads/demo_sentinel2_optical.png');
    const sarPath = path.resolve('uploads/demo_sentinel1_sar.png');

    const optBuffer = fs.readFileSync(optPath);
    const sarBuffer = fs.readFileSync(sarPath);

    const form = new FormData();
    form.append('images', new Blob([optBuffer], { type: 'image/png' }), 'demo_sentinel2_optical.png');
    form.append('images', new Blob([sarBuffer], { type: 'image/png' }), 'demo_sentinel1_sar.png');

    const uploadRes = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: authHeaders,
      body: form
    });
    const uploadJson = await uploadRes.json();

    assert(uploadJson.success === true, 'Upload endpoint responds with success');
    assert(uploadJson.data?.files?.length === 2, '2 test rasters successfully uploaded and registered');

    const fileOptId = uploadJson.data.files[0].id;
    const fileSarId = uploadJson.data.files[1].id;

    // 2. Test OPTICAL_SAR_FUSION Analysis
    console.log('\n--- Testing OPTICAL_SAR_FUSION ---');
    const fusionRes = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Perform joint optical and SAR analysis to detect urban built-up areas and water bodies',
        fileIds: [fileOptId, fileSarId],
        requestedTask: 'OPTICAL_SAR_FUSION'
      })
    });
    const fusionJson = await fusionRes.json();
    const fusionData = fusionJson.data || {};
    const fusionResult = fusionData.result || {};

    assert(fusionJson.success === true, 'Fusion analysis responds with success');
    assert(fusionResult.task === 'OPTICAL_SAR_FUSION' || fusionData.intent?.name === 'OPTICAL_SAR_FUSION', 'Analysis task is OPTICAL_SAR_FUSION');
    assert(Array.isArray(fusionResult.opticalFindings) && fusionResult.opticalFindings.length > 0, 'opticalFindings array is populated');
    assert(Array.isArray(fusionResult.sarFindings) && fusionResult.sarFindings.length > 0, 'sarFindings array is populated');
    assert(Array.isArray(fusionResult.fusionFindings) && fusionResult.fusionFindings.length > 0, 'fusionFindings array is populated');
    const agreementCls = fusionResult.modalityAgreement?.classification || (Array.isArray(fusionResult.modalityAgreement) && fusionResult.modalityAgreement[0]?.classification);
    assert(Boolean(agreementCls), 'modalityAgreement classification is present');

    const agreementScore = fusionResult.modalityAgreement?.score || (Array.isArray(fusionResult.modalityAgreement) && fusionResult.modalityAgreement[0]?.confidence) || fusionResult.confidenceBreakdown?.crossModalAgreement;
    assert(typeof agreementScore === 'number', 'modalityAgreement score is a valid number');

    const overallConf = fusionResult.confidenceBreakdown?.overall ?? fusionResult.confidenceBreakdown?.overallConfidence;
    assert(overallConf !== undefined, 'confidenceBreakdown overall score is present');
    assert(Array.isArray(fusionResult.grounding?.regions), 'grounding regions array is present');

    // 3. Regression Test: VQA
    console.log('\n--- Regression Testing VQA ---');
    const vqaRes = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What objects and land cover are visible in this scene?',
        fileIds: [fileOptId],
        requestedTask: 'VQA'
      })
    });
    const vqaJson = await vqaRes.json();
    const vqaResult = vqaJson.data?.result || {};
    assert(vqaJson.success === true && (vqaResult.task === 'VQA' || vqaJson.data?.intent?.name === 'VQA'), 'VQA task succeeds without regression');

    // 4. Regression Test: CAPTIONING
    console.log('\n--- Regression Testing CAPTIONING ---');
    const capRes = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Describe this satellite image in comprehensive detail.',
        fileIds: [fileOptId],
        requestedTask: 'CAPTIONING'
      })
    });
    const capJson = await capRes.json();
    const capResult = capJson.data?.result || {};
    assert(capJson.success === true && (capResult.task === 'CAPTIONING' || capJson.data?.intent?.name === 'CAPTIONING'), 'CAPTIONING task succeeds without regression');

    // 5. Regression Test: FEATURE_IDENTIFICATION
    console.log('\n--- Regression Testing FEATURE_IDENTIFICATION ---');
    const featRes = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Where are the primary runways and buildings located?',
        fileIds: [fileOptId],
        requestedTask: 'FEATURE_IDENTIFICATION'
      })
    });
    const featJson = await featRes.json();
    const featResult = featJson.data?.result || {};
    assert(featJson.success === true && (featResult.task === 'FEATURE_IDENTIFICATION' || featJson.data?.intent?.name === 'FEATURE_IDENTIFICATION'), 'FEATURE_IDENTIFICATION task succeeds without regression');

    // 6. Regression Test: CHANGE_ANALYSIS
    console.log('\n--- Regression Testing CHANGE_ANALYSIS ---');
    const chgRes = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What changed between these two satellite scenes?',
        fileIds: [fileOptId, fileSarId],
        requestedTask: 'CHANGE_ANALYSIS',
        timestamps: ['2023-01-15', '2024-03-20']
      })
    });
    const chgJson = await chgRes.json();
    const chgResult = chgJson.data?.result || {};
    assert(chgJson.success === true && (chgResult.task === 'CHANGE_ANALYSIS' || chgJson.data?.intent?.name === 'CHANGE_ANALYSIS'), 'CHANGE_ANALYSIS task succeeds without regression');

    console.log('\n====================================================');
    console.log(`📊 E2E TEST SUMMARY: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
    console.log('====================================================\n');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal E2E test failure:', err);
    process.exit(1);
  }
}

runE2ETests();
