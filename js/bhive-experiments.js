/* B HIVE - deterministic experiment loop (Stage 4)
   Pure proposal, lifecycle, and outcome-learning utilities. */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var DAY=86400000;
  var EVENT_TYPES={
    experiment_accepted:1,
    experiment_edited:1,
    experiment_declined:1,
    experiment_completed:1
  };
  var OUTCOMES={helped:2,partly:0.75,no_change:-0.75,made_worse:-2};
  var FIRST_FLIGHT_VERSION=1;
  var FIRST_FLIGHT_MEASURE='Complete this one small step today.';
  var FIRST_FLIGHT={
    lw:{
      title:'Make the first move',
      questions:[
        'What feels most important in your work or direction right now?',
        'What is one small step you can take toward it today?'
      ]
    },
    health:{
      title:'Support your health',
      questions:[
        'How are your body and energy feeling right now?',
        'What is one small thing you can do for your health today?'
      ]
    },
    people:{
      title:'Strengthen the connection',
      questions:[
        'Which relationship or connection needs your attention most right now?',
        'What is one small, respectful step you can take today?'
      ]
    }
  };

  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
  function validNow(value){return typeof value==='number'&&isFinite(value)&&value>0;}
  function dayKey(ts){
    if(B.learningTools)return B.learningTools.dayKey(ts);
    var d=new Date(ts);
    return isNaN(d.getTime())?'':d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  }
  function hash(text){
    var h=2166136261,i;
    for(i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function cleanText(value,max){
    var text=typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
    return text.length>=3?text.slice(0,max||180):'';
  }
  function cleanId(value,max){
    return typeof value==='string'&&value&&value.length<=(max||160)?value:'';
  }
  function cleanFirstFlightAnswer(value){
    var text=typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
    return text&&text.length<=280?text:'';
  }
  function isFirstFlightStrategy(strategyId){
    return typeof strategyId==='string'&&strategyId.indexOf('first_flight_v1_')===0;
  }
  function firstFlightAnswerEventId(cellKey,question){
    if(B.learningTools&&typeof B.learningTools.firstFlightEventId==='function')
      return B.learningTools.firstFlightEventId('first_flight_answered',cellKey,question);
    return FIRST_FLIGHT[cellKey]&&(question===1||question===2)?
      'evt_first_flight_v1_answered_'+cellKey+'_'+question:'';
  }
  function firstFlightExperimentId(cellKey,context,action){
    return 'exp_first_flight_v1_'+hash(cellKey+'|'+context+'|'+action);
  }
  function cellMap(cells){
    var out={};
    (cells||[]).forEach(function(cell){if(cell&&cell.key)out[cell.key]=cell;});
    return out;
  }
  function cellLabel(observation,cells){
    var key=observation&&observation.cellKeys&&observation.cellKeys[0];
    var map=cellMap(cells);
    return {key:key||null,label:(key&&map[key]&&map[key].label)||'this cell'};
  }
  function evidenceKey(observation){
    return B.inference?B.inference.evidenceKey(observation):'';
  }
  function sameSource(payload,feedback){
    var source=feedback&&feedback.payload;
    return !!(payload&&source&&payload.insightId===source.insightId&&payload.evidenceKey===source.evidenceKey);
  }
  function matchingObservation(feedback,observations){
    var source=feedback&&feedback.payload,match=null;
    if(!source)return null;
    (observations||[]).some(function(observation){
      if(observation&&observation.id===source.insightId&&evidenceKey(observation)===source.evidenceKey){
        match=observation;return true;
      }
      return false;
    });
    return match;
  }
  function canonicalSourceEvidence(source,observation){
    var supplied=source&&source.evidenceEventIds,observed=observation&&observation.evidenceEventIds;
    if(!Array.isArray(supplied)||!supplied.length||!Array.isArray(observed)||!observed.length||
       typeof source.evidenceKey!=='string'||!source.evidenceKey)return null;
    function exact(values){
      var seen={},ids=[],valid=true;
      values.forEach(function(id){
        if(typeof id!=='string'||!id||seen[id]){valid=false;return;}
        seen[id]=1;ids.push(id);
      });
      ids.sort();
      return valid&&ids.join('|')===source.evidenceKey?ids:null;
    }
    var sourceIds=exact(supplied),observationIds=exact(observed);
    return sourceIds&&observationIds&&sourceIds.length===observationIds.length&&
      sourceIds.every(function(id,index){return id===observationIds[index];})?observed.slice():null;
  }

  function trendCandidates(observation,label){
    var firstMove={
      strategyId:'small_first_move',
      action:'Name the next physical '+label+' action before starting work on three separate days.',
      measure:'Use three named first moves, then report whether the cell was easier to re-enter.',
      durationDays:5
    };
    var visibleFinish={
      strategyId:'visible_finish',
      action:'Choose one visible '+label+' finish line and move it once on three separate days.',
      measure:'Make three visible moves, then report whether progress felt easier to sustain.',
      durationDays:5
    };
    if(observation.classification==='rising')return [{
      strategyId:'protected_block',
      action:'Give '+label+' one protected 20-minute block on three separate days.',
      measure:'Complete three blocks, then report whether the upward movement held.',
      durationDays:5
    },visibleFinish];
    if(observation.classification==='falling')return [{
      strategyId:'protected_block',
      action:'Give '+label+' one protected 20-minute block on three separate days.',
      measure:'Complete three blocks, then report whether the fall steadied.',
      durationDays:5
    },firstMove];
    if(observation.classification==='volatile')return [{
      strategyId:'steady_window',
      action:'Give '+label+' the same 20-minute window on three separate days.',
      measure:'Complete all three windows, then report whether the swings felt easier to manage.',
      durationDays:5
    },firstMove];
    if(observation.classification==='flat')return [firstMove,visibleFinish];
    return [];
  }
  function neglectCandidates(label){
    return [{
      strategyId:'small_first_move',
      action:'Give '+label+' one 15-minute re-entry this week.',
      measure:'Finish one concrete next step and report whether the cell feels easier to return to.',
      durationDays:7
    },{
      strategyId:'support_checkin',
      action:'Tell one trusted person the next '+label+' move you intend to make.',
      measure:'Send one specific move and report whether that helped you act.',
      durationDays:3
    }];
  }
  function themeCandidates(themeId){
    var choices={
      stress_overload:[
        {strategyId:'reduce_load',action:'Drop, defer, or halve one pressure point on three separate days.',measure:'Make three deliberate reductions, then report whether the load changed.',durationDays:5},
        {strategyId:'recovery_block',action:'Protect one 20-minute low-input block on three separate days.',measure:'Complete three blocks, then report whether your pressure changed.',durationDays:5}
      ],
      money_pressure:[
        {strategyId:'small_first_move',action:'Spend 15 minutes naming and taking the next money action on three separate days.',measure:'Take three concrete actions, then report whether the pressure changed.',durationDays:5},
        {strategyId:'visible_finish',action:'Choose one visible money finish line and move it once on three separate days.',measure:'Make three visible moves, then report whether the next decision felt clearer.',durationDays:5}
      ],
      sleep_health:[
        {strategyId:'recovery_block',action:'Protect the same small recovery action on three separate days.',measure:'Complete it three times, then report whether your energy changed.',durationDays:5},
        {strategyId:'steady_window',action:'Give sleep or health the same 20-minute window on three separate days.',measure:'Complete all three windows, then report whether consistency helped.',durationDays:5}
      ],
      unfinished_work:[
        {strategyId:'small_first_move',action:'Choose one open loop and name its next physical action before starting new work.',measure:'Move that loop once, then report whether it became easier to finish.',durationDays:3},
        {strategyId:'visible_finish',action:'Choose one small open loop that can be visibly finished within three days.',measure:'Finish it, then report whether closing it changed the pressure.',durationDays:3}
      ],
      social_support:[
        {strategyId:'support_checkin',action:'Ask one trusted person for one specific kind of support.',measure:'Make the ask and report whether it helped.',durationDays:3},
        {strategyId:'shared_block',action:'Do one 20-minute block alongside someone, in person or remotely.',measure:'Complete the shared block and report whether it made starting easier.',durationDays:3}
      ],
      momentum_shipping:[
        {strategyId:'visible_finish',action:'Choose one small finish line and put it into the world within three days.',measure:'Ship the small version and report whether it strengthened momentum.',durationDays:3},
        {strategyId:'small_first_move',action:'Name and take one physical finishing move on three separate days.',measure:'Take three finishing moves, then report whether the work moved closer to done.',durationDays:5}
      ],
      avoidance:[
        {strategyId:'small_first_move',action:'Give the avoided task a 10-minute first move on three separate days.',measure:'Complete three starts, then report whether resistance changed.',durationDays:5},
        {strategyId:'support_checkin',action:'Tell one trusted person the exact avoided task you will touch next.',measure:'Send the commitment, take one step, and report whether the check-in helped.',durationDays:3}
      ],
      rest_recovery:[
        {strategyId:'recovery_block',action:'Protect one 20-minute low-input block on three separate days.',measure:'Complete three blocks, then report whether your energy changed.',durationDays:5},
        {strategyId:'steady_window',action:'Put the same short recovery window into three separate days.',measure:'Keep all three windows, then report whether consistency helped.',durationDays:5}
      ]
    };
    return choices[themeId]||[];
  }
  function candidatesFor(observation,cells){
    if(!observation)return [];
    var cell=cellLabel(observation,cells);
    if(observation.kind==='trend')return trendCandidates(observation,cell.label);
    if(observation.kind==='neglect')return neglectCandidates(cell.label);
    if(observation.kind==='theme')return themeCandidates(observation.themeId);
    return [];
  }

  function normalizedGuidance(raw){
    if(raw===undefined||raw===null)return [];
    if(!Array.isArray(raw)||raw.length>2)return null;
    var seen={},out=[],valid=true;
    raw.forEach(function(item){
      var memoryId=cleanId(item&&item.memoryId),key=cleanId(item&&item.evidenceKey,4000);
      var feedbackEventId=cleanId(item&&item.feedbackEventId),influence=item&&item.influence;
      var identity=memoryId+'|'+key+'|'+feedbackEventId+'|'+influence;
      if(!memoryId||!key||!feedbackEventId||(influence!=='preferred'&&influence!=='avoided')||seen[identity]){
        valid=false;return;
      }
      seen[identity]=1;
      out.push({memoryId:memoryId,evidenceKey:key,feedbackEventId:feedbackEventId,influence:influence});
    });
    return valid?out:null;
  }
  function normalizedPayload(raw){
    if(!raw||typeof raw!=='object')return null;
    var firstFlight=isFirstFlightStrategy(raw.strategyId);
    var action=firstFlight?cleanFirstFlightAnswer(raw.action):cleanText(raw.action,180);
    var sourceRead=firstFlight?cleanFirstFlightAnswer(raw.sourceRead):(cleanText(raw.sourceRead,240)||'');
    var measure=cleanText(raw.measure,180);
    var duration=Math.floor(raw.durationDays),dueAt=Math.floor(raw.dueAt);
    var guidance=normalizedGuidance(raw.memoryGuidance);
    if(firstFlight&&(!validNow(raw.createdAt)||raw.sourceVerdict!=='true'||
       raw.classification!==null||raw.themeId!==null||(guidance&&guidance.length)))return null;
    if(typeof raw.experimentId!=='string'||!raw.experimentId||typeof raw.insightId!=='string'||!raw.insightId||
       typeof raw.evidenceKey!=='string'||!raw.evidenceKey||typeof raw.strategyId!=='string'||!raw.strategyId||
       !action||!measure||!isFinite(duration)||duration<1||duration>14||!validNow(dueAt)||guidance===null)return null;
    var payload={
      experimentId:raw.experimentId,
      insightId:raw.insightId,
      evidenceKey:raw.evidenceKey,
      evidenceEventIds:Array.isArray(raw.evidenceEventIds)?raw.evidenceEventIds.slice():[],
      observationKind:raw.observationKind||null,
      classification:raw.classification||null,
      themeId:raw.themeId||null,
      cellKey:raw.cellKey||null,
      strategyId:raw.strategyId,
      action:action,
      measure:measure,
      durationDays:duration,
      createdAt:validNow(raw.createdAt)?Math.floor(raw.createdAt):dueAt-duration*DAY,
      dueAt:dueAt,
      sourceVerdict:raw.sourceVerdict==='partly'?'partly':'true',
      sourceRead:sourceRead
    };
    if(firstFlight){
      payload.firstFlightVersion=raw.firstFlightVersion;
      payload.title=cleanText(raw.title,80);
      if(!isFirstFlightPayload(payload))return null;
    }
    if(guidance.length)payload.memoryGuidance=guidance;
    return payload;
  }
  function isFirstFlightPayload(payload){
    var cell=payload&&FIRST_FLIGHT[payload.cellKey],ids,createdAt;
    if(!cell||payload.firstFlightVersion!==FIRST_FLIGHT_VERSION||
       payload.strategyId!=='first_flight_v1_'+payload.cellKey||
       payload.observationKind!=='first_flight'||payload.classification!==null||payload.themeId!==null||
       payload.title!==cell.title||
       !cleanFirstFlightAnswer(payload.sourceRead)||!cleanFirstFlightAnswer(payload.action)||
       payload.measure!==FIRST_FLIGHT_MEASURE||payload.durationDays!==1||
       payload.insightId!=='first_flight_v1_'+payload.cellKey||payload.sourceVerdict!=='true')return false;
    ids=[firstFlightAnswerEventId(payload.cellKey,1),firstFlightAnswerEventId(payload.cellKey,2)];
    createdAt=Math.floor(payload.createdAt);
    return !!ids[0]&&!!ids[1]&&Array.isArray(payload.evidenceEventIds)&&
      payload.evidenceEventIds.length===2&&payload.evidenceEventIds[0]===ids[0]&&
      payload.evidenceEventIds[1]===ids[1]&&payload.evidenceKey===ids.join('|')&&
      payload.experimentId===firstFlightExperimentId(payload.cellKey,payload.sourceRead,payload.action)&&
      validNow(createdAt)&&payload.dueAt===createdAt+DAY;
  }
  function firstFlightMission(cellKey,answers,now){
    var cell=FIRST_FLIGHT[cellKey],context,action,createdAt,ids;
    if(!cell||!Array.isArray(answers)||answers.length!==2||!validNow(now))return null;
    context=cleanFirstFlightAnswer(answers[0]);
    action=cleanFirstFlightAnswer(answers[1]);
    if(!context||!action)return null;
    createdAt=Math.floor(now);
    ids=[firstFlightAnswerEventId(cellKey,1),firstFlightAnswerEventId(cellKey,2)];
    if(!ids[0]||!ids[1])return null;
    return normalizedPayload({
      experimentId:firstFlightExperimentId(cellKey,context,action),
      insightId:'first_flight_v1_'+cellKey,
      evidenceKey:ids.join('|'),
      evidenceEventIds:ids,
      observationKind:'first_flight',
      classification:null,
      themeId:null,
      cellKey:cellKey,
      strategyId:'first_flight_v1_'+cellKey,
      action:action,
      measure:FIRST_FLIGHT_MEASURE,
      durationDays:1,
      createdAt:createdAt,
      dueAt:createdAt+DAY,
      sourceVerdict:'true',
      sourceRead:context,
      firstFlightVersion:FIRST_FLIGHT_VERSION,
      title:cell.title
    });
  }
  function strategyStats(events,strategyId,cellKey){
    var result={strategyId:strategyId,completed:0,declined:0,score:0},weight=0;
    (events||[]).forEach(function(event){
      var payload=event&&event.payload;
      if(!event||!payload||payload.strategyId!==strategyId||isFirstFlightStrategy(payload.strategyId))return;
      var scope=cellKey&&payload.cellKey===cellKey?1.5:1;
      if(event.type==='experiment_completed'&&OUTCOMES[payload.outcome]!==undefined){
        result.completed++;weight+=scope;result.score+=OUTCOMES[payload.outcome]*scope;
      }else if(event.type==='experiment_declined'){
        result.declined++;weight+=scope;result.score-=0.15*scope;
      }
    });
    result.score=Math.round((result.score/(weight+2))*10000)/10000;
    return result;
  }
  function adapterProvenance(item){
    if(!item)return null;
    return {memoryId:item.memoryId,evidenceKey:item.evidenceKey,feedbackEventId:item.feedbackEventId,
      influence:item.influence==='preferred'?'preference':item.influence==='avoided'?'veto':''};
  }
  function validGuidance(guidance,memoryContext){
    return !!(guidance&&guidance.length&&memoryContext&&B.memoryUse&&
      typeof B.memoryUse.validateProvenance==='function'&&guidance.every(function(item){
        return B.memoryUse.validateProvenance(adapterProvenance(item),memoryContext);
      }));
  }
  function strategySignal(candidate,stats,cellKey,options){
    options=options||{};
    if(!options.memoryContext||!B.memoryUse||typeof B.memoryUse.strategySignal!=='function')return null;
    var signal=B.memoryUse.strategySignal(options.memoryContext,candidate,
      cellKey||options.themeId||'',options.sourceEvidenceIds||[]);
    if(!signal||typeof signal!=='object')return null;
    var influence=signal.influence||(signal.provenance&&signal.provenance.influence);
    var veto=signal.veto===true||influence==='veto';
    var provenance=clone(signal.provenance)||{};
    provenance.influence=veto?'avoided':'preferred';
    var guidance=normalizedGuidance([provenance]);
    if(!guidance||!guidance.length)return null;
    if(!validGuidance(guidance,options.memoryContext))return null;
    var requested=typeof signal.delta==='number'&&isFinite(signal.delta)?signal.delta:0.10;
    var delta=!veto&&influence!=='veto'&&stats.score>=0?Math.max(0,Math.min(0.10,requested)):0;
    if(!veto&&delta<=0)return null;
    return {veto:veto,delta:Math.round(delta*10000)/10000,provenance:guidance[0]};
  }
  function rankCandidates(candidates,events,cellKey,options){
    return (candidates||[]).map(function(candidate,index){
      var stats=strategyStats(events,candidate.strategyId,cellKey);
      var signal=strategySignal(candidate,stats,cellKey,options);
      var item={candidate:clone(candidate),index:index,stats:stats};
      if(signal){
        item.memoryVeto=signal.veto;item.memoryDelta=signal.delta;
        item.memoryProvenance=clone(signal.provenance);
        item.rankScore=Math.round((stats.score+signal.delta)*10000)/10000;
      }
      return item;
    }).sort(function(a,b){
      var as=a.rankScore===undefined?a.stats.score:a.rankScore;
      var bs=b.rankScore===undefined?b.stats.score:b.rankScore;
      return Number(!!a.memoryVeto)-Number(!!b.memoryVeto)||bs-as||
        b.stats.score-a.stats.score||a.index-b.index;
    });
  }
  function experimentEvents(events){
    return (events||[]).filter(function(event){return event&&EVENT_TYPES[event.type]&&event.payload;});
  }
  function orderedExperimentEvents(events){
    return experimentEvents(events).map(function(event,index){return {event:event,index:index};})
      .sort(function(a,b){return a.event.ts-b.event.ts||a.index-b.index;});
  }
  function decisionForFeedback(events,feedback){
    var match=null;
    experimentEvents(events).forEach(function(event){
      if(sameSource(event.payload,feedback)&&(!match||event.ts>match.ts||
         event.ts===match.ts))match=event;
    });
    return match?clone(match):null;
  }
  function latestPendingFeedback(events,now,maxAgeDays){
    if(!validNow(now))return null;
    var cutoff=now-Math.max(1,maxAgeDays||7)*DAY,latest=null;
    (events||[]).forEach(function(event){
      var payload=event&&event.payload;
      if(!event||event.type!=='insight_feedback'||!payload||
         (payload.verdict!=='true'&&payload.verdict!=='partly')||event.ts<cutoff||event.ts>now||
         decisionForFeedback(events,event))return;
      if(!latest||event.ts>=latest.ts)latest=event;
    });
    return latest?clone(latest):null;
  }
  function proposalGuidance(selected,ranked,memoryContext){
    var raw=[];
    if(selected&&selected.memoryProvenance)raw.push(selected.memoryProvenance);
    (ranked||[]).some(function(item){
      if(raw.length>=2)return true;
      if(item&&item.memoryVeto&&item.memoryProvenance)raw.push(item.memoryProvenance);
      return raw.length>=2;
    });
    var guidance=normalizedGuidance(raw);
    if(!guidance||!guidance.length)return [];
    if(!validGuidance(guidance,memoryContext))return [];
    return guidance;
  }
  function proposalForFeedback(feedback,observations,cells,events,now,options){
    options=options||{};
    var source=feedback&&feedback.payload,observation,sourceEvidence,choices,ranked,cell,selected,createdAt,guidance;
    if(!source||(source.verdict!=='true'&&source.verdict!=='partly')||activeExperiment(events)||
       decisionForFeedback(events,feedback))return null;
    observation=matchingObservation(feedback,observations);
    if(!observation)return null;
    sourceEvidence=canonicalSourceEvidence(source,observation);
    if(!sourceEvidence)return null;
    choices=candidatesFor(observation,cells);
    if(!choices.length)return null;
    cell=cellLabel(observation,cells);
    ranked=rankCandidates(choices,events,cell.key,{
      memoryContext:options.memoryContext,
      themeId:observation.themeId||options.themeId||null,
      sourceEvidenceIds:sourceEvidence.concat(
        Array.isArray(options.sourceEvidenceIds)?options.sourceEvidenceIds:[])
    });
    selected=ranked.filter(function(item){return !item.memoryVeto;})[0];
    if(!selected)return null;
    guidance=proposalGuidance(selected,ranked,options.memoryContext);
    createdAt=validNow(now)?Math.floor(now):Math.floor(feedback.ts);
    var proposal={
      experimentId:'exp_'+hash(source.insightId+'|'+source.evidenceKey),
      insightId:source.insightId,
      evidenceKey:source.evidenceKey,
      evidenceEventIds:sourceEvidence.slice(),
      observationKind:observation.kind,
      classification:observation.classification||null,
      themeId:observation.themeId||null,
      cellKey:cell.key,
      strategyId:selected.candidate.strategyId,
      action:selected.candidate.action,
      measure:selected.candidate.measure,
      durationDays:selected.candidate.durationDays,
      createdAt:createdAt,
      dueAt:createdAt+selected.candidate.durationDays*DAY,
      sourceVerdict:source.verdict,
      sourceRead:observation.read||''
    };
    if(guidance.length)proposal.memoryGuidance=guidance;
    return normalizedPayload(proposal);
  }
  function decisionPayload(experiment,decision,edits,memoryContext){
    var payload=normalizedPayload(experiment);
    if(!payload||(decision!=='accepted'&&decision!=='edited'))return null;
    if(isFirstFlightPayload(payload)&&decision!=='accepted')return null;
    if(payload.memoryGuidance&&!validGuidance(payload.memoryGuidance,memoryContext))return null;
    if(decision==='edited'){
      edits=edits||{};
      payload.action=cleanText(edits.action,180);
      payload.measure=cleanText(edits.measure,180);
      if(!payload.action||!payload.measure)return null;
    }
    payload.decision=decision;
    return payload;
  }
  function declinePayload(experiment,reason){
    var payload=normalizedPayload(experiment);
    if(!payload)return null;
    payload.reason=reason==='stopped'?'stopped':'not_now';
    return payload;
  }
  function completionPayload(experiment,outcome){
    var payload=normalizedPayload(experiment);
    if(!payload)return null;
    if(isFirstFlightPayload(payload)){
      if(outcome!=='completed')return null;
    }else if(outcome==='completed'||OUTCOMES[outcome]===undefined)return null;
    payload.outcome=outcome;
    return payload;
  }
  function sameFirstFlightMission(raw,mission){
    var normalized=normalizedPayload(raw);
    return !!normalized&&isFirstFlightPayload(normalized)&&
      JSON.stringify(normalized)===JSON.stringify(mission);
  }
  function firstFlightState(events){
    var state=null,ordered=(events||[]).map(function(event,index){return {event:event,index:index};});
    ordered.sort(function(a,b){
      var at=a.event&&typeof a.event.ts==='number'?a.event.ts:Infinity;
      var bt=b.event&&typeof b.event.ts==='number'?b.event.ts:Infinity;
      return at-bt||a.index-b.index;
    });
    ordered.forEach(function(item){
      var event=item.event,clean,payload,mission;
      if(!event||!validNow(event.ts))return;
      if(event.type==='first_flight_available'||event.type==='first_flight_cell_selected'||
         event.type==='first_flight_answered'){
        if(!B.learningTools)return;
        clean=B.learningTools.normalizeState({modelVersion:1,events:[event]}).events[0];
        if(!clean)return;
        if(clean.type==='first_flight_available'){
          if(!state)state={version:FIRST_FLIGHT_VERSION,status:'available',cellKey:null,answers:[]};
          return;
        }
        if(!state)return;
        if(clean.type==='first_flight_cell_selected'){
          if(state.status==='available'){
            state.status='cell_selected';state.cellKey=clean.cellKey;state.selectedEventId=clean.id;
          }
          return;
        }
        if(clean.cellKey!==state.cellKey)return;
        if(clean.payload.question===1&&state.status==='cell_selected'){
          state.answers=[clean.payload.answer];state.status='first_answer_recorded';
          state.answerEventIds=[clean.id];
        }else if(clean.payload.question===2&&state.status==='first_answer_recorded'){
          state.answers.push(clean.payload.answer);state.answerEventIds.push(clean.id);
          mission=firstFlightMission(state.cellKey,state.answers,clean.ts);
          if(mission){state.mission=mission;state.status='mission_ready';}
        }
        return;
      }
      if(!state||!state.mission)return;
      payload=event.payload;
      if(event.type==='experiment_accepted'&&state.status==='mission_ready'&&
         payload&&payload.decision==='accepted'&&sameFirstFlightMission(payload,state.mission)){
        state.status='mission_active';state.acceptedEventId=event.id;
      }else if(event.type==='experiment_completed'&&state.status==='mission_active'&&
               payload&&payload.outcome==='completed'&&sameFirstFlightMission(payload,state.mission)){
        state.status='mission_completed';state.completedEventId=event.id;
      }
    });
    return state?clone(state):null;
  }
  function lifecycle(events,experimentId){
    var state=null,status='unknown',last=null,outcome=null;
    orderedExperimentEvents(events).forEach(function(item){
      var event=item.event;
      var payload=normalizedPayload(event.payload);
      if(!payload||payload.experimentId!==experimentId)return;
      state=payload;last=event;
      if(event.type==='experiment_accepted'||event.type==='experiment_edited'){status='active';outcome=null;}
      else if(event.type==='experiment_declined'){status='declined';outcome=null;}
      else if(event.type==='experiment_completed'){status='completed';outcome=event.payload.outcome;}
    });
    if(!state||!last)return null;
    state.status=status;state.outcome=outcome;state.lastEventType=last.type;
    state.lastEventId=last.id;state.lastEventTs=last.ts;
    return state;
  }
  function activeExperiment(events){
    var active=null;
    orderedExperimentEvents(events).forEach(function(item){
      var event=item.event,payload=normalizedPayload(event.payload);
      if(!payload)return;
      if(event.type==='experiment_accepted'||event.type==='experiment_edited'){
        active=payload;
        active.status='active';active.lastEventType=event.type;
        active.lastEventId=event.id;active.lastEventTs=event.ts;
      }else if(active&&active.experimentId===payload.experimentId){
        active=null;
      }
    });
    return active?clone(active):null;
  }
  function latestClosedToday(events,now){
    var today=dayKey(now),latest=null;
    experimentEvents(events).forEach(function(event){
      if((event.type!=='experiment_completed'&&event.type!=='experiment_declined')||dayKey(event.ts)!==today)return;
      if(!latest||event.ts>latest.ts||event.ts===latest.ts)latest=event;
    });
    return latest?clone(latest):null;
  }

  B.experiments={
    DAY:DAY,
    OUTCOMES:clone(OUTCOMES),
    FIRST_FLIGHT_VERSION:FIRST_FLIGHT_VERSION,
    FIRST_FLIGHT:clone(FIRST_FLIGHT),
    candidatesFor:candidatesFor,
    strategyStats:strategyStats,
    rankCandidates:rankCandidates,
    proposalForFeedback:proposalForFeedback,
    decisionForFeedback:decisionForFeedback,
    latestPendingFeedback:latestPendingFeedback,
    decisionPayload:decisionPayload,
    declinePayload:declinePayload,
    completionPayload:completionPayload,
    firstFlightMission:firstFlightMission,
    firstFlightState:firstFlightState,
    isFirstFlight:isFirstFlightPayload,
    lifecycle:lifecycle,
    activeExperiment:activeExperiment,
    latestClosedToday:latestClosedToday
  };
})(window);
