import { sql } from './_db.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  prize TEXT,
  created_at TIMESTAMP NOT NULL,
  redeemed_at TIMESTAMP,
  redeemed_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
`;

export default async function handler(req, res){
  try{
    if(req.method !== 'POST') return res.status(405).send('Method not allowed');
    await sql.unsafe(SCHEMA);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok:true }));
  }catch(err){
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok:false, error: String(err) }));
  }
}
