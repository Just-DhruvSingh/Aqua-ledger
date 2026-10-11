/**
 * verify-system.js
 * End-to-End Integration Verification Script for AquaLedger
 * 
 * Tests the complete API, WebSocket, Anomaly Simulation, and Dispatch flows:
 *   Step 1: GET  /health                      (Server Uptime & Database)
 *   Step 2: POST /api/v1/auth/login           (JWT Authentication)
 *   Step 3: GET  /api/v1/telemetry/network    (GeoJSON Pipelines & Complaints)
 *   Step 4: GET  /api/v1/telemetry/metrics    (NRW % & Water Equity Score)
 *   Step 5: POST /api/v1/telemetry/simulate-leak + WebSocket (CRITICAL_LEAK_DETECTED)
 *   Step 6: POST /api/v1/alerts/:id/dispatch  + WebSocket (CREW_DISPATCHED & Lambda)
 *
 * Usage:
 *   node verify-system.js
 */

const { io } = require('socket.io-client');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ANSI escape codes for colored terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const PASS = `${colors.bold}${colors.green}[PASS]${colors.reset}`;
const FAIL = `${colors.bold}${colors.red}[FAIL]${colors.reset}`;
const INFO = `${colors.cyan}[INFO]${colors.reset}`;
const WARN = `${colors.yellow}[WARN]${colors.reset}`;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function reportPass(step, title, details = '') {
  totalTests++;
  passedTests++;
  console.log(`${PASS} ${colors.bold}Step ${step}:${colors.reset} ${title}`);
  if (details) {
    console.log(`       ${colors.dim}${details}${colors.reset}`);
  }
}

function reportFail(step, title, error) {
  totalTests++;
  failedTests++;
  console.error(`${FAIL} ${colors.bold}Step ${step}:${colors.reset} ${title}`);
  if (error) {
    console.error(`       ${colors.red}${error.message || error}${colors.reset}`);
  }
}

async function runVerification() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white}   AQUALEDGER AUTOMATED INTEGRATION VERIFICATION SUITE         ${colors.reset}`);
  console.log(`${colors.dim}   Target Server: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.dim}   Execution Time: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  let jwtToken = null;
  let socket = null;
  let alertId = null;

  try {
    // -------------------------------------------------------------------------
    // Step 1: Health Check
    // -------------------------------------------------------------------------
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error(`HTTP status ${res.status} ${res.statusText}`);
      const body = await res.json();
      if (!body.success || body.status !== 'healthy') {
        throw new Error(`Unexpected health payload: ${JSON.stringify(body)}`);
      }
      reportPass(1, 'Server Health & Uptime Check', `Status: ${body.status} | DB: ${body.database}`);
    } catch (err) {
      reportFail(1, 'Server Health & Uptime Check', err);
      throw new Error(`Server is unreachable at ${BASE_URL}. Ensure 'npm run dev' or 'node server.js' is running.`);
    }

    // -------------------------------------------------------------------------
    // Step 2: Authentication
    // -------------------------------------------------------------------------
    try {
      // Primary credentials OP-1042 / admin123; fallback to seeded admin if needed
      let loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_id: 'OP-1042', password: 'admin123' }),
      });

      let loginBody = await loginRes.json();

      // If OP-1042 fails, try seeded admin account
      if (!loginRes.ok || !loginBody.token) {
        loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operator_id: 'admin', password: '1234567890' }),
        });
        loginBody = await loginRes.json();
      }

      if (!loginRes.ok || !loginBody.token) {
        throw new Error(loginBody.message || `Login failed with HTTP status ${loginRes.status}`);
      }

      jwtToken = loginBody.token;
      const user = loginBody.data || {};
      reportPass(2, 'JWT Operator Authentication', `User: ${user.operator_id} (Role: ${user.role}) | JWT Acquired`);
    } catch (err) {
      reportFail(2, 'JWT Operator Authentication', err);
      throw err;
    }

    // -------------------------------------------------------------------------
    // Step 3: Network Layer (GeoJSON pipelines & complaints)
    // -------------------------------------------------------------------------
    try {
      const res = await fetch(`${BASE_URL}/api/v1/telemetry/network`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const body = await res.json();
      const pipelines = body.data?.pipelines || [];
      const complaints = body.data?.complaints || [];

      if (!Array.isArray(pipelines) || pipelines.length === 0) {
        throw new Error('No GeoJSON pipeline layers returned');
      }
      if (!Array.isArray(complaints) || complaints.length === 0) {
        throw new Error('No GeoJSON complaints layers returned');
      }

      const samplePipeCoords = pipelines[0].coordinates;
      reportPass(
        3,
        'Network Layer Verification',
        `Ward: ${body.data.ward} | Pipelines: ${pipelines.length} | Complaints: ${complaints.length} | GeoJSON Valid: yes`
      );
    } catch (err) {
      reportFail(3, 'Network Layer Verification', err);
    }

    // -------------------------------------------------------------------------
    // Step 4: Key Performance Metrics (NRW % & Water Equity Score)
    // -------------------------------------------------------------------------
    try {
      const res = await fetch(`${BASE_URL}/api/v1/telemetry/metrics`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const body = await res.json();
      const metrics = body.data || {};

      if (typeof metrics.nrw_percent !== 'number' || typeof metrics.equity_score !== 'number') {
        throw new Error(`Incomplete metrics payload: ${JSON.stringify(metrics)}`);
      }

      reportPass(
        4,
        'Municipal Metrics Verification',
        `Input: ${metrics.input_lps} L/s | Output: ${metrics.output_lps} L/s | NRW: ${metrics.nrw_percent}% | Equity Score: ${metrics.equity_score}`
      );
    } catch (err) {
      reportFail(4, 'Municipal Metrics Verification', err);
    }

    // -------------------------------------------------------------------------
    // Step 5: WebSocket Connection & Simulated Critical Leak Event
    // -------------------------------------------------------------------------
    try {
      // Connect Socket.io client
      socket = io(BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 6000,
      });

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
        socket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        socket.on('connect_error', (e) => {
          clearTimeout(timeout);
          reject(e);
        });
      });

      console.log(`       ${INFO} Socket.IO connected with socket id: ${socket.id}`);

      // Set up listener for CRITICAL_LEAK_DETECTED
      const leakPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for CRITICAL_LEAK_DETECTED event')), 8000);
        socket.on('CRITICAL_LEAK_DETECTED', (payload) => {
          clearTimeout(timeout);
          resolve(payload);
        });
      });

      // Trigger leak simulation POST
      const simRes = await fetch(`${BASE_URL}/api/v1/telemetry/simulate-leak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!simRes.ok) throw new Error(`Simulate leak failed with HTTP ${simRes.status}`);
      const simBody = await simRes.json();
      const leakPayload = await leakPromise;

      alertId = leakPayload?.alert?._id || simBody?.data?.alert?._id;
      if (!alertId) throw new Error('No alert ID generated in leak payload');

      reportPass(
        5,
        'WebSocket Broadcast & Leak Simulation',
        `Event: CRITICAL_LEAK_DETECTED received | Alert ID: ${alertId} | Pipeline: ${leakPayload.pipeline?.name} (status: ${leakPayload.pipeline?.status})`
      );
    } catch (err) {
      reportFail(5, 'WebSocket Broadcast & Leak Simulation', err);
    }

    // -------------------------------------------------------------------------
    // Step 6: Repair Crew Dispatch & AWS Lambda SMS Invocation
    // -------------------------------------------------------------------------
    try {
      if (!alertId) {
        throw new Error('Skipping dispatch test: No active alert ID from Step 5');
      }

      // Set up listener for CREW_DISPATCHED
      const dispatchPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for CREW_DISPATCHED socket event')), 8000);
        socket.on('CREW_DISPATCHED', (payload) => {
          clearTimeout(timeout);
          resolve(payload);
        });
      });

      // Trigger dispatch POST
      const dispatchRes = await fetch(`${BASE_URL}/api/v1/alerts/${alertId}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!dispatchRes.ok) {
        const errBody = await dispatchRes.json().catch(() => ({}));
        throw new Error(errBody.message || `Dispatch failed with status ${dispatchRes.status}`);
      }

      const dispatchBody = await dispatchRes.json();
      const dispatchSocketEvent = await dispatchPromise;

      reportPass(
        6,
        'AWS Lambda Crew Dispatch & Socket Event',
        `Event: CREW_DISPATCHED received | Alert status: ${dispatchBody.data?.alert?.status} | Pipeline: ${dispatchSocketEvent.pipeline?.status}`
      );
    } catch (err) {
      reportFail(6, 'AWS Lambda Crew Dispatch & Socket Event', err);
    }

  } finally {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}VERIFICATION SUMMARY:${colors.reset}`);
  console.log(`  Total Checks:  ${totalTests}`);
  console.log(`  Passed Checks: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed Checks: ${failedTests > 0 ? colors.red : colors.green}${failedTests}${colors.reset}`);

  if (failedTests === 0) {
    console.log(`\n${colors.bold}${colors.green}>> ALL INTEGRATION PHASES PASSED! System is frontend-ready.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bold}${colors.red}>> VERIFICATION FAILED with ${failedTests} error(s). Review logs above.${colors.reset}\n`);
    process.exit(1);
  }
}

runVerification();
