/* B HIVE - compact Today experiment rendering (Stage 4) */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var FIRST_FLIGHT_LABELS={lw:'Life & Work',health:'Health',people:'People'};
  var FIRST_FLIGHT_COMB_DOMAINS=[
    {key:'lw',label:'Main Project',signature:'keystone',crest:
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-primary" points="-5,-6 5,-6 3,-1 -3,-1"/>'+
      '<line class="ff-comb-crest-stroke ff-comb-crest-secondary" x1="-7" y1="2" x2="7" y2="2"/>'},
    {key:'free',label:'Freedom',signature:'open-gate',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M-6 -5 V5 M6 -5 V5 M-6 -5 H6"/>'},
    {key:'craft',label:'Craft',signature:'facet-snap',crest:
      '<line class="ff-comb-crest-stroke ff-comb-crest-primary" x1="0" y1="0" x2="0" y2="-8"/>'+
      '<line class="ff-comb-crest-stroke ff-comb-crest-secondary" x1="0" y1="0" x2="7" y2="5"/>'+
      '<line class="ff-comb-crest-stroke ff-comb-crest-bridge" x1="0" y1="0" x2="-7" y2="5"/>'},
    {key:'money',label:'Money',signature:'store-caps',crest:
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-primary" points="-6.5,-3 -4.5,-6.5 -0.5,-6.5 1.5,-3 -0.5,0.5 -4.5,0.5"/>'+
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-secondary" points="-1.5,4 0.5,0.5 4.5,0.5 6.5,4 4.5,7.5 0.5,7.5"/>'},
    {key:'career',label:'Career',signature:'level-course',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M-7 -2 H7 M-7 3 H7"/>'},
    {key:'growth',label:'Growth',signature:'inner-ring',crest:
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-primary" points="-8,0 -4,-6.9 4,-6.9 8,0 4,6.9 -4,6.9"/>'+
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-secondary" points="-4,0 -2,-3.5 2,-3.5 4,0 2,3.5 -2,3.5"/>'},
    {key:'finance',label:'Next Path',signature:'fork-choice',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M0 7 V0 L-5 -6"/>'+
      '<path class="ff-comb-crest-stroke ff-comb-crest-secondary" d="M0 0 L5 -6"/>'},
    {key:'health',label:'Health',signature:'living-pulse',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M-8 0 H-3 L-1 -5 L2 6 L4 0 H8"/>'},
    {key:'people',label:'People',signature:'linked-points',crest:
      '<circle class="ff-comb-crest-stroke ff-comb-crest-primary" cx="-4" cy="0" r="2"/>'+
      '<circle class="ff-comb-crest-stroke ff-comb-crest-secondary" cx="4" cy="0" r="2"/>'+
      '<path class="ff-comb-crest-stroke ff-comb-crest-bridge" d="M-2 0 H2"/>'},
    {key:'identity',label:'Identity',signature:'mirror-axis',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M0 7 V-4"/>'+
      '<circle class="ff-comb-crest-stroke ff-comb-crest-secondary" cx="0" cy="-7" r="1.8"/>'},
    {key:'clients',label:'Client Work',signature:'handoff',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M-2 -7 L-7 -4 V4 L-2 7 M2 -7 L7 -4 V4 L2 7"/>'+
      '<path class="ff-comb-crest-stroke ff-comb-crest-secondary" d="M0 -6 V6"/>'},
    {key:'ink',label:'Play',signature:'loose-loop',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M-6 3 C-6 -6 6 -8 5 0 C4.4 4 0 6 -2 4"/>'},
    {key:'side',label:'Side Builds',signature:'annex-dock',crest:
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-primary" points="-9,0 -5.5,-6 1.5,-6 5,0 1.5,6 -5.5,6"/>'+
      '<polygon class="ff-comb-crest-stroke ff-comb-crest-secondary" points="5,0 6.75,-3 10.25,-3 12,0 10.25,3 6.75,3"/>'},
    {key:'recruit',label:'New Ideas',signature:'bench-row',crest:
      '<path class="ff-comb-crest-stroke ff-comb-crest-primary" d="M-8 0 H-4 M-2 0 H2 M4 0 H8"/>'}
  ];
  var FIRST_FLIGHT_COMB_DOMAIN_MAP={};
  FIRST_FLIGHT_COMB_DOMAINS.forEach(function(domain){
    FIRST_FLIGHT_COMB_DOMAIN_MAP[domain.key]=domain;
    if(typeof Object.freeze==='function')Object.freeze(domain);
  });
  if(typeof Object.freeze==='function'){
    Object.freeze(FIRST_FLIGHT_COMB_DOMAINS);
    Object.freeze(FIRST_FLIGHT_COMB_DOMAIN_MAP);
  }
  var FIRST_FLIGHT_COMB_TIMELINES={
    awakened:{stable:5200,watchdog:6200,events:[
      {phase:'hush',at:0},{phase:'skip',at:100},{phase:'target',at:220},
      {phase:'launch',at:280},{phase:'flight',at:350},{phase:'impact',at:1050},
      {phase:'impact-label',at:1130},{phase:'supply',at:1330},
      {phase:'impact-clear',at:1500},{phase:'construct',at:1750},
      {phase:'lock',at:3030},{phase:'delivery',at:3120},
      {phase:'memory-one',at:3210},{phase:'memory-two',at:3630},
      {phase:'crest',at:4050},{phase:'signature',at:4320},
      {phase:'register',at:4700},{phase:'enter',at:5010},
      {phase:'settled',at:5200}
    ]},
    no_unlock:{stable:3500,watchdog:4300,events:[
      {phase:'hush',at:0},{phase:'skip',at:100},{phase:'target',at:220},
      {phase:'launch',at:280},{phase:'flight',at:350},{phase:'impact',at:1050},
      {phase:'impact-label',at:1130},{phase:'register',at:1330},
      {phase:'impact-clear',at:1500},{phase:'receipts',at:1700},
      {phase:'memory-one',at:2100},{phase:'memory-two',at:2520},
      {phase:'enter',at:3000},{phase:'settled',at:3500}
    ]}
  };

  function esc(value){
    if(B.esc)return B.esc(value);
    return String(value===undefined?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }
  function safeId(value){return String(value||'experiment').replace(/[^a-zA-Z0-9_-]+/g,'-');}
  function dateLabel(ts){
    var d=new Date(ts);
    return isNaN(d.getTime())?'Date unavailable':d.getDate()+' '+MONTHS[d.getMonth()];
  }
  function matches(button,experiment){
    return !!(button&&experiment&&button.getAttribute('data-experiment-id')===experiment.experimentId);
  }
  function actionBlock(experiment){
    return '<p class="td-exp-action">'+esc(experiment.action)+'</p>'+
      '<p class="td-exp-done"><span>Done when</span>'+esc(experiment.measure)+'</p>';
  }
  function renderProposal(experiment){
    if(!experiment)return '';
    var id=safeId(experiment.experimentId),editorId='td-exp-editor-'+id;
    return '<section class="td-experiment td-exp-proposal" tabindex="-1" aria-labelledby="td-exp-title-'+id+'">'+
      '<div class="td-exp-head">'+
        '<span class="td-exp-k" id="td-exp-title-'+id+'">Small experiment</span>'+
        '<span class="td-exp-time">'+experiment.durationDays+' day'+(experiment.durationDays===1?'':'s')+'</span>'+
      '</div>'+
      '<p class="td-exp-source">'+(experiment.memoryGuidance&&experiment.memoryGuidance.length?
        (experiment.sourceVerdict==='partly'?
          'Built from the part of the read that held and memory you reviewed.':
          'Built from the read you confirmed and memory you reviewed.'):
        (experiment.sourceVerdict==='partly'?'Built from the part of the read that held.':'Built from the read you confirmed.'))+'</p>'+
      actionBlock(experiment)+
      '<div class="td-exp-actions" role="group" aria-label="Choose this experiment">'+
        '<button class="td-exp-btn td-exp-accept" type="button" data-experiment-id="'+esc(experiment.experimentId)+'">Try it</button>'+
        '<button class="td-exp-btn td-exp-edit" type="button" aria-expanded="false" aria-controls="'+editorId+'" data-experiment-id="'+esc(experiment.experimentId)+'">Edit</button>'+
        '<button class="td-exp-btn td-exp-decline" type="button" data-experiment-id="'+esc(experiment.experimentId)+'">Not now</button>'+
      '</div>'+
      '<div class="td-exp-editor" id="'+editorId+'" hidden data-experiment-id="'+esc(experiment.experimentId)+'">'+
        '<label for="td-exp-action-'+id+'">Action</label>'+
        '<textarea id="td-exp-action-'+id+'" class="td-exp-input" data-exp-field="action" minlength="3" maxlength="180" rows="2" required>'+esc(experiment.action)+'</textarea>'+
        '<label for="td-exp-measure-'+id+'">Done when</label>'+
        '<textarea id="td-exp-measure-'+id+'" class="td-exp-input" data-exp-field="measure" minlength="3" maxlength="180" rows="2" required>'+esc(experiment.measure)+'</textarea>'+
        '<div class="td-exp-editor-actions">'+
          '<button class="td-exp-btn td-exp-edit-save" type="button" data-experiment-id="'+esc(experiment.experimentId)+'">Use edited version</button>'+
          '<button class="td-exp-btn td-exp-edit-cancel" type="button" data-experiment-id="'+esc(experiment.experimentId)+'">Cancel</button>'+
        '</div>'+
      '</div>'+
    '</section>';
  }
  function outcomeButtons(experiment,hidden,id){
    return '<div class="td-exp-outcomes" id="'+id+'" role="group" aria-label="Did this experiment help?"'+(hidden?' hidden':'')+'>'+
      '<span class="td-exp-question">Did it help?</span>'+
      '<button class="td-exp-btn td-exp-outcome" type="button" data-outcome="helped" data-experiment-id="'+esc(experiment.experimentId)+'">Yes</button>'+
      '<button class="td-exp-btn td-exp-outcome" type="button" data-outcome="partly" data-experiment-id="'+esc(experiment.experimentId)+'">A little</button>'+
      '<button class="td-exp-btn td-exp-outcome" type="button" data-outcome="no_change" data-experiment-id="'+esc(experiment.experimentId)+'">No change</button>'+
      '<button class="td-exp-btn td-exp-outcome" type="button" data-outcome="made_worse" data-experiment-id="'+esc(experiment.experimentId)+'">Made it worse</button>'+
    '</div>';
  }
  function renderActive(experiment,now){
    if(!experiment)return '';
    var id=safeId(experiment.experimentId),outcomesId='td-exp-outcomes-'+id;
    var due=typeof now==='number'&&now>=experiment.dueAt;
    return '<section class="td-experiment td-exp-active" tabindex="-1" aria-labelledby="td-exp-title-'+id+'">'+
      '<div class="td-exp-head">'+
        '<span class="td-exp-k" id="td-exp-title-'+id+'">'+(due?'Experiment check-in':'Experiment running')+'</span>'+
        '<span class="td-exp-time">Due '+esc(dateLabel(experiment.dueAt))+'</span>'+
      '</div>'+
      actionBlock(experiment)+
      (due?'<p class="td-exp-state">The timebox is up. Log what actually happened.</p>':
        '<p class="td-exp-state">Hive tended for today. Report the result when you have enough evidence.</p>')+
      '<div class="td-exp-actions">'+
        (due?'':'<button class="td-exp-btn td-exp-report" type="button" aria-expanded="false" aria-controls="'+outcomesId+'" data-experiment-id="'+esc(experiment.experimentId)+'">Report result</button>')+
        '<button class="td-exp-btn td-exp-decline" type="button" data-experiment-id="'+esc(experiment.experimentId)+'">Stop</button>'+
      '</div>'+
      outcomeButtons(experiment,!due,outcomesId)+
    '</section>';
  }
  function renderClosed(event){
    var payload=event&&event.payload||{},outcome=payload.outcome;
    var messages={
      helped:'Useful. The Hive will favour this kind of move when similar evidence returns.',
      partly:'Mixed result logged. The Hive will keep this kind of move tentative.',
      no_change:'No change logged. The Hive will lower this kind of move for similar evidence.',
      made_worse:'Stopped and learned. The Hive will avoid favouring this kind of move for similar evidence.'
    };
    var text=event&&event.type==='experiment_declined'?
      (payload.reason==='stopped'?'Experiment stopped. The rest of your Today flow is open again.':'Passed for now. The rest of your Today flow is open.'):
      (messages[outcome]||'Experiment outcome logged.');
    return '<div class="td-experiment-closed" tabindex="-1"><span>Experiment logged</span>'+esc(text)+'</div>';
  }
  function firstFlightStatus(state){
    if(!state)return '';
    if(state.status==='available')return 'Choose one foundation cell to begin.';
    if(state.status==='cell_selected')return 'Question 1 of 2.';
    if(state.status==='first_answer_recorded')return 'Question 2 of 2.';
    if(state.status==='mission_ready')return 'Your two answers are safely staged.';
    if(state.status==='mission_active')return 'First Mission in progress.';
    return '';
  }
  function firstFlightMissionForState(state){
    if(!state||(state.status!=='mission_ready'&&state.status!=='mission_active')||
       !state.mission||!Array.isArray(state.answers)||state.answers.length!==2||
       !B.experiments||typeof B.experiments.firstFlightMission!=='function'||
       typeof B.experiments.isFirstFlight!=='function')return null;
    var mission=B.experiments.firstFlightMission(
      state.cellKey,state.answers,state.mission.createdAt);
    if(!mission||!B.experiments.isFirstFlight(mission))return null;
    try{return JSON.stringify(mission)===JSON.stringify(state.mission)?mission:null;}
    catch(e){return null;}
  }
  function firstFlightCompletionMission(state){
    if(!state||state.status!=='mission_active'||
       typeof state.selectedEventId!=='string'||!state.selectedEventId||
       typeof state.acceptedEventId!=='string'||!state.acceptedEventId||
       !Array.isArray(state.answerEventIds)||state.answerEventIds.length!==2||
       typeof state.answerEventIds[0]!=='string'||!state.answerEventIds[0]||
       typeof state.answerEventIds[1]!=='string'||!state.answerEventIds[1]||
       state.answerEventIds[0]===state.answerEventIds[1])return null;
    var mission=firstFlightMissionForState(state);
    if(!mission||!Array.isArray(mission.evidenceEventIds)||
       mission.evidenceEventIds.length!==2||
       mission.evidenceEventIds[0]!==state.answerEventIds[0]||
       mission.evidenceEventIds[1]!==state.answerEventIds[1])return null;
    return mission;
  }
  function renderFirstFlight(state){
    if(!state||!B.experiments||!B.experiments.FIRST_FLIGHT)return '';
    var status=state.status,cell=state.cellKey&&B.experiments.FIRST_FLIGHT[state.cellKey];
    var label=FIRST_FLIGHT_LABELS[state.cellKey]||'',questionNumber,question,inputId,mission;
    var head='<div class="ff-k">Queen <span aria-hidden="true">&middot;</span> First Flight</div>';
    var live='<div class="ff-status" id="ff-status" role="status" aria-live="polite" aria-atomic="true">'+
      esc(firstFlightStatus(state))+'</div>';
    if(status==='available'){
      return '<section class="ff-card" data-first-flight data-first-flight-state="available" tabindex="-1" aria-labelledby="ff-title">'+
        head+'<h2 class="ff-title" id="ff-title">What needs your attention most right now?</h2>'+
        '<p class="ff-intro">Choose the foundation cell that feels most important today.</p>'+
        '<div class="ff-choices" role="group" aria-label="Choose what needs your attention most">'+
          '<button class="ff-cell-choice" type="button" data-cell-key="lw">Life &amp; Work</button>'+
          '<button class="ff-cell-choice" type="button" data-cell-key="health">Health</button>'+
          '<button class="ff-cell-choice" type="button" data-cell-key="people">People</button>'+
        '</div>'+live+
      '</section>';
    }
    if((status==='cell_selected'||status==='first_answer_recorded')&&cell){
      questionNumber=status==='cell_selected'?1:2;
      question=cell.questions[questionNumber-1];
      inputId='ff-answer-'+state.cellKey+'-'+questionNumber;
      return '<section class="ff-card" data-first-flight data-first-flight-state="'+esc(status)+
        '" tabindex="-1" aria-labelledby="ff-title">'+
        head+'<div class="ff-cell-label">'+esc(label)+'</div>'+
        '<form class="ff-form" data-cell-key="'+esc(state.cellKey)+'" data-question="'+questionNumber+'">'+
          '<label class="ff-title ff-question" id="ff-title" for="'+inputId+'">'+esc(question)+'</label>'+
          '<textarea class="ff-answer" id="'+inputId+'" rows="3" maxlength="280" required '+
            'aria-describedby="ff-counter ff-status" autocomplete="off"></textarea>'+
          '<div class="ff-field-meta"><span>One honest, specific answer is enough.</span>'+
            '<output class="ff-counter" id="ff-counter" for="'+inputId+'">0 / 280</output></div>'+
          '<button class="ff-submit" type="submit">Continue</button>'+
        '</form>'+live+
      '</section>';
    }
    mission=status==='mission_active'?
      firstFlightCompletionMission(state):firstFlightMissionForState(state);
    if(status==='mission_ready'&&mission){
      return '<section class="ff-card ff-mission-ready" data-first-flight data-first-flight-state="mission_ready" '+
        'tabindex="-1" aria-labelledby="ff-title">'+
        head+'<h2 class="ff-title" id="ff-title">Your First Mission is ready.</h2>'+
        '<div class="ff-mission" aria-label="First Mission ready">'+
          '<div class="ff-mission-k">First Mission</div>'+
          '<h3>'+esc(mission.title)+'</h3>'+
          '<p class="ff-mission-action">'+esc(mission.action)+'</p>'+
        '</div>'+
        '<p class="ff-readonly">Nothing has started yet. Your mission is ready to review.</p>'+
        '<button class="ff-begin" type="button">Begin First Mission</button>'+live+
      '</section>';
    }
    if(status==='mission_active'&&mission){
      return '<section class="ff-card ff-mission-active" data-first-flight data-first-flight-state="mission_active" '+
        'tabindex="-1" aria-labelledby="ff-title">'+
        head+'<h2 class="ff-title" id="ff-title">Your First Mission is active.</h2>'+
        '<div class="ff-mission" aria-label="First Mission in progress">'+
          '<div class="ff-mission-k">First Mission</div>'+
          '<div class="ff-progress">In progress</div>'+
          '<h3>'+esc(mission.title)+'</h3>'+
          '<p class="ff-mission-action">'+esc(mission.action)+'</p>'+
        '</div>'+
        '<p class="ff-readonly">Complete it here when you have taken the step.</p>'+
        '<button class="ff-complete" type="button" aria-describedby="ff-status">Complete First Mission</button>'+live+
      '</section>';
    }
    return '';
  }
  function firstFlightExcerpt(value){
    if(typeof value!=='string')return '';
    var collapsed=value.replace(/\s+/g,' ').trim();
    var points=Array.from(collapsed);
    return points.length>80?points.slice(0,79).join('')+'\u2026':collapsed;
  }
  function firstFlightCombDomain(key){
    var domain=FIRST_FLIGHT_COMB_DOMAIN_MAP[key];
    return domain?{key:domain.key,label:domain.label,signature:domain.signature,crest:domain.crest}:null;
  }
  function firstFlightCombDomains(){
    return FIRST_FLIGHT_COMB_DOMAINS.map(function(domain){return firstFlightCombDomain(domain.key);});
  }
  function firstFlightCombTimeline(unlocked){
    var source=unlocked?FIRST_FLIGHT_COMB_TIMELINES.awakened:FIRST_FLIGHT_COMB_TIMELINES.no_unlock;
    return {
      variant:unlocked?'awakened':'no-unlock',
      stable:source.stable,
      watchdog:source.watchdog,
      events:source.events.slice().sort(function(a,b){return a.at-b.at;}).map(function(event){
        return {phase:event.phase,at:event.at};
      })
    };
  }
  function firstFlightCombNumber(value){
    return typeof value==='number'&&isFinite(value)?Math.round(value*100)/100:null;
  }
  function firstFlightCombBound(value,min,max){
    if(max<min)return (min+max)/2;
    return Math.max(min,Math.min(max,value));
  }
  function firstFlightCombBee(){
    return '<svg viewBox="-12 -10 24 20" focusable="false" aria-hidden="true">'+
      '<ellipse class="ff-comb-bee-wing" cx="-3.5" cy="-3.2" rx="4.2" ry="2.2"/>'+
      '<ellipse class="ff-comb-bee-wing" cx="3.5" cy="-3.2" rx="4.2" ry="2.2"/>'+
      '<ellipse class="ff-comb-bee-body" cx="0" cy="1" rx="3.5" ry="5.5"/>'+
      '<path class="ff-comb-bee-stripe" d="M-3 0 H3 M-3.2 3 H3.2"/>'+
      '<path class="ff-comb-bee-antenna" d="M-1.6 -4.2 L-4 -7 M1.6 -4.2 L4 -7"/>'+
    '</svg>';
  }
  function firstFlightCombHexPoints(radius){
    var h=radius*0.8660254;
    return (-radius)+',0 '+(-radius/2)+','+(-h)+' '+(radius/2)+','+(-h)+' '+
      radius+',0 '+(radius/2)+','+h+' '+(-radius/2)+','+h;
  }
  function firstFlightCombHexEdgeVector(dx,dy,radius){
    var length=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/length,uy=dy/length;
    var scale=0.8660254*radius/Math.max(Math.abs(uy),
      Math.abs(0.8660254*ux+0.5*uy),Math.abs(0.8660254*ux-0.5*uy));
    return {x:ux*scale,y:uy*scale,ux:ux,uy:uy};
  }
  function renderFirstFlightCombCeremony(model,geometry,summaryHTML){
    var unlocked=model&&model.unlocked,domain=unlocked&&firstFlightCombDomain(model.unlocked.cellKey);
    var chosenDomain=model&&firstFlightCombDomain(model.cellKey);
    var expectedSummary=model&&renderFirstFlightRewardSummary(model);
    var variant=unlocked?'awakened':'no-unlock',values={},required=[
      'width','height','coreX','coreY','flightStartX','flightStartY',
      'chosenX','chosenY','flightControlX','flightControlY'
    ];
    if(!model||typeof model!=='object'||Array.isArray(model)||
       typeof model.cellKey!=='string'||!FIRST_FLIGHT_LABELS[model.cellKey]||!chosenDomain||
       typeof model.cellLabel!=='string'||
       model.cellLabel.replace(/\s+/g,' ').trim()!==chosenDomain.label||
       (unlocked!==null&&(!unlocked||typeof unlocked!=='object'||Array.isArray(unlocked)))||
       (unlocked&&(!domain||typeof unlocked.label!=='string'||
         unlocked.label.replace(/\s+/g,' ').trim()!==domain.label))||
       !geometry||typeof geometry!=='object'||Array.isArray(geometry)||
       !expectedSummary||typeof summaryHTML!=='string'||summaryHTML!==expectedSummary)return '';
    if(unlocked)required=required.concat(['targetX','targetY']);
    for(var i=0;i<required.length;i++){
      values[required[i]]=firstFlightCombNumber(geometry[required[i]]);
      if(values[required[i]]===null)return '';
    }
    if(values.width<1||values.height<1)return '';
    var chosenDx=values.chosenX-values.flightStartX;
    var chosenDy=values.chosenY-values.flightStartY;
    var flight='M '+values.flightStartX+' '+values.flightStartY+' Q '+values.flightControlX+' '+
      values.flightControlY+' '+values.chosenX+' '+values.chosenY;
    var supply='',supplyDx=0,supplyDy=0,supplyLength=0,beadDx=0,beadDy=0;
    var supplyStartX=0,supplyStartY=0,supplyEndX=0,supplyEndY=0;
    var dockX=0,dockY=0,dockViewX=0,dockViewY=0,deliveryDx=0,deliveryDy=0;
    var notch='',mobile=values.width<=430;
    if(unlocked){
      supplyDx=values.targetX-values.chosenX;
      supplyDy=values.targetY-values.chosenY;
      supplyLength=Math.sqrt(supplyDx*supplyDx+supplyDy*supplyDy)||1;
      var ux=supplyDx/supplyLength,uy=supplyDy/supplyLength;
      var chosenEdge=firstFlightCombHexEdgeVector(supplyDx,supplyDy,mobile?32*82/96:32);
      var dockEdge=firstFlightCombHexEdgeVector(-supplyDx,-supplyDy,mobile?40*82/100:40*96/100);
      var dockView=firstFlightCombHexEdgeVector(-supplyDx,-supplyDy,40);
      supplyStartX=firstFlightCombBound(values.chosenX+chosenEdge.x,16,values.width-16);
      supplyStartY=firstFlightCombBound(values.chosenY+chosenEdge.y,16,values.height-16);
      supplyEndX=firstFlightCombBound(values.targetX+dockEdge.x,16,values.width-16);
      supplyEndY=firstFlightCombBound(values.targetY+dockEdge.y,16,values.height-16);
      dockX=dockEdge.x;dockY=dockEdge.y;dockViewX=dockView.x;dockViewY=dockView.y;
      deliveryDx=supplyEndX-supplyStartX;deliveryDy=supplyEndY-supplyStartY;
      beadDx=supplyEndX-supplyStartX;beadDy=supplyEndY-supplyStartY;
      supply='M '+firstFlightCombNumber(supplyStartX)+' '+
        firstFlightCombNumber(supplyStartY)+' L '+
        firstFlightCombNumber(supplyEndX)+' '+firstFlightCombNumber(supplyEndY);
      notch='M '+firstFlightCombNumber(dockViewX-dockView.ux-dockView.uy*2)+' '+
        firstFlightCombNumber(dockViewY-dockView.uy+dockView.ux*2)+' L '+
        firstFlightCombNumber(dockViewX+dockView.ux*3)+' '+
        firstFlightCombNumber(dockViewY+dockView.uy*3)+' L '+
        firstFlightCombNumber(dockViewX-dockView.ux+dockView.uy*2)+' '+
        firstFlightCombNumber(dockViewY-dockView.uy-dockView.ux*2);
    }
    var impactWidth=Math.min(250,Math.max(0,values.width-32));
    var impactLeft=firstFlightCombBound(values.chosenX-impactWidth/2,16,
      values.width-16-impactWidth);
    var impactTop=firstFlightCombBound(values.chosenY+43,16,values.height-32);
    var dockLength=Math.sqrt(dockX*dockX+dockY*dockY)||1;
    var style='--ff-comb-core-x:'+values.coreX+'px;--ff-comb-core-y:'+values.coreY+'px;'+
      '--ff-comb-flight-start-x:'+values.flightStartX+'px;'+
      '--ff-comb-flight-start-y:'+values.flightStartY+'px;'+
      '--ff-comb-chosen-x:'+values.chosenX+'px;--ff-comb-chosen-y:'+values.chosenY+'px;'+
      '--ff-comb-flight-x:'+chosenDx+'px;--ff-comb-flight-y:'+chosenDy+'px;'+
      '--ff-comb-impact-left:'+firstFlightCombNumber(impactLeft)+'px;'+
      '--ff-comb-impact-top:'+firstFlightCombNumber(impactTop)+'px;'+
      "--ff-comb-flight-path:path('"+flight+"');"+
      (unlocked?'--ff-comb-target-x:'+values.targetX+'px;--ff-comb-target-y:'+values.targetY+'px;'+
        '--ff-comb-supply-x:'+supplyDx+'px;--ff-comb-supply-y:'+supplyDy+'px;'+
        '--ff-comb-bead-x:'+firstFlightCombNumber(beadDx)+'px;'+
        '--ff-comb-bead-y:'+firstFlightCombNumber(beadDy)+'px;'+
        '--ff-comb-delivery-x:'+firstFlightCombNumber(deliveryDx)+'px;'+
        '--ff-comb-delivery-y:'+firstFlightCombNumber(deliveryDy)+'px;'+
        '--ff-comb-dock-x:'+firstFlightCombNumber(dockX)+'px;'+
        '--ff-comb-dock-y:'+firstFlightCombNumber(dockY)+'px;'+
        '--ff-comb-dip-x:'+firstFlightCombNumber(dockX/dockLength*4)+'px;'+
        '--ff-comb-dip-y:'+firstFlightCombNumber(dockY/dockLength*4)+'px;'+
        '--ff-comb-build-mid-y:'+(mobile?41:48)+'px;':'');
    var target=unlocked?'<div class="ff-comb-build ff-comb-domain-'+domain.key+'" '+
        'data-comb-domain="'+domain.key+'" data-comb-signature="'+domain.signature+'">'+
      '<svg viewBox="-50 -50 100 100" focusable="false" aria-hidden="true">'+
        '<polygon class="ff-comb-lock-ring" points="'+firstFlightCombHexPoints(41)+'"/>'+
        '<polygon class="ff-comb-wax" points="'+firstFlightCombHexPoints(34)+'"/>'+
        '<g class="ff-comb-walls">'+
          '<line class="ff-comb-wall ff-comb-wall-1" x1="-20" y1="34.6" x2="20" y2="34.6"/>'+
          '<line class="ff-comb-wall ff-comb-wall-2" x1="-40" y1="0" x2="-20" y2="34.6"/>'+
          '<line class="ff-comb-wall ff-comb-wall-3" x1="20" y1="34.6" x2="40" y2="0"/>'+
          '<line class="ff-comb-wall ff-comb-wall-4" x1="-20" y1="-34.6" x2="-40" y2="0"/>'+
          '<line class="ff-comb-wall ff-comb-wall-5" x1="40" y1="0" x2="20" y2="-34.6"/>'+
          '<line class="ff-comb-wall ff-comb-wall-6" x1="20" y1="-34.6" x2="-20" y2="-34.6"/>'+
        '</g>'+
        '<g class="ff-comb-memory ff-comb-memory-one">'+
          '<polygon points="-20,18 -16,11.1 -8,11.1 -4,18 -8,24.9 -16,24.9"/>'+
          '<path class="ff-comb-memory-fill" d="M-19 19 H-5 L-8 24 H-16 Z"/>'+
          '<path class="ff-comb-memory-seal" d="M-17 14 H-7"/>'+
        '</g>'+
        '<g class="ff-comb-memory ff-comb-memory-two">'+
          '<polygon points="4,18 8,11.1 16,11.1 20,18 16,24.9 8,24.9"/>'+
          '<path class="ff-comb-memory-fill" d="M5 19 H19 L16 24 H8 Z"/>'+
          '<path class="ff-comb-memory-seal" d="M7 14 H17"/>'+
        '</g>'+
        '<g class="ff-comb-crest" transform="translate(0,-8)">'+domain.crest+'</g>'+
        '<path class="ff-comb-notch" d="'+notch+'"/>'+
      '</svg>'+
      '<span class="ff-comb-build-label">'+esc(model.unlocked.label)+'</span>'+
      '<span class="ff-comb-drop"></span>'+
      '<span class="ff-comb-delivery-worker">'+firstFlightCombBee()+'</span>'+
    '</div>':'';
    return '<section class="ff-comb-ceremony ff-comb-variant-'+variant+
        (domain?' ff-comb-signature-'+domain.signature:'')+'" data-first-flight-comb '+
        'data-comb-variant="'+variant+'" data-comb-phase="hush" style="'+style+'">'+
      '<div class="ff-comb-scrim" aria-hidden="true"></div>'+
      '<div class="ff-comb-stage" aria-hidden="true">'+
        '<svg class="ff-comb-paths" viewBox="0 0 '+values.width+' '+values.height+'" '+
            'preserveAspectRatio="none" focusable="false" aria-hidden="true">'+
          '<path class="ff-comb-flight-trail" d="'+flight+'"/>'+
          (unlocked?'<path class="ff-comb-supply-line" d="'+supply+'"/>'+
            '<circle class="ff-comb-supply-bead" cx="'+firstFlightCombNumber(supplyStartX)+
              '" cy="'+firstFlightCombNumber(supplyStartY)+'" r="3"/>':'')+
        '</svg>'+
        '<div class="ff-comb-core"><svg viewBox="-42 -42 84 84" focusable="false" aria-hidden="true">'+
          '<polygon class="ff-comb-core-cell" points="'+firstFlightCombHexPoints(31)+'"/>'+
          '<path class="ff-comb-core-queen" d="M-8 2 L-5 -8 L0 -4 L5 -8 L8 2 L5 11 H-5 Z M-4 2 H4 M-3 6 H3"/>'+
        '</svg><span>THE CORE</span></div>'+
        '<div class="ff-comb-chosen"><svg viewBox="-48 -48 96 96" focusable="false" aria-hidden="true">'+
          '<polygon class="ff-comb-chosen-pulse ff-comb-chosen-pulse-one" points="'+firstFlightCombHexPoints(32)+'"/>'+
          '<polygon class="ff-comb-chosen-pulse ff-comb-chosen-pulse-two" points="'+firstFlightCombHexPoints(32)+'"/>'+
          '<polygon class="ff-comb-chosen-cell" points="'+firstFlightCombHexPoints(32)+'"/>'+
        '</svg><span class="ff-comb-chosen-label">'+esc(model.cellLabel)+'</span>'+
          '<span class="ff-comb-worker-count">WORKERS 1</span></div>'+
        '<span class="ff-comb-worker">'+firstFlightCombBee()+'</span>'+
        '<div class="ff-comb-impact-tag">WORKER JOINED <span aria-hidden="true">\u2014</span> '+
          esc(model.cellLabel)+'</div>'+target+
      '</div>'+
      '<button class="ff-comb-skip" type="button">SKIP ANIMATION</button>'+
      '<div class="ff-comb-register-preview" aria-hidden="true" inert>'+summaryHTML+'</div>'+
    '</section>';
  }
  function renderFirstFlightRewardSummary(model){
    if(!model||typeof model!=='object'||Array.isArray(model)||
       typeof model.cellKey!=='string'||!model.cellKey.trim()||
       typeof model.cellLabel!=='string'||!model.cellLabel.trim()||
       !model.worker||typeof model.worker!=='object'||Array.isArray(model.worker)||
       Object.keys(model.worker).sort().join(',')!=='age,b,p'||
       model.worker.age!==3||model.worker.b!==0.5||model.worker.p!==0.5||
       !Array.isArray(model.learningExcerpts)||model.learningExcerpts.length!==2||
       (model.unlocked!==null&&(!model.unlocked||typeof model.unlocked!=='object'||
         Array.isArray(model.unlocked)||typeof model.unlocked.cellKey!=='string'||
         !model.unlocked.cellKey.trim()||typeof model.unlocked.label!=='string'||
         !model.unlocked.label.trim())))return '';
    var cellLabel=model.cellLabel.replace(/\s+/g,' ').trim();
    var excerpts=model.learningExcerpts.map(firstFlightExcerpt);
    if(!excerpts[0]||!excerpts[1])return '';
    var unlockedLabel=model.unlocked?model.unlocked.label.replace(/\s+/g,' ').trim():'';
    var supportingLabel=typeof model.supportingLabel==='string'?
      model.supportingLabel.replace(/\s+/g,' ').trim():'';
    return '<section class="ff-reward-summary" data-first-flight-reward role="dialog" tabindex="-1" '+
        'aria-labelledby="ff-reward-title">'+
      '<div class="ff-reward-live" role="status" aria-live="polite" aria-atomic="true">'+
        'First Flight complete. Two learnings kept.</div>'+
      '<h2 class="ff-reward-title" id="ff-reward-title" tabindex="-1">FIRST FLIGHT COMPLETE</h2>'+
      '<div class="ff-reward-grid ff-reward-cards">'+
        '<article class="ff-reward-card ff-reward-worker">'+
          '<div class="ff-reward-card-k ff-reward-card-title">WORKER JOINED</div>'+
          '<p class="ff-reward-cell ff-reward-cell-label">'+esc(cellLabel)+'</p>'+
        '</article>'+
        '<article class="ff-reward-card ff-reward-learnings">'+
          '<div class="ff-reward-card-k ff-reward-card-title">2 LEARNINGS KEPT</div>'+
          '<div class="ff-reward-excerpts">'+
            '<p class="ff-reward-excerpt">'+esc(excerpts[0])+'</p>'+
            '<p class="ff-reward-excerpt">'+esc(excerpts[1])+'</p>'+
          '</div>'+
        '</article>'+
        (model.unlocked?'<article class="ff-reward-card ff-reward-unlock">'+
          '<div class="ff-reward-card-k ff-reward-card-title">CELL AWAKENED \u2014 '+esc(unlockedLabel)+'</div>'+
        '</article>':'')+
      '</div>'+
      (supportingLabel?'<p class="ff-reward-support ff-reward-supporting">'+esc(supportingLabel)+'</p>':'')+
      '<button class="ff-enter-hive" type="button">ENTER THE HIVE</button>'+
    '</section>';
  }
  function toggleEditor(button){
    if(!button||!button.closest)return false;
    var root=button.closest('.td-experiment'),editor=root&&root.querySelector('.td-exp-editor');
    if(!editor)return false;
    var opening=editor.hidden;
    editor.hidden=!opening;
    var edit=root.querySelector('.td-exp-edit');
    if(edit)edit.setAttribute('aria-expanded',opening?'true':'false');
    if(opening){
      var input=editor.querySelector('[data-exp-field="action"]');
      if(input)input.focus();
    }else if(edit)edit.focus();
    return opening;
  }
  function readEdits(root){
    var action=root&&root.querySelector('[data-exp-field="action"]');
    var measure=root&&root.querySelector('[data-exp-field="measure"]');
    return {action:action?action.value:'',measure:measure?measure.value:''};
  }
  function toggleOutcomes(button){
    if(!button||!button.closest)return false;
    var root=button.closest('.td-experiment'),outcomes=root&&root.querySelector('.td-exp-outcomes');
    if(!outcomes)return false;
    var opening=outcomes.hidden;
    outcomes.hidden=!opening;
    button.setAttribute('aria-expanded',opening?'true':'false');
    if(opening){
      var first=outcomes.querySelector('.td-exp-outcome');
      if(first)first.focus();
    }
    return opening;
  }

  B.experimentUI={
    dateLabel:dateLabel,
    matches:matches,
    renderProposal:renderProposal,
    renderActive:renderActive,
    renderClosed:renderClosed,
    renderFirstFlight:renderFirstFlight,
    firstFlightExcerpt:firstFlightExcerpt,
    firstFlightCombDomain:firstFlightCombDomain,
    firstFlightCombDomains:firstFlightCombDomains,
    firstFlightCombTimeline:firstFlightCombTimeline,
    renderFirstFlightCombCeremony:renderFirstFlightCombCeremony,
    renderFirstFlightRewardSummary:renderFirstFlightRewardSummary,
    firstFlightMissionForState:firstFlightMissionForState,
    firstFlightCompletionMission:firstFlightCompletionMission,
    toggleEditor:toggleEditor,
    readEdits:readEdits,
    toggleOutcomes:toggleOutcomes
  };
})(window);
