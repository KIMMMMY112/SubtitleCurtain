(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  // Opening popup.html as a local file is a common installation mistake.
  // Explain it before touching any extension API, rather than leaving a loading label forever.
  if (location.protocol !== 'chrome-extension:' || !globalThis.chrome?.runtime?.id) {
    $('site').textContent = '尚未作为浏览器扩展打开';
    $('error').hidden = false;
    $('error').textContent = '不能直接双击 popup.html 使用。请在 Chrome 地址栏输入 chrome://extensions，开启开发者模式，点击「加载已解压的扩展程序」，选择包含 manifest.json 的 SubtitleCurtain 文件夹。然后打开视频网页，从浏览器工具栏的扩展图标启动。';
    $('manager').hidden = true;
    return;
  }
  const Core = globalThis.SubtitleCurtainCore;
  if (!Core) {
    $('site').textContent = '扩展文件不完整'; $('error').hidden = false;
    $('error').textContent = '核心脚本加载失败。请重新解压完整安装包，并在扩展管理页重新加载扩展。'; return;
  }
  $('site').textContent = '正在连接当前网页…';
  async function bounded(promise) {
    let timer;
    try {return await Promise.race([promise,new Promise((_,reject) => {timer = setTimeout(() => reject(new Error('连接超过 6 秒，请在扩展管理页重新加载扩展，再刷新视频网页')),6000);})]);}
    finally {clearTimeout(timer);}
  }
  const ids = Object.keys(Core.DEFAULTS).filter(k => !['x','y'].includes(k));
  let tabId = null, siteKey = null, state = Core.normalize(), library = [], revision = 0, inFlight = 0;
  let pending = Promise.resolve();
  const standalone = new URLSearchParams(location.search).get('tabId');
  if (standalone) document.body.classList.add('standalone');
  function showError(message) {$('error').hidden = false; $('error').textContent = message; $('status').textContent = '';}
  function status(message) {$('error').hidden = true; $('status').textContent = message;}
  function display(s) {
    state = Core.normalize(s);
    for (const id of ids) {
      const el = $(id), value = ['width','opacity'].includes(id) ? Math.round(state[id]*100) : state[id];
      if (el.type === 'checkbox') el.checked = value; else el.value = value;
    }
    $('patternLine').hidden = state.fillType !== 'pattern';
    $('polygonLine').hidden = state.shape !== 'custom';
    $('color2').disabled = state.fillType === 'solid';
    $('radius').disabled = state.shape !== 'rounded';
    $('angle').disabled = state.fillType === 'solid' || state.fillType === 'pattern' && state.pattern !== 'stripes';
    $('scale').disabled = state.fillType !== 'pattern';
    for (const id of ['width','height','opacity','radius','angle','scale']) {
      $(id+'Value').textContent = ['width','opacity'].includes(id) ? Math.round(state[id]*100)+'%' : Math.round(state[id])+(id === 'angle' ? '°' : ' px');
    }
    Object.assign($('preview').style,Core.appearance(state));
  }
  async function message(type, patch) {
    if (!Number.isInteger(tabId)) throw new Error('没有可用的视频网页');
    const response = await bounded(chrome.tabs.sendMessage(tabId,{type,patch},{frameId:0}));
    if (!response?.ok) throw new Error(response?.error || '网页未响应，请刷新网页后重新打开扩展');
    return response;
  }
  function change(patch, type = 'SC_PATCH') {
    const ticket = ++revision;
    inFlight++;
    display(type === 'SC_RESET' ? Core.normalize() : Core.merge(state,patch));
    const job = pending.then(() => message(type,patch));
    pending = job.catch(() => {});
    job.then(response => {if (ticket === revision) {display(response.settings);status('已保存在本机');}},error => showError('保存失败：'+error.message)).finally(() => {inFlight--;});
    return job;
  }
  for (const id of ids) {
    const el = $(id);
    el.addEventListener(el.type === 'range' ? 'input' : 'change', () => {
      let value = el.type === 'checkbox' ? el.checked : el.value;
      if (id === 'polygon' && !Core.polygonPoints(value)) {showError('顶点格式无效：需要 3–24 个非零面积的顶点，坐标为 0–100 的 x,y。'); return;}
      if (['width','opacity'].includes(id)) value = Number(value)/100;
      else if (['height','radius','angle','scale'].includes(id)) value = Number(value);
      change({[id]:value}).catch(() => {});
    });
  }
  $('reset').addEventListener('click', () => change({},'SC_RESET').catch(() => {}));
  $('manager').addEventListener('click', () => {
    if (tabId !== null) chrome.tabs.create({url:chrome.runtime.getURL('src/popup/popup.html')+'?tabId='+tabId}).catch(e => showError(e.message));
  });
  function selected() {return library.find(p => p.id === $('preset').value);}
  function displayLibrary(preferred = $('preset').value) {
    $('preset').replaceChildren(new Option('选择花色…',''));
    for (const p of library) $('preset').add(new Option(p.name,p.id));
    $('preset').value = library.some(p => p.id === preferred) ? preferred : '';
    const absent = !selected();
    for (const id of ['applyPreset','deletePreset','updatePreset','renamePreset']) $(id).disabled = absent;
  }
  async function libraryAction(action, extra = {}) {
    const result = await bounded(chrome.runtime.sendMessage({type:'SC_LIBRARY',action,...extra}));
    if (!result?.ok) throw new Error(result?.error || '花色库未响应');
    library = result.library; displayLibrary(); return library;
  }
  $('preset').addEventListener('change', () => {displayLibrary(); $('presetName').value = selected()?.name || '';});
  $('applyPreset').addEventListener('click', () => {const p = selected(); if (p) change(p.style).catch(() => {});});
  function libraryButton(id, action) {$(id).addEventListener('click', () => action().catch(e => showError(e.message)));}
  libraryButton('savePreset',async () => {
    await pending;
    await libraryAction('save',{item:{name:$('presetName').value,style:Core.styleOnly(state)}});
    displayLibrary(library.at(-1).id); status('新花色已保存');
  });
  libraryButton('updatePreset',async () => {
    const p = selected(); if (!p) return;
    await pending;
    await libraryAction('save',{item:{id:p.id,name:$('presetName').value,style:Core.styleOnly(state)}}); status('花色已更新');
  });
  libraryButton('renamePreset',async () => {
    const p = selected(); if (!p) return;
    await libraryAction('save',{item:{...p,name:$('presetName').value}}); status('花色已重命名');
  });
  libraryButton('deletePreset',async () => {
    const p = selected(); if (!p) return;
    await libraryAction('delete',{id:p.id}); $('presetName').value = ''; status('花色已删除');
  });
  libraryButton('exportPresets',async () => {
    await libraryAction('get');
    const url = URL.createObjectURL(new Blob([JSON.stringify({format:'SubtitleCurtain.styles',version:1,presets:library},null,2)],{type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'SubtitleCurtain-styles.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000); status('花色库已导出');
  });
  $('importPresets').addEventListener('change',async () => {
    try {
      const file = $('importPresets').files[0]; if (!file) return;
      if (file.size > 131072) throw new Error('文件不能超过 128 KB');
      const data = JSON.parse(await file.text());
      if (data.format !== 'SubtitleCurtain.styles' || data.version !== 1) throw new Error('这不是 SubtitleCurtain v1 花色文件');
      await libraryAction('import',{items:data.presets}); status('花色已导入；相同 ID 的花色已更新');
    } catch (e) {showError(e.message);} finally {$('importPresets').value = '';}
  });
  chrome.storage.onChanged.addListener((changes,area) => {
    if (area === 'local' && changes['subtitleCurtain:v1:library']) {library = Core.normalizeLibrary(changes['subtitleCurtain:v1:library'].newValue); displayLibrary();}
    if (area === 'local' && siteKey && changes[siteKey] && !inFlight) display(changes[siteKey].newValue);
  });
  (async () => {
    try {
      tabId = standalone ? Number(standalone) : (await bounded(chrome.tabs.query({active:true,currentWindow:true})))[0]?.id;
      const response = await message('SC_GET_STATE');
      siteKey = Core.storageKey(response.site);
      $('site').textContent = '当前网站 · '+response.site;
      display(response.settings); await libraryAction('get'); $('controls').disabled = false;
      if (response.saveError) showError('上次保存失败：'+response.saveError);
    } catch (e) {
      $('site').textContent = '此页面暂不支持使用'; $('manager').disabled = true;
      showError('请打开普通 http/https 视频网页，刷新一次后重试。浏览器内部页面、扩展商店和画中画窗口不支持。'+e.message);
    }
  })();
})();
