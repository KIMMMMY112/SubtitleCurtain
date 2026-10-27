/* SubtitleCurtain portable core: DOM-free, dependency-free; reusable by future userscripts. */
(function (global) {
  'use strict';
  const STORAGE_PREFIX = 'subtitleCurtain:v1:site:';
  const DEFAULTS = Object.freeze({
    enabled: true, locked: false, x: 0.15, y: 0.77, width: 0.70,
    height: 44, fillType: 'solid', color1: '#111827', color2: '#ec4899',
    opacity: 1, shape: 'rounded', radius: 12, pattern: 'stripes'
  });
  const CHOICES = Object.freeze({
    fillType: ['solid', 'gradient', 'pattern'],
    shape: ['rectangle', 'rounded', 'pill', 'ellipse', 'ticket'],
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
  function normalize(input) {
    const src = input && typeof input === 'object' ? input : {};
    const out = {};
    for (const [key, val] of Object.entries(DEFAULTS)) {
      if (typeof val === 'boolean') out[key] = typeof src[key] === 'boolean' ? src[key] : val;
      else if (key === 'color1' || key === 'color2') out[key] = validColor(src[key]) ? src[key].toLowerCase() : val;
      else if (CHOICES[key]) out[key] = CHOICES[key].includes(src[key]) ? src[key] : val;
      else {
        const limits = {x:[0, 1],y:[0,1],width:[0.12, 1],height:[16, 400],opacity:[0.1,1],radius:[0,100]};
        out[key] = number(src[key], val, limits[key][0], limits[key][1]);
      }
    }
    return out;
  }
  function merge(current, patch) { return normalize({...normalize(current), ...patch}); }
  function storageKey(hostname) {
    const host = (typeof hostname === 'string' ? hostname : '').toLowerCase();
    return STORAGE_PREFIX + (host || 'local');
  }
  function geometry(settings, viewport) {
    const s = normalize(settings);
    const vw = Math.max(1, viewport.width), vh = Math.max(1, viewport.height);
    const width = Math.min(vw, Math.max(Math.min(96, vw), Math.round(vw * s.width)));
    const height = Math.min(vh, s.height);
    return {
      left: Math.round(clamp(s.x * vw, 0, vw - width)),
      top: Math.round(clamp(s.y * vh, 0, vh - height)),
      width, height
    };
  }
  function background(settings) {
    const s = normalize(settings), a = s.color1, b = s.color2;
    if (s.fillType === 'solid') return a;
    if (s.fillType === 'gradient') return `linear-gradient(100deg, ${a} 0%, ${b} 100%)`;
    const patterns = {
      stripes: `repeating-linear-gradient(135deg, ${a} 0px 14px, ${b} 14px 28px)`,
      dots: `radial-gradient(circle, ${b} 0 4px, transparent 4.5px) 0 0 / 24px 24px, ${a}`,
      checker: `conic-gradient(${a} 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0) 0 0 / 26px 26px`,
      waves: `repeating-radial-gradient(ellipse at 0% 50%, ${b} 0px 5px, ${a} 6px 16px)`
    };
    return patterns[s.pattern];
  }
  function appearance(settings) {
    const s = normalize(settings);
    const radius = s.shape === 'rectangle' ? '0' : s.shape === 'pill' ? '999px'
      : s.shape === 'ellipse' ? '50%' : `${s.radius}px`;
    const clipPath = s.shape === 'ticket'
      ? 'polygon(0 0, 100% 0, 100% 35%, 97% 50%, 100% 65%, 100% 100%, 0 100%, 0 65%, 3% 50%, 0 35%)'
      : 'none';
    return { background: background(s), borderRadius: radius, clipPath, opacity: String(s.opacity) };
  }
  global.SubtitleCurtainCore = Object.freeze({ DEFAULTS, CHOICES, normalize, merge, storageKey, geometry, background, appearance, clamp });
})(globalThis);
