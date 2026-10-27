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
