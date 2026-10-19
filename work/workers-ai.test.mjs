import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {answerWithWorkersAI,buildMessages,configured,cooldownSeconds,MODEL,MAX_OUTPUT_TOKENS,reserveUsage,validateGroundedAnswer} from '../functions/_advisor/workers-ai.mjs';
import {onRequest} from '../functions/api/advisor.js';

function setup(t,run=async()=>({response:'Cellulose and mineral wool have different moisture and installation requirements. [1]'})){
  const sqlite=new DatabaseSync(':memory:');t.after(()=>sqlite.close());
  sqlite.exec('CREATE TABLE feedback(id INTEGER PRIMARY KEY,message TEXT); INSERT INTO feedback VALUES(1,\'unchanged\')');
  const env={AI:{run},AI_FREE_TIER_CONFIRMED:'true',ADVISOR_RATE_SALT:'only-a-test-salt-'.repeat(3),FEEDBACK_DB:{withSession(){return {prepare(sql){let args=[];return {
    bind(...values){args=values;return this},async run(){return {meta:{changes:sqlite.prepare(sql).run(...args).changes}}},async first(){return sqlite.prepare(sql).get(...args)}
  }}}}}};
  return {env,sqlite};
}
const request=(ip='192.0.2.1')=>new Request('https://example.test/api/advisor',{headers:{'CF-Connecting-IP':ip}});
const body=(extra={})=>({question:'Compare cellulose and mineral wool',requestId:crypto.randomUUID(),context:{},...extra});

test('missing binding, free-plan confirmation, salt or database cannot invoke AI',async t=>{
  let calls=0;const {env}=setup(t,async()=>{calls++;return {response:'unexpected'}});
  for(const key of ['AI','AI_FREE_TIER_CONFIRMED','ADVISOR_RATE_SALT','FEEDBACK_DB']){
    const incomplete={...env};delete incomplete[key];assert.equal(configured(incomplete),false);
    assert.equal((await answerWithWorkersAI(request(),incomplete,body())).mode,'guide');
  }
  assert.equal(calls,0);
});
test('bounded multilingual prompts carry relevant evidence and follow-up history without private context or prices',()=>{
  const messages=buildMessages('Which handles dampness better? contact me at person@example.test',[
    {role:'system',content:'PRIVATE_INJECTION'}, {role:'user',content:'Compare cellulose and mineral wool'},
    {role:'assistant',content:'Compare installation requirements.'}
  ],{language:'fr',email:'hidden@example.test',token:'PRIVATE_TOKEN',answers:{private:'PRIVATE_ANSWER'},selections:[{system_id:'structural',material:'Conventional Reinforced Concrete',score:99}],assessment:{energy:80}});
  assert.match(messages[0].content,/French/);const sent=JSON.stringify(messages);
  assert.match(sent,/Cellulose|cellulose/);assert.match(sent,/Laine minérale/);
  assert.doesNotMatch(sent,/person@example|hidden@example|PRIVATE_|price_en|price_fr|"score"/);
  assert.ok(new TextEncoder().encode(sent).length<=12000);
  const huge=buildMessages('cellulose',Array.from({length:20},()=>({role:'user',content:'é'.repeat(4000)})),{});
  assert.ok(new TextEncoder().encode(JSON.stringify(huge)).length<=12000);
});
test('successful binding response uses the fixed model and never touches feedback data',async t=>{
  let calls=0;const {env,sqlite}=setup(t,async(model,input)=>{
    calls++;assert.equal(model,MODEL);assert.equal(input.max_tokens,MAX_OUTPUT_TOKENS);assert.equal(input.stream,false);
    assert.match(input.messages[0].content,/French/);return {response:'La cellulose et la laine minérale demandent une installation adaptée. [1]'};
  });
  const answer=await answerWithWorkersAI(request(),env,body({context:{language:'fr'}}));
  assert.equal(answer.mode,'ai');assert.match(answer.answer,/cellulose/);assert.equal(calls,1);
  assert.equal(sqlite.prepare('SELECT message FROM feedback').get().message,'unchanged');
  const rows=sqlite.prepare('SELECT * FROM advisor_cf_usage').all();assert.equal(rows.length,1);
  assert.doesNotMatch(JSON.stringify(rows),/192\.0\.2\.1|cellulose|question|response/);
});
test('replayed request IDs do not invoke AI twice',async t=>{
  let calls=0;const {env}=setup(t,async()=>{calls++;return {response:'A comparison. [1]'}}),input=body();
  assert.equal((await answerWithWorkersAI(request(),env,input)).mode,'ai');
  assert.equal((await answerWithWorkersAI(request(),env,input)).mode,'fallback');assert.equal(calls,1);
});
test('daily free quota failure cools until UTC midnight and then recovers',async t=>{
  let calls=0;const {env,sqlite}=setup(t,async()=>{if(++calls===1)throw new Error('3036: daily free allocation exhausted');return {response:'Recovered. [1]'}});
  const now=20000*86400+86380;
  assert.equal((await answerWithWorkersAI(request(),env,body(),{now})).mode,'fallback');
  assert.equal(sqlite.prepare('SELECT until_at FROM advisor_cf_state').get().until_at,now+20);
  assert.equal((await answerWithWorkersAI(request(),env,body(),{now:now+10})).mode,'fallback');assert.equal(calls,1);
  assert.equal((await answerWithWorkersAI(request(),env,body(),{now:now+21})).mode,'ai');assert.equal(calls,2);
});
test('temporary capacity failures cool briefly, not for the rest of the day',async t=>{
  let calls=0;const {env}=setup(t,async()=>{if(++calls===1)throw new Error('3040: Capacity temporarily exceeded');return {response:'Recovered. [1]'}}),now=20000*86400+100;
  assert.equal((await answerWithWorkersAI(request(),env,body(),{now})).mode,'fallback');
  assert.equal((await answerWithWorkersAI(request(),env,body(),{now:now+29})).mode,'fallback');assert.equal(calls,1);
  assert.equal((await answerWithWorkersAI(request(),env,body(),{now:now+31})).mode,'ai');
  assert.equal(cooldownSeconds({status:429},now),30);
});
test('empty answers, provider errors, prohibited ratings and timeouts fall back without retry or leaks',async t=>{
  for(const run of [async()=>({response:''}),async()=>{throw Error('secret-provider-details')},async()=>({response:'Costs CAD $100 with a 95/100 score.'}),async()=>({response:'Cellulose is cost-effective.'}),async()=>({response:'Un prix abordable.'}),()=>new Promise(()=>{})]){
    let calls=0;const {env}=setup(t,(...args)=>{calls++;return run(...args)});
    const answer=await answerWithWorkersAI(request(),env,body(),{timeoutMs:5});
    assert.equal(answer.mode,'fallback');assert.equal(calls,1);assert.doesNotMatch(answer.answer,/secret-provider|95\/100|\$100/);
  }
});
test('database failure and missing trusted IP fail closed without inference',async t=>{
  let calls=0;const {env}=setup(t,async()=>{calls++;return {response:'unexpected'}});
  assert.equal((await answerWithWorkersAI(new Request('https://example.test/api/advisor'),env,body())).mode,'fallback');
  env.FEEDBACK_DB={withSession(){throw Error('database secret')}};
  assert.equal((await answerWithWorkersAI(request(),env,body())).mode,'fallback');assert.equal(calls,0);
});
test('UTC global cap resets while a visitor rolling cap stays in effect',async t=>{
  const {env,sqlite}=setup(t),now=20000*86400+86390;
  assert.equal(await reserveUsage(request(),env,crypto.randomUUID(),now),true);
  const visitor=sqlite.prepare('SELECT visitor FROM advisor_cf_usage').get().visitor;
  const insert=sqlite.prepare('INSERT INTO advisor_cf_usage VALUES(?,?,?)');
  for(let i=0;i<29;i++)insert.run('visitor-'+i,visitor,now-120);
  assert.equal(await reserveUsage(request(),env,crypto.randomUUID(),now+11),false);
  for(let i=0;i<70;i++)insert.run('global-'+i,'other-'+i,now-120);
  assert.equal(await reserveUsage(request('192.0.2.2'),env,crypto.randomUUID(),now),false);
  assert.equal(await reserveUsage(request('192.0.2.2'),env,crypto.randomUUID(),now+11),true);
});
test('API mode metadata is readiness, and POST reports actual inference result',async t=>{
  const {env}=setup(t);
  assert.deepEqual(await (await onRequest({request:request(),env})).json(),{aiAvailable:true});
  const input=body();const req=new Request('https://example.test/api/advisor',{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify(input)});
  assert.equal((await (await onRequest({request:req,env})).json()).mode,'ai');
});


test('short answers cite only supplied website entries; unsupported answers admit missing evidence',()=>{
  const messages=buildMessages('Which glass should I use?',[],{});
  const refs=JSON.parse(messages.at(-1).content).references;
  assert.ok(refs.slice(0,3).every(r=>r.category==='Windows'));
  assert.ok(refs.filter(r=>r.kind==='website').every(r=>!r.description.toLowerCase().includes('low-e')));
  assert.equal(refs.filter(r=>r.kind==='external').length,1);
  assert.match(refs.find(r=>r.kind==='external').description,/Low-E/);
  const answer=validateGroundedAnswer('Triple glazing has a third glass layer. [1]',messages,'en');
  assert.ok(answer.includes('Website sources: [1]'));
  assert.throws(()=>validateGroundedAnswer('Uncited claim.',messages,'en'),/invalid_sources/);
  assert.throws(()=>validateGroundedAnswer('Unknown source. [99]',messages,'en'),/invalid_sources/);
  assert.throws(()=>validateGroundedAnswer('word '.repeat(66)+'[1]',messages,'en'),/answer_length/);
  assert.match(validateGroundedAnswer('INSUFFICIENT',messages,'en'),/does not contain enough/);
  assert.equal(MAX_OUTPUT_TOKENS,128);
});
test('previous assistant speculation is not recycled as evidence',()=>{
  const messages=buildMessages('What about indoor air?',[
    {role:'user',content:'Which glass?'},{role:'assistant',content:'UNSUPPORTED Low-E removes chemicals.'}
  ],{});
  assert.doesNotMatch(JSON.stringify(messages),/UNSUPPORTED/);
});
test('external sources are server-owned, cited separately and added only for relevant questions',async t=>{
  const {env}=setup(t,async()=>({response:'Low-E coatings reflect heat energy. [5]'}));
  const result=await answerWithWorkersAI(request(),env,body({question:'What does Low-E glass do?'}));
  assert.equal(result.mode,'ai');assert.equal(result.sources.length,1);
  assert.match(result.sources[0].url,/^https:\/\/www\.energy\.gov\//);
  assert.doesNotMatch(result.answer,/Website sources/);
  const unrelated=buildMessages('Compare cellulose and mineral wool',[],{});
  assert.ok(JSON.parse(unrelated.at(-1).content).references.every(r=>r.kind==='website'));
});
