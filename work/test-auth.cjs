const {chromium}=require('C:/Users/Frank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const root='C:/Users/Frank/Desktop/home-materials-prototype/work';
(async()=>{
  const browser=await chromium.launch({headless:false,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4180/#home');
  await page.locator('#auth-open').click();
  await page.locator('#auth-dialog').waitFor({state:'visible'});
  await page.locator('#auth-send').click();
  assert.match(await page.locator('#auth-status').innerText(),/valid email/);
  await page.locator('#auth-email').fill('student@hdsb.ca');
  await page.locator('#auth-send').click();
  await page.waitForFunction(()=>document.getElementById('auth-status').textContent.includes('not available'));
  assert.equal(await page.locator('#auth-email').getAttribute('aria-invalid'),'false');
  assert.equal(await page.locator('#auth-account-panel').isVisible(),false);
  await page.locator('#auth-google').click();
  assert.match(await page.locator('#auth-status').innerText(),/not available/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#auth-dialog').isVisible(),false);
  assert.equal(await page.locator('#auth-open').evaluate(el=>el===document.activeElement),true);
  await page.locator('[data-lang="fr"]').click();
  await page.locator('#auth-open').click();
  assert.match(await page.locator('#auth-title').innerText(),/Bienvenue/);
  await page.screenshot({path:root+'/auth-desktop-fr.png'});
  await page.keyboard.press('Escape');
  await page.locator('[data-lang="en"]').click();
  await page.locator('#auth-open').click();
  await page.screenshot({path:root+'/auth-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('#auth-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
  await page.screenshot({path:root+'/auth-mobile.png'});
  console.log('PASS: unconfigured service is honest; school email accepted; EN/FR; dialog focus and Escape; mobile layout.');

  // Local UI integration doubles only: these do not send email or prove live authentication.
  await page.route('**/auth-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.EVERDWELL_AUTH_CONFIG={supabaseUrl:'https://test-project.supabase.co',publishableKey:'sb_publishable_ui_test_only',emailOtpEnabled:true,googleEnabled:true};"}));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm',r=>r.fulfill({contentType:'text/javascript',body:`
    export function createClient(){let session=null;window.__authCalls=[];const listeners=[];return {auth:{
      onAuthStateChange(fn){listeners.push(fn)},
      async getSession(){return {data:{session}}},
      async getUser(){return {data:{user:session?.user||null},error:null}},
      async signInWithOtp(args){window.__authCalls.push(['send',args]);return {error:window.__failSend?{status:429}:null}},
      async verifyOtp(args){window.__authCalls.push(['verify',args]);if(args.token!=='123456')return {error:{code:'otp_expired'}};session={user:{email:args.email}};listeners.forEach(fn=>fn('SIGNED_IN',session));return {data:{session},error:null}},
      async signInWithOAuth(args){window.__authCalls.push(['google',args]);return {error:null}},
      async signOut(){session=null;listeners.forEach(fn=>fn('SIGNED_OUT',null));return {error:null}}
    }}}
  `}));
  await page.reload();await page.locator('#auth-open').click();
  await page.locator('#auth-email').fill('student@hdsb.ca');
  await page.evaluate(()=>window.__failSend=true);
  await page.locator('#auth-send').click();
  await page.waitForFunction(()=>document.getElementById('auth-status').textContent.includes('Too many'));
  assert.equal(await page.locator('#auth-send').isDisabled(),false);
  await page.evaluate(()=>window.__failSend=false);
  await page.locator('#auth-send').click();
  await page.waitForFunction(()=>document.getElementById('auth-status').textContent.includes('Code requested'));
  assert.equal(await page.locator('#auth-send').isDisabled(),true);
  await page.locator('#auth-code').fill('999999');await page.locator('#auth-submit').click();
  await page.waitForFunction(()=>document.getElementById('auth-status').textContent.includes('expired'));
  assert.equal(await page.locator('#auth-account-panel').isVisible(),false);
  await page.locator('#auth-code').fill('123456');await page.locator('#auth-submit').click();
  await page.locator('#auth-account-panel').waitFor({state:'visible'});
  assert.equal(await page.locator('#auth-account-email').innerText(),'student@hdsb.ca');
  await page.locator('#auth-signout').click();await page.locator('#auth-login-panel').waitFor({state:'visible'});
  await page.locator('#auth-google').click();
  await page.waitForFunction(()=>window.__authCalls.some(([name])=>name==='google'));
  const googleCall=await page.evaluate(()=>window.__authCalls.find(([name])=>name==='google')[1]);
  assert.equal(googleCall.provider,'google');assert.equal(googleCall.options.redirectTo,'http://localhost:4180/');
  assert.equal(googleCall.options.scopes,'openid email profile');
  assert.deepEqual(errors,[]);
  console.log('PASS: simulated provider errors, resend cooldown, wrong code rejected, verified account state, sign-out, Google request. Live email/OAuth not tested.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
