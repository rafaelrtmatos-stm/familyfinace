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

  // Match both `let` and `const` declarations with empty or existing values
  if (supaUrl) html = html.replace(/let SUPA_URL='[^']*'/, `let SUPA_URL='${supaUrl}'`);
  if (supaKey) html = html.replace(/let SUPA_KEY='[^']*'/, `let SUPA_KEY='${supaKey}'`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.end(html);
};
