/* Chrome storage adapter; serialize mutations so rapid popup/frame edits cannot overwrite each other. */
'use strict';
if (!globalThis.SubtitleCurtainCore) importScripts('../core/core.js');
const api = globalThis.browser || globalThis.chrome;
const Core = globalThis.SubtitleCurtainCore;
const LIBRARY_KEY = 'subtitleCurtain:v1:library';
let queue = Promise.resolve();
function serial(job) {
  const next = queue.then(job);
  queue = next.catch(() => {});
  return next;
}
api.runtime.onMessage.addListener((message, sender, reply) => {
  if (!message || !['SC_CONTEXT','SC_SAVE','SC_LIBRARY'].includes(message.type)) return false;
  serial(async () => {
    if (message.type === 'SC_LIBRARY') {
      if (sender.url?.split('?')[0] !== api.runtime.getURL('src/popup/popup.html')) throw new Error('请在扩展管理界面编辑花色库');
      const stored = await api.storage.local.get(LIBRARY_KEY);
      const library = Core.editLibrary(stored[LIBRARY_KEY],message.action,message,() => crypto.randomUUID());
      if (message.action !== 'get') await api.storage.local.set({[LIBRARY_KEY]:library});
      return {ok:true,library};
    }
    const site = new URL(sender.tab?.url || '').hostname;
    if (!site) throw new Error('无法确定当前网站');
    const key = Core.storageKey(site);
    const stored = await api.storage.local.get(key);
    let settings = Core.normalize(stored[key]);
    if (message.type === 'SC_SAVE') {
      settings = message.reset ? Core.normalize() : Core.merge(settings,message.patch);
      await api.storage.local.set({[key]:settings});
    }
    return {ok:true,site,key,settings};
  }).then(reply,error => reply({ok:false,error:error.message}));
  return true;
});
