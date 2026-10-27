/* Optional live-site check. Never used by CI; failures are recorded as failures, not compatibility passes. */
import puppeteer from 'puppeteer';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const bili=process.env.SC_SITE==='bilibili';const out=resolve('test-results',bili?'live-bilibili':'live-youtube');await mkdir(out,{recursive:true});
const result={date:new Date().toISOString(),url:bili?'https://www.bilibili.com/video/BV1vp4y1x7FW/':'https://www.youtube.com/watch?v=jNQXAC9IVRw&hl=en',platform:process.platform,arch:process.arch,headless:true,results:[]};
let browser;
try {
 browser=await puppeteer.launch({executablePath:process.env.SC_BROWSER_EXECUTABLE || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':await puppeteer.executablePath()),headless:true,pipe:true,enableExtensions:[resolve('.')],args:['--enable-unsafe-extension-debugging','--autoplay-policy=no-user-gesture-required']});
 result.browser=await browser.version();const worker=await(await browser.waitForTarget(t=>t.type()==='service_worker'&&t.url().endsWith('/background.js'))).worker();
 const page=await browser.newPage();await page.goto(result.url,{waitUntil:'domcontentloaded',timeout:45000});await page.bringToFront();
 const rejects=await page.$$('button');for(const button of rejects){const text=await button.evaluate(b=>b.textContent);if(/Reject all/i.test(text)){await button.click();break;}}
 await page.waitForSelector('video',{timeout:30000});await page.$eval('video',v=>{v.muted=true;return v.play();});await page.waitForFunction(()=>{const v=document.querySelector('video');return v&&!v.paused&&v.currentTime>1&&v.readyState>=2;},{polling:100,timeout:45000});
 result.results.push({name:bili?'Public Bilibili video actually plays':'Public YouTube video actually plays',status:'PASS'});
 await page.waitForFunction(()=>!!document.getElementById('subtitle-curtain-root')?.shadowRoot,{polling:100});
 const tabId=await worker.evaluate(async()=>(await chrome.tabs.query({active:true,lastFocusedWindow:true}))[0].id);
 await worker.evaluate(async id=>{const r=await chrome.tabs.sendMessage(id,{type:'SC_PATCH',patch:{enabled:true,locked:true,shape:'rectangle',fillType:'solid',color1:'#111827',opacity:1,width:.8,height:56,x:.1,y:.8}},{frameId:0});if(!r.ok)throw Error(r.error);},tabId);
 await page.screenshot({path:resolve(out,'normal.png')});result.results.push({name:bili?'Curtain appears on public Bilibili playback':'Curtain appears on public YouTube playback',status:'PASS'});
 if(bili){await page.click('.bpx-player-ctrl-web');await page.waitForFunction(()=>{const r=document.querySelector('video').getBoundingClientRect();return r.width>=innerWidth*.9&&r.height>=innerHeight*.9;},{polling:100});await page.screenshot({path:resolve(out,'web-fullscreen.png')});result.results.push({name:'Bilibili web fullscreen displays curtain',status:'PASS'});await page.click('.bpx-player-ctrl-web');}
 await page.click(bili?'.bpx-player-ctrl-full':'.ytp-fullscreen-button');await page.waitForFunction(()=>!!document.fullscreenElement,{polling:100});
 const visible=await page.evaluate(()=>{const h=document.getElementById('subtitle-curtain-root'),m=h.shadowRoot.getElementById('mask');return !m.hidden&&h.matches(':popover-open')&&m.getBoundingClientRect().width>0;});
 if(!visible)throw Error('Curtain not visible in YouTube fullscreen');
 await page.screenshot({path:resolve(out,'fullscreen.png')});result.results.push({name:bili?'Bilibili player-container fullscreen displays curtain':'YouTube player-container fullscreen displays curtain',status:'PASS'});
 if(bili){await page.click('.bpx-player-ctrl-play');await page.waitForFunction(()=>document.querySelector('video').paused,{polling:100});await page.click('.bpx-player-ctrl-play');await page.waitForFunction(()=>!document.querySelector('video').paused,{polling:100});result.results.push({name:'Bilibili pause/play controls respond with curtain locked',status:'PASS'});}
 console.log(JSON.stringify(result,null,2));
} catch(error){if(browser){const pages=await browser.pages();const p=pages.at(-1);result.page=await p.evaluate(()=>({url:location.href,title:document.title,text:document.body.innerText.slice(0,1500)})).catch(()=>({}));await p.screenshot({path:resolve(out,'failure.png')}).catch(()=>{});}result.results.push({name:'Live-site attempt',status:'FAIL',reason:error.message});console.error(error.message);process.exitCode=1;}
finally{await writeFile(resolve(out,'results.json'),JSON.stringify(result,null,2));if(browser)await browser.close();}
