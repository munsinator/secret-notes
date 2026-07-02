import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 10 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://18.184.47.163/api';
http.setResponseCallback(http.expectedStatuses(200, 201, 400, 401));

export default function () {
  const key = `loadtest-key-${__VU}-${__ITER}`;
  const noteText = `k6 load test note from VU ${__VU}, iteration ${__ITER}`;

  const createResponse = http.post(
    `${BASE_URL}/notes`,
    JSON.stringify({
      note: noteText,
      key,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(createResponse, {
    'POST /notes returns 201 or 200': (res) => res.status === 201 || res.status === 200,
    'POST /notes returns note id': (res) => {
      try {
        const body = res.json();
        return typeof body.id === 'string' && body.id.length > 0;
      } catch {
        return false;
      }
    },
  });

  if (createResponse.status !== 201 && createResponse.status !== 200) {
    sleep(1);
    return;
  }

  let noteId;

  try {
    noteId = createResponse.json().id;
  } catch {
    sleep(1);
    return;
  }

  const readResponse = http.get(
    `${BASE_URL}/notes/${noteId}?key=${encodeURIComponent(key)}`
  );

  check(readResponse, {
    'GET /notes/:id returns 200': (res) => res.status === 200,
    'GET /notes/:id returns decrypted note': (res) => {
      try {
        const body = res.json();
        return body.note === noteText;
      } catch {
        return false;
      }
    },
  });

  const wrongKeyResponse = http.get(
    `${BASE_URL}/notes/${noteId}?key=wrong-key`
  );

  check(wrongKeyResponse, {
    'GET /notes/:id rejects wrong key': (res) => res.status === 400 || res.status === 401,
  });

  sleep(1);
}