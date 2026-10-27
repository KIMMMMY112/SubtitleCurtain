# Privacy / 隐私说明

SubtitleCurtain v0.1.0 · 2026-10-27

The extension runs locally. It has no analytics, advertising, remote code, network requests, server, subscription, or account system. It does not read video/audio streams, subtitle text, browsing history, cookies, credentials, or form contents. Keyboard handlers inspect whether focus is inside an editable field so shortcuts do not interrupt typing; typed text is not collected.

Local data consists of curtain geometry, enabled/locked state, style values keyed by the top-level site's hostname, and the user's named style presets. These are saved to `chrome.storage.local`, shared only within that browser profile, and are not synced to a server. Exporting presets creates a JSON file on the user's device containing names and appearance settings, not site history or geometry. Importing JSON accepts bounded data fields, never executable CSS or JavaScript.

The extension requests `storage` for these settings and `activeTab` for the toolbar interaction. Static content scripts run on http/https sites and matching related frames to render the overlay, handle pointer/keyboard actions, and respond to fullscreen changes. The service worker derives the current tab's hostname to associate embedded players with their parent site's settings. It does not store full page URLs.

Reset clears a site's settings to defaults; presets can be deleted in the manager. Browser extension removal deletes extension storage. Export presets before removal if you want a backup. GitHub and the browser's own network behavior are governed by their respective policies; they are not extension telemetry.

中文：所有设置和自定义花色仅存于本机浏览器。不收集视频、字幕、输入内容、账号、Cookie 或浏览历史，不联网、不追踪。网站主机名用于区分本地配置，完整网页地址不保存。卸载前可导出花色库备份。
