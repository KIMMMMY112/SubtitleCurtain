/* Browser adapter; the visual and settings logic is kept independent of Chrome-specific storage. */
(() => {
  'use strict';
  if (globalThis.__subtitleCurtainInjected) return;
  globalThis.__subtitleCurtainInjected = true;
  const Core = globalThis.SubtitleCurtainCore;
  const key = Core.storageKey(location.hostname);
  let settings = Core.normalize();
  let drag = null;
  let host, mask, grip, handle;
  let ready = false;
  const CSS = `
    :host { all: initial !important; position: fixed !important; inset: 0 !important;
      width: 100vw !important; height: 100vh !important; display:block !important;
      margin:0 !important; padding:0 !important; border:0 !important;
      z-index:2147483647 !important; overflow:visible !important; pointer-events:none !important;
      color-scheme: light !important; }
    :host(:popover-open) { position:fixed !important; inset:0 !important; }
    #mask { position: absolute; box-sizing: border-box; pointer-events:auto;
      user-select:none; -webkit-user-select:none; touch-action:none;
      cursor:grab; outline:1px solid rgba(255,255,255,.25);
      filter: drop-shadow(0 2px 5px rgba(0,0,0,.24)); }
    #mask:active {cursor:grabbing}
    #mask.locked { pointer-events:none !important; outline:0; cursor:default; }
    #mask.hidden {display:none !important}
    #grip { position:absolute; left:8px; top:50%; transform:translateY(-50%);
      display:flex; align-items:center; justify-content:center;
      width:28px;height:24px;border-radius:8px; background:rgba(0,0,0,.38);
      border:1px solid rgba(255,255,255,.40);color:white;font:16px system-ui,sans-serif;
      pointer-events:none; }
    #resize { position:absolute; right:-6px; bottom:-6px; width:20px; height:20px;
      background:#ffffff; border:2px solid #1d4ed8; border-radius:6px;
      cursor:nwse-resize; pointer-events:auto; touch-action:none;
      box-shadow:0 1px 6px rgba(0,0,0,.28); }
    #mask.locked #grip,#mask.locked #resize {display:none}
    #mask:not(:hover):not(:focus-within) #grip {opacity:0}
    #mask:not(:hover):not(:focus-within) #resize {opacity:.6}
    @media (prefers-reduced-motion: no-preference) {#grip,#resize{transition:opacity .15s ease}}
  `;
  function makeDOM() {
    host = document.createElement('div');
    host.id = 'subtitle-curtain-root';
    host.setAttribute('aria-label', 'SubtitleCurtain overlay');
    // manual popover provides a top-layer fallback when <video> itself enters Fullscreen API.
    host.setAttribute('popover', 'manual');
    const shadow = host.attachShadow({mode:'open'});
    const style = document.createElement('style');
    style.textContent = CSS;
    shadow.append(style);
    mask = document.createElement('div');
    mask.id = 'mask';
    mask.setAttribute('role', 'img');
    mask.setAttribute('aria-label', 'Subtitle masking curtain. Drag to move or use the bottom right corner to resize.');
    grip = document.createElement('div'); grip.id = 'grip'; grip.textContent = '⠿';
    handle = document.createElement('div'); handle.id = 'resize'; handle.setAttribute('aria-label', 'Resize subtitle curtain');
    mask.append(grip, handle);
    shadow.append(mask);
    placeHost();
    mask.addEventListener('pointerdown', pointerDown);
    mask.addEventListener('pointermove', pointerMove);
    mask.addEventListener('pointerup', pointerFinish);
    mask.addEventListener('pointercancel', pointerFinish);
    // Capture resize events at the mask (pointer capture bubbles from child).
    window.addEventListener('resize', render, {passive:true});
    document.addEventListener('fullscreenchange', () => {placeHost(); render();});
    document.addEventListener('webkitfullscreenchange', () => {placeHost(); render();});
    document.addEventListener('keydown', (ev) => {
      const tag = ev.target?.tagName;
      if (ev.altKey && ev.shiftKey && ev.code === 'KeyS' && !['INPUT','TEXTAREA','SELECT'].includes(tag)) {
        ev.preventDefault(); update({enabled:!settings.enabled});
      }
    });
    render();
  }
  function placeHost() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    const canContain = fs && !['VIDEO', 'IMG', 'CANVAS', 'IFRAME', 'OBJECT', 'EMBED'].includes(fs.tagName);
    const parent = canContain ? fs : (document.body || document.documentElement);
    if (host.parentNode !== parent) parent.appendChild(host);
    if (canContain && host.matches(':popover-open')) {
      try {host.hidePopover();} catch (_) { /* safe */ }
    } else if (fs && !canContain && !host.matches(':popover-open') && typeof host.showPopover === 'function') {
      try {host.showPopover();} catch (_) { /* fallback may not work on native video fullscreen */ }
    } else if (!fs && host.matches(':popover-open')) {
      try {host.hidePopover();} catch (_) { /* safe */ }
    }
  }
  function viewport() {return {width:window.innerWidth, height:window.innerHeight};}
  function render() {
    if (!mask) return;
    const g = Core.geometry(settings, viewport());
    const visual = Core.appearance(settings);
    Object.assign(mask.style, {left:`${g.left}px`,top:`${g.top}px`,width:`${g.width}px`,height:`${g.height}px`, ...visual});
    mask.classList.toggle('hidden', !settings.enabled);
    mask.classList.toggle('locked', settings.locked);
  }
  function save() {
    chrome.storage.local.set({[key]: settings}).catch(err => console.warn('[SubtitleCurtain] Could not save settings',err));
  }
  function update(patch, persist = true) {
    settings = Core.merge(settings, patch);
    render();
    if (persist) save();
    return {...settings};
  }
  function pointerDown(e) {
    if (settings.locked || !settings.enabled || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    const g = Core.geometry(settings, viewport());
    drag = {id:e.pointerId, mode:e.target===handle?'resize':'move', startX:e.clientX,startY:e.clientY, g};
    mask.setPointerCapture(e.pointerId);
  }
  function pointerMove(e) {
    if (!drag || drag.id !== e.pointerId) return;
    e.preventDefault();
    const dx=e.clientX-drag.startX, dy=e.clientY-drag.startY;
    const vp=viewport();
    if (drag.mode==='move') {
      const left=Core.clamp(drag.g.left+dx,0,Math.max(0,vp.width-drag.g.width));
      const top=Core.clamp(drag.g.top+dy,0,Math.max(0,vp.height-drag.g.height));
      update({x:left/vp.width,y:top/vp.height},false);
    } else {
      const w=Core.clamp(drag.g.width+dx,Math.min(96,vp.width),vp.width-drag.g.left);
      const h=Core.clamp(drag.g.height+dy,16,Math.min(400,vp.height-drag.g.top));
      update({width:w/vp.width,height:h},false);
    }
  }
  function pointerFinish(e) {
    if (!drag || drag.id!==e.pointerId) return;
    drag=null; save();
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message.type !== 'string') return;
    if (!ready) { sendResponse({ok:false,error:'Loading settings'}); return; }
    if (message.type==='SC_GET_STATE') sendResponse({ok:true,settings:{...settings},site:location.hostname});
    else if (message.type==='SC_PATCH') sendResponse({ok:true,settings:update(message.patch && typeof message.patch==='object' ? message.patch : {})});
    else if (message.type==='SC_RESET') sendResponse({ok:true,settings:update(Core.DEFAULTS)});
    else sendResponse({ok:false,error:'Unknown action'});
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area==='local' && changes[key]?.newValue) {
      settings=Core.normalize(changes[key].newValue); render();
    }
  });
  chrome.storage.local.get(key).then(result => {
    settings=Core.normalize(result[key]);
    makeDOM(); ready=true;
  }).catch(error => {
    console.warn('[SubtitleCurtain] Settings read failed; using defaults',error);
    makeDOM(); ready=true;
  });
})();
