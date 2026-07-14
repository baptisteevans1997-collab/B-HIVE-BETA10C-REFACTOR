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

  function normalizedPayload(raw){
    if(!raw||typeof raw!=='object')return null;
    var action=cleanText(raw.action,180),measure=cleanText(raw.measure,180);
    var duration=Math.floor(raw.durationDays),dueAt=Math.floor(raw.dueAt);
    if(typeof raw.experimentId!=='string'||!raw.experimentId||typeof raw.insightId!=='string'||!raw.insightId||
       typeof raw.evidenceKey!=='string'||!raw.evidenceKey||typeof raw.strategyId!=='string'||!raw.strategyId||
       !action||!measure||!isFinite(duration)||duration<1||duration>14||!validNow(dueAt))return null;
    return {
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
      sourceRead:cleanText(raw.sourceRead,240)||''
    };
  }
  function strategyStats(events,strategyId,cellKey){
    var result={strategyId:strategyId,completed:0,declined:0,score:0},weight=0;
    (events||[]).forEach(function(event){
      var payload=event&&event.payload;
      if(!event||!payload||payload.strategyId!==strategyId)return;
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
  function rankCandidates(candidates,events,cellKey){
    return (candidates||[]).map(function(candidate,index){
      return {candidate:clone(candidate),index:index,stats:strategyStats(events,candidate.strategyId,cellKey)};
    }).sort(function(a,b){return b.stats.score-a.stats.score||a.index-b.index;});
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
  function proposalForFeedback(feedback,observations,cells,events,now){
    var source=feedback&&feedback.payload,observation,choices,ranked,cell,selected,createdAt;
    if(!source||(source.verdict!=='true'&&source.verdict!=='partly')||activeExperiment(events)||
       decisionForFeedback(events,feedback))return null;
    observation=matchingObservation(feedback,observations);
    if(!observation)return null;
    choices=candidatesFor(observation,cells);
    if(!choices.length)return null;
    cell=cellLabel(observation,cells);
    ranked=rankCandidates(choices,events,cell.key);
    selected=ranked[0].candidate;
    createdAt=validNow(now)?Math.floor(now):Math.floor(feedback.ts);
    return normalizedPayload({
      experimentId:'exp_'+hash(source.insightId+'|'+source.evidenceKey),
      insightId:source.insightId,
      evidenceKey:source.evidenceKey,
      evidenceEventIds:(source.evidenceEventIds||[]).slice(),
      observationKind:observation.kind,
      classification:observation.classification||null,
      themeId:observation.themeId||null,
      cellKey:cell.key,
      strategyId:selected.strategyId,
      action:selected.action,
      measure:selected.measure,
      durationDays:selected.durationDays,
      createdAt:createdAt,
      dueAt:createdAt+selected.durationDays*DAY,
      sourceVerdict:source.verdict,
      sourceRead:observation.read||''
    });
  }
  function decisionPayload(experiment,decision,edits){
    var payload=normalizedPayload(experiment);
    if(!payload||(decision!=='accepted'&&decision!=='edited'))return null;
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
    if(!payload||OUTCOMES[outcome]===undefined)return null;
    payload.outcome=outcome;
    return payload;
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
    candidatesFor:candidatesFor,
    strategyStats:strategyStats,
    rankCandidates:rankCandidates,
    proposalForFeedback:proposalForFeedback,
    decisionForFeedback:decisionForFeedback,
    latestPendingFeedback:latestPendingFeedback,
    decisionPayload:decisionPayload,
    declinePayload:declinePayload,
    completionPayload:completionPayload,
    lifecycle:lifecycle,
    activeExperiment:activeExperiment,
    latestClosedToday:latestClosedToday
  };
})(window);
