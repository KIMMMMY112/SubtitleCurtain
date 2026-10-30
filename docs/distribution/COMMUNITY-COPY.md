# Community introductions / 社区介绍文案

Prepared 2026-10-29. These are drafts for the owner to share; no post has been sent. Recheck release links and the latest test report before posting. Use a real recording of the running product, and disclose that a generated video fixture is used if that is what the recording shows. Follow each community's self-promotion rules. No paid stars, exchanges, artificial accounts or unsolicited mass posting.

## Reddit / English-speaking language-learning community

**Title:** I built a free open-source curtain for translated subtitles while practicing listening

I kept reading the translated line instead of listening, so I built SubtitleCurtain: a movable overlay that lets me cover that part of a video webpage and reveal it when I choose.

You can drag and resize the curtain, customize its color or pattern, lock it so clicks reach the player, and save appearance presets. It stores its settings locally, without an account, analytics or a paid API.

The Chromium extension has a free GitHub ZIP installation route for Chrome, Edge, Brave and Opera. Historical v0.1.0 tests cover these browsers on macOS and selected Chrome playback cases on Bilibili and YouTube. That does not mean every site/browser combination is verified.

There is also a Safari Userscripts preview. Selected Mac Safari actions have been observed, but iPhone/iPad acceptance is incomplete, and an iPad installation issue has been reported. Native mobile video fullscreen and picture-in-picture cannot be covered by a webpage overlay.

Source, installation help and actual test records: https://github.com/KIMMMMY112/SubtitleCurtain

Feedback on usability and installation is welcome. If it is useful to you, a GitHub star can help other learners discover it.

## Reddit / 中文对应说明

**标题：** 我做了一个免费开源的字幕遮挡器，练听力时可以暂时盖住翻译字幕

看双语视频时，我经常不自觉地先看中文，所以做了 SubtitleCurtain：在视频网页上放一个可移动的遮挡条，自己决定什么时候看翻译。

可以拖动、缩放、自定义颜色和花纹，锁定后继续操作下面的播放器，也能保存形状花色。设置仅保存在本地，无账号、追踪或付费 API。

Chrome、Edge、Brave、Opera 保留免费的 GitHub ZIP 安装方式。已公开 v0.1.0 的 macOS 浏览器测试和 Chrome 下部分哔哩哔哩、YouTube 场景，不宣称兼容所有网站。

Safari 有免费 Userscripts 预览版，Mac 上已记录部分实际操作。iPhone/iPad 尚未完成真机验收，也有 iPad 安装入口问题待确认。手机系统视频全屏、画中画无法由网页遮挡。

源码、安装说明、测试记录：https://github.com/KIMMMMY112/SubtitleCurtain

欢迎反馈安装和使用体验。如果它对你有帮助，可以在 GitHub 点个 Star，让更多学习者发现它。

## B 站视频介绍

**标题：** 免费开源字幕遮挡器：把中文字幕先盖住，再练英语听力

**简介：**

SubtitleCurtain 可以在视频网页上显示一个遮挡条，由你手动盖住中文字幕。支持拖动、调宽高、纯色/渐变/花纹、自定义形状、一键开关、自动保存，以及锁定后点击穿透。

演示请使用实际运行画面。它不会自动识别字幕或翻译视频。Chromium 版保留 GitHub 免费安装；Safari 为免费的 Userscripts 预览方案。iPhone/iPad 尚未完成真机验收，系统视频全屏与画中画不支持网页遮挡。

源码和安装说明：https://github.com/KIMMMMY112/SubtitleCurtain

遇到问题可在 Issues 留下浏览器版本、网页链接和复现步骤；不要上传私人账号信息。如果这个工具帮到了你，欢迎给项目一个 Star。

**建议演示顺序：** 展示双语测试视频 → 打开遮挡条 → 拖动盖住中文 → 调尺寸 → 锁定并操作播放器 → 隐藏/恢复 → 展示设置与开源链接。明确普通网页、容器全屏与系统原生全屏的区别。

## 小红书介绍

**标题：** 练英语听力总先看中文？试试我做的开源字幕遮挡器

看双语视频时，想先听一遍，却总会直接读中文字幕。我做了 SubtitleCurtain，给视频网页加一个能移动的遮挡条，先盖住翻译，需要时再一键显示。

支持拖动调大小、颜色和花纹、形状花色保存。调整后锁定，就能继续点下面的播放器。设置留在本地，不需要账号或订阅。

目前 Chromium 浏览器可从 GitHub 免费下载安装。Safari 是免费 Userscripts 预览版；手机和平板仍有待确认的安装和真机兼容问题，系统视频全屏和画中画不能遮挡。请先看安装说明和测试范围。

项目名：SubtitleCurtain

源码与说明：https://github.com/KIMMMMY112/SubtitleCurtain

如果你也需要这样的工具，欢迎体验、提问题。喜欢的话，可以去 GitHub 点个 Star 支持后续维护。

**可用话题：** #英语听力 #英语学习 #开源工具 #浏览器扩展 #字幕遮挡

## Developer community / English

**Title:** SubtitleCurtain: a local-only MV3 subtitle overlay with a shared Safari userscript core

SubtitleCurtain adds a draggable, resizable visual curtain to video webpages for language practice. The same validation, geometry, renderer and settings controls are reused across the MV3 extension and a GM-storage Safari Userscripts adapter. It includes appearance presets, custom polygons, click-through locking and per-host persistence, without a backend or remote runtime code.

The repository includes unit tests, installed-extension browser tests, WebKit viewport checks and explicit test limits. Historical Chromium v0.1.0 passes and Safari preview evidence are documented separately. Physical iPhone/iPad acceptance remains incomplete; native mobile video fullscreen is outside the webpage.

MIT source and free GitHub downloads: https://github.com/KIMMMMY112/SubtitleCurtain

Contributions that improve installation, accessibility or reproducible browser coverage are welcome. Please report observed compatibility rather than assuming a successful engine simulation proves a physical-device pass.

## 开发者社区 / 中文

**标题：** 开源 SubtitleCurtain：共用核心的 MV3 字幕遮挡扩展与 Safari 用户脚本

SubtitleCurtain 面向语言学习，用可以拖动、缩放的视觉遮挡条盖住翻译字幕。MV3 版与 Safari Userscripts 适配器复用参数校验、几何、DOM 渲染和设置控制器，分别接入浏览器本地存储或 GM 存储。支持自定义多边形、花色库、锁定点击穿透及按网站保存，无后端和远程运行时代码。

仓库包含单元测试、真实安装扩展的浏览器测试、WebKit 视口测试与明确的验收边界。Chromium v0.1.0 历史结果和 Safari 预览版证据分开记录；iPhone/iPad 尚未完成真机验收，系统原生视频全屏无法由网页覆盖。

MIT 源码和 GitHub 免费下载：https://github.com/KIMMMMY112/SubtitleCurtain

欢迎改进安装体验、可访问性与可复现的浏览器覆盖。请提交实际观察到的兼容结果，不把模拟引擎通过当作真机通过。
