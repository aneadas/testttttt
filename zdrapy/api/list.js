import { sql } from './_db.js';
export default async function handler(req, res){
  try{
    if(req.method !== 'GET') return res.status(405).send('Method not allowed');
    const rows = await sql`SELECT id, code, prize, created_at, redeemed_at, redeemed_ip FROM codes ORDER BY id DESC LIMIT 50`;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ rows }));
  }catch(err){
    console.error('LIST_ERROR', err);
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:false, error: String(err.message||err) }));
  }
}
