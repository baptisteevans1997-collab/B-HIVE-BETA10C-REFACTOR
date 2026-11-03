import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore,STORAGE_KEY,TOOLS,QUESTS} from '../model.mjs';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};};
async function record(store,{tool='lantern',kind='rest',route='pause',outcome='partly',intention='A quiet moment',pack='',gentle=false}={}) {
  await store.setProfile('Fern',tool);
  const {result}=await store.send(kind,intention,{route,pack,gentle});
  await store.arrive(result.id);
  return (await store.complete(result.id,outcome,'An honest note.','A useful clue.')).result;
}
test('RPG save is separate from the original Flights namespace',async()=>{
  const storage=memory();storage.setItem('bhive-proto-flights-0','untouched');
  const store=createStore(storage,null);await store.visit();await store.reset();
  assert.equal(storage.getItem('bhive-proto-flights-0'),'untouched');assert.equal(storage.getItem(STORAGE_KEY),null);
});
test('name and gear persist; equipment cannot be changed during a quest',async()=>{
  const storage=memory(),store=createStore(storage,null);
  await store.setProfile('Fern','satchel');await store.send('gather','A little care',{route:'prepare',pack:'Put the bottle on the counter'});
  await assert.rejects(store.setProfile('Fern','cloak'));
  const reloaded=createStore(storage,null).read();
  assert.deepEqual(reloaded.profile,{name:'Fern',tool:'satchel'});
  assert.equal(reloaded.active.quest.pack,'Put the bottle on the counter');
});
test('every tool and every quest branch preserves its choices and complete outcome',async()=>{
  const store=createStore(memory(),null);
  for(const tool of Object.keys(TOOLS))for(const [kind,quest] of Object.entries(QUESTS))for(const route of Object.keys(quest.routes)){
    const result=await record(store,{tool,kind,route,pack:'A first step',gentle:true});
    assert.equal(result.quest.tool,tool);assert.equal(result.quest.route,route);
    assert.equal(result.quest.gentle,tool==='cloak');assert.equal(result.quest.pack,tool==='satchel'?'A first step':'');
  }
  assert.equal(store.read().records.length,18);
});
test('all outcomes may become an explicitly saved technique, with no duplicate learning',async()=>{
  const store=createStore(memory(),null);
  for(const outcome of ['done','partly','not_this_time','plans_changed']){
    const result=await record(store,{outcome});
    await Promise.all([store.learn(result.id,'My approach'),store.learn(result.id,'Duplicate')]);
  }
  assert.equal(store.read().records.length,4);assert.equal(store.read().techniques.length,4);
  assert.ok(store.read().techniques.every(t=>t.title==='My approach'));
});
test('reusing a technique equips its tool and returns the preserved plan without awarding a cell',async()=>{
  const storage=memory(),store=createStore(storage,null);
  const result=await record(store,{tool:'cloak',gentle:true,intention:'Put one thing down.'});
  await store.learn(result.id,'One thing down');await store.setProfile('Fern','satchel');
  const reused=await createStore(storage,null).reuse(result.id);
  assert.equal(reused.state.profile.tool,'cloak');assert.equal(reused.result.quest.gentle,true);
  assert.equal(reused.result.intention,'Put one thing down.');assert.equal(reused.state.records.length,1);assert.equal(reused.state.active,null);
});
test('learning needs a real saved record; malformed choices cannot create a quest',async()=>{
  const store=createStore(memory(),null);
  await assert.rejects(store.learn('invented','No'));await assert.rejects(store.setProfile('', 'lantern'));
  await assert.rejects(store.send('rest','',{route:'nonexistent'}));
  assert.equal(store.read().records.length,0);assert.equal(store.read().techniques.length,0);
});
