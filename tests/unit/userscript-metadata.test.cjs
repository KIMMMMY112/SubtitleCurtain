const {test} = require('node:test');
const assert = require('node:assert/strict');
test('GitHub updates retain script identity and use a separate metadata endpoint',async () => {
  const {metadata,identity,updateURLs} = await import('../../scripts/userscript-metadata.mjs');
  for (const version of ['0.2.0','0.2.1']) {
    const header = metadata(version);
    assert.match(header,new RegExp('@name\\s+'+identity.name+'\\n'));
    assert.ok(header.includes(identity.namespace));
    assert.ok(header.includes(updateURLs.update));
    assert.ok(header.includes(updateURLs.download));
    assert.match(header,/\/\/ ==UserScript==[\s\S]*\/\/ ==\/UserScript==/);
  }
  assert.notEqual(updateURLs.update,updateURLs.download);
  assert.ok(updateURLs.update.endsWith('.meta.js'));
  assert.ok(updateURLs.download.endsWith('.user.js'));
  assert.throws(() => metadata('not-a-version'));
});
test('Greasy Fork owns its update URLs while the portable runtime identity stays the same',async () => {
  const {metadata,identity} = await import('../../scripts/userscript-metadata.mjs');
  const header = metadata('0.2.1',{channel:'greasyfork'});
  assert.doesNotMatch(header,/@updateURL|@downloadURL|@require/);
  assert.ok(header.includes(identity.namespace));
  assert.match(header,/@name\s+SubtitleCurtain\n/);
  assert.throws(() => metadata('0.2.1',{channel:'unknown'}));
});
