/* Extension transport only. Portable geometry/DOM stay in src/core for a future Safari userscript adapter. */
(() => {
  'use strict';
  if (globalThis.__subtitleCurtainInjected) return;
  globalThis.__subtitleCurtainInjected = true;
  let overlay, context, saveError = '';
  let saveSequence = 0, pendingPatch = {};
  async function request(message) {
    const response = await chrome.runtime.sendMessage(message);
    if (!response?.ok) throw new Error(response?.error || '扩展未响应，请刷新网页');
    return response;
  }
  async function save(patch, reset = false) {
    const sequence = ++saveSequence;
    pendingPatch = reset ? {...globalThis.SubtitleCurtainCore.DEFAULTS} : {...pendingPatch,...patch};
    try {
      const result = await request({type:'SC_SAVE',patch,reset});
      if (sequence === saveSequence) pendingPatch = {};
      overlay.setSettings({...result.settings,...pendingPatch}); saveError = ''; return result;
    } catch (error) {saveError = error.message; console.warn('[SubtitleCurtain] Save failed',error); throw error;}
  }
  const ready = request({type:'SC_CONTEXT'}).then(result => {
    context = result;
    overlay = globalThis.SubtitleCurtainOverlay.create({isTop:window === window.top,
      onCommit:patch => {save(patch).catch(() => {});},
      onToggle:() => {save({enabled:!overlay.getSettings().enabled}).catch(() => {});},
      onLock:() => {save({locked:!overlay.getSettings().locked}).catch(() => {});}
    });
    overlay.setSettings(result.settings);
  });
  // The popup always targets frame 0; nested players receive changes through storage.
  chrome.runtime.onMessage.addListener((message, _sender, reply) => {
    if (!message || !['SC_GET_STATE','SC_PATCH','SC_RESET'].includes(message.type)) return false;
    ready.then(async () => {
      if (message.type === 'SC_GET_STATE') return {ok:true,settings:overlay.getSettings(),site:context.site,saveError};
      return save(message.patch,message.type === 'SC_RESET');
    }).then(reply,error => reply({ok:false,error:error.message}));
    return true;
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && context && Object.hasOwn(changes,context.key)) overlay.setSettings({...changes[context.key].newValue,...pendingPatch});
  });
  ready.catch(error => console.warn('[SubtitleCurtain] Initialization failed',error));
})();
