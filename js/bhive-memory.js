/* B HIVE - trusted personal memory (Stage 5A)
   Pure memory derivation over append-only evidence. No DOM, storage, or network. */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var DAY=86400000;
  var OUTCOMES={helped:2,partly:0.75,no_change:-0.75,made_worse:-2};
  var STRATEGIES={
    protected_block:'protected work blocks',
    visible_finish:'visible finish lines',
    small_first_move:'small first moves',
    steady_window:'consistent work windows',
    support_checkin:'support check-ins',
    reduce_load:'deliberate load reductions',
    recovery_block:'protected recovery blocks',
    shared_block:'shared work blocks'
  };
  var MEMORY_VERDICTS={true:1,partly:1,wrong:1,corrected:1};
  var PATTERN_KINDS={trend:1,neglect:1,theme:1};

  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
  function clamp01(value){return typeof value==='number'&&isFinite(value)?(value<0?0:value>1?1:value):0;}
  function validNow(value){return typeof value==='number'&&isFinite(value)&&value>0;}
  function cleanText(value,max){
    var text=typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
    return text.length>=3?text.slice(0,max||240):'';
  }
  function hash(text){
    var h=2166136261,i;
    for(i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function unique(values){
    var seen={},out=[];
    (values||[]).forEach(function(value){
      if(typeof value==='string'&&value&&!seen[value]){seen[value]=1;out.push(value);}
    });
    return out;
  }
  function dayKey(ts){
    if(B.learningTools)return B.learningTools.dayKey(ts);
    var d=new Date(ts);
    return isNaN(d.getTime())?'':d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  }
  function evidenceKey(ids){return unique(ids).sort().join('|');}
  function eventMap(events){
    var out={};
    (events||[]).forEach(function(event){if(event&&event.id)out[event.id]=event;});
    return out;
  }
  function validEvidence(ids,key,events,until){
    ids=unique(ids);
    if(!ids.length||evidenceKey(ids)!==key)return false;
    var byId=eventMap(events),valid=true;
    ids.forEach(function(id){
      var event=byId[id];
      if(!event||!validNow(event.ts)||validNow(until)&&event.ts>until)valid=false;
    });
    return valid;
  }
  function cellMap(cells){
    var out={};
    (cells||[]).forEach(function(cell){if(cell&&cell.key)out[cell.key]=cell;});
    return out;
  }
  function themeMap(){
    var out={},themes=(root.BHIVE_DATA&&root.BHIVE_DATA.INFERENCE_THEMES)||[];
    themes.forEach(function(theme){if(theme&&theme.id)out[theme.id]=theme;});
    return out;
  }
  function rangeFor(ids,events,fallback){
    var byId=eventMap(events),first=null,last=null;
    unique(ids).forEach(function(id){
      var event=byId[id];
      if(!event||typeof event.ts!=='number')return;
      if(first===null||event.ts<first)first=event.ts;
      if(last===null||event.ts>last)last=event.ts;
    });
    fallback=validNow(fallback)?Math.floor(fallback):null;
    return {first:first===null?fallback:first,last:last===null?fallback:last};
  }
  function conceptForObservation(observation){
    var scope=(observation.cellKeys&&observation.cellKeys[0])||observation.themeId||'global';
    var subtype=observation.themeId||observation.classification||'pattern';
    return 'pattern:'+observation.kind+':'+subtype+':'+scope;
  }
  function memoryBase(data){
    var ids=unique(data.evidenceEventIds),key=evidenceKey(ids);
    if(!data.conceptKey||!key||!cleanText(data.statement,240))return null;
    return {
      id:'mem_'+hash(data.conceptKey),
      conceptKey:data.conceptKey,
      evidenceKey:key,
      kind:data.kind,
      source:data.source,
      cellKey:data.cellKey||null,
      themeId:data.themeId||null,
      strategyId:data.strategyId||null,
      polarity:data.polarity||null,
      statement:cleanText(data.statement,240),
      confidence:Math.round(clamp01(data.confidence||0)*10000)/10000,
      status:data.status||'candidate',
      evidenceEventIds:ids,
      firstSeenAt:data.firstSeenAt||null,
      lastSeenAt:data.lastSeenAt||null,
      userVerdict:data.userVerdict||null,
      feedbackEventId:data.feedbackEventId||null,
      modelVersion:1
    };
  }

  function matchingInsightFeedback(observation,events,now){
    var id=observation&&observation.id,key=B.inference?B.inference.evidenceKey(observation):
      evidenceKey(observation&&observation.evidenceEventIds),latest=null;
    (events||[]).forEach(function(event){
      var payload=event&&event.payload;
      if(!event||event.type!=='insight_feedback'||!payload||payload.insightId!==id||
         payload.evidenceKey!==key||!validNow(event.ts)||validNow(now)&&event.ts>now)return;
      if(!latest||event.ts>latest.ts||event.ts===latest.ts)latest=event;
    });
    return latest;
  }
  function patternMemory(observation,events,now){
    if(!observation||observation.status!=='ready'||!PATTERN_KINDS[observation.kind]||
       observation.kind==='theme'&&!observation.themeId||
       observation.kind!=='theme'&&!(observation.cellKeys&&observation.cellKeys[0])||
       !cleanText(observation.read,240)||
       !Array.isArray(observation.evidenceEventIds)||!observation.evidenceEventIds.length)return null;
    var feedback=matchingInsightFeedback(observation,events,now),payload=feedback&&feedback.payload;
    if(!payload||(payload.verdict!=='true'&&payload.verdict!=='partly'))return null;
    if(!validEvidence(observation.evidenceEventIds,payload.evidenceKey,events,now))return null;
    var ids=unique(observation.evidenceEventIds.concat(feedback.id)),span=rangeFor(ids,events,feedback.ts);
    return memoryBase({
      conceptKey:conceptForObservation(observation),
      kind:'pattern',source:'confirmed_insight',
      cellKey:(observation.cellKeys&&observation.cellKeys[0])||null,
      themeId:observation.themeId||null,
      statement:observation.read,
      confidence:clamp01((observation.confidence||0)+(payload.verdict==='true'?0.12:0.03)),
      status:payload.verdict==='true'?'confirmed':'tentative',
      evidenceEventIds:ids,firstSeenAt:span.first,lastSeenAt:span.last,
      userVerdict:payload.verdict
    });
  }
  function patternMemories(observations,events,now){
    var out=[];
    (observations||[]).forEach(function(observation){
      var memory=patternMemory(observation,events,now);
      if(memory)out.push(memory);
    });
    return out;
  }
  function observationFromFeedback(event){
    var payload=event&&event.payload,source=payload&&payload.memorySource;
    if(!event||event.type!=='insight_feedback'||!validNow(event.ts)||!source||!PATTERN_KINDS[source.kind]||
       typeof payload.insightId!=='string'||!payload.insightId||
       !Array.isArray(payload.evidenceEventIds)||!payload.evidenceEventIds.length||
       !Array.isArray(source.evidenceEventIds)||
       evidenceKey(payload.evidenceEventIds)!==payload.evidenceKey||
       evidenceKey(source.evidenceEventIds)!==payload.evidenceKey||
       !cleanText(source.read,240))return null;
    if(source.kind==='theme'&&!source.themeId)return null;
    if(source.kind!=='theme'&&(!Array.isArray(source.cellKeys)||!source.cellKeys[0]))return null;
    return {
      id:payload.insightId,status:'ready',kind:source.kind,
      classification:source.classification||null,themeId:source.themeId||null,
      cellKeys:unique(Array.isArray(source.cellKeys)?source.cellKeys:[]).slice(0,4),read:cleanText(source.read,240),
      confidence:clamp01(source.confidence),evidenceEventIds:unique(source.evidenceEventIds)
    };
  }
  function storedPatternMemories(events,now){
    var out=[];
    (events||[]).forEach(function(event){
      if(!validNow(event&&event.ts)||validNow(now)&&event.ts>now)return;
      var observation=observationFromFeedback(event);
      if(!observation)return;
      var memory=patternMemory(observation,events,now);
      if(memory)out.push(memory);
    });
    return out;
  }

  function completedExperiments(events,now){
    var latest={};
    (events||[]).forEach(function(event,index){
      var payload=event&&event.payload,id=payload&&payload.experimentId;
      if(!event||event.type!=='experiment_completed'||!payload||typeof id!=='string'||!id||
         typeof payload.insightId!=='string'||!payload.insightId||
         typeof payload.evidenceKey!=='string'||!payload.evidenceKey||
         !Array.isArray(payload.evidenceEventIds)||!payload.evidenceEventIds.length||
         typeof payload.strategyId!=='string'||!STRATEGIES[payload.strategyId]||
         OUTCOMES[payload.outcome]===undefined||!validNow(event.ts)||
         (validNow(now)&&event.ts>now))return;
      if(!validEvidence(payload.evidenceEventIds,payload.evidenceKey,events,event.ts))return;
      var previous=latest[id];
      if(!previous||event.ts>previous.event.ts||event.ts===previous.event.ts&&index>previous.index){
        latest[id]={event:event,index:index};
      }
    });
    return Object.keys(latest).map(function(id){return latest[id].event;});
  }
  function strategyScope(payload){return payload.cellKey||payload.themeId||'global';}
  function strategyStatement(strategyId,polarity,scope,cells){
    var label=STRATEGIES[strategyId]||cleanText(strategyId.replace(/_/g,' '),80);
    var mapped=cellMap(cells),themes=themeMap(),where=scope!=='global'?
      ((mapped[scope]&&mapped[scope].label)||(themes[scope]&&themes[scope].label)||scope.replace(/_/g,' ')):'';
    var ending=where?' for '+where:'';
    if(polarity==='helpful')return 'Your reports suggest '+label+' have tended to help'+ending+'.';
    return 'Your reports suggest '+label+' have not reliably helped'+ending+'.';
  }
  function strategyMemories(events,cells,now,options){
    options=options||{};
    var minExperiments=Math.max(2,options.minExperiments||2),groups={},out=[];
    var mappedCells=cellMap(cells),mappedThemes=themeMap();
    completedExperiments(events,now).forEach(function(event){
      var payload=event.payload,strategy=cleanText(payload.strategyId,80),scope=strategyScope(payload);
      if(!strategy||scope==='global'||!mappedCells[scope]&&!mappedThemes[scope])return;
      var key=strategy+'|'+scope;
      if(!groups[key])groups[key]={strategyId:strategy,scope:scope,events:[]};
      groups[key].events.push(event);
    });
    Object.keys(groups).sort().forEach(function(key){
      var group=groups[key],days={},score=0,positive=0,negative=0;
      group.events.forEach(function(event){
        var value=OUTCOMES[event.payload.outcome];
        score+=value;
        if(value>0)positive++;else if(value<0)negative++;
        days[dayKey(event.ts)]=1;
      });
      var count=group.events.length,distinctDays=Object.keys(days).filter(Boolean).length;
      if(count<minExperiments||distinctDays<minExperiments)return;
      var mean=score/count,polarity=mean>=0.6&&positive>negative?'helpful':
        mean<=-0.35&&negative>positive?'unhelpful':null;
      if(!polarity)return;
      var agreement=Math.abs(positive-negative)/count;
      var confidence=Math.min(0.86,0.54+Math.min(0.16,(count-2)*0.05)+agreement*0.12);
      var ids=[];
      group.events.forEach(function(event){
        ids.push(event.id);ids=ids.concat(event.payload.evidenceEventIds||[]);
      });
      ids=unique(ids);
      var span=rangeFor(ids,events,now);
      var memory=memoryBase({
        conceptKey:'strategy:'+group.strategyId+':'+group.scope,
        kind:'strategy',source:'experiment_outcomes',
        cellKey:mappedCells[group.scope]?group.scope:null,
        themeId:mappedThemes[group.scope]?group.scope:null,
        strategyId:group.strategyId,polarity:polarity,
        statement:strategyStatement(group.strategyId,polarity,group.scope,cells),
        confidence:confidence,status:'candidate',evidenceEventIds:ids,
        firstSeenAt:span.first,lastSeenAt:span.last
      });
      if(memory)out.push(memory);
    });
    return out;
  }

  function latestMemoryFeedback(memory,events,now){
    var latest=null;
    (events||[]).forEach(function(event){
      var payload=event&&event.payload;
      if(!event||event.type!=='memory_feedback'||!payload||payload.memoryId!==memory.id||
         payload.evidenceKey!==memory.evidenceKey||!MEMORY_VERDICTS[payload.verdict]||
         !validNow(event.ts)||validNow(now)&&event.ts>now)return;
      if(payload.verdict==='corrected'&&!cleanText(payload.correctedText,240))return;
      if(!latest||event.ts>latest.ts||event.ts===latest.ts)latest=event;
    });
    return latest;
  }
  function applyFeedback(memory,events,now){
    var out=clone(memory),feedback=out&&latestMemoryFeedback(out,events,now),payload=feedback&&feedback.payload;
    if(!out||!payload)return out;
    out.lastSeenAt=Math.max(out.lastSeenAt||0,feedback.ts||0)||out.lastSeenAt;
    out.userVerdict=payload.verdict;
    out.feedbackEventId=feedback.id;
    if(payload.verdict==='wrong'){out.status='suppressed';out.confidence=0;return out;}
    if(payload.verdict==='corrected'){
      var corrected=cleanText(payload.correctedText,240);
      if(!corrected)return out;
      out.statement=corrected;out.status='confirmed';out.confidence=1;out.source='user_correction';
      return out;
    }
    if(payload.verdict==='true'){
      out.status='confirmed';out.confidence=Math.round(clamp01(out.confidence+0.15)*10000)/10000;
    }else{
      out.status='tentative';out.confidence=Math.round(clamp01(out.confidence+0.03)*10000)/10000;
    }
    return out;
  }
  function rank(memories,limit){
    limit=Math.max(1,Math.min(50,limit||12));
    return (memories||[]).filter(function(memory){return memory&&memory.status!=='suppressed';})
      .map(function(memory){return clone(memory);})
      .sort(function(a,b){
        var ar=a.status==='confirmed'?1:a.status==='tentative'?0.5:0;
        var br=b.status==='confirmed'?1:b.status==='tentative'?0.5:0;
        return br-ar||b.confidence-a.confidence||(b.lastSeenAt||0)-(a.lastSeenAt||0)||a.id.localeCompare(b.id);
      }).slice(0,limit);
  }
  function derive(events,cells,now,options){
    options=options||{};
    if(!Array.isArray(events)||!validNow(now))return {memories:[],confirmed:[],candidates:[],suppressed:[]};
    var observations=options.observations;
    if(!Array.isArray(observations)&&B.inference){
      observations=B.inference.generate(events,cells||[],now,options.inference).observations;
    }
    var raw=storedPatternMemories(events,now).concat(patternMemories(observations||[],events,now))
      .concat(strategyMemories(events,cells||[],now,options.strategies));
    var byId={};
    raw.forEach(function(memory){
      var previous=byId[memory.id];
      if(!previous||(memory.lastSeenAt||0)>(previous.lastSeenAt||0)||
         memory.lastSeenAt===previous.lastSeenAt&&memory.confidence>previous.confidence)byId[memory.id]=memory;
    });
    var resolved=Object.keys(byId).sort().map(function(id){return applyFeedback(byId[id],events,now);});
    return {
      memories:rank(resolved,options.limit||12),
      confirmed:resolved.filter(function(memory){return memory.status==='confirmed';}),
      candidates:resolved.filter(function(memory){return memory.status==='candidate'||memory.status==='tentative';}),
      suppressed:resolved.filter(function(memory){return memory.status==='suppressed';})
    };
  }
  function feedbackPayload(memory,verdict,correctedText){
    if(!memory||!memory.id||!memory.evidenceKey||!MEMORY_VERDICTS[verdict])return null;
    var payload={memoryId:memory.id,evidenceKey:memory.evidenceKey,verdict:verdict};
    if(verdict==='corrected'){
      payload.correctedText=cleanText(correctedText,240);
      if(!payload.correctedText)return null;
    }
    return payload;
  }

  B.memoryModel={
    DAY:DAY,
    OUTCOMES:clone(OUTCOMES),
    STRATEGIES:clone(STRATEGIES),
    evidenceKey:evidenceKey,
    matchingInsightFeedback:matchingInsightFeedback,
    patternMemory:patternMemory,
    patternMemories:patternMemories,
    observationFromFeedback:observationFromFeedback,
    storedPatternMemories:storedPatternMemories,
    completedExperiments:completedExperiments,
    strategyMemories:strategyMemories,
    latestMemoryFeedback:latestMemoryFeedback,
    applyFeedback:applyFeedback,
    feedbackPayload:feedbackPayload,
    rank:rank,
    derive:derive
  };
})(window);
