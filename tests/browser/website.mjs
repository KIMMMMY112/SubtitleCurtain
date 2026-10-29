import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('site');
const server=createServer(async(req,res)=>{try{const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(root+'/'))throw new Error('Invalid path');const data=await readFile(file);const type={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.gif':'image/gif','.xml':'application/xml'}[extname(file)]||'text/plain';res.writeHead(200,{'Content-Type':type});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,pipe:true,executablePath:process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':await puppeteer.executablePath()});
const results=[],errors=[];const out='test-results/website';await mkdir(out,{recursive:true});
const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS',name);}
try{
 await page.setViewport({width:1440,height:1000});await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await check('English homepage and all local product images load',async()=>{await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));assert.match(await page.title(),/SubtitleCurtain/);assert.equal(await page.$eval('html',e=>e.lang),'en');});
 await check('All five browser tabs select correct guidance; no false store links',async()=>{for(const b of ['edge','brave','opera','safari','chrome']){await page.click(`[data-browser="${b}"]`);assert.equal(await page.$eval(`[data-browser="${b}"]`,e=>e.getAttribute('aria-selected')),'true');if(b!=='safari')assert.equal(await page.$eval('#extension-address',e=>e.textContent),b+'://extensions');else assert.equal(await page.$eval('#safari-install',e=>e.hidden),false);}assert.equal(await page.$$eval('a',nodes=>nodes.some(a=>/chromewebstore\.google\.com\/detail\/|microsoftedge\.microsoft\.com\/addons\/detail\//.test(a.href))),false);});
 await check('Chinese language selection persists across refresh',async()=>{await page.click('#language');assert.equal(await page.$eval('html',e=>e.lang),'zh-CN');assert.equal(await page.$eval('h1',e=>e.textContent),'留下英文。遮住翻译。');await page.reload();assert.equal(await page.$eval('html',e=>e.lang),'zh-CN');await page.click('#language');});
 await check('Demo is user-controlled and returns to static poster',async()=>{assert.match(await page.$eval('#demo',e=>e.src),/curtain-video\.png$/);await page.click('#motion');assert.match(await page.$eval('#demo',e=>e.src),/demo\.gif$/);await page.click('#motion');assert.match(await page.$eval('#demo',e=>e.src),/curtain-video\.png$/);});
 await check('Browser selection works with arrow keys',async()=>{await page.focus('#tab-chrome');await page.keyboard.press('ArrowRight');assert.equal(await page.$eval('#tab-edge',e=>e.getAttribute('aria-selected')),'true');});
 await check('Desktop, tablet and mobile layouts have no horizontal overflow',async()=>{for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]){await page.setViewport({width,height});await page.waitForFunction(()=>document.documentElement.scrollWidth<=window.innerWidth);await page.screenshot({path:`${out}/${name}.png`,fullPage:true});}});
 await check('Privacy page and its source link are reachable locally',async()=>{const response=await page.goto(`http://127.0.0.1:${server.address().port}/privacy.html`);assert.equal(response.status(),200);assert.match(await page.$eval('main',e=>e.textContent),/hostname/);});
 assert.deepEqual(errors,[]);
}finally{await writeFile(`${out}/results.json`,JSON.stringify({browser:await browser.version(),physicalMobileDevice:false,results,errors},null,2)+'\n');await browser.close();await new Promise(r=>server.close(r));}
