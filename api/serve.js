const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const filePath = path.join(process.cwd(), 'index.html');
  let html;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    res.status(500).send('index.html not found');
    return;
  }

  const supaUrl = process.env.SUPABASE_URL      || '';
  const supaKey = process.env.SUPABASE_ANON_KEY || '';

  html = html.replace(/const SUPA_URL='[^']*'/, `const SUPA_URL='${supaUrl}'`);
  html = html.replace(/const SUPA_KEY='[^']*'/, `const SUPA_KEY='${supaKey}'`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(html);
};
