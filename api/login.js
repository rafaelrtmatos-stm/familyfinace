const https = require('https');
const url = require('url');

function supaPost(endpoint, body) {
  const supaUrl = process.env.SUPABASE_URL      || '';
  const supaKey = process.env.SUPABASE_ANON_KEY || '';
  const parsed  = new url.URL(supaUrl + endpoint);
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: parsed.hostname,
      path:     parsed.pathname + (parsed.search || ''),
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'apikey':         supaKey,
        'Authorization':  `Bearer ${supaKey}`,
      },
    }, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => resolve({ status: r.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST')    { res.status(405).end('Method Not Allowed'); return; }

  let body = '';
  await new Promise(r => { req.on('data', c => body += c); req.on('end', r); });

  try {
    const { email, password } = JSON.parse(body);
    const result = await supaPost('/auth/v1/token?grant_type=password', { email, password });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.status(result.status).end(result.body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
