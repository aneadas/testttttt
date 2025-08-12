import { sql } from './_db.js';
export default async function handler(req, res){
  try{
    if(req.method !== 'GET') return res.status(405).send('Method not allowed');
    const code = String((req.query && req.query.code) || '').toUpperCase().trim();
    if(!code) return res.status(400).send('Missing code');
    const rows = await sql`SELECT code, prize, redeemed_at FROM codes WHERE code = ${code}`;
    const row = rows[0];
    res.setHeader('content-type','application/json');
    if(!row) return res.end(JSON.stringify({ found:false }));
    res.end(JSON.stringify({ found:true, ...row }));
  }catch(err){
    console.error('CHECK_ERROR', err);
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:false, error: String(err.message||err) }));
  }
}
