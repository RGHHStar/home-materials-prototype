(() => {
 'use strict';
 const $=id=>document.getElementById(id),local=['127.0.0.1','localhost'].includes(location.hostname),demo=local&&new URLSearchParams(location.search).get('demo')==='1';
 const adminBase=location.pathname.startsWith('/admin')?'/admin/':'/';
 const words={zh:{title:'管理员登录',intro:'使用个人、导师或官方账号登录。权限将由服务器核验。',google:'使用 Google 登录',or:'或使用邮箱验证码',email:'管理员邮箱',code:'邮箱验证码',send:'发送验证码',verify:'验证并登录',switch:'退出当前账号',footnote:'个人账号负责登录，官方邮箱负责发信，两者独立。',role:'最高权限管理员',signout:'退出登录',checking:'正在核验管理员身份…',sent:'验证码已请求，请检查收件箱及垃圾邮件。',denied:'这个账号没有管理员权限。请使用已授权的管理员邮箱。',network:'无法连接登录服务，请检查网络后重试。',expired:'验证码不正确或已过期，请重新获取。',emailInvalid:'请输入有效的邮箱地址。',codeInvalid:'请先获取验证码，再输入邮件中的 6 位数字。',rate:'请求过于频繁，请稍后再试。',googleSetup:'本地 Google 登录回跳地址尚未配置，请先使用邮箱验证码登录。',unavailable:'请通过本地服务地址打开页面，不要直接双击 HTML 文件。',signedOut:'你已退出登录。',signOutFailed:'退出失败，请检查网络后重试。',googleFailed:'Google 登录未完成，请重试或使用邮箱验证码。'},en:{title:'Administrator sign-in',intro:'Sign in with your personal, mentor, or official account. The server verifies your access.',google:'Continue with Google',or:'or use an email code',email:'Administrator email',code:'Verification code',send:'Send code',verify:'Verify and sign in',switch:'Sign out of this account',footnote:'Your account signs in. The shared mailbox sends replies. They are separate.',role:'Full administrator',signout:'Sign out',checking:'Verifying administrator access…',sent:'Code requested. Check your inbox and spam folder.',denied:'This account is not an administrator. Use one of the approved administrator accounts.',network:'Cannot reach the login service. Check your connection and try again.',expired:'The code is incorrect or expired. Request a new one.',emailInvalid:'Enter a valid email address.',codeInvalid:'Request a code first, then enter the 6 digits from your email.',rate:'Too many attempts. Please try again later.',googleSetup:'The local Google callback is not configured yet. Use an email code for now.',unavailable:'Open this page using the local server URL, not directly as an HTML file.',signedOut:'You have signed out.',signOutFailed:'Sign-out failed. Check your connection and try again.',googleFailed:'Google sign-in did not finish. Retry or use an email code.'}};
 let clientPromise,config,approved=null,busy=false,sentEmail='',resendAt=0,notice='',revision=0,verifyTimer;
 const lang=()=>document.documentElement.lang.startsWith('zh')?'zh':'en',t=key=>words[lang()][key]||key;
 function paint(){document.querySelectorAll('[data-login-copy]').forEach(n=>n.textContent=t(n.dataset.loginCopy));$('login-status').textContent=t(notice);const remaining=Math.max(0,Math.ceil((resendAt-Date.now())/1000));$('login-send').disabled=busy||remaining>0;if(remaining)$('login-send').textContent=remaining+'s';['login-submit','login-google','login-email','login-code','login-signout','admin-signout'].forEach(id=>$(id).disabled=busy)}
 function report(error){notice=error?.status===429?'rate':error?.code==='otp_expired'?'expired':error?.uiKey||'network';paint()}
 function notify(){window.dispatchEvent(new CustomEvent('admin-session-change',{detail:approved}))}
 function lock(){approved=null;$('feedback').hidden=true;$('admin-session').hidden=true;$('login-panel').hidden=false;notify()}
 async function client(){
  if(!['http:','https:'].includes(location.protocol))throw {uiKey:'unavailable'};
  if(!clientPromise)clientPromise=(async()=>{
   const r=await fetch(adminBase==='/'?'/api/config':'/api/admin-config',{cache:'no-store'});if(!r.ok)throw new Error('config');config=await r.json();
   const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm');
   const c=createClient(config.supabaseUrl,config.publishableKey,{auth:{storageKey:'everdwell-admin-auth',flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
   c.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){revision++;lock();$('login-signout').hidden=true}else if(session){clearTimeout(verifyTimer);verifyTimer=setTimeout(()=>check(),0)}});return c;
  })().catch(e=>{clientPromise=null;throw e});return clientPromise;
 }
 async function api(path,options={}){
  const c=await client(),{data,error}=await c.auth.getSession();if(error||!data.session)throw {status:401,error:'sign_in_required'};
  const r=await fetch('/api/admin/'+path,{...options,headers:{'Content-Type':'application/json',...options.headers,Authorization:'Bearer '+data.session.access_token},cache:'no-store',signal:AbortSignal.timeout(30000)});
  let body;try{body=await r.json()}catch{throw {status:r.status,error:'data_unavailable'}};
  if(!r.ok){if(r.status===401||r.status===403){lock();notice=r.status===403?'denied':'expired';paint()}throw {status:r.status,...body}}return body;
 }
 async function check(){
  const attempt=++revision;try{
   const c=await client(),{data}=await c.auth.getSession();if(attempt!==revision)return;
   if(!data.session){lock();return}
   notice='checking';$('login-signout').hidden=false;paint();const verified=await api('me');if(attempt!==revision)return;
   const changed=approved?.user.id!==verified.user.id;approved=verified;$('login-panel').hidden=true;$('admin-session').hidden=false;$('admin-email').textContent=verified.user.email;$('feedback').hidden=false;notice='';paint();if(changed)notify();
  }catch(e){if(attempt!==revision)return;lock();notice=e.status===403?'denied':'network';paint()}
 }
 window.AdminSession=Object.freeze({demo,api,current:()=>approved,refresh:check});
 if(demo){$('login-panel').hidden=true;$('feedback').hidden=false;return}
 $('login-email').addEventListener('input',()=>{sentEmail='';$('login-code').value=''});
 $('login-code').addEventListener('input',()=>{$('login-code').value=$('login-code').value.replace(/\D/g,'').slice(0,6)});
 $('login-send').addEventListener('click',async()=>{
  if(busy||Date.now()<resendAt)return;const email=$('login-email').value.trim();if(!$('login-email').checkValidity()||!email){notice='emailInvalid';paint();return}
  if(!['frankguan20110115@gmail.com','qix220@g.harvard.edu','everdwellsupport@gmail.com'].includes(email.toLowerCase())){notice='denied';paint();return}
  busy=true;notice='';paint();try{const c=await client();const {error}=await c.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)throw error;sentEmail=email;resendAt=Date.now()+60000;notice='sent'}catch(e){report(e)}finally{busy=false;paint();$('login-code').focus()}
 });
 $('login-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;if(sentEmail!==$('login-email').value.trim()||!/^\d{6}$/.test($('login-code').value)){notice='codeInvalid';paint();return}
  busy=true;paint();try{const c=await client();const {error}=await c.auth.verifyOtp({email:sentEmail,token:$('login-code').value,type:'email'});if(error)throw error;$('login-code').value='';await check()}catch(e){report(e)}finally{busy=false;paint()}
 });
 $('login-google').addEventListener('click',async()=>{
  if(busy)return;busy=true;paint();try{const c=await client();if(!config.googleRedirectReady)throw {uiKey:'googleSetup'};const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+adminBase,queryParams:{prompt:'select_account'},scopes:'openid email profile'}});if(error)throw error}catch(e){report(e)}finally{busy=false;paint()}
 });
 async function signOut(){if(busy)return;busy=true;paint();try{const c=await client();const {error}=await c.auth.signOut({scope:'local'});if(error)throw error;revision++;lock();sentEmail='';$('login-code').value='';$('login-signout').hidden=true;notice='signedOut'}catch{notice='signOutFailed'}finally{busy=false;paint()}}
 $('login-signout').addEventListener('click',signOut);$('admin-signout').addEventListener('click',signOut);
 new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});setInterval(paint,1000);paint();
 (async()=>{try{const c=await client(),params=new URLSearchParams(location.search);if(params.has('code')||params.has('error')){history.replaceState(null,'',location.pathname);if(params.has('error'))throw {uiKey:'googleFailed'};const {error}=await c.auth.exchangeCodeForSession(params.get('code'));if(error)throw error}await check()}catch(e){report(e)}})();
})();
