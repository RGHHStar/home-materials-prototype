import {generateAnswer, fallbackAnswer, sanitizeContext} from '../_advisor/core.mjs';
const json=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const configured=env=>typeof env.OPENAI_API_KEY==='string'&&!!env.OPENAI_API_KEY.trim();
async function readBody(request) {
  const reader=request.body?.getReader();
  if(!reader) throw new Error('invalid');
  const chunks=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>40000){await reader.cancel();throw new Error('large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
// Paid mode fails closed unless its shared database quota can reserve a request.
// Only counters are stored; never questions, chat, email, assessment or raw IP.
export async function reserveUsage(request,env,requestId) {
  const ip=request.headers.get('CF-Connecting-IP');
  if(!env.FEEDBACK_DB||!ip) return false;
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.OPENAI_API_KEY+'|'+ip));
  const visitor=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  const db=env.FEEDBACK_DB.withSession('first-primary');
  // Provision only the isolated AI usage table when paid mode is first enabled.
  await db.prepare('CREATE TABLE IF NOT EXISTS advisor_usage (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT (unixepoch()))').run();
  await db.prepare('DELETE FROM advisor_usage WHERE created_at < unixepoch()-172800').run();
  const result=await db.prepare(`INSERT INTO advisor_usage(id,visitor) SELECT ?,?
    WHERE (SELECT COUNT(*) FROM advisor_usage WHERE visitor=? AND created_at>unixepoch()-60)<6
      AND (SELECT COUNT(*) FROM advisor_usage WHERE visitor=? AND created_at>unixepoch()-86400)<30
      AND (SELECT COUNT(*) FROM advisor_usage WHERE created_at>unixepoch()-86400)<300
    ON CONFLICT(id) DO NOTHING`).bind(visitor+':'+requestId,visitor,visitor,visitor).run();
  return result.meta?.changes===1;
}
export async function onRequest({request,env={}}) {
  if(request.method==='GET') return json(200,{aiAvailable:configured(env)});
  if(request.method!=='POST') return json(405,{error:'method_not_allowed'},{Allow:'GET, POST'});
  const origin=request.headers.get('Origin');
  if((origin&&origin!==new URL(request.url).origin)||request.headers.get('Sec-Fetch-Site')==='cross-site') return json(403,{error:'forbidden'});
  if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json(415,{error:'invalid_content_type'});
  let body;try{body=await readBody(request);}catch(error){return json(error.message==='large'?413:400,{error:'invalid_request'});}
  if(!body||typeof body.question!=='string'||!body.question.trim()||body.question.length>1500||body.question.includes('\u0000')||!/^[-0-9a-f]{36}$/i.test(body.requestId||'')) return json(400,{error:'invalid_request'});
  const context=sanitizeContext(body.context),question=body.question.trim();
  if(configured(env)) {
    try {if(!await reserveUsage(request,env,body.requestId)) return json(200,fallbackAnswer(question,context));}
    catch{return json(200,fallbackAnswer(question,context));}
  }
  return json(200,await generateAnswer(question,body.history,context,{apiKey:configured(env)?env.OPENAI_API_KEY.trim():'',model:env.OPENAI_MODEL||'gpt-4.1-mini'}));
}
