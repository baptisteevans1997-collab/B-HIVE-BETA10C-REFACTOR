import {TOOLS,QUESTS,objectiveFor} from './rpg-data.mjs';
export {TOOLS,QUESTS,objectiveFor};
export const STORAGE_KEY = 'bhive-proto-flights-rpg-1';
export const KINDS = {
  gather: {name:'Gather', cargo:'Honey', verb:'Do one thing for your body.', hint:'A meal, a walk, a little movement.', question:'Did you do what you set out to do?'},
  look: {name:'Look', cargo:'Pollen', verb:'Notice something about your health.', hint:'Your energy, a pattern, what you need.', question:'Did you find something to notice?'},
  rest: {name:'Rest', cargo:'Wax', verb:'Make a little room to recover.', hint:'A pause, an early night, some quiet.', question:'Did you get the rest you needed?'}
};
export const OUTCOMES = {
  done:{name:'Done',symbol:'✦',meaning:'A star for what happened.'},
  partly:{name:'Partly',symbol:'≈',meaning:'Waves for a little of the way.'},
  not_this_time:{name:'Not this time',symbol:'○',meaning:'A circle for a day that went differently.'},
  plans_changed:{name:'Plans changed',symbol:'↗',meaning:'A turn for a new direction.'}
};
const blank = () => ({version:2, plain:false, active:null, records:[], profile:{name:'Pip',tool:'lantern'},techniques:[]});
const isText = x => typeof x === 'string' && x.length <= 1000;
const isDate = x => typeof x === 'string' && Number.isFinite(Date.parse(x));
const isId = x => typeof x==='string' && /^[0-9a-f-]{36}$/.test(x);
const isQuest = (kind,quest) => quest && Object.hasOwn(QUESTS[kind].routes,quest.route) && Object.hasOwn(TOOLS,quest.tool) && isText(quest.pack) && typeof quest.gentle==='boolean' && (!quest.gentle || quest.tool==='cloak');
const isName = x => typeof x==='string' && x.trim().length>0 && x.length<=24;
const isFlight = x => x && isId(x.id) && Object.hasOwn(KINDS,x.kind) && isText(x.intention) && isDate(x.sentAt) && isQuest(x.kind,x.quest) && isName(x.foragerName);
export function validate(state) {
  if (!state || state.version !== 2 || typeof state.plain !== 'boolean' || !Array.isArray(state.records) || !state.profile || !isName(state.profile.name) || !Object.hasOwn(TOOLS,state.profile.tool) || !Array.isArray(state.techniques)) throw new Error('This RPG prototype save could not be read. Reset the prototype to start again.');
  const ids = new Set();
  for (const record of state.records) {
    if (!isFlight(record) || !Object.hasOwn(OUTCOMES,record.outcome) || !isText(record.note) || !isText(record.observation) || !isDate(record.completedAt) || ids.has(record.id)) throw new Error('This prototype save could not be read. Reset the prototype to start again.');
    ids.add(record.id);
  }
  if (state.active !== null && (!isFlight(state.active) || !['out','ready'].includes(state.active.status) || ids.has(state.active.id))) throw new Error('This prototype save could not be read. Reset the prototype to start again.');
  const learned=new Set();
  for(const technique of state.techniques) {
    if(!ids.has(technique.id) || learned.has(technique.id) || typeof technique.title!=='string' || !technique.title.trim() || technique.title.length>48 || !isText(technique.intention) || !Object.hasOwn(KINDS,technique.kind) || !isQuest(technique.kind,technique.quest)) throw new Error('This RPG prototype save could not be read. Reset the prototype to start again.');
    learned.add(technique.id);
  }
  return state;
}
export function createStore(storage, locks = globalThis.navigator?.locks) {
  const read = () => {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? blank() : validate(JSON.parse(raw));
  };
  const serial = action => locks ? locks.request(STORAGE_KEY, action) : Promise.resolve().then(action);
  const change = operation => serial(() => {
    const state = read();
    const result = operation(state);
    validate(state);
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return {state, result};
  });
  return {
    read,
    visit: () => change(state => {if(state.active?.status === 'out') state.active.status = 'ready';}),
    setPlain: plain => change(state => {state.plain = Boolean(plain);}),
    setProfile: (name,tool) => change(state => {
      if(!isName(name)||!Object.hasOwn(TOOLS,tool)) throw new Error('Give your Forager a name of up to 24 characters and choose one tool.');
      if(state.active && tool!==state.profile.tool) throw new Error('Your Forager can change equipment after the homecoming.');
      state.profile={name:name.trim(),tool};
    }),
    send: (kind, intention = '',options={}) => change(state => {
      if (state.active) throw new Error('Your Forager already has a flight. Welcome them home first.');
      if (!Object.hasOwn(KINDS,kind) || !isText(intention)) throw new Error('Choose a flight and keep your note under 1,000 characters.');
      const quest={route:options.route||Object.keys(QUESTS[kind].routes)[0],tool:state.profile.tool,pack:state.profile.tool==='satchel'?(options.pack||''):'',gentle:state.profile.tool==='cloak'&&Boolean(options.gentle)};
      if(!isQuest(kind,quest)) throw new Error('Choose an approach for this quest.');
      state.active = {id:crypto.randomUUID(),kind,intention,sentAt:new Date().toISOString(),status:'out',quest,foragerName:state.profile.name};
      return state.active;
    }),
    arrive: id => change(state => {
      if (state.active?.id === id) state.active.status = 'ready';
    }),
    complete: (id, outcome, note = '',observation='') => change(state => {
      // The flight ID is the cell ID. Replaying a completion returns its first record.
      const existing = state.records.find(record => record.id === id);
      if (existing) return existing;
      if (!state.active || state.active.id !== id || state.active.status !== 'ready') throw new Error('That flight is not waiting for a homecoming.');
      if (!Object.hasOwn(OUTCOMES,outcome) || !isText(note) || !isText(observation)) throw new Error('Choose what happened and keep each note under 1,000 characters.');
      const {status, ...flight} = state.active;
      const record = {...flight,outcome,note,observation,completedAt:new Date().toISOString()};
      state.records.push(record);
      state.active = null;
      return record;
    }),
    learn: (id,title) => change(state => {
      const existing=state.techniques.find(item=>item.id===id);
      if(existing) return existing;
      const record=state.records.find(item=>item.id===id);
      if(!record) throw new Error('Open a completed quest to remember its approach.');
      if(typeof title!=='string' || !title.trim() || title.length>48) throw new Error('Name this approach in 48 characters or fewer.');
      const technique={id,title:title.trim(),kind:record.kind,quest:{...record.quest},intention:record.intention||objectiveFor(record.kind,record.quest)};
      state.techniques.push(technique);
      return technique;
    }),
    reuse: id => change(state => {
      if(state.active) throw new Error('Welcome your Forager home before choosing another quest.');
      const technique=state.techniques.find(item=>item.id===id);
      if(!technique) throw new Error('That approach is not in your field guide.');
      state.profile.tool=technique.quest.tool;
      return technique;
    }),
    reset: () => serial(() => {storage.removeItem(STORAGE_KEY);return {state:blank()};})
  };
}
