const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { generateOGCard } = require('./og-card');
const { renderWizardPage } = require('./wizard-page');

// ── In-memory static file cache + pre-compressed ──
const fileCache = new Map();

// Load wizard data
let wizardDogs = {};
try {
    wizardDogs = require('./wizards-data');
    console.log(`Loaded ${Object.keys(wizardDogs).length} wizards from data file`);
} catch (e) {
    console.error('Failed to load wizard data:', e.message);
}

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const BASE_URL = process.env.BASE_URL || 'https://theorderof86.com';

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.json':'application/json','.woff2':'font/woff2','.webp':'image/webp'
};

// Rate limiter
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

// Compressible MIME types
const COMPRESSIBLE = new Set([
    'text/html','text/css','application/javascript','application/json',
    'image/svg+xml'
]);

function sendResponse(req, res, statusCode, headers, body) {
    const mime = headers['Content-Type'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    if (COMPRESSIBLE.has(mime) && acceptEncoding.includes('gzip') && body.length > 256) {
        zlib.gzip(body, (err, compressed) => {
            if (err) {
                res.writeHead(statusCode, headers);
                res.end(body);
            } else {
                headers['Content-Encoding'] = 'gzip';
                headers['Content-Length'] = compressed.length;
                res.writeHead(statusCode, headers);
                res.end(compressed);
            }
        });
    } else {
        if (Buffer.isBuffer(body)) headers['Content-Length'] = body.length;
        res.writeHead(statusCode, headers);
        res.end(body);
    }
}

http.createServer(async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    if (!rateLimit(ip)) {
        res.writeHead(429, { 'Content-Type': 'text/plain' });
        res.end('Too many requests');
        return;
    }

    let url = req.url.split('?')[0];

    // ── Wizard individual page: /wizard/:id ──
    const wizardMatch = url.match(/^\/wizard\/(\d+)$/);
    if (wizardMatch) {
        const dog = wizardDogs[wizardMatch[1]];
        if (!dog) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Wizard not found');
            return;
        }
        const html = renderWizardPage(dog, BASE_URL);
        sendResponse(req, res, 200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600'
        }, Buffer.from(html));
        return;
    }

    // ── OG share card image: /wizard/:id/og.png ──
    const ogMatch = url.match(/^\/wizard\/(\d+)\/og\.png$/);
    if (ogMatch) {
        const dog = wizardDogs[ogMatch[1]];
        if (!dog) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Wizard not found');
            return;
        }
        try {
            const buf = await generateOGCard(dog);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400',
                'Content-Length': buf.length
            });
            res.end(buf);
        } catch (e) {
            console.error('OG card error:', e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error generating card');
        }
        return;
    }

    // ── Static files ──
    if (url === '/') url = '/index.html';
    if (!path.extname(url)) url += '.html';

    const filePath = path.join(ROOT, url);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(resolved);

    // Check in-memory cache first
    const cached = fileCache.get(resolved);
    if (cached) {
        sendResponse(req, res, 200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }, cached);
        return;
    }

    fs.readFile(resolved, (err, data) => {
        if (err) {
            fs.readFile(path.join(ROOT, 'index.html'), (e, d) => {
                if (e) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not Found'); }
                else sendResponse(req, res, 200, { 'Content-Type': 'text/html' }, d);
            });
            return;
        }
        // Cache static files under 512KB
        if (data.length < 512 * 1024) fileCache.set(resolved, data);
        sendResponse(req, res, 200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }, data);
    });
}).listen(PORT, () => console.log(`Order of 86 on port ${PORT} — ${Object.keys(wizardDogs).length} wizards loaded`));
