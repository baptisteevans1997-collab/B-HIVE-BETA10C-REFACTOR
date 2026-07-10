/* B HIVE BETA — Profile check-in DATA (beta-only, pure data, no logic here).
   Loaded before the app IIFE, same house pattern as bhive-data.js.
   Nothing in this file touches app state, storage, Supabase, or the receiver.
   Edit questions/options/signals/interpretations here; the module reads it. */
window.BHIVE_BETA_PROFILE = window.BHIVE_BETA_PROFILE || {};

window.BHIVE_BETA_PROFILE.version = 'beta-profile-1';

/* Five independent operating-tendency dimensions. Not personality types, not MBTI. */
window.BHIVE_BETA_PROFILE.dimensions = [
  { key: 'rhythm',   label: 'Rhythm & energy' },
  { key: 'momentum', label: 'Momentum & follow-through' },
  { key: 'pressure', label: 'Pressure & getting unstuck' },
  { key: 'direction',label: 'Motivation & direction' },
  { key: 'support',  label: 'Support & next-move style' }
];

/* Question bank. Each option has a stable id (a/b/c/d) and namespaced signal weights.
   followUp.showIfOptionIn = option ids that trigger the conditional follow-up. */
window.BHIVE_BETA_PROFILE.questions = [
  { id: 'rhythm_1', dimension: 'rhythm', skippable: false,
    prompt: 'Think about the last time you finished a day actually feeling good, not just done. What was it mostly made of?',
    options: [
      { id: 'a', label: 'Deep, uninterrupted stretches on one thing', signals: { rhythm_focus: 2, rhythm_solo: 1 } },
      { id: 'b', label: 'Moving between people and conversations, plenty of back-and-forth', signals: { rhythm_social: 2, rhythm_variety: 1 } },
      { id: 'c', label: 'Knocking out a bunch of small, concrete tasks', signals: { rhythm_throughput: 2, rhythm_visible: 1 } },
      { id: 'd', label: 'A loose day I got to shape as it went', signals: { rhythm_autonomy: 2, rhythm_open: 1 } }
    ] },
  { id: 'rhythm_2', dimension: 'rhythm', skippable: false,
    prompt: 'And the flip side. What quietly leaves you flat, even on a day that goes fine?',
    options: [
      { id: 'a', label: 'Constant context-switching and interruptions', signals: { rhythm_focus: 2, rhythm_interrupt: 1 } },
      { id: 'b', label: "A day that was all meetings and other people's agendas", signals: { rhythm_solo: 2, rhythm_autonomy: 1 } },
      { id: 'c', label: 'Long stretches of repetitive, low-stakes work', signals: { rhythm_variety: 2, rhythm_stimulation: 1 } },
      { id: 'd', label: 'Vague, open-ended tasks with no clear edges', signals: { rhythm_structure_need: 2, rhythm_clarity: 1 } }
    ] },
  { id: 'rhythm_3', dimension: 'rhythm', skippable: true,
    prompt: 'Right now, not a normal month, how full is your plate?',
    options: [
      { id: 'a', label: 'Running near the edge, not much slack left', signals: { rhythm_load_high: 2 } },
      { id: 'b', label: 'Busy but sustainable, I could hold a little more', signals: { rhythm_load_steady: 2 } },
      { id: 'c', label: "Lighter than usual, I've got room right now", signals: { rhythm_load_open: 2 } },
      { id: 'd', label: 'Uneven, slammed some days and flat on others', signals: { rhythm_load_variable: 2 } }
    ] },

  { id: 'momentum_1', dimension: 'momentum', skippable: false,
    prompt: "You've got something you genuinely want to get moving on. What actually gets you off the starting line?",
    options: [
      { id: 'a', label: 'Just doing a rough first version and fixing it later', signals: { momentum_action: 2, momentum_iterate: 1 } },
      { id: 'b', label: 'Mapping the steps first so starting feels obvious', signals: { momentum_planning: 2, momentum_clarity: 1 } },
      { id: 'c', label: "Telling someone I'm doing it so I'm on the hook", signals: { momentum_accountability: 2, momentum_social: 1 } },
      { id: 'd', label: 'A deadline pressing, or someone moving faster than me', signals: { momentum_pressure: 2, momentum_competition: 1 } }
    ],
    followUp: { showIfOptionIn: ['c', 'd'], questionId: 'momentum_1b' } },
  { id: 'momentum_1b', dimension: 'momentum', skippable: true, conditional: true,
    prompt: "When no one's watching and there's no deadline, what happens to that same thing?",
    options: [
      { id: 'a', label: 'It still gets done, I set my own line and hit it', signals: { momentum_internal_drive: 2 } },
      { id: 'b', label: "It slows right down but doesn't die, I circle back", signals: { momentum_intermittent: 2 } },
      { id: 'c', label: 'It quietly slides until something external picks it back up', signals: { momentum_external_dependent: 2, momentum_accountability: 1 } }
    ] },
  { id: 'momentum_2', dimension: 'momentum', skippable: false,
    prompt: "You've got a few things half-done and hanging around: open tabs, started projects, that thing at 80 percent. What's your real relationship with them?",
    options: [
      { id: 'a', label: 'They pile up, starting is easy and closing out is the hard part', signals: { momentum_starter: 2, momentum_finish_gap: 1 } },
      { id: 'b', label: "Open loops sit in my head, so I push to close them even when it's not the priority", signals: { momentum_closer: 2, momentum_completion_pull: 1 } },
      { id: 'c', label: 'I keep a lot open on purpose and come back when it’s the right time', signals: { momentum_parallel: 2, momentum_open_by_design: 1 } },
      { id: 'd', label: "I let the ones that stopped mattering fall away and don't feel bad about it", signals: { momentum_pruner: 2, momentum_low_sunkcost: 1 } }
    ] },
  { id: 'momentum_3', dimension: 'momentum', skippable: false,
    prompt: "What keeps you going mid-way through something long, past the point where the novelty's worn off?",
    options: [
      { id: 'a', label: 'Seeing visible progress add up, a streak or a bar filling', signals: { momentum_visible: 2, momentum_progress: 1 } },
      { id: 'b', label: 'Ticking things off a list I can watch shrinking', signals: { momentum_checklist: 2, momentum_completion_pull: 1 } },
      { id: 'c', label: "Someone counting on it, or checking in on where it's at", signals: { momentum_accountability: 2, momentum_social: 1 } },
      { id: 'd', label: 'Reconnecting to the point of it and going again', signals: { momentum_meaning: 2, momentum_internal: 1 } }
    ] },

  { id: 'pressure_1', dimension: 'pressure', skippable: false,
    prompt: 'It’s one of those days where too much has landed at once. In the first hour, what do you actually do?',
    options: [
      { id: 'a', label: 'Grab the nearest thing and start, motion beats sitting in it', signals: { pressure_act: 2, pressure_bias_action: 1 } },
      { id: 'b', label: 'Run it through my head from every angle before I touch anything', signals: { pressure_analyze: 2, pressure_deliberate: 1 } },
      { id: 'c', label: 'Write it all down and force it into some kind of order', signals: { pressure_structure: 2, pressure_externalize: 1 } },
      { id: 'd', label: 'Step back and let the heat drop before I engage', signals: { pressure_withdraw: 2, pressure_reset_first: 1 } }
    ] },
  { id: 'pressure_2', dimension: 'pressure', skippable: false,
    prompt: "When you're genuinely stuck on something, what's usually the real reason underneath it?",
    options: [
      { id: 'a', label: "I'm not sure what done or right even looks like here", signals: { pressure_clarity_block: 2, pressure_direction: 1 } },
      { id: 'b', label: "It matters enough that I don't want to get it wrong", signals: { pressure_stakes_block: 2, pressure_perfection: 1 } },
      { id: 'c', label: "It's boring or draining and I keep sliding off it", signals: { pressure_interest_block: 2, pressure_avoidance: 1 } },
      { id: 'd', label: "Too many pieces at once and I can't find the first move", signals: { pressure_overwhelm_block: 2, pressure_entry_point: 1 } }
    ] },
  { id: 'pressure_3', dimension: 'pressure', skippable: true,
    prompt: 'After a genuinely bad day, what actually resets you, not what you think should?',
    options: [
      { id: 'a', label: 'Moving my body, a walk, a workout, something physical', signals: { pressure_reset_physical: 2 } },
      { id: 'b', label: 'Time alone with no input, to decompress my own way', signals: { pressure_reset_solitude: 2, pressure_withdraw: 1 } },
      { id: 'c', label: 'Talking it out with someone I trust', signals: { pressure_reset_social: 2, pressure_process_aloud: 1 } },
      { id: 'd', label: 'Doing one small thing right to feel back in control', signals: { pressure_reset_action: 2, pressure_bias_action: 1 } }
    ] },

  { id: 'direction_1', dimension: 'direction', skippable: false,
    prompt: 'Strip away the money and the shoulds. What actually pulls you toward work you care about?',
    options: [
      { id: 'a', label: 'Getting genuinely good at something hard', signals: { direction_mastery: 2 } },
      { id: 'b', label: 'Freedom to run my own time and calls', signals: { direction_freedom: 2, direction_autonomy: 1 } },
      { id: 'c', label: 'Building something solid and stable to stand on', signals: { direction_security: 2 } },
      { id: 'd', label: "Making something exist that wasn't there before", signals: { direction_creativity: 2 } }
    ] },
  { id: 'direction_2', dimension: 'direction', skippable: false,
    prompt: 'When you picture a win that would actually feel good, it looks more like…',
    options: [
      { id: 'a', label: 'Work that visibly helped someone or something beyond me', signals: { direction_helping: 2 } },
      { id: 'b', label: 'Being seen and respected by people whose read I care about', signals: { direction_recognition: 2, direction_external: 1 } },
      { id: 'c', label: 'Hard proof I moved the needle, numbers I can point to', signals: { direction_measurable: 2 } },
      { id: 'd', label: 'Quietly knowing I did it well, whether or not anyone noticed', signals: { direction_internal: 2, direction_mastery: 1 } }
    ] },
  { id: 'direction_3', dimension: 'direction', skippable: false,
    prompt: 'Which kind of work actually fits how your head wants to run?',
    options: [
      { id: 'a', label: 'Short, clear tasks with a defined finish line', signals: { direction_defined: 2, direction_closure: 1 } },
      { id: 'b', label: 'One big mission I can pour myself into over time', signals: { direction_mission: 2, direction_longhaul: 1 } },
      { id: 'c', label: 'A steady routine I can rely on and refine', signals: { direction_routine: 2, direction_stability: 1 } },
      { id: 'd', label: "New problems and variety, even if it's messier", signals: { direction_novelty: 2, direction_variety: 1 } }
    ] },

  { id: 'support_1', dimension: 'support', skippable: false,
    prompt: 'When you want to actually follow through on something, what setup makes it most likely to happen?',
    options: [
      { id: 'a', label: 'Left alone with it, I move best on my own', signals: { support_solo: 2, support_autonomy: 1 } },
      { id: 'b', label: 'Doing it alongside someone, even just in parallel', signals: { support_shared: 2, support_body_double: 1 } },
      { id: 'c', label: 'A hard deadline or something real on the line', signals: { support_deadline: 2, support_stakes: 1 } },
      { id: 'd', label: "A regular check-in where I report where I'm at", signals: { support_checkin: 2, support_accountability: 1 } }
    ] },
  { id: 'support_2', dimension: 'support', skippable: false,
    prompt: 'Think about the commitments to yourself that actually stick. What do they usually have in common?',
    options: [
      { id: 'a', label: "It's just me and the task, my own way, no one in the loop", signals: { support_selftrust_solo: 2, support_solo: 1 } },
      { id: 'b', label: 'The day is calm and uncluttered enough to protect it', signals: { support_selftrust_conditional: 2, support_load_sensitive: 1 } },
      { id: 'c', label: 'Someone else knows I said I’d do it', signals: { support_selftrust_external: 2, support_accountability: 1 } },
      { id: 'd', label: "I've broken it small enough that there's nothing to renegotiate", signals: { support_selftrust_scaffold: 2, support_scaffold_need: 1 } }
    ] }
];

/* Deterministic tie-break order per dimension (primary signals only). */
window.BHIVE_BETA_PROFILE.priority = {
  rhythm:   ['rhythm_focus','rhythm_social','rhythm_throughput','rhythm_autonomy','rhythm_solo','rhythm_variety','rhythm_structure_need'],
  momentum: ['momentum_action','momentum_planning','momentum_accountability','momentum_pressure','momentum_starter','momentum_closer','momentum_parallel','momentum_pruner','momentum_visible','momentum_checklist','momentum_meaning'],
  pressure: ['pressure_act','pressure_analyze','pressure_structure','pressure_withdraw','pressure_clarity_block','pressure_stakes_block','pressure_interest_block','pressure_overwhelm_block','pressure_reset_physical','pressure_reset_solitude','pressure_reset_social','pressure_reset_action'],
  direction:['direction_mastery','direction_freedom','direction_security','direction_creativity','direction_helping','direction_recognition','direction_measurable','direction_internal','direction_defined','direction_mission','direction_routine','direction_novelty'],
  support:  ['support_solo','support_shared','support_deadline','support_checkin','support_selftrust_solo','support_selftrust_conditional','support_selftrust_external','support_selftrust_scaffold']
};

/* Load axis (momentary state, never a tendency). */
window.BHIVE_BETA_PROFILE.load = ['rhythm_load_high','rhythm_load_steady','rhythm_load_open','rhythm_load_variable'];

/* Hedge phrasings. Confidence is CLEAR/LEAN/hedge — never a number or label. */
window.BHIVE_BETA_PROFILE.hedges = {
  clear: 'Your answers suggest',
  lean:  'This seems to lean toward',
  mixed: "There isn't a strong lean here",
  experiment: 'A useful experiment could be'
};

/* Fallback phrasing for a single present signal, when no combination interpretation fires.
   Each reads as a plain "you…" clause after a hedge; no labels, no scores. */
window.BHIVE_BETA_PROFILE.signalPhrase = {
  momentum_action: 'you get moving by starting rough and fixing as you go',
  momentum_planning: 'you get moving once the steps are mapped and the first move is obvious',
  momentum_accountability: 'you move most when someone else is on the hook with you',
  momentum_starter: 'starting comes easy; closing things out is the harder part for you',
  momentum_closer: 'open loops nag at you until they are closed',
  momentum_parallel: 'you keep many things open on purpose and come back when the timing is right',
  momentum_pruner: 'you let things that stopped mattering fall away without guilt',
  momentum_visible: 'you keep going when progress is visible and adds up',
  momentum_checklist: 'a shrinking list is what keeps you moving',
  momentum_meaning: 'reconnecting to the point of it is what carries you through the long middle',
  pressure_act: 'under pressure you get unstuck by moving, not by sitting in it',
  pressure_analyze: 'under pressure you think it through from every angle before acting',
  pressure_structure: 'under pressure you find order by getting it all written down',
  pressure_withdraw: 'under pressure you do better after stepping back and letting the heat drop',
  pressure_clarity_block: 'you tend to stall when it is not clear what done looks like',
  pressure_stakes_block: 'you tend to stall most on the things that matter most',
  pressure_interest_block: 'you slide off tasks that are boring or draining',
  pressure_overwhelm_block: 'you stall when there are too many pieces to find the first move',
  direction_mastery: 'you are pulled by getting genuinely good at something',
  direction_freedom: 'you are pulled by freedom over your own time and calls',
  direction_creativity: 'you are pulled by making things that were not there before',
  direction_security: 'you are pulled by building something solid to stand on',
  direction_helping: 'a real win for you is work that visibly helps someone beyond yourself',
  direction_measurable: 'a real win for you looks like visible, countable progress',
  direction_recognition: 'a real win for you is being seen and respected by people you respect',
  direction_novelty: 'you fit new problems and variety more than routine',
  direction_routine: 'you fit a steady, reliable routine you can refine',
  support_solo: 'you follow through best left alone with it',
  support_shared: 'you follow through better doing it alongside someone',
  support_deadline: 'a hard deadline is what makes follow-through actually happen for you',
  support_checkin: 'a regular check-in is what makes follow-through actually happen for you',
  support_selftrust_scaffold: 'your commitments stick when the task is already broken small',
  rhythm_focus: 'you run on deep, uninterrupted focus',
  rhythm_social: 'you run on back-and-forth with people',
  rhythm_throughput: 'you run on clearing a stack of small, concrete tasks',
  rhythm_autonomy: 'you run best on days you get to shape yourself'
};

/* Interpretation table: fires on combinations of PRESENT signals (an option carrying
   `all` = every listed condition must be dominant. A condition is "dim:signal" or
   "dim:sigA|sigB" (either). `load` (optional) requires that load state. */
window.BHIVE_BETA_PROFILE.interpretations = [
  { id: 'starter_stuck',
    all: ['momentum:momentum_starter', 'pressure:pressure_clarity_block|pressure_overwhelm_block'],
    read: 'starting is rarely your problem — finishing, and finding the first move under a pile, is. The stall tends to be too many pieces or unclear edges, not a lack of drive.',
    experiment: 'when you add a task, make its title the literal first physical action (“open the doc,” not “the report”). Try it on three stuck items this week and see which ones move.' },
  { id: 'visible_measurable',
    all: ['momentum:momentum_visible|momentum_checklist', 'direction:direction_measurable'],
    read: 'you run on seeing the needle move — both what keeps you going mid-task and what a real win looks like are the same shape: visible, countable progress.',
    experiment: 'turning one vague goal into a cell with a filling progress bar or a number that ticks up, and checking whether the visible version pulls you back more than the abstract one did.' },
  { id: 'think_by_moving',
    all: ['momentum:momentum_action', 'pressure:pressure_act'],
    read: 'you may think by moving — you start rough and, under pressure, motion is how you get unstuck. That’s a strength, though it can mean starting before the problem’s clear.',
    experiment: 'spending five minutes writing the one outcome that matters before a big start, then moving — keeping the momentum without the occasional redo.' },
  { id: 'external_ignition',
    all: ['momentum:momentum_external_dependent|momentum_accountability', 'support:support_checkin|support_selftrust_external'],
    read: 'external presence is doing a lot of your follow-through — things move when someone’s on the hook, and slide when no one is. That’s a setup detail, not a character flaw.',
    experiment: 'a standing check-in at a fixed time (even a self-report you send nowhere), so the “someone knows” feeling is built in rather than borrowed.' },
  { id: 'solo_deep',
    all: ['support:support_selftrust_solo|support_solo', 'rhythm:rhythm_focus|rhythm_solo'],
    read: 'you do your most trustworthy work alone and heads-down — commitments stick when it’s just you and the task. Shared or check-in setups may actually cost you here.',
    experiment: 'protecting one uninterrupted solo block and judging follow-through by whether the block held, not by external nudges.' },
  { id: 'reset_vs_load',
    all: ['pressure:pressure_withdraw|pressure_reset_solitude'], load: 'rhythm_load_high',
    read: "you're near your edge right now, and your natural reset is stepping back and getting quiet — exactly the thing a full plate crowds out first. The mismatch, not the load alone, is likely what’s biting.",
    experiment: 'scheduling the reset like a task: one protected low-input window before the day fills.' },
  { id: 'boredom_stall',
    all: ['pressure:pressure_interest_block', 'direction:direction_novelty|direction_variety'],
    read: "the things that stick you are usually the boring ones, and you're wired for novelty. So “stuck” here often reads as under-stimulated, not incapable.",
    experiment: 'deliberately changing a task’s shape — pair it with something you like, race a timer, reframe it as an experiment — and seeing if novelty moves it where willpower didn’t.' },
  { id: 'internally_refereed',
    all: ['direction:direction_mastery|direction_internal', 'momentum:momentum_meaning'],
    read: 'you may be internally refereed — what keeps you going long-haul is reconnecting to the point of it, and a win feels good even if no one claps. Streaks and recognition probably do less for you than for others.',
    experiment: 'writing a one-line “why this matters to me” at the top of a long cell and re-reading it at the mid-point where things usually sag.' },
  { id: 'scaffold_small',
    all: ['support:support_selftrust_scaffold', 'pressure:pressure_overwhelm_block'],
    read: 'your commitments stick when there’s nothing left to renegotiate — when the task is already broken small. Big undivided tasks are where the overwhelm and the slippage show up.',
    experiment: 'a rule that nothing enters bigger than a 20-minute chunk — if it is, it gets split first — for one week.' },
  { id: 'many_open_novelty',
    all: ['momentum:momentum_parallel|momentum_pruner', 'direction:direction_novelty'],
    read: 'you run many things at once on purpose and let dead ones go without guilt, paired with a pull toward novelty. A legitimate style; the risk isn’t messiness, it’s losing the one thread that mattered in the shuffle.',
    experiment: 'keeping the many-open style but pinning exactly one “this is the one that matters right now” cell at the top.' }
];

/* How a dominant momentum + support signal shapes the single suggested next move. */
window.BHIVE_BETA_PROFILE.nextMove = {
  momentum_action:'Try a rough “version zero” of your next task, timeboxed — start messy, fix later.',
  momentum_planning:'Start with a 3-step outline of your next task before doing anything.',
  momentum_visible:'Give your next task a visible progress bar or a number that ticks up.',
  momentum_checklist:'Break your next task into a short checklist you can watch shrink.',
  momentum_accountability:'Tell one person your next move, or set a check-in on it.',
  momentum_meaning:'Pin a one-line “why this matters” to your next task and re-read it at the halfway point.',
  momentum_starter:'For your next task, define what “done” looks like before you start it.',
  momentum_parallel:'Pin one “this is the one that matters” task above the rest today.',
  _default:'Pick one small thing you can make visibly done today, and start there.'
};
