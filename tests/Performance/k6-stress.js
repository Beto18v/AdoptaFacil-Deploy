import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '30s', target: 60 },
        { duration: '30s', target: 80 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';

export default function () {
    const res = http.get(`${BASE_URL}/login`);
    check(res, {
        'status is not 5xx': (r) => r.status < 500,
    });
    sleep(1);
}
