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
  let notice='',kind='info';
  Object.assign(words.en,{open:'Share your feedback',pageEyebrow:'Feedback',invitation:'Your ideas can make this a more useful place to learn about sustainable housing.'});
  Object.assign(words.fr,{open:'Donnez votre avis',pageEyebrow:'Vos commentaires',invitation:'Vos idées peuvent rendre ce site encore plus utile pour découvrir l’habitat durable.'});
  const signedIn=()=>window.EverDwellAuth?.isSignedIn()===true;
  const copy=()=>words[document.documentElement.lang.startsWith('fr')?'fr':'en'];
  function render(){
    const c=copy();
    document.querySelectorAll('[data-feedback-copy]').forEach(node=>node.textContent=c[node.dataset.feedbackCopy]);
    message.placeholder=c.placeholder;
    message.readOnly=!signedIn();
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
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(requireLogin(event,message))return;
    const length=message.value.trim().length;
    notice=length<10?'tooShort':message.value.length>2000?'tooLong':'notConnected';
    kind=notice==='notConnected'?'info':'error';
    message.setAttribute('aria-invalid',String(kind==='error'));
    render();
    if(kind==='error')message.focus();
    // Frontend-only preview: no request, local storage, or simulated success.
    // Future API: send category, section, message, locale and an idempotency key.
    // The server must verify the session, enforce limits, and derive the user ID.
  });
  window.addEventListener('everdwell:auth-change',()=>{
    if(!signedIn()){
      form.reset();notice='';message.removeAttribute('aria-invalid');
    }
    render();
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();
