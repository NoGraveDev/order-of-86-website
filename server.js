const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.json':'application/json','.woff2':'font/woff2','.webp':'image/webp'
};

// Rate limiter: 60 requests/min per IP
const rateMap = new Map();
const RATE_WINDOW = 60000;
const RATE_LIMIT = 60;

function rateLimit(ip) {
    const now = Date.now();
    let entry = rateMap.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW) {
        entry = { start: now, count: 1 };
        rateMap.set(ip, entry);
        return true;
    }
    entry.count++;
    return entry.count <= RATE_LIMIT;
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateMap) {
        if (now - entry.start > RATE_WINDOW) rateMap.delete(ip);
    }
}, 300000);

http.createServer((req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    if (!rateLimit(ip)) {
        res.writeHead(429, { 'Content-Type': 'text/plain' });
        res.end('Too many requests');
        return;
    }

    let url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';
    if (!path.extname(url)) url += '.html';

    // Path traversal protection
    const filePath = path.join(ROOT, url);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(resolved);
    fs.readFile(resolved, (err, data) => {
        if (err) {
            fs.readFile(path.join(ROOT, 'index.html'), (e, d) => {
                res.writeHead(e ? 404 : 200, { 'Content-Type': 'text/html' });
                res.end(e ? 'Not Found' : d);
            });
            return;
        }
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
        });
        res.end(data);
    });
}).listen(PORT, () => console.log(`Order of 86 on port ${PORT}`));
