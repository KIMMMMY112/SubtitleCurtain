# Product media provenance

These assets record the **actual installed SubtitleCurtain MV3 extension** in a fresh, disposable Chrome profile. The video is an original, synthetic canvas animation streamed to a real `<video>` with `captureStream(24)`; the English and Chinese captions were written for this project. No third-party footage, private browser tabs, accounts, or student/course material are included.

- `demo.gif`: continuous page screenshot sequence showing the real extension being enabled, moved with mouse pointer input, resized with its handle, restyled through its own controls, locked, hidden and restored. The curtain is rendered by `src/core/overlay.js`; it is not painted onto the screenshots.
- `before-curtain.png` / `curtain-video.png`: before/after product screenshots from that test video, at 1280×800.
- `appearance-manager.png` / `style-library.png`: actual extension settings/appearance-library pages, at 1280×800. The product UI currently includes Chinese and English labels.
- `appearance-manager-full.png`: uncropped full-page view of the same actual settings page. This taller image is for documentation, not a store screenshot requiring a fixed aspect ratio.
- `install-chromium.png`: actual `chrome://extensions` page, with Developer mode enabled only in the disposable test profile. It is a Chrome installation reference, not a screenshot of Edge/Brave/Opera or a store listing.
- `capture.json`: exact browser/version, extension version, viewport, frame timing and per-frame curtain state recorded during generation.

Generate again from the repository root after installing development dependencies:

```sh
node scripts/record-demo.mjs
```

Requires a working local Chrome (or `SC_BROWSER_EXECUTABLE`) and Python with Pillow to encode the captured frames as a GIF. End users do **not** need these tools. The script launches and removes only its own temporary browser profile, frame directory, and local test server.

The recording is evidence for the pictured actions on a controlled synthetic video page. It does not establish Bilibili/YouTube, Safari, iPhone/iPad, system video fullscreen, or picture-in-picture compatibility. Do not describe it as footage from an actual video platform or a mobile device.

The PNG files copied to `docs/distribution/media/` are the same actual 1280×800 captures, suitable as store-submission screenshot candidates. Store acceptance and publication remain separate steps.
