import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // ramp up
    { duration: '1m', target: 20 }, // sustain load
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400', 'p(99)<700'],
    http_req_failed: ['rate<0.03'], // allow 3% failures
    checks: ['rate>0.90'], // 90% checks must pass
  },
};

const baseUrl = 'http://localhost:3000/api/v1/public/urls';

const urls = [
  'https://blog.google/technology/',
  'https://research.google/blog/',
  'https://www.wired.com/',
  'https://techcrunch.com/',
  'https://netflixtechblog.com/',
  'https://www.technewsworld.com/',
  'https://technologyadvice.com/blog/',
  'https://blog.openreplay.com/',
  'https://blog.logrocket.com/',
  'https://www.geekwire.com/',
  'https://intelegain.com/blogs/',
  'https://draft.dev/learn/the-best-technical-writing-blogs',
  'https://www.technologyfirst.org/Tech-News',
  'https://blog.google/technology/ai/',
  'https://medium.com/tag/tech-blog',
  'https://blog.openreplay.com/improving-performance-in-react-applications/',
  'https://www.intelegain.com/blogs/how-ai-agents-are-transforming-fraud-detection-and-financial-security',
  'https://www.techreviewer.co/blog/how-cmms-is-redefining-maintenance-practices-in-2025',
  'https://www.technologyadvice.com/blog/',
  'https://www.wired.com/tag/technology/',
];

// --- Helpers ---
function safeJsonParse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

// --- Main test flow ---
export default function () {
  const randomIndex = Math.floor(Math.random() * urls.length);
  const originalUrl = urls[randomIndex];

  const payload = {
    originalUrl,
  };

  const res = http.post(`${baseUrl}/shorten`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'shorten' },
  });

  const body = safeJsonParse(res.body);

  check(res, {
    'shorten: status 200/201': (r) => r.status === 200 || r.status === 201,
    'shorten: success': () => body.success === true,
    'shorten: has code': () => !!body?.data?.code,
    'shorten: <500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);
}
