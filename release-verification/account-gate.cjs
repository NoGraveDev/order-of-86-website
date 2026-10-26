const {chromium}=require('/opt/homebrew/lib/node_modules/agent-browser/node_modules/playwright-core');
const assert=require('node:assert/strict');
(async()=>{const root=process.env.ENTRY_URL||'https://theorderof86.com/play/',origin=new URL(root).origin;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),errors=[],heavy=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/(game\.js|loading-screen\.js|three\.module\.js|.*\.glb)(\?|$)/.test(new URL(r.url()).pathname))heavy.push(new URL(r.url()).pathname);});
for(const [path,width] of [['',1280],['multiplayer',1280],['multiplayer#'+'a'.repeat(64),390],['index.html',320],['multiplayer.html',320]]){
await page.setViewportSize({width,height:800});await page.goto(root+path);await page.waitForSelector('#entrySignup');await page.waitForTimeout(300);assert.equal(await page.locator('canvas:visible').count(),0);assert.equal(heavy.length,0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
const session=await context.request.get(root+'api/accounts/session');assert.equal(session.status(),200);assert.equal((await session.json()).user,null);
for(const action of ['create','public-join','join','sync','message','chess','boat','lava','trade','chess-records','leave']){const response=await context.request.post(root+'api/multiplayer/'+action,{headers:{Origin:origin},data:{}});assert.equal(response.status(),401,action);}
assert.deepEqual(errors,[]);console.log('PASS public desktop/mobile root, direct/invite and HTML-alias account gates; no world assets/canvas before auth; all 11 guest multiplayer APIs denied401; session200; zero JS errors; no accounts created');
}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exit(1)});
