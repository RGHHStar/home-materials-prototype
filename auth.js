(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialog = $('auth-dialog');
  const config = window.EVERDWELL_AUTH_CONFIG || {};
  // Capture OAuth failures before the site's hash router normalizes the URL.
  const callbackParams = new URLSearchParams(location.search);
  const callbackHash = new URLSearchParams(location.hash.slice(1));
  const words = {
    en: {
      signIn:'Sign in',account:'My account',welcome:'Welcome home.',welcomeBack:'You’re signed in.',intro:'Sign in or create an account with your email. No password to remember.',signedInIntro:'Welcome to your EverDwell account.',email:'Email address',emailHelp:'Personal and school email addresses are welcome.',code:'Verification code',send:'Send code',resend:'Resend code',verify:'Sign in',or:'or continue with',google:'Sign in with Google',schoolNote:'School-managed Google accounts may need your school’s approval. Email codes also depend on your school’s mail settings.',sharedDevice:'Using a shared computer? Sign out when you’re finished.',continue:'Continue exploring',signOut:'Sign out',close:'Close',accountNote:'Your account is signed in. Saving assessments and plans is not available yet.',sending:'Sending…',verifying:'Verifying…',connecting:'Connecting…',emailInvalid:'Enter a valid email address, such as you@example.com.',codeInvalid:'Enter the 6-digit code from your email.',sendFirst:'Send a code to this email address first.',sent:'Code requested for {email}. Check your inbox and spam folder. If no email arrives, your school may be filtering it.',unavailable:'Account sign-in is not available yet. The website owner still needs to connect the authentication service.',emailUnavailable:'Email sign-in is not available yet. The website owner still needs to finish setting up the email sender.',googleUnavailable:'Google sign-in is not available yet. The website owner still needs to finish connecting Google.',network:'Unable to connect to the login service. Check your connection and try again.',rate:'Too many attempts. Please wait a few minutes before trying again.',expired:'This code is incorrect or has expired. Check your code or request a new one.',failed:'Sign-in could not be completed. Please try again.',redirectFailed:'Google sign-in was cancelled or could not be completed. If this is a school account, your administrator may need to approve the app.',signedOut:'You have signed out.',signOutFailed:'Unable to sign out. Check your connection and try again.',https:'Open the hosted website or its local preview to use sign-in.',emailChanged:'Email changed. Please send a new code to this address.'
    },
    fr: {
      signIn:'Connexion',account:'Mon compte',welcome:'Bienvenue chez vous.',welcomeBack:'Vous êtes connecté.',intro:'Connectez-vous ou créez un compte avec votre adresse courriel. Aucun mot de passe à retenir.',signedInIntro:'Bienvenue dans votre compte EverDwell.',email:'Adresse courriel',emailHelp:'Les adresses personnelles et scolaires sont acceptées.',code:'Code de vérification',send:'Envoyer le code',resend:'Renvoyer le code',verify:'Se connecter',or:'ou continuer avec',google:'Se connecter avec Google',schoolNote:'Un compte Google scolaire peut nécessiter l’autorisation de votre école. La réception des codes dépend aussi des paramètres de sa messagerie.',sharedDevice:'Ordinateur partagé ? Déconnectez-vous après utilisation.',continue:'Continuer à explorer',signOut:'Se déconnecter',close:'Fermer',accountNote:'Vous êtes connecté. L’enregistrement des évaluations et des plans n’est pas encore disponible.',sending:'Envoi…',verifying:'Vérification…',connecting:'Connexion…',emailInvalid:'Saisissez une adresse courriel valide, comme vous@exemple.ca.',codeInvalid:'Saisissez le code à 6 chiffres reçu par courriel.',sendFirst:'Envoyez d’abord un code à cette adresse.',sent:'Code demandé pour {email}. Vérifiez votre boîte de réception et vos pourriels. Votre école pourrait filtrer le message.',unavailable:'La connexion n’est pas encore disponible. Le propriétaire doit connecter le service d’authentification.',emailUnavailable:'La connexion par courriel n’est pas encore disponible. Le propriétaire doit configurer le service d’envoi.',googleUnavailable:'La connexion Google n’est pas encore disponible. Le propriétaire doit terminer la configuration Google.',network:'Impossible de joindre le service. Vérifiez votre connexion et réessayez.',rate:'Trop de tentatives. Attendez quelques minutes avant de réessayer.',expired:'Ce code est incorrect ou a expiré. Vérifiez-le ou demandez-en un nouveau.',failed:'La connexion a échoué. Veuillez réessayer.',redirectFailed:'La connexion Google a été annulée ou a échoué. Pour un compte scolaire, une autorisation de l’administrateur peut être nécessaire.',signedOut:'Vous êtes déconnecté.',signOutFailed:'Impossible de vous déconnecter. Vérifiez votre connexion et réessayez.',https:'Ouvrez le site hébergé ou son aperçu local pour vous connecter.',emailChanged:'Adresse modifiée. Envoyez un nouveau code à cette adresse.'
    }
  };
  let clientPromise, user = null, busy = '', authRevision = 0;
  let notice = null;
  let otpEmail = '', resendAt = 0;
  const t = key => words[document.documentElement.lang.startsWith('fr') ? 'fr' : 'en'][key];
  const read = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const write = (key,value) => { try { value === null ? sessionStorage.removeItem(key) : sessionStorage.setItem(key,value); } catch {} };
  try { const saved = JSON.parse(read('everdwell-auth-otp') || 'null'); if (saved && typeof saved.email === 'string' && saved.expires > Date.now()) { otpEmail=saved.email; resendAt=Number(saved.resendAt)||0; $('auth-email').value=otpEmail; } } catch {}
  function showNotice(key, kind='info', values={}) { notice={key,kind,values}; renderNotice(); }
  function renderNotice() {
    $('auth-status').hidden=!notice;
    if (!notice) return;
    $('auth-status').dataset.kind=notice.kind;
    $('auth-status').textContent=Object.entries(notice.values).reduce((text,[key,value])=>text.replace('{'+key+'}',value),t(notice.key));
  }
  function render() {
    document.querySelectorAll('[data-auth-copy]').forEach(node=>node.textContent=t(node.dataset.authCopy));
    $('auth-open').querySelector('span').textContent=t(user?'account':'signIn');
    $('auth-title').textContent=t(user?'welcomeBack':'welcome');
    $('auth-intro').textContent=t(user?'signedInIntro':'intro');
    $('auth-close').setAttribute('aria-label',t('close'));
    $('auth-login-panel').hidden=!!user;
    $('auth-account-panel').hidden=!user;
    $('auth-account-email').textContent=user?.email || '';
    const remaining=Math.max(0,Math.ceil((resendAt-Date.now())/1000));
    $('auth-send').disabled=!!busy || remaining>0;
    $('auth-send').textContent=busy==='send'?t('sending'):remaining?`${remaining}s`:t(otpEmail?'resend':'send');
    $('auth-submit').disabled=!!busy;
    $('auth-submit').textContent=t(busy==='verify'?'verifying':'verify');
    $('auth-google').disabled=!!busy;
    if(busy==='google') $('auth-google').querySelector('span').textContent=t('connecting');
    $('auth-email').disabled=!!busy;
    $('auth-code').disabled=!!busy;
    $('auth-signout').disabled=!!busy;
    renderNotice();
  }
  function open() { render(); if(!dialog.open)dialog.showModal(); if(!user)$('auth-email').focus(); }
  function isConfigured() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.supabaseUrl || '') && typeof config.publishableKey==='string' && config.publishableKey.startsWith('sb_publishable_');
  }
  async function getClient() {
    if(!['https:','http:'].includes(location.protocol)) throw {uiKey:'https'};
    if(!isConfigured()) throw {uiKey:'unavailable'};
    if(!clientPromise) clientPromise=(async()=>{
      const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm');
      const client=createClient(config.supabaseUrl,config.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
      client.auth.onAuthStateChange((event,session)=>{
        if(event==='SIGNED_OUT'){authRevision++;user=null;render();}
        // Do not await another Supabase call inside its auth-state callback.
        else if(session) setTimeout(()=>refreshUser(client),0);
      });
      return client;
    })().catch(error=>{clientPromise=null;throw error;});
    return clientPromise;
  }
  async function refreshUser(client) {
    const revision=authRevision;
    const {data,error}=await client.auth.getUser();
    if(revision!==authRevision)return;
    user=!error ? data.user : null;
    if(user){$('auth-code').value='';notice=null;}
    render();
  }
  function report(error,fallback='failed') {
    let key=error?.uiKey;
    if(!key){
      if(error?.status===429 || /rate_limit|over_.*limit/.test(error?.code||''))key='rate';
      else if(/otp_expired|otp_disabled/.test(error?.code||''))key='expired';
      else if(error instanceof TypeError || /fetch|network/i.test(error?.message||''))key='network';
      else key=fallback;
    }
    showNotice(key,'error');
  }
  function validEmail() {
    $('auth-email').value=$('auth-email').value.trim();
    const valid=$('auth-email').checkValidity();
    $('auth-email').setAttribute('aria-invalid',String(!valid));
    if(!valid){showNotice('emailInvalid','error');$('auth-email').focus();}
    return valid;
  }
  $('auth-open').addEventListener('click',open);
  $('auth-close').addEventListener('click',()=>dialog.close());
  $('auth-continue').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{$('auth-code').value='';$('auth-open').focus();});
  $('auth-email').addEventListener('input',()=>{
    $('auth-email').removeAttribute('aria-invalid');
    if(otpEmail && $('auth-email').value.trim()!==otpEmail){otpEmail='';$('auth-code').value='';write('everdwell-auth-otp',null);showNotice('emailChanged');}
    render();
  });
  $('auth-code').addEventListener('input',()=>{$('auth-code').value=$('auth-code').value.replace(/\D/g,'').slice(0,6);$('auth-code').removeAttribute('aria-invalid');});
  $('auth-send').addEventListener('click',async()=>{
    if(busy || Date.now()<resendAt || !validEmail())return;
    busy='send';notice=null;render();
    try{
      const client=await getClient();
      if(!config.emailOtpEnabled)throw {uiKey:'emailUnavailable'};
      const email=$('auth-email').value;
      const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true}});
      if(error)throw error;
      otpEmail=email;resendAt=Date.now()+60000;
      write('everdwell-auth-otp',JSON.stringify({email,resendAt,expires:Date.now()+10*60*1000}));
      showNotice('sent','info',{email});
    }catch(error){report(error);}finally{busy='';render();if(otpEmail)$('auth-code').focus();}
  });
  $('auth-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy || !validEmail())return;
    if(otpEmail!==$('auth-email').value){showNotice('sendFirst','error');return;}
    if(!/^\d{6}$/.test($('auth-code').value)){showNotice('codeInvalid','error');$('auth-code').setAttribute('aria-invalid','true');$('auth-code').focus();return;}
    busy='verify';notice=null;render();
    try{
      const client=await getClient();
      const {error}=await client.auth.verifyOtp({email:otpEmail,token:$('auth-code').value,type:'email'});
      if(error)throw error;
      await refreshUser(client);
      if(!user)throw {uiKey:'failed'};
      otpEmail='';resendAt=0;write('everdwell-auth-otp',null);
    }catch(error){report(error);}finally{busy='';render();}
  });
  $('auth-google').addEventListener('click',async()=>{
    if(busy)return;busy='google';notice=null;render();
    try{
      const client=await getClient();if(!config.googleEnabled)throw {uiKey:'googleUnavailable'};
      write('everdwell-auth-return',location.hash);
      const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'},scopes:'openid email profile'}});
      if(error)throw error;
    }catch(error){report(error);}finally{busy='';render();}
  });
  $('auth-signout').addEventListener('click',async()=>{
    if(busy)return;busy='signout';render();
    try{const client=await getClient();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;authRevision++;user=null;showNotice('signedOut');}
    catch(error){report(error,'signOutFailed');}finally{busy='';render();}
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  setInterval(()=>{if(dialog.open && !user)render();},1000);
  render();
  async function initialize(){
    const code=callbackParams.get('code');
    const oauthError=callbackParams.has('error') || callbackHash.has('error');
    if(!isConfigured())return;
    try{
      const client=await getClient();
      if(code || oauthError){
        const clean=new URL(location.href);['code','error','error_description','error_code'].forEach(key=>clean.searchParams.delete(key));
        if(new URLSearchParams(clean.hash.slice(1)).has('error'))clean.hash='#home';
        history.replaceState(history.state,'',clean.pathname+clean.search+clean.hash);
        if(oauthError)throw {uiKey:'redirectFailed'};
        const {error}=await client.auth.exchangeCodeForSession(code);if(error)throw error;
        const previous=read('everdwell-auth-return');write('everdwell-auth-return',null);
        if(previous && /^#(?:home|assessment|identify|house|build(?:\/[a-z-]+)?|carbon-article|sustainable-housing)$/.test(previous)){
          history.replaceState(history.state,'',location.pathname+location.search+previous);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        await refreshUser(client);open();
      }else{const {data}=await client.auth.getSession();if(data.session)await refreshUser(client);}
    }catch(error){report(error,code?'redirectFailed':'network');if(code||oauthError)open();}
  }
  initialize();
})();
