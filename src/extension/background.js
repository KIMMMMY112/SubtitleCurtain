/* Chrome storage adapter; serialize mutations so rapid popup/frame edits cannot overwrite each other. */
'use strict';
importScripts('../core/core.js');
const Core = globalThis.SubtitleCurtainCore;
const LIBRARY_KEY = 'subtitleCurtain:v1:library';
let queue = Promise.resolve();
function serial(job) {
  const next = queue.then(job);
  queue = next.catch(() => {});
  return next;
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (!message || !['SC_CONTEXT','SC_SAVE','SC_LIBRARY'].includes(message.type)) return false;
  serial(async () => {
    if (message.type === 'SC_LIBRARY') {
      if (sender.url?.split('?')[0] !== chrome.runtime.getURL('src/popup/popup.html')) throw new Error('请在扩展管理界面编辑花色库');
      const stored = await chrome.storage.local.get(LIBRARY_KEY);
      let library = Core.normalizeLibrary(stored[LIBRARY_KEY]);
      if (message.action === 'save') {
        const item = message.item;
        if (!item || typeof item.name !== 'string' || !item.name.trim()) throw new Error('请输入花色名称');
        const index = library.findIndex(p => p.id === item.id);
        if (index < 0 && library.length >= 50) throw new Error('最多保存 50 个花色，请先删除一些');
        const preset = {id:index < 0 ? crypto.randomUUID() : library[index].id, name:item.name,style:item.style};
        if (index < 0) library.push(preset); else library[index] = preset;
      } else if (message.action === 'delete') library = library.filter(p => p.id !== message.id);
      else if (message.action === 'import') {
        if (!Array.isArray(message.items) || message.items.length > 50) throw new Error('导入文件必须包含至多 50 个花色');
        const imported = Core.normalizeLibrary(message.items);
        if (imported.length !== message.items.length) throw new Error('花色文件格式无效');
        for (const item of imported) {
          const i = library.findIndex(p => p.id === item.id);
          if (i < 0) library.push(item); else library[i] = item;
        }
        if (library.length > 50) throw new Error('导入后将超过 50 个花色');
      }
      library = Core.normalizeLibrary(library);
      if (message.action !== 'get') await chrome.storage.local.set({[LIBRARY_KEY]:library});
      return {ok:true,library};
    }
    const site = new URL(sender.tab?.url || '').hostname;
    if (!site) throw new Error('无法确定当前网站');
    const key = Core.storageKey(site);
    const stored = await chrome.storage.local.get(key);
    let settings = Core.normalize(stored[key]);
    if (message.type === 'SC_SAVE') {
      settings = message.reset ? Core.normalize() : Core.merge(settings,message.patch);
      await chrome.storage.local.set({[key]:settings});
    }
    return {ok:true,site,key,settings};
  }).then(reply,error => reply({ok:false,error:error.message}));
  return true;
});
