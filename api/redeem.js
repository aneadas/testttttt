import { sql } from './_db.js';
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method not allowed');
  const { code } = req.body || {};
  if(!code) return res.status(400).send('Missing code');
  const upper = String(code).toUpperCase().trim();
  const rows = await sql`SELECT id, redeemed_at FROM codes WHERE code = ${upper}`;
  const row = rows[0];
  if(!row) return res.status(404).send('Not found');
  if(row.redeemed_at) return res.status(409).send('Already redeemed');
  const ts = new Date().toISOString().replace('T',' ').replace('Z','');
  const ip = (req.headers['x-forwarded-for']||'').split(',')[0] || req.socket?.remoteAddress || '';
  await sql`UPDATE codes SET redeemed_at=${ts}, redeemed_ip=${ip} WHERE id=${row.id}`;
  res.setHeader('content-type','application/json');
  res.end(JSON.stringify({ ok:true, redeemed_at: ts }));
}
