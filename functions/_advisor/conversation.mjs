import {recognizeQuestion,normalize} from './recognition.mjs';

// Carry canonical subjects, never old questions or assistant claims, into a follow-up.
const followup = /\b(it|its|they|them|their|these|those|which|the former|the latter|what about|how about|and what|and how|compared to|compare that|cela|ca|celui|celle|ceux|celles|lequel|laquelle|lesquels|lesquelles|leur|leurs|et pour|et concernant)\b|它|它们|他们|这些|那种|哪种|哪个|其中|前者|后者|那.*呢|呢$/;
const continuation = /^(and|also|et|那|还有)\b|^(那|还有)/;
const hasSubject = r => r.materials.length>0||r.systems.length>0;
function advance(question,previous) {
  const recognized=recognizeQuestion(question),q=normalize(question);
  const refersBack=followup.test(q)||continuation.test(q);
  // Property keywords alone ('humidity', 'VOC') are not a new material category.
  if(previous&&refersBack&&!recognized.materials.length)recognized.systems=
    recognizeQuestion(q.replace(/\b(humidite|voc|cov)\b/g,'')).systems;
  const sameSystem=recognized.systems.every(s=>previous?.systems.includes(s));
  // An explicit new subject replaces history, except a comparison with 'it/that'.
  const comparisonBack=recognized.materials.length===1&&/\b(it|that|the former|the latter|celui|celle)\b|它|前者|后者/.test(q)&&/\b(compare|versus|vs|comparer)\b|比较|对比/.test(q);
  const inherit=!!previous&&refersBack&&(!hasSubject(recognized)||(!recognized.materials.length&&sameSystem)||comparisonBack);
  const materials=inherit?[...new Set([...previous.materials,...recognized.materials])]:recognized.materials;
  const systems=inherit?[...new Set([...previous.systems,...recognized.systems])]:recognized.systems;
  return {materials,systems,followUp:inherit,recognized};
}
export function resolveQuestion(question,history=[]) {
  let previous;
  for(const message of (Array.isArray(history)?history:[]).filter(m=>m?.role==='user'&&typeof m.content==='string').slice(-5)) {
    const next=advance(message.content.slice(0,1500),previous);
    previous=hasSubject(next)?next:undefined;
  }
  const resolved=advance(question,previous);
  return {...resolved,retrievalQuestion:question+(resolved.followUp?'\nSubjects: '+(resolved.materials.length?resolved.materials:resolved.systems).join(', '):'')};
}
