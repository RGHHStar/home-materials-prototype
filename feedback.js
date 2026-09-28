(() => {
  'use strict';
  const form=document.getElementById('feedback-form');
  if(!form)return;
  const message=document.getElementById('feedback-message');
  const category=document.getElementById('feedback-type');
  const section=document.getElementById('feedback-section');
  const status=document.getElementById('feedback-status');
  const words={
    en:{eyebrow:'Your perspective matters',title:'Help shape a better EverDwell.',intro:'Something useful, something missing, or something we could do better? We’d love to hear from you.',private:'Private feedback. Never a public comment.',type:'What would you like to share?',section:'Which part of EverDwell?',suggestion:'A suggestion',issue:'A problem using the site',correction:'A content correction',other:'Something else',general:'The website in general',assessment:'Home assessment',materials:'Material explorer',design:'Interactive home design',learning:'Learning articles',message:'Your feedback',placeholder:'Tell us what’s on your mind…',help:'Please leave out passwords, addresses and other sensitive information.',submit:'Send feedback',preview:'Preview only. Submissions are not being saved yet.',tooShort:'Please write at least 10 characters so we can understand your feedback.',tooLong:'Please keep your feedback to 2,000 characters or fewer.',notConnected:'Your feedback has not been sent or saved. Submissions will be available once the feedback service is connected. Your text is still here for you to edit.'},
    fr:{eyebrow:'Votre point de vue compte',title:'Ensemble, améliorons EverDwell.',intro:'Un outil utile, un élément manquant ou une amélioration à proposer ? Votre avis nous intéresse.',private:'Vos commentaires restent privés, jamais publics.',type:'Que souhaitez-vous partager ?',section:'Quelle partie d’EverDwell ?',suggestion:'Une suggestion',issue:'Un problème d’utilisation',correction:'Une correction de contenu',other:'Autre chose',general:'Le site en général',assessment:'Évaluation du logement',materials:'Explorateur de matériaux',design:'Conception interactive du logement',learning:'Articles pédagogiques',message:'Vos commentaires',placeholder:'Dites-nous ce que vous en pensez…',help:'N’indiquez pas de mots de passe, d’adresses ou d’autres renseignements sensibles.',submit:'Envoyer mon avis',preview:'Aperçu uniquement. Aucun commentaire n’est enregistré pour le moment.',tooShort:'Veuillez saisir au moins 10 caractères pour nous aider à comprendre votre avis.',tooLong:'Veuillez limiter votre commentaire à 2 000 caractères.',notConnected:'Votre commentaire n’a été ni envoyé ni enregistré. L’envoi sera disponible lorsque le service sera connecté. Votre texte reste ici pour que vous puissiez le modifier.'}
  };
  let notice='',kind='info',busy=false,pending=null,revision=0;
  Object.assign(words.en,{preview:'Feedback is sent privately to the EverDwell team.',sending:'Sending…',saved:'Thank you! Your feedback has been saved.',failed:'We could not confirm that your feedback was saved. Your text is still here; please try again.',rate:'Please wait before sending again. You can send one feedback per minute, up to 10 per day.',signInAgain:'Please sign in again to send your feedback.',conflict:'This submission could not be confirmed. Please refresh the page before sending again.'});
  Object.assign(words.fr,{preview:'Vos commentaires sont envoyés en privé à l’équipe EverDwell.',sending:'Envoi…',saved:'Merci ! Votre commentaire a été enregistré.',failed:'Nous n’avons pas pu confirmer l’enregistrement. Votre texte est conservé ici ; veuillez réessayer.',rate:'Veuillez patienter. Vous pouvez envoyer un commentaire par minute, au maximum 10 par jour.',signInAgain:'Veuillez vous reconnecter pour envoyer votre commentaire.',conflict:'Cet envoi n’a pas pu être confirmé. Veuillez actualiser la page avant de réessayer.'});
  Object.assign(words.en,{open:'Share your feedback',pageEyebrow:'Feedback',invitation:'Your ideas can make this a more useful place to learn about sustainable housing.'});
  Object.assign(words.fr,{open:'Donnez votre avis',pageEyebrow:'Vos commentaires',invitation:'Vos idées peuvent rendre ce site encore plus utile pour découvrir l’habitat durable.'});
  const signedIn=()=>window.EverDwellAuth?.isSignedIn()===true;
  const copy=()=>words[document.documentElement.lang.startsWith('fr')?'fr':'en'];
  function render(){
    const c=copy();
    document.querySelectorAll('[data-feedback-copy]').forEach(node=>node.textContent=c[node.dataset.feedbackCopy]);
    message.placeholder=c.placeholder;
    message.readOnly=!signedIn()||busy;
    category.disabled=busy;section.disabled=busy;
    const button=form.querySelector('button[type="submit"]');
    button.disabled=busy;button.querySelector('[data-feedback-copy="submit"]').textContent=busy?c.sending:c.submit;
    form.setAttribute('aria-busy',String(busy));
    document.getElementById('feedback-count').textContent=`${message.value.length.toLocaleString(document.documentElement.lang)} / ${(2000).toLocaleString(document.documentElement.lang)}`;
    status.hidden=!notice;status.textContent=c[notice]||'';status.dataset.kind=kind;
  }
  function requireLogin(event,target){
    if(signedIn())return false;
    event.preventDefault();
    window.EverDwellAuth?.open({context:'feedback',returnFocus:target});
    return true;
  }
  [message,category,section].forEach(field=>{
    // Prevent the native select menu, then open the dialog after the click completes.
    field.addEventListener('pointerdown',event=>{if(!signedIn())event.preventDefault();});
    field.addEventListener('click',event=>requireLogin(event,field));
    field.addEventListener('keydown',event=>{
      if(event.key==='Tab'||event.key==='Escape')return;
      if(field!==message||event.key.length===1||['Enter','ArrowDown','ArrowUp','Backspace','Delete'].includes(event.key))requireLogin(event,field);
    });
    field.addEventListener('beforeinput',event=>requireLogin(event,field));
    field.addEventListener('paste',event=>requireLogin(event,field));
  });
  message.addEventListener('input',()=>{notice='';message.removeAttribute('aria-invalid');render();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy)return;
    if(requireLogin(event,message))return;
    const length=[...message.value.trim()].length;
    notice=length<10?'tooShort':message.value.length>2000?'tooLong':'';
    message.setAttribute('aria-invalid',String(!!notice));
    if(notice){kind='error';render();message.focus();return;}
    const payload={category:category.value,section:section.value,message:message.value.trim(),locale:document.documentElement.lang.startsWith('fr')?'fr':'en'};
    const fingerprint=JSON.stringify(payload);
    if(!pending || pending.fingerprint!==fingerprint)pending={fingerprint,requestId:crypto.randomUUID()};
    const requestId=pending.requestId,currentRevision=revision;
    busy=true;notice='';render();
    try{
      const token=await window.EverDwellAuth.getAccessToken();
      if(!token)throw {uiKey:'signInAgain'};
      const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({...payload,requestId}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok)throw {uiKey:response.status===401?'signInAgain':response.status===429?'rate':response.status===409?'conflict':'failed'};
      if(result.ok!==true || result.receipt!==requestId)throw new Error('Unconfirmed receipt');
      if(currentRevision!==revision)return;
      form.reset();pending=null;notice='saved';kind='success';
    }catch(error){
      if(currentRevision!==revision)return;
      notice=error.uiKey||'failed';kind='error';
      if(notice==='signInAgain')window.EverDwellAuth.open({context:'feedback',returnFocus:message});
    }finally{busy=false;render();}
  });
  window.addEventListener('everdwell:auth-change',()=>{
    if(!signedIn()){
      revision++;pending=null;form.reset();notice='';message.removeAttribute('aria-invalid');
    }
    render();
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();
