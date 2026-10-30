# Platform and release status

Audit date: 2026-10-29. This file distinguishes published evidence from prepared work. Check GitHub Releases/Actions for the final publication result; do not infer that a local build is already online.

## Existing releases

- **v0.1.0 Chromium stable**: published GitHub ZIP. Historical macOS arm64 Chrome, Edge, Brave and Opera each passed 28 browser checks. Chrome Bilibili (5 checks) and YouTube (3 checks) records are scoped to those pages and that version.
- **v0.2.0-safari-preview.1**: published userscript, directory fallback and uncompiled native-resource ZIP. Shared controls/GM storage, visual viewport and Safari fullscreen events. 20 unit checks, Chrome 28 regression, WebKit 30 across three viewport sizes; native Mac Safari observations are listed separately.
- **iPad report**: Userscripts opens, but no install prompt or no SubtitleCurtain entry. Directory kit supplied; the remedy has not been verified on iPad. iPhone/iPad are not passed.

## v0.2.1 work

| Channel | Status before publication | Evidence / remaining gate |
| --- | --- | --- |
| Chromium GitHub | Build and regression candidate | Preserve v0.1.0; publish a new tag only after checks. |
| Chrome 156.0.8078.49 / macOS arm64 | 28/28 release-source regression passed | [Raw record](test-results/chrome-v0.2.1.json); no broader website claim. |
| Edge / Brave / Opera current | Same core and package; separate retest needed | v0.1.0 evidence remains historical until a current browser run is recorded. |
| Safari Userscripts | Preview; metadata and folder kit prepared | 30/30 WebKit viewport checks passed with GM test bridge; real manager upgrade and physical iOS remain pending. |
| iPhone / iPad Safari | Pending physical devices | Keep existing iPad installation report. |
| Edge Add-ons | Submission materials prepared | Publisher account, agreements/identity verification, final submission and store review required. |
| Chrome Web Store | Submission materials prepared | Publisher account/registration fee if not already enrolled, final submission and review required. No payment authorized. |
| Greasy Fork | Self-contained build and listing text prepared | Account/login and publication required; no live listing URL yet. |
| GitHub Pages | Static bilingual site and workflow prepared | Configure Pages source, deploy and verify public URL. |

No native signed Apple app, Firefox task, paid API or server has been added. Store and GitHub packages contain identical runtime files. Fullscreen modes and test-bridge/mobile-viewports remain explicitly distinguished.

## Current local verification

22 unit tests, manifest/CSP/local-runtime checks, Chrome 28 browser cases, WebKit 30 viewport cases and website 7 interaction/layout cases passed. Package runtime parity, userscript channel identity, folder ZIP and checksums are checked separately. Website desktop/tablet/mobile layout is browser emulation, not physical-device evidence. Authentic media provenance is in [media/README.md](media/README.md).

The built Store ZIP was also loaded as a separate real Chrome extension and passed all 28 checks on Chrome 156.0.8078.49. [Record](test-results/chrome-store-v0.2.1.json).

## Publication pipeline verification

[GitHub Actions run 40980754658](https://github.com/KIMMMMY112/SubtitleCurtain/actions/runs/40980754658) executes source checks, Chromium extension regression, WebKit viewport tests, website tests and archive/checksum parity before publication. Raw CI records are in docs/test-results/ci-*-v0.2.1.json. Actual store review, physical iOS and real manager-upgrade tests remain pending.
