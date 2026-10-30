# Store submission and review pack

Checked against official sources on **2026-10-29**. Policy checks and prepared assets do not equal store certification. No Chrome or Edge listing URL may be advertised until a published listing is verified.

## Current release boundary

| Item | Recorded state before the new release |
| --- | --- |
| Chromium v0.1.0 | Published GitHub stable release; historical 28-case tests for Chrome, Edge, Brave and Opera on macOS arm64 |
| Safari v0.2.0 Preview | Published Userscripts preview; listed Mac Safari actions observed; WebKit viewport tests use a test GM bridge |
| iPhone / iPad | No completed physical-device acceptance; iPad user reported missing installation prompt or script entry |
| New v0.2.1 candidate | Requires its own final package verification and regression results; historical passes must remain dated and separate |
| Edge Add-ons / Chrome Web Store | Prepared for submission; account enrollment, submission and approval must be confirmed in the actual dashboards |

## Registration and user actions

**Edge first.** The Microsoft Edge extension program has no registration fee. An appropriate Microsoft account and Partner Center enrollment are required. The owner must supply their own country, account type and contact details, complete verification, and read/accept the developer agreement. Do not submit private registration information to this repository. [Microsoft account registration](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account).

**Chrome.** Google requires developer registration and a one-time registration fee; the amount and payment availability must be checked in the dashboard. This project must not pay it automatically. The owner handles account enrollment, any authentication or identity checks, agreement acceptance and payment, if they choose this route. [Chrome registration](https://developer.chrome.com/docs/webstore/register/).

After enrollment, upload the tested **store ZIP**, enter the copy in [STORE-LISTINGS.md](STORE-LISTINGS.md), add assets and the current public privacy URL, review privacy answers, and submit through the dashboard. Keep the dashboard's review state and eventual public URL in the release status. GitHub manual installation remains free even if the owner does not register with Chrome.

## Package and asset requirements

The store archive must have `manifest.json` at the ZIP root and contain its required runtime scripts, HTML/CSS, icons and license. Keep the store archive separate from the GitHub manual-install archive, which also includes beginner documentation. Do not include node_modules, test profiles, private data or unused userscript/native Safari developer resources. [Edge package instructions](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension).

| Asset | Prepared target | Official constraint |
| --- | --- | --- |
| Chrome store icon | PNG, 128×128 | Square artwork about 96×96 with transparent padding |
| Chrome screenshots | Real captures, 1280×800 | 1–5; 1280×800 or 640×400; full bleed |
| Edge logo | PNG, 300×300 | Square; minimum 128×128, 300×300 recommended |
| Edge screenshots | Real captures, 1280×800 | Up to 6; 1280×800 or 640×480 |
| Optional promotional tiles | 440×280 and 1400×560 | Keep branding honest; do not present a designed mockup as a product screenshot |

Sources: [Chrome image specification](https://developer.chrome.com/docs/webstore/images), [Edge listing fields](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension). Use genuine captures of the extension on the project's own video fixture, with any explanatory caption clearly separate. Do not reuse copyrighted video scenes or disclose account information.

## Single purpose and permissions

Suggested single-purpose statement:

> Let users manually position, customize and retain a local visual curtain over translated subtitles during video language practice.

Current source declares `storage` and `activeTab`, plus static content-script matches for HTTP/HTTPS pages and matching frames. Recheck the final manifest if this changes.

| Access | Submission explanation based on the current code |
| --- | --- |
| `storage` | Save the curtain's geometry, enabled/locked state and appearance by hostname, plus named appearance presets, in local browser storage. |
| `activeTab` | Route the user's toolbar action and settings to the active video webpage. No general browsing-history API is requested. |
| HTTP/HTTPS content-script matches | Draw the curtain on user-selected video pages, restore saved preferences and follow supported embedded player fullscreen. This is broad page access, even though a separate `host_permissions` array is absent. |
| Matching frames / related frames | Keep supported embedded players synchronized with the top site's configuration and display one curtain in tested iframe-container fullscreen. |
| Remote code | No remote runtime scripts, evaluation of downloaded code, paid API or server are part of the Chromium extension. Bundled source and user style JSON are validated locally. |

All-site page access may receive additional scrutiny. Explain the cross-site video tool and embedded-player behavior accurately; do not claim the extension requests no website access. [Chrome minimum-permission and data policies](https://developer.chrome.com/docs/webstore/program-policies/policies).

## Privacy questionnaire preparation

The extension uses the current website's hostname to select and persist a local configuration. Named presets and appearance preferences are also local data. It does not transmit this data to the developer, record a time-ordered browsing log, collect video/subtitle contents, inspect cookies, collect credentials, sell data or serve advertising.

Do not equate “no upload” with “no data handling.” Google's FAQ requires disclosure of local processing too, and includes domains in browsing activity. [Official privacy FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

Use the live form's definitions when choosing categories. If it covers local handling, disclose the domain/hostname use and user-created preset names; explain their limited local purpose. If a field explicitly asks about off-device transmission, the extension's transmission answer is none. Do not blindly select “no user data” for every question. The owner must confirm that answers match the final code and policy.

Suggested free-text disclosure:

> SubtitleCurtain stores only curtain preferences keyed by the current site's hostname and the user's named appearance presets in local browser storage. The hostname is used solely to restore that site's settings. These data are not transmitted to us, sold, used for advertising or used to build a browsing history. Preset JSON export is initiated by the user and creates a file on their device. No account is required.

Where requested, certify the Limited Use commitments only if they remain true for the submitted build: no sale of data, no use outside the disclosed purpose, and no creditworthiness use. Publish a policy explaining collection/use, retention and deletion, local domain keys, user-initiated export and the absence of transmission. The policy must be accessible before submission.

## Reviewer testing notes — English

No extension account or paid service is required. Use an ordinary HTTP/HTTPS video webpage; browser-internal pages and extension stores prohibit injection.

1. Install the submitted package, open a video webpage, then refresh it. Open the extension toolbar popup and enable Show curtain; first installation is hidden by default.
2. Drag the curtain, resize with its corner handle, and change width/height using the popup. Choose solid, gradient and pattern fills; adjust opacity and shape.
3. Lock the curtain and click its area. The underlying player should receive input. Unlock to edit again.
4. Hide and show the curtain; refresh the page. Saved geometry and appearance should return.
5. Open the appearance manager. Save, rename, update, apply and delete a preset. Applying a preset preserves geometry, enabled state and lock. Export JSON, delete the preset and import that file to restore it.
6. Use a supported player-container fullscreen mode. The curtain should remain visible. Direct native video fullscreen may restrict mouse editing; this is documented and must not be treated as a promise to support OS video windows or picture-in-picture.

Shortcuts on a video page: Alt+Shift+S toggles visibility; Alt+Shift+L toggles lock. When the unlocked curtain is focused, arrow keys move it; Ctrl/Command+arrow changes size. Editable inputs should retain their normal keyboard behavior.

## 审核测试说明 — 中文

扩展无需账号或付费服务。请在普通 HTTP/HTTPS 视频网页上测试，安装后刷新网页。首次默认隐藏，点工具栏图标并开启“显示遮挡条”。依次检查拖动、手柄缩放、宽高设置、纯色/渐变/花纹、不透明度、形状、锁定点击穿透、显示/隐藏与刷新恢复。管理窗口可新建、重命名、更新、应用、删除花色，并导入导出 JSON。应用花色应保留位置、尺寸、开关和锁定状态。

全屏请使用支持的播放器容器全屏。直接 video 元素的原生全屏可能限制鼠标编辑；画中画、系统视频窗口、浏览器内部页不在支持范围。快捷键及输入框保护按上方英文步骤测试。没有任何需要审核员输入私人账号、密码或付款的扩展功能。

## Release gate

- Confirm all runtime entry points and MV3/CSP checks pass, then run unit and real browser regression tests on the candidate.
- Extract both GitHub and store ZIPs; verify manifest, runtime and icon hashes match the tested source, with only documented packaging differences.
- Check the current public privacy/help links and checksum files.
- Keep Edge, Chrome, Brave/Opera manual installation, Safari preview and physical-device states separate.
- Record submission time, dashboard state and actual store URLs only after those events occur. Never replace a stable Release with an untested candidate.
