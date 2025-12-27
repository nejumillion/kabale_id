import { networkInterfaces } from 'node:os';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Gets the first local network IPv4 address (non-loopback)
 * Prefers private network ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
 */

function getLocalNetworkIP(): string | null {
  const interfaces = networkInterfaces();
  const candidates: Array<{ ip: string; score: number }> = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!addresses) continue;

    const lname = name.toLowerCase();

    // ❌ Skip known virtual / unreliable interfaces
    if (
      lname.includes('virtual') ||
      lname.includes('vbox') ||
      lname.includes('vmware') ||
      lname.includes('docker') ||
      lname.includes('wsl') ||
      lname.includes('vpn') ||
      lname.includes('loopback') ||
      lname.includes('hyper')
    ) {
      continue;
    }

    for (const addr of addresses) {
      if (addr.family !== 'IPv4' || addr.internal) continue;

      const ip = addr.address;
      let score = 0;

      // Prefer real LAN ranges
      if (ip.startsWith('192.168.')) score += 100;
      else if (ip.startsWith('10.')) score += 90;
      else if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) score += 80;

      // Prefer Wi-Fi / Ethernet by name
      if (lname.includes('wi-fi') || lname.includes('wlan')) score += 50;
      if (lname.includes('eth')) score += 40;

      candidates.push({ ip, score });
    }
  }

  // Highest score wins
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.ip ?? null;
}


const port = process.env.PORT || '3000';
const networkIP = getLocalNetworkIP();
const envPath = join(process.cwd(), '.env');

// Determine the PUBLIC_URL value
let publicUrl: string;
if (!networkIP) {
  publicUrl = `http://localhost:${port}`;
  console.warn('⚠️  Could not detect local network IP. Using localhost.');
} else {
  publicUrl = `http://${networkIP}:${port}`;
  console.log(`🌐 Detected local network IP: ${networkIP}`);
}

console.log(`🔗 Setting PUBLIC_URL to: ${publicUrl}`);

// Read existing .env file or create empty content
let envContent = '';
if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf-8');
}

// Update or add PUBLIC_URL
const publicUrlRegex = /^PUBLIC_URL=.*$/m;
if (publicUrlRegex.test(envContent)) {
  // Replace existing PUBLIC_URL
  envContent = envContent.replace(publicUrlRegex, `PUBLIC_URL=${publicUrl}`);
  console.log('✅ Updated existing PUBLIC_URL in .env');
} else {
  // Add PUBLIC_URL (append to file, with newline if file doesn't end with one)
  const needsNewline = envContent.length > 0 && !envContent.endsWith('\n');
  envContent += (needsNewline ? '\n' : '') + `PUBLIC_URL=${publicUrl}\n`;
  console.log('✅ Added PUBLIC_URL to .env');
}

// Write back to .env file
writeFileSync(envPath, envContent, 'utf-8');
console.log(`📝 Updated .env file at: ${envPath}`);

