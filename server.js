const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  // Dynamic config endpoint — never cached, always returns current env vars
  if (pathname === '/api/config') {
    const supaUrl = process.env.SUPABASE_URL || '';
    const supaKey = process.env.SUPABASE_ANON_KEY || '';
    if (!supaUrl || !supaKey) {
      console.warn('[AVISO] SUPABASE_URL ou SUPABASE_ANON_KEY não configurados nos Secrets!');
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    });
    res.end(JSON.stringify({ supaUrl, supaKey }));
    return;
  }

  let filePath_raw = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(ROOT, filePath_raw);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };

    // For index.html: prevent caching so the browser always gets a fresh copy
    if (filePath_raw === '/index.html') {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
});
