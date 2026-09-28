// Authentication is verified server-side. This endpoint intentionally has no read API.
const AUTH_URL = 'https://bmyvzfxzrppajuntwfxg.supabase.co';
const AUTH_KEY = 'sb_publishable_3QXe2UKLqty40BY5SE4RQQ_7vcwwrz-';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}
});

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const chunks = []; let size = 0;
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16384) { await reader.cancel(); throw new Error('large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function onRequest({request, env}) {
  if (request.method !== 'POST') return json(405,{error:'method_not_allowed'},{Allow:'POST'});
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json(403,{error:'forbidden'});
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json(415,{error:'invalid_content_type'});
  const authorization = request.headers.get('Authorization') || '';
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization) || authorization.length > 8192) return json(401,{error:'sign_in_required'});
  let body;
  try { body = await readBody(request); }
  catch (error) { return json(error.message === 'large' ? 413 : 400,{error:'invalid_request'}); }
  if (!body || typeof body !== 'object' || !uuid.test(body.requestId || '') ||
      !['suggestion','issue','correction','other'].includes(body.category) ||
      !['general','assessment','materials','design','learning'].includes(body.section) ||
      !['en','fr'].includes(body.locale) || typeof body.message !== 'string' ||
      [...body.message.trim()].length < 10 || body.message.length > 2000 || body.message.includes('\u0000')) return json(400,{error:'invalid_request'});
  if (!env.FEEDBACK_DB) return json(503,{error:'service_unavailable'});
  let user;
  try {
    const response = await fetch(`${AUTH_URL}/auth/v1/user`, {
      headers:{apikey:AUTH_KEY,Authorization:authorization}, signal:AbortSignal.timeout(10000)
    });
    if ([401,403].includes(response.status)) return json(401,{error:'sign_in_required'});
    if (!response.ok) return json(503,{error:'login_service_unavailable'});
    user = await response.json();
    if (!uuid.test(user?.id || '') || user.is_anonymous || !user.email_confirmed_at) return json(401,{error:'sign_in_required'});
  } catch { return json(503,{error:'login_service_unavailable'}); }
  const data = [body.category,body.section,body.message.trim(),body.locale];
  try {
    // Primary session prevents a just-written receipt being read from a stale replica.
    const db = env.FEEDBACK_DB.withSession('first-primary');
    const existing = await db.prepare('SELECT category, section, message, locale FROM feedback WHERE user_id = ? AND request_id = ?')
      .bind(user.id, body.requestId).first();
    const matches = row => row && data.every((value,index)=>value === row[['category','section','message','locale'][index]]);
    if (existing) return matches(existing) ? json(200,{ok:true,receipt:body.requestId}) : json(409,{error:'request_conflict'});
    // One atomic statement applies per-user limits even when requests arrive together.
    const result = await db.prepare(`INSERT INTO feedback (user_id, request_id, category, section, message, locale)
      SELECT ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE user_id = ? AND created_at > unixepoch() - 60)
        AND (SELECT COUNT(*) FROM feedback WHERE user_id = ? AND created_at > unixepoch() - 86400) < 10
      ON CONFLICT(user_id, request_id) DO NOTHING`)
      .bind(user.id, body.requestId, ...data, user.id, user.id).run();
    if (result.meta.changes > 0) return json(201,{ok:true,receipt:body.requestId});
    const receipt = await db.prepare('SELECT category, section, message, locale FROM feedback WHERE user_id = ? AND request_id = ?')
      .bind(user.id, body.requestId).first();
    if (receipt) return matches(receipt) ? json(200,{ok:true,receipt:body.requestId}) : json(409,{error:'request_conflict'});
    return json(429,{error:'rate_limited'},{'Retry-After':'60'});
  } catch {
    // Do not put feedback, credentials, or database error details in public responses/logs.
    return json(503,{error:'service_unavailable'});
  }
}
