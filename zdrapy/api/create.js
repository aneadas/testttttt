import { sql } from './_db.js';
import { readJson } from './_read_body.js';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode(){ let out=''; for(let i=0;i<10;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)]; return out.slice(0,5)+'-'+out.slice(5); }
function nowIso(){ return new Date().toISOString().replace('T',' ').replace('Z',''); }

// Weighted prize pool (you can tweak weights)
const PRIZE_POOL = [
  { label: '20 zł', weight: 1 },
  { label: '10 zł', weight: 3 },
  { label: 'Kawa gratis', weight: 5 },
  { label: 'Zniżka 20%', weight: 1 },
  { label: 'Zniżka 10%', weight: 3 },
  { label: 'Zniżka 5%', weight: 8 },
  { label: 'Gadżet firmowy', weight: 2 },
  { label: 'Brak wygranej', weight: 10 }
];

function choosePrize(){
  let total = 0;
  for (const p of PRIZE_POOL) total += p.weight;
  const r = Math.random() * total;
  let acc = 0;
  for (const p of PRIZE_POOL){
    acc += p.weight;
    if (r <= acc) return p.label;
  }
  return PRIZE_POOL[PRIZE_POOL.length-1].label;
}

export default async function handler(req, res){
  try{
    if(req.method !== 'POST') return res.status(405).send('Method not allowed');
    // Simple admin auth
    const token = req.headers['x-admin-token'] || '';
    if(!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN){
      res.statusCode = 401;
      return res.end('Unauthorized');
    }

    const body = await readJson(req);
    const count = Math.max(1, Math.min(1000, parseInt((body && body.count) || 1)));
    const providedPrize = (body && body.prize) ? String(body.prize).trim() : '';
    const mode = (body && body.mode) ? String(body.mode).trim().toLowerCase() : 'random'; // 'random' | 'fixed'

    const inserted = [];
    for(let i=0;i<count;i++){
      let tries=0, ok=false, finalCode=genCode();
      const prize = mode === 'fixed' && providedPrize ? providedPrize : choosePrize();
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
