import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore, STORAGE_KEY, KINDS, OUTCOMES} from '../model.mjs';

function memoryStorage() {
  const values = new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}
async function ready(store,kind='rest',intention='An early night') {
  const sent=await store.send(kind,intention);
  await store.arrive(sent.result.id);
  return sent.result.id;
}
test('only one Forager can be away, and a flight cannot be completed before arrival',async()=>{
  const store=createStore(memoryStorage(),null);
  const {result:flight}=await store.send('rest');
  await assert.rejects(store.send('gather'));
  await assert.rejects(store.complete(flight.id,'done'));
  assert.equal(store.read().records.length,0);
  assert.equal(store.read().active.id,flight.id);
});
test('a new store and a new visit preserve intention, return the bee, and preserve completed notes exactly',async()=>{
  const storage=memoryStorage(),store=createStore(storage,null);
  const intention='  A little rest 🌙\n<not HTML> & quiet  ',note='Partly.\nKept the phone away.';
  await store.send('rest',intention);
  const reopened=createStore(storage,null);
  assert.equal(reopened.read().active.status,'out');
  const {state}=await reopened.visit();
  assert.equal(state.active.status,'ready');
  await reopened.complete(state.active.id,'partly',note);
  const record=createStore(storage,null).read().records[0];
  assert.equal(record.intention,intention);assert.equal(record.note,note);
  assert.equal(record.outcome,'partly');assert.equal(record.kind,'rest');
});
test('repeated and simultaneous completion calls create exactly one immutable record',async()=>{
  const storage=memoryStorage(),store=createStore(storage,null),id=await ready(store);
  const results=await Promise.all(Array.from({length:25},(_,i)=>createStore(storage,null).complete(id,i?'done':'partly',i?'changed':'first note')));
  assert.equal(store.read().records.length,1);
  for(const result of results) assert.deepEqual(result.result,results[0].result);
  assert.equal(store.read().records[0].outcome,'partly');
  assert.equal(store.read().records[0].note,'first note');
});
test('replaying an old homecoming cannot consume a newer flight',async()=>{
  const store=createStore(memoryStorage(),null),id=await ready(store);
  await store.complete(id,'not_this_time','A different day.');
  const second=await store.send('look');
  await store.complete(id,'done');
  assert.equal(store.read().records.length,1);
  assert.equal(store.read().active.id,second.result.id);
  assert.equal(store.read().records[0].outcome,'not_this_time');
});
test('all 12 kind/outcome combinations retain a record, beyond seven cells',async()=>{
  const store=createStore(memoryStorage(),null);
  for(const kind of Object.keys(KINDS)) for(const outcome of Object.keys(OUTCOMES)) {
    const id=await ready(store,kind,'');
    await store.complete(id,outcome,'');
  }
  const records=store.read().records;
  assert.equal(records.length,12);assert.equal(new Set(records.map(record=>record.id)).size,12);
  for(const kind of Object.keys(KINDS)) for(const outcome of Object.keys(OUTCOMES)) assert.ok(records.some(record=>record.kind===kind&&record.outcome===outcome));
});
test('failed persistence leaves the last saved flight recoverable',async()=>{
  const storage=memoryStorage(),store=createStore(storage,null),id=await ready(store);
  const before=storage.getItem(STORAGE_KEY),write=storage.setItem;
  storage.setItem=()=>{throw new DOMException('Full','QuotaExceededError');};
  await assert.rejects(store.complete(id,'done'));
  assert.equal(storage.getItem(STORAGE_KEY),before);
  storage.setItem=write;
  await store.complete(id,'done');assert.equal(store.read().records.length,1);
});
test('Reset removes only the prototype key, including when its contents are corrupt',async()=>{
  const storage=memoryStorage(),store=createStore(storage,null);
  storage.setItem('unrelated-save','keep me');
  storage.setItem(STORAGE_KEY,'invalid JSON');
  await assert.rejects(store.visit());
  assert.equal(storage.getItem(STORAGE_KEY),'invalid JSON');
  await store.reset();
  assert.equal(storage.getItem(STORAGE_KEY),null);
  assert.equal(storage.getItem('unrelated-save'),'keep me');
  assert.equal(store.read().records.length,0);
});
test('plain mode persists and invalid outcome, stale IDs and oversize notes cannot award cells',async()=>{
  const storage=memoryStorage(),store=createStore(storage,null),id=await ready(store);
  await store.setPlain(true);
  assert.equal(createStore(storage,null).read().plain,true);
  await assert.rejects(store.complete('stale','done'));
  await assert.rejects(store.complete(id,'half'));
  await assert.rejects(store.complete(id,'done','x'.repeat(1001)));
  assert.equal(store.read().records.length,0);
});
