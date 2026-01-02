import http from "http";
import { networkInterfaces } from "os";
import httpProxy from "http-proxy";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

const targets = [
    "http://localhost:3001",
    "http://localhost:3002",
];

let index = 0;

// Track server health status
const serverHealth = new Map();
targets.forEach((target) => {
    serverHealth.set(target, { healthy: true, lastChecked: null });
});

const proxy = httpProxy.createProxyServer({});

// Health check function
async function checkServerHealth(target) {
    return new Promise((resolve) => {
        const url = new URL(target);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === "https:" ? 443 : 80),
            path: "/",
            method: "HEAD",
            timeout: 2000,
        };

        const req = http.request(options, (res) => {
            const healthy = res.statusCode >= 200 && res.statusCode < 500;
            serverHealth.set(target, { healthy, lastChecked: Date.now() });
            resolve(healthy);
        });

        req.on("error", () => {
            serverHealth.set(target, { healthy: false, lastChecked: Date.now() });
            resolve(false);
        });

        req.on("timeout", () => {
            req.destroy();
            serverHealth.set(target, { healthy: false, lastChecked: Date.now() });
            resolve(false);
        });

        req.end();
    });
}

// Get list of healthy servers
function getHealthyServers() {
    return targets.filter((target) => {
        const health = serverHealth.get(target);
        return health?.healthy !== false;
    });
}

// Select next healthy server
function getNextHealthyServer() {
    const healthy = getHealthyServers();
    if (healthy.length === 0) {
        // If no healthy servers, return null (all servers are down)
        return null;
    }
    const target = healthy[index % healthy.length];
    index = (index + 1) % healthy.length;
    return target;
}

// Periodic health checks (every 5 seconds)
const HEALTH_CHECK_INTERVAL = 3000;
setInterval(async () => {
    for (const target of targets) {
        const wasHealthy = serverHealth.get(target)?.healthy;
        const isHealthy = await checkServerHealth(target);
        if (wasHealthy !== isHealthy) {
            console.log(
                `[HEALTH] ${new Date().toISOString()} - ${target} is now ${isHealthy ? "HEALTHY" : "UNHEALTHY"}`
            );
        }
    }
}, HEALTH_CHECK_INTERVAL);

// Initial health check
targets.forEach((target) => {
    checkServerHealth(target);
});

// Log proxy errors
proxy.on("error", (err, req, res) => {
    console.error(`[ERROR] ${new Date().toISOString()} - Proxy error:`, err.message);
    console.error(`  Request: ${req.method} ${req.url}`);
    if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
    }
});

const server = http.createServer((req, res) => {
    const target = getNextHealthyServer();

    if (!target) {
        console.error(`[ERROR] ${new Date().toISOString()} - No healthy servers available`);
        res.writeHead(503, { "Content-Type": "text/plain" });
        res.end("Service Unavailable: All servers are down");
        return;
    }

    proxy.web(req, res, { target }, (err) => {
        if (err) {
            console.error(`[ERROR] ${new Date().toISOString()} - Failed to proxy ${req.method} ${req.url} to ${target}:`, err.message);
            // Mark server as unhealthy on proxy error
            serverHealth.set(target, { healthy: false, lastChecked: Date.now() });
            console.log(`[HEALTH] ${new Date().toISOString()} - Marked ${target} as UNHEALTHY due to proxy error`);
        }
    });
});

const PORT = 8080;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
    const localIP = getLocalNetworkIP();
    updateEnvFile(localIP);
    console.log(`[STARTUP] ${new Date().toISOString()} - Load balancer started`);
    console.log(`  Listening on ${HOST}:${PORT}`);
    if (localIP) {
        console.log(`  Accessible on local network at: http://${localIP}:${PORT}`);
    }
    console.log(`  Targets (${targets.length}):`);
    targets.forEach((target, i) => {
        console.log(`    ${i + 1}. ${target}`);
    });
});


function getLocalNetworkIP() {
    const interfaces = networkInterfaces();
    const candidates = [];

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

const updateEnvFile = (networkIP) => {
    const envPath = join(process.cwd(), '.env');

    // Determine the PUBLIC_URL value
    let publicUrl
    if (!networkIP) {
    publicUrl = `http://localhost:${PORT}`;
    console.warn('⚠️  Could not detect local network IP. Using localhost.');
    } else {
    publicUrl = `http://${networkIP}:${PORT}`;
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
}