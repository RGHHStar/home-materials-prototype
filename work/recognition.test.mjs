import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../functions/_advisor/catalog.mjs';
import {recognizeQuestion,referenceAnswer,generateAnswer} from '../functions/_advisor/core.mjs';

test('all 62 canonical materials and both orders of every material pair',()=>{
  const names=catalog.systems.flatMap(s=>s.items.map(i=>i.en));
  for(const name of names) assert.deepEqual(recognizeQuestion(`Tell me about ${name}`).materials,[name]);
  for(const a of names) for(const b of names) if(a!==b) {
    const result=recognizeQuestion(`${a} versus ${b}`);
    assert.deepEqual(result.materials,[a,b],`${a} / ${b}`);
    assert.equal(result.intent,'compare');
  }
});
test('three materials keep all six input orders',()=>{
  const names=['Cellulose','Mineral Wool','Fibreglass'];
  for(const a of names) for(const b of names) for(const c of names) if(new Set([a,b,c]).size===3)
    assert.deepEqual(recognizeQuestion(`${a}, ${b}, ${c}: how do they differ?`).materials,[a,b,c]);
});
test('Chinese, French, aliases, categories, intentions and focus',()=>{
  const window=recognizeQuestion('窗户有什么差异？');
  assert.deepEqual(window.systems,['windows']);assert.equal(window.intent,'compare');
  const result=recognizeQuestion('岩棉跟玻璃棉，潮湿的地方哪个更适合？');
  assert.deepEqual(result.materials,['Mineral Wool','Fibreglass']);assert.ok(result.focus.includes('moisture'));
  assert.equal(recognizeQuestion('讲讲矿棉优缺点').intent,'pros_cons');
  assert.deepEqual(recognizeQuestion('double glazing vs single glazing').materials,['Double-Pane Windows','Single-Pane Windows']);
  assert.deepEqual(recognizeQuestion('比较回收砖和砖').materials,['Reclaimed Brick','Brick']);
  assert.deepEqual(recognizeQuestion('fiberglass / rock wool').materials,['Fibreglass','Mineral Wool']);
  assert.equal(recognizeQuestion('fiberglass vs rock wool').answerKey,recognizeQuestion('矿棉和玻璃棉有什么差异').answerKey);
  for(const s of catalog.systems) for(const i of s.items) assert.deepEqual(recognizeQuestion(i.fr).materials,[i.en],i.fr);
  assert.deepEqual(recognizeQuestion('比较矿棉与矿棉').materials,['Mineral Wool']);
  assert.deepEqual(recognizeQuestion('complexity and video').materials,[]);
});
test('guide actually routes paraphrases and asks for missing comparison subjects',async()=>{
  const result=await generateAnswer('窗户有什么差异？',[],{});
  for(const name of ['Single-Pane Windows','Double-Pane Windows','Triple-Pane Windows']) assert.ok(result.answer.includes(name));
  assert.doesNotMatch(result.answer,/price|\/100|★|higher.scoring/i);
  assert.match(referenceAnswer('rock wool versus an unknown material'),/Which other material/);
  assert.match(referenceAnswer('对比窗户和屋顶'),/name two or three/);
  assert.match(referenceAnswer('矿棉和纤维素有什么不同'),/Comparison/);
  assert.match(referenceAnswer('EPS vs XPS'),/EPS Foam/);
});
