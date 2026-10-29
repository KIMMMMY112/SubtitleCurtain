export const identity = Object.freeze({name:'SubtitleCurtain',namespace:'https://github.com/KIMMMMY112/SubtitleCurtain'});
export const updateURLs = Object.freeze({
  update:'https://raw.githubusercontent.com/KIMMMMY112/SubtitleCurtain/main/userscripts/SubtitleCurtain.meta.js',
  download:'https://raw.githubusercontent.com/KIMMMMY112/SubtitleCurtain/main/userscripts/SubtitleCurtain.user.js'
});
export function metadata(version,{channel='github'} = {}) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Expected a numeric release version');
  if (!['github','greasyfork'].includes(channel)) throw new Error('Unknown distribution channel');
  const fields = [
    ['name',identity.name],['namespace',identity.namespace],['version',version],
    ['description','Hide translated subtitles with a draggable curtain. Local settings, custom shapes and saved styles. Safari preview.'],
    ['description:zh-CN','用可拖动遮挡条隐藏翻译字幕；本地保存、自定义形状和花色管理。Safari 预览版。'],
    ['author','KIMMMMY112'],['license','MIT'],['homepageURL',identity.namespace],['supportURL',identity.namespace+'/issues'],
    ...(channel === 'github' ? [['updateURL',updateURLs.update],['downloadURL',updateURLs.download]] : []),
    ['match','http://*/*'],['match','https://*/*'],['run-at','document-end'],
    ['grant','GM.getValue'],['grant','GM.setValue'],['inject-into','content']
  ];
  return '// ==UserScript==\n'+fields.map(([key,value])=>'// @'+key.padEnd(19)+value).join('\n')+'\n// ==/UserScript==\n';
}
