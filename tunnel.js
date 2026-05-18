const { createTunnel } = require('localtunnel');
const { execSync } = require('child_process');

let tunnel;

async function start() {
  try {
    tunnel = await createTunnel({ port: 3000, subdomain: 'myblog' + Math.random().toString(36).slice(2,6) });
    console.log('URL:', tunnel.url);
    tunnel.on('close', () => { console.log('Tunnel closed, restarting...'); setTimeout(start, 2000); });
    tunnel.on('error', () => { console.log('Tunnel error, restarting...'); setTimeout(start, 2000); });
  } catch (e) {
    console.log('Failed, restarting...'); setTimeout(start, 2000);
  }
}
start();
