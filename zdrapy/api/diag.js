import { sql } from './_db.js';

export default async function handler(req, res){
  try{
    const hasEnv = !!process.env.DATABASE_URL;
    let url = process.env.DATABASE_URL || '';
    const masked = url.replace(/:[^:@/]+@/,'://*****@').replace(/(\?.*)$/,''); // hide password + params
    let dbOk = false;
    try{
      const rows = await sql`select 1 as ok`;
      dbOk = rows && rows[0] && rows[0].ok === 1;
    }catch(e){
      res.statusCode = 500;
      res.setHeader('content-type','application/json');
      return res.end(JSON.stringify({ ok:false, hasEnv, databaseUrl: masked, dbOk, dbError: String(e) }));
    }
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:true, hasEnv, databaseUrl: masked, dbOk }));
  }catch(err){
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ ok:false, error: String(err) }));
  }
}
