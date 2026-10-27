(() => {
  'use strict';
  const Core = globalThis.SubtitleCurtainCore;
  const controls = document.getElementById('controls');
  const site = document.getElementById('site');
  const error = document.getElementById('error');
  const ids = ['enabled','locked','fillType','color1','color2','pattern','shape','radius','opacity','width','height'];
  let tabId = null;
  let state = Core.normalize();
  let applying = false;
  function showError(message) {error.hidden=false; error.textContent=message;}
  function display(s) {
    state=Core.normalize(s); applying=true;
    for (const id of ids) {
      const el=document.getElementById(id);
      let value=state[id];
      if (id==='width'||id==='opacity') value=Math.round(value*100);
      if (el.type==='checkbox') el.checked=value;
      else el.value=value;
    }
    document.getElementById('patternLine').hidden=state.fillType!=='pattern';
    document.getElementById('color2').disabled=state.fillType==='solid';
    document.getElementById('radius').disabled=state.shape!=='rounded';
    document.getElementById('widthValue').textContent=Math.round(state.width*100)+'%';
    document.getElementById('heightValue').textContent=Math.round(state.height)+' px';
    document.getElementById('opacityValue').textContent=Math.round(state.opacity*100)+'%';
    document.getElementById('radiusValue').textContent=Math.round(state.radius)+' px';
    applying=false;
  }
  async function message(type, patch) {
    if (tabId === null) throw new Error('No active tab');
    const res=await chrome.tabs.sendMessage(tabId,{type,patch});
    if (!res?.ok) throw new Error(res?.error||'The webpage did not respond');
    return res;
  }
  async function change(id, raw) {
    const patch={};
    if (['enabled','locked'].includes(id)) patch[id]=raw;
    else if (['width','opacity'].includes(id)) patch[id]=Number(raw)/100;
    else if (['height','radius'].includes(id)) patch[id]=Number(raw);
    else patch[id]=raw;
    display(Core.merge(state,patch));
    try {const response=await message('SC_PATCH',patch); display(response.settings);error.hidden=true;}
    catch {showError('设置暂时没有写入，请重新打开网页再试。');}
  }
  for (const id of ids) {
    const el=document.getElementById(id);
    el.addEventListener(el.type==='range' ? 'input' : 'change', () => {
      if (!applying) change(id,el.type==='checkbox'?el.checked:el.value);
    });
  }
  document.getElementById('reset').addEventListener('click',async () => {
    try {display((await message('SC_RESET')).settings);error.hidden=true;}
    catch {showError('无法重置：请刷新视频网页再试。');}
  });
  (async () => {
    try {
      const tabs=await chrome.tabs.query({active:true,currentWindow:true});
      tabId=tabs[0]?.id ?? null;
      const response=await message('SC_GET_STATE');
      site.textContent='当前网站 · '+response.site;
      display(response.settings);
      controls.disabled=false;
    } catch (_) {
      site.textContent='此页面暂不支持使用';
      showError('请打开普通视频网页（http/https），刷新一次后再试。浏览器内部页面、扩展商店和部分特殊播放器无法注入。');
    }
  })();
})();
