const {test} = require('node:test');
const assert = require('node:assert/strict');
require('../../src/core/core.js');
const C = globalThis.SubtitleCurtainCore;
test('defaults do not cover every website on first install',()=>{assert.equal(C.normalize().enabled,false); assert.equal(C.normalize().locked,false);});
test('normalization rejects malformed values, unknown keys, CSS and nonfinite numbers',()=>{
 const s = C.normalize({enabled:'yes',x:NaN,y:Infinity,width:-8,height:99999,color1:'url(https://x)',color2:'#AABbCc',shape:'oops',opacity:0,extra:1});
 assert.equal(s.x,C.DEFAULTS.x);assert.equal(s.y,C.DEFAULTS.y);assert.equal(s.width,.02);assert.equal(s.height,400);
 assert.equal(s.color1,C.DEFAULTS.color1);assert.equal(s.color2,'#aabbcc');assert.equal(s.opacity,.1);assert.equal(s.shape,'rounded');assert.equal(s.extra,undefined);
});
test('merge preserves geometry, lock and toggle when applying a style',()=>{
 const before = C.merge(C.DEFAULTS,{x:.3,width:.4,enabled:true,locked:true});
 const after = C.merge(before,C.styleOnly({color1:'#ffffff',shape:'ellipse'}));
 for(const k of ['x','y','width','height','enabled','locked']) assert.equal(after[k],before[k]);
 assert.equal(after.shape,'ellipse');
});
test('geometry clamps every edge for tiny and large viewports (1000 cases)',()=>{
 let seed=19; const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let i=0;i<1000;i++) {const vp={width:1+Math.floor(random()*4000),height:1+Math.floor(random()*2400)};
 const g=C.geometry({x:random()*2,y:random()*2,width:random(),height:random()*500},vp);
 assert.ok(g.left>=0&&g.top>=0);assert.ok(g.left+g.width<=vp.width);assert.ok(g.top+g.height<=vp.height);}
 assert.equal(C.geometry({},{}).width,1);
});
test('all built-in fills and shapes generate safe styles',()=>{
 for(const fillType of C.CHOICES.fillType) for(const pattern of C.CHOICES.pattern) for(const shape of C.CHOICES.shape) {
 const a=C.appearance({fillType,pattern,shape,angle:315,scale:50});assert.ok(a.background);assert.ok(a.clipPath);assert.doesNotMatch(JSON.stringify(a),/url\(|undefined|NaN/);}
 assert.match(C.background({fillType:'gradient',angle:123}),/123deg/);
});
test('polygon accepts custom coordinates and rejects CSS, overflow and zero area',()=>{
 assert.equal(C.polygonPoints('0,50 50,0 100,50 50,100').length,4);
 for(const p of ['0,0 0,0 0,0','0,0 10,10','0,0 101,0 100,100','url(x)','0,0 0,50 0,100','-1,0 100,0 50,50']) assert.equal(C.polygonPoints(p),null);
 assert.match(C.appearance({shape:'custom',polygon:'0,50 50,0 100,50 50,100'}).clipPath,/50%/);
});
test('site keys are stable and isolated by hostname',()=>{assert.equal(C.storageKey('VIDEO.Example'),C.storageKey('video.example'));assert.notEqual(C.storageKey('a.test'),C.storageKey('b.test'));});
test('library validates names, caps size, strips settings and duplicate IDs',()=>{
 const list=C.normalizeLibrary([{id:'one',name:'  shape  ',style:{enabled:true,x:.7,shape:'ticket'}},{id:'one',name:'duplicate'},{id:'bad/id',name:'bad'},{id:'two',name:''}]);
 assert.equal(list.length,1);assert.equal(list[0].name,'shape');assert.equal(list[0].style.x,undefined);assert.equal(list[0].style.enabled,undefined);
 assert.equal(C.normalizeLibrary(Array.from({length:60},(_,i)=>({id:'id-'+i,name:'n'}))).length,50);
});
