/* EverDwell advisor UI adapted from the teacher-provided Streamlit version.
   Requests stay on the website origin; API credentials are server-only. */
(function () {
  "use strict";
  const launcher = document.getElementById("ed-agent-launcher");
  const panel = document.getElementById("ed-agent-panel");
  const transcript = document.getElementById("ed-agent-transcript");
  const form = document.getElementById("ed-agent-form");
  const input = document.getElementById("ed-agent-input");
  const send = document.getElementById("ed-agent-send");
  const close = document.getElementById("ed-agent-close");
  const clear = document.getElementById("ed-agent-clear");
  const status = document.getElementById("ed-agent-status-text");
  const note = document.getElementById("ed-agent-note");
  if (!launcher || !panel || !transcript || !form || !input) return;

  const translations = {
    en: {
      launcher:"Ask EverDwell",title:"EverDwell Advisor",connected:"Cloudflare AI response",ready:"AI ready · catalogue fallback",guide:"Catalogue guidance mode",loading:"Connecting…",
      greeting:"Your home, better informed.",intro:"Compare building materials, explore greener options and get advice based on your current home design.",
      suggestions:["Compare cellulose and mineral wool", "Low-VOC paint options", "Best sustainable roofing", "Improve my current design"],
      placeholder:"Ask about your home or materials…",thinking:"Reviewing your question…",offline:"The advisor could not connect. Your question is still in the input; please try again.",you:"You",guideHint:"Catalogue guidance, not live AI. Questions and selected materials are processed by this site; chat is kept only in this tab. Reference scores and prices need professional verification.",limit:"This conversation has reached 30 questions. Clear it to start again.",
      hint:"AI mode: Cloudflare processes your question, short chat history, selected materials and assessment summary. This site does not save chat. Do not include personal details. Verify professional advice.",reset:"Clear conversation",dismiss:"Close AI advisor",send:"Send question",hello:"Hi! Ask me anything about sustainable-home materials.",
    },
    fr: {
      launcher:"Demander à EverDwell",title:"Conseiller EverDwell",connected:"Réponse de Cloudflare AI",ready:"IA prête · catalogue en secours",guide:"Guide du catalogue",loading:"Connexion…",
      greeting:"Mieux connaître votre maison.",intro:"Comparez les matériaux, explorez des options écologiques et obtenez des conseils adaptés à votre projet.",
      suggestions:["Comparer la cellulose et la laine minérale", "Peintures à faible COV", "Une toiture plus durable", "Améliorer ma conception actuelle"],
      placeholder:"Question sur la maison ou les matériaux…",thinking:"J'examine votre question…",offline:"Le conseiller ne peut pas se connecter. Votre question reste dans le champ ; réessayez.",you:"Vous",guideHint:"Guide du catalogue, sans IA en ligne. Ce site traite vos questions et choix de matériaux ; la conversation reste dans cet onglet. Vérifiez les scores et prix auprès de professionnels.",limit:"Cette conversation a atteint 30 questions. Effacez-la pour recommencer.",
      hint:"Mode IA : Cloudflare traite la question, un court historique, les matériaux choisis et le bilan. Ce site ne conserve pas la conversation. Évitez les données personnelles. Consultez des professionnels.",reset:"Effacer la conversation",dismiss:"Fermer le conseiller",send:"Envoyer",hello:"Bonjour ! Posez vos questions sur les matériaux pour une maison durable.",
    }
  };
  let connected = true;
  let powered = false;
  let serverMode = "guide";
  let conversation = [];
  let pending = null;
  let retryRequest = null;
  let generation = 0;
  let suggestionsAlreadyBound = false;
  let lastError = "";
  const localFile = location.protocol === 'file:';
  translations.en.localOnly = 'This file was opened directly. Use https://home-materials-prototype.pages.dev/ or the running local preview to ask questions.';
  translations.fr.localOnly = 'Ce fichier a été ouvert directement. Utilisez https://home-materials-prototype.pages.dev/ ou l’aperçu local actif pour poser vos questions.';

  function language() {
    try {return (typeof state !== "undefined" && state.lang === "fr") ? "fr" : "en";}
    catch (_) {return "en";}
  }
  function copy() { return translations[language()]; }
  function collectContext() {
    const result = {language:language(),route:"home",planSystem:"",assessmentCount:0,assessment:{},selections:[]};
    try {
      if (typeof state === "undefined") return result;
      result.route = String(state.route || "home").slice(0,50);
      result.planSystem = String(state.planSystem || "").slice(0,50);
      result.assessmentCount = Object.keys(state.assessmentAnswers || {}).length;
      // Share high-level impact categories, not personal answers to 40 questions.
      if (typeof assessmentQuestions !== "undefined") {
        const categorySums={};
        for (const q of assessmentQuestions) {
          const idx=state.assessmentAnswers && state.assessmentAnswers[q.id];
          const score=Number.isInteger(idx) && q.options && q.options[idx] ? q.options[idx][2] : null;
          if (typeof score === "number" && Number.isFinite(score)) {
            if (!categorySums[q.category])categorySums[q.category]={sum:0,count:0};
            categorySums[q.category].sum+=score;categorySums[q.category].count++;
          }
        }
        for (const [category,values] of Object.entries(categorySums)) {
          result.assessment[category]=Math.round(100*values.sum/(2*values.count));
        }
      }
      if (typeof planSystems !== "undefined") {
        Object.entries(state.builderSelections || {}).forEach(([id,idx]) => {
          if (!Number.isInteger(idx)) return;
          const sys = planSystems.find(s => s.id === id);
          const mat = sys && sys.items[idx];
          if (mat) result.selections.push({system_id:id,system:sys.en,material:mat.en,score:mat.score});
        });
      }
    } catch (_) {} // The main website must remain usable if the advisor is not.
    return result;
  }
  function populateCopy() {
    const c = copy();
    document.getElementById("ed-agent-launch-label").textContent = c.launcher;
    document.getElementById("ed-agent-title").textContent = c.title;
    const greetingEl=document.getElementById("ed-agent-greeting");if(greetingEl)greetingEl.textContent=c.greeting;
    const introEl=document.getElementById("ed-agent-intro");if(introEl)introEl.textContent=c.intro;
    input.placeholder = c.placeholder;
    close.setAttribute("aria-label",c.dismiss);
    clear.setAttribute("aria-label",c.reset);
    send.setAttribute("aria-label",c.send);
    status.textContent = connected ? (powered && serverMode === "ai" ? c.connected : powered && serverMode === "ready" ? c.ready : c.guide) : c.loading;
    note.textContent = localFile ? c.localOnly : powered ? c.hint : c.guideHint;
    input.setAttribute("aria-label", c.placeholder);
    const suggestions = document.getElementById("ed-agent-suggestions");
    if (suggestions && !suggestionsAlreadyBound) {
      // Placeholder buttons are replaced on language changes below.
      suggestionsAlreadyBound = true;
    }
    if (suggestions) {
      suggestions.replaceChildren();
      c.suggestions.forEach(prompt => {
        const button = document.createElement("button");
        button.className = "ed-agent-prompt";button.type="button";button.textContent=prompt;
        button.addEventListener("click",()=>{input.value=prompt;submitQuestion();});
        suggestions.append(button);
      });
    }
  }
  function boldText(element, line) {
    // Tiny, safe Markdown subset: **bold** and `code`. Nothing is innerHTML'd.
    const tokens = String(line).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    tokens.forEach(token => {
      if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
        const strong = document.createElement("strong");strong.textContent=token.slice(2,-2);element.appendChild(strong);
      } else if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
        const code = document.createElement("code");code.textContent=token.slice(1,-1);element.appendChild(code);
      } else element.appendChild(document.createTextNode(token));
    });
  }
  function messageBubble(role, content, isPending, mode) {
    const row = document.createElement("div");row.className="ed-agent-entry "+(role === "user" ? "user" : "assistant")+(isPending?" pending":"");
    const avatar=document.createElement("div");avatar.className="ed-agent-avatar";avatar.textContent=role === "user" ? copy().you : "✦";
    const bubble=document.createElement("div");bubble.className="ed-agent-bubble";
    if(role==='assistant'&&!isPending){const label=document.createElement('strong');label.textContent=(mode==='ai'?copy().connected:copy().guide)+'\n';bubble.append(label);}
    boldText(bubble, String(content||""));
    row.append(avatar,bubble);return row;
  }
  function updateView() {
    populateCopy();
    transcript.replaceChildren();
    const welcome = document.createElement("section");
    welcome.className="ed-agent-welcome";
    const eyebrow=document.createElement("span");eyebrow.className="ed-agent-eyebrow";eyebrow.textContent="EVERDWELL · HOME GUIDANCE";
    const greeting=document.createElement("h3");greeting.id="ed-agent-greeting";greeting.textContent=copy().greeting;
    const intro=document.createElement("p");intro.id="ed-agent-intro";intro.textContent=copy().intro;
    welcome.append(eyebrow,greeting,intro);transcript.append(welcome);
    if (!conversation.length && !pending) {
      const suggestions=document.createElement("div");suggestions.id="ed-agent-suggestions";suggestions.className="ed-agent-suggestions";
      transcript.append(suggestions);suggestionsAlreadyBound=false;populateCopy();
    }
    conversation.forEach(msg=>{
      if (msg && (msg.role === "assistant" || msg.role === "user") && typeof msg.content === "string") {
        transcript.append(messageBubble(msg.role,msg.content,false,msg.mode));
      }
    });
    if (pending && pending.type === "ask") {
      transcript.append(messageBubble("user",pending.question,false));
      transcript.append(messageBubble("assistant",copy().thinking,true));
    }
    if (lastError) {
      const error=document.createElement("p"); error.className="ed-agent-error";
      error.setAttribute("role","alert"); error.textContent=lastError; transcript.append(error);
    }
    transcript.setAttribute("aria-busy", String(!!pending));
    send.disabled=!!pending || !input.value.trim();
    transcript.scrollTop=transcript.scrollHeight;
  }
  function openPanel(open) {
    panel.hidden=!open;launcher.hidden=open;launcher.setAttribute("aria-expanded",String(open));
    if (open) {updateView();input.focus();}
    else launcher.focus();
  }
  async function submitQuestion() {
    const question=input.value.trim().slice(0,1500);
    if (!question || pending) return;
    if (localFile) {lastError=copy().localOnly;updateView();return;}
    if (conversation.length >= 60) { lastError=copy().limit; updateView(); return; }
    const requestGeneration=generation;
    const payload={question,context:collectContext(),history:conversation.slice(-10)};
    const fingerprint=JSON.stringify(payload);
    if(!retryRequest||retryRequest.fingerprint!==fingerprint)retryRequest={fingerprint,id:crypto.randomUUID()};
    const requestId=retryRequest.id;
    const controller=new AbortController();
    pending={type:"ask",question,controller}; lastError=""; input.value=""; updateView();
    const timer=setTimeout(()=>controller.abort(),30000);
    try {
      const response=await fetch('/api/advisor', {
        method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({...payload,requestId})
      });
      if (!response.ok) throw new Error('unavailable');
      const data=await response.json();
      if (typeof data.answer !== 'string' || !['ai','guide','fallback'].includes(data.mode)) throw new Error('invalid');
      if (requestGeneration !== generation) return;
      retryRequest=null;
      conversation.push({role:'user',content:question},{role:'assistant',content:data.answer,mode:data.mode});
      serverMode=data.mode; powered=!!data.aiAvailable;
    } catch (_) {
      if (requestGeneration !== generation) return;
      lastError=copy().offline;
      if (!input.value.trim()) input.value=question;
    } finally {
      clearTimeout(timer);
      if (requestGeneration === generation) {pending=null; updateView();}
    }
  }
  launcher.addEventListener("click",()=>openPanel(true));
  close.addEventListener("click",()=>openPanel(false));
  clear.addEventListener("click",()=>{
    generation++; pending?.controller.abort(); pending=null; retryRequest=null; conversation=[];lastError="";
    input.value="";serverMode=powered?"ready":"guide";updateView();input.focus();
  });
  form.addEventListener("submit",event=>{event.preventDefault();submitQuestion();});
  input.addEventListener("input",()=>{send.disabled=!!pending || !input.value.trim();});
  input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.isComposing){event.preventDefault();submitQuestion();}});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!panel.hidden)openPanel(false);});
  document.addEventListener("click",event=>{
    if (event.target.closest("[data-lang]")) setTimeout(()=>{if(!panel.hidden)updateView();},50);
  },true);
  // Fetch only mode metadata until a visitor explicitly asks a question.
  if (!localFile) fetch('/api/advisor',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
    if (data && typeof data.aiAvailable === 'boolean' && !conversation.length && !pending) {powered=data.aiAvailable;serverMode=powered?'ready':'guide';populateCopy();}
  }).catch(()=>{});
  updateView();
})();
