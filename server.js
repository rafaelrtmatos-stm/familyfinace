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
  let pathname = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  const filePath = path.join(ROOT, pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    let content = data;

    // Inject env vars only into index.html (only if env vars are set)
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    if (pathname === '/index.html') {
      const supaUrl  = process.env.SUPABASE_URL;
      const supaKey  = process.env.SUPABASE_ANON_KEY;
      let html = data.toString('utf8');
      if (supaUrl) html = html.replace('__SUPABASE_URL__', supaUrl);
      if (supaKey) html = html.replace('__SUPABASE_ANON_KEY__', supaKey);
      content = Buffer.from(html, 'utf8');
      // Prevent browser from caching the injected HTML
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('[AVISO] SUPABASE_URL ou SUPABASE_ANON_KEY não configurados nos Secrets!');
  }
});
