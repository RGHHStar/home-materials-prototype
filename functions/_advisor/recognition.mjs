import catalog from './catalog.mjs';
import {SYSTEM_KEYWORDS} from './reference.mjs';

// Keep Chinese text; Latin accents and punctuation do not affect matching.
export const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g,' ').trim();
const aliases = {
  structural:['普通钢筋混凝土|钢筋混凝土','低碳混凝土','结构钢','再生钢|回收钢','普通木材','认证木材|fsc timber'],
  exterior:['砖|砖块','乙烯基外墙','木外墙','纤维水泥外墙','金属外墙','回收砖|再生砖'],
  insulation:['玻璃纤维|玻璃棉|fiberglass|glass wool','矿棉|岩棉|rock wool|stone wool','纤维素|纤维素保温','喷涂泡沫|spray polyurethane foam','eps|聚苯乙烯泡沫|膨胀聚苯乙烯','xps|挤塑聚苯乙烯'],
  roofing:['沥青瓦','金属屋顶','粘土瓦|混凝土瓦','石板屋顶','绿色屋顶|绿化屋顶'],
  windows:['单层窗|单层玻璃|single glazing|single pane','双层窗|双层玻璃|double glazing|double pane','三层窗|三层玻璃|triple glazing|triple pane'],
  flooring:['实木地板','工程木地板|复合木地板','竹地板|竹材','软木|软木地板','乙烯基地板|lvp','瓷砖|陶瓷砖|porcelain tile|ceramic tile'],
  paint:['油性漆','水性漆','低挥发漆|零挥发漆|低voc涂料|low voc paint|zero voc paint','矿物漆'],
  adhesives:['溶剂型胶','水性胶','低voc胶','pva|木工胶','聚氨酯胶','环氧胶'],
  sealants:['硅酮密封胶|硅胶','丙烯酸密封胶','聚氨酯密封胶','低voc密封胶'],
  waterproofing:['沥青防水','pvc防水膜','epdm|epdm防水膜','tpo|tpo防水膜','水泥基防水'],
  plumbing:['铜管','pex|pex管','pvc管|cpvc管|cpvc pipe|pvc pipe'],
  lighting:['白炽灯','卤素灯','节能灯|紧凑型荧光灯','普通led|普通led灯','高效led|高效led灯'],
  solar:['屋顶太阳能板|光伏板|solar panels','太阳能瓦','家用储能|家庭电池|home battery']
};
const categories = {
  structural:'结构|承重|框架',exterior:'外墙|外立面',insulation:'保温材料|隔热材料|保温棉',roofing:'屋顶|屋面',windows:'窗户|窗|门窗',flooring:'地板|地面材料',paint:'油漆|涂料',adhesives:'胶水|粘合剂',sealants:'密封胶|填缝',waterproofing:'防水材料|防水膜',plumbing:'水管|管道',lighting:'照明|灯泡',solar:'太阳能|光伏|储能'
};
const intents = {
  compare:'compare|comparison|comparer|comparaison|difference|differences|different|differ|versus|vs|区别|差异|不同|对比|比较|哪个好|哪种好',
  pros_cons:'pros and cons|advantages|disadvantages|avantages|inconvenients|优缺点|优势|缺点',
  recommend:'recommend|choose|suitable|recommendation|choisir|conseiller|推荐|适合|怎么选|选哪个',
  explain:'what is|what are|explain|tell me|expliquer|介绍|是什么|解释|讲讲',
  assessment:'assessment|my scores|my score|questionnaire|evaluation|mon bilan|my results|评估结果|问卷结果',
  design:'my design|my selections|current design|mes choix|ma conception|我的设计|我的选择'
};
const focuses = {
  environment:'environment|eco friendly|sustainable|ecologique|durable|环保|环境|可持续',
  thermal:'thermal|insulation|warm|heat|cold|thermique|chaleur|保温|隔热|冷|热',
  moisture:'moisture|damp|wet|humidity|humidite|humide|潮湿|防潮|受潮',
  health:'health|indoor air|voc|sante|air interieur|健康|室内空气|甲醛',
  fire:'fire|flammable|feu|incendie|防火|耐火|燃烧',
  acoustic:'sound|noise|acoustic|bruit|acoustique|隔音|噪音',
  durability:'durability|lifespan|last|longevity|duree|耐用|寿命',
  maintenance:'maintenance|maintain|cleaning|entretien|维护|清洁|保养',
  end_of_life:'recycle|recycling|reuse|recyclage|回收|再利用',
  installation:'installation|install|installer|安装|施工'
};
function occurrences(q, alias) {
  const key=normalize(alias), hits=[];
  if(!key) return hits;
  let start=q.indexOf(key);
  while(start!==-1) {
    const end=start+key.length;
    // Latin aliases need word boundaries; Chinese compounds need substring matching.
    if((!/^[a-z0-9]/.test(key)||!/[a-z0-9]/.test(q[start-1]||''))&&(!/[a-z0-9]$/.test(key)||!/[a-z0-9]/.test(q[end]||''))) hits.push({start,end});
    start=q.indexOf(key,start+1);
  }
  return hits;
}
const materialIndex=catalog.systems.flatMap(s=>s.items.map((item,i)=>({name:item.en,system:s.id,aliases:[item.en,...(/s$/i.test(item.en)?[]:[item.en+'s']),item.fr,...(aliases[s.id]?.[i]||'').split('|')]})));
const keys=(q,dict)=>Object.entries(dict).filter(([,value])=>value.split('|').some(a=>occurrences(q,a).length)).map(([key])=>key);
export function recognizeQuestion(question) {
  const q=normalize(question);
  const candidates=materialIndex.flatMap(m=>m.aliases.flatMap(alias=>occurrences(q,alias).map(hit=>({...hit,name:m.name,system:m.system}))));
  // Longest phrase wins: reclaimed brick must not also become ordinary brick.
  candidates.sort((a,b)=>(b.end-b.start)-(a.end-a.start)||a.start-b.start);
  const spans=[];
  for(const hit of candidates) if(!spans.some(s=>hit.start<s.end&&hit.end>s.start)) spans.push(hit);
  spans.sort((a,b)=>a.start-b.start);
  const materials=[...new Set(spans.map(s=>s.name))];
  const systems=[...new Set([...spans.map(s=>s.system),...Object.entries(categories).filter(([id,value])=>[...(SYSTEM_KEYWORDS[id]||[]),...value.split('|')].some(a=>occurrences(q,a).length)).map(([id])=>id)])];
  const detectedIntents=keys(q,intents);
  const intent=materials.length>=2?'compare':detectedIntents[0]||'explain';
  const focus=keys(q,focuses);
  // Stable lookup key for the forthcoming authored answer library; input order stays above.
  const answerKey=JSON.stringify({subjects:[...(materials.length?materials:systems)].sort(),intent,focus:[...focus].sort()});
  return {materials,systems,intent,focus,answerKey,needsMaterialChoice:intent==='compare'&&materials.length<2};
}
