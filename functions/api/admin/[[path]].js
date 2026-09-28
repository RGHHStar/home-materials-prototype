import {mailConfigured,mailSchemaReady,deliverMail,retryMail,publicMail} from '../../_mail/mail-core.mjs';
import {validEmail} from '../../_mail/smtp.mjs';
export const AUTH_URL='https://bmyvzfxzrppajuntwfxg.supabase.co';
export const PUBLIC_KEY='sb_publishable_3QXe2UKLqty40BY5SE4RQQ_7vcwwrz-';
// Verified existing Supabase identities. Neither email recycling nor client metadata grants access.
const ADMIN_USERS=new Map([
 ['9f373a9b-edac-42f4-b1fe-d79d11fbb833','frankguan20110115@gmail.com'],
 ['f461290f-5099-4ecd-ac8e-7c2012fb0096','qix220@g.harvard.edu'],
 ['35a02ec4-72b2-42da-95bf-9efa3490b61b','everdwellsupport@gmail.com']
]);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const response=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function authenticate(request){
  const bearer=request.headers.get('Authorization')||'';
  if(!/^Bearer [A-Za-z0-9._-]+$/.test(bearer)||bearer.length>8192)return {error:response(401,{error:'sign_in_required'})};
  try{
    const r=await fetch(AUTH_URL+'/auth/v1/user',{headers:{apikey:PUBLIC_KEY,Authorization:bearer},signal:AbortSignal.timeout(10000)});
    if(r.status===401||r.status===403)return {error:response(401,{error:'sign_in_required'})};
    if(!r.ok)return {error:response(503,{error:'auth_unavailable'})};
    const user=await r.json();
    if(!uuid.test(user?.id||'')||!user.email_confirmed_at||user.is_anonymous||ADMIN_USERS.get(user.id)!==(user.email||'').toLowerCase())return {error:response(403,{error:'admin_required'})};
    return {user};
  }catch{return {error:response(503,{error:'auth_unavailable'})}}
}
async function bodyOf(request){
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new Error('invalid');
  let size=0,text='';const decoder=new TextDecoder();
  if(!request.body)throw new Error('invalid');
  const reader=request.body.getReader();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>24576){await reader.cancel();throw new Error('invalid')}text+=decoder.decode(value,{stream:true})}
  return JSON.parse(text+decoder.decode());
}
async function emailFor(id,key){
  if(!uuid.test(id))return null;
  // Only the trusted auth server chooses the email; never accept a client-supplied recipient.
  const headers={apikey:key};if(!key.startsWith('sb_secret_'))headers.Authorization='Bearer '+key;
  const r=await fetch(AUTH_URL+'/auth/v1/admin/users/'+encodeURIComponent(id),{headers,signal:AbortSignal.timeout(10000)});
  if(r.status===404)return null;
  if(!r.ok)throw new Error('directory_unavailable');
  const user=await r.json();return typeof user.email==='string'?user.email:null;
}
export async function handleAdmin(request,env){
  const url=new URL(request.url),path=url.pathname;
  const origin=request.headers.get('Origin');
  if(origin&&origin!==url.origin)return response(403,{error:'forbidden_origin'});
  if(request.method==='OPTIONS')return response(405,{error:'method_not_allowed'});
  const auth=await authenticate(request);if(auth.error)return auth.error;
  if(path==='/api/admin/me'&&request.method==='GET')return response(200,{user:{id:auth.user.id,email:auth.user.email,role:'owner'},databaseConfigured:!!env.DB,directoryConfigured:!!env.SUPABASE_SECRET_KEY,remoteWrites:env.ALLOW_REMOTE_WRITES===true,mailConfigured:mailConfigured(env),sender:'everdwellsupport@gmail.com'});
  if((path==='/api/admin/reply'||path==='/api/admin/mail/retry')&&!mailConfigured(env))return response(503,{error:'mail_not_configured'});
  if(!env.DB)return response(503,{error:'database_not_configured'});
  try{
    if(path==='/api/admin/feedback'&&request.method==='GET'){
      if(!env.SUPABASE_SECRET_KEY)return response(503,{error:'directory_not_configured'});
      const before=url.searchParams.get('before');
      if(before&&!/^[1-9]\d{0,14}$/.test(before))return response(400,{error:'invalid_request'});
      // Until the additive migration is applied, old feedback is still readable as pending.
      const ready=await env.DB.query("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback_admin_state'",[]);
      const joined=ready.length>0;
      const fields=joined?"COALESCE(s.status, 'pending') AS status, COALESCE(s.version,0) AS version":"'pending' AS status, 0 AS version";
      const records=await env.DB.query(`SELECT f.id, f.user_id, f.category, f.section, f.message, f.locale, f.created_at, ${fields} FROM feedback f ${joined?'LEFT JOIN feedback_admin_state s ON s.feedback_id=f.id':''} ${before?'WHERE f.id < ?':''} ORDER BY f.id DESC LIMIT 51`,before?[Number(before)]:[]);
      const items=records.slice(0,50),ids=[...new Set(items.map(r=>r.user_id))],emails=new Map();
      // Small bounded batches avoid issuing 50 simultaneous administrative directory requests.
      for(let i=0;i<ids.length;i+=5)await Promise.all(ids.slice(i,i+5).map(async id=>emails.set(id,await emailFor(id,env.SUPABASE_SECRET_KEY))));
      const mailReady=await mailSchemaReady(env.DB);
      const history=mailReady&&items.length?await env.DB.query(`SELECT id,feedback_id,kind,request_id,body,status,error_code,attempts,created_at,updated_at FROM feedback_mail WHERE feedback_id IN (${items.map(()=>'?').join(',')}) ORDER BY created_at DESC LIMIT 1000`,items.map(r=>r.id)):[];
      for(const mail of history)if(mail.status==='sending'&&mail.updated_at<Math.floor(Date.now()/1000)-60)mail.status='unknown';
      return response(200,{items:items.map(row=>({...row,email:emails.get(row.user_id)||null,mail:history.filter(m=>m.feedback_id===row.id)})),nextCursor:records.length>50?String(items.at(-1).id):null,stateReady:joined,mailReady:mailReady&&mailConfigured(env)});
    }
    if(path==='/api/admin/reply'&&request.method==='POST'){
      if(env.ALLOW_REMOTE_WRITES!==true)return response(503,{error:'writes_disabled'});
      if(!env.SUPABASE_SECRET_KEY||!await mailSchemaReady(env.DB))return response(503,{error:'mail_not_configured'});
      let body;try{body=await bodyOf(request)}catch{return response(400,{error:'invalid_request'})}
      if(!Number.isSafeInteger(body?.id)||body.id<1||!uuid.test(body.requestId||'')||!Number.isSafeInteger(body.version)||body.version<0||typeof body.text!=='string'||!body.text.trim()||body.text.length>5000||body.text.includes('\0'))return response(400,{error:'invalid_request'});
      const id='reply-'+body.requestId;
      const previous=await publicMail(env.DB,id);
      if(previous){if(previous.feedback_id!==body.id||previous.body!==body.text)return response(409,{error:'request_conflict'});const mail=await deliverMail(env.DB,env,id);return response(200,{mail})}
      const feedback=(await env.DB.query('SELECT user_id FROM feedback WHERE id=?',[body.id]))[0];if(!feedback)return response(404,{error:'not_found'});
      const recipient=await emailFor(feedback.user_id,env.SUPABASE_SECRET_KEY);if(!validEmail(recipient))return response(409,{error:'recipient_unavailable'});
      const added=await env.DB.query(`INSERT INTO feedback_mail(id,feedback_id,kind,request_id,recipient,subject,body,created_by,status)
        SELECT ?,?,'reply',?,?,?,?,?,'pending'
        WHERE COALESCE((SELECT version FROM feedback_admin_state WHERE feedback_id=?),0)=?
        AND NOT EXISTS (SELECT 1 FROM feedback_mail WHERE feedback_id=? AND kind='reply' AND status IN ('pending','sending','unknown'))
        AND (SELECT COUNT(*) FROM feedback_mail WHERE feedback_id=? AND kind='reply' AND created_at>unixepoch()-86400)<10
        ON CONFLICT DO NOTHING RETURNING id`,[id,body.id,body.requestId,recipient,`EverDwell - Reply to your feedback #${body.id}`,body.text,auth.user.id,body.id,body.version,body.id,body.id]);
      if(!added.length){const raced=await publicMail(env.DB,id);if(raced&&raced.feedback_id===body.id&&raced.body===body.text)return response(200,{mail:await deliverMail(env.DB,env,id)});return response(409,{error:'reply_conflict'})}
      return response(200,{mail:await deliverMail(env.DB,env,id)});
    }
    if(path==='/api/admin/mail/retry'&&request.method==='POST'){
      if(env.ALLOW_REMOTE_WRITES!==true)return response(503,{error:'writes_disabled'});
      let body;try{body=await bodyOf(request)}catch{return response(400,{error:'invalid_request'})}
      if(typeof body?.id!=='string'||!/^ack-[1-9]\d*$|^reply-[0-9a-f-]{36}$/i.test(body.id))return response(400,{error:'invalid_request'});
      const mail=await retryMail(env.DB,env,body.id);return mail?response(200,{mail}):response(404,{error:'not_found'});
    }
    if(path==='/api/admin/status'&&request.method==='PATCH'){
      if(env.ALLOW_REMOTE_WRITES!==true)return response(503,{error:'writes_disabled'});
      let body;try{body=await bodyOf(request)}catch{return response(400,{error:'invalid_request'})}
      if(!body||!Number.isSafeInteger(body.id)||body.id<1||!['pending','done'].includes(body.status)||!Number.isSafeInteger(body.version)||body.version<0)return response(400,{error:'invalid_request'});
      const exists=await env.DB.query('SELECT id FROM feedback WHERE id=?',[body.id]);if(!exists.length)return response(404,{error:'not_found'});
      // Optimistic version prevents one admin silently overwriting the other's recent change.
      const changed=body.version===0?await env.DB.query(`INSERT INTO feedback_admin_state(feedback_id,status,version,updated_by,updated_at)
        SELECT ?,?,1,?,unixepoch() WHERE ?=0
        ON CONFLICT(feedback_id) DO UPDATE SET status=excluded.status,version=feedback_admin_state.version+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at
        WHERE feedback_admin_state.version=? RETURNING status,version`,[body.id,body.status,auth.user.id,body.version,body.version]):[];
      const result=body.version>0?await env.DB.query('UPDATE feedback_admin_state SET status=?,version=version+1,updated_by=?,updated_at=unixepoch() WHERE feedback_id=? AND version=? RETURNING status,version',[body.status,auth.user.id,body.id,body.version]):changed;
      if(!result.length)return response(409,{error:'status_conflict'});
      return response(200,{ok:true,...result[0]});
    }
    return response(404,{error:'not_found'});
  }catch{return response(503,{error:'data_unavailable'})}
}

// Cloudflare Pages adapter. Credentials are encrypted platform variables, not assets.
import {gmailSender} from '../../_mail/gmail.mjs';
export async function onRequest({request,env}){
 const database=env.FEEDBACK_DB?.withSession('first-primary');
 const DB=database?{async query(sql,params){
  const result=await database.prepare(sql).bind(...params).all();
  if(!result.success)throw new Error('database_unavailable');
  return result.results;
 }}:undefined;
 return handleAdmin(request,{DB,SUPABASE_SECRET_KEY:env.SUPABASE_SECRET_KEY,ALLOW_REMOTE_WRITES:env.ADMIN_WRITES_ENABLED==='true',MAIL_ENABLED:!!env.GMAIL_APP_PASSWORD,sendMail:gmailSender(env.GMAIL_APP_PASSWORD)});
}
