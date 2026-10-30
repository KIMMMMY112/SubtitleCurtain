import {mkdir,rm,cp,readFile,writeFile} from 'node:fs/promises';
import {resolve,basename} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const {version} = JSON.parse(await readFile('manifest.json','utf8'));
await mkdir('dist',{recursive:true});
const sums=[];
for(const [kind,directory,entries] of [
  ['Chromium','unpacked',['manifest.json','src/core','src/extension','src/popup','assets','README.md','README.zh-CN.md','CONTRIBUTING.md','START-HERE.html','LICENSE','PRIVACY.md','CHANGELOG.md','docs']],
  ['Store','store',['manifest.json','src/core','src/extension','src/popup','assets','LICENSE','PRIVACY.md']]
]) {
  const dest=resolve('dist',directory);await rm(dest,{recursive:true,force:true});await mkdir(dest);
  for(const entry of entries){await mkdir(resolve(dest,entry,'..'),{recursive:true});await cp(entry,resolve(dest,entry),{recursive:true,filter:p=>basename(p)!=='.DS_Store'});}
  const zip=resolve(`dist/SubtitleCurtain-${kind}-v${version}.zip`);await rm(zip,{force:true});
  execFileSync('zip',['-X','-q','-r',zip,...entries],{cwd:dest});
  sums.push(createHash('sha256').update(await readFile(zip)).digest('hex')+'  '+basename(zip));
  console.log('Built '+zip);
}
await writeFile('dist/SHA256SUMS.txt',sums.join('\n')+'\n');
