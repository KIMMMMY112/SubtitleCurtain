# Safari 预览版：Mac / iPhone / iPad

Safari 已纳入项目支持范围。当前提供免费 **Userscripts 用户脚本预览版**，复用 Chromium 扩展的核心、遮挡渲染器和形状花色管理界面。它不是原生 iOS App，也不是已上架的 Safari 商店扩展。

稳定 Chromium v0.1.0 仍保留在 [原 Release](https://github.com/KIMMMMY112/SubtitleCurtain/releases/tag/v0.1.0)。本预览版不把未验证的设备或模式标为通过。安装 Userscripts 及使用 SubtitleCurtain 不收取费用；本项目未开通付费 Apple 开发者计划。

## 安装

1. 从 [App Store 安装免费的 Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)。在 Mac / iPhone / iPad 各自的 Safari 扩展设置中启用它。按系统提示为要使用的视频网站授予访问权限；可以先只允许哔哩哔哩。
2. 在 **Safari** 打开 [预览脚本的原始文件](https://raw.githubusercontent.com/KIMMMMY112/SubtitleCurtain/safari-support/userscripts/SubtitleCurtain.user.js)，再打开 Safari 扩展菜单 → Userscripts，按它显示的安装提示安装。也可以下载 `.user.js`，放进 Userscripts App 显示的脚本目录。
3. 确认 Userscripts 菜单里 SubtitleCurtain 已启用，刷新视频网页。右上角出现「显示 / 隐藏」和「设置」按钮。
4. 点击「显示」，拖动遮挡条；通过「设置」调宽高、样式和形状。调整完打开「锁定位置」，以便点击下方的视频播放器。

iOS/iPadOS 的 Safari 设置位置会随系统版本变化，可以从系统设置搜索 Safari，然后进入扩展。若只看到脚本文本，仍需从 Safari 的 Userscripts 弹窗完成安装，不是把文本粘贴进地址栏。Userscripts 官方说明了两种安装方式：[官方文档](https://github.com/quoid/userscripts#usage)。

## 保留设置与更新

保持脚本的 `@name`、`@namespace` 和已安装的脚本条目稳定；更新时替换原脚本，避免同时启用两个 SubtitleCurtain。Mac 默认目录中的推荐文件名为 `SubtitleCurtain.user.js`。不要把包含多个旧版本的整个发布目录当成脚本目录。

设置保存在本设备的 Userscripts GM 存储中；当前网站按主机名保存，花色库跨网站共用。代码和设置不会自动从 Chrome 版迁移。花色可通过「导出 JSON / 导入 JSON」搬迁。同一脚本的其他可见标签页大约 2.5 秒同步一次本地更改，跨标签并发编辑以最后完成的写入为准。

可以用 iCloud 文件夹共享脚本文件，但本项目不承诺设置跨设备同步。使用 iCloud 时请遵循 Userscripts 官方关于脚本目录同步和“保留下载”的说明。

## 使用模式

- 支持目标：普通网页内播放、网站提供的 CSS 网页全屏、支持 Fullscreen API 的播放器容器。
- **iPhone/iPad 的原生系统视频全屏、画中画、哔哩哔哩原生 App 不在网页内部，不能被网页脚本覆盖。** 请使用 Safari 中的网页内播放或网站提供的网页全屏；必要时尝试“请求桌面网站”。
- 使用普通移动网页视口的页面进行手机布局验收；强制桌面布局或缺少 viewport 声明的网站可能把控件缩小，需要设备实测。
- 位置按可见视口比例保存，旋转、缩放或切换布局后可能需要调整，不会自动识别中文字幕。
- 锁定后遮挡区域点击穿透，右上角管理按钮仍可操作。

## 测试边界

| 环境 | 已有证据 | 状态 |
| --- | --- | --- |
| Mac Safari 18.1 + Userscripts 4.8.6 | 实际加载、播放、显示/隐藏、鼠标拖动/手柄缩放、位置键盘微调、刷新恢复、锁定点击穿透、播放器容器全屏及全屏内开关、渐变选择、花色保存/重命名/删除 | 这些列出项目已观察通过；不据此扩大到所有网站或所有功能组合 |
| Playwright WebKit 27.2，桌面/手机/平板视口 | 每个视口 10 项，共 30 项通过；使用测试 GM 存储桥接 | 模拟引擎验收，不是 Safari 18.1 或 iOS 真机验收 |
| Chrome 156，共用核心改动回归 | 28 项浏览器验收通过 | Chromium 回归，不等于 Safari 通过 |
| iPhone Safari | 由用户自行真机验收，尚未收到结果 | 待真机验收 |
| iPad Safari | 由用户自行真机验收，尚未收到结果 | 待真机验收 |
| 原生 Safari Web Extension / App Store 安装 | 仅生成资源 ZIP；本机没有完整 Xcode，未签名、未编译安装 | 不能当成已发布的原生安装器 |

不要用本版本的 0.1.0 历史测试报告来代替 Safari 预览结果。详细新结果见 [SAFARI-TEST-REPORT.md](SAFARI-TEST-REPORT.md)。

## iPhone / iPad 真机验收清单

以下为自测参考。两个设备可分别在 Safari 打开常用的哔哩哔哩视频网页，记录设备型号、iOS/iPadOS 版本、视频链接：

1. 右上角显示开关能显示/隐藏遮挡条。
2. 手指拖动能移动；右下角手柄可调整尺寸；设置里的宽高也能调整。
3. 纯色、渐变、花纹、透明度、形状可设置；花色能保存并重新应用。
4. 锁定后点遮挡区域下方，播放器仍能正常响应；解锁后能继续移动。
5. 刷新页面后恢复开关、位置、大小和样式。
6. 竖屏/横屏切换和打开设置后，按钮、面板仍可见可操作。
7. 网页全屏中遮挡仍显示；切入系统原生视频全屏按已知限制处理。

可以简短回复：“iPhone 型号 / 系统版本；1–7 哪些通过；失败现象”。iPad 同样单独记录。没有收到实际结果之前，这两行会保持“待验收”。

## 原生 Safari 扩展路线

`npm run package:safari` 同时生成 `Safari-WebExtension-Resources` ZIP。它是供 Apple 打包工具使用的 WebExtension 资源，不可在 Safari 18.1 中像 Chrome 那样直接加载作为正式扩展。本机目前仅有 Command Line Tools，没有完整 Xcode，因此不伪造已签名的 Safari App。

正式原生分发需要按 [Apple Safari Web Extensions 文档](https://developer.apple.com/documentation/safariservices/safari-web-extensions) 使用 Xcode/Apple 打包与分发流程；涉及开发者注册、签名或费用时另行处理。免费 Userscripts 路线可以先使用，后续仍维护同一公开仓库和共用核心。
