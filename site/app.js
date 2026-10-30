(() => {
  'use strict';
  let language='en', browser='chrome', playing=false;
  const tabs=Array.from(document.querySelectorAll('[data-browser]'));
  const languageButton=document.getElementById('language');
  const demo=document.getElementById('demo'), motion=document.getElementById('motion');
  const addresses={chrome:'chrome://extensions',edge:'edge://extensions',brave:'brave://extensions',opera:'opera://extensions'};
  function translate(next){
    language=next;document.documentElement.lang=language==='zh'?'zh-CN':'en';
    for(const node of document.querySelectorAll('[data-en][data-zh]'))node.textContent=node.dataset[language];
    languageButton.textContent=language==='en'?'中文':'English';languageButton.setAttribute('aria-label',language==='en'?'Switch to Chinese':'Switch to English');
    motion.textContent=playing?(language==='en'?'Pause demo':'暂停演示'):(language==='en'?'Play demo':'播放演示');
    try{localStorage.setItem('subtitlecurtain:language',language);}catch{/* Browser storage is optional. */}
  }
  function choose(next){
    browser=next;
    for(const tab of tabs){const selected=tab.dataset.browser===browser;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
    document.getElementById('installation-panel').setAttribute('aria-labelledby','tab-'+browser);
    document.getElementById('chromium-install').hidden=browser==='safari';document.getElementById('safari-install').hidden=browser!=='safari';
    if(browser!=='safari'){document.getElementById('browser-heading').textContent=browser[0].toUpperCase()+browser.slice(1);document.getElementById('extension-address').textContent=addresses[browser];}
  }
  languageButton.addEventListener('click',()=>translate(language==='en'?'zh':'en'));
  for(const tab of tabs){tab.addEventListener('click',()=>choose(tab.dataset.browser));tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();let index=tabs.indexOf(tab);index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    choose(tabs[index].dataset.browser);tabs[index].focus();
  });}
  for(const link of document.querySelectorAll('[data-browser-link]'))link.addEventListener('click',()=>choose(link.dataset.browserLink));
  motion.addEventListener('click',()=>{playing=!playing;demo.src=playing?demo.dataset.motion:demo.dataset.poster;translate(language);});
  try{language=localStorage.getItem('subtitlecurtain:language')==='zh'?'zh':'en';}catch{/* Optional preference. */}
  translate(language);choose(browser);
})();
