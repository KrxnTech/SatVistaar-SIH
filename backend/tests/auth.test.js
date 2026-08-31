import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';
import userRepository from '../src/auth/auth.repository.js';
import { AUTH_COOKIE_NAME } from '../src/auth/auth.controller.js';

console.log('================================================================');
console.log('🔐 SATVISTAAR AUTHENTICATION & SECURITY TEST SUITE');
console.log('================================================================\n');

const uploadsDir = path.resolve('uploads');
const testFiles = fs.existsSync(uploadsDir) 
  ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'))
  : [];
const sampleFileId = testFiles.length > 0 ? path.parse(testFiles[0]).name : 'test-id';

let server;
let serverPort;
let baseUrl;

function request(options, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const reqOptions = {
      hostname: '127.0.0.1',
      port: serverPort,
      path: options.path,
      method: options.method || 'GET',
      headers: defaultHeaders
    };

    const req = http.request(reqOptions, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          json = rawData;
        }

        const setCookie = res.headers['set-cookie'];
        let tokenCookie = null;
        if (setCookie) {
          const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
          const match = cookieStr.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
          if (match) {
            tokenCookie = match[1];
          }
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          cookie: tokenCookie,
          rawCookieHeader: setCookie
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runAuthTests() {
  let passed = 0;
  let total = 0;

  function test(name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name} ${details}`);
    } else {
      console.log(`  ❌ [FAIL] ${name} ${details}`);
    }
  }

  try {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        baseUrl = `http://127.0.0.1:${serverPort}`;
        console.log(`🚀 Test server listening on ${baseUrl}\n`);
        resolve();
      });
    });

    const testEmail = `analyst_${Date.now()}@satvistaar.ai`;
    const testPassword = 'Password123!';
    const testName = 'Dr. Vikram Sarabhai';
    let authCookie = null;

    console.log('--- 1. REGISTRATION TESTS ---');

    // 1.1 Valid Registration
    const regRes = await request({
      path: '/api/v1/auth/register',
      method: 'POST'
    }, {
      name: testName,
      email: testEmail,
      password: testPassword
    });

    test(
      'Register: Valid Registration returns 201 Created',
      regRes.statusCode === 201 && regRes.body?.success === true,
      `Status: ${regRes.statusCode}`
    );

    test(
      'Register: Sanitized user returned without passwordHash',
      regRes.body?.data?.user?.email === testEmail &&
      regRes.body?.data?.user?.passwordHash === undefined &&
      regRes.body?.data?.user?.password === undefined,
      `User ID: ${regRes.body?.data?.user?.id}`
    );

    test(
      'Register: Sets HTTP-only authentication cookie',
      !!regRes.cookie && (regRes.rawCookieHeader?.some(c => c.includes('HttpOnly')) ?? false),
      `Cookie length: ${regRes.cookie?.length || 0}`
    );

    authCookie = regRes.cookie;

    // 1.2 Duplicate Email
    const dupRes = await request({
      path: '/api/v1/auth/register',
      method: 'POST'
    }, {
      name: testName,
      email: testEmail,
      password: testPassword
    });

    test(
      'Register: Duplicate Email returns 409 Conflict',
      dupRes.statusCode === 409 && dupRes.body?.success === false,
      `Code: ${dupRes.body?.error?.code}`
    );

    // 1.3 Validation Errors (Short password, malformed email)
    const weakPassRes = await request({
      path: '/api/v1/auth/register',
      method: 'POST'
    }, {
      name: testName,
      email: 'invalid_email_format',
      password: '123'
    });

    test(
      'Register: Weak password & malformed email returns 400 Bad Request',
      weakPassRes.statusCode === 400 && weakPassRes.body?.success === false,
      `Status: ${weakPassRes.statusCode}`
    );

    console.log('\n--- 2. LOGIN TESTS ---');

    // 2.1 Valid Login
    const loginRes = await request({
      path: '/api/v1/auth/login',
      method: 'POST'
    }, {
      email: testEmail,
      password: testPassword
    });

    test(
      'Login: Valid credentials returns 200 OK',
      loginRes.statusCode === 200 && loginRes.body?.success === true,
      `Status: ${loginRes.statusCode}`
    );

    test(
      'Login: Returns sanitized user object',
      loginRes.body?.data?.user?.name === testName &&
      loginRes.body?.data?.user?.passwordHash === undefined,
      `Name: ${loginRes.body?.data?.user?.name}`
    );

    test(
      'Login: Sets HTTP-only cookie',
      !!loginRes.cookie,
      `Cookie captured`
    );

    // 2.2 Invalid Password
    const wrongPassRes = await request({
      path: '/api/v1/auth/login',
      method: 'POST'
    }, {
      email: testEmail,
      password: 'WrongPassword999!'
    });

    test(
      'Login: Invalid password returns 401 Unauthorized',
      wrongPassRes.statusCode === 401 && wrongPassRes.body?.success === false,
      `Code: ${wrongPassRes.body?.error?.code}`
    );

    // 2.3 Non-existent user
    const nonExistentRes = await request({
      path: '/api/v1/auth/login',
      method: 'POST'
    }, {
      email: 'nonexistent_ghost@satvistaar.ai',
      password: 'SomePassword123'
    });

    test(
      'Login: Non-existent account returns 401 Unauthorized',
      nonExistentRes.statusCode === 401 && nonExistentRes.body?.success === false,
      `Code: ${nonExistentRes.body?.error?.code}`
    );

    console.log('\n--- 3. CURRENT USER & SESSION TESTS ---');

    // 3.1 Authenticated /auth/me with Cookie
    const meWithCookieRes = await request({
      path: '/api/v1/auth/me',
      method: 'GET'
    }, null, {
      'Cookie': `${AUTH_COOKIE_NAME}=${loginRes.cookie}`
    });

    test(
      'Session: GET /auth/me with cookie returns 200 and user profile',
      meWithCookieRes.statusCode === 200 && meWithCookieRes.body?.data?.user?.email === testEmail,
      `Email: ${meWithCookieRes.body?.data?.user?.email}`
    );

    // 3.2 Authenticated /auth/me with Authorization Bearer header
    const meWithHeaderRes = await request({
      path: '/api/v1/auth/me',
      method: 'GET'
    }, null, {
      'Authorization': `Bearer ${loginRes.cookie}`
    });

    test(
      'Session: GET /auth/me with Bearer token returns 200 OK',
      meWithHeaderRes.statusCode === 200 && meWithHeaderRes.body?.data?.user?.email === testEmail,
      `User: ${meWithHeaderRes.body?.data?.user?.name}`
    );

    // 3.3 Unauthenticated /auth/me
    const meUnauthRes = await request({
      path: '/api/v1/auth/me',
      method: 'GET'
    });

    test(
      'Session: GET /auth/me without token returns 401 Unauthorized',
      meUnauthRes.statusCode === 401 && meUnauthRes.body?.success === false,
      `Code: ${meUnauthRes.body?.error?.code}`
    );

    // 3.4 Invalid token /auth/me
    const meInvalidTokenRes = await request({
      path: '/api/v1/auth/me',
      method: 'GET'
    }, null, {
      'Cookie': `${AUTH_COOKIE_NAME}=corrupted_invalid_jwt_token_string`
    });

    test(
      'Session: GET /auth/me with corrupted token returns 401 Unauthorized',
      meInvalidTokenRes.statusCode === 401 && meInvalidTokenRes.body?.success === false,
      `Code: ${meInvalidTokenRes.body?.error?.code}`
    );

    console.log('\n--- 4. LOGOUT TESTS ---');

    // 4.1 Logout while logged in
    const logoutRes = await request({
      path: '/api/v1/auth/logout',
      method: 'POST'
    }, null, {
      'Cookie': `${AUTH_COOKIE_NAME}=${loginRes.cookie}`
    });

    test(
      'Logout: POST /auth/logout returns 200 OK',
      logoutRes.statusCode === 200 && logoutRes.body?.success === true,
      `Message: ${logoutRes.body?.message}`
    );

    test(
      'Logout: Cookie is cleared',
      logoutRes.rawCookieHeader?.some(c => c.includes(`${AUTH_COOKIE_NAME}=;`)) ?? false,
      'Cleared cookie header verified'
    );

    // 4.2 Logout when already logged out (safe idempotent)
    const repeatedLogoutRes = await request({
      path: '/api/v1/auth/logout',
      method: 'POST'
    });

    test(
      'Logout: Idempotent logout when unauthenticated returns 200 OK',
      repeatedLogoutRes.statusCode === 200,
      'Safe logout'
    );

    console.log('\n--- 5. ROUTE PROTECTION TESTS ---');

    // 5.1 Public Health endpoint works without authentication
    const healthRes = await request({
      path: '/api/v1/health',
      method: 'GET'
    });

    test(
      'Route Protection: GET /health is PUBLIC and returns 200 OK',
      healthRes.statusCode === 200 && healthRes.body?.success === true,
      `Health status: ${healthRes.body?.data?.status}`
    );

    // 5.2 Protected Analysis route rejects unauthenticated request
    const unauthAnalysisRes = await request({
      path: '/api/v1/analysis',
      method: 'POST'
    }, {
      query: 'What is visible here?',
      fileIds: ['test-id']
    });

    test(
      'Route Protection: POST /analysis without token returns 401 Unauthorized',
      unauthAnalysisRes.statusCode === 401 && unauthAnalysisRes.body?.success === false,
      `Code: ${unauthAnalysisRes.body?.error?.code}`
    );

    // 5.3 Protected Upload route rejects unauthenticated request
    const unauthUploadRes = await request({
      path: '/api/v1/uploads',
      method: 'POST'
    });

    test(
      'Route Protection: POST /uploads without token returns 401 Unauthorized',
      unauthUploadRes.statusCode === 401 && unauthUploadRes.body?.success === false,
      `Code: ${unauthUploadRes.body?.error?.code}`
    );

    // 5.4 Protected Analysis route succeeds with authentication
    const authAnalysisRes = await request({
      path: '/api/v1/analysis',
      method: 'POST'
    }, {
      query: 'What is visible here?',
      fileIds: [sampleFileId],
      requestedTask: 'VQA'
    }, {
      'Cookie': `${AUTH_COOKIE_NAME}=${loginRes.cookie}`
    });

    // Should reach analysis service and complete successfully (200 OK)
    test(
      'Route Protection: POST /analysis with valid auth cookie passes auth barrier and executes',
      authAnalysisRes.statusCode === 200 && authAnalysisRes.body?.success === true,
      `Status: ${authAnalysisRes.statusCode}`
    );

    console.log('\n================================================================');
    console.log(`🎯 AUTH TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED`);
    console.log('================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL AUTHENTICATION & SECURITY TESTS PASSED PERFECTLY!\n');
    } else {
      console.error(`⚠️ ${total - passed} tests failed.`);
      process.exitCode = 1;
    }

  } catch (error) {
    console.error('Fatal test error:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runAuthTests();
