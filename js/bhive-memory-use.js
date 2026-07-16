/* B HIVE - trusted memory consumer adapter (Stage 5C)
   Pure, bounded views for Queen context and deterministic recommendation signals. */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var DEFAULT_QUEEN_LIMIT=3,MAX_QUEEN_LIMIT=3,MAX_STRATEGIES=24;
  var POLARITIES={helpful:1,unhelpful:1};

  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
  function validNow(value){return typeof value==='number'&&isFinite(value)&&value>0;}
  function cleanId(value,max){return typeof value==='string'&&value&&value.length<=(max||120)?value:'';}
  function cleanText(value,max){
    var text=typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
    return text.length>=3?text.slice(0,max||240):'';
  }
  function hash(text){
    var h=2166136261,i;
    for(i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function stable(value){
    if(value===null||typeof value!=='object')return JSON.stringify(value);
    if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
    return '{'+Object.keys(value).sort().map(function(key){
      return JSON.stringify(key)+':'+stable(value[key]);
    }).join(',')+'}';
  }
  function uniqueIds(values,limit){
    var seen={},out=[];
    if(!Array.isArray(values))return out;
    values.some(function(value){
      if(cleanId(value)&&!seen[value]){seen[value]=1;out.push(value);}
      return out.length>=(limit||200);
    });
    return out;
  }
  function eventIndex(events){
    var out={},duplicate={};
    (events||[]).forEach(function(event){
      var id=cleanId(event&&event.id);
      if(!id)return;
      if(out[id])duplicate[id]=1;
      else out[id]=event;
    });
    return {events:out,duplicate:duplicate};
  }
  function canonicalEvidence(memory,index,events,now,model){
    if(!memory||!model||typeof model.evidenceKey!=='function')return null;
    var source=memory.evidenceEventIds;
    if(!Array.isArray(source)||!source.length)return null;
    var ids=uniqueIds(source,200);
    if(ids.length!==source.length||model.evidenceKey(ids)!==memory.evidenceKey)return null;
    var valid=true;
    ids.forEach(function(id){
      var event=index.events[id];
      if(index.duplicate[id]||!event||event.id!==id||!validNow(event.ts)||event.ts>now)valid=false;
    });
    return valid?ids:null;
  }
  function scopeFor(memory){
    var cell=cleanId(memory&&memory.cellKey,80),theme=cleanId(memory&&memory.themeId,80);
    return cell&&!theme?cell:theme&&!cell?theme:'';
  }
  function queenLimit(value){
    if(typeof value!=='number'||!isFinite(value))return DEFAULT_QUEEN_LIMIT;
    return Math.max(0,Math.min(MAX_QUEEN_LIMIT,Math.floor(value)));
  }
  function trustedMemory(memory,index,events,now,model){
    if(!memory||memory.status!=='confirmed'||
       (memory.userVerdict!=='true'&&memory.userVerdict!=='corrected'))return null;
    var id=cleanId(memory.id),key=cleanId(memory.evidenceKey,12000);
    var statement=cleanText(memory.statement,240),ids=canonicalEvidence(memory,index,events,now,model);
    if(!id||!key||!statement||!ids)return null;
    var feedbackId=cleanId(memory.feedbackEventId),feedback=feedbackId&&index.events[feedbackId];
    if(feedbackId){
      var payload=feedback&&feedback.payload;
      if(!feedback||index.duplicate[feedbackId]||feedback.type!=='memory_feedback'||
         !validNow(feedback.ts)||feedback.ts>now||!payload||payload.memoryId!==memory.id||
         payload.evidenceKey!==memory.evidenceKey||payload.verdict!==memory.userVerdict||
         memory.userVerdict==='corrected'&&cleanText(payload.correctedText,240)!==statement)return null;
    }else if(memory.userVerdict==='corrected')return null;
    return {memory:memory,evidenceEventIds:ids};
  }
  function queenDTO(trusted){
    var memory=trusted.memory;
    var dto={
      id:memory.id,
      kind:cleanId(memory.kind,40)||'memory',
      source:cleanId(memory.source,80)||'derived',
      statement:cleanText(memory.statement,240),
      cellKey:cleanId(memory.cellKey,80)||null,
      themeId:cleanId(memory.themeId,80)||null,
      userVerdict:memory.userVerdict
    };
    if(memory.userVerdict!=='corrected'){
      dto.strategyId=cleanId(memory.strategyId,80)||null;
      dto.polarity=POLARITIES[memory.polarity]?memory.polarity:null;
    }
    return dto;
  }
  function queenIdentity(trusted){
    var memory=trusted.memory;
    return {
      id:memory.id,evidenceKey:memory.evidenceKey,status:memory.status,
      statement:cleanText(memory.statement,240),source:cleanId(memory.source,80)||'derived',
      userVerdict:memory.userVerdict,feedbackEventId:cleanId(memory.feedbackEventId)||null
    };
  }
  function strategyDTO(trusted,index,now,model){
    var memory=trusted.memory,strategies=model.STRATEGIES||{},scope=scopeFor(memory);
    if(memory.kind!=='strategy'||memory.source!=='experiment_outcomes'||memory.userVerdict!=='true'||
       !strategies[memory.strategyId]||!POLARITIES[memory.polarity]||!scope)return null;
    var feedbackId=cleanId(memory.feedbackEventId),feedback=feedbackId&&index.events[feedbackId];
    var payload=feedback&&feedback.payload;
    if(!feedback||index.duplicate[feedbackId]||feedback.type!=='memory_feedback'||
       !validNow(feedback.ts)||feedback.ts>now||!payload||payload.memoryId!==memory.id||
       payload.evidenceKey!==memory.evidenceKey||payload.verdict!=='true')return null;
    return {
      memoryId:memory.id,
      evidenceKey:memory.evidenceKey,
      feedbackEventId:feedbackId,
      strategyId:memory.strategyId,
      polarity:memory.polarity,
      scope:scope,
      sourceEvidenceIds:trusted.evidenceEventIds.slice()
    };
  }
  function compareTrusted(a,b){
    var am=a.memory,bm=b.memory;
    return (bm.confidence||0)-(am.confidence||0)||
      (bm.lastSeenAt||0)-(am.lastSeenAt||0)||am.id.localeCompare(bm.id);
  }
  function empty(){return {queen:[],strategies:[],fingerprint:'memory_use_'+hash('[]'),modelVersion:1};}

  function derive(events,cells,now,options){
    options=options||{};
    var model=B.memoryModel;
    if(!Array.isArray(events)||!Array.isArray(cells)||!validNow(now)||!model||
       typeof model.derive!=='function'||typeof model.evidenceKey!=='function')return empty();
    var deriveOptions={};
    if(Array.isArray(options.observations))deriveOptions.observations=options.observations;
    var resolved;
    try{resolved=model.derive(events,cells,now,deriveOptions);}catch(e){return empty();}
    if(!resolved||!Array.isArray(resolved.confirmed))return empty();
    var index=eventIndex(events),trusted=[];
    resolved.confirmed.forEach(function(memory){
      var item=trustedMemory(memory,index,events,now,model);
      if(item)trusted.push(item);
    });
    trusted.sort(compareTrusted);
    var qLimit=queenLimit(options.queenLimit);
    var selectedQueen=trusted.slice(0,qLimit),queen=selectedQueen.map(queenDTO);
    var strategies=[];
    trusted.forEach(function(item){
      var dto=strategyDTO(item,index,now,model);
      if(dto)strategies.push(dto);
    });
    strategies.sort(function(a,b){
      return a.strategyId.localeCompare(b.strategyId)||a.scope.localeCompare(b.scope)||
        a.memoryId.localeCompare(b.memoryId)||a.evidenceKey.localeCompare(b.evidenceKey);
    });
    strategies=strategies.slice(0,MAX_STRATEGIES);
    var result={queen:queen,strategies:strategies,
      fingerprint:'memory_use_'+hash(stable(selectedQueen.map(queenIdentity))),
      modelVersion:1};
    return clone(result)||empty();
  }

  function strategyIdFor(candidate){
    return cleanId(typeof candidate==='string'?candidate:candidate&&candidate.strategyId,80);
  }
  function overlaps(left,right){
    var seen={},hit=false;
    uniqueIds(left,200).forEach(function(id){seen[id]=1;});
    uniqueIds(right,200).forEach(function(id){if(seen[id])hit=true;});
    return hit;
  }
  function strategySignal(context,candidate,scope,sourceEvidenceIds){
    var strategyId=strategyIdFor(candidate),cleanScope=cleanId(scope,80);
    if(!context||!Array.isArray(context.strategies)||!strategyId||!cleanScope||
       !Array.isArray(sourceEvidenceIds))return null;
    var match=null;
    context.strategies.some(function(item){
      if(!item||item.strategyId!==strategyId||item.scope!==cleanScope||
         overlaps(item.sourceEvidenceIds,sourceEvidenceIds))return false;
      match=item;return true;
    });
    if(!match)return null;
    var influence=match.polarity==='unhelpful'?'veto':match.polarity==='helpful'?'preference':'';
    if(!influence)return null;
    return {
      strategyId:strategyId,scope:cleanScope,influence:influence,
      provenance:{memoryId:match.memoryId,evidenceKey:match.evidenceKey,
        feedbackEventId:match.feedbackEventId,influence:influence}
    };
  }
  function validateProvenance(provenance,context){
    if(!provenance||!context||!Array.isArray(context.strategies))return false;
    var memoryId=cleanId(provenance.memoryId),key=cleanId(provenance.evidenceKey,12000);
    var feedbackId=cleanId(provenance.feedbackEventId),influence=provenance.influence;
    if(!memoryId||!key||!feedbackId||(influence!=='preference'&&influence!=='veto'))return false;
    return context.strategies.some(function(item){
      var expected=item&&item.polarity==='unhelpful'?'veto':item&&item.polarity==='helpful'?'preference':'';
      return item&&item.memoryId===memoryId&&item.evidenceKey===key&&
        item.feedbackEventId===feedbackId&&expected===influence;
    });
  }

  function currentChat(messages,fingerprint,limit){
    var current=[],stale=0,cleanFingerprint=typeof fingerprint==='string'?fingerprint:'';
    limit=typeof limit==='number'&&isFinite(limit)?Math.max(1,Math.min(24,Math.floor(limit))):24;
    (Array.isArray(messages)?messages:[]).forEach(function(message){
      if(!message||(message.role!=='user'&&message.role!=='assistant')||
         typeof message.content!=='string')return;
      if(message.role==='assistant'&&(typeof message.memoryFingerprint==='string'?message.memoryFingerprint:'')!==cleanFingerprint){
        stale++;return;
      }
      var copy={role:message.role,content:message.content};
      if(message.role==='assistant')copy.memoryFingerprint=cleanFingerprint;
      current.push(copy);
    });
    return {messages:current.slice(-limit),staleAssistantCount:stale};
  }

  B.memoryUse={
    derive:derive,
    strategySignal:strategySignal,
    validateProvenance:validateProvenance,
    currentChat:currentChat
  };
})(window);
