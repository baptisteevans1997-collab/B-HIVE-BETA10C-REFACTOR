/* ── D3D2 · Cell Blueprint Archive — isolated planning-only display ─────────
   Reads window.BHIVE_DATA.FUTURE_TOPOLOGY (display-only planning D3D1 data) and renders DOM
   cards into #bp-archive. Display only: no #hivesvg, no .hive-cell, no hex
   geometry, no cells[]/HIVE_POS, no renderHive/renderWorkers, no
   save/load/snapshot, no nextMove, no priority, no pan/zoom, no bees, no
   Queen/Live Sync/Supabase, no localStorage. */
(function(){
  var host=document.getElementById('bp-archive');
  var data=window.BHIVE_DATA&&window.BHIVE_DATA.FUTURE_TOPOLOGY;
  if(!host||!data||!Array.isArray(data.cells))return;
  function el(tag,cls,text){
    var e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!=null)e.textContent=text;
    return e;
  }
  var banner=el('div','bp-banner');
  ['Planning only','Not live','Not mapped to hive','Architecture deferred']
    .forEach(function(t){banner.appendChild(el('span','bp-chip',t));});
  host.appendChild(banner);
  host.appendChild(el('p','bp-intro',
    'A blueprint archive of future systems the hive may construct later. These are concepts and planned systems — not live cells, and not yet mapped to the hive.'));
  var grid=el('div','bp-grid');
  data.cells.forEach(function(c){
    var card=el('article','bp-card');
    var head=el('div','bp-card-head');
    head.appendChild(el('h3','bp-label',c.label||c.key||'Untitled'));
    if(c.tier!=null)head.appendChild(el('span','bp-tier','TIER '+c.tier));
    card.appendChild(head);
    if(c.full)card.appendChild(el('div','bp-full',c.full));
    var tags=el('div','bp-tags');
    if(c.category)tags.appendChild(el('span','bp-tag',c.category));
    if(c.ring)tags.appendChild(el('span','bp-tag','ring · '+c.ring));
    if(c.relatedCell)tags.appendChild(el('span','bp-tag','relates to · '+c.relatedCell));
    if(tags.childNodes.length)card.appendChild(tags);
    if(c.desc)card.appendChild(el('p','bp-desc',c.desc));
    if(c.unlockIdea){
      var u=el('div','bp-field');
      u.appendChild(el('span','bp-field-k','Unlock idea'));
      u.appendChild(el('span','bp-field-v',c.unlockIdea));
      card.appendChild(u);
    }
    if(c.notes){
      var n=el('div','bp-field');
      n.appendChild(el('span','bp-field-k','Notes'));
      n.appendChild(el('span','bp-field-v',c.notes));
      card.appendChild(n);
    }
    card.appendChild(el('div','bp-status','PLANNING ONLY · NOT MAPPED TO HIVE'));
    grid.appendChild(card);
  });
  host.appendChild(grid);
  if(data.liveMappingDeferred)
    host.appendChild(el('p','bp-defer','Live mapping deferred — '+data.liveMappingDeferred));
})();
