import { sql } from './_db.js';
import { readJson } from './_read_body.js';

export default async function handler(req, res){
  try{
    if(req.method !== 'POST') return res.status(405).send('Method not allowed');
    const token = req.headers['x-admin-token'] || '';
    if(!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN){
      res.statusCode = 401;
      return res.end('Unauthorized');
    }
    const body = await readJson(req);
    const code = body && body.code ? String(body.code).toUpperCase().trim() : '';
    if(!code) return res.status(400).send('Missing code');
    const rows = await sql`SELECT id, redeemed_at FROM codes WHERE code = ${code}`;
    const row = rows[0];
    if(!row) return res.status(404).send('Not found');
    if(row.redeemed_at) return res.status(409).send('Already redeemed');
    const ts = new Date().toISOString().replace('T',' ').replace('Z','');
    const ip = (req.headers['x-forwarded-for']||'').split(',')[0] || req.socket?.remoteAddress || '';
    await sql`UPDATE codes SET redeemed_at=${ts}, redeemed_ip=${ip} WHERE id=${row.id}`;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:true, redeemed_at: ts }));
  }catch(err){
    console.error('REDEEM_ERROR', err);
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:false, error: String(err.message||err) }));
  }
}
