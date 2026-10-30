import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const {version}=JSON.parse(await readFile('manifest.json','utf8'));
const manual=`dist/SubtitleCurtain-Chromium-v${version}.zip`,store=`dist/SubtitleCurtain-Store-v${version}.zip`;
const entries=zip=>execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n');
const extract=(zip,file)=>execFileSync('unzip',['-p',zip,file]);
const storeEntries=entries(store);
assert.ok(storeEntries.includes('manifest.json'));
assert.ok(storeEntries.includes('LICENSE')&&storeEntries.includes('PRIVACY.md'));
assert.ok(!storeEntries.some(p=>/^(tests|node_modules|site|userscripts|src\/userscript|docs)\//.test(p)));
for(const path of storeEntries.filter(p=>!p.endsWith('/')))assert.deepEqual(extract(store,path),extract(manual,path),'Package parity: '+path);
const github=await readFile('userscripts/SubtitleCurtain.user.js','utf8'),gf=await readFile('dist/greasyfork/SubtitleCurtain.user.js','utf8'),meta=await readFile('userscripts/SubtitleCurtain.meta.js','utf8');
const end='// ==/UserScript==\n';
assert.equal(github.slice(0,github.indexOf(end)+end.length),meta);
assert.equal(github.slice(github.indexOf(end)),gf.slice(gf.indexOf(end)));
assert.doesNotMatch(gf.slice(0,gf.indexOf(end)),/^\/\/\s+@(updateURL|downloadURL|require)\s/m);
const kit=`dist/safari/SubtitleCurtain-Safari-Userscripts-v${version}.zip`;
assert.deepEqual(extract(kit,'SubtitleCurtain.user.js'),Buffer.from(github));
for(const sumFile of ['dist/SHA256SUMS.txt','dist/safari/SHA256SUMS.txt']){
 const dir=sumFile.slice(0,sumFile.lastIndexOf('/')+1);
 for(const line of (await readFile(sumFile,'utf8')).trim().split('\n')){const [expected,file]=line.split('  ');assert.equal(createHash('sha256').update(await readFile(dir+file)).digest('hex'),expected,file);}
}
const html=await readFile('site/index.html','utf8');
for(const [,path] of html.matchAll(/(?:src|href)="((?:assets|install)\/[^"]+)"/g))await access('site/'+path);
assert.doesNotMatch(html,/chromewebstore\.google\.com\/detail\/|microsoftedge\.microsoft\.com\/addons\/detail\//);
console.log('PASS: root manifests, exact store/manual runtime parity, userscript channels, directory kit, SHA256 and local site assets.');
