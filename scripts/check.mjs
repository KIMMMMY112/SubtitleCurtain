import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
const manifest = JSON.parse(await readFile('manifest.json','utf8'));
assert.equal(manifest.manifest_version,3);
assert.equal(manifest.version,JSON.parse(await readFile('package.json','utf8')).version);
assert.deepEqual(manifest.permissions,['storage','activeTab']);
const files = [manifest.background.service_worker,manifest.action.default_popup,...Object.values(manifest.icons),...manifest.content_scripts.flatMap(s=>s.js)];
for (const file of files) await access(file);
for (const dir of ['src/core','src/extension','src/popup','src/userscript']) for (const file of await readdir(dir)) {
  if (file.endsWith('.js')) assert.doesNotMatch(await readFile(`${dir}/${file}`,'utf8'),/\beval\s*\(|\bnew Function\b|\bfetch\s*\(|XMLHttpRequest|https?:\/\//,'Extension runtime must stay local and CSP-safe');
}
const core = (await Promise.all(['core.js','overlay.js','controls.js'].map(f=>readFile('src/core/'+f,'utf8')))).join('\n');
assert.doesNotMatch(core,/\bchrome\./,'Portable core must not call Chrome APIs');
const html = await readFile(manifest.action.default_popup,'utf8');
assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>\s*[^<]|\son\w+=|https?:\/\//i);
console.log('Manifest, packaged entry points, permission limits, local-only runtime and portable core: PASS');
