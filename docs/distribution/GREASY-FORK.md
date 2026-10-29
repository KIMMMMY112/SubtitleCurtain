# Greasy Fork publication pack

Prepared from official documentation on **2026-10-29**. No Greasy Fork listing has been verified for SubtitleCurtain at preparation time; do not invent a listing ID or install button.

## Upload and code review

Use the full, readable generated userscript. Preserve its stable `@name` and `@namespace`, set the actual new `@version`, include `@license MIT`, and provide correctly tagged English and Chinese descriptions. The complete curtain/UI/storage implementation belongs in the submitted code, not a remote loader. First-party shared modules can be bundled to keep the runtime offline; identify their repository paths and version in comments. No obfuscation, telemetry, promotional matches, unrelated search terms or ranking-only updates are permitted. [Greasy Fork code rules](https://greasyfork.org/en/help/code-rules).

The script's HTTP/HTTPS matches are for a general manual webpage overlay, not a claim that every site is tested. It requires `GM.getValue` and `GM.setValue` and an isolated content-script context. Test actual manager versions; matching metadata does not prove runtime compatibility.

The owner must sign in or register at [Greasy Fork](https://greasyfork.org/), handle authentication/CAPTCHA and agreement steps themselves, then create a new script using the complete generated `.user.js`. Select the appropriate language and use the copy below. After publication, record the real script page, rewritten code/update URLs and script ID. Do not upload a second copy for routine updates; update the existing entry.

## English listing title

SubtitleCurtain — subtitle curtain for language practice

## English details copy

Place a customizable curtain over translated subtitles while watching a video in your browser. You choose the location and size yourself, so you can keep an original-language line visible and reveal the translation when you want it.

The script includes drag and resize controls, solid/gradient/pattern fills, opacity, rounded corners and custom polygon shapes. Locking the curtain lets clicks reach the player underneath. Page controls show/hide the curtain and open a settings and appearance-preset manager. Settings are saved locally by website hostname; saved appearance presets can be managed and exported/imported as JSON.

No account, paid API, server, advertising or analytics is used by the script. It does not read subtitle text or create translations. The userscript manager handles script storage and installation according to its own permissions.

Safari is a preview. Listed actions have been observed on Mac Safari 18.1 with Userscripts 4.8.6. WebKit desktop, phone and tablet viewport automation is separate from physical Safari testing. iPhone/iPad acceptance is incomplete, and an iPad user has reported missing installation prompts or the script entry. Other userscript managers are unverified unless a later test record specifically names them.

Use inline playback or a supported webpage/player-container fullscreen mode. Native iOS video fullscreen, picture-in-picture and native video apps cannot display a webpage overlay. Website layout changes may require repositioning the curtain.

Install from this page using a compatible manager. If Safari does not show the manager's installation prompt, check its permission for this installation page and consult the manager's directory-installation instructions. Do not enable duplicate SubtitleCurtain entries. Source, privacy details and test records are available in the [project repository](https://github.com/KIMMMMY112/SubtitleCurtain).

## 中文标题

SubtitleCurtain — 语言学习字幕遮挡器

## 中文详情文案

在浏览器视频网页上放置可自定义的遮挡条，手动盖住翻译字幕，同时保留原文内容。可以随时显示或隐藏，让你自主决定何时查看翻译。

支持拖动、缩放、纯色、渐变、花纹、不透明度、圆角与自定义多边形。锁定后点击可以穿透到播放器。网页中的控制按钮可打开设置和花色管理界面，支持花色保存、应用、重命名、更新、删除，以及 JSON 导入导出。位置和外观按网站主机名保存在本机。

脚本无需账号、付费 API、服务器或订阅，没有广告或统计追踪；不会读取字幕文字或生成翻译。安装和存储由脚本管理器负责，受其权限和隐私规则约束。

Safari 当前为预览版。Mac Safari 18.1 + Userscripts 4.8.6 已观察到测试记录中列出的动作；WebKit 桌面/手机/平板视口自动化不等于 Safari 真机测试。iPhone/iPad 尚未完成真机验收，已有 iPad 用户反馈没有安装提示或找不到脚本。其他脚本管理器如无单独记录，保持未验证。

请使用网页内播放或支持的网页/播放器容器全屏。iOS 系统原生视频全屏、画中画和原生视频 App 无法由网页遮挡。视频布局变化后可能需要重新调整位置。

请从本页面通过兼容的脚本管理器安装。Safari 没有显示安装提示时，先检查管理器对当前安装页面的访问权限，再按管理器官方的目录安装说明处理。不要同时启用多个 SubtitleCurtain 条目。源码、隐私说明和测试记录见 [项目仓库](https://github.com/KIMMMMY112/SubtitleCurtain)。

## Update behavior and verification

For the GitHub distribution, use a permanent HTTPS metadata URL ending in `.meta.js` and a permanent script URL ending in `.user.js`, both serving the same released version. Preserve name, namespace and the installed entry; replace it instead of importing a new named copy. Keep old Releases available. Back up appearance JSON before manager changes; cross-manager or cross-device settings migration is not automatic.

Greasy Fork rewrites `@updateURL` and `@downloadURL` to its own endpoints. Keep those real rewritten URLs for Greasy Fork installs rather than redirecting them back to GitHub. Linking the source repository is allowed, but the listing must not steer users to an alternate download source in place of its hosted script. [Metadata rewriting](https://greasyfork.org/en/help/rewriting), [posting rules](https://greasyfork.org/en/help/code-rules).

Userscripts documents version metadata and the optional download URL, but also notes an incomplete update implementation. Its v4.8.4/v1.8.4 release disabled automatic update checking; the later v4.8.6/v1.8.6 release notes describe memory fixes and do not establish restored automatic checks. Therefore, metadata can enable the manager's update route, but **do not promise unattended automatic upgrades on iPhone/iPad**. Keep an explicit manual replacement route. [Userscripts metadata](https://github.com/quoid/userscripts#metadata), [v4.8.4 notes](https://github.com/quoid/userscripts/releases/tag/v4.8.4), [v4.8.6 notes](https://github.com/quoid/userscripts/releases/tag/v4.8.6).

The release developer should verify all of the following and record actual evidence:

1. The `.meta.js` and `.user.js` endpoints return HTTPS success, matching name/namespace/version, correct path suffixes and the expected complete body.
2. The full script's checksum matches the corresponding release artifact; the metadata endpoint contains metadata only.
3. A version greater than an installed version is detected by the specific manager's update control; the existing entry is replaced and retained preferences are checked in that manager.
4. Reopening the installation URL does not result in two enabled versions; if the manager offers a second entry, cancel and update the existing entry.
5. For a Greasy Fork publication, re-download the code and metadata from the actual assigned endpoints and repeat the checks.

Static metadata tests prove endpoint consistency, not an actual manager update. If the manager cannot be exercised on a physical device, record that test as pending. The code must not add an in-page polling updater or download/execute replacement code itself.
