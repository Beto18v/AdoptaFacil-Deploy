import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 15 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.02'],
        http_req_duration: ['p(95)<1500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';

export default function () {
    const res1 = http.get(`${BASE_URL}/`);
    const res2 = http.get(`${BASE_URL}/login`);

    check(res1, { 'GET / < 500': (r) => r.status < 500 });
    check(res2, { 'GET /login < 500': (r) => r.status < 500 });

    sleep(1);
}
