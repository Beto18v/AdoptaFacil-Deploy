import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
    vus: 1,
    duration: '15s',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<800'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';

export default function () {
    const res = http.get(`${BASE_URL}/login`);
    check(res, {
        'GET /login 200': (r) => r.status === 200,
    });
    sleep(1);
}
