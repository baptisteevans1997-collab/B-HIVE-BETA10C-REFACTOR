/* B HIVE - compact Today experiment rendering (Stage 4) */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
        'Built from the read you confirmed and memory you reviewed.':
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
    toggleEditor:toggleEditor,
    readEdits:readEdits,
    toggleOutcomes:toggleOutcomes
  };
})(window);
