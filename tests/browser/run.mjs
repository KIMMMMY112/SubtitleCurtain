import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
const root = resolve(process.env.SC_EXTENSION_DIR || '.');
const executablePath = process.env.SC_BROWSER_EXECUTABLE || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : await puppeteer.executablePath());
const label = process.env.SC_BROWSER_LABEL || 'Google Chrome';
const slug = label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const out = resolve('test-results',slug); await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const fixture = await readFile('tests/browser/fixture.html');
const server = createServer((req,res) => {res.writeHead(req.url === '/favicon.ico' ? 204 : 200,{'Content-Type':'text/html'});res.end(req.url === '/favicon.ico' ? '' : fixture);});
await new Promise(r=>server.listen(0,'0.0.0.0',r));
const port = server.address().port, url = `http://127.0.0.1:${port}/`, profile = await mkdtemp(resolve(tmpdir(),'subtitle-curtain-'));
let browser, worker, page, ui, extensionId, tabId;
const results = [], errors = [], observations = [];
async function step(name,job) {console.log('RUN',name);try {await job();results.push({name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',error:e.stack});throw e;}}
function monitor(p) {p.on('pageerror',e=>errors.push({url:p.url(),error:e.message}));const original=p.waitForFunction.bind(p);p.waitForFunction=(fn,opts={},...args)=>original(fn,{polling:50,...opts},...args);}
async function launch() {
 browser = await puppeteer.launch({executablePath,headless:process.env.HEADLESS === '1',pipe:true,userDataDir:profile,
   protocolTimeout:20000,defaultViewport:{width:1200,height:800},enableExtensions:label==='Brave'?true:[root],args:['--enable-unsafe-extension-debugging','--no-default-browser-check','--autoplay-policy=no-user-gesture-required','--window-size=1200,900',...(label==='Brave'?[`--load-extension=${root}`,`--disable-extensions-except=${root}`]:[])]});
 // MV3 workers can stay asleep on a browser restart until a content-script message arrives.
 const wake = await browser.newPage();await wake.goto(url,{waitUntil:'domcontentloaded'});
 const target = await browser.waitForTarget(t=>t.type() === 'service_worker' && t.url().endsWith('/src/extension/background.js'),{timeout:15000});
 worker = await target.worker(); extensionId = new URL(target.url()).hostname;await wake.close();
}
const maskInfo = async (frame=page.mainFrame()) => frame.evaluate(() => {
 const root=document.getElementById('subtitle-curtain-root');const s=root?.shadowRoot,m=s?.getElementById('mask'),v=s?.getElementById('visual'),h=s?.getElementById('resize');
 if(!m)return null;const g=m.getBoundingClientRect(),r=h.getBoundingClientRect(),a=getComputedStyle(v);
 return {hidden:m.hidden,locked:m.classList.contains('locked'),x:g.x,y:g.y,width:g.width,height:g.height,handle:{x:r.x+r.width/2,y:r.y+r.height/2},background:a.backgroundImage,color:a.backgroundColor,opacity:a.opacity,radius:a.borderRadius,clip:a.clipPath,popover:root.matches(':popover-open'),parent:root.parentElement.id};
});
async function ready(frame=page.mainFrame()) {await frame.waitForFunction(()=>!!document.getElementById('subtitle-curtain-root')?.shadowRoot);}
async function state() {return ui.evaluate(async id=>(await chrome.tabs.sendMessage(id,{type:'SC_GET_STATE'},{frameId:0})).settings,tabId);}
async function waitState(patch) {await ui.waitForFunction(async (id,p)=>{const s=(await chrome.tabs.sendMessage(id,{type:'SC_GET_STATE'},{frameId:0})).settings;return Object.entries(p).every(([k,v])=>s[k]===v);},{},tabId,patch);}
async function input(id,value) {
 await ui.$eval('#'+id,(el,v)=>{if(el.type==='checkbox')el.checked=v;else el.value=v;el.dispatchEvent(new Event(el.type==='range'?'input':'change',{bubbles:true}));},value);
 const patch={}; patch[id]=['width','opacity'].includes(id)?Number(value)/100:['height','radius','angle','scale'].includes(id)?Number(value):value;
 await waitState(patch);
}
async function click(id) {await ui.bringToFront();const el=await ui.$('#'+id);await el.scrollIntoView();await el.click();}
async function stored() {return worker.evaluate(async()=>await chrome.storage.local.get(null));}
async function drag(from,to) {await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:12});await page.mouse.up();}
async function shortcut(key) {await page.bringToFront();await page.keyboard.down('Alt');await page.keyboard.down('Shift');await page.keyboard.press(key);await page.keyboard.up('Shift');await page.keyboard.up('Alt');}
let version;
try {
 await launch(); version=await browser.version();console.log('Testing',label,version);
 page=await browser.newPage();monitor(page);await page.goto(url);await ready();
 await step('MV3 extension installed; default hidden; real video playback',async()=>{
   assert.equal((await maskInfo()).hidden,true);await page.click('#play');await page.waitForFunction(()=>{const v=document.getElementById('video');return !v.paused&&v.currentTime>.4&&v.videoWidth===960;});
 });
 tabId=await worker.evaluate(async()=>(await chrome.tabs.query({active:true,lastFocusedWindow:true}))[0].id);
 await step('Actual action popup opens and its switch shows the curtain',async()=>{
   await page.bringToFront();const targetPromise=browser.waitForTarget(t=>t.url()===`chrome-extension://${extensionId}/src/popup/popup.html`);
   await worker.evaluate(()=>chrome.action.openPopup());const t=await targetPromise;ui=await t.asPage();monitor(ui);
   await ui.waitForFunction(()=>!document.getElementById('controls').disabled);await click('enabled');await waitState({enabled:true});
   assert.equal((await maskInfo()).hidden,false);
 });
 await step('Standalone shape and pattern manager opens from popup',async()=>{
   const t=browser.waitForTarget(t=>t.url().includes('/src/popup/popup.html?tabId='));await click('manager');ui=await(await t).asPage();monitor(ui);
   await ui.waitForFunction(()=>!document.getElementById('controls').disabled);assert.match(await ui.$eval('body',b=>b.className),/standalone/);
 });
 await step('Free mouse dragging preserves exact position',async()=>{
   await page.bringToFront();const before=await maskInfo();await drag({x:before.x+before.width/2,y:before.y+before.height/2},{x:before.x+before.width/2-100,y:before.y+before.height/2-100});
   const after=await maskInfo();assert.ok(Math.abs(after.x-(before.x-100))<=1);assert.ok(Math.abs(after.y-(before.y-100))<=1);
   await ui.waitForFunction(async id=>{const s=(await chrome.tabs.sendMessage(id,{type:'SC_GET_STATE'},{frameId:0})).settings;const all=await chrome.storage.local.get(null);return Object.values(all).some(v=>v?.x===s.x&&v?.y===s.y);},{},tabId);
 });
 await step('Resize handle changes width and height',async()=>{
   const b=await maskInfo();await drag(b.handle,{x:b.handle.x-120,y:b.handle.y+25});const a=await maskInfo();assert.ok(Math.abs(a.width-(b.width-120))<=2);assert.ok(Math.abs(a.height-(b.height+25))<=1);
 });
 await step('Width and height controls reach documented limits',async()=>{await input('width',42);await input('height',200);assert.equal((await maskInfo()).width,504);assert.equal((await maskInfo()).height,200);await input('height',56);});
 await step('Solid colors, gradient colors, angle and opacity render',async()=>{
   await input('color1','#123456');assert.equal((await maskInfo()).color,'rgb(18, 52, 86)');await input('fillType','gradient');await input('color2','#ef5678');await input('angle',220);await input('opacity',65);
   const m=await maskInfo();assert.match(m.background,/220deg/);assert.match(m.background,/239, 86, 120/);assert.equal(m.opacity,'0.65');
 });
 await step('All four patterns render with adjustable spacing',async()=>{
   await input('fillType','pattern');await input('scale',32);
   for(const p of ['stripes','dots','checker','waves']) {await input('pattern',p);assert.notEqual((await maskInfo()).background,'none');}
 });
 await step('All five built-in shapes and custom rounded corners render',async()=>{
   for(const s of ['rectangle','rounded','pill','ellipse','ticket']) {await input('shape',s);const a=await maskInfo();if(s==='ellipse')assert.equal(a.radius,'50%');if(s==='ticket')assert.match(a.clip,/polygon/);}
   await input('shape','rounded');await input('radius',28);assert.equal((await maskInfo()).radius,'28px');
 });
 await step('Custom polygon renders; invalid coordinates are rejected',async()=>{
   await input('shape','custom');await input('polygon','0,50 10,0 90,0 100,50 90,100 10,100');assert.match((await maskInfo()).clip,/polygon/);
   await ui.$eval('#polygon',e=>{e.value='url(https://invalid.test)';e.dispatchEvent(new Event('change'));});
   assert.equal(await ui.$eval('#error',e=>e.hidden),false);assert.match((await state()).polygon,/0,50/);
   await input('polygon','0,50 10,0 90,0 100,50 90,100 10,100');
 });
 await step('Ellipse/custom clipping does not clip the resize handle',async()=>{
   for(const shape of ['ellipse','custom']){await input('shape',shape);const b=await maskInfo();await page.bringToFront();await drag(b.handle,{x:b.handle.x+24,y:b.handle.y+12});assert.ok((await maskInfo()).width>b.width+20);}
 });
 await step('Lock makes curtain and handles pass mouse clicks through to player',async()=>{
   await input('locked',true);const m=await maskInfo();const x=m.x+m.width/2,y=m.y+m.height/2;
   const hit=await page.evaluate((x,y)=>document.elementFromPoint(x,y)?.tagName,x,y);assert.equal(hit,'VIDEO');
   const count=await page.$eval('#clicks',e=>Number(e.value)),before=await state();await drag({x,y},{x:x+30,y:y+30});assert.equal(await page.$eval('#clicks',e=>Number(e.value)),count+1);
   assert.deepEqual(await state(),before);await input('locked',false);if(await page.evaluate(()=>!!document.fullscreenElement))await page.evaluate(()=>document.exitFullscreen());
 });
 await step('Keyboard movement, resizing, toggling and locking; inputs are left alone',async()=>{
   await page.bringToFront();let m=await maskInfo();await page.mouse.click(m.x+m.width/2,m.y+m.height/2);assert.equal(await page.evaluate(()=>document.getElementById('subtitle-curtain-root').shadowRoot.activeElement?.id),'mask');const before=await state();await page.keyboard.press('ArrowRight');
   await ui.waitForFunction(async(id,x)=>(await chrome.tabs.sendMessage(id,{type:'SC_GET_STATE'},{frameId:0})).settings.x>x,{},tabId,before.x);
   const height=(await state()).height;await page.keyboard.down('Control');await page.keyboard.press('ArrowDown');await page.keyboard.up('Control');await waitState({height:height+1});
   await shortcut('KeyL');await waitState({locked:true});await shortcut('KeyL');await waitState({locked:false});
   await shortcut('KeyS');await waitState({enabled:false});assert.equal((await maskInfo()).hidden,true);await shortcut('KeyS');await waitState({enabled:true});
   await page.click('#editor');assert.equal(await page.evaluate(()=>document.activeElement.id),'editor');await shortcut('KeyS');assert.equal((await state()).enabled,true);
 });
 let presetId, exported;
 await step('Style library create, rename and update persist',async()=>{
   await ui.$eval('#presetName',e=>{e.value='六边形测试';});await click('savePreset');await ui.waitForFunction(()=>document.querySelectorAll('#preset option').length===2);
   presetId=await ui.$eval('#preset',e=>e.value);await ui.$eval('#presetName',e=>{e.value='已重命名';});await click('renamePreset');await ui.waitForFunction(()=>document.querySelector('#preset option:checked')?.textContent==='已重命名');
   await input('color1','#abcdef');await click('updatePreset');await ui.waitForFunction(async()=>{const s=await chrome.storage.local.get('subtitleCurtain:v1:library');return s['subtitleCurtain:v1:library'][0].style.color1==='#abcdef';});
 });
 await step('Applying saved style preserves geometry, lock and enabled state',async()=>{
   const before=await state();await input('shape','rectangle');await input('color1','#222222');await click('applyPreset');await waitState({shape:'custom',color1:'#abcdef'});
   const after=await state();for(const k of ['x','y','width','height','enabled','locked'])assert.equal(after[k],before[k]);
 });
 await step('Style JSON export, delete and import round trip',async()=>{
   const cdp=await ui.createCDPSession();await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out,eventsEnabled:true});await click('exportPresets');
   for(let i=0;i<100;i++){try{exported=JSON.parse(await readFile(resolve(out,'SubtitleCurtain-styles.json'),'utf8'));break;}catch{await new Promise(r=>setTimeout(r,50));}}
   assert.equal(exported.presets[0].id,presetId);await click('deletePreset');await ui.waitForFunction(()=>document.querySelectorAll('#preset option').length===1);
   await(await ui.$('#importPresets')).uploadFile(resolve(out,'SubtitleCurtain-styles.json'));await ui.waitForFunction(()=>document.querySelectorAll('#preset option').length===2);
   await writeFile(resolve(out,'invalid.json'),JSON.stringify({format:'bad'}));await(await ui.$('#importPresets')).uploadFile(resolve(out,'invalid.json'));await ui.waitForFunction(()=>!document.getElementById('error').hidden);
   assert.equal((await stored())['subtitleCurtain:v1:library'].length,1);
 });
 await step('Refresh restores position, size, fill, opacity, shape, enabled and lock',async()=>{
   await input('locked',true);const before=await state();await page.reload();await ready();assert.deepEqual(await state(),before);assert.equal((await maskInfo()).locked,true);
   await page.screenshot({path:resolve(out,'normal-playback.png')});await input('locked',false);
 });
 await step('Website settings are isolated; style library is global',async()=>{
   const other=await browser.newPage();await other.goto(`http://localhost:${port}/`);await ready(other.mainFrame());assert.equal((await maskInfo(other.mainFrame())).hidden,true);await other.close();
 });
 await step('Container Fullscreen API playback keeps mask visible, draggable and persistent',async()=>{
   await page.bringToFront();await page.click('#play');await page.click('#fullscreen');await page.waitForFunction(()=>!!document.fullscreenElement);await ready();
   const m=await maskInfo();assert.equal(m.hidden,false);assert.equal(m.parent,'player');assert.equal(m.popover,true);
   await drag({x:m.x+50,y:m.y+20},{x:m.x+30,y:m.y-20});assert.ok((await maskInfo()).y<m.y);await page.screenshot({path:resolve(out,'container-fullscreen.png')});
   await page.evaluate(()=>document.exitFullscreen());await page.waitForFunction(()=>!document.fullscreenElement);assert.equal((await maskInfo()).hidden,false);
 });
 await step('Video element Fullscreen API playback shows top-layer curtain and permits lock',async()=>{
   await page.click('#videoFullscreen');await page.waitForFunction(()=>document.fullscreenElement?.tagName==='VIDEO');assert.equal((await maskInfo()).hidden,false);assert.equal((await maskInfo()).popover,true);const m=await maskInfo();assert.ok(m.width>0&&m.height>0);await drag({x:m.x+m.width/2,y:m.y+m.height/2},{x:m.x+m.width/2-20,y:m.y+m.height/2-20});const n=await maskInfo();observations.push({mode:'native-video-fullscreen',mouseDragMoved:n.x!==m.x||n.y!==m.y,note:'Native video fullscreen is only claimed for visible curtain and keyboard toggle/lock; use a player-container fullscreen for mouse editing.'});
   await shortcut('KeyL');await waitState({locked:true});await page.screenshot({path:resolve(out,'video-fullscreen.png')});await page.evaluate(()=>document.exitFullscreen());await input('locked',false);
 });
 await step('Cross-origin iframe fullscreen uses one curtain with top-site settings',async()=>{
   await page.goto(url+'frames');await ready();await page.waitForSelector('#child');const frame=await(await page.$('#child')).contentFrame();await ready(frame);
   assert.equal((await maskInfo(frame)).hidden,true);await page.bringToFront();await page.$eval('#child',el=>el.scrollIntoView({block:'center'}));await input('locked',true);await page.bringToFront();await frame.click('#play');await frame.evaluate(()=>document.getElementById('player').requestFullscreen());await frame.waitForFunction(()=>!!document.fullscreenElement,{polling:50});
   await frame.waitForFunction(()=>!document.getElementById('subtitle-curtain-root').shadowRoot.getElementById('mask').hidden,{polling:50});
   assert.equal((await maskInfo()).hidden,true);assert.equal((await maskInfo(frame)).hidden,false);
   await page.screenshot({path:resolve(out,'iframe-fullscreen.png')});await frame.evaluate(()=>document.exitFullscreen());await page.waitForFunction(()=>!document.fullscreenElement&&!document.getElementById('subtitle-curtain-root').shadowRoot.getElementById('mask').hidden);assert.equal((await maskInfo()).hidden,false);await input('locked',false);
 });
 await step('Scroll and window resizing keep the curtain inside the viewport',async()=>{
   await page.evaluate(()=>window.scrollTo(0,400));let m=await maskInfo();assert.ok(m.x>=0&&m.y>=0);await page.setViewport({width:360,height:300});await page.waitForFunction(()=>{const m=document.getElementById('subtitle-curtain-root').shadowRoot.getElementById('mask').getBoundingClientRect();return m.x+m.width<=360&&m.y+m.height<=300;},{polling:50});
   m=await maskInfo();assert.ok(m.x+m.width<=360&&m.y+m.height<=300);await page.setViewport({width:1200,height:800});await page.evaluate(()=>window.scrollTo(0,0));
 });
 await step('Removing the host is repaired without duplicate masks',async()=>{
   await page.evaluate(()=>document.getElementById('subtitle-curtain-root').remove());await ready();assert.equal(await page.$$eval('#subtitle-curtain-root',es=>es.length),1);
 });
 await step('Opaque curtain can cover Chinese while leaving the English line visible',async()=>{
   await input('shape','rectangle');await input('fillType','solid');await input('color1','#111827');await input('opacity',100);await input('width',80);await input('height',60);
   await page.bringToFront();await page.evaluate(()=>window.scrollTo(0,0));await page.click('#play');
   const v=await page.$eval('#video',e=>{const r=e.getBoundingClientRect();const h=Math.min(r.height,r.width*9/16);return {top:r.top+(r.height-h)/2,height:h};});
   const b=await maskInfo(),left=(1200-b.width)/2,top=v.top+v.height*.84;
   await drag({x:b.x+b.width/2,y:b.y+b.height/2},{x:left+b.width/2,y:top+b.height/2});
   const a=await maskInfo();assert.ok(a.y>v.top+v.height*.80);assert.ok(a.y<=v.top+v.height*.86&&a.y+a.height>=v.top+v.height*.90);
   await page.screenshot({path:resolve(out,'chinese-covered-english-visible.png')});
 });
 await step('Opening popup.html directly explains installation instead of hanging',async()=>{
   const local=await browser.newPage();await local.goto('file://'+resolve(root,'src/popup/popup.html'));
   await local.waitForFunction(()=>document.getElementById('error').textContent.includes('不能直接双击'),{polling:50});
   assert.equal(await local.$eval('#controls',e=>e.disabled),true);await local.close();
 });
 await step('Browser internal pages show an actionable unsupported-page error',async()=>{
   const p=await browser.newPage();await p.goto('chrome://version');await p.bringToFront();const id=await worker.evaluate(async()=>(await chrome.tabs.query({active:true,lastFocusedWindow:true}))[0].id);
   const unsupported=await browser.newPage();await unsupported.goto(`chrome-extension://${extensionId}/src/popup/popup.html?tabId=${id}`);
   await unsupported.waitForFunction(()=>!document.getElementById('error').hidden);assert.equal(await unsupported.$eval('#controls',e=>e.disabled),true);await unsupported.close();await p.close();
 });
 await step('Manager layout has no horizontal overflow and no runtime errors',async()=>{
   await ui.bringToFront();await ui.setViewport({width:900,height:1100});await ui.screenshot({path:resolve(out,'style-manager.png'),fullPage:true});
   assert.equal(await ui.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);assert.deepEqual(errors,[]);
 });
 const beforeRestart=await state();
 await step('Closing and reopening the browser restores settings and saved styles',async()=>{
   await browser.close();await launch();page=await browser.newPage();await page.goto(url);await ready();
   const data=await stored();assert.deepEqual(data['subtitleCurtain:v1:site:127.0.0.1'],beforeRestart);assert.equal(data['subtitleCurtain:v1:library'][0].id,presetId);assert.equal((await maskInfo()).hidden,false);
 });
} catch(error) {
 console.error(error.stack);if(ui&&!ui.isClosed())console.error('STATE',await state().catch(()=>({})));if(ui&&!ui.isClosed())console.error('UI',await ui.evaluate(()=>({url:location.href,error:document.getElementById('error')?.textContent})).catch(()=>({})));if(!results.some(r=>r.status==='FAIL'))results.push({name:'Suite setup',status:'FAIL',error:error.stack});process.exitCode=1;
 if(page&&!page.isClosed())await page.screenshot({path:resolve(out,'failure.png')}).catch(()=>{});
} finally {
 await writeFile(resolve(out,'results.json'),JSON.stringify({label,version,executablePath,extensionDir:root,headless:process.env.HEADLESS==='1',date:new Date().toISOString(),platform:process.platform,arch:process.arch,results,errors,observations},null,2));
 if(browser)await browser.close().catch(()=>{});server.close();await rm(profile,{recursive:true,force:true});
}
