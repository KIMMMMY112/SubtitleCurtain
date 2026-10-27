const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const {randomUUID} = require('node:crypto');
function worker() {
 const stored={};let listener,fail=false;
 const context=vm.createContext({crypto:{randomUUID},URL,console,chrome:{runtime:{getURL:p=>'chrome-extension://test/'+p,onMessage:{addListener:f=>{listener=f;}}},storage:{local:{
 get:async key=>structuredClone({[key]:stored[key]}),set:async patch=>{if(fail)throw Error('quota exceeded');Object.assign(stored,structuredClone(patch));}
 }}}});
 context.importScripts=()=>vm.runInContext(fs.readFileSync('src/core/core.js','utf8'),context);
 vm.runInContext(fs.readFileSync('src/extension/background.js','utf8'),context);
 return {stored,fail:()=>{fail=true;},send:(message,sender={tab:{url:'https://video.example/watch'}})=>new Promise(resolve=>listener(message,sender,resolve))};
}
test('serialized concurrent patches retain both edits',async()=>{
 const w=worker();await Promise.all([w.send({type:'SC_SAVE',patch:{width:.5}}),w.send({type:'SC_SAVE',patch:{height:80}}),w.send({type:'SC_SAVE',patch:{locked:true}})]);
 const s=(await w.send({type:'SC_CONTEXT'})).settings;assert.equal(s.width,.5);assert.equal(s.height,80);assert.equal(s.locked,true);
});
test('iframe context uses top tab site and independent sites stay isolated',async()=>{
 const w=worker();await w.send({type:'SC_SAVE',patch:{enabled:true}});
 assert.equal((await w.send({type:'SC_CONTEXT'})).site,'video.example');
 assert.equal((await w.send({type:'SC_CONTEXT'},{tab:{url:'https://other.test'}})).settings.enabled,false);
});
test('storage failure propagates and queue can continue',async()=>{
 const w=worker();w.fail();const result=await w.send({type:'SC_SAVE',patch:{enabled:true}});assert.equal(result.ok,false);assert.match(result.error,/quota/);assert.equal((await w.send({type:'SC_CONTEXT'})).ok,true);
});
test('library create, rename, update, delete and import preserve safe style data',async()=>{
 const w=worker(),send=m=>w.send({type:'SC_LIBRARY',...m},{url:'chrome-extension://test/src/popup/popup.html',tab:{id:2}});
 let r=await send({action:'save',item:{name:'One',style:{shape:'custom',polygon:'0,0 100,0 50,100',enabled:true}}});
 const id=r.library[0].id;assert.equal(r.library[0].style.enabled,undefined);
 r=await send({action:'save',item:{id,name:'New name',style:{shape:'ellipse'}}});assert.equal(r.library[0].name,'New name');
 assert.equal((await send({action:'import',items:r.library})).library.length,1);
 assert.equal((await send({action:'delete',id})).library.length,0);
 assert.equal((await send({action:'import',items:[{}]})).ok,false);
 assert.equal((await w.send({type:'SC_LIBRARY',action:'get'})).ok,false);
});
test('reset clears only current site and preserves global library',async()=>{
 const w=worker();await w.send({type:'SC_SAVE',patch:{enabled:true}});const sender={url:'chrome-extension://test/src/popup/popup.html'};
 await w.send({type:'SC_LIBRARY',action:'save',item:{name:'Saved',style:{}}},sender);
 const s=await w.send({type:'SC_SAVE',reset:true});assert.equal(s.settings.enabled,false);assert.equal((await w.send({type:'SC_LIBRARY',action:'get'},sender)).library.length,1);
});
