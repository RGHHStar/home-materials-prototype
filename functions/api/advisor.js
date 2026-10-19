import {answerWithWorkersAI, configured} from '../_advisor/workers-ai.mjs';
export {reserveUsage} from '../_advisor/workers-ai.mjs';
const json=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function readBody(request) {
  const reader=request.body?.getReader();
  if(!reader) throw new Error('invalid');
  const chunks=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>40000){await reader.cancel();throw new Error('large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function onRequest({request,env={}}) {
  if(request.method==='GET') return json(200,{aiAvailable:configured(env)});
  if(request.method!=='POST') return json(405,{error:'method_not_allowed'},{Allow:'GET, POST'});
  const origin=request.headers.get('Origin');
  if((origin&&origin!==new URL(request.url).origin)||request.headers.get('Sec-Fetch-Site')==='cross-site') return json(403,{error:'forbidden'});
  if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json(415,{error:'invalid_content_type'});
  let body;try{body=await readBody(request);}catch(error){return json(error.message==='large'?413:400,{error:'invalid_request'});}
  if(!body||typeof body.question!=='string'||!body.question.trim()||body.question.length>1500||body.question.includes('\u0000')||!/^[-0-9a-f]{36}$/i.test(body.requestId||'')) return json(400,{error:'invalid_request'});
  return json(200,await answerWithWorkersAI(request,env,body));
}
