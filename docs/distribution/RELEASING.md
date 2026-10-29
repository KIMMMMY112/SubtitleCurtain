# Release process

Use a single source commit for the Chromium manual-install ZIP, store-upload ZIP and Safari preview. Never overwrite an existing stable release to hide a failure.

1. Update the numeric version in manifest.json, package.json, package-lock.json and popup label. Keep userscript `@name` and `@namespace` stable.
2. Run `npm run check`, real-browser regression, `npm run test:webkit`, `npm run package`, `npm run package:safari`, `npm run build:site`, `npm run check:artifacts` and website QA. Record exact versions, modes and physical-device limits.
3. The Chromium **Store** ZIP has manifest.json at its root and only runtime/core/UI/icons plus LICENSE and privacy. The **Chromium** ZIP additionally includes ordinary-user instructions. Compare runtime hashes between both. Do not upload the entire source repository to a store.
4. GitHub userscripts have a metadata endpoint (`userscripts/SubtitleCurtain.meta.js`) and a download endpoint (`userscripts/SubtitleCurtain.user.js`) on main. Validate both are public, version-matched and preserve identity after publishing. Metadata correctness does not prove every manager auto-updates.
5. `dist/greasyfork/SubtitleCurtain.user.js` contains the same runtime, without GitHub update/download directives. Greasy Fork supplies its own links. Publish a single original listing; do not repost copies for ranking. Record its real URL in distribution.json only after publication.
6. Stable Chromium tag: `vX.Y.Z`. Safari preview tag: `vX.Y.Z-safari-preview.N`, marked prerelease and not latest. Keep iOS device status pending until actual results exist. Upload checksum files with the exact built bytes; verify downloaded assets.
7. GitHub Pages deploys `site/` from the same public repository via Actions. Pages setting: Source → GitHub Actions. No domain or hosting purchase is required. Add the homepage to repository metadata only after the public deployment is verified.
8. Edge/Chrome stores require publisher-controlled onboarding and review. Do not invent store URLs or select privacy questionnaire responses without matching the code and published policy. Never pay a fee without explicit user authorization.

The workflow files prepare repeatable CI, packaging and Pages publication. Website download versions are centralized in distribution.json; update only to actual release names. Keep all GitHub installation channels even after store publication.
