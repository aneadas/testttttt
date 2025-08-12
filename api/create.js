import { sql } from './_db.js';
import { genCode, nowIso } from './_utils.js';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method not allowed');
  const { count = 1, prize = null } = req.body || {};
  const n = Math.max(1, Math.min(1000, parseInt(count)));

  const inserted = [];
  for(let i=0;i<n;i++){
    let tries=0, ok=false, finalCode=genCode();
    while(!ok && tries<5){
      try{
        await sql`INSERT INTO codes (code, prize, created_at) VALUES (${finalCode}, ${prize}, ${nowIso()})`;
        inserted.push(finalCode);
        ok = true;
      }catch(e){
        tries++; finalCode = genCode();
      }
    }
  }
  res.setHeader('content-type','application/json');
  res.end(JSON.stringify({ ok:true, codes: inserted }));
}
