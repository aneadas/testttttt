import { sql } from './_db.js';
import { readJson } from './_read_body.js';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode(){ let out=''; for(let i=0;i<10;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)]; return out.slice(0,5)+'-'+out.slice(5); }
function nowIso(){ return new Date().toISOString().replace('T',' ').replace('Z',''); }

export default async function handler(req, res){
  try{
    if(req.method !== 'POST') return res.status(405).send('Method not allowed');
    const { count = 1, prize = null } = await readJson(req);
    const n = Math.max(1, Math.min(1000, parseInt(count)));
    const inserted = [];
    for(let i=0;i<n;i++){
      let tries=0, ok=false, finalCode=genCode();
      while(!ok && tries<5){
        try{
          await sql`INSERT INTO codes (code, prize, created_at) VALUES (${finalCode}, ${prize}, ${nowIso()})`;
          inserted.push(finalCode); ok=true;
        }catch(e){
          if(/does not exist/i.test(String(e))) throw new Error('DB: missing table "codes" (run /api/migrate).');
          tries++; finalCode = genCode();
          if(tries>=5) throw e;
        }
      }
    }
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:true, codes: inserted }));
  }catch(err){
    console.error('CREATE_ERROR', err);
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:false, error: String(err.message||err) }));
  }
}
