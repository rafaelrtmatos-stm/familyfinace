module.exports = (req, res) => {
  const supaUrl = process.env.SUPABASE_URL      || '';
  const supaKey = process.env.SUPABASE_ANON_KEY || '';
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify({ supaUrl, supaKey }));
};
