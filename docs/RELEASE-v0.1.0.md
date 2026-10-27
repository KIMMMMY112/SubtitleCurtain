SubtitleCurtain v0.1.0：免费、本地运行的字幕遮挡器，基于用户提供的项目完成开发。

- 鼠标拖动、宽高调整；纯色、渐变、四种花纹、透明度、圆角和自定义多边形。
- 锁定后点击穿透；一键开关；按网站自动恢复位置、样式、显示和锁定状态。
- 独立形状/花色管理窗口，支持保存、应用、重命名、更新、删除与 JSON 备份。
- 网页播放器容器全屏及匹配的跨域 iframe 播放器全屏支持。

验证：16 项单元测试通过；macOS arm64 上 Chrome、Edge、Brave、Opera 各 28 项真实浏览器验收通过；实际解压 ZIP 在 Chrome 再次通过 28 项。哔哩哔哩普通播放、网页全屏、播放器全屏、锁定时暂停/继续通过；YouTube 基础播放与全屏通过。详细版本、范围与结果见仓库 [测试记录](https://github.com/KIMMMMY112/SubtitleCurtain/blob/main/docs/TEST-REPORT.md)。其他系统或未测网站不视为已经通过。

安装：下载下面的 `SubtitleCurtain-Chromium-v0.1.0.zip`，先解压，打开 `START-HERE.html` 按步骤在浏览器扩展管理页「加载未打包/已解压的扩展程序」。选择直接包含 manifest.json 的文件夹，然后刷新视频网页并从工具栏打开扩展。不能直接双击 popup.html 使用。`SHA256SUMS.txt` 用于核对下载文件。

已知限制：直接 video 元素原生全屏仅验证了遮挡显示和快捷键，在本次环境中不能用鼠标编辑；请先定位或使用网站的播放器容器全屏。位置不会自动跟踪字幕，需要手动调整。暂不支持 Firefox、Safari、画中画、iPhone/iPad 或桌面悬浮窗。

MIT License；无账号、服务器、追踪、订阅或付费 API。无需扩展商店即可免费使用。
