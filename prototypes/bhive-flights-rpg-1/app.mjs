import {createStore,STORAGE_KEY,KINDS,OUTCOMES,TOOLS,QUESTS,objectiveFor} from './model.mjs';
import {panelHTML,characterHTML,characterDialogHTML} from './rpg-ui.mjs';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const storage = {getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),removeItem:key=>localStorage.removeItem(key)};
const store = createStore(storage);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let state = {plain:false,active:null,records:[],profile:{name:'Pip',tool:'lantern'},techniques:[]}, view = 'home', choice = null, selected = null, combPage = 0;
let route=null, draft={intention:'',pack:'',gentle:false};
let homeDraft={id:null,note:'',observation:'',outcome:''};
let busy = false, operationEpoch = 0, motionEpoch = 0, animations = [], keyboard = false;
const positions = [[300,270],[300,158],[397,214],[397,326],[300,382],[203,326],[203,214]];
const hex = '50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5';
const inner = '50,10 85,30 85,70 50,90 15,70 15,30';
const step = label => `<div class="panel-step"><span class="line"></span><p>${label}</p></div>`;
const noteField = (id,label,placeholder,value='') => `<label class="field-label" for="${id}">${label} <span>· optional</span></label><textarea id="${id}" maxlength="1000" placeholder="${escape(placeholder)}">${escape(value)}</textarea>`;
const dateLabel = iso => new Intl.DateTimeFormat(undefined,{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(iso));

function material(kind) {
  if(kind==='gather') return '<path d="M13 34 50 55 87 34M13 47 50 68 87 47M13 60 50 81 87 60" fill="none" stroke="#f6d185" stroke-opacity=".25" stroke-width="1.5"/>';
  if(kind==='look') return '<g fill="#fff0bd" opacity=".35">'+[[28,28],[50,18],[72,28],[18,44],[82,44],[22,65],[78,65],[36,80],[64,80],[50,88]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join('')+'</g>';
  return `<polygon points="${inner}" fill="none" stroke="#fff3cb" stroke-opacity=".35"/><path d="m50 10 0 15m35 5-13 8m13 32-13-8M50 90V75M15 70l13-8M15 30l13 8" stroke="#fff3cb" stroke-opacity=".22"/>`;
}
function tileSVG(kind = 'rest', outcome = null, number = null, suffix = 'preview') {
  const colors = {gather:['#e0b560','#af813d'],look:['#d7bd76','#a5884d'],rest:['#dbc79a','#a5926c']}[kind];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="mat-${suffix}" x2=".75" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><polygon class="empty-under empty-face" points="${hex}"/><g class="finished-face"><polygon class="face" points="${hex}" fill="url(#mat-${suffix})"/><path d="M9 73.5 50 97 91 73.5v-7L50 90 9 66.5Z" fill="#312817" opacity=".35"/>${material(kind)}<polygon class="seal-edge" points="${inner}" fill="none" stroke="#ffebbc" opacity=".55"/><path class="highlight" d="M10 28 50 5 90 28" fill="none" stroke="#fff0c4" opacity=".65"/>${outcome ? `<text class="cell-mark" x="50" y="49" text-anchor="middle" dominant-baseline="central" fill="#221e15" font-size="35">${OUTCOMES[outcome].symbol}</text>` : `<path d="m50 37 12 7v14l-12 7-12-7V44Z" fill="none" stroke="#51432b" stroke-width="1.4"/>`}${number!==null?`<text class="cell-number" x="50" y="77">${String(number).padStart(2,'0')}</text>`:''}</g><polygon class="selection" points="50,0 94,25 94,75 50,100 6,75 6,25"/></svg>`;
}
function beeSVG(carrying = null) {
  const equipped=state.active?.quest.tool||state.profile.tool;
  const equipment={
    lantern:'<path d="M65 55v10m-7 0h14l-2 17H60Z" fill="#a48a4a" stroke="#f1d99d"/><path d="m65 68 3 5-3 6-3-6Z" fill="#ffe6a5"/>',
    satchel:'<path d="m36 39 25 30" stroke="#a08b5f" stroke-width="5"/><path d="M52 62h20v17H52Z" fill="#a58a55" stroke="#efd49a"/><path d="m52 62 10 8 10-8" fill="#c5ab74" stroke="#efd49a"/>',
    cloak:'<path d="M37 37 30 76l20 9 20-9-7-39-13 8Z" fill="#64765e" stroke="#aeb993"/><path d="M50 45v40m-13-48 13 8 13-8" fill="none" stroke="#b4c19a"/><circle cx="50" cy="45" r="3" fill="#ebd29a"/>'
  }[equipped];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M43 48 14 40 12 17 34 24 49 43Z" fill="#cbd4d8" opacity=".65"/><path d="M57 48 86 40 88 17 66 24 51 43Z" fill="#e4e1d4" opacity=".8"/><path d="m14 40 20-16 9 24M86 40 66 24l-9 24" fill="none" stroke="#fff3cc" opacity=".6"/><path d="M50 31 65 42 65 66 50 83 35 66 35 42Z" fill="#c9ae78"/><path d="M50 31v52l15-17V42Z" fill="#e2c487"/><path d="M35 48h30v8H35Zm0 15h30l-5 8H40Z" fill="#292722"/><path d="M40 32 43 21h14l3 11-10 8Z" fill="#b79c63"/><path d="m43 22-6-9m20 9 6-9" fill="none" stroke="#c9ae78" stroke-width="2"/><circle cx="44" cy="27" r="2" fill="#111319"/><circle cx="56" cy="27" r="2" fill="#111319"/>${equipment}${carrying ? `<g transform="translate(41 74) scale(.2)">${material(carrying)}<path d="M50 3 91 26v48L50 97 9 74V26Z" fill="${carrying==='gather'?'#d8a34d':carrying==='look'?'#e4ce78':'#dbcca8'}" stroke="#fff0c0" stroke-width="3"/></g>` : ''}</svg>`;
}
function intention(flight) {
  return flight.intention ? `<div class="intention"><p class="eyebrow">YOU SENT THEM WITH</p><p>${escape(flight.intention)}</p></div>` : '';
}
function renderBoard() {
  const pages = Math.max(1,Math.ceil(state.records.length/7));
  combPage = Math.max(0,Math.min(combPage,pages-1));
  const records = state.records.slice(combPage*7,combPage*7+7);
  $('#comb').innerHTML = positions.map(([x,y],index)=>{
    const record = records[index];
    const position = `left:${x/6}%;top:${y/5.4}%`;
    return record ? `<button class="cell-slot" data-record="${record.id}" style="${position}" aria-pressed="${selected===record.id}" aria-label="Cell ${combPage*7+index+1}: ${KINDS[record.kind].name}, ${OUTCOMES[record.outcome].name}, ${escape(dateLabel(record.completedAt))}">${tileSVG(record.kind,record.outcome,combPage*7+index+1,'cell-'+index)}</button>` : `<div class="cell-slot" style="${position}" aria-hidden="true"><svg viewBox="0 0 100 100"><polygon class="empty-face" points="${hex}"/><polygon class="inner-empty" points="${inner}"/><path d="M46 50h8m-4-4v8" stroke="#c9ae78" opacity=".23" stroke-width=".8"/></svg></div>`;
  }).join('');
  $('#record-count').textContent = state.records.length ? `${state.records.length} ${state.records.length===1?'homecoming':'homecomings'} kept in your comb` : 'Your first cell is waiting.';
  $('#comb-pages').innerHTML = pages>1 ? `<button data-page="-1" aria-label="Previous comb page" ${combPage===0?'disabled':''}>‹</button><span>${combPage+1} / ${pages}</span><button data-page="1" aria-label="Next comb page" ${combPage===pages-1?'disabled':''}>›</button>` : '';
  const away = state.active?.status === 'out';
  $('#board').classList.toggle('is-away',away);
  $('#bee-art').innerHTML = beeSVG(state.active?.status==='ready'?state.active.kind:null);
  $('#forager').disabled = Boolean(state.active) || busy;
  $('#forager').setAttribute('aria-label',away ? 'Your Forager is out on a flight.' : state.active ? 'Your Forager is home with cargo.' : 'Your Forager is home. Choose a flight.');
  $('#bee-status').textContent = away?'ON A FLIGHT':state.active?'BACK WITH '+KINDS[state.active.kind].cargo.toUpperCase():'HOME';
}
function renderPanel() {
  $('#panel').innerHTML=panelHTML({state,view,choice,route,selected,draft,homeDraft,tileSVG,step,noteField,dateLabel,escape});
  if(busy) $('#panel').querySelectorAll('button').forEach(button=>button.disabled=true);
}
function rememberDraft() {
  if($('#homecoming-form')) homeDraft={id:$('#homecoming-form').dataset.flight,note:$('#homecoming-note').value,observation:$('#observation')?.value||'',outcome:$('#homecoming-form input[name=outcome]:checked')?.value||''};
  if($('#intention')) draft.intention=$('#intention').value;
  if($('#packed-step')) draft.pack=$('#packed-step').value;
  if($('#gentle')) draft.gentle=$('#gentle').checked;
}
function openCharacter() {
  if(busy) return;
  rememberDraft();settleMotion();
  $('#character-dialog').innerHTML=characterDialogHTML({state,escape,beeSVG});
  $('#character-dialog').showModal();
}

function render() {
  document.body.classList.toggle('plain',state.plain);
  document.body.classList.toggle('reduce-motion',reduced.matches);
  $('#plain').checked = state.plain;
  renderBoard();renderPanel();
  $('#character-card').innerHTML=characterHTML({state,escape,beeSVG});
}
function announce(text) {$('#announcement').textContent=text;}
function focusPanel() {$('#panel h2')?.focus({preventScroll:true});}
function showError(error) {
  $('#error').hidden=false;
  $('#error').textContent = error?.name==='QuotaExceededError' || error?.name==='SecurityError' ? 'This browser could not save your flight. Your last saved state is unchanged. Allow local storage, or free some space, and try again.' : error instanceof SyntaxError ? 'This prototype save could not be read. Reset the prototype to start again.' : error.message || 'The flight could not be saved. Please try again.';
}
function clearError() {$('#error').hidden=true;}
function settleMotion() {
  motionEpoch++;
  animations.forEach(animation=>animation.cancel());animations=[];
  $('#forager').classList.remove('is-moving');
  $('#cargo').style.opacity='0';
  document.querySelectorAll('.sealing').forEach(cell=>cell.classList.remove('sealing'));
}
function instant() {return state.plain || reduced.matches || document.hidden || keyboard || !Element.prototype.animate;}
function revealMotionBoard() {
  if(matchMedia('(max-width:740px)').matches) $('#board').scrollIntoView({block:'center',behavior:'instant'});
}
async function animate(element, frames, duration, easing='cubic-bezier(.23,1,.32,1)') {
  const animation = element.animate(frames,{duration,easing,fill:'none'});
  animations.push(animation);
  try {await animation.finished;} catch { /* Cancellation always reveals the already-saved state. */ }
  animations = animations.filter(item=>item!==animation);
}
async function flightMotion(direction) {
  settleMotion();
  if(instant()) return;
  revealMotionBoard();
  const epoch=motionEpoch, art=$('#bee-art');
  $('#forager').classList.add('is-moving');
  const width=$('#board').clientWidth/600;
  const transform=(x,y,angle)=>`translate(${x*width}px,${y*width}px) rotate(${angle}deg)`;
  const frames=direction==='out' ? [
    {transform:transform(0,0,0),opacity:1},
    {transform:transform(-45,-15,-22),opacity:1,offset:.17},
    {transform:transform(-38,-85,32),opacity:1,offset:.35},
    {transform:transform(22,-65,90),opacity:1,offset:.53},
    {transform:transform(36,-12,150),opacity:1,offset:.66},
    {transform:transform(150,-140,38),opacity:0}
  ] : [{transform:transform(150,-170,-30),opacity:0},{transform:transform(28,-50,-15),opacity:1,offset:.65},{transform:transform(0,0,0),opacity:1}];
  await animate(art,frames,direction==='out'?1300:950,'cubic-bezier(.77,0,.175,1)');
  if(epoch===motionEpoch) $('#forager').classList.remove('is-moving');
}
async function sealMotion(record) {
  settleMotion();
  if(instant()) return;
  revealMotionBoard();
  const epoch=motionEpoch, cell=$(`[data-record="${record.id}"]`), cargo=$('#cargo');
  if(!cell) return;
  cell.classList.add('sealing');
  cargo.innerHTML=tileSVG(record.kind,null,null,'moving-cargo');
  const from=cargo.getBoundingClientRect(), to=cell.getBoundingClientRect();
  const dx=to.x+to.width/2-from.x-from.width/2,dy=to.y+to.height/2-from.y-from.height/2;
  await animate(cargo,[{transform:'translate(-50%,-50%)',opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`,opacity:1}],650,'cubic-bezier(.77,0,.175,1)');
  if(epoch!==motionEpoch) return;
  const face=cell.querySelector('.finished-face');
  cell.classList.remove('sealing');
  face.style.transformOrigin='50% 50%';
  await animate(face,[{transform:'scale(.92)',opacity:0},{transform:'scale(1)',opacity:1}],250);
}
async function perform(action, after) {
  if(busy) return;
  const epoch=operationEpoch;
  busy=true;
  $('#panel').querySelectorAll('button').forEach(button=>button.disabled=true);
  $('#forager').disabled=true;
  try {
    const result=await action();
    if(epoch!==operationEpoch) return;
    state=result.state;busy=false;clearError();
    after?.(result.result);
  } catch(error) {
    if(epoch!==operationEpoch) return;
    busy=false;showError(error);
    // Keep the submitted notes in the form so the user can retry a failed write.
    $('#panel').querySelectorAll('button').forEach(button=>button.disabled=false);
    $('#forager').disabled=Boolean(state.active);
  }
}
function chooseFlight() {
  if(state.active||busy) return;
  settleMotion();view='choose';selected=null;choice=null;route=null;draft={intention:'',pack:'',gentle:false};render();focusPanel();
  if(!instant()) animate($('#bee-art'),[{transform:'translateY(0)'},{transform:'translateY(-7px)'},{transform:'translateY(0)'}],250);
}
function sendFlight(empty=false) {
  rememberDraft();
  const kind=choice,intentionText=empty?'':draft.intention;
  perform(()=>store.send(kind,intentionText,{route,pack:draft.pack,gentle:draft.gentle}),()=>{selected=null;view='home';render();focusPanel();announce('Your Forager is on a flight.');flightMotion('out');});
}
$('#forager').addEventListener('click',chooseFlight);
$('#panel').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button || busy) return;
  if(button.dataset.kind) {settleMotion();choice=button.dataset.kind;route=null;view='routes';selected=null;render();focusPanel();return;}
  if(button.dataset.route) {route=button.dataset.route;view='intention';render();focusPanel();return;}
  if(button.dataset.reuse) {
    perform(()=>store.reuse(button.dataset.reuse),technique=>{choice=technique.kind;route=technique.quest.route;draft={intention:technique.intention,pack:technique.quest.pack,gentle:technique.quest.gentle};view='intention';selected=null;render();focusPanel();});return;
  }
  switch(button.dataset.action) {
    case 'choose':chooseFlight();break;
    case 'character':openCharacter();break;
    case 'routes':rememberDraft();view='routes';render();focusPanel();break;
    case 'teach':view='teach';renderPanel();$('#technique-title')?.focus();break;
    case 'send-empty':sendFlight(true);break;
    case 'arrive':perform(()=>store.arrive(button.dataset.flight),()=>{render();focusPanel();announce('Your Forager is home.');flightMotion('in');});break;
    case 'return':settleMotion();selected=null;view='home';render();focusPanel();break;
  }
});
$('#panel').addEventListener('submit',event=>{
  event.preventDefault();
  if(event.target.id==='send-form') sendFlight();
  if(event.target.id==='learn-form') {
    const id=event.target.dataset.record,title=$('#technique-title').value;
    perform(()=>store.learn(id,title),()=>{view='record';render();focusPanel();announce('Approach added to your Forager’s field guide.');});
  }
  if(event.target.id==='homecoming-form') {
    const form=event.target, id=form.dataset.flight, outcome=new FormData(form).get('outcome'), note=$('#homecoming-note').value;
    perform(()=>store.complete(id,outcome,note,$('#observation')?.value||''),record=>{
      selected=record.id;view='saved';combPage=Math.floor(state.records.findIndex(item=>item.id===record.id)/7);
      render();focusPanel();announce('Homecoming saved. One finished cell added to your comb.');sealMotion(record);
    });
  }
});
$('#comb').addEventListener('click',event=>{
  const cell=event.target.closest('[data-record]');if(!cell||busy) return;
  settleMotion();selected=cell.dataset.record;view='record';render();focusPanel();
  if(matchMedia('(max-width:740px)').matches) $('.interaction').scrollIntoView({block:'start',behavior:'instant'});
});
$('#comb-pages').addEventListener('click',event=>{
  const button=event.target.closest('[data-page]');if(!button||button.disabled) return;
  settleMotion();combPage+=Number(button.dataset.page);renderBoard();
});
$('#plain').addEventListener('change',async event=>{
  const checked=event.target.checked;
  settleMotion();
  try {const result=await store.setPlain(checked);state=result.state;document.body.classList.toggle('plain',state.plain);clearError();}
  catch(error){$('#plain').checked=state.plain;showError(error);}
});

$('#panel').addEventListener('change',event=>{
  if(event.target.id==='gentle') {
    draft.gentle=event.target.checked;
    $('.objective p:last-child').textContent=objectiveFor(choice,{route,gentle:draft.gentle});
  }
});
$('#character-card').addEventListener('click',event=>{if(event.target.closest('[data-action=character]'))openCharacter();});
$('#character-dialog').addEventListener('click',event=>{if(event.target.closest('[data-action=close-character]'))$('#character-dialog').close();});
$('#character-dialog').addEventListener('submit',async event=>{
  if(event.target.id!=='character-form')return;
  event.preventDefault();
  const form=event.target,button=form.querySelector('button[type=submit]');
  if(button.disabled)return;
  button.disabled=true;
  try {
    const result=await store.setProfile($('#bee-name').value,form.querySelector('input[name=tool]:checked').value);
    state=result.state;clearError();render();$('#character-dialog').close();announce('Character saved.');
  } catch(error) {$('#character-error').hidden=false;$('#character-error').textContent=error.message;button.disabled=false;}
});

$('#reset').addEventListener('click',()=>$('#reset-dialog').showModal());
$('#cancel-reset').addEventListener('click',()=>$('#reset-dialog').close());
$('#confirm-reset').addEventListener('click',async()=>{
  operationEpoch++;settleMotion();busy=false;
  try {
    const result=await store.reset();state=result.state;view='home';choice=null;selected=null;combPage=0;route=null;draft={intention:'',pack:'',gentle:false};
    clearError();render();$('#reset-dialog').close();focusPanel();announce('Prototype reset. A fresh hive is ready.');
  } catch(error){$('#reset-dialog').close();showError(error);}
});
document.addEventListener('keydown',()=>{keyboard=true;});
document.addEventListener('pointerdown',()=>{keyboard=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden) settleMotion();});
reduced.addEventListener('change',()=>{settleMotion();document.body.classList.toggle('reduce-motion',reduced.matches);});
window.addEventListener('storage',event=>{
  if(event.key!==STORAGE_KEY) return;
  operationEpoch++;busy=false;settleMotion();
  try {state=store.read();selected=null;view='home';clearError();render();announce('Your prototype was updated in another tab.');}
  catch(error){showError(error);}
});
try {
  state=(await store.visit()).state;
  combPage=Math.max(0,Math.ceil(state.records.length/7)-1);
  render();
  if(state.active?.status==='ready') flightMotion('in');
} catch(error) {render();showError(error);}
