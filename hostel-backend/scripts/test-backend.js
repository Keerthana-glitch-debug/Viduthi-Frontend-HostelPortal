/**
 * scripts/test-backend.js
 * Comprehensive automated verification test suite for Vidudhi MERN backend.
 */

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { app, server } = require('../server');

const BASE_URL = 'http://localhost:5000';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================================');
  console.log(' STARTING AUTOMATED BACKEND VERIFICATION TEST SUITE');
  console.log(' Database Target: MongoDB Cluster keerthana');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('--- 1. Testing Health & API Root ---');
    const health = await makeRequest('/api/health');
    assert(health.status === 200, 'GET /api/health returned HTTP 200');
    assert(health.body.database && health.body.database.cluster === 'keerthana', 'Target database cluster is keerthana');

    // 2. Test Login for ALL 5+ User Accounts
    console.log('\n--- 2. Testing Authentication for 6 Authentic Accounts ---');
    const accountsToTest = [
      { id: '24104031', pass: 'Vidudhi@2026', role: 'student', name: 'Keerthana G.' },
      { id: 'kavya.n@vidudhi.edu', pass: 'Vidudhi@2026', role: 'student', name: 'Kavya N.' },
      { id: 'priya.m@vidudhi.edu', pass: 'Vidudhi@2026', role: 'student', name: 'Priya M.' },
      { id: 'WRD-1001', pass: 'Vidudhi@2026', role: 'warden', name: 'Dr. R. Sundaram' },
      { id: 'ADM-0001', pass: 'Vidudhi@2026', role: 'admin', name: 'Prof. K. Venkatesh' },
      { id: 'STF-2004', pass: 'Vidudhi@2026', role: 'staff', name: 'S. Ramanathan' },
    ];

    const tokens = {};

    for (const acc of accountsToTest) {
      const res = await makeRequest('/api/auth/login', 'POST', {
        identifier: acc.id,
        password: acc.pass,
      });

      assert(res.status === 200, `Login successful for ${acc.name} (${acc.role})`);
      assert(Boolean(res.body.token), `JWT token generated for ${acc.name}`);
      assert(res.body.user.role === acc.role, `Correct role returned: ${res.body.user.role}`);
      tokens[acc.role] = res.body.token;
    }

    // 3. RBAC Verification
    console.log('\n--- 3. Testing RBAC Security & Forbidden Access ---');
    // Student attempting admin overview
    const studentBlocked = await makeRequest('/api/admin/overview', 'GET', null, tokens.student);
    assert(studentBlocked.status === 403, 'Student is forbidden from /api/admin/overview (HTTP 403)');

    // Admin accessing admin overview
    const adminAllowed = await makeRequest('/api/admin/overview', 'GET', null, tokens.admin);
    assert(adminAllowed.status === 200, 'Admin can access /api/admin/overview (HTTP 200)');
    assert(adminAllowed.body.data && adminAllowed.body.data.facilities, 'Admin overview returned facility analytics');

    // 4. Non-CRUD Feature: GPS Geofence & HMAC SHA-256 Attendance Engine
    console.log('\n--- 4. Testing Non-CRUD GPS Geofence & Cryptographic Token Engine ---');
    // Test point inside hostel geofence (13.0827, 80.2707)
    const insideCheckIn = await makeRequest('/api/attendance/check-in', 'POST', {
      lat: 13.0827,
      lng: 80.2707,
      accuracy: 4,
      biometricVerified: true,
    }, tokens.student);

    assert(insideCheckIn.status === 200, 'GPS Check-In accepted (HTTP 200)');
    assert(insideCheckIn.body.data.record.status === 'Present', 'Check-In verified status is "Present"');
    assert(insideCheckIn.body.data.record.distanceFromGateMeters < 50, `Distance calculated by Haversine: ${insideCheckIn.body.data.record.distanceFromGateMeters}m`);
    assert(Boolean(insideCheckIn.body.data.record.auditHash), `Tamper-proof HMAC SHA-256 audit hash created: ${insideCheckIn.body.data.record.auditHash.slice(0, 16)}...`);

    // 5. Non-CRUD Feature: What-If Capacity & Resource Simulator
    console.log('\n--- 5. Testing What-If Algorithmic Capacity & Resource Simulator ---');
    const simResult = await makeRequest('/api/simulation/forecast', 'POST', {
      scenarioKey: 'EXAM_PREP',
      totalCapacity: 500,
      occupancyPercent: 95,
      customPowerCutHours: 3,
      currentReservoirLiters: 48000,
    }, tokens.warden);

    assert(simResult.status === 200, 'Simulation run returned HTTP 200');
    assert(simResult.body.data.projectedMetrics.water.hourlyBurnRateLiters > 0, `Water drawdown calculated: ${simResult.body.data.projectedMetrics.water.hourlyBurnRateLiters} L/hr`);
    assert(simResult.body.data.projectedMetrics.electricity.peakDemandKW > 0, `Peak electrical load: ${simResult.body.data.projectedMetrics.electricity.peakDemandKW} kW`);
    assert(simResult.body.data.actionChecklist.length > 0, `Generated ${simResult.body.data.actionChecklist.length} dynamic warden action items`);

    // 6. Testing Recently Accessed Endpoint
    console.log('\n--- 6. Testing "Recently Accessed" Resource Tracking ---');
    const recent = await makeRequest('/api/user/recently-accessed', 'GET', null, tokens.student);
    assert(recent.status === 200, 'GET /api/user/recently-accessed returned HTTP 200');
    assert(recent.body.items && recent.body.items.length > 0, `Retrieved ${recent.body.items.length} recently accessed items`);

    // 7. Testing Chatbot Rulebook Query
    console.log('\n--- 7. Testing Intelligent Chatbot Rule Engine ---');
    const chat = await makeRequest('/api/chatbot/query', 'POST', {
      query: 'What are the dining hall mess timings for dinner?',
    });
    assert(chat.status === 200, 'Chatbot returned HTTP 200');
    assert(chat.body.answer.includes('Dinner: 07:45 PM – 09:30 PM'), 'Chatbot accurately resolved mess dinner timings');

    console.log('\n========================================================');
    console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================\n');

    server.close();
    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed:', err);
    server.close();
    process.exit(1);
  }
}

// Wait 1.5s for server/mongoose connection before firing tests
setTimeout(runTests, 1500);
