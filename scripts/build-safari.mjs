import {readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
import {resolve,basename} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const {version} = JSON.parse(await readFile('manifest.json','utf8'));
await mkdir('dist/safari',{recursive:true});
const html = (await readFile('src/popup/popup.html','utf8')).match(/<main>([\s\S]*?)<\/main>/)[0];
let css = (await readFile('src/popup/popup.css','utf8')).replace(/\bhtml\b/g,'.sc-panel').replace(/\bbody\b/g,'.sc-panel');
css += `
:host{all:initial!important;position:fixed!important;left:var(--sc-ui-left,0px)!important;top:var(--sc-ui-top,0px)!important;right:auto!important;bottom:auto!important;width:var(--sc-ui-width,100vw)!important;height:var(--sc-ui-height,100vh)!important;margin:0!important;padding:0!important;border:0!important;max-width:none!important;max-height:none!important;overflow:visible!important;background:transparent!important;pointer-events:none!important;z-index:2147483647!important;color-scheme:light!important}
:host::backdrop{pointer-events:none;background:transparent}
#sc-toolbar{position:absolute;right:8px;top:max(8px,env(safe-area-inset-top));display:flex;gap:4px;pointer-events:auto;font:14px system-ui,sans-serif}
#sc-toolbar button{min-height:44px;min-width:48px;background:#fff;color:#263550;border:1px solid #a5b4fc;border-radius:9px;cursor:pointer;padding:6px 10px;font:inherit;box-shadow:0 2px 6px #11182730}
#sc-toolbar[hidden],#sc-panel[hidden]{display:none!important}
#sc-panel{pointer-events:auto;position:absolute;right:8px;top:64px;margin:0;width:min(360px,calc(var(--sc-ui-width,100vw) - 16px));max-width:calc(var(--sc-ui-width,100vw) - 16px);max-height:calc(var(--sc-ui-height,100dvh) - 76px);overflow:auto;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 10px 35px #11182740;font:13px/1.5 system-ui,sans-serif}
#sc-panel.standalone{width:min(900px,calc(var(--sc-ui-width,100vw) - 16px))}
#sc-panel.standalone #manager{display:block}
#sc-panel select,#sc-panel input[type=text],#sc-panel input[type=color],#sc-panel button,#sc-panel .file-button{min-height:40px}
#sc-panel input[type=range]{height:30px}
#sc-panel textarea,#sc-panel input[type=text]{font-size:16px}
@media(max-width:600px){#sc-panel.standalone #controls{display:block}#sc-panel.standalone .group{margin-bottom:12px}}
`;
const files = ['src/core/core.js','src/core/overlay.js','src/core/controls.js','src/userscript/storage.js'];
const sources = await Promise.all(files.map(file=>readFile(file,'utf8')));
const metadata = `// ==UserScript==\n// @name         SubtitleCurtain\n// @namespace    https://github.com/KIMMMMY112/SubtitleCurtain\n// @version      ${version}\n// @description  Safari preview: local subtitle curtain with touch controls and saved styles\n// @match        http://*/*\n// @match        https://*/*\n// @run-at       document-end\n// @grant        GM.getValue\n// @grant        GM.setValue\n// @inject-into  content\n// @license      MIT\n// ==/UserScript==\n`;
const script = metadata+`\n(function(manager){\n'use strict';\nconst globalThis = {GM:manager};\n`+sources.join('\n')+`\nglobalThis.SubtitleCurtainUserscriptAssets = ${JSON.stringify({html,css})};\n`+await readFile('src/userscript/entry.js','utf8')+`\n})(typeof GM === 'object' ? GM : undefined);\n`;
const file = resolve(`dist/safari/SubtitleCurtain-Safari-v${version}.user.js`);await writeFile(file,script);
await mkdir('dist/safari/userscripts',{recursive:true});await writeFile('dist/safari/userscripts/SubtitleCurtain.user.js',script);
await mkdir('userscripts',{recursive:true});await writeFile('userscripts/SubtitleCurtain.user.js',script);
// iOS can read a selected directory directly, without the URL install prompt.
const kit = resolve('dist/safari/userscript-install-kit');await mkdir(kit,{recursive:true});
await writeFile(resolve(kit,'SubtitleCurtain.user.js'),script);
await cp('LICENSE',resolve(kit,'LICENSE'));
await writeFile(resolve(kit,'README.txt'),`SubtitleCurtain Safari Userscripts installation\n\n1. Extract this ZIP in the iPad/iPhone Files app.\n2. Open the Userscripts app, tap Set Userscripts Directory, and select the folder directly containing SubtitleCurtain.user.js.\n3. Enable Userscripts for your video website in Safari. Refresh the website, open Safari extensions > Userscripts, and enable SubtitleCurtain.\n4. The page toolbar has Show/Hide and Settings controls.\n\nThis is a userscript directory, not a native Safari extension. Do not select the unextracted ZIP. Selecting a different directory changes which scripts Userscripts loads; if you already use other scripts, copy SubtitleCurtain.user.js into your existing script directory instead.\n\n中文：在“文件”App 中解压；打开 Userscripts App → Set Userscripts Directory → 选择直接包含 SubtitleCurtain.user.js 的文件夹。回到 Safari 视频网页，允许 Userscripts 访问该网站并刷新，在扩展菜单中启用 SubtitleCurtain。已有其他脚本时，将本脚本放进现有目录即可，不用更换目录。\n`);
const kitZip = resolve(`dist/safari/SubtitleCurtain-Safari-Userscripts-v${version}.zip`);await rm(kitZip,{force:true});
execFileSync('zip',['-X','-q',kitZip,'SubtitleCurtain.user.js','README.txt','LICENSE'],{cwd:kit});
const kitDigest = createHash('sha256').update(await readFile(kitZip)).digest('hex');
await writeFile('dist/safari/Userscripts-SHA256SUMS.txt',kitDigest+'  '+basename(kitZip)+'\n');
const native = resolve('dist/safari/webextension');await rm(native,{recursive:true,force:true});await mkdir(native);
for (const entry of ['src/core','src/extension','src/popup','assets']) await cp(entry,resolve(native,entry),{recursive:true,filter:p=>basename(p)!=='.DS_Store'});
await cp('LICENSE',resolve(native,'LICENSE'));
await cp('PRIVACY.md',resolve(native,'PRIVACY.md'));
await cp('docs/SAFARI.md',resolve(native,'README.md'));
const manifest = JSON.parse(await readFile('manifest.json','utf8'));
delete manifest.minimum_chrome_version;delete manifest.short_name;
manifest.host_permissions = ['http://*/*','https://*/*'];
for (const script of manifest.content_scripts) delete script.match_origin_as_fallback;
await writeFile(resolve(native,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const zip = resolve(`dist/safari/SubtitleCurtain-Safari-WebExtension-Resources-v${version}.zip`);await rm(zip,{force:true});
execFileSync('zip',['-X','-q','-r',zip,'manifest.json','src','assets','LICENSE','PRIVACY.md','README.md'],{cwd:native});
const sums=[];for(const p of [file,zip,kitZip])sums.push(createHash('sha256').update(await readFile(p)).digest('hex')+'  '+basename(p));
await writeFile('dist/safari/SHA256SUMS.txt',sums.join('\n')+'\n');console.log(`Built ${file}\nNative web-extension resources (requires Apple packaging): ${zip}`);
