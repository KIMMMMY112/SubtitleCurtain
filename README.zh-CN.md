# SubtitleCurtain · 字幕遮挡器

**遮住翻译字幕，把注意力留给英语。** 免费开源，可拖动、缩放和自定义外观，按网站在本机保存配置。

[English](README.md) · [官网与安装](https://kimmmmy112.github.io/SubtitleCurtain/) · [GitHub 免费下载](https://github.com/KIMMMMY112/SubtitleCurtain/releases) · [反馈问题](https://github.com/KIMMMMY112/SubtitleCurtain/issues/new?template=bug.yml)

![真实扩展操作实录，画面为自制测试视频](docs/media/demo.gif)

这是真实扩展在自制视频字幕测试页上的实录，包含拖动、缩放、外观、锁定和开关；不是第三方视频网站的演示或通用兼容保证。

## 功能

- 显示、自由拖动，手柄或设置调整宽度、高度。
- 纯色、渐变、四种花纹、透明度、圆角、多种形状及自定义多边形。
- 一键显示/隐藏，刷新后恢复各网站位置与样式。
- 锁定后点击穿透，避免干扰视频操作。
- 花色保存、应用、更新、重命名、删除及 JSON 导入导出。
- 支持已测试的网页/播放器容器全屏模式，原生视频模式限制单列。

## 免费安装

**Chrome / Edge / Brave / Opera：** 下载稳定版中的 **Chromium ZIP**，解压并保留文件夹。打开对应浏览器的扩展管理页，开启开发者模式 → 加载已解压的扩展程序 → 选择直接包含 `manifest.json` 的文件夹。刷新视频网页，从扩展菜单打开 SubtitleCurtain，开启显示并调整。详情及真实截图见 [安装说明](docs/INSTALL.md)。商店 ZIP 用于发布者提交，普通用户无需使用。

**Safari：** 已实现免费的 Userscripts 用户脚本预览版，复用同一核心。先安装并启用 Userscripts，再在 Safari 安装脚本；没有提示时使用 Userscripts 目录 ZIP。详情见 [Safari 说明](docs/SAFARI.md)。iPhone/iPad 尚待真机验收，已有 iPad 无安装提示或找不到脚本的反馈；不能写成已通过。无需 Xcode、Node.js、Apple 付费开发者账户。

当前没有商店和 Greasy Fork 正式条目，不展示虚假链接。未来即使上架，也会继续保留 GitHub 免费下载安装。

## 兼容范围与限制

[当前发布状态](docs/RELEASE-STATUS.md) 分别记录版本、浏览器、网站和设备。v0.1.0 的四款 Chromium 历史通过不等于新版本四款全部重测；WebKit 手机/平板视口也不等于 iPhone/iPad 真机。

iOS 系统视频全屏、画中画和原生 App 不在网页内部，不能被网页遮挡。请用内嵌播放或网站网页全屏。直接 `<video>` 全屏可能限制编辑；受限制浏览器页面和扩展商店无法注入。不自动识别字幕，也不保证所有网站。

## 更新、隐私、参与

GitHub Chromium 包更新：备份花色，覆盖同一安装目录，在扩展页重新加载，再刷新视频网页。脚本保持同一名称和 namespace，替换原脚本以免多版本冲突。已配置脚本管理器更新地址，但 Userscripts 某些版本停用了自动检查，保留手动更新，不保证自动升级。

网站主机名、位置和样式仅在本机处理，不发送给开发者；不分析视频和字幕，无遥测、广告或付费 API。脚本管理器检查更新时可单独访问 GitHub/Greasy Fork。详见 [隐私政策](PRIVACY.md)。

欢迎 [反馈问题](https://github.com/KIMMMMY112/SubtitleCurtain/issues/new/choose)、[贡献代码](CONTRIBUTING.md) 或分享真实体验。如果觉得有用，也可以在 GitHub 点一个 Star 帮助其他学习者发现；不互刷、不奖励、不夸大兼容性。

[MIT License](LICENSE) · © 2026 KIMMMMY112
