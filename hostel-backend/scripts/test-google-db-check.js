const http = require('http');

function testGoogleAuth(email) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/google',
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
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        });
      }
    );
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('\n--- 1. Testing Approved NEC College Account: 24104030@nec.edu.in ---');
  const nec = await testGoogleAuth('24104030@nec.edu.in');
  console.log('Status:', nec.status);
  console.log('Success:', nec.body.success);
  console.log('Message:', nec.body.message);
  console.log('Token Received:', Boolean(nec.body.token));

  console.log('\n--- 2. Testing Unapproved Random Gmail Account: hacker@randomgmail.com ---');
  const bad = await testGoogleAuth('hacker@randomgmail.com');
  console.log('Status:', bad.status);
  console.log('Success:', bad.body.success);
  console.log('Message:', bad.body.message);
}

run();
