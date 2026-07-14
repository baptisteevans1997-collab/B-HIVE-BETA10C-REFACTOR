/* B HIVE - evidence-backed Today insight rendering (Stage 3) */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function dayKey(ts){
    if(B.learningTools)return B.learningTools.dayKey(ts);
    var d=new Date(ts);
    return isNaN(d.getTime())?'':d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  }
  function dateLabel(ts){
    var d=new Date(ts);
    return isNaN(d.getTime())?'Date unavailable':d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();
  }
  function safeId(value){return String(value||'insight').replace(/[^a-zA-Z0-9_-]+/g,'-');}
  function cellMap(cells){
    var out={};
    (cells||[]).forEach(function(cell){if(cell&&cell.key)out[cell.key]=cell;});
    return out;
  }
  function eventMap(events){
    var out={};
    (events||[]).forEach(function(event){if(event&&event.id)out[event.id]=event;});
    return out;
  }
  function evidenceSummary(event,observation,cells){
    if(!event)return 'Evidence record unavailable.';
    var payload=event.payload||{},labels=cellMap(cells),prefix=dateLabel(event.ts)+' - ',key,cell,value;
    if(event.type==='checkin_completed'){
      key=event.cellKey||((observation&&observation.cellKeys)||[]).filter(function(k){
        return payload.cells&&payload.cells[k];
      })[0];
      cell=payload.cells&&payload.cells[key];
      if(cell){
        return prefix+((labels[key]&&labels[key].label)||key||'Cell')+' check-in: energy '+cell.en+
          ', importance '+cell.imp+'.';
      }
      return prefix+'Check-in recorded.';
    }
    if(event.type==='learning_added')return prefix+'You wrote: &ldquo;'+B.esc(payload.text||'')+'&rdquo;';
    if(event.type==='queen_message'&&payload.role==='user')return prefix+'You told the Queen: &ldquo;'+B.esc(payload.content||'')+'&rdquo;';
    if(event.type==='cell_value_changed'){
      key=event.cellKey;value=payload.field||'value';
      return prefix+((labels[key]&&labels[key].label)||key||'Cell')+' '+B.esc(value)+' changed from '+
        B.esc(payload.from)+' to '+B.esc(payload.to)+'.';
    }
    return prefix+'Recorded '+B.esc(String(event.type||'evidence').replace(/_/g,' '))+'.';
  }
  function evidenceList(observation,events,cells){
    var byId=eventMap(events);
    return ((observation&&observation.evidenceEventIds)||[]).map(function(id){
      return '<li>'+evidenceSummary(byId[id],observation,cells)+'</li>';
    }).join('');
  }
  function renderInsight(observation,events,cells){
    if(!observation||!observation.read)return renderQuiet();
    var id=safeId(observation.id),panelId='td-evidence-'+id;
    return '<section class="td-insight" aria-labelledby="td-insight-title-'+id+'">'+
      '<div class="td-insight-head">'+
        '<span class="td-insight-k" id="td-insight-title-'+id+'">Hive noticed</span>'+
        '<span class="td-confidence">'+B.esc(observation.confidenceLabel||'early signal')+'</span>'+
      '</div>'+
      '<p class="td-insight-read">'+B.esc(observation.read)+'</p>'+
      '<button class="td-evidence-toggle" type="button" aria-expanded="false" aria-controls="'+panelId+'">Show evidence</button>'+
      '<div class="td-evidence" id="'+panelId+'" hidden><ol>'+evidenceList(observation,events,cells)+'</ol></div>'+
      '<div class="td-feedback" role="group" aria-label="Is this read right?">'+
        '<span class="td-feedback-q">Is this right?</span>'+
        '<button class="td-verdict" type="button" data-verdict="true" data-insight-id="'+B.esc(observation.id)+'">True</button>'+
        '<button class="td-verdict" type="button" data-verdict="partly" data-insight-id="'+B.esc(observation.id)+'">Partly</button>'+
        '<button class="td-verdict" type="button" data-verdict="wrong" data-insight-id="'+B.esc(observation.id)+'">Wrong</button>'+
        '<button class="td-verdict" type="button" data-verdict="not_now" data-insight-id="'+B.esc(observation.id)+'">Not now</button>'+
      '</div>'+
    '</section>';
  }
  function toggleEvidence(button){
    if(!button||!button.ownerDocument)return false;
    var panel=button.ownerDocument.getElementById(button.getAttribute('aria-controls'));
    if(!panel)return false;
    var opening=panel.hidden;
    panel.hidden=!opening;
    button.setAttribute('aria-expanded',opening?'true':'false');
    button.textContent=opening?'Hide evidence':'Show evidence';
    return opening;
  }
  function feedbackPayload(observation,verdict){
    var allowed={true:1,partly:1,wrong:1,not_now:1};
    if(!observation||!observation.id||!allowed[verdict]||!B.inference)return null;
    return {
      insightId:observation.id,
      evidenceKey:B.inference.evidenceKey(observation),
      evidenceEventIds:(observation.evidenceEventIds||[]).slice(),
      verdict:verdict
    };
  }
  function renderQuiet(){
    return '<div class="td-insight-quiet"><span>Hive is listening</span>Nothing strong enough yet. Keep feeding the hive.</div>';
  }
  function latestFeedbackToday(events,now){
    var today=dayKey(now),latest=null;
    (events||[]).forEach(function(event){
      if(event&&event.type==='insight_feedback'&&dayKey(event.ts)===today&&(!latest||event.ts>latest.ts))latest=event;
    });
    return latest;
  }
  function renderAnswered(event){
    var verdict=event&&event.payload&&event.payload.verdict;
    var messages={
      'true':'Got it. The Hive will weigh this pattern more carefully.',
      'partly':'Got it. The Hive will keep this pattern tentative.',
      'wrong':'Corrected. This evidence will not be shown as the same read again.',
      'not_now':'Paused. This read will stay out of the way for seven days.'
    };
    return '<div class="td-insight-answered" tabindex="-1"><span>Read logged</span>'+B.esc(messages[verdict]||'Your correction has been recorded.')+'</div>';
  }

  B.insightUI={
    dayKey:dayKey,
    dateLabel:dateLabel,
    evidenceSummary:evidenceSummary,
    evidenceList:evidenceList,
    renderInsight:renderInsight,
    toggleEvidence:toggleEvidence,
    feedbackPayload:feedbackPayload,
    renderQuiet:renderQuiet,
    latestFeedbackToday:latestFeedbackToday,
    renderAnswered:renderAnswered
  };
})(window);
