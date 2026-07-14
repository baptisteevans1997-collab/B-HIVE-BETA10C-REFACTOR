(function(root){
  'use strict';
  var DAY=86400000;
  /* 02:00 UTC is midday in Melbourne in July, leaving room for same-day offsets. */
  var NOW=Date.UTC(2026,6,14,2,0,0,0);
  var seq=0;
  function event(type,daysAgo,payload,cellKey,hourOffset){
    seq++;
    return {
      id:'fixture_'+seq,
      type:type,
      ts:NOW-daysAgo*DAY+(hourOffset||0)*3600000,
      cellKey:cellKey||null,
      payload:payload||{}
    };
  }
  function checkin(daysAgo,en,imp,cellKey,hourOffset){
    var cells={};cells[cellKey||'lw']={en:en,imp:imp};
    return event('checkin_completed',daysAgo,{cells:cells,source:'fixture'},null,hourOffset);
  }
  function trend(values,daysAgo,cellKey,importance){
    return values.map(function(value,i){return checkin(daysAgo[i],value,importance||75,cellKey||'lw');});
  }
  function userLearning(daysAgo,text,cellKey){
    return event('learning_added',daysAgo,{text:text,source:'you'},cellKey||'lw');
  }
  function claudeLearning(daysAgo,text,cellKey){
    return event('learning_added',daysAgo,{text:text,source:'claude'},cellKey||'lw');
  }
  function queenMessage(daysAgo,text,role){
    return event('queen_message',daysAgo,{content:text,role:role||'user'});
  }
  function insightFeedback(daysAgo,observation,verdict,hourOffset){
    return event('insight_feedback',daysAgo,{
      insightId:observation.id,
      evidenceKey:(root.BHIVE&&root.BHIVE.inference)?root.BHIVE.inference.evidenceKey(observation):'',
      evidenceEventIds:(observation.evidenceEventIds||[]).slice(),
      verdict:verdict
    },null,hourOffset);
  }
  root.BHIVE_TEST_FIXTURES={
    DAY:DAY,NOW:NOW,event:event,checkin:checkin,trend:trend,
    userLearning:userLearning,claudeLearning:claudeLearning,queenMessage:queenMessage,
    insightFeedback:insightFeedback,
    cells:[
      {key:'lw',label:'Main Project',imp:80,en:50},
      {key:'health',label:'Health',imp:85,en:35},
      {key:'people',label:'People',imp:45,en:45}
    ],
    rising:function(){return trend([30,45,62],[6,3,0],'lw',80);},
    falling:function(){return trend([70,55,38],[6,3,0],'health',85);},
    flat:function(){return trend([50,52,49,51],[6,4,2,0],'lw',75);},
    volatile:function(){return trend([20,78,24,75],[6,4,2,0],'lw',75);},
    insufficient:function(){return trend([30,60],[3,0],'lw',80);},
    sameDayBurst:function(){return [
      checkin(2,20,80,'lw',-2),checkin(2,30,80,'lw',1),checkin(2,40,80,'lw',3),
      checkin(1,50,80,'lw'),checkin(0,60,80,'lw')
    ];},
    neglect:function(){return [checkin(12,35,85,'health')];},
    recentlyTouched:function(){return [checkin(12,35,85,'health'),userLearning(2,'I changed my sleep routine','health')];},
    repeatedStress:function(){return [
      userLearning(12,'I feel stressed and behind','lw'),
      queenMessage(7,'The pressure is making me feel overwhelmed','user'),
      userLearning(2,'Work has me drained again','health')
    ];},
    sameDayStress:function(){return [
      userLearning(2,'I feel stressed','lw'),
      queenMessage(2,'Still overwhelmed today','user'),
      userLearning(2,'The pressure is high','health')
    ];},
    nonUserStress:function(){return [
      claudeLearning(8,'You seem stressed','lw'),
      queenMessage(5,'You may be overwhelmed','assistant'),
      claudeLearning(1,'Pressure is visible','health')
    ];}
  };
})(window);
