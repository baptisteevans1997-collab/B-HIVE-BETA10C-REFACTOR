/* B HIVE — durable learning event store (schema v4)
   Append-only evidence utilities. No DOM or storage access. */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var TYPES={
    checkin_completed:1,
    learning_added:1,
    cell_unlocked:1,
    cell_value_changed:1,
    queen_message:1,
    insight_feedback:1,
    experiment_accepted:1,
    experiment_edited:1,
    experiment_declined:1,
    experiment_completed:1,
    weekly_review_completed:1
  };

  function isObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v);}
  function clone(v){
    try{return JSON.parse(JSON.stringify(v));}catch(e){return null;}
  }
  function stable(v){
    if(v===null||typeof v!=='object')return JSON.stringify(v);
    if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
    return '{'+Object.keys(v).sort().map(function(k){
      return JSON.stringify(k)+':'+stable(v[k]);
    }).join(',')+'}';
  }
  function hash(s){
    var h=2166136261,i;
    for(i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return (h>>>0).toString(36);
  }
  function dayKey(ts){
    var d=new Date(ts);
    if(isNaN(d.getTime()))return '';
    return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  }
  function emptyState(){
    return {
      events:[],observations:[],hypotheses:[],experiments:[],feedback:[],insightQueue:[],
      modelVersion:1
    };
  }
  function validCellKey(key){
    return !key||(typeof key==='string'&&(!B.CELL_DEFAULTS||!!B.CELL_DEFAULTS[key]));
  }
  function normalizeEvent(raw){
    if(!isObject(raw)||typeof raw.id!=='string'||!raw.id||raw.id.length>120)return null;
    if(!TYPES[raw.type]||typeof raw.ts!=='number'||!isFinite(raw.ts)||raw.ts<=0)return null;
    if(!validCellKey(raw.cellKey))return null;
    var payload=isObject(raw.payload)?clone(raw.payload):{};
    if(payload===null)return null;
    return {
      id:raw.id,
      type:raw.type,
      ts:Math.floor(raw.ts),
      cellKey:raw.cellKey||null,
      payload:payload
    };
  }
  function createEvent(type,details){
    details=details||{};
    if(!TYPES[type])return null;
    var ts=typeof details.ts==='number'?Math.floor(details.ts):Date.now();
    var cellKey=details.cellKey||null;
    var payload=isObject(details.payload)?clone(details.payload):{};
    if(!isFinite(ts)||ts<=0||!validCellKey(cellKey)||payload===null)return null;
    var base=type+'|'+ts+'|'+(cellKey||'')+'|'+stable(payload);
    return normalizeEvent({
      id:details.id||('evt_'+ts+'_'+hash(base)),
      type:type,ts:ts,cellKey:cellKey,payload:payload
    });
  }
  function appendEvent(state,event){
    if(!state||!Array.isArray(state.events))return false;
    var clean=normalizeEvent(event),i;
    if(!clean)return false;
    for(i=0;i<state.events.length;i++)if(state.events[i]&&state.events[i].id===clean.id)return false;
    state.events.push(clean);
    return clean;
  }
  function copyList(v){return Array.isArray(v)?(clone(v)||[]):[];}
  function normalizeState(raw){
    var out=emptyState(),seen={},i,e;
    if(!isObject(raw))return out;
    if(typeof raw.modelVersion==='number'&&raw.modelVersion>0)out.modelVersion=Math.floor(raw.modelVersion);
    if(Array.isArray(raw.events))for(i=0;i<raw.events.length;i++){
      e=normalizeEvent(raw.events[i]);
      if(e&&!seen[e.id]){seen[e.id]=1;out.events.push(e);}
    }
    out.observations=copyList(raw.observations);
    out.hypotheses=copyList(raw.hypotheses);
    out.experiments=copyList(raw.experiments);
    out.feedback=copyList(raw.feedback);
    out.insightQueue=copyList(raw.insightQueue);
    return out;
  }
  function migratedId(kind,value){return 'evt_migrated_'+kind+'_'+hash(value);}
  function migrateV3(snapshot){
    var out=emptyState(),history=(snapshot&&snapshot.history)||[],learnings=(snapshot&&snapshot.learnings)||{};
    var fallbackTs=(snapshot&&typeof snapshot.ts==='number'&&snapshot.ts>0)?snapshot.ts:1;
    history.forEach(function(entry,i){
      if(!entry||typeof entry!=='object')return;
      var ts=(typeof entry.ts==='number'&&entry.ts>0)?entry.ts:fallbackTs+i;
      appendEvent(out,createEvent('checkin_completed',{
        id:migratedId('checkin',String(ts)+'|'+i),ts:ts,
        payload:{
          cells:clone(entry.cells)||{},under:entry.under||0,aligned:entry.aligned||0,
          dormant:entry.dormant||0,leak:entry.leak||0,migrated:true
        }
      }));
    });
    Object.keys(learnings).sort().forEach(function(key){
      var list=Array.isArray(learnings[key])?learnings[key]:[];
      list.forEach(function(item,i){
        if(!item||typeof item.t!=='string')return;
        var src=item.s||'you',q=typeof item.q==='string'?item.q:null;
        appendEvent(out,createEvent('learning_added',{
          id:migratedId('learning',key+'|'+i+'|'+item.t+'|'+src),ts:fallbackTs+i,
          cellKey:key,payload:{text:item.t,source:src,question:q,migrated:true,timestampKnown:false}
        }));
      });
    });
    ((snapshot&&snapshot.unlocks)||[]).forEach(function(key,i){
      if(!validCellKey(key))return;
      appendEvent(out,createEvent('cell_unlocked',{
        id:migratedId('unlock',key),ts:fallbackTs+i,cellKey:key,
        payload:{migrated:true,timestampKnown:false}
      }));
    });
    return out;
  }
  function ensureState(raw,snapshot){
    return isObject(raw)&&Array.isArray(raw.events)?normalizeState(raw):migrateV3(snapshot||{});
  }
  function selectEvents(state,filter){
    filter=filter||{};
    var events=state&&Array.isArray(state.events)?state.events:[];
    return events.filter(function(e){
      if(filter.type&&e.type!==filter.type)return false;
      if(filter.cellKey&&e.cellKey!==filter.cellKey)return false;
      if(typeof filter.since==='number'&&e.ts<filter.since)return false;
      if(typeof filter.until==='number'&&e.ts>filter.until)return false;
      return true;
    }).map(function(e){return clone(e);});
  }
  function activeDays(state,type){
    var seen={};
    selectEvents(state,type?{type:type}:{}).forEach(function(e){var d=dayKey(e.ts);if(d)seen[d]=1;});
    return Object.keys(seen).sort();
  }

  B.learningTools={
    TYPES:TYPES,
    emptyState:emptyState,
    normalizeState:normalizeState,
    createEvent:createEvent,
    appendEvent:appendEvent,
    ensureState:ensureState,
    migrateV3:migrateV3,
    selectEvents:selectEvents,
    activeDays:activeDays,
    dayKey:dayKey
  };
})(window);
