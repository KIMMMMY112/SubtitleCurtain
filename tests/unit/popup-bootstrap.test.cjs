const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function page({extension=false,core=false,hanging=false}={}) {
 const elements=new Map();const callbacks=[];
 const get=id=>{if(!elements.has(id))elements.set(id,{id,textContent:'',hidden:true,disabled:true,addEventListener(){}});return elements.get(id);};
 const context=vm.createContext({console,URLSearchParams,location:{protocol:extension?'chrome-extension:':'file:',search:''},
 document:{getElementById:get,body:{classList:{add(){}}}},setTimeout:fn=>{callbacks.push(fn);return 1;},clearTimeout(){},
 chrome:extension?{runtime:{id:'test'},tabs:{query:()=>hanging?new Promise(()=>{}):Promise.resolve([])},storage:{onChanged:{addListener(){}}}}:undefined});
 if(core)vm.runInContext(fs.readFileSync('src/core/core.js','utf8'),context);
 vm.runInContext(fs.readFileSync('src/popup/popup.js','utf8'),context);
 return {get,callbacks};
}
test('opening popup.html as a file gives installation instructions without extension APIs',()=>{
 const p=page();assert.match(p.get('error').textContent,/不能直接双击/);assert.match(p.get('site').textContent,/尚未作为浏览器扩展/);assert.equal(p.get('manager').hidden,true);
});
test('missing core script gives an incomplete-installation error',()=>{
 const p=page({extension:true});assert.match(p.get('site').textContent,/扩展文件不完整/);assert.match(p.get('error').textContent,/核心脚本加载失败/);
});
test('a stalled browser connection expires instead of leaving a permanent connecting label',async()=>{
 const p=page({extension:true,core:true,hanging:true});assert.match(p.get('site').textContent,/正在连接/);
 for(const fn of p.callbacks)fn();await new Promise(r=>require('node:timers').setImmediate(r));
 assert.match(p.get('error').textContent,/连接超过 6 秒/);assert.match(p.get('site').textContent,/此页面暂不支持/);
});
