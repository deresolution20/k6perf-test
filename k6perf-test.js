import http from 'k6/http';
import { check, sleep } from 'k6';

// Parameterize the base URL
const BASE_URL = 'http://34.83.69.27:3000';

export let options = {
  vus: 10,
  duration: '30s',
  ext: {
    loadimpact: {
      projectID: XXXXXXXXXX,
      name: 'perf-test'
    }
  }
};

export default function () {
  // Simulate loading the page
  let res = http.get(`${BASE_URL}/`);
  console.log(res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);

  // Simulate submitting the form
  let payload = JSON.stringify({
    name: 'John Doe',
    email: 'johndoe@example.com',
    message: 'This is a test message'
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  res = http.post(`${BASE_URL}/submit-form`, payload, params);
  console.log(res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);

  // Simulate clicking the button
  res = http.get(`${BASE_URL}/click-button`);
  console.log(res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}

