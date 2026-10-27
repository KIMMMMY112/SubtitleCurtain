# SubtitleCurtain v0.1.0 测试记录

日期：2026-10-27（Asia/Kuala_Lumpur）。基于用户提供的六文件项目继续开发；初始审查见 [INITIAL-AUDIT.md](INITIAL-AUDIT.md)。

## 环境和范围

本地环境为 macOS 15.1 / Apple Silicon arm64 / Node.js 24.15.0。自动化使用真实浏览器程序、临时独立配置目录、实际加载 MV3 扩展，没有模拟 `chrome.*` API 来代替浏览器验收。以下完整套件采用无界面模式；开发中也做过有界面交互检查，但没有把部分有界面试运行算成完整套件通过。用户已在自己的 Chrome 安装并反馈可以使用。

| 浏览器程序 | 程序版本 / 引擎版本 | 完整套件 | 原始结果 |
| --- | --- | --- | --- |
| Google Chrome | 156.0.8078.48 | 28 / 28 通过 | [JSON](test-results/chrome-macos.json) |
| Microsoft Edge | 156.0.4314.50 | 28 / 28 通过 | [JSON](test-results/edge-macos.json) |
| Brave | 1.98.60（程序输出 156.1.98.60）/ Chromium 156.0.8078.48 | 28 / 28 通过 | [JSON](test-results/brave-macos.json) |
| Opera | 138.0.6044.24 / Chromium 154.0.8037.99 | 28 / 28 通过 | [JSON](test-results/opera-macos.json) |

Chrome、Edge、Opera 使用 CDP `Extensions.loadUnpacked` 加载；Brave 的最终验收使用它支持的本地扩展启动参数。测试运行器会先打开测试网页唤醒可能休眠的 MV3 Service Worker，然后开始验收。没有向日常浏览器配置中注入测试数据。

## 必须功能验收

完整套件使用本地 http 页面和跨域 iframe（127.0.0.1 / localhost）；页面将动态 Canvas 画面和中英文字幕送入 `video.srcObject` 实际播放，确认视频时间推进。测试不依赖收费服务或外部视频站的稳定性。

| 验收项目 | 执行内容 | 四款浏览器结果 |
| --- | --- | --- |
| 显示遮挡条 | 从真实扩展 action 弹窗点击开关 | 通过 |
| 任意拖动 | 实际鼠标拖动，比较前后坐标 | 通过 |
| 宽度 / 高度 | 鼠标手柄缩放和设置控件；圆形/多边形手柄可用 | 通过 |
| 自定义外观 | 纯色、渐变、两色、角度、四种花纹、间距、透明度、圆角、五种内置形状与自定义多边形 | 通过 |
| 一键开关 | 弹窗显示开关、Alt + Shift + S 隐藏/恢复 | 通过 |
| 自动保存 | 刷新、重启浏览器后恢复位置、尺寸、外观、锁定、开关和花色库 | 通过 |
| 普通播放 | 视频实际播放；不透明遮挡条盖住中文行并保留英文行 | 通过 |
| 网页播放器全屏 | 容器 Fullscreen API：遮挡显示、鼠标拖动、退出后恢复 | 通过 |
| 跨域 iframe 全屏 | 子框架内请求播放器容器全屏；只出现一个遮挡层，沿用顶层网站配置 | 通过 |
| 锁定位置 | 锁定后鼠标按下/拖动到达下方视频，遮挡条不移位 | 通过 |
| 形状 / 花色管理 | 新建、命名、重命名、更新、应用、删除；应用不覆盖尺寸/位置/锁定/开关 | 通过 |
| JSON 备份 | 导出、删除、导入往返；拒绝错误文件格式 | 通过 |
| 辅助与边界 | 方向键移动/缩放、输入框快捷键保护、窗口缩小与滚动、节点被删除后恢复、站点隔离 | 通过 |
| 安装错误提示 | 直接打开 popup.html 给出安装步骤；内部页面给出不支持提示 | 通过 |

截图经过实际查看：[中文被遮挡、英文保留](screenshots/curtain.png)，[独立花色管理界面](screenshots/manager.png)。

## 实际网站验证

以下网站测试使用 Google Chrome 156.0.8078.48 的独立、未登录配置。范围是列出的测试视频和模式，不代表网站所有内容、登录状态、清晰度、广告、地区或其他浏览器组合均通过。

| 网站 / 页面 | 真实执行结果 | 记录 |
| --- | --- | --- |
| [哔哩哔哩：TED 中英双语学习视频](https://www.bilibili.com/video/BV1vp4y1x7FW/) | 实际播放、普通页面遮挡、网页全屏、播放器容器全屏、锁定时暂停/继续，共 5 项通过；查看了全屏截图 | [JSON](test-results/bilibili-chrome.json) |
| [YouTube：Me at the zoo](https://www.youtube.com/watch?v=jNQXAC9IVRw) | 实际播放、普通页面遮挡、播放器容器全屏，共 3 项通过；查看了全屏截图 | [JSON](test-results/youtube-chrome.json) |

哔哩哔哩是用户指定的重点网站。尚未验证其他视频站，不将 Netflix、优酷、爱奇艺等标为已通过。未验证 Edge / Brave / Opera 与这两个公共网站的所有组合。

## 代码、数据和发布验证

- ESLint、Manifest V3 和入口文件检查通过。
- 检查权限仅为 `storage`、`activeTab`；运行时代码无 `fetch`、XHR、远程脚本或动态执行。
- 可移植核心不调用 Chrome API。
- 16 项单元测试全部通过：参数清洗、1000 组窗口几何边界、所有外观组合、多边形校验、花色库校验、串行写入、存储失败报告、网站隔离与重置。
- 已为用户报告的连接问题增加回归：直接打开本地 HTML、缺少核心脚本、连接超时三种情况；连接不会无限停在“正在连接”。
- `npm audit --omit=dev`：0 vulnerabilities。
- ZIP 仅包含运行时、图标、README、安装说明、MIT LICENSE、隐私说明、更新记录和本测试记录；不包含 node_modules、浏览器程序或测试账户数据。
- 发布 ZIP 已实际解压并在 Google Chrome 中安装，再次通过 28 / 28 项验收：[结果](test-results/release-zip-chrome.json)。最终 ZIP 仅补充文档记录；manifest、src、assets 的逐文件 SHA-256 与验收版本一致：[运行时校验](test-results/release-runtime-sha256.json)。
- 提供 GitHub Actions CI；远程运行状态以仓库 Actions 页面为准，不以已编写工作流冒充已执行通过。

## 已知限制

1. **直接 video 元素原生全屏：部分支持。** 四款浏览器验证了顶层遮挡显示和快捷键锁定；同一模式内尝试鼠标拖动未移位，记录在各 JSON 的 `observations` 中。该模式不列为鼠标编辑通过。进入前定位，或使用网站的播放器容器全屏。网页容器全屏和 iframe 内的播放器容器全屏才是本版完整验收的全屏模式。
2. iframe 测试为子框架内的播放器请求全屏；没有把顶层直接对 iframe 元素请求全屏等未测路径列为通过。浏览器内部页面、扩展商店、画中画、操作系统原生独立视频窗口不支持。
3. 本地测试系统仅 macOS arm64；Windows、其他 CPU 架构、历史浏览器版本未实测。Linux CI 的结果单独查看。Firefox、Safari、iPhone/iPad、桌面悬浮窗未实现。
4. 位置以窗口比例保存，视频布局或全屏变化后可能需要重新定位；不自动识别中文字幕。同一主机名的多个页面共用设置。
5. 外观透明度低于 100%、椭圆或多边形边缘可能露出字幕；需要完整遮挡时使用 100% 不透明的矩形。

## 复现

```sh
npm ci
npm run check
HEADLESS=1 npm run test:browser
SC_SITE=bilibili npm run test:site
npm run test:site # 默认 YouTube
npm run package
```

其他浏览器：同时设置 `SC_BROWSER_EXECUTABLE`（程序绝对路径）、`SC_BROWSER_LABEL`（例如 Brave）、`HEADLESS=1`。验收解压包设置 `SC_EXTENSION_DIR`。每次套件清理并重建相应 `test-results/<browser>/`，避免旧导出文件污染结果。测试截图和原始运行输出保存在该目录。
