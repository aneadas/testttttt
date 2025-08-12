export const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function genCode(){
  let out='';
  for(let i=0;i<10;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)];
  return out.slice(0,5)+'-'+out.slice(5);
}
export function nowIso(){ return new Date().toISOString().replace('T',' ').replace('Z',''); }
