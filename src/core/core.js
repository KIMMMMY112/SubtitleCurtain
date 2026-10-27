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
  global.SubtitleCurtainCore = Object.freeze({ DEFAULTS, CHOICES, STYLE_KEYS, normalize, merge, storageKey, geometry, background, appearance, clamp, polygonPoints, styleOnly, normalizeLibrary });
})(globalThis);
