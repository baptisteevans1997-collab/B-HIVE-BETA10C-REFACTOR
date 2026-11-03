async page => {
  const browser=page.context().browser();
  // All extra contexts belong to this task's disposable reference/test sessions.
  for(const context of browser.contexts())if(context!==page.context())await context.close();
  const ctx=await browser.newContext({viewport:{width:1440,height:1050},serviceWorkers:'block'});
  await ctx.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8198/')?route.continue():route.abort());
  const preview=await ctx.newPage();await preview.goto('http://127.0.0.1:8198/');
  await preview.locator('[data-action=choose]').waitFor();
  await preview.evaluate(async()=>{
    const {createStore}=await import('/model.mjs'),store=createStore(localStorage);
    const examples=[
      ['rest','partly','Put my phone away for the evening.','Found a quiet half hour. I’d like to make room for that again.'],
      ['gather','not_this_time','A walk before lunch.','Rain changed the day. I stayed in.'],
      ['look','plans_changed','Notice when my energy dips.','Found I needed a proper lunch.'],
      ['rest','done','An earlier night.','Made space to switch off.']
    ];
    for(const [kind,outcome,intention,note] of examples){const {result}=await store.send(kind,intention);await store.arrive(result.id);await store.complete(result.id,outcome,note);}
  });
  await preview.reload();await preview.locator('[data-record]').first().click();
  const out='/Users/bap/.codex/visualizations/2026/10/30/01a18d1b-9132-7852-9bfe-a736af52265f/bhive-flights-prototype-0/';
  await preview.screenshot({path:out+'preview-desktop.png',fullPage:true});
  await preview.setViewportSize({width:390,height:844});
  await preview.screenshot({path:out+'preview-phone.png',fullPage:true});
  await ctx.close();
  await page.goto('http://127.0.0.1:8198/');
  return {browser:browser.version(),preview:'Synthetic demonstration records, created and discarded in a separate browser context.'};
}
