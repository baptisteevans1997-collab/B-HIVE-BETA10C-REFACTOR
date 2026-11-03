async page => {
  const browser=page.context().browser(),ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await ctx.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8199/')?r.continue():r.abort());
  const p=await ctx.newPage();await p.goto('http://127.0.0.1:8199/');
  await p.locator('[data-action=choose]').click();await p.locator('[data-kind=look]').click();await p.locator('[data-route=energy]').click();
  await p.locator('#send-form button[type=submit]').click();await p.locator('[data-action=arrive]').click();
  await p.locator('input[value=partly]').check();await p.locator('#observation').fill('The clue I do not want to lose.');
  await p.locator('#homecoming-note').fill('Keep my unfinished note.');
  await p.locator('#character-card [data-action=character]').click();await p.locator('#bee-name').fill('Moss');
  await p.locator('#character-form button[type=submit]').click();await p.locator('#character-dialog').waitFor({state:'hidden'});
  const preserved=await p.locator('input[value=partly]').isChecked()&&await p.locator('#observation').inputValue()==='The clue I do not want to lose.'&&await p.locator('#homecoming-note').inputValue()==='Keep my unfinished note.';
  if(!preserved)throw new Error('Character edit lost a homecoming draft.');
  await p.locator('#homecoming-form button[type=submit]').click();await p.locator('[data-action=teach]').waitFor();
  const saved=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('bhive-proto-flights-rpg-1'));return s.profile.name==='Moss'&&s.records[0].outcome==='partly'&&s.records[0].note==='Keep my unfinished note.'&&s.records[0].observation==='The clue I do not want to lose.';});
  if(!saved)throw new Error('Edited-character homecoming did not persist the draft.');
  await ctx.close();return {passed:2,results:['Renaming during homecoming preserves the chosen outcome, observation and note','The preserved homecoming draft saves correctly after renaming']};
}
