# Contributing

Thanks for helping people learn with less distraction. Bugs with reproducible steps, accessibility improvements, translations and small focused pull requests are welcome. A star is appreciated if SubtitleCurtain is useful; no incentives or star exchanges.

## Report a bug

Use the issue templates. Include extension version, browser/OS, installation method, inline/web/fullscreen mode and steps. Share a public video URL only if it is safe to disclose. Redact personal tabs and account information from screenshots. Device availability or a successful build is not evidence that every feature passed.

## Develop

Node.js 22.13+ is needed by contributors only. Ordinary users download the packaged extension or userscript.

```sh
npm ci
npm run check
npm run test:browser
npm run test:webkit
npm run package
npm run package:safari
npm run build:site
npm run check:artifacts
```

Browser tests use isolated profiles. Run `SC_BROWSER_EXECUTABLE='/absolute/path' SC_BROWSER_LABEL='Edge' npm run test:browser` for an explicitly identified Chromium browser. Keep raw results and state which platform/version was tested. WebKit mobile viewports are not iPhone/iPad devices.

Keep the portable core and shared controls independent of extension/manager APIs. Change adapters rather than forking product behavior. Preserve dragging, resizing, fills, opacity, shapes, toggle, persistence, supported container fullscreen, lock and the preset manager. Add meaningful regression coverage when fixing behavior. Do not add servers, trackers, paid dependencies, remote runtime code or unsupported compatibility claims.

Build generated `userscripts/` files from source, never edit them directly. For release steps see [distribution notes](docs/distribution/RELEASING.md). Contributions are under the repository's MIT license.

中文：欢迎提供可复现的问题、翻译及小范围修复。普通用户无需开发工具。请注明具体浏览器、系统、版本与播放模式；不要公开私人页面、账号或密钥，不把模拟视口当成真机测试。
