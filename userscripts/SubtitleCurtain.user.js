// ==UserScript==
// @name               SubtitleCurtain
// @namespace          https://github.com/KIMMMMY112/SubtitleCurtain
// @version            0.2.1
// @description        Hide translated subtitles with a draggable curtain. Local settings, custom shapes and saved styles. Safari preview.
// @description:zh-CN  用可拖动遮挡条隐藏翻译字幕；本地保存、自定义形状和花色管理。Safari 预览版。
// @author             KIMMMMY112
// @license            MIT
// @homepageURL        https://github.com/KIMMMMY112/SubtitleCurtain
// @supportURL         https://github.com/KIMMMMY112/SubtitleCurtain/issues
// @updateURL          https://raw.githubusercontent.com/KIMMMMY112/SubtitleCurtain/main/userscripts/SubtitleCurtain.meta.js
// @downloadURL        https://raw.githubusercontent.com/KIMMMMY112/SubtitleCurtain/main/userscripts/SubtitleCurtain.user.js
// @match              http://*/*
// @match              https://*/*
// @run-at             document-end
// @grant              GM.getValue
// @grant              GM.setValue
// @inject-into        content
// ==/UserScript==

// Source: https://github.com/KIMMMMY112/SubtitleCurtain (v0.2.1).
// Shared first-party modules: src/core/core.js, src/core/overlay.js, src/core/controls.js, src/userscript/storage.js and src/userscript/entry.js.
// Inlined to work offline with Userscripts without remote @require dependencies.
(function(manager){
'use strict';
const globalThis = {GM:manager};
/* SubtitleCurtain portable core: DOM-free, dependency-free; reusable by future userscripts. */
(function (global) {
  'use strict';
  const STORAGE_PREFIX = 'subtitleCurtain:v1:site:';
  const DEFAULTS = Object.freeze({
    enabled: false, locked: false, x: 0.15, y: 0.77, width: 0.70,
    height: 44, fillType: 'solid', color1: '#111827', color2: '#ec4899',
    opacity: 1, shape: 'rounded', radius: 12, pattern: 'stripes',
    angle: 100, scale: 24, polygon: '0,0 100,0 100,100 0,100'
  });
  const CHOICES = Object.freeze({
    fillType: ['solid', 'gradient', 'pattern'],
    shape: ['rectangle', 'rounded', 'pill', 'ellipse', 'ticket', 'custom'],
    pattern: ['stripes', 'dots', 'checker', 'waves']
  });
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function number(value, fallback, min, max) {
    return typeof value === 'number' && Number.isFinite(value)
      ? clamp(value, min, max) : fallback;
  }
  function validColor(value) {
    return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
  }
  const STYLE_KEYS = Object.freeze(['fillType','color1','color2','opacity','shape','radius','pattern','angle','scale','polygon']);
  // A small data-only polygon format; arbitrary CSS/URLs/scripts are never accepted.
  function polygonPoints(value) {
    if (typeof value !== 'string' || value.length > 1024) return null;
    const points = value.trim().split(/\s+/);
    if (points.length < 3 || points.length > 24) return null;
    const parsed = points.map(p => /^\d{1,3}(?:\.\d{1,2})?,\d{1,3}(?:\.\d{1,2})?$/.test(p) ? p.split(',').map(Number) : null);
    if (parsed.some(p => !p || p.some(n => n < 0 || n > 100))) return null;
    const area = parsed.reduce((sum, p, i) => {const q = parsed[(i + 1) % parsed.length]; return sum + p[0]*q[1] - q[0]*p[1];}, 0);
    return Math.abs(area) < 1 ? null : parsed;
  }
  function normalize(input) {
    const src = input && typeof input === 'object' ? input : {};
    const out = {};
    for (const [key, val] of Object.entries(DEFAULTS)) {
      if (typeof val === 'boolean') out[key] = typeof src[key] === 'boolean' ? src[key] : val;
      else if (key === 'color1' || key === 'color2') out[key] = validColor(src[key]) ? src[key].toLowerCase() : val;
      else if (key === 'polygon') out[key] = polygonPoints(src[key]) ? src[key].trim() : val;
      else if (CHOICES[key]) out[key] = CHOICES[key].includes(src[key]) ? src[key] : val;
      else {
        const limits = {x:[0, 1],y:[0,1],width:[0.02, 1],height:[16, 400],opacity:[0.1,1],radius:[0,100],angle:[0,360],scale:[4,100]};
        out[key] = number(src[key], val, limits[key][0], limits[key][1]);
      }
    }
    return out;
  }
  function merge(current, patch) { return normalize({...normalize(current), ...patch}); }
  function styleOnly(settings) {
    const s = normalize(settings);
    return Object.fromEntries(STYLE_KEYS.map(k => [k, s[k]]));
  }
  function normalizeLibrary(input) {
    if (!Array.isArray(input)) return [];
    const seen = new Set();
    return input.slice(0, 50).filter(p => {
      if (!p || typeof p.id !== 'string' || !/^[a-zA-Z0-9-]{1,64}$/.test(p.id) || seen.has(p.id) || typeof p.name !== 'string' || !p.name.trim()) return false;
      seen.add(p.id); return true;
    }).map(p => ({id:p.id, name:p.name.trim().slice(0,60), style:styleOnly(p.style)}));
  }
  function editLibrary(current, action, extra = {}, makeId) {
    let library = normalizeLibrary(current);
    if (action === 'get') return library;
    if (action === 'save') {
      const item = extra.item;
      if (!item || typeof item.name !== 'string' || !item.name.trim()) throw new Error('请输入花色名称');
      const index = library.findIndex(p => p.id === item.id);
      if (index < 0 && library.length >= 50) throw new Error('最多保存 50 个花色，请先删除一些');
      const preset = {id:index < 0 ? makeId() : library[index].id,name:item.name,style:item.style};
      if (index < 0) library.push(preset); else library[index] = preset;
    } else if (action === 'delete') library = library.filter(p => p.id !== extra.id);
    else if (action === 'import') {
      if (!Array.isArray(extra.items) || extra.items.length > 50) throw new Error('导入文件必须包含至多 50 个花色');
      const imported = normalizeLibrary(extra.items);
      if (imported.length !== extra.items.length) throw new Error('花色文件格式无效');
      for (const item of imported) {
        const index = library.findIndex(p => p.id === item.id);
        if (index < 0) library.push(item); else library[index] = item;
      }
      if (library.length > 50) throw new Error('导入后将超过 50 个花色');
    } else throw new Error('未知花色操作');
    return normalizeLibrary(library);
  }
  function storageKey(hostname) {
    const host = (typeof hostname === 'string' ? hostname : '').toLowerCase();
    return STORAGE_PREFIX + (host || 'local');
  }
  function geometry(settings, viewport) {
    const s = normalize(settings);
    const vw = number(viewport?.width, 1, 1, 100000), vh = number(viewport?.height, 1, 1, 100000);
    const width = Math.min(vw, Math.max(Math.min(96, vw), Math.round(vw * s.width)));
    const height = Math.min(vh, s.height);
    return {
      left: clamp(Math.round(s.x * vw), 0, vw - width),
      top: clamp(Math.round(s.y * vh), 0, vh - height),
      width, height
    };
  }
  function background(settings) {
    const s = normalize(settings), a = s.color1, b = s.color2;
    if (s.fillType === 'solid') return a;
    if (s.fillType === 'gradient') return `linear-gradient(${s.angle}deg, ${a} 0%, ${b} 100%)`;
    const z = s.scale;
    const patterns = {
      stripes: `repeating-linear-gradient(${s.angle}deg, ${a} 0px ${z/2}px, ${b} ${z/2}px ${z}px)`,
      dots: `radial-gradient(circle, ${b} 0 ${z/6}px, ${a} ${z/6+0.5}px) 0 0 / ${z}px ${z}px`,
      checker: `conic-gradient(${a} 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0) 0 0 / ${z}px ${z}px`,
      waves: `repeating-radial-gradient(ellipse at 0% 50%, ${b} 0px ${z/4}px, ${a} ${z/4+1}px ${z}px)`
    };
    return patterns[s.pattern];
  }
  function appearance(settings) {
    const s = normalize(settings);
    const radius = s.shape === 'rectangle' ? '0' : s.shape === 'pill' ? '999px'
      : s.shape === 'ellipse' ? '50%' : `${s.radius}px`;
    const clipPath = s.shape === 'ticket'
      ? 'polygon(0 0, 100% 0, 100% 35%, 97% 50%, 100% 65%, 100% 100%, 0 100%, 0 65%, 3% 50%, 0 35%)'
      : s.shape === 'custom' ? `polygon(${polygonPoints(s.polygon).map(p => `${p[0]}% ${p[1]}%`).join(', ')})` : 'none';
    return { background: background(s), borderRadius: radius, clipPath, opacity: String(s.opacity) };
  }
  global.SubtitleCurtainCore = Object.freeze({ DEFAULTS, CHOICES, STYLE_KEYS, normalize, merge, storageKey, geometry, background, appearance, clamp, polygonPoints, styleOnly, normalizeLibrary, editLibrary });
})(globalThis);

/* Portable DOM renderer. No extension APIs, network access, or persistence policy. */
(() => {
  'use strict';
  const Core = globalThis.SubtitleCurtainCore;
  function create({onCommit, onToggle, onLock, isTop = true}) {
    let settings = Core.normalize(), drag = null, disposed = false;
    const host = document.createElement('div');
    host.id = 'subtitle-curtain-root';
    host.setAttribute('popover', 'manual');
    const shadow = host.attachShadow({mode:'open'});
    const style = document.createElement('style');
    style.textContent = `
      :host {all:initial!important;position:fixed!important;inset:0!important;
        left:var(--sc-offset-x,0px)!important;top:var(--sc-offset-y,0px)!important;right:auto!important;bottom:auto!important;
        width:var(--sc-vw,100vw)!important;height:var(--sc-vh,100vh)!important;max-width:none!important;max-height:none!important;
        margin:0!important;padding:0!important;border:0!important;transform:none!important;
        z-index:2147483647!important;overflow:visible!important;pointer-events:none!important;
        background:transparent!important;color-scheme:light!important;}
      :host::backdrop{background:transparent;pointer-events:none}
      *{box-sizing:border-box}
      #mask{position:absolute;pointer-events:auto;user-select:none;-webkit-user-select:none;touch-action:none;cursor:grab}
      #mask:active{cursor:grabbing} #mask:focus-visible{outline:2px solid #818cf8;outline-offset:4px}
      #visual{position:absolute;inset:0;pointer-events:none}
      #mask.locked{pointer-events:none!important;cursor:default}
      #mask[hidden]{display:none!important}
      #resize{position:absolute;right:-5px;bottom:-5px;width:20px;height:20px;background:#fff;
        border:2px solid #4f46e5;border-radius:5px;cursor:nwse-resize;touch-action:none;pointer-events:auto}
      #grip{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#fff;background:#111827b8;
        padding:0 5px;border-radius:4px;font:18px system-ui;pointer-events:none}
      #mask:not(:hover):not(:focus-visible) #grip{visibility:hidden}
      #mask.locked #grip,#mask.locked #resize{display:none!important}
    `;
    const mask = document.createElement('div'); mask.id = 'mask'; mask.tabIndex = 0;
    mask.setAttribute('role','group');
    mask.setAttribute('aria-label','字幕遮挡条：拖动移动；方向键微调，Ctrl/Command + 方向键缩放。Alt + Shift + L 锁定。');
    const visual = document.createElement('div'); visual.id = 'visual';
    const grip = document.createElement('span'); grip.id = 'grip'; grip.textContent = '⠿';
    const handle = document.createElement('div'); handle.id = 'resize'; handle.setAttribute('aria-hidden','true');
    mask.append(visual, grip, handle); shadow.append(style, mask);
    const viewport = () => ({width:window.visualViewport?.width || window.innerWidth,height:window.visualViewport?.height || window.innerHeight});
    const fullscreen = () => document.fullscreenElement || document.webkitFullscreenElement;
    function active() {
      const fs = fullscreen();
      return settings.enabled && (isTop || !!fs) && fs?.tagName !== 'IFRAME';
    }
    function mount() {
      if (disposed) return;
      const fs = fullscreen();
      // Replaced elements do not lay out ordinary children. Keep their popover
      // outside the element; native video fullscreen may still restrict pointer input.
      const parent = fs && !['VIDEO','IMG','CANVAS','IFRAME','OBJECT','EMBED'].includes(fs.tagName) ? fs : document.documentElement;
      if (host.parentNode !== parent) parent.append(host);
      try {
        if (active() && !host.matches(':popover-open')) host.showPopover();
        else if (!active() && host.matches(':popover-open')) host.hidePopover();
      } catch (error) {console.warn('[SubtitleCurtain] Top layer unavailable', error.message);}
    }
    function render() {
      mount();
      const vp = viewport(), vv = window.visualViewport;
      host.style.setProperty('--sc-vw',`${vp.width}px`);host.style.setProperty('--sc-vh',`${vp.height}px`);
      host.style.setProperty('--sc-offset-x',`${vv?.offsetLeft || 0}px`);host.style.setProperty('--sc-offset-y',`${vv?.offsetTop || 0}px`);
      const g = Core.geometry(settings, vp);
      Object.assign(mask.style,{left:`${g.left}px`,top:`${g.top}px`,width:`${g.width}px`,height:`${g.height}px`});
      Object.assign(visual.style,Core.appearance(settings));
      mask.hidden = !active();
      mask.classList.toggle('locked',settings.locked);
      mask.tabIndex = settings.locked || mask.hidden ? -1 : 0;
    }
    function fullscreenChanged() {
      // Fullscreen elements enter the top layer after an already-open popover.
      // Reopen ours so video-element fullscreen cannot paint over the curtain.
      try {if (host.matches(':popover-open')) host.hidePopover();} catch { /* detached host */ }
      render();
    }
    function change(patch, commit = true) {
      settings = Core.merge(settings,patch); render();
      if (commit) onCommit(patch);
    }
    function down(e) {
      if (drag || e.isPrimary === false || settings.locked || !active() || e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      drag = {id:e.pointerId,resize:e.target === handle,x:e.clientX,y:e.clientY,g:Core.geometry(settings,viewport())};
      mask.focus({preventScroll:true}); mask.setPointerCapture(e.pointerId);
    }
    function move(e) {
      if (!drag || e.pointerId !== drag.id) return;
      e.preventDefault(); e.stopPropagation();
      const {g} = drag, vp = viewport(), dx = e.clientX-drag.x, dy = e.clientY-drag.y;
      if (drag.resize) change({width:Core.clamp(g.width+dx,Math.min(96,vp.width),vp.width-g.left)/vp.width,
        height:Core.clamp(g.height+dy,Math.min(16,vp.height-g.top),Math.min(400,vp.height-g.top))},false);
      else change({x:Core.clamp(g.left+dx,0,vp.width-g.width)/vp.width,
        y:Core.clamp(g.top+dy,0,vp.height-g.height)/vp.height},false);
    }
    function finish(e) {
      if (!drag || drag.id !== e.pointerId) return;
      e.stopPropagation(); drag = null;
      onCommit({x:settings.x,y:settings.y,width:settings.width,height:settings.height});
    }
    function key(e) {
      const editing = e.composedPath().some(el => el.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(el.tagName));
      if (editing || e.repeat && e.altKey) return;
      if (e.altKey && e.shiftKey && ['KeyS','KeyL'].includes(e.code)) {
        e.preventDefault(); e.stopPropagation();
        if (e.code === 'KeyS') onToggle(); else onLock();
      } else if (shadow.activeElement === mask && !settings.locked && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) {
        e.preventDefault(); e.stopPropagation();
        const g = Core.geometry(settings,viewport()), vp = viewport(), step = e.shiftKey ? 10 : 1;
        const dx = e.code === 'ArrowLeft' ? -step : e.code === 'ArrowRight' ? step : 0;
        const dy = e.code === 'ArrowUp' ? -step : e.code === 'ArrowDown' ? step : 0;
        if (e.ctrlKey || e.metaKey) change({width:Core.clamp(g.width+dx,96,vp.width)/vp.width,height:Core.clamp(g.height+dy,16,400)});
        else change({x:Core.clamp(g.left+dx,0,vp.width-g.width)/vp.width,y:Core.clamp(g.top+dy,0,vp.height-g.height)/vp.height});
      }
    }
    const observer = new MutationObserver(() => {if (!host.isConnected) render();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    mask.addEventListener('pointerdown',down); mask.addEventListener('pointermove',move);
    mask.addEventListener('pointerup',finish); mask.addEventListener('pointercancel',finish);
    mask.addEventListener('lostpointercapture',finish);
    document.addEventListener('keydown',key,true);
    document.addEventListener('fullscreenchange',fullscreenChanged);
    document.addEventListener('webkitfullscreenchange',fullscreenChanged);
    window.addEventListener('resize',render);
    window.visualViewport?.addEventListener('resize',render);
    window.visualViewport?.addEventListener('scroll',render);
    render();
    return Object.freeze({
      setSettings(s) {
        const next = Core.normalize(s);
        // A previous drag's storage echo must not snap a new gesture back to its old geometry.
        if (drag && next.enabled && !next.locked) {
          for (const key of ['x','y','width','height']) next[key] = settings[key];
        } else drag = null;
        settings = next; render();
      },
      getSettings() {return {...settings};},
      destroy() {disposed = true; observer.disconnect(); document.removeEventListener('keydown',key,true);
        document.removeEventListener('fullscreenchange',fullscreenChanged);document.removeEventListener('webkitfullscreenchange',fullscreenChanged);
        window.removeEventListener('resize',render);window.visualViewport?.removeEventListener('resize',render);window.visualViewport?.removeEventListener('scroll',render);host.remove();}
    });
  }
  globalThis.SubtitleCurtainOverlay = Object.freeze({create});
})();

/* Shared settings and style-library controller. Storage and browser transport are injected. */
(() => {
  'use strict';
  const Core = globalThis.SubtitleCurtainCore;
  function mount(root, bridge) {
    const $ = id => root.getElementById(id);
    $('site').textContent = '正在连接当前网页…';
    async function bounded(promise) {
      let timer;
      try {return await Promise.race([promise,new Promise((_,reject) => {timer = setTimeout(() => reject(new Error('连接超过 6 秒，请刷新视频网页或重新加载扩展后重试')),6000);})]);}
      finally {clearTimeout(timer);}
    }
    const ids = Object.keys(Core.DEFAULTS).filter(k => !['x','y'].includes(k));
    let state = Core.normalize(), library = [], revision = 0, inFlight = 0;
    let pending = Promise.resolve();
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
      const response = await bounded(type === 'SC_GET_STATE' ? bridge.getState() : type === 'SC_RESET' ? bridge.reset() : bridge.patch(patch));
      if (!response?.ok) throw new Error(response?.error || '设置未响应，请刷新网页后重试');
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
    $('manager').addEventListener('click', () => Promise.resolve().then(() => bridge.openManager()).catch(e => showError(e.message)));

    function selected() {return library.find(p => p.id === $('preset').value);}
    function displayLibrary(preferred = $('preset').value) {
      $('preset').replaceChildren(new Option('选择花色…',''));
      for (const p of library) $('preset').add(new Option(p.name,p.id));
      $('preset').value = library.some(p => p.id === preferred) ? preferred : '';
      const absent = !selected();
      for (const id of ['applyPreset','deletePreset','updatePreset','renamePreset']) $(id).disabled = absent;
    }
    async function libraryAction(action, extra = {}) {
      const result = await bounded(bridge.library(action,extra));
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
    const unsubscribe = bridge.subscribe?.(update => {
      if (update.library) {library = Core.normalizeLibrary(update.library); displayLibrary();}
      if (update.settings && !inFlight) display(update.settings);
    });

    const ready = (async () => {
      try {
        const response = await message('SC_GET_STATE');
        $('site').textContent = '当前网站 · '+response.site;
        display(response.settings); await libraryAction('get'); $('controls').disabled = false;
        if (response.saveError) showError('上次保存失败：'+response.saveError);
      } catch (e) {
        $('site').textContent = '此页面暂不支持使用'; $('manager').disabled = true;
        showError('请打开普通 http/https 视频网页，刷新一次后重试。浏览器内部页面、扩展商店和画中画窗口不支持。'+e.message);
      }
    })();
    return Object.freeze({ready,destroy() {unsubscribe?.();}});
  }
  globalThis.SubtitleCurtainControls = Object.freeze({mount});
})();

/* Userscripts GM storage adapter. Same data validation and style-library operations as the extension. */
(() => {
  'use strict';
  const Core = globalThis.SubtitleCurtainCore;
  function create(gm,site,{notify = () => {}} = {}) {
    const key = Core.storageKey(site), libraryKey = 'subtitleCurtain:v1:library';
    let queue = Promise.resolve();
    const serial = job => {const next = queue.then(job);queue = next.catch(() => {});return next;};
    const makeId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),b => b.toString(16).padStart(2,'0')).join('');
    return Object.freeze({
      async getState() {return {ok:true,site,settings:Core.normalize(await gm.getValue(key))};},
      patch(patch,reset = false) {
        return serial(async () => {
          const current = await gm.getValue(key);
          const settings = reset ? Core.normalize() : Core.merge(current,patch);
          await gm.setValue(key,settings);notify({settings});return {ok:true,site,settings};
        });
      },
      library(action,extra = {}) {
        return serial(async () => {
          const library = Core.editLibrary(await gm.getValue(libraryKey),action,extra,makeId);
          if (action !== 'get') {await gm.setValue(libraryKey,library);notify({library});}
          return {ok:true,library};
        });
      },
      async snapshot() {return {settings:Core.normalize(await gm.getValue(key)),library:Core.normalizeLibrary(await gm.getValue(libraryKey))};}
    });
  }
  globalThis.SubtitleCurtainUserscriptStorage = Object.freeze({create});
})();

globalThis.SubtitleCurtainUserscriptAssets = {"html":"<main>\n    <header class=\"heading\">\n      <div class=\"logo\" aria-hidden=\"true\">▰</div>\n      <div><h1>SubtitleCurtain</h1><p>专注英文字幕 · Focus on English</p></div>\n      <span class=\"version\">v0.2.1</span>\n    </header>\n    <section class=\"site\" aria-live=\"polite\"><span class=\"dot\"></span><span id=\"site\">请从浏览器工具栏打开扩展</span></section>\n    <div id=\"error\" class=\"error\" role=\"alert\" hidden></div>\n    <div id=\"status\" class=\"status\" role=\"status\" aria-live=\"polite\"></div>\n    <div class=\"preview\"><div id=\"preview\" aria-label=\"当前形状花色预览\"></div></div>\n    <button id=\"manager\" type=\"button\">打开形状 / 花色管理窗口 ↗</button>\n    <fieldset id=\"controls\" disabled>\n      <section class=\"switches\">\n        <label class=\"toggle-row\"><span><strong>显示遮挡条</strong><small>Show curtain</small></span><input id=\"enabled\" type=\"checkbox\" role=\"switch\" /></label>\n        <label class=\"toggle-row\"><span><strong>锁定位置</strong><small>Lock · 不拦截视频点击</small></span><input id=\"locked\" type=\"checkbox\" role=\"switch\" /></label>\n      </section>\n      <section class=\"group appearance\">\n        <h2>外观 <span>Appearance</span></h2>\n        <label for=\"fillType\">遮挡样式</label>\n        <select id=\"fillType\"><option value=\"solid\">纯色 · Solid</option><option value=\"gradient\">渐变 · Gradient</option><option value=\"pattern\">花纹 · Pattern</option></select>\n        <div class=\"colors\">\n          <label for=\"color1\">主颜色<input type=\"color\" id=\"color1\" value=\"#111827\" /></label>\n          <label for=\"color2\">第二颜色<input type=\"color\" id=\"color2\" value=\"#ec4899\" /></label>\n        </div>\n        <div id=\"patternLine\"><label for=\"pattern\">花纹类型</label><select id=\"pattern\"><option value=\"stripes\">斜条纹</option><option value=\"dots\">圆点</option><option value=\"checker\">棋盘格</option><option value=\"waves\">波纹</option></select></div>\n        <label for=\"shape\">形状</label>\n        <select id=\"shape\"><option value=\"rectangle\">直角矩形</option><option value=\"rounded\">自定义圆角</option><option value=\"pill\">胶囊形</option><option value=\"ellipse\">椭圆形</option><option value=\"ticket\">票据切角</option><option value=\"custom\">自定义多边形</option></select>\n        <div id=\"polygonLine\"><label for=\"polygon\">多边形顶点（百分比 x,y）</label><textarea id=\"polygon\" rows=\"3\" maxlength=\"1024\" spellcheck=\"false\" aria-describedby=\"polygonHint\"></textarea><p id=\"polygonHint\" class=\"hint\">3–24 个顶点，用空格分隔，坐标 0–100。例如：0,50 10,0 90,0 100,50 90,100 10,100</p></div>\n        <div class=\"range-heading\"><label for=\"angle\">渐变 / 条纹角度</label><output id=\"angleValue\"></output></div>\n        <input id=\"angle\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" />\n        <div class=\"range-heading\"><label for=\"scale\">花纹间距</label><output id=\"scaleValue\"></output></div>\n        <input id=\"scale\" type=\"range\" min=\"4\" max=\"100\" step=\"1\" />\n        <div class=\"range-heading\"><label for=\"radius\">圆角半径</label><output id=\"radiusValue\">12 px</output></div>\n        <input id=\"radius\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" />\n        <div class=\"range-heading\"><label for=\"opacity\">不透明度</label><output id=\"opacityValue\">100%</output></div>\n        <input id=\"opacity\" type=\"range\" min=\"10\" max=\"100\" step=\"1\" />\n      </section>\n      <section class=\"group size\">\n        <h2>大小 <span>Size</span></h2>\n        <div class=\"range-heading\"><label for=\"width\">宽度（屏幕比例）</label><output id=\"widthValue\">70%</output></div>\n        <input id=\"width\" type=\"range\" min=\"2\" max=\"100\" step=\"1\" />\n        <div class=\"range-heading\"><label for=\"height\">高度</label><output id=\"heightValue\">44 px</output></div>\n        <input id=\"height\" type=\"range\" min=\"16\" max=\"400\" step=\"1\" />\n        <p class=\"hint\">还可以直接拖动遮挡条移动，用右下角方块缩放。</p>\n      </section>\n      <section class=\"group library\">\n        <h2>我的形状 / 花色库 <span>最多 50 个</span></h2>\n        <label for=\"preset\">已保存的花色</label><select id=\"preset\"><option value=\"\">选择花色…</option></select>\n        <div class=\"button-row\"><button id=\"applyPreset\" type=\"button\">应用</button><button id=\"deletePreset\" type=\"button\">删除</button></div>\n        <label for=\"presetName\">花色名称</label><input id=\"presetName\" type=\"text\" maxlength=\"60\" placeholder=\"例如：深色六边形\" />\n        <div class=\"button-row\"><button id=\"savePreset\" type=\"button\">另存为新花色</button><button id=\"updatePreset\" type=\"button\">更新选中花色</button><button id=\"renamePreset\" type=\"button\">重命名</button></div>\n        <div class=\"button-row\"><button id=\"exportPresets\" type=\"button\">导出 JSON</button><label class=\"file-button\" for=\"importPresets\">导入 JSON<input id=\"importPresets\" type=\"file\" accept=\".json,application/json\" /></label></div>\n        <p class=\"hint\">跨网站共用；保存形状、颜色和透明度。应用花色会保留位置、尺寸、开关和锁定状态。</p>\n      </section>\n      <section class=\"actions\"><button id=\"reset\" type=\"button\">↺ 恢复当前网站默认设置</button></section>\n    </fieldset>\n    <footer><span>Alt + Shift + S：开关 · L：锁定</span><span>本地保存 · 无账号</span></footer>\n  </main>","css":"*{box-sizing:border-box}.sc-panel{font-family:Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#172033;background:#f5f7fb}.sc-panel{width:346px;margin:0;font-size:13px}main{padding:18px}.heading{display:flex;align-items:center;gap:10px}.logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(130deg,#4f46e5,#db2777);color:white;display:grid;place-items:center;font-size:23px;box-shadow:0 4px 12px #a5b4fc}h1{font-size:17px;line-height:20px;margin:0;letter-spacing:-.5px}p{margin:0}.heading p{font-size:10px;color:#69758d;margin-top:3px}.version{font-size:10px;color:#8a94a8;margin-left:auto}.site{background:white;border:1px solid #e3e8f2;border-radius:9px;padding:9px 11px;margin:15px 0 12px;display:flex;align-items:center;gap:7px;color:#536079;font-size:12px;overflow-wrap:anywhere}.dot{width:7px;height:7px;border-radius:50%;background:#23a48b;flex-shrink:0}.error{background:#fff1f2;color:#be123c;border:1px solid #fecdd3;padding:10px;border-radius:8px;margin:10px 0;line-height:1.5}fieldset{border:0;padding:0;margin:0;min-width:0}fieldset:disabled{opacity:.62}.switches,.group{background:#fff;border:1px solid #e3e8f2;border-radius:11px;padding:12px 13px;margin-bottom:11px}.toggle-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:5px 0;cursor:pointer}.toggle-row+.toggle-row{border-top:1px solid #eef1f6;margin-top:7px;padding-top:12px}.toggle-row strong{display:block;font-size:13px;font-weight:650}.toggle-row small{display:block;color:#818ca0;margin-top:3px;font-size:11px}.toggle-row input{appearance:none;width:36px;height:21px;border-radius:22px;background:#d4dbe8;position:relative;cursor:pointer;transition:background .12s;flex:none}.toggle-row input:checked{background:#635bdb}.toggle-row input::after{content:\"\";width:15px;height:15px;position:absolute;top:3px;left:3px;border-radius:50%;background:white;box-shadow:0 1px 2px #33415550;transition:transform .12s}.toggle-row input:checked::after{transform:translateX(15px)}h2{font-size:13px;letter-spacing:.2px;margin:0 0 13px}h2 span{color:#9aa5b9;font-weight:400;font-size:11px;margin-left:4px}label{font-size:12px;color:#42516a;display:block;margin:10px 0 5px}select{width:100%;height:32px;border:1px solid #dce2ec;border-radius:7px;background:#f9fafc;color:#263550;padding:0 8px;font:inherit}.colors{display:flex;gap:12px}.colors label{flex:1}.colors input{display:block;width:100%;height:34px;background:white;border:1px solid #dce2ec;border-radius:7px;padding:3px;margin-top:5px;cursor:pointer}.range-heading{display:flex;justify-content:space-between;align-items:end;margin-top:9px}.range-heading output{font-size:11px;color:#717b92}input[type=range]{width:100%;accent-color:#635bdb;cursor:pointer;margin:4px 0 7px}.hint{font-size:11px;line-height:1.5;color:#8994a7;margin-top:5px}.actions button{width:100%;background:white;border:1px solid #dce2ec;border-radius:8px;padding:10px;color:#4c5880;cursor:pointer;font:inherit}.actions button:hover{background:#f1f2ff}footer{display:flex;justify-content:space-between;color:#9aa5b5;font-size:10px;margin-top:14px}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #635bdb;outline-offset:2px}[hidden]{display:none!important}\n.sc-panel{max-height:590px;overflow:auto}button,.file-button{font:inherit;cursor:pointer;border:1px solid #dce2ec;border-radius:7px;padding:8px 10px;background:#fff;color:#394664}button:hover,.file-button:hover{background:#eef2ff}button:disabled{cursor:default;opacity:.45}#manager{width:100%;margin:0 0 12px;color:#5145bd}.preview{background:repeating-conic-gradient(#e1e6ee 0 25%,#f7f9fc 0 50%) 0/16px 16px;border:1px solid #dce2ec;border-radius:9px;padding:15px;margin-bottom:12px}#preview{height:44px;width:100%}.status{color:#087b64;font-size:12px;line-height:1.5}.status:not(:empty){margin-bottom:10px}textarea,input[type=text]{width:100%;border:1px solid #dce2ec;border-radius:7px;padding:8px;font:inherit;color:#263550;background:#f9fafc}textarea{resize:vertical}.button-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.button-row>*{flex:1;white-space:nowrap;text-align:center}.file-button{margin:0;font-size:13px}.file-button input{position:absolute;width:1px;height:1px;opacity:0}.file-button:focus-within{outline:2px solid #635bdb;outline-offset:2px}.sc-panel.standalone{width:auto;max-width:900px;max-height:none;margin:auto}.sc-panel.standalone main{padding:24px}.sc-panel.standalone #controls{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}.sc-panel.standalone .group{margin:0}.sc-panel.standalone .switches,.sc-panel.standalone .actions{grid-column:1/-1}.sc-panel.standalone #manager{display:none}@media(max-width:600px){.sc-panel.standalone #controls{display:block}.sc-panel.standalone .group{margin-bottom:12px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}\n@media(min-width:601px){.sc-panel.standalone .appearance{grid-column:1;grid-row:2/4}.sc-panel.standalone .size{grid-column:2;grid-row:2}.sc-panel.standalone .library{grid-column:2;grid-row:3}}\n\n:host{all:initial!important;position:fixed!important;left:var(--sc-ui-left,0px)!important;top:var(--sc-ui-top,0px)!important;right:auto!important;bottom:auto!important;width:var(--sc-ui-width,100vw)!important;height:var(--sc-ui-height,100vh)!important;margin:0!important;padding:0!important;border:0!important;max-width:none!important;max-height:none!important;overflow:visible!important;background:transparent!important;pointer-events:none!important;z-index:2147483647!important;color-scheme:light!important}\n:host::backdrop{pointer-events:none;background:transparent}\n#sc-toolbar{position:absolute;right:8px;top:max(8px,env(safe-area-inset-top));display:flex;gap:4px;pointer-events:auto;font:14px system-ui,sans-serif}\n#sc-toolbar button{min-height:44px;min-width:48px;background:#fff;color:#263550;border:1px solid #a5b4fc;border-radius:9px;cursor:pointer;padding:6px 10px;font:inherit;box-shadow:0 2px 6px #11182730}\n#sc-toolbar[hidden],#sc-panel[hidden]{display:none!important}\n#sc-panel{pointer-events:auto;position:absolute;right:8px;top:64px;margin:0;width:min(360px,calc(var(--sc-ui-width,100vw) - 16px));max-width:calc(var(--sc-ui-width,100vw) - 16px);max-height:calc(var(--sc-ui-height,100dvh) - 76px);overflow:auto;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 10px 35px #11182740;font:13px/1.5 system-ui,sans-serif}\n#sc-panel.standalone{width:min(900px,calc(var(--sc-ui-width,100vw) - 16px))}\n#sc-panel.standalone #manager{display:block}\n#sc-panel select,#sc-panel input[type=text],#sc-panel input[type=color],#sc-panel button,#sc-panel .file-button{min-height:40px}\n#sc-panel input[type=range]{height:30px}\n#sc-panel textarea,#sc-panel input[type=text]{font-size:16px}\n@media(max-width:600px){#sc-panel.standalone #controls{display:block}#sc-panel.standalone .group{margin-bottom:12px}}\n"};
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

})(typeof GM === 'object' ? GM : undefined);
