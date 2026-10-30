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
