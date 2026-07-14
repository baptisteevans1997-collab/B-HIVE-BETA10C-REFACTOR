/* B HIVE - compact Today memory review rendering (Stage 5B) */
(function(root){
  'use strict';

  var B=root.BHIVE=root.BHIVE||{};
  var LABELS={true:'True',partly:'Partly',wrong:'Wrong',corrected:'Corrected'};

  function esc(value){
    if(B.esc)return B.esc(value);
    return String(value===undefined?'':value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }
  function safeId(value){return String(value||'memory').replace(/[^a-zA-Z0-9_-]+/g,'-');}
  function attrs(review,item){
    return ' data-review-id="'+esc(review.reviewId)+'" data-memory-id="'+esc(item.memoryId)+
      '" data-evidence-key="'+esc(item.evidenceKey)+'"';
  }
  function matchesReview(control,review){
    return !!(control&&review&&control.getAttribute('data-review-id')===review.reviewId);
  }
  function itemFor(control,review){
    if(!matchesReview(control,review))return null;
    var memoryId=control.getAttribute('data-memory-id');
    var evidenceKey=control.getAttribute('data-evidence-key'),match=null;
    (review.items||[]).some(function(item){
      if(item.memoryId===memoryId&&item.evidenceKey===evidenceKey){match=item;return true;}
      return false;
    });
    return match;
  }
  function renderProposal(review){
    if(!review||!review.items||!review.items.length)return '';
    var id=safeId(review.reviewId),count=review.items.length;
    return '<section class="td-memory td-memory-proposal" tabindex="-1" aria-labelledby="td-memory-title-'+id+'">'+
      '<div class="td-memory-head">'+
        '<span class="td-memory-k" id="td-memory-title-'+id+'">Weekly memory check</span>'+
        '<span class="td-memory-count">'+count+' read'+(count===1?'':'s')+'</span>'+
      '</div>'+
      '<p class="td-memory-intro">A few evidence-backed reads are ready for your call.</p>'+
      '<button class="td-memory-btn td-memory-start" type="button" data-review-id="'+esc(review.reviewId)+'">Review memories</button>'+
    '</section>';
  }
  function correctionEditor(review,item,id){
    var editorId='td-memory-correction-'+id;
    return '<div class="td-memory-corrector" id="'+editorId+'" hidden'+attrs(review,item)+'>'+
      '<label for="td-memory-input-'+id+'">Your correction</label>'+
      '<textarea id="td-memory-input-'+id+'" class="td-memory-input" minlength="3" maxlength="240" rows="2" required></textarea>'+
      '<div class="td-memory-editor-actions">'+
        '<button class="td-memory-btn td-memory-correct-save" type="button"'+attrs(review,item)+'>Save correction</button>'+
        '<button class="td-memory-btn td-memory-correct-cancel" type="button" aria-expanded="true" aria-controls="'+editorId+'"'+attrs(review,item)+'>Cancel</button>'+
      '</div>'+
    '</div>';
  }
  function memoryItem(review,item,index){
    var id=safeId(review.reviewId+'-'+item.memoryId+'-'+index),editorId='td-memory-correction-'+id;
    var answered=!!item.feedbackEventId;
    return '<div class="td-memory-item"'+attrs(review,item)+'>'+
      '<p class="td-memory-statement">'+esc(item.statement)+'</p>'+
      (answered?
        '<p class="td-memory-answer"><span>Recorded</span>'+esc(LABELS[item.verdict]||item.verdict)+'</p>':
        '<div class="td-memory-actions" role="group" aria-label="Is this memory accurate?">'+
          '<button class="td-memory-btn td-memory-verdict" type="button" data-verdict="true"'+attrs(review,item)+'>True</button>'+
          '<button class="td-memory-btn td-memory-verdict" type="button" data-verdict="partly"'+attrs(review,item)+'>Partly</button>'+
          '<button class="td-memory-btn td-memory-verdict" type="button" data-verdict="wrong"'+attrs(review,item)+'>Wrong</button>'+
          '<button class="td-memory-btn td-memory-correct-toggle" type="button" aria-expanded="false" aria-controls="'+editorId+'"'+attrs(review,item)+'>Correct</button>'+
        '</div>'+correctionEditor(review,item,id))+
    '</div>';
  }
  function renderActive(review){
    if(!review||!review.items||!review.items.length)return '';
    var id=safeId(review.reviewId),answered=review.answered||0;
    return '<section class="td-memory td-memory-active" tabindex="-1" aria-labelledby="td-memory-title-'+id+'">'+
      '<div class="td-memory-head">'+
        '<span class="td-memory-k" id="td-memory-title-'+id+'">Memory review</span>'+
        '<span class="td-memory-count">'+answered+' of '+review.items.length+' checked</span>'+
      '</div>'+review.items.map(function(item,index){return memoryItem(review,item,index);}).join('')+
      (review.complete?'<button class="td-memory-btn td-memory-finish" type="button" data-review-id="'+esc(review.reviewId)+'">Finish review</button>':'')+
    '</section>';
  }
  function renderCompleted(){
    return '<div class="td-memory-complete" tabindex="-1"><span>Memory updated</span>Your answers now guide what the Hive keeps, questions, or corrects.</div>';
  }
  function toggleCorrection(button){
    if(!button||!button.closest)return false;
    var item=button.closest('.td-memory-item'),editor=item&&item.querySelector('.td-memory-corrector');
    if(!editor)return false;
    var opening=editor.hidden;
    editor.hidden=!opening;
    var toggle=item.querySelector('.td-memory-correct-toggle');
    if(toggle)toggle.setAttribute('aria-expanded',opening?'true':'false');
    if(opening){
      var input=editor.querySelector('.td-memory-input');
      if(input)input.focus();
    }else if(toggle)toggle.focus();
    return opening;
  }
  function readCorrection(root){
    var input=root&&root.querySelector('.td-memory-input');
    return input?input.value:'';
  }

  B.memoryReviewUI={
    matchesReview:matchesReview,
    itemFor:itemFor,
    renderProposal:renderProposal,
    renderActive:renderActive,
    renderCompleted:renderCompleted,
    toggleCorrection:toggleCorrection,
    readCorrection:readCorrection
  };
})(window);
