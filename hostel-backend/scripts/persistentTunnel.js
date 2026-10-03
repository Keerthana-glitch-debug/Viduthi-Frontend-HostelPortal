const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const URL_FILE = path.join(__dirname, '../tunnel_url.txt');
const ROOT_URL_FILE = path.join(__dirname, '../../TUNNEL_URL.txt');

let currentUrl = null;
let pingInterval = null;
let sshProcess = null;

function sendKeepAlivePing(url) {
  if (!url) return;
  try {
    https.get(`${url}/api/health`, (res) => {
      // Keep alive successful
      console.log(`[KeepAlive ${new Date().toLocaleTimeString()}] Pinged ${url} - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      // Ignored
    });
  } catch (e) {}
}

function startSshTunnel() {
  console.log('[Tunnel] Starting secure TLS tunnel to localhost:5000...');

  sshProcess = spawn('ssh', [
    '-R', '80:localhost:5000',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=3',
    'nokey@localhost.run'
  ]);

  let stdoutBuffer = '';

  sshProcess.stdout.on('data', (data) => {
    const text = data.toString();
    stdoutBuffer += text;

    // Search for https://*.lhr.life URL pattern
    const match = text.match(/https:\/\/[a-z0-9]+\.lhr\.life/i) || stdoutBuffer.match(/https:\/\/[a-z0-9]+\.lhr\.life/i);
    if (match && match[0] !== currentUrl) {
      currentUrl = match[0];
      console.log('\n======================================================');
      console.log(`🚀 ACTIVE SECURE TUNNEL URL: ${currentUrl}`);
      console.log('======================================================\n');

      try {
        fs.writeFileSync(URL_FILE, currentUrl, 'utf8');
        fs.writeFileSync(ROOT_URL_FILE, currentUrl, 'utf8');
      } catch (e) {}

      // Clear existing ping interval and start a fresh 45s keep-alive
      if (pingInterval) clearInterval(pingInterval);
      pingInterval = setInterval(() => {
        sendKeepAlivePing(currentUrl);
      }, 45000);

      // Immediate first ping
      setTimeout(() => sendKeepAlivePing(currentUrl), 3000);
    }
  });

  sshProcess.stderr.on('data', (data) => {
    const errText = data.toString();
    if (errText.includes('disconnect') || errText.includes('timeout') || errText.includes('reset')) {
      console.log('[Tunnel Warning]', errText.trim());
    }
  });

  sshProcess.on('close', (code) => {
    console.log(`[Tunnel] SSH connection closed (code ${code}). Reconnecting in 3 seconds...`);
    if (pingInterval) clearInterval(pingInterval);
    currentUrl = null;
    setTimeout(startSshTunnel, 3000);
  });

  sshProcess.on('error', (err) => {
    console.error('[Tunnel Error]', err.message);
  });
}

// Graceful cleanup on SIGINT / SIGTERM
process.on('SIGINT', () => {
  if (sshProcess) sshProcess.kill();
  process.exit(0);
});
process.on('SIGTERM', () => {
  if (sshProcess) sshProcess.kill();
  process.exit(0);
});

startSshTunnel();
