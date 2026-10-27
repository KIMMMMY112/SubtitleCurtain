const {test} = require('node:test');const assert = require('node:assert/strict');const vm = require('node:vm');const fs = require('node:fs');
const crypto = require('node:crypto').webcrypto;
function setup() {
 const values={};let broken=false;const updates=[];
 const context=vm.createContext({crypto,Uint8Array,console});
 for(const file of ['src/core/core.js','src/userscript/storage.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
 const gm={getValue:async key=>structuredClone(values[key]),setValue:async(key,value)=>{if(broken)throw Error('storage denied');values[key]=structuredClone(value);}};
 return {make:site=>context.SubtitleCurtainUserscriptStorage.create(gm,site,{notify:update=>updates.push(update)}),values,updates,break:()=>{broken=true;}};
}
test('GM adapter persists settings across new instances and isolates site settings',async()=>{
 const s=setup(),a=s.make('bilibili.com');await a.patch({enabled:true,x:.4,shape:'custom',polygon:'0,0 100,0 50,100'});
 const restored=(await s.make('bilibili.com').getState()).settings;assert.equal(restored.enabled,true);assert.equal(restored.x,.4);assert.equal((await s.make('other.test').getState()).settings.enabled,false);
});
test('GM adapter serializes simultaneous patches without losing unrelated fields',async()=>{
 const s=setup(),a=s.make('bilibili.com');await Promise.all([a.patch({height:88}),a.patch({width:.6}),a.patch({locked:true})]);const r=(await a.getState()).settings;
 assert.equal(r.height,88);assert.equal(r.width,.6);assert.equal(r.locked,true);assert.equal(s.updates.length,3);
});
test('GM adapter shares the style library and reuses validated editing rules',async()=>{
 const s=setup(),a=s.make('one.test'),b=s.make('two.test');let result=await a.library('save',{item:{name:'Safari shape',style:{shape:'ellipse',enabled:true}}});
 const id=result.library[0].id;assert.match(id,/^[0-9a-f]{32}$/);assert.equal(result.library[0].style.enabled,undefined);
 assert.equal((await b.library('get')).library[0].id,id);
 result=await b.library('save',{item:{id,name:'Renamed',style:{shape:'pill'}}});assert.equal(result.library[0].name,'Renamed');
 assert.equal((await a.library('import',{items:result.library})).library.length,1);assert.equal((await b.library('delete',{id})).library.length,0);
 await assert.rejects(a.library('import',{items:[{}]}),/格式无效/);
});
test('GM storage failures are reported; reset preserves styles and disables only this site',async()=>{
 const s=setup(),a=s.make('one.test');await a.patch({enabled:true});await a.library('save',{item:{name:'kept',style:{}}});await a.patch({},true);
 assert.equal((await a.getState()).settings.enabled,false);assert.equal((await a.snapshot()).library.length,1);s.break();await assert.rejects(a.patch({enabled:true}),/storage denied/);
});
