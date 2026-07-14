/* B HIVE - deterministic weekly memory review (Stage 5B)
   Pure review proposal, lifecycle, and completion utilities. */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var DAY=86400000;
  var VERDICTS={true:1,partly:1,wrong:1,corrected:1};

  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
  function validNow(value){return typeof value==='number'&&isFinite(value)&&value>0;}
  function cleanText(value,max){
    var text=typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
    return text.length>=3?text.slice(0,max||240):'';
  }
  function cleanId(value,max){
    return typeof value==='string'&&value&&value.length<=(max||120)?value:'';
  }
  function hash(text){
    var h=2166136261,i;
    for(i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  }
  function dayKey(ts){
    if(B.learningTools)return B.learningTools.dayKey(ts);
    var d=new Date(ts);
    return isNaN(d.getTime())?'':d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  }
  function uniqueIds(values,limit){
    var seen={},out=[];
    (values||[]).some(function(value){
      if(cleanId(value)&&!seen[value]){seen[value]=1;out.push(value);}
      return out.length>=(limit||24);
    });
    return out;
  }
  function scopeId(value){return cleanId(value,80)||null;}
  function memorySnapshot(memory){
    if(!memory||typeof memory!=='object')return null;
    var memoryId=cleanId(memory.memoryId||memory.id),key=cleanId(memory.evidenceKey,4000);
    var statement=cleanText(memory.statement,240),status=memory.status;
    var evidenceEventIds=uniqueIds(memory.evidenceEventIds,24);
    if(!memoryId||!key||!statement||!evidenceEventIds.length||
       (status!=='candidate'&&status!=='tentative'))return null;
    var confidence=typeof memory.confidence==='number'&&isFinite(memory.confidence)?memory.confidence:0;
    confidence=Math.max(0,Math.min(1,confidence));
    return {
      memoryId:memoryId,evidenceKey:key,statement:statement,status:status,
      source:cleanId(memory.source,80)||'derived',
      confidence:Math.round(confidence*10000)/10000,
      cellKey:scopeId(memory.cellKey),themeId:scopeId(memory.themeId),strategyId:scopeId(memory.strategyId),
      evidenceEventIds:evidenceEventIds
    };
  }
  function candidateMemories(model,limit){
    limit=Math.max(1,Math.min(3,limit||3));
    var seen={};
    return ((model&&model.candidates)||[]).map(function(source){
      if(!source||source.feedbackEventId)return null;
      return memorySnapshot(source);
    }).filter(function(memory){
      if(!memory)return false;
      var key=memory.memoryId+'|'+memory.evidenceKey;
      if(seen[key])return false;
      seen[key]=1;return true;
    }).sort(function(a,b){
      return b.confidence-a.confidence||a.status.localeCompare(b.status)||a.memoryId.localeCompare(b.memoryId);
    }).slice(0,limit).map(function(memory){return clone(memory);});
  }
  function normalizeReview(raw){
    if(!raw||typeof raw!=='object'||!cleanId(raw.reviewId)||!validNow(raw.createdAt)||
       !Array.isArray(raw.items)||!raw.items.length||raw.items.length>3)return null;
    var seen={},items=[];
    raw.items.forEach(function(item){
      var snapshot=memorySnapshot(item),key=snapshot&&(snapshot.memoryId+'|'+snapshot.evidenceKey);
      if(snapshot&&key&&!seen[key]){seen[key]=1;items.push(snapshot);}
    });
    if(items.length!==raw.items.length)return null;
    return {reviewId:raw.reviewId,createdAt:Math.floor(raw.createdAt),items:items};
  }
  function startPayload(review){
    var clean=normalizeReview(review);
    return clean?clone(clean):null;
  }
  function startedReview(event){
    if(!event||event.type!=='weekly_review_started'||!cleanId(event.id)||!validNow(event.ts))return null;
    var review=normalizeReview(event.payload);
    if(!review||review.createdAt>event.ts)return null;
    review.status='active';review.startedAt=Math.floor(event.ts);review.startedEventId=event.id;
    return review;
  }
  function normalizeCompletion(raw){
    if(!raw||typeof raw!=='object'||!cleanId(raw.reviewId)||!Array.isArray(raw.items)||
       !raw.items.length||raw.items.length>3)return null;
    var seen={},items=[];
    raw.items.forEach(function(item){
      var memoryId=cleanId(item&&item.memoryId),key=cleanId(item&&item.evidenceKey,4000);
      var feedbackEventId=cleanId(item&&item.feedbackEventId),verdict=item&&item.verdict;
      var unique=memoryId&&key&&(memoryId+'|'+key);
      if(!unique||!feedbackEventId||!VERDICTS[verdict]||seen[unique])return;
      seen[unique]=1;
      items.push({memoryId:memoryId,evidenceKey:key,feedbackEventId:feedbackEventId,verdict:verdict});
    });
    return items.length===raw.items.length?{reviewId:raw.reviewId,items:items}:null;
  }
  function ordered(events,type,now){
    return (events||[]).map(function(event,index){return {event:event,index:index};}).filter(function(item){
      return item.event&&item.event.type===type&&validNow(item.event.ts)&&(!validNow(now)||item.event.ts<=now);
    }).sort(function(a,b){return a.event.ts-b.event.ts||a.index-b.index;});
  }
  function allStarted(events,now){
    return ordered(events,'weekly_review_started',now).map(function(item){
      return {review:startedReview(item.event),index:item.index};
    }).filter(function(item){return !!item.review;});
  }
  function validCompletionFor(completion,review,events,completedAt){
    if(!completion||!review||completion.items.length!==review.items.length)return false;
    var feedbackById={},reviewItems={},valid=true;
    (events||[]).forEach(function(event){if(event&&event.id)feedbackById[event.id]=event;});
    review.items.forEach(function(item){reviewItems[item.memoryId+'|'+item.evidenceKey]=1;});
    completion.items.forEach(function(item){
      var key=item.memoryId+'|'+item.evidenceKey,event=feedbackById[item.feedbackEventId];
      var payload=event&&event.payload;
      if(!reviewItems[key]||!event||event.type!=='memory_feedback'||!validNow(event.ts)||event.ts<review.startedAt||
         event.ts>completedAt||!payload||payload.memoryId!==item.memoryId||
         payload.evidenceKey!==item.evidenceKey||payload.verdict!==item.verdict||
         payload.reviewId&&payload.reviewId!==review.reviewId||
         payload.verdict==='corrected'&&!cleanText(payload.correctedText,240))valid=false;
    });
    return valid;
  }
  function completionFor(review,events,now){
    var latest=null;
    ordered(events,'weekly_review_completed',now).forEach(function(item){
      var clean=normalizeCompletion(item.event.payload);
      if(clean&&review&&clean.reviewId===review.reviewId&&item.event.ts>=review.startedAt&&
         validCompletionFor(clean,review,events,item.event.ts)){
        latest={event:clone(item.event),payload:clean,index:item.index};
      }
    });
    return latest;
  }
  function latestStarted(events,now){
    var starts=allStarted(events,now),latest=starts[starts.length-1];
    return latest?clone(latest.review):null;
  }
  function activeReview(events,now){
    if(!validNow(now))return null;
    var review=latestStarted(events,now);
    return review&&!completionFor(review,events,now)?review:null;
  }
  function latestCompleted(events,now){
    if(!validNow(now))return null;
    var starts=allStarted(events,now),latest=null;
    starts.forEach(function(item){
      var completed=completionFor(item.review,events,now);
      if(completed&&(!latest||completed.event.ts>latest.event.ts||
         completed.event.ts===latest.event.ts&&completed.index>latest.index))latest=completed;
    });
    return latest?clone(latest.event):null;
  }
  function latestCompletedToday(events,now){
    var latest=latestCompleted(events,now);
    return latest&&dayKey(latest.ts)===dayKey(now)?latest:null;
  }
  function latestFeedback(item,review,events,now){
    var latest=null;
    ordered(events,'memory_feedback',now).forEach(function(entry){
      var event=entry.event,payload=event.payload;
      if(event.ts<review.startedAt||!payload||payload.memoryId!==item.memoryId||
         payload.evidenceKey!==item.evidenceKey||!VERDICTS[payload.verdict]||
         payload.reviewId&&payload.reviewId!==review.reviewId||
         payload.verdict==='corrected'&&!cleanText(payload.correctedText,240))return;
      latest={event:event,index:entry.index};
    });
    return latest;
  }
  function resolve(review,events,now){
    var clean=normalizeReview(review);
    if(!clean||!validNow(review.startedAt)||!validNow(now)||review.startedAt>now)return null;
    clean.status='active';clean.startedAt=Math.floor(review.startedAt);
    clean.startedEventId=cleanId(review.startedEventId)||null;
    var answered=0;
    clean.items=clean.items.map(function(item){
      var match=latestFeedback(item,clean,events,now),out=clone(item),payload=match&&match.event.payload;
      if(payload){
        answered++;out.feedbackEventId=match.event.id;out.verdict=payload.verdict;
        out.answeredAt=match.event.ts;
        if(payload.verdict==='corrected')out.correctedText=cleanText(payload.correctedText,240);
      }
      return out;
    });
    clean.answered=answered;clean.complete=answered===clean.items.length;
    return clean;
  }
  function completionPayload(review,events,now){
    var resolved=resolve(review,events,now);
    if(!resolved||!resolved.complete||completionFor(resolved,events,now))return null;
    return {
      reviewId:resolved.reviewId,
      items:resolved.items.map(function(item){
        return {memoryId:item.memoryId,evidenceKey:item.evidenceKey,
          feedbackEventId:item.feedbackEventId,verdict:item.verdict};
      })
    };
  }
  function proposal(model,events,now,options){
    options=options||{};
    if(!validNow(now)||activeReview(events,now))return null;
    var cooldownDays=Math.max(1,Math.min(90,options.cooldownDays||7));
    var completed=latestCompleted(events,now);
    if(completed&&now-completed.ts<cooldownDays*DAY)return null;
    var items=candidateMemories(model,options.limit||3);
    if(!items.length)return null;
    return {
      reviewId:'review_'+dayKey(now)+'_'+hash(items.map(function(item){
        return item.memoryId+'|'+item.evidenceKey;
      }).join('||')),
      createdAt:Math.floor(now),status:'proposal',items:items
    };
  }
  function state(model,events,now,options){
    var active=activeReview(events,now);
    if(active)return {kind:'active',review:resolve(active,events,now)};
    var completed=latestCompletedToday(events,now);
    if(completed)return {kind:'completed',event:completed};
    var proposed=proposal(model,events,now,options);
    return proposed?{kind:'proposal',review:proposed}:{kind:'quiet'};
  }

  B.review={
    DAY:DAY,
    candidateMemories:candidateMemories,
    normalizeReview:normalizeReview,
    startPayload:startPayload,
    startedReview:startedReview,
    latestStarted:latestStarted,
    activeReview:activeReview,
    latestCompleted:latestCompleted,
    latestCompletedToday:latestCompletedToday,
    resolve:resolve,
    completionPayload:completionPayload,
    proposal:proposal,
    state:state
  };
})(window);
