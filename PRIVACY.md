# Privacy policy / 隐私说明

SubtitleCurtain · updated 2026-10-29

## What stays on your device

SubtitleCurtain processes curtain settings locally. It stores the current site's **hostname** (for example, `www.bilibili.com`) as a preference key, along with position, size, appearance, visibility and lock state. Saved style names and appearance presets are also stored locally. Hostnames are website-related information; local processing is still data processing. The extension does not transmit these preferences to the developer or another service.

Chromium uses `chrome.storage.local` in the browser profile. Safari's Userscripts adapter uses `GM.getValue` and `GM.setValue` in the script manager. This project does not implement cross-device settings synchronization. Optional iCloud script-folder synchronization is a separate service controlled by your Apple settings.

## What the runtime does

Content scripts run on matching HTTP/HTTPS pages and frames to draw the curtain, handle pointer/keyboard input and react to fullscreen changes. The extension's service worker uses the top tab's hostname to group iframe preferences with the parent page. The userscript uses an ancestor origin or referrer for the same local key when available. Full page URLs are not persisted. The shortcut handler checks whether an editable field has focus; it does not collect typed text.

The runtime does not read subtitle text, analyze video/audio, access the browser history API, cookies, credentials or account data. It does not log page visits. It has no analytics, advertising, telemetry, server, subscriptions, remote executable dependencies or runtime network requests. It does not sell or share data. Processing is limited to the user-facing curtain and saved preferences.

## Permissions

- `storage`: save site preferences and the style library locally.
- `activeTab`: connect the toolbar settings to the tab you choose.
- Static HTTP/HTTPS content-script matching: draw and control the overlay on video webpages, including matching iframe players. This broad site access is required for a general-purpose curtain and is not used for tracking.

Browser site-access settings can restrict which websites the extension runs on. The uncompiled native Safari resources declare HTTP/HTTPS host access, but are not a signed or installed Apple app.

## Downloads and updates

The GitHub userscript declares GitHub metadata and download URLs. A script manager may request these URLs when checking for or installing an update. **Those manager requests are separate from the in-page curtain runtime** and are governed by the manager's and GitHub's policies. No script-manager API for sending network requests is granted. The Greasy Fork build lets Greasy Fork supply its own update links. Userscripts update behavior varies by version; manual replacement remains supported.

The static product website has no analytics, external fonts or tracking scripts. Its language choice can be saved in the browser's local storage. GitHub Pages, GitHub downloads, app stores and Userscripts are third-party services with their own connection and privacy policies. Following a link contacts the service you choose.

## Control, export and deletion

Reset returns the current site's saved configuration to defaults; it does not remove the style library or necessarily delete the hostname key. Style presets can be deleted in the manager. JSON export contains preset names and appearance values, not geometry or hostname keys. Import accepts bounded data fields, never executable CSS/JavaScript. Removing the Chromium extension clears its local extension storage. Userscripts storage removal follows the manager's behavior. Back up exported styles before removal; script-file deletion alone is not promised to erase manager storage.

Questions: [open a privacy issue](https://github.com/KIMMMMY112/SubtitleCurtain/issues/new?template=privacy.yml). Do not post private URLs, credentials or personal records in a public issue.

## 中文说明

本项目会在本机处理并保存**网站主机名**及遮挡位置、大小、外观、开关、锁定和花色名称，用于恢复每个网站的配置。主机名属于网站相关信息；“不上传”不等于“不处理数据”。这些设置不会发给开发者，不记录访问日志或完整网页地址，不访问浏览器历史记录 API，不读取字幕、视频音频流、账号、Cookie、密码或输入内容。无广告、遥测和追踪。

Chromium 使用浏览器本地存储；Safari 使用 Userscripts 的 GM 存储。用户脚本更新由脚本管理器访问 GitHub 或 Greasy Fork 的更新地址，网页内遮挡代码本身不联网。管理器、应用商店、GitHub/iCloud 的行为由各自政策决定。

“重置”恢复当前站点配置，不保证删除主机名键，也不删除花色库；卸载 Chromium 扩展清除其本地数据。Userscripts 的数据删除按管理器实现处理。卸载前可导出花色 JSON。官网不含统计或外部字体，仅可在本机记住语言选择。
