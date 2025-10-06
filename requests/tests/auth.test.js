import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp up
    { duration: '1m', target: 50 }, // sustain load
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds: {
    // Global latency
    http_req_duration: ['p(95)<400', 'p(99)<700'],
    http_req_failed: ['rate<0.03'], // allow 3% failures
    checks: ['rate>0.90'], // 90% checks must pass

    // Endpoint-specific
    'http_req_duration{endpoint:register}': [
      'p(50)<200',
      'p(95)<300',
      'p(99)<700',
    ],
    'http_req_duration{endpoint:login}': [
      'p(50)<180',
      'p(95)<280',
      'p(99)<500',
    ],
    'http_req_duration{endpoint:refresh}': [
      'p(50)<150',
      'p(95)<220',
      'p(99)<350',
    ],
    'http_req_duration{endpoint:logout}': [
      'p(50)<80',
      'p(95)<120',
      'p(99)<250',
    ],

    iteration_duration: ['p(95)<6000'], // ~6s per iteration

    'http_req_waiting{endpoint:register}': ['p(95)<350'],
    'http_req_waiting{endpoint:login}': ['p(95)<300'],
    'http_req_waiting{endpoint:refresh}': ['p(95)<220'],
    'http_req_waiting{endpoint:logout}': ['p(95)<120'],

    http_reqs: ['rate>15'],
    iterations: ['rate>5'],
  },
};

const baseUrl = 'http://localhost:3000/api/v1/auth';

// --- Helpers ---
function safeJsonParse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function authHeaders(token) {
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// --- Main test flow ---
export default function () {
  const randomId = Math.floor(Math.random() * 999999);

  const userData = {
    fullName: `Test User ${randomId}`,
    username: `user_@${randomId}`,
    email: `user_${randomId}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  let accessToken = null;
  let refreshToken = null;

  // ============================
  // STEP 1: REGISTER
  // ============================
  const registerRes = http.post(
    `${baseUrl}/register`,
    JSON.stringify(userData),
    { headers: authHeaders(), tags: { endpoint: 'register' }, timeout: '3s' },
  );
  const registerBody = safeJsonParse(registerRes.body);

  check(registerRes, {
    'register: status 200/201': (r) => r.status === 200 || r.status === 201,
    'register: <550ms': (r) => r.timings.duration < 550,
    'register: success': () => registerBody.success === true,
    'register: access token': () => !!registerBody?.data?.tokens?.accessToken,
    'register: refresh token': () => !!registerBody?.data?.tokens?.refreshToken,
  });

  accessToken = registerBody?.data?.tokens?.accessToken ?? null;
  refreshToken = registerBody?.data?.tokens?.refreshToken ?? null;

  sleep(0.5);

  // ============================
  // STEP 2: LOGIN
  // ============================
  const loginRes = http.post(
    `${baseUrl}/login`,
    JSON.stringify({ username: userData.email, password: userData.password }),
    { headers: authHeaders(), tags: { endpoint: 'login' }, timeout: '3s' },
  );
  const loginBody = safeJsonParse(loginRes.body);

  check(loginRes, {
    'login: status 200': (r) => r.status === 200,
    'login: <500ms': (r) => r.timings.duration < 400,
    'login: success': () => loginBody.success === true,
    'login: access token': () => !!loginBody?.data?.tokens?.accessToken,
    'login: refresh token': () => !!loginBody?.data?.tokens?.refreshToken,
  });

  accessToken = loginBody?.data?.tokens?.accessToken ?? accessToken;
  refreshToken = loginBody?.data?.tokens?.refreshToken ?? refreshToken;

  sleep(0.5);

  // ============================
  // STEP 3: REFRESH TOKEN
  // ============================
  let refreshRes;
  if (refreshToken) {
    refreshRes = http.post(`${baseUrl}/refresh`, null, {
      headers: authHeaders(refreshToken),
      tags: { endpoint: 'refresh' },
      timeout: '3s',
    });
    const refreshBody = safeJsonParse(refreshRes.body);

    check(refreshRes, {
      'refresh: status 200': (r) => r.status === 200,
      'refresh: <350ms': (r) => r.timings.duration < 350,
      'refresh: success': () => refreshBody.success === true,
      'refresh: new access token': () => !!refreshBody?.data?.accessToken,
      'refresh: token rotated': () =>
        !!refreshBody?.data?.accessToken &&
        refreshBody.data.accessToken !== accessToken,
    });

    accessToken = refreshBody?.data?.accessToken ?? accessToken;
    sleep(0.5);
  }

  // ============================
  // STEP 4: LOGOUT
  // ============================
  let logoutRes;
  if (accessToken) {
    logoutRes = http.post(`${baseUrl}/logout`, null, {
      headers: authHeaders(accessToken),
      tags: { endpoint: 'logout' },
      timeout: '3s',
    });

    check(logoutRes, {
      'logout: status 200/204': (r) => r.status === 200 || r.status === 204,
      'logout: <150ms': (r) => r.timings.duration < 150,
    });
  }

  // ============================
  // FLOW CHECKS
  // ============================
  const flow1 = registerRes.timings.duration + loginRes.timings.duration;
  check(
    { flow1 },
    {
      'flow: register+login <600ms': () => flow1 < 600,
      'flow: register+login <700ms': () => flow1 < 700,
    },
  );

  let fullFlow = flow1;
  if (refreshRes) fullFlow += refreshRes.timings.duration;
  if (logoutRes) fullFlow += logoutRes.timings.duration;

  check({ fullFlow }, { 'flow: full auth cycle <850ms': () => fullFlow < 850 });

  sleep(1);
}
