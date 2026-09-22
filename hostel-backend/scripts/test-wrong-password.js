const http = require('http');

const data = JSON.stringify({
  identifier: '24104031',
  password: 'WRONG_PASSWORD_XYZ',
});

const req = http.request(
  {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  },
  (res) => {
    let body = '';
    res.on('data', (d) => (body += d));
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Body:', body);
    });
  }
);

req.on('error', (e) => {
  console.log('Backend not currently running:', e.message);
});

req.write(data);
req.end();
