/* Safari Userscripts entry point. Bundled with the shared renderer and settings UI. */
(() => {
  'use strict';
  if (document.getElementById('subtitle-curtain-root') || document.getElementById('subtitle-curtain-userscript-controls')) return;
  const Core = globalThis.SubtitleCurtainCore, gm = globalThis.GM;
  const isTop = window === window.top;
  const fs = () => document.fullscreenElement || document.webkitFullscreenElement;
  let site = location.hostname;
  if (!isTop) {
    try {
      const origins = location.ancestorOrigins;
      site = new URL(origins?.length ? origins[origins.length-1] : document.referrer).hostname || site;
    } catch { /* With a restricted referrer, settings fall back to this frame's hostname. */ }
  }
  const ui = document.createElement('div');ui.id = 'subtitle-curtain-userscript-controls';ui.setAttribute('popover','manual');
  const shadow = ui.attachShadow({mode:'open'}), style = document.createElement('style');
  style.textContent = globalThis.SubtitleCurtainUserscriptAssets.css;
  const panel = document.createElement('div');panel.id = 'sc-panel';panel.className = 'sc-panel';panel.hidden = true;
  panel.innerHTML = globalThis.SubtitleCurtainUserscriptAssets.html;
  const toolbar = document.createElement('div');toolbar.id = 'sc-toolbar';
  const toggle = document.createElement('button');toggle.id = 'sc-toggle';toggle.textContent = '显示';toggle.setAttribute('aria-label','显示或隐藏字幕遮挡条');
  const settingsButton = document.createElement('button');settingsButton.id = 'sc-settings';settingsButton.textContent = '设置';settingsButton.setAttribute('aria-label','打开形状和花色管理');settingsButton.setAttribute('aria-expanded','false');
  toolbar.append(toggle,settingsButton);shadow.append(style,panel,toolbar);
  const manager = shadow.getElementById('manager');manager.textContent = '展开 / 收起形状花色管理';
  const error = shadow.getElementById('error');
  let overlay, store, settings = Core.normalize(), pendingSaves = 0, generation = 0;
  const subscribers = new Set();
  function localVisible() {return isTop && fs()?.tagName !== 'IFRAME' || !!fs() && fs().tagName !== 'IFRAME';}
  function raise() {
    const focused = shadow.activeElement;
    try {if (ui.matches(':popover-open')) ui.hidePopover();ui.showPopover();} catch { /* Regular fixed positioning remains available. */ }
    focused?.focus({preventScroll:true});
  }
  function mount() {
    const fullscreen = fs();
    const parent = fullscreen && !['VIDEO','IMG','IFRAME','CANVAS','OBJECT','EMBED'].includes(fullscreen.tagName) ? fullscreen : document.documentElement;
    if (ui.parentNode !== parent) parent.append(ui);
    const vv = window.visualViewport;
    ui.style.setProperty('--sc-ui-width',`${vv?.width || window.innerWidth}px`);
    ui.style.setProperty('--sc-ui-height',`${vv?.height || window.innerHeight}px`);
    ui.style.setProperty('--sc-ui-left',`${vv?.offsetLeft || 0}px`);ui.style.setProperty('--sc-ui-top',`${vv?.offsetTop || 0}px`);
    toolbar.hidden = !localVisible();panel.hidden = panel.hidden || !localVisible();
    try {if (localVisible() && !ui.matches(':popover-open')) ui.showPopover();else if (!localVisible() && ui.matches(':popover-open')) ui.hidePopover();} catch { /* Older engines use fixed positioning. */ }
  }
  function publish(update) {
    generation++;
    const previouslyEnabled = settings.enabled;
    if (update.settings) {
      settings = Core.normalize(update.settings);overlay?.setSettings(settings);
      toggle.textContent = settings.enabled ? '隐藏' : '显示';
    }
    for (const subscriber of subscribers) subscriber(update);
    if (settings.enabled && !previouslyEnabled) raise();
  }
  function failed(e) {error.hidden = false;error.textContent = '保存失败：'+e.message;}
  async function save(patch,reset = false) {
    pendingSaves++;generation++;
    try {return await store.patch(patch,reset);} catch(e) {failed(e);throw e;} finally {pendingSaves--;}
  }
  function setPanel(open) {
    panel.hidden = !open;settingsButton.setAttribute('aria-expanded',String(open));
    if (open) raise();
  }
  toggle.addEventListener('click',() => {
    if (!store) return setPanel(true);
    save({enabled:!settings.enabled}).catch(() => {});
  });
  settingsButton.addEventListener('click',() => setPanel(panel.hidden));
  mount();
  if (!gm || typeof gm.getValue !== 'function' || typeof gm.setValue !== 'function') {
    shadow.getElementById('site').textContent = '需要 Userscripts 存储权限';error.hidden = false;
    error.textContent = '请通过 Userscripts 安装完整 .user.js 文件，并允许 GM.getValue / GM.setValue。不要直接打开或粘贴到网页中运行。';setPanel(true);return;
  }
  store = globalThis.SubtitleCurtainUserscriptStorage.create(gm,site,{notify:publish});
  overlay = globalThis.SubtitleCurtainOverlay.create({isTop,
    onCommit:patch => {save(patch).catch(() => {});},onToggle:() => {save({enabled:!settings.enabled}).catch(() => {});},onLock:() => {save({locked:!settings.locked}).catch(() => {});}
  });
  globalThis.SubtitleCurtainControls.mount(shadow,{
    getState:async () => {const result = await store.getState();publish(result);return result;},
    patch:patch => save(patch),reset:() => save({},true),library:(action,extra) => store.library(action,extra),
    openManager:() => {panel.classList.toggle('standalone');raise();},
    subscribe:listener => {subscribers.add(listener);return () => subscribers.delete(listener);}
  });
  let lastSnapshot = '', polling = false;
  async function synchronize() {
    if (polling || pendingSaves || document.visibilityState === 'hidden' || !localVisible()) return;
    polling = true;
    const started = generation;
    try {const next = await store.snapshot(), signature = JSON.stringify(next);if (pendingSaves || started !== generation) return;if (signature !== lastSnapshot) {lastSnapshot = signature;publish(next);}}
    catch(e) {failed(e);} finally {polling = false;}
  }
  let timer = setInterval(synchronize,2500);
  const fullscreenChanged = () => {mount();raise();synchronize();};
  document.addEventListener('fullscreenchange',fullscreenChanged);document.addEventListener('webkitfullscreenchange',fullscreenChanged);
  document.addEventListener('visibilitychange',synchronize);window.addEventListener('resize',mount);
  window.visualViewport?.addEventListener('resize',mount);window.visualViewport?.addEventListener('scroll',mount);
  document.addEventListener('webkitbeginfullscreen',() => {shadow.getElementById('status').textContent = '原生视频全屏不能覆盖网页遮挡层；请使用内嵌播放或网页全屏。';},true);
  window.addEventListener('pagehide',() => {clearInterval(timer);timer = null;});
  window.addEventListener('pageshow',() => {if (!timer) timer = setInterval(synchronize,2500);synchronize();});
  // A fullscreen overlay may have been promoted during initialization.
  raise();
})();
