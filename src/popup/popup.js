(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const api = globalThis.browser || globalThis.chrome;
  // Opening popup.html as a local file is a common installation mistake.
  // Explain it before touching any extension API, rather than leaving a loading label forever.
  if (!['chrome-extension:','safari-web-extension:'].includes(location.protocol) || !api?.runtime?.id) {
    $('site').textContent = '尚未作为浏览器扩展打开';
    $('error').hidden = false;
    $('error').textContent = '不能直接双击 popup.html 使用。请在 Chrome 地址栏输入 chrome://extensions，开启开发者模式，点击「加载已解压的扩展程序」，选择包含 manifest.json 的 SubtitleCurtain 文件夹。然后打开视频网页，从浏览器工具栏的扩展图标启动。';
    $('manager').hidden = true;
    return;
  }
  const Core = globalThis.SubtitleCurtainCore;
  if (!Core || !globalThis.SubtitleCurtainControls) {
    $('site').textContent = '扩展文件不完整'; $('error').hidden = false;
    $('error').textContent = '核心脚本加载失败。请重新解压完整安装包，并在扩展管理页重新加载扩展。'; return;
  }
  let tabId = null, siteKey = null;
  const standalone = new URLSearchParams(location.search).get('tabId');
  if (standalone) document.body.classList.add('standalone');
  async function send(type,patch) {
    if (!Number.isInteger(tabId)) throw new Error('没有可用的视频网页');
    return api.tabs.sendMessage(tabId,{type,patch},{frameId:0});
  }
  globalThis.SubtitleCurtainControls.mount(document,{
    async getState() {
      tabId = standalone ? Number(standalone) : (await api.tabs.query({active:true,currentWindow:true}))[0]?.id;
      const result = await send('SC_GET_STATE');
      if (result?.site) siteKey = Core.storageKey(result.site);
      return result;
    },
    patch:patch => send('SC_PATCH',patch), reset:() => send('SC_RESET'),
    library:(action,extra) => api.runtime.sendMessage({type:'SC_LIBRARY',action,...extra}),
    openManager:() => api.tabs.create({url:api.runtime.getURL('src/popup/popup.html')+'?tabId='+tabId}),
    subscribe(listener) {
      const changed = (changes,area) => {
        if (area !== 'local') return;
        const update = {};
        if (changes['subtitleCurtain:v1:library']) update.library = changes['subtitleCurtain:v1:library'].newValue || [];
        if (siteKey && changes[siteKey]) update.settings = Core.normalize(changes[siteKey].newValue);
        listener(update);
      };
      api.storage.onChanged.addListener(changed);
      return () => api.storage.onChanged.removeListener(changed);
    }
  });
})();
