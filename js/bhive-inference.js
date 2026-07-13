/* B HIVE — deterministic inference (Stage 2)
   Pure evidence analysis. No DOM, storage, network, or state mutation. */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var DAY=86400000;

  function clamp01(n){return n<0?0:n>1?1:n;}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return null;}}
  function dayKey(ts){
    if(B.learningTools)return B.learningTools.dayKey(ts);
    var d=new Date(ts);
    return isNaN(d.getTime())?'':d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  }
  function validNow(now){return typeof now==='number'&&isFinite(now)&&now>0;}
  function unique(values){
    var seen={},out=[];
    values.forEach(function(v){if(v&&!seen[v]){seen[v]=1;out.push(v);}});
    return out;
  }
  function cellLabel(cell){return (cell&&cell.label)||(cell&&cell.key)||'This cell';}
  function confidenceLabel(score){
    return score>=0.72?'strong pattern':score>=0.50?'growing pattern':'early signal';
  }
  function observationBase(data){
    data.confidence=clamp01(data.confidence||0);
    data.confidenceLabel=confidenceLabel(data.confidence);
    data.evidenceEventIds=unique(data.evidenceEventIds||[]);
    data.recency=clamp01(data.recency===undefined?1:data.recency);
    data.actionability=clamp01(data.actionability===undefined?0.5:data.actionability);
    data.novelty=clamp01(data.novelty===undefined?0.7:data.novelty);
    data.impact=clamp01(data.impact===undefined?0.5:data.impact);
    return data;
  }

  function dailyCellSamples(events,cellKey,windowDays,now){
    if(!validNow(now)||!cellKey||!Array.isArray(events))return [];
    var cutoff=now-Math.max(1,windowDays||28)*DAY,byDay={};
    events.forEach(function(e){
      if(!e||e.type!=='checkin_completed'||typeof e.ts!=='number'||e.ts<cutoff||e.ts>now)return;
      var c=e.payload&&e.payload.cells&&e.payload.cells[cellKey];
      if(!c||typeof c.en!=='number'||typeof c.imp!=='number')return;
      var day=dayKey(e.ts),prev=byDay[day];
      if(day&&(!prev||e.ts>prev.ts))byDay[day]={
        day:day,ts:e.ts,imp:c.imp,en:c.en,eventId:e.id
      };
    });
    return Object.keys(byDay).map(function(k){return byDay[k];}).sort(function(a,b){return a.ts-b.ts;});
  }

  function trendObservation(events,cell,windowDays,now){
    var samples=dailyCellSamples(events,cell&&cell.key,windowDays,now);
    var base={
      id:'obs_trend_'+((cell&&cell.key)||'unknown')+'_'+windowDays+'d',kind:'trend',
      status:'insufficient',classification:'insufficient',cellKeys:cell&&cell.key?[cell.key]:[],
      windowDays:windowDays,calculatedAt:now,sampleCount:samples.length,
      evidenceEventIds:samples.map(function(s){return s.eventId;})
    };
    if(samples.length<3||!validNow(now))return observationBase(base);
    var first=samples[0],last=samples[samples.length-1],delta=last.en-first.en;
    var min=first.en,max=first.en,absMove=0,flips=0,prevSign=0,i,move,sign;
    for(i=1;i<samples.length;i++){
      if(samples[i].en<min)min=samples[i].en;
      if(samples[i].en>max)max=samples[i].en;
      move=samples[i].en-samples[i-1].en;
      absMove+=Math.abs(move);sign=move>0?1:move<0?-1:0;
      if(sign&&prevSign&&sign!==prevSign)flips++;
      if(sign)prevSign=sign;
    }
    var range=max-min,meanMove=absMove/(samples.length-1),classification='steady';
    if(range>=30&&flips>=1&&meanMove>=10)classification='volatile';
    else if(delta>=10)classification='rising';
    else if(delta<=-10)classification='falling';
    else if(Math.abs(delta)<=5&&range<=10)classification='flat';
    var spanDays=Math.max(1,Math.round((last.ts-first.ts)/DAY));
    var confidence=Math.min(0.82,0.35+Math.min(0.24,(samples.length-3)*0.06)+
      Math.min(0.12,spanDays/28*0.12)+(Math.abs(delta)>=20||range>=35?0.08:0));
    var label=cellLabel(cell),read='';
    if(classification==='rising')read=label+' energy rose '+Math.abs(delta)+' points across '+samples.length+' separate days.';
    else if(classification==='falling')read=label+' energy fell '+Math.abs(delta)+' points across '+samples.length+' separate days.';
    else if(classification==='volatile')read=label+' energy swung across a '+range+'-point range over '+samples.length+' separate days.';
    else if(classification==='flat')read=label+' energy stayed within a '+range+'-point range across '+samples.length+' separate days.';
    base.status='ready';base.classification=classification;base.value=delta;base.range=range;
    base.spanDays=spanDays;base.confidence=confidence;base.read=read;
    base.recency=clamp01(1-(now-last.ts)/(Math.max(1,windowDays)*DAY*2));
    base.actionability=classification==='flat'?0.45:0.75;base.novelty=0.78;
    base.impact=clamp01((last.imp||50)/100);
    return observationBase(base);
  }

  function latestCheckinForCell(events,key,now){
    var best=null;
    (events||[]).forEach(function(e){
      var c=e&&e.payload&&e.payload.cells&&e.payload.cells[key];
      if(e&&e.type==='checkin_completed'&&typeof e.ts==='number'&&e.ts<=now&&c&&
         typeof c.imp==='number'&&(!best||e.ts>best.ts))best={event:e,cell:c};
    });
    return best;
  }
  function meaningfulInteraction(e,key){
    if(!e||e.cellKey!==key)return false;
    if(e.type==='cell_value_changed'||e.type==='experiment_completed')return true;
    return e.type==='learning_added'&&e.payload&&e.payload.source==='you';
  }
  function neglectObservation(events,cell,now,options){
    options=options||{};
    var threshold=options.days||7,minImportance=options.minImportance||60;
    var base={id:'obs_neglect_'+((cell&&cell.key)||'unknown'),kind:'neglect',status:'insufficient',
      cellKeys:cell&&cell.key?[cell.key]:[],calculatedAt:now,evidenceEventIds:[]};
    if(!validNow(now)||!cell||!cell.key||!Array.isArray(events))return observationBase(base);
    var current=latestCheckinForCell(events,cell.key,now);
    if(!current||current.cell.imp<minImportance)return observationBase(base);
    var first=current.event,lastInteraction=null;
    events.forEach(function(e){
      if(e&&e.type==='checkin_completed'&&e.ts<=now&&e.payload&&e.payload.cells&&e.payload.cells[cell.key]&&e.ts<first.ts)first=e;
      if(meaningfulInteraction(e,cell.key)&&e.ts<=now&&(!lastInteraction||e.ts>lastInteraction.ts))lastInteraction=e;
    });
    var anchor=lastInteraction||first,days=Math.floor((now-anchor.ts)/DAY);
    if(days<threshold)return observationBase(base);
    var confidence=Math.min(0.76,0.42+Math.min(0.20,(days-threshold)*0.02)+(current.cell.imp>=80?0.08:0));
    base.status='ready';base.days=days;base.importance=current.cell.imp;base.confidence=confidence;
    base.read=cellLabel(cell)+' is marked '+current.cell.imp+'/100 important and has had no meaningful interaction for '+days+' days.';
    base.evidenceEventIds=[current.event.id,anchor.id];base.recency=1;base.actionability=0.92;
    base.novelty=0.72;base.impact=clamp01(current.cell.imp/100);
    return observationBase(base);
  }

  function normalizeText(text){return ' '+String(text||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()+' ';}
  function matchesTheme(text,theme){
    var normalized=normalizeText(text),terms=(theme&&theme.terms)||[],exclude=(theme&&theme.excludeTerms)||[],i,term;
    for(i=0;i<exclude.length;i++)if(normalized.indexOf(normalizeText(exclude[i]))>=0)return false;
    for(i=0;i<terms.length;i++){
      term=normalizeText(terms[i]);
      if(term.trim()&&normalized.indexOf(term)>=0)return true;
    }
    return false;
  }
  function userTextEvent(e){
    if(!e||!e.payload)return null;
    if(e.type==='learning_added'&&e.payload.source==='you'&&e.payload.timestampKnown!==false)return e.payload.text||'';
    if(e.type==='queen_message'&&e.payload.role==='user')return e.payload.content||'';
    return null;
  }
  function themeObservations(events,themes,now,options){
    options=options||{};
    var windowDays=options.windowDays||28,minDays=options.minDays||3;
    if(!validNow(now)||!Array.isArray(events))return [];
    themes=Array.isArray(themes)?themes:[];
    var cutoff=now-windowDays*DAY,out=[];
    themes.forEach(function(theme){
      var byDay={};
      events.forEach(function(e){
        if(!e||typeof e.ts!=='number'||e.ts<cutoff||e.ts>now)return;
        var text=userTextEvent(e),day;
        if(text===null||!matchesTheme(text,theme))return;
        day=dayKey(e.ts);
        if(day&&!byDay[day])byDay[day]=e;
      });
      var matched=Object.keys(byDay).map(function(k){return byDay[k];}).sort(function(a,b){return a.ts-b.ts;});
      if(matched.length<minDays)return;
      var spanDays=Math.max(1,Math.round((matched[matched.length-1].ts-matched[0].ts)/DAY));
      var confidence=Math.min(0.82,0.46+Math.min(0.24,(matched.length-minDays)*0.06)+Math.min(0.12,spanDays/28*0.12));
      out.push(observationBase({
        id:'obs_theme_'+theme.id+'_'+windowDays+'d',kind:'theme',status:'ready',themeId:theme.id,
        cellKeys:unique(matched.map(function(e){return e.cellKey;})),windowDays:windowDays,
        distinctDays:matched.length,spanDays:spanDays,calculatedAt:now,confidence:confidence,
        read:theme.label+' has appeared on '+matched.length+' separate days in the last '+windowDays+' days.',
        evidenceEventIds:matched.map(function(e){return e.id;}),recency:1,actionability:0.68,novelty:0.82,impact:0.68
      }));
    });
    return out;
  }

  function scoreObservation(obs,options){
    options=options||{};
    if(!obs||obs.status!=='ready'||!obs.evidenceEventIds||!obs.evidenceEventIds.length)return -1;
    var recent=options.recentInsightIds||[],repeat=recent.indexOf(obs.id)>=0?0.35:0;
    var uncertainty=clamp01(obs.uncertaintyPenalty||0);
    var score=clamp01(obs.confidence)*clamp01(obs.recency)*
      (0.35+0.65*clamp01(obs.actionability))*(0.35+0.65*clamp01(obs.novelty))*
      (0.35+0.65*clamp01(obs.impact))-repeat-uncertainty*0.12;
    return Math.round(score*10000)/10000;
  }
  function rankInsights(observations,options){
    var ranked=(observations||[]).map(function(obs){
      return {observation:clone(obs),score:scoreObservation(obs,options)};
    }).filter(function(x){return x.score>=0.08;});
    ranked.sort(function(a,b){return b.score-a.score||a.observation.id.localeCompare(b.observation.id);});
    return {
      primary:ranked[0]||null,
      secondary:ranked[1]||null,
      count:ranked.length
    };
  }
  function generate(events,cells,now,options){
    options=options||{};
    var observations=[],themes=options.themes||((root.BHIVE_DATA||{}).INFERENCE_THEMES||[]);
    (cells||[]).forEach(function(cell){
      var trend=trendObservation(events,cell,7,now);
      if(trend.status==='insufficient')trend=trendObservation(events,cell,28,now);
      if(trend.status==='ready'&&trend.classification!=='steady')observations.push(trend);
      var neglect=neglectObservation(events,cell,now,options.neglect);
      if(neglect.status==='ready')observations.push(neglect);
    });
    observations=observations.concat(themeObservations(events,themes,now,options.themesOptions));
    return {observations:observations,insights:rankInsights(observations,options.ranking)};
  }

  B.inference={
    DAY:DAY,
    dailyCellSamples:dailyCellSamples,
    trendObservation:trendObservation,
    neglectObservation:neglectObservation,
    themeObservations:themeObservations,
    matchesTheme:matchesTheme,
    confidenceLabel:confidenceLabel,
    scoreObservation:scoreObservation,
    rankInsights:rankInsights,
    generate:generate
  };
})(window);
