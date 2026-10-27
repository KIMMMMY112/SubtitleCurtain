import js from '@eslint/js';
export default [
  {ignores:['node_modules/**','dist/**','test-results/**']},
  js.configs.recommended,
  {files:['**/*.js','**/*.cjs','**/*.mjs'], languageOptions:{globals:Object.fromEntries(['chrome','document','window','location','globalThis','console','setTimeout','clearTimeout','URL','URLSearchParams','Blob','FileReader','MutationObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame','importScripts','crypto','TextEncoder','process','Buffer','require','module','__dirname','fetch','Option','structuredClone','getComputedStyle','Event','innerWidth','innerHeight'].map(k=>[k,'readonly']))}}
];
