import {readFile,writeFile,readdir} from 'node:fs/promises';
const version=JSON.parse(await readFile('manifest.json','utf8')).version;
for(const name of await readdir('test-results')){
 try {
  const path=`test-results/${name}/results.json`,data=JSON.parse(await readFile(path,'utf8'));
  delete data.executablePath;delete data.extensionDirectory;
  await writeFile(`docs/test-results/ci-${name}-v${version}.json`,JSON.stringify(data,null,2)+'\n');
 }catch(error){if(error.code!=='ENOENT')throw error;}
}
const run=process.env.GITHUB_RUN_ID;
if(run){const path='docs/RELEASE-STATUS.md';const content=await readFile(path,'utf8');await writeFile(path,content+`\n## Publication pipeline verification\n\n[GitHub Actions run ${run}](https://github.com/KIMMMMY112/SubtitleCurtain/actions/runs/${run}) executes source checks, Chromium extension regression, WebKit viewport tests, website tests and archive/checksum parity before publication. Raw CI records are in docs/test-results/ci-*-v${version}.json. Actual store review, physical iOS and real manager-upgrade tests remain pending.\n`);}
