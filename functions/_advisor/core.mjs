// JavaScript port of the teacher-provided ai_agent.py, for Cloudflare Pages.
import catalog from './catalog.mjs';
import {normalize, recognizeQuestion} from './recognition.mjs';
export {normalize, recognizeQuestion} from './recognition.mjs';
import {ASSESSMENT_TIPS, SYSTEM_INSTRUCTIONS, STOPWORDS} from './reference.mjs';

const stopwords = new Set(STOPWORDS);
const words = value => new Set(normalize(value).split(' ').filter(w=>w.length>2&&!stopwords.has(w)));
export const entries = catalog.systems.flatMap(system=>system.items.map(item=>({
  kind:'plan', system_id:system.id, system_en:system.en, system_fr:system.fr,
  name_en:item.en, name_fr:item.fr, description_en:item.descriptionEn, description_fr:item.descriptionFr,
  price_en:item.priceEn, price_fr:item.priceFr, score:item.score,
  environment:item.environment, health:item.health, efficiency:item.efficiency, durability:item.durability
}))).concat(catalog.insulation.map(item=>({
  kind:'reference',system_id:'insulation',system_en:'Insulation',system_fr:'Isolation',
  name_en:item.en.name,name_fr:item.fr.name,description_en:item.en.summary,description_fr:item.fr.summary,
  price_en:item.en.cost,price_fr:item.fr.cost,score:null,environment:item.scores.environment,
  health:item.scores.health,efficiency:item.scores.thermal,durability:item.scores.durability,
  aliases:item.aliases,safety_en:item.en.safety,safety_fr:item.fr.safety
})));
const text = (value, length) => typeof value === 'string' ? value.slice(0,length) : '';
export function sanitizeContext(value) {
  const raw=value && typeof value==='object' && !Array.isArray(value)?value:{};
  const selections=[];
  for (const selected of (Array.isArray(raw.selections)?raw.selections:[]).slice(0,15)) {
    // Derive names and scores from our catalogue, never from browser-supplied claims.
    const entry=entries.find(e=>e.kind==='plan'&&e.system_id===selected?.system_id&&normalize(e.name_en)===normalize(selected?.material));
    if(entry&&!selections.some(s=>s.system_id===entry.system_id)) selections.push({system_id:entry.system_id,system:entry.system_en,material:entry.name_en,score:entry.score});
  }
  const assessment={};
  for (const key of Object.keys(ASSESSMENT_TIPS)) {
    const score=raw.assessment?.[key];
    if(Number.isInteger(score)&&score>=0&&score<=100) assessment[key]=score;
  }
  return {language:raw.language==='fr'?'fr':'en',route:text(raw.route,60),planSystem:catalog.systems.some(s=>s.id===raw.planSystem)?raw.planSystem:'',assessmentCount:Number.isInteger(raw.assessmentCount)?Math.max(0,Math.min(40,raw.assessmentCount)):0,assessment,selections};
}
export function inferSystem(question) {
  return recognizeQuestion(question).systems[0]||null;
}
function findMentions(question) {
  return recognizeQuestion(question).materials.map(name=>entries.find(e=>e.kind==='plan'&&e.name_en===name));
}
export function selectReferences(question,context={},limit=8) {
  const terms=words(question),system=inferSystem(question),mentioned=new Set(findMentions(question).map(e=>normalize(e.name_en)));
  const selected=new Set((context.selections||[]).map(s=>normalize(s.material)));
  const overlap=value=>[...words(value)].filter(w=>terms.has(w)).length;
  const score=e=>overlap(e.name_en+' '+e.name_fr)*7+overlap(e.system_en+' '+e.system_fr)*3+overlap(e.description_en+' '+e.description_fr)*.5+(mentioned.has(normalize(e.name_en))?16:0)+(e.system_id===system?9:0)+(selected.has(normalize(e.name_en))?8:0)+(e.score??50)/1000-(e.kind==='reference'?2.5:0);
  return [...entries].sort((a,b)=>score(b)-score(a)).slice(0,limit);
}
function details(e,lang) {
  return `**${e['name_'+lang]}** — ${e['description_'+lang]}`;
}
export function referenceAnswer(question, rawContext={}) {
  const ctx=sanitizeContext(rawContext),fr=ctx.language==='fr',lang=ctx.language,q=normalize(question);
  if(['asbestos','amiante','lead paint','plomb','black mold','moisissure','mould','mold','wet insulation'].some(k=>q.includes(k))) return fr
    ?'**Précaution :** ne percez pas, ne poncez pas et ne retirez pas vous-même un matériau qui pourrait contenir de l’amiante ou du plomb. Pour l’humidité ou les moisissures, demandez l’avis d’un professionnel qualifié. Une description ne permet pas de confirmer la présence d’un matériau dangereux.\n\nJe peux comparer des matériaux de remplacement à partir du catalogue EverDwell.'
    :'**Safety first:** Do not drill, sand, cut, or remove suspected asbestos-containing or lead-painted materials yourself. For dampness or mould, ask a qualified professional for a safe inspection. A description alone cannot confirm hazardous materials.\n\nI can compare replacement materials using the EverDwell catalogue.';
  if(['assessment','my scores','my score','questionnaire','evaluation','evalue','mon bilan','my results'].some(k=>q.includes(k))) {
    const scores=Object.entries(ctx.assessment).sort((a,b)=>b[1]-a[1]).slice(0,3);
    if(scores.length) return (fr?'Priorités suggérées selon vos réponses (un score d’impact plus élevé mérite davantage d’attention) :':'Suggested priorities based on your assessment answers (higher impact scores deserve more attention):')+'\n'+scores.map(([key,score])=>`- **${score}/100** — ${ASSESSMENT_TIPS[key][fr?1:0]}`).join('\n')+'\n\n'+(fr?'Ce questionnaire ne remplace pas un audit énergétique ou une inspection.':'These questionnaire scores are not a professional energy audit or inspection.');
    return fr?'Complétez d’abord quelques questions dans « Évaluation du logement », puis demandez-moi d’expliquer vos résultats.':'Answer questions in Home assessment first, then ask me to explain your results.';
  }
  if(['my design','my home','my selections','current design','selected','ma conception','mes choix','ma maison'].some(k=>q.includes(k))) {
    if(!ctx.selections.length) return fr?'Sélectionnez des matériaux dans « Construire une maison », puis demandez-moi comment améliorer votre conception.':'Choose materials in Build a home, then ask me how to improve your design.';
    const suggestions=[];
    for(const s of ctx.selections) {
      const current=entries.find(e=>e.kind==='plan'&&e.system_id===s.system_id&&e.name_en===s.material);
      const best=entries.filter(e=>e.kind==='plan'&&e.system_id===s.system_id).sort((a,b)=>b.score-a.score)[0];
      if(best.score>current.score+6) suggestions.push(fr?`- ${current.system_fr} : étudiez **${best.name_fr}** (${best.score}/100) au lieu de **${current.name_fr}** (${current.score}/100).`:`- ${current.system_en}: consider **${best.name_en}** (${best.score}/100) instead of **${current.name_en}** (${current.score}/100).`);
    }
    return (fr?'D’après vos choix actuels dans l’outil de conception :':'Based on your current selections in the home builder:')+'\n'+(suggestions.slice(0,4).join('\n')||(fr?'Vos choix ont déjà de bonnes notes dans le catalogue.':'Your selected options already score well within the catalogue.'))+'\n\n'+(fr?'Scores comparatifs du prototype, pas une étude technique. Vérifiez le climat, la compatibilité et les devis.':'These are prototype comparison scores, not engineering recommendations. Verify climate, compatibility and contractor quotes.');
  }
  const recognized=recognizeQuestion(question), mentions=findMentions(question);
  const comparison=recognized.intent==='compare';
  const system=recognized.systems[0];
  if(comparison&&mentions.length===1) return (fr?'Quel autre matériau souhaitez-vous comparer avec ':'Which other material would you like to compare with ')+mentions[0]['name_'+lang]+'?';
  if(comparison&&!mentions.length&&recognized.systems.length>1) return fr?'Nommez deux ou trois matériaux à comparer dans ces catégories.':'Please name two or three materials to compare from those categories.';
  if(mentions.length>3) return fr?'Choisissez jusqu’à trois matériaux pour cette comparaison.':'Please choose up to three materials for this comparison.';
  let choices=mentions.slice(0,comparison?3:2);
  let heading=fr?'Voici les informations du catalogue EverDwell :':'Here is what the EverDwell catalogue says:';
  if(comparison&&choices.length>=2) heading=fr?'Comparaison des options du catalogue EverDwell :':'Comparison using the EverDwell reference catalogue:';
  if(!choices.length&&system){choices=entries.filter(e=>e.kind==='plan'&&e.system_id===system);heading=fr?'Options de cette catégorie dans le catalogue EverDwell :':'Options in this EverDwell catalogue category:';}
  if(choices.length) return heading+'\n\n'+choices.map(e=>details(e,lang)).join('\n\n');
  return fr?'Je peux comparer les matériaux d’isolation, fenêtres, toitures, planchers, peintures et autres options du catalogue EverDwell. Essayez « Comparer la cellulose et la laine minérale ».\n\nVous utilisez le guide du catalogue, sans IA conversationnelle. Posez une question complète en nommant les matériaux.':'I can compare insulation, windows, roofing, flooring, paints and other EverDwell catalogue options. Try “Compare cellulose and mineral wool”.\n\nThis is catalogue guidance, not live conversational AI. Ask a complete question naming the materials.';
}
export async function generateAnswer(question,history,context,{apiKey='',model='gpt-4.1-mini',fetcher=fetch}={}) {
  const ctx=sanitizeContext(context);
  if(!apiKey) return {answer:referenceAnswer(question,ctx),mode:'guide',aiAvailable:false};
  const safeHistory=(Array.isArray(history)?history:[]).slice(-10).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,2400)}));
  const prompt=JSON.stringify({question,recognized:recognizeQuestion(question),language:ctx.language,pageContext:ctx,references:selectReferences(question,ctx)});
  try {
    const response=await fetcher('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,instructions:SYSTEM_INSTRUCTIONS+`\nAnswer in ${ctx.language==='fr'?'French':'English'}.`,input:[...safeHistory,{role:'user',content:prompt}],max_output_tokens:800,store:false}),signal:AbortSignal.timeout(22000)});
    if(!response.ok) throw new Error('provider_unavailable');
    const result=await response.json();
    const answer=(result.output||[]).filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n').trim();
    if(!answer) throw new Error('empty_answer');
    return {answer,mode:'ai',aiAvailable:true};
  } catch {
    return fallbackAnswer(question,ctx);
  }
}
export function fallbackAnswer(question,context) {
  const fr=context.language==='fr';
  return {answer:(fr?'L’IA en ligne est momentanément indisponible. Voici le guide du catalogue :\n\n':'Live AI is temporarily unavailable. Here is catalogue guidance:\n\n')+referenceAnswer(question,context),mode:'fallback',aiAvailable:true};
}
