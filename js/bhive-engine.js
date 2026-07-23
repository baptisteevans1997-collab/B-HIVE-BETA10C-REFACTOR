/* B HIVE — Engine (beta10c refactor)
   Pure data tables + utility functions. No DOM, no side effects.
   Load before app-main.js. */

window.BHIVE = window.BHIVE || {};
var BHIVE = window.BHIVE;

/* ── SVG helpers ── */
BHIVE.NS = 'http://www.w3.org/2000/svg';
BHIVE.el = function(tag, attrs) {
  var e = document.createElementNS(BHIVE.NS, tag);
  if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
  return e;
};

/* ── pure math / string helpers ── */
BHIVE.pad = function(n) { return n < 10 ? '0' + n : '' + n; };
BHIVE.clamp = function(n) { return n < 0 ? 0 : n > 100 ? 100 : n; };
BHIVE.esc = function(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
BHIVE.hsh = function(n) {
  n = n >>> 0; n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) >>> 0;
  n ^= n >>> 4; n = (n * 0x27d4eb2d) >>> 0; n ^= n >>> 15;
  return (n >>> 0) / 4294967296;
};

/* ── hex geometry ── */
BHIVE.hex = function(cx, cy, r) {
  var p = [], i, a;
  for (i = 0; i < 6; i++) {
    a = Math.PI / 180 * 60 * i;
    p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
  }
  return p.join(' ');
};
BHIVE.hexRadius = function(v) { return 8 + v / 100 * 38; };
BHIVE.clampToHex = function(dx, dy, r) {
  var ax = Math.abs(dx), ay = Math.abs(dy), f = 1;
  if (ay > r * 0.866) f = (r * 0.866) / ay;
  var sl = ax + ay / 1.732;
  if (sl > r) f = Math.min(f, r / sl);
  return f < 1 ? [dx * f, dy * f] : [dx, dy];
};

/* ── cell vitality (pure, no DOM) ── */
BHIVE.cellVitality = function(c) {
  var gap = c.en - c.imp;
  if (gap >= 14) return 'leak';
  if (c.imp >= 50 && gap <= -25) return 'under';
  if (c.imp < 50 && c.en < 35) return 'dormant';
  return 'aligned';
};

/* ── verdict colour tables ── */
BHIVE.FRAME = { aligned: '#a3b07f', under: '#b89a6e', leak: '#cf8c54', dormant: '#5f5743' };
BHIVE.CORE  = { aligned: '#c9ae78', under: '#c9ae78', leak: '#cf8c54', dormant: '#b39e74' };
BHIVE.VNAME = { aligned: 'Aligned', under: 'Under-fed', leak: 'Leaking', dormant: 'Dormant' };
BHIVE.VCLASS = { aligned: 'hd-aligned', under: 'hd-under', leak: 'hd-leak', dormant: 'hd-dormant' };

/* ═══════════════════════════════════════════════════
   STATIC DATA TABLES — initial values only.
   Runtime copies live in app-main.js and are mutated there.
   ═══════════════════════════════════════════════════ */

BHIVE.CELL_DEFS = [
  { key: 'lw',      label: 'Main Project', full: 'Main project',               desc: 'The main project or venture you are building.',                     x: 278, y: 215, imp: 50, en: 50, read: 'A new cell. It grows as you teach it and answer its questions.', adj: 'Open it daily and feed it something true.' },
  { key: 'free',    label: 'Freedom',      full: 'Freedom',                    desc: 'Time, money and location you actually control.',                    x: 278, y: 322, imp: 50, en: 50, read: 'Freedom grows when you aim at it directly.', adj: 'Once a week, do one thing that buys autonomy.' },
  { key: 'craft',   label: 'Craft',        full: 'Creative craft',             desc: 'The design and making you do for its own sake.',                    x: 278, y: 108, imp: 50, en: 50, read: 'Craft grows with every finished piece.', adj: 'Keep the output pointed at finished things.' },
  { key: 'money',   label: 'Money',        full: 'Money & income',             desc: 'Income, and turning it into a plan not a worry.',                   x: 278, y: 429, imp: 50, en: 50, read: 'Money works best as a project, not a worry.', adj: 'Name the next concrete money step and work it.' },
  { key: 'career',  label: 'Career',       full: 'Career & day job',           desc: 'The day job, your steady income floor.',                            x: 185, y: 162, imp: 50, en: 50, read: 'Steady is good. Watch that steady does not become stuck.', adj: 'Push one small metric at a time.' },
  { key: 'growth',  label: 'Growth',       full: 'Personal growth',            desc: 'Getting sharper, building habits that hold.',                       x: 185, y: 269, imp: 50, en: 50, read: 'Insight counts when it becomes practice.', adj: 'Turn one insight into one repeatable habit.' },
  { key: 'finance', label: 'Next Path',    full: 'A possible next path',       desc: 'A direction you are weighing up.',                                 x: 185, y: 376, imp: 50, en: 50, read: 'Ideas need feeding or they quietly starve.', adj: 'Give it two real hours and a yes or no date.' },
  { key: 'health',  label: 'Health',       full: 'Health & body',              desc: 'The body, training and energy it all runs on.',                     x: 371, y: 162, imp: 50, en: 50, read: 'The body is the engine every other cell runs on.', adj: 'Feed it something measurable this week.' },
  { key: 'people',  label: 'People',       full: 'Relationships & support',    desc: 'The relationships and support around you.',                         x: 371, y: 269, imp: 50, en: 50, read: 'Ambition pursued alone gets heavy.', adj: 'Spend deliberate time with your people.' },
  { key: 'identity',label: 'Identity',     full: 'Identity',                   desc: 'Who you are becoming.',                                             x: 371, y: 376, imp: 50, en: 50, read: 'Identity is the residue of what you finish.', adj: 'Feed it by finishing things.' },
  { key: 'clients', label: 'Client Work',  full: 'Client work',                desc: 'Paid work you do for other people.',                               x: 92,  y: 216, imp: 50, en: 50, read: 'A future cell. Wake it deliberately, not by drift.', adj: 'Wake it when you choose to, not by accident.' },
  { key: 'ink',     label: 'Play',         full: 'Creative play',              desc: 'Creative play, kept purely yours.',                                x: 92,  y: 323, imp: 50, en: 50, read: 'A healthy outlet stays healthy by staying play.', adj: 'Keep it as play, not another project.' },
  { key: 'side',    label: 'Side Builds',  full: 'Side builds',                desc: 'Smaller side projects and experiments.',                            x: 464, y: 216, imp: 50, en: 50, read: 'Side builds are fine when parking them is a choice.', adj: 'Reopen deliberately, or leave parked.' },
  { key: 'recruit', label: 'New Ideas',    full: 'Ideas on the bench',         desc: 'Ideas waiting their turn.',                                        x: 464, y: 323, imp: 50, en: 50, read: 'Benched ideas cost nothing until you feed them.', adj: 'One open venture at a time.' }
];

BHIVE.HIVE_POS = {
  craft:   [192, 238], ink:     [192, 363], recruit: [134, 134], side:    [134, 466],
  finance: [65,  300], career:  [466, 134], lw:      [408, 238], clients: [535, 300],
  money:   [408, 363], free:    [466, 466], identity:[300, 65],  people:  [300, 175],
  health:  [300, 425], growth:  [300, 535]
};

BHIVE.CELL_DEFAULTS = {};
BHIVE.CELL_DEFS.forEach(function(c) { BHIVE.CELL_DEFAULTS[c.key] = { imp: c.imp, en: c.en }; });

BHIVE.UNLOCK_START = ['lw', 'health', 'people'];
BHIVE.UNLOCK_REVEAL_VERSION = 1;

BHIVE.SIG_RULES = [
  { re: /\b(stress|overwhelm|tired|burn\s?out|burnout|stuck|pressure|anxious|drained|exhaust)/, next: ['free', 'growth', 'health'] },
  { re: /\b(money|debt|spend|income|work|job|pay|bill|broke|cash)/,                     next: ['money', 'career', 'clients'] },
  { re: /\b(love|people|family|friend|support|relationship|partner|lonely)/,             next: ['people', 'identity'] },
  { re: /\b(gym|body|training|train\b|food|sleep|health|run\b|weight|fitness)/,        next: ['health', 'growth'] },
  { re: /\b(goal|build|progress|project|create|creati|ambition|launch|ship|make|making|idea)/, next: ['lw', 'craft', 'side', 'recruit'] }
];

BHIVE.UNLOCK_ORDER = ['craft', 'money', 'ink', 'career', 'growth', 'free', 'identity', 'clients', 'side', 'finance', 'recruit'];

/* ── cell meta / bee race data ── */
BHIVE.META = {
  lw:      { race: 'Builder Bees', body: '#f0cd72', size: 1.05, cls: 'The Prodigy',     trait: 'brilliant, nearly ready, addicted to polishing.' },
  free:    { race: 'Scout Bees',   body: '#e6dba6', size: 0.9,  cls: 'The Dreamer',     trait: 'wants the open road, rarely walks toward it.' },
  craft:   { race: 'Builder Bees', body: '#f0cd72', size: 1.05, cls: 'The Artisan',     trait: 'your surest, safest power.' },
  money:   { race: 'Forager Bees', body: '#f7d23e', size: 1.0,  cls: 'The Worrier',     trait: 'strong, but frets instead of acting.' },
  career:  { race: 'Guard Bees',   body: '#c08a4e', size: 1.12, cls: 'The Veteran',     trait: "holds the line. Mustn't fall asleep." },
  growth:  { race: 'Nurse Bees',   body: '#aebd6b', size: 0.96, cls: 'The Scholar',     trait: 'reads the map more than it walks it.' },
  finance: { race: 'Scout Bees',   body: '#e6dba6', size: 0.9,  cls: 'The Strategist',  trait: 'a plan still waiting for its first move.' },
  health:  { race: 'Nurse Bees',   body: '#aebd6b', size: 0.96, cls: 'The Guardian',    trait: 'keeps everyone standing, kept on rations.' },
  people:  { race: 'Guard Bees',   body: '#c08a4e', size: 1.12, cls: 'The Heartwood',   trait: 'quiet strength you lean on too lightly.' },
  identity:{ race: 'Nurse Bees',   body: '#aebd6b', size: 0.96, cls: 'The Shapeshifter',trait: 'becomes whatever you actually finish.' },
  clients: { race: 'Forager Bees', body: '#f7d23e', size: 1.0,  cls: 'The Mercenary',   trait: 'resting on purpose until you call it up.' },
  ink:     { race: 'Builder Bees', body: '#f0cd72', size: 1.05, cls: 'The Wanderer',    trait: 'plays for the joy of it. Keep it free.' },
  side:    { race: 'Drones',       body: '#9d9079', size: 1.14, cls: 'The Inventor',    trait: 'a near-finished marvel, parked in the shed.' },
  recruit: { race: 'Drones',       body: '#9d9079', size: 1.14, cls: 'The Recruit',     trait: 'eager and early; benched for now.' }
};

BHIVE.CASTE_MOD = {
  'Nurse Bees':   { paceMul: 0.85, radMul: 0.78, wobMul: 0.70, ferry: 0 },
  'Builder Bees': { paceMul: 1.00, radMul: 1.00, wobMul: 1.00, ferry: 0 },
  'Forager Bees': { paceMul: 1.05, radMul: 1.00, wobMul: 1.00, ferry: 1 },
  'Guard Bees':   { paceMul: 1.30, radMul: 1.30, wobMul: 1.50, ferry: 0 },
  'Scout Bees':   { paceMul: 1.35, radMul: 1.25, wobMul: 1.25, ferry: 0 },
  'Drones':       { paceMul: 0.55, radMul: 0.88, wobMul: 0.50, ferry: 0 }
};

BHIVE.BEE_TYPES = [
  { name: 'Nurse Bees',   body: '#aebd6b', size: 0.96, role: 'In a real hive, nurse bees feed and tend the brood. Yours work the cells where you grow into who you are.' },
  { name: 'Builder Bees', body: '#f0cd72', size: 1.05, role: 'The wax-makers that raise the comb itself. Yours work the cells where you make and ship real things.' },
  { name: 'Forager Bees', body: '#f7d23e', size: 1.0,  role: 'They range out and carry food home. Yours work the cells that bring resources into your life.' },
  { name: 'Guard Bees',   body: '#c08a4e', size: 1.12, role: 'They hold the entrance and keep the hive standing. Yours work the steady cells everything else rests on.' },
  { name: 'Scout Bees',   body: '#e6dba6', size: 0.9,  role: 'They fly farthest, hunting the next bloom and the next home. Yours work the cells you are aiming toward.' },
  { name: 'Drones',       body: '#9d9079', size: 1.14, role: 'The reserve caste, kept idle until the hive calls them up. Yours hold the cells you have parked on purpose.' }
];

BHIVE.SEED_QUESTIONS = {
  lw:      ['What part of this is moving, and what is just sitting there?', 'What would make this feel worth your effort this week?'],
  free:    ['What are you trying to protect: time, money, energy, or peace?', 'What do you want more room for?'],
  craft:   ['What have you made lately that you were proud of?', 'What skill do you keep wanting to get better at?'],
  money:   ['What is costing you money, time, or attention right now?', 'What money thing do you keep putting off looking at?'],
  career:  ['What part of your work gives you energy, and what part drains it?', 'What are you giving effort to that is not giving much back?'],
  growth:  ['What do you keep thinking about but not acting on?', 'What would make the first step feel smaller?'],
  finance: ['What feels open in your head because it is not decided yet?', 'What would you need to know to say yes or no?'],
  health:  ['What drains you fastest at the moment?', 'What actually helps you recover, and are you doing it?'],
  people:  ['Who gets most of your attention these days?', 'Where are you giving more than you are getting back?'],
  identity:['What do you keep returning to, no matter what?', 'What feels true to you lately, and what feels forced?'],
  clients: ['What are you waiting on, and from whom?', 'What are you doing for others that they could do themselves?'],
  ink:     ['What did you last do just because you enjoyed it?', 'What would you do more of if it did not have to be useful?'],
  side:    ['What is the one thing you would feel better for finishing?', 'What have you left open that quietly bugs you?'],
  recruit: ['Which idea keeps coming back, even when you drop it?', 'What would it take to test it small this month?']
};

BHIVE.SEED_PLAYBOOK = [
  "Build the real thing, do not just describe it.",
  'Explain simply: short sentences, plain words.',
  'Give momentum, pick sensible defaults and move.',
  'Show it working, proof beats description.'
];

BHIVE.LENSES = [
  { name: '48 Laws of Power \u00b7 Robert Greene', gist: 'strategy, leverage, positioning and timing, read situations as power moves' },
  { name: 'The Hour Between Dog and Wolf \u00b7 John Coates', gist: 'the biology of risk, stress, confidence and gut-feel are physical states that drive decisions' }
];

BHIVE.BLOODLINES = {
  lw:       'The Combwright Bloodline',
  craft:    'The Honeycraft Bloodline',
  ink:      'The Quillwing Bloodline',
  free:     'The Far Signal Bloodline',
  finance:  'The Far-Compass Bloodline',
  money:    'The Golden Yield Bloodline',
  clients:  'The Patron Bloodline',
  career:   'The Vanguard Bloodline',
  people:   'The Keepkin Bloodline',
  growth:   'The Bloomward Bloodline',
  health:   'The Pulsekeeper Bloodline',
  identity: 'The Sigil-Bearer Bloodline',
  side:     'The Sparkmaker Bloodline',
  recruit:  'The Herald Bloodline'
};

BHIVE.STAGES = ['Larva', 'Worker', 'Agent', 'Apex'];

BHIVE.MBTI_AXES = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];



/* ═══════════════════════════════════════════════════
   RUNTIME STATE — initialised by BHIVE.init()
   After init(), these hold the live mutable state.
   ═══════════════════════════════════════════════════ */

BHIVE.init = function() {
  var B = BHIVE;

  /* ── cells: deep-clone from CELL_DEFS so mutations don't touch the template ── */
  B.cells = B.CELL_DEFS.map(function(c) {
    var copy = {};
    for (var k in c) copy[k] = c[k];
    return copy;
  });
  /* apply HIVE_POS coordinates */
  B.cells.forEach(function(c) {
    var p = B.HIVE_POS[c.key];
    if (p) { c.x = p[0]; c.y = p[1]; }
  });

  /* ── unlock state ── */
  B.unlocks = B.UNLOCK_START.slice();
  B.unlockRevealVersion = B.UNLOCK_REVEAL_VERSION;

  /* ── learned truths ── */
  B.learnings = {};
  B.swarms = {};
  B.lastTick = 0;

  /* ── question bank (deep-clone the seed) ── */
  B.questions = {};
  for (var k in B.SEED_QUESTIONS) {
    B.questions[k] = B.SEED_QUESTIONS[k].map(function(q) {
      return { q: q, s: 'base' };
    });
  }

  /* ── playbook ── */
  /* Seeds ship approved. They are the app's own voice, not pasted or
     model-authored input, and queenContext now gates the Queen prompt on
     `ok` (app-main.js) — with ok:false these four silently stopped
     reaching her, so a fresh hive lost its own helping preferences.
     Model-suggested rules still arrive unapproved (addPlaybookRule(...,
     'claude', false)) and stay gated, which is the point of that filter. */
  B.playbook = B.SEED_PLAYBOOK.map(function(t) {
    return { t: t, s: 'seed', ok: true };
  });

  /* ── agents, requests, MBTI ── */
  B.agents = {};
  B.requests = {};
  B.mbti = ['', '', '', ''];

  /* ── check-in history ── */
  B.history = [];

  /* ── append-only learning evidence (schema v4) ── */
  B.learning = B.learningTools ? B.learningTools.emptyState() : null;

  /* ── UI state (leaf — not persisted) ── */
  B.sel = 0;
  B.coreOn = false;
  B.coreAnswer = null;
  B.localTs = 0;

  /* seed swarms */
  B.seedSwarms();
};

/* ── seedSwarms: one brood per cell matching its bee race ── */
BHIVE.seedSwarms = function() {
  var B = BHIVE;
  B.cells.forEach(function(c) {
    if (B.swarms[c.key] && B.swarms[c.key].length) return; /* already seeded */
    var race = (B.META[c.key] || {}).race || 'Builder Bees';
    var swarm = [];
    var n = race === 'Drones' ? 2 : 3; /* drones keep a lean reserve */
    for (var i = 0; i < n; i++) swarm.push({ age: 0, b: 0.5 + Math.random() * 0.5, p: 0.4 + Math.random() * 0.6 });
    B.swarms[c.key] = swarm;
  });
};

/* ── stageOf: age → stage index (0=egg,1=larva,2=worker,3=elder) ── */
BHIVE.stageOf = function(age) {
  if (age < 1) return 0;
  if (age < 3) return 1;
  if (age < 9) return 2;
  return 3;
};

/* ── cellLevel: 1 + floor(learnings count / 2) ── */
BHIVE.cellLevel = function(key) {
  return 1 + Math.floor(((BHIVE.learnings[key] || []).length) / 2);
};

/* ── unlock state helpers ── */
BHIVE.isUnlocked = function(key) {
  return BHIVE.unlocks.indexOf(key) >= 0;
};

BHIVE.isTaught = function(key) {
  var ls = BHIVE.learnings[key] || [];
  for (var i = 0; i < ls.length; i++) {
    if (ls[i].s === 'you') return true;
  }
  return false;
};

/* Proven activation is existing durable user activity, not current vitality.
   It is used to migrate ambiguous all-unlocked legacy saves and does not create
   a second reveal state: BHIVE.unlocks remains the only visibility authority. */
BHIVE.hasProvenActivation = function(key) {
  var B = BHIVE, events, i, event;
  if (B.isTaught(key) || (B.agents && B.agents[key])) return true;
  events = B.learning && Array.isArray(B.learning.events) ? B.learning.events : [];
  for (i = 0; i < events.length; i++) {
    event = events[i];
    if (event && event.type === 'cell_value_changed' && event.cellKey === key) return true;
  }
  return false;
};

BHIVE.cellState = function(key) {
  if (!BHIVE.isUnlocked(key)) return 'dormant';
  return BHIVE.isTaught(key) ? 'taught' : 'open';
};

BHIVE.suggestedNextKey = function() {
  var B = BHIVE;
  if (B.unlocks.length <= B.UNLOCK_START.length) return null;
  var k = B.unlocks[B.unlocks.length - 1];
  return B.isTaught(k) ? null : k;
};

BHIVE.wakeCell = function(key) {
  var B = BHIVE;
  B.unlocks.push(key);
  delete B.swarms[key];
  B.seedSwarms();
  B.recordEvent('cell_unlocked', { cellKey: key, payload: { source: 'runtime' } });
  return key;
};

/* ── recordEvent: append immutable evidence when the v4 learning layer is loaded ── */
BHIVE.recordEvent = function(type, details) {
  var B = BHIVE;
  if (!B.learningTools) return false;
  if (!B.learning) B.learning = B.learningTools.emptyState();
  var event = B.learningTools.createEvent(type, details || {});
  return event ? B.learningTools.appendEvent(B.learning, event) : false;
};

/* ── unlockFromAnswer: one teach = at most ONE new cell wakes ── */
BHIVE.unlockFromAnswer = function(text) {
  var B = BHIVE;
  if (B.unlocks.length >= B.cells.length) return null;
  var low = (text || '').toLowerCase(), i, j, r;
  for (i = 0; i < B.SIG_RULES.length; i++) {
    r = B.SIG_RULES[i];
    if (!r.re.test(low)) continue;
    for (j = 0; j < r.next.length; j++) {
      if (!B.isUnlocked(r.next[j])) return B.wakeCell(r.next[j]);
    }
  }
  for (j = 0; j < B.UNLOCK_ORDER.length; j++) {
    if (!B.isUnlocked(B.UNLOCK_ORDER[j])) return B.wakeCell(B.UNLOCK_ORDER[j]);
  }
  return null;
};

/* ── addLearning: record one thing learned; returns false on blank/duplicate ── */
BHIVE.addLearning = function(key, text, src, q) {
  var B = BHIVE;
  text = (text || '').replace(/\s+/g, ' ').trim();
  if (text.length < 1) return false;
  if (text.length > 180) text = text.slice(0, 180);
  if (!B.learnings[key]) B.learnings[key] = [];
  var low = text.toLowerCase(), i;
  for (i = 0; i < B.learnings[key].length; i++) {
    if (B.learnings[key][i].t.toLowerCase() === low) return false;
  }
  var ent = { t: text, s: src || 'you' };
  if (q) ent.q = q;
  B.learnings[key].push(ent);
  B.recordEvent('learning_added', {
    cellKey: key,
    payload: { text: text, source: ent.s, question: q || null }
  });
  if (B.swarms[key] && B.swarms[key].length < 24) B.swarms[key].push({ age: 0, b: 0.5 + Math.random() * 0.5, p: 0.4 + Math.random() * 0.6 });
  if (ent.s === 'you') {
    B.unlockFromAnswer(text);
  }
  return true;
};

/* ── completeFirstFlight: one validated, persisted, idempotent completion ── */
BHIVE.completeFirstFlight = function(request) {
  var B = BHIVE, events, state, completion, mission, answers, config, questionList;
  var questionIndexes = [], backup, unlockedKey = null, completionEvent, now, i, matches;

  function result(ok, reason, extra) {
    var out = { ok: ok, reason: reason || null };
    if (extra) for (var key in extra) out[key] = extra[key];
    return out;
  }
  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (e) { return null; }
  }
  function same(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
  }
  function canonicalMission(value) {
    if (!B.experiments || !B.experiments.completionPayload) return null;
    var payload = B.experiments.completionPayload(value, 'completed');
    if (!payload) return null;
    delete payload.outcome;
    return payload;
  }

  if (!request || typeof request !== 'object' || Array.isArray(request) ||
      typeof request.storageKey !== 'string' || !request.storageKey ||
      !B.learningTools || !B.experiments || !B.experiments.firstFlightState ||
      !B.learning || !Array.isArray(B.learning.events)) {
    return result(false, 'invalid_request');
  }

  events = B.learning.events;
  state = B.experiments.firstFlightState(events);
  if (!state || (state.status !== 'mission_active' && state.status !== 'mission_completed')) {
    return result(false, 'mission_not_active');
  }
  if (request.cellKey !== state.cellKey || !Array.isArray(request.answers) ||
      request.answers.length !== 2) {
    return result(false, 'state_mismatch');
  }
  answers = request.answers.map(function(answer) {
    return B.learningTools.normalizeFirstFlightAnswer(answer);
  });
  if (!answers[0] || !answers[1] || !same(answers, state.answers)) {
    return result(false, 'state_mismatch');
  }
  if (request.mission && request.mission.decision &&
      request.mission.decision !== 'accepted') {
    return result(false, 'mission_mismatch');
  }
  mission = canonicalMission(request.mission);
  if (!mission || !B.experiments.isFirstFlight(mission) || !same(mission, state.mission)) {
    return result(false, 'mission_mismatch');
  }

  /* A matching completion event is the durable idempotency marker. */
  if (state.status === 'mission_completed') {
    return result(true, null, {
      alreadyCompleted: true,
      cellKey: state.cellKey,
      completionEventId: state.completedEventId || null
    });
  }

  config = B.experiments.FIRST_FLIGHT && B.experiments.FIRST_FLIGHT[state.cellKey];
  questionList = B.questions && B.questions[state.cellKey];
  if (!config || !Array.isArray(config.questions) || config.questions.length !== 2 ||
      !Array.isArray(questionList) || !B.learnings || !Array.isArray(B.swarms[state.cellKey])) {
    return result(false, 'invalid_live_state');
  }
  for (i = 0; i < config.questions.length; i++) {
    matches = [];
    questionList.forEach(function(item, index) {
      if (item && item.q === config.questions[i]) matches.push(index);
    });
    if (matches.length !== 1 || questionIndexes.indexOf(matches[0]) >= 0) {
      return result(false, 'questions_mismatch');
    }
    questionIndexes.push(matches[0]);
  }

  now = typeof request.now === 'number' && isFinite(request.now) && request.now > 0 ?
    Math.floor(request.now) : Date.now();
  completion = B.experiments.completionPayload(state.mission, 'completed');
  if (!completion) return result(false, 'mission_mismatch');

  backup = {
    learnings: clone(B.learnings),
    questions: clone(B.questions),
    swarms: clone(B.swarms),
    unlocks: clone(B.unlocks),
    learning: clone(B.learning),
    localTs: B.localTs
  };
  if (!backup.learnings || !backup.questions || !backup.swarms ||
      !backup.unlocks || !backup.learning) {
    return result(false, 'invalid_live_state');
  }

  try {
    if (!B.learnings[state.cellKey]) B.learnings[state.cellKey] = [];
    for (i = 0; i < 2; i++) {
      B.learnings[state.cellKey].push({
        t: answers[i],
        s: 'you',
        q: config.questions[i]
      });
      if (!B.recordEvent('learning_added', {
        id: 'evt_first_flight_v1_learning_' + state.cellKey + '_' + (i + 1),
        ts: now,
        cellKey: state.cellKey,
        payload: {
          text: answers[i],
          source: 'you',
          question: config.questions[i],
          firstFlightVersion: 1
        }
      })) throw new Error('learning_event');
    }

    questionIndexes.sort(function(a, b) { return b - a; }).forEach(function(index) {
      questionList.splice(index, 1);
    });

    B.swarms[state.cellKey].push({ age: 3, b: 0.5, p: 0.5 });
    unlockedKey = B.unlockFromAnswer(answers.join(' '));

    completionEvent = B.recordEvent('experiment_completed', {
      id: 'evt_first_flight_v1_completed_' + state.cellKey,
      ts: now,
      cellKey: state.cellKey,
      payload: completion
    });
    if (!completionEvent ||
        B.experiments.firstFlightState(B.learning.events).status !== 'mission_completed') {
      throw new Error('completion_event');
    }
    if (B.save(request.storageKey) !== true) throw new Error('save_failed');

    return result(true, null, {
      alreadyCompleted: false,
      cellKey: state.cellKey,
      learningEventIds: [
        'evt_first_flight_v1_learning_' + state.cellKey + '_1',
        'evt_first_flight_v1_learning_' + state.cellKey + '_2'
      ],
      completionEventId: completionEvent.id,
      unlockedKey: unlockedKey
    });
  } catch (e) {
    B.learnings = backup.learnings;
    B.questions = backup.questions;
    B.swarms = backup.swarms;
    B.unlocks = backup.unlocks;
    B.learning = backup.learning;
    B.localTs = backup.localTs;
    return result(false, 'completion_failed');
  }
};

/* One-time reveal migration.
   - Partial legacy trails are preserved.
   - Only an unversioned all-unlocked save is ambiguous enough to prune.
   - Foundation cells and cells with proven activation remain revealed.
   - Historical unlock evidence is retained in the append-only event store.
   After this migration, unlocks is append-only again and is never auto-pruned. */
BHIVE.migrateUnlockReveal = function(snapshot) {
  var B = BHIVE, d = snapshot || {}, original = B.unlocks.slice(), events, known = {};
  var i, key, event, ts, allUnlocked = true, keep = {}, seen = {}, migrated = [];
  if (d.unlockRevealVersion === B.UNLOCK_REVEAL_VERSION) {
    B.unlockRevealVersion = B.UNLOCK_REVEAL_VERSION;
    return false;
  }

  /* Preserve the legacy unlock trail before changing the live reveal set. */
  events = B.learning && Array.isArray(B.learning.events) ? B.learning.events : [];
  for (i = 0; i < events.length; i++) {
    event = events[i];
    if (event && event.type === 'cell_unlocked' && event.cellKey) known[event.cellKey] = true;
  }
  ts = d && typeof d.ts === 'number' && isFinite(d.ts) && d.ts > 0 ? Math.floor(d.ts) : 1;
  if (B.learningTools && B.learning) {
    for (i = 0; i < original.length; i++) {
      key = original[i];
      if (known[key]) continue;
      event = B.learningTools.createEvent('cell_unlocked', {
        id: 'evt_unlock_reveal_v1_legacy_' + key,
        ts: ts,
        cellKey: key,
        payload: { source: 'legacy_unlocks', migrated: true, timestampKnown: false }
      });
      if (event) B.learningTools.appendEvent(B.learning, event);
    }
  }

  B.unlockRevealVersion = B.UNLOCK_REVEAL_VERSION;
  for (i = 0; i < B.cells.length; i++) {
    if (!B.isUnlocked(B.cells[i].key)) { allUnlocked = false; break; }
  }
  if (!allUnlocked) return false;

  for (i = 0; i < B.UNLOCK_START.length; i++) keep[B.UNLOCK_START[i]] = true;
  for (i = 0; i < B.cells.length; i++) {
    key = B.cells[i].key;
    if (B.hasProvenActivation(key)) keep[key] = true;
  }
  for (i = 0; i < B.UNLOCK_START.length; i++) {
    key = B.UNLOCK_START[i];
    if (!seen[key]) { seen[key] = true; migrated.push(key); }
  }
  for (i = 0; i < original.length; i++) {
    key = original[i];
    if (keep[key] && !seen[key]) { seen[key] = true; migrated.push(key); }
  }
  B.unlocks = migrated;
  return migrated.length !== original.length;
};

/* ── snapshot: pure serialization ── */
BHIVE.snapshot = function() {
  var B = BHIVE;
  var cur = {};
  B.cells.forEach(function(c) { cur[c.key] = { imp: c.imp, en: c.en }; });
  return {
    v: 4,
    ts: Date.now(),
    current: cur,
    history: B.history,
    learnings: B.learnings,
    questions: B.questions,
    playbook: B.playbook,
    qver: 3,
    mbti: B.mbti,
    requests: B.requests,
    agents: B.agents,
    swarms: B.swarms,
    lastTick: B.lastTick,
    unlocks: B.unlocks,
    unlockRevealVersion: B.unlockRevealVersion,
    learning: B.learningTools ? B.learningTools.normalizeState(B.learning) : B.learning
  };
};

/* ── save: persist to localStorage ── */
BHIVE.save = function(storageKey) {
  var B = BHIVE;
  var snap = B.snapshot();
  B.localTs = snap.ts;
  try {
    localStorage.setItem(storageKey, JSON.stringify(snap));
    return true;
  } catch(e) {
    console.warn('hive:', e);
    return false;
  }
};

/* ── load: restore from localStorage ── */
BHIVE.load = function(storageKey) {
  var B = BHIVE, revealNeedsMigration = false;
  try {
    var raw = localStorage.getItem(storageKey);
    if (!raw) return false;
    var d = JSON.parse(raw);
    revealNeedsMigration = d.unlockRevealVersion !== B.UNLOCK_REVEAL_VERSION;
    if (d && d.current) {
      B.cells.forEach(function(c) {
        var s = d.current[c.key];
        if (s) {
          if (typeof s.imp === 'number') c.imp = B.clamp(s.imp);
          if (typeof s.en === 'number') c.en = B.clamp(s.en);
        }
      });
    }
    if (d && d.history && d.history.length) B.history = d.history;
    if (d && d.learnings && typeof d.learnings === 'object') B.learnings = d.learnings;
    if (d && d.questions && typeof d.questions === 'object' && d.qver === 3) B.questions = d.questions;
    if (d && Array.isArray(d.playbook)) B.playbook = d.playbook;
    if (d && d.mbti && d.mbti.length === 4) B.mbti = d.mbti;
    if (d && d.requests && typeof d.requests === 'object') B.requests = d.requests;
    if (d && d.agents && typeof d.agents === 'object') B.agents = d.agents;
    if (d && d.swarms && typeof d.swarms === 'object') B.swarms = d.swarms;
    if (d && typeof d.lastTick === 'number') B.lastTick = d.lastTick;
    if (d && typeof d.ts === 'number') B.localTs = d.ts;
    /* restore unlock trail */
    if (d && Array.isArray(d.unlocks) && d.unlocks.length) {
      var seen = {}, ok = [], si;
      d.unlocks.forEach(function(k) {
        if (typeof k === 'string' && B.CELL_DEFAULTS[k] && !seen[k]) { seen[k] = 1; ok.push(k); }
      });
      for (si = B.UNLOCK_START.length - 1; si >= 0; si--) {
        if (!seen[B.UNLOCK_START[si]]) { seen[B.UNLOCK_START[si]] = 1; ok.unshift(B.UNLOCK_START[si]); }
      }
      B.unlocks = ok;
    } else {
      B.unlocks = B.UNLOCK_START.slice();
      B.cells.forEach(function(c) {
        if (!B.isUnlocked(c.key) && B.isTaught(c.key)) B.unlocks.push(c.key);
      });
    }
    if (B.learningTools) B.learning = B.learningTools.ensureState(d && d.learning, d || {});
    B.migrateUnlockReveal(d || {});
    /* Persist the marker and migrated live reveal trail immediately so the
       one-time migration cannot repeat across reloads before the next UI save. */
    if (revealNeedsMigration) B.save(storageKey);
    return true;
  } catch(e) {
    console.warn('hive:', e);
    return false;
  }
};
