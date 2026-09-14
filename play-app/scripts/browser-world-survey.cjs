const {chromium}=require('/opt/homebrew/lib/node_modules/agent-browser/node_modules/playwright-core'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});try{
 const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+'\nglobalThis.audit={orderService,spellbook,player,get activeDog(){return activeDog;}};'});});
 await p.goto(process.env.ORDER_URL||'http://127.0.0.1:8041');const ready=()=>p.waitForFunction(()=>globalThis.audit&&!document.getElementById('loading'),null,{timeout:180000});await ready();
 assert.equal(await p.locator('#buildBtn,#builder,#addObject').count(),0);await p.keyboard.press('b');assert.equal(await p.locator('dialog[open]').count(),0);
 await p.click('#rpgSpellbookBtn');assert.match(await p.locator('#orderContract').textContent(),/0 \/ 8 · Reward: 50 Order XP/);await p.locator('#spellbook .close').click();
 const initial=await p.evaluate(()=>audit.orderService.state.orders[audit.activeDog.order].xp);
 for(let step=0;step<8;step++){
  await p.evaluate(async()=>{const c=audit.orderService.state.orders[audit.activeDog.order].contract,t=c.route[c.step],{height}=await import('./geography.js');audit.player.position.set(t.x,height(t.x,t.z),t.z);await audit.orderService.visit(t);});
  assert.equal(await p.evaluate(()=>audit.orderService.state.orders[audit.activeDog.order].contract.step),(step+1)%8);
  if(step<7)await p.waitForTimeout(3100);
 }
 assert.equal(await p.evaluate(()=>audit.orderService.state.orders[audit.activeDog.order].xp),initial+50);
 await p.reload();await ready();assert.equal(await p.evaluate(()=>audit.orderService.state.orders[audit.activeDog.order].contract.completed),1);
 for(const width of [390,320,1280]){await p.setViewportSize({width,height:800});const menu=width>750?'rpgMenu':'hudMenu';await p.click('#'+menu+'Btn');assert.equal(await p.locator('#'+menu+' button').filter({hasText:/Workshop|Build/}).count(),0);await p.locator('#'+menu+' .close').click();}
 assert.deepEqual(errors,[]);console.log('PASS browser 8-step exact50 reward/reload, spellbook text, desktop/mobile menu and B removal, zero JS errors');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
