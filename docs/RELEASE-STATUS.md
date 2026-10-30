# Platform and release status

Updated: 2026-10-30. Published links below were verified after release. Physical-device acceptance and store review remain separate from build and publishing success.

## Existing releases

- **v0.1.0 Chromium stable**: published GitHub ZIP. Historical macOS arm64 Chrome, Edge, Brave and Opera each passed 28 browser checks. Chrome Bilibili (5 checks) and YouTube (3 checks) records are scoped to those pages and that version.
- **v0.2.0-safari-preview.1**: published userscript, directory fallback and uncompiled native-resource ZIP. Shared controls/GM storage, visual viewport and Safari fullscreen events. 20 unit checks, Chrome 28 regression, WebKit 30 across three viewport sizes; native Mac Safari observations are listed separately.
- **iPad report**: Userscripts opens, but no install prompt or no SubtitleCurtain entry. Directory kit supplied; the remedy has not been verified on iPad. iPhone/iPad are not passed.

## v0.2.1 publication

| Channel | Current status | Evidence / remaining gate |
| --- | --- | --- |
| Chromium GitHub | [v0.2.1 stable published](https://github.com/KIMMMMY112/SubtitleCurtain/releases/tag/v0.2.1) | Manual, Store and Publisher Materials ZIPs published; all downloaded SHA256 values verified; Store runtime matches tested source. v0.1.0 preserved. |
| Chrome 156.0.8078.49 / macOS arm64 | 28/28 release-source regression passed | [Raw record](test-results/chrome-v0.2.1.json); no broader website claim. |
| Edge / Brave / Opera current | Same core and package; separate retest needed | v0.1.0 evidence remains historical until a current browser run is recorded. |
| Safari Userscripts | [GitHub preview published](https://github.com/KIMMMMY112/SubtitleCurtain/releases/tag/v0.2.1-safari-preview.1) and [Greasy Fork published](https://greasyfork.org/en/scripts/602877-subtitlecurtain) | 30/30 WebKit viewport checks passed with GM test bridge. Hosted GF body matches tested source after metadata rewriting. Actual manager upgrade and physical iOS remain pending. |
| iPhone / iPad Safari | Pending physical devices | Keep existing iPad installation report. |
| Edge Add-ons | Submission materials prepared | Publisher account, agreements/identity verification, final submission and store review required. |
| Chrome Web Store | Submission materials prepared | Publisher account/registration fee if not already enrolled, final submission and review required. No payment authorized. |
| Greasy Fork | [Public version 0.2.1](https://greasyfork.org/en/scripts/602877-subtitlecurtain) | Installation page and rewritten metadata/download URLs verified. iOS installation behavior is not marked passed. |
| GitHub Pages | [Public site deployed](https://kimmmmy112.github.io/SubtitleCurtain/) | GitHub Actions deployment passed; homepage/privacy return HTTPS success. English/Chinese browser-specific installation, real media and FAQ are available. |

No native signed Apple app, Firefox task, paid API or server has been added. Store and GitHub packages contain identical runtime files. Fullscreen modes and test-bridge/mobile-viewports remain explicitly distinguished.

## Current local verification

22 unit tests, manifest/CSP/local-runtime checks, Chrome 28 browser cases, WebKit 30 viewport cases and website 7 interaction/layout cases passed. Package runtime parity, userscript channel identity, folder ZIP and checksums are checked separately. Website desktop/tablet/mobile layout is browser emulation, not physical-device evidence. Authentic media provenance is in [media/README.md](media/README.md).

The built Store ZIP was also loaded as a separate real Chrome extension and passed all 28 checks on Chrome 156.0.8078.49. [Record](test-results/chrome-store-v0.2.1.json).

## Publication pipeline verification

[GitHub Actions run 40980754658](https://github.com/KIMMMMY112/SubtitleCurtain/actions/runs/40980754658) executes source checks, Chromium extension regression, WebKit viewport tests, website tests and archive/checksum parity before publication. Raw CI records are in docs/test-results/ci-*-v0.2.1.json. Actual store review, physical iOS and real manager-upgrade tests remain pending.

## Verified public distribution

- [Release pipeline](https://github.com/KIMMMMY112/SubtitleCurtain/actions/runs/40980754658): passed source/unit checks, real Chrome, installed Store ZIP, WebKit viewport, website and package checks before publishing.
- [Merged main pull request](https://github.com/KIMMMMY112/SubtitleCurtain/pull/2). The previous Safari pull request is now merged as part of the same history.
- [First Pages deployment](https://github.com/KIMMMMY112/SubtitleCurtain/actions/runs/40981243154): successful.
- GitHub and Greasy Fork metadata retain name/namespace/version 0.2.1 and separate channel-owned update endpoints. This verifies distribution contracts, not unattended updates in every manager.
