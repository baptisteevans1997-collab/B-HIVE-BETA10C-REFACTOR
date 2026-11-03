async page => {
  const browser=page.context().browser(),origin='http://127.0.0.1:8198',key='bhive-proto-flights-0';
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await ctx.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  const p=await ctx.newPage();await p.goto(origin);const results=[];
  const check=(condition,label)=>{if(!condition)throw new Error('FAIL: '+label);results.push(label);};
  await p.locator('[data-action=choose]').click();await p.locator('[data-kind=rest]').click();
  await p.locator('#intention').fill('This typed note should be ignored.');
  await p.locator('[data-action=send-empty]').click();
  await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.active?.status==='out',key);
  check(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).active.intention==='',key),'Send without a note omits the typed draft');
  await p.locator('#plain').check();await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).plain,key);
  check(await p.evaluate(()=>!document.querySelector('#forager').classList.contains('is-moving')&&getComputedStyle(document.querySelector('#bee-art')).opacity==='0'&&document.getAnimations().filter(a=>a.playState==='running').length===0),'Plain mode interrupts send-off and leaves an empty perch');
  await p.locator('#plain').uncheck();await p.waitForFunction(key=>!JSON.parse(localStorage.getItem(key)).plain,key);
  await p.locator('[data-action=arrive]').click();await p.locator('#homecoming-form').waitFor();
  await p.locator('input[value=partly]').check();await p.locator('#homecoming-form button').click();
  await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).records.length===1,key);
  // Programmatic click avoids waiting for a long scroll back to the phone header.
  await p.locator('#reset').evaluate(button=>button.click());
  await p.locator('#confirm-reset').click();await p.locator('#reset-dialog').waitFor({state:'hidden'});
  await p.waitForTimeout(1100);
  check(await p.evaluate(key=>localStorage.getItem(key)===null&&document.querySelectorAll('[data-record]').length===0&&document.querySelectorAll('.sealing').length===0,key),'Reset during sealing stays empty after animation callbacks settle');
  await p.locator('#forager').focus();await p.keyboard.press('Enter');
  await p.locator('[data-kind=look]').focus();await p.keyboard.press('Enter');
  await p.locator('#send-form button[type=submit]').focus();await p.keyboard.press('Enter');
  await p.locator('[data-action=arrive]').waitFor();
  check(await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0),'Keyboard send-off works with an instant state change');
  await p.locator('[data-action=arrive]').focus();await p.keyboard.press('Enter');
  await p.locator('input[value=plans_changed]').focus();await p.keyboard.press('Space');
  await p.locator('#homecoming-form button').focus();await p.keyboard.press('Enter');
  await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).records.length===1,key);
  check(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).records[0].outcome==='plans_changed',key),'Keyboard homecoming records the chosen outcome');
  await ctx.close();return {passed:results.length,results};
}
