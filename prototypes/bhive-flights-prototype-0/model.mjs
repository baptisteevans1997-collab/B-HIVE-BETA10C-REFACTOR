export const STORAGE_KEY = 'bhive-proto-flights-0';
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
const blank = () => ({version:1, plain:false, active:null, records:[]});
const isText = x => typeof x === 'string' && x.length <= 1000;
const isDate = x => typeof x === 'string' && Number.isFinite(Date.parse(x));
const isFlight = x => x && typeof x.id === 'string' && x.id.length > 0 && Object.hasOwn(KINDS,x.kind) && isText(x.intention) && isDate(x.sentAt);
export function validate(state) {
  if (!state || state.version !== 1 || typeof state.plain !== 'boolean' || !Array.isArray(state.records)) throw new Error('This prototype save could not be read. Reset the prototype to start again.');
  const ids = new Set();
  for (const record of state.records) {
    if (!isFlight(record) || !Object.hasOwn(OUTCOMES,record.outcome) || !isText(record.note) || !isDate(record.completedAt) || ids.has(record.id)) throw new Error('This prototype save could not be read. Reset the prototype to start again.');
    ids.add(record.id);
  }
  if (state.active !== null && (!isFlight(state.active) || !['out','ready'].includes(state.active.status) || ids.has(state.active.id))) throw new Error('This prototype save could not be read. Reset the prototype to start again.');
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
    send: (kind, intention = '') => change(state => {
      if (state.active) throw new Error('Your Forager already has a flight. Welcome them home first.');
      if (!Object.hasOwn(KINDS,kind) || !isText(intention)) throw new Error('Choose a flight and keep your note under 1,000 characters.');
      state.active = {id:crypto.randomUUID(),kind,intention,sentAt:new Date().toISOString(),status:'out'};
      return state.active;
    }),
    arrive: id => change(state => {
      if (state.active?.id === id) state.active.status = 'ready';
    }),
    complete: (id, outcome, note = '') => change(state => {
      // The flight ID is the cell ID. Replaying a completion returns its first record.
      const existing = state.records.find(record => record.id === id);
      if (existing) return existing;
      if (!state.active || state.active.id !== id || state.active.status !== 'ready') throw new Error('That flight is not waiting for a homecoming.');
      if (!Object.hasOwn(OUTCOMES,outcome) || !isText(note)) throw new Error('Choose what happened and keep your note under 1,000 characters.');
      const {status, ...flight} = state.active;
      const record = {...flight,outcome,note,completedAt:new Date().toISOString()};
      state.records.push(record);
      state.active = null;
      return record;
    }),
    reset: () => serial(() => {storage.removeItem(STORAGE_KEY);return {state:blank()};})
  };
}
