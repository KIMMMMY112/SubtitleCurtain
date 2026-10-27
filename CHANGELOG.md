# Changelog

## 0.2.0 Safari preview (not a stable Safari App Store release)

- Share settings controls and validated style-library editing across the extension and Safari Userscripts adapter.
- Add a self-contained Userscripts build for Mac, iPhone and iPad, with a page toolbar, no remote runtime code, and GM-backed local settings.
- Add visual-viewport sizing, primary-pointer protection and prefixed Safari fullscreen events.
- Accept Safari extension URLs and the browser API namespace; provide native Safari Web Extension resources for future Apple packaging.
- Add GM storage regression tests, WebKit desktop/phone/tablet viewport checks, and a separate native/device verification record.
- Real iPhone/iPad acceptance remains pending; native iOS video fullscreen and picture-in-picture cannot display this webpage overlay.

## 0.1.0 — 2026-10-27

- Continue the supplied six-file MV3 project; preserve its dependency-free core and initial implementation in Git history.
- Installable local-only Chromium extension with mouse drag, resize, and keyboard fine adjustment.
- Solid/gradient/pattern fills, colors, opacity, radius, six shapes including validated custom polygons, angle and pattern spacing.
- Standalone appearance manager; create/apply/update/rename/delete presets and JSON import/export.
- Per-site persistence across refresh/browser restart, a global preset library and serialized storage writes.
- Lock with complete pointer pass-through, one-click toggling and editable-safe shortcuts.
- Fullscreen top-layer rendering and synchronized matching iframe adapters.
- Unclipped resize handles for ellipse/custom shapes; fixed fractional-height viewport overflow.
- MIT license, bilingual privacy notice, installation docs, reproducible unit/browser tests, CI and release ZIP with checksum.

Actual tested browser versions, results and limitations are listed in docs/TEST-REPORT.md.
