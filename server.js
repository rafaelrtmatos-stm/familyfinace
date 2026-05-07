const http = require('http');
const https = require('https');
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

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
  });
}

function supaRequest(pathname, method, headers, body) {
  const supaUrl = process.env.SUPABASE_URL || '';
  const supaKey = process.env.SUPABASE_ANON_KEY || '';
  const parsed = new url.URL(supaUrl + pathname);
  return new Promise((resolve, reject) => {
    const reqOpts = {
      hostname: parsed.hostname,
      path: parsed.pathname + (parsed.search || ''),
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supaKey,
        'Authorization': `Bearer ${supaKey}`,
        ...headers,
      },
    };
    const req = https.request(reqOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  // ── CORS headers for all API routes ──────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── /api/config ───────────────────────────────────────────────────────────
  if (pathname === '/api/config') {
    const supaUrl = process.env.SUPABASE_URL || '';
    const supaKey = process.env.SUPABASE_ANON_KEY || '';
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ supaUrl, supaKey }));
    return;
  }

  // ── /api/login — proxies Supabase signInWithPassword server-side ──────────
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { email, password } = JSON.parse(body);
      const result = await supaRequest(
        '/auth/v1/token?grant_type=password',
        'POST',
        {},
        JSON.stringify({ email, password })
      );
      res.writeHead(result.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(result.body);
    } catch (e) {
      console.error('[/api/login] erro:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── /api/signup — proxies Supabase signUp server-side ────────────────────
  if (pathname === '/api/signup' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { email, password } = JSON.parse(body);
      const result = await supaRequest(
        '/auth/v1/signup',
        'POST',
        {},
        JSON.stringify({ email, password })
      );
      res.writeHead(result.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(result.body);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────────
  const filePath = path.join(ROOT, pathname === '/' ? '/index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }

    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    let content = data;

    if (pathname === '/' || pathname === '/index.html') {
      const supaUrl = process.env.SUPABASE_URL || '';
      const supaKey = process.env.SUPABASE_ANON_KEY || '';
      let html = data.toString('utf8');
      if (supaUrl) html = html.replace("let SUPA_URL=''", `let SUPA_URL='${supaUrl}'`);
      if (supaKey) html = html.replace("let SUPA_KEY=''", `let SUPA_KEY='${supaKey}'`);
      if (!supaUrl || !supaKey) console.warn('[AVISO] Secrets do Supabase não configurados!');
      content = Buffer.from(html, 'utf8');
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(content);
  });
});

server.listen(PORT, () => console.log(`Serving on http://localhost:${PORT}`));
