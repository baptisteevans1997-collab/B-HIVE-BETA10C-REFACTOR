/* B HIVE — external leaf data (E1 pilot). Pure data tables only, no logic.
   First external JS file: proves the static deploy + service worker + offline
   PWA shell can carry an external script. Loaded before the main IIFE. */
window.BHIVE_DATA = window.BHIVE_DATA || {};

/* v60: per-caste home-wander parameters — how widely each caste roams its hex.
   ax/ay = home amplitude as fraction of maxR (X and Y differ to break circular motion).
   sBase = base wander frequency (per ms). All amplified per bee by b.b and b.p traits.
   Moved verbatim out of buildHive() in index.html at E1; values unchanged. */
window.BHIVE_DATA.WANDER = {
  'Nurse Bees':   {ax:0.32, ay:0.32, sBase:0.00020},
  'Builder Bees': {ax:0.55, ay:0.45, sBase:0.00028},
  'Forager Bees': {ax:0.65, ay:0.50, sBase:0.00036},
  'Guard Bees':   {ax:0.75, ay:0.65, sBase:0.00044},
  'Scout Bees':   {ax:0.85, ay:0.70, sBase:0.00056},
  'Drones':       {ax:0.55, ay:0.45, sBase:0.00016}
};

/* MBTI type → character-class name. Pure display lookup (read once in renderMbti()).
   Moved verbatim out of index.html at E2; values unchanged. */
window.BHIVE_DATA.MBTI_CLASS = {
  INTJ:'The Architect',INTP:'The Theorist',ENTJ:'The Commander',ENTP:'The Provoker',
  INFJ:'The Oracle',INFP:'The Dreamer',ENFJ:'The Beacon',ENFP:'The Spark',
  ISTJ:'The Sentinel',ISFJ:'The Guardian',ESTJ:'The Director',ESFJ:'The Host',
  ISTP:'The Maverick',ISFP:'The Artisan',ESTP:'The Daredevil',ESFP:'The Performer'
};

/* Screen id → display name for the navbar label. Pure UI lookup (read once in showScreen()).
   Moved verbatim out of index.html at E3; keys/labels unchanged. */
window.BHIVE_DATA.SCREEN_NAMES = {
  home:'Home', energy:'Hive Mind',
  projects:'Project Universe', strengths:'Strength System', risks:'Risk Radar',
  opportunities:'Opportunity Radar', system:'Operating System', brainmap:'Brain Map',
  summary:'Honest Read', bestiary:'The Bestiary', manual:'Field Manual',
  blueprints:'Blueprints'
};

/* Masthead clock labels: weekday + month abbreviations for the live clock.
   Moved verbatim out of the main IIFE in index.html; values unchanged.
   Outer-shell display only - not used by storage, sync, hive, bees,
   renderHive/renderWorkers, schema, or localStorage. */
window.BHIVE_DATA.DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
window.BHIVE_DATA.MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

/* Stage 2 inference themes. Terms are deliberately explicit; inference counts a
   theme only across separate days and only from the user's own words. */
window.BHIVE_DATA.INFERENCE_THEMES = [
  {id:'stress_overload',label:'Stress or overload',terms:['stress','stressed','pressure','overwhelmed','overwhelm','burnout','burned out','drained','exhausted','swamped','too much']},
  {id:'money_pressure',label:'Money pressure',terms:['money stress','money worry','debt','bills','cash flow','broke','income pressure']},
  {id:'sleep_health',label:'Sleep or health',terms:['sleep','slept','insomnia','sick','health','training','gym','body']},
  {id:'unfinished_work',label:'Unfinished work',terms:['unfinished','half done','half finished','open tabs','not finished','still sitting','backlog']},
  {id:'social_support',label:'Support from people',terms:['support','family','friend','partner','lonely','alone','relationship']},
  {id:'momentum_shipping',label:'Momentum and shipping',terms:['shipped','finished','launched','progress','moving','built','completed','done'],excludeTerms:['unfinished','not finished','half finished','not completed','not done']},
  {id:'avoidance',label:'Avoidance',terms:['avoiding','avoidance','putting off','procrastinating','dreading','dodging']},
  {id:'rest_recovery',label:'Rest and recovery',terms:['rested','resting','recovered','recovering','break','time off','downtime']}
];

/* ===== D3 PLANNING ONLY — DISPLAY-ONLY BLUEPRINT DATA ===== */
/* D3D1 (D3 expansion track). Display-only planning data inside a load-bearing file.
   Read only by the D3D2 Blueprints screen for planning display. Not mapped to the live hive.
   Neutral planning fields only — ring / slot / tier are ABSTRACT groupings,
   NOT geometry. These are NOT live HIVE_POS coordinates and NOT 600x600
   viewBox coordinates, and this block is NOT render-ready.
   Must NOT be wired into cells[], HIVE_POS, renderHive, renderWorkers,
   save/load, snapshot, nextMove, priority/priority-pulse, pan/zoom, bees,
   Queen API, Live Sync, or Supabase. Mapping any of this into the live hive
   is a SEPARATE protected architecture stage requiring its own plan, Codex
   review, phone test, and controlled ship. */
window.BHIVE_DATA.FUTURE_TOPOLOGY = {
  planningOnly: true,
  liveMappingDeferred: "protected architecture stage — needs own plan, Codex review, phone test, and controlled ship",
  note: "Design blueprint only. Read only by the D3D2 Blueprints screen for planning display. Not render-ready. Not mapped to the live hive.",
  cells: [
    { key:'mentor', label:'Mentorship', full:'Mentoring & being mentored',
      desc:'Guidance you give and seek; teaching as a way to sharpen yourself.',
      category:'aspirational', ring:'frontier', slot:1, tier:2,
      unlockIdea:'Surfaces when People and Growth both sustain high energy.',
      relatedCell:'people', notes:'Could form from a strong People + Growth pattern.' },
    { key:'legacy', label:'Legacy', full:'Legacy & the long game',
      desc:'What outlasts you; the decade-scale view of the work.',
      category:'aspirational', ring:'frontier', slot:2, tier:4,
      unlockIdea:'Unlocks late, once Identity and Freedom are well-fed.',
      relatedCell:'identity', notes:'Long-horizon aspirational cell.' },
    { key:'rest', label:'Rest', full:'Rest & recovery',
      desc:'Deliberate recovery, sleep and downtime: the counterweight to output.',
      category:'warning', ring:'inner-watch', slot:3, tier:1,
      unlockIdea:'Emerges as a watch cell if Health stays dormant across many check-ins.',
      relatedCell:'health', notes:'Neglected-pattern / leak-style cell.' },
    { key:'launch', label:'Launch', full:'Shipping & launches',
      desc:'The act of finishing and putting things into the world.',
      category:'emergent', ring:'frontier', slot:4, tier:3,
      unlockIdea:'Could split out of the Main Project once it evolves.',
      relatedCell:'lw', notes:'Specialised sub-cell of a strong parent.' },
    { key:'income', label:'Income Engines', full:'Active income engines',
      desc:'Turning effort and assets into income that is not just hours.',
      category:'emergent', ring:'frontier', slot:5, tier:3,
      unlockIdea:'Splits from Money when active income work sustains.',
      relatedCell:'money', notes:'Specialised resource cell.' },
    { key:'routines', label:'Routines', full:'Routines & operating rhythm',
      desc:'How you run yourself: the habits and rules that hold the week together.',
      category:'meta', ring:'core-adjacent', slot:6, tier:2,
      unlockIdea:'Self / operating-rhythm cell tied to the Playbook.',
      relatedCell:'growth', notes:'Meta, self-referential cell.' }
  ]
};
/* ===== END D3 PLANNING ===== */

/* First-run guide / tutorial steps. Pure display copy (read only inside the
   tour IIFE in index.html). Moved verbatim out of the tour IIFE at v84;
   text byte-unchanged. Not used by storage, sync, hive, bees, schema. */
window.BHIVE_DATA.TOUR = [
      {t:'Welcome to your Brain Map',
       d:'This is your life drawn as a living hive: fourteen cells, one for each part of who you are. It’s a mirror, not a verdict. It reflects where your energy goes, it never grades you.'},
      {t:'Read the cells',
       d:'Each cell’s frame is how much that area matters to you; its glow is the energy you actually give it. The bees inside are what the hive has learned about you there.'},
      {t:'Hive Mind is base camp',
       d:'Screen 01, Hive Mind, is the one screen you actually work. Tap any cell to read it and teach it. The other read screens are switched off in this beta.'},
      {t:'Your daily loop',
       d:'Each day: 1 Check In, 2 answer the bees or teach a cell, 3 follow the Next move on the Today card. Come back tomorrow and watch the hive shift.'},
      {t:'It learns as you teach',
       d:'Everything you teach or answer becomes a worker bee in that cell. The more you feed a cell, the more the hive holds about that part of your life.'},
      {t:'You’re ready',
       d:'Report shows what the hive currently reads in you. Stuck on a feature? The Field Manual, screen 10, explains them all. Reopen this guide any time with the ? button, or Help under More on your phone.'}
    ];
