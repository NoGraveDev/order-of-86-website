# Pawtheon corrected-canon website release — 6 October 2026

- Updated gallery/server wizard profiles, map records and biographies, and Studio names from the corrected ID-keyed86registry. Existing ownership, marketplace links and images are retained.
- Corrected Umbra:14-day cycle,13Arcane seats. Wanderer is unaffiliated and resonates with all seven moons. Pink Eyes and pink Roseglow remain distinct from Magenta Dream hats.
- Updated map descriptions/native breeds and Starter Lands direct-channel distinction without changing the map's visual adaptation.
- Replaced the Lore placeholder with23readable documents:18corrected Codex folios, continuity contract, directory, creatures, and two confirmed chapters. Original chapter downloads are byte-identical to the approved files; chronology distinctions live in the companion.
- Public asset query versions changed so returning clients receive the new identity data. No changes to play-app, accounts, saves, schema or production volume.

## Verification

- All86records match corrected source identity and biography; all86portrait images exist. Order counts18/12/13/18/13/11+1 verified.
- Website inline JavaScript syntax and data modules pass.
- Desktop1440px and mobile390px Lore navigation/layout, chapter/document cards, corrected #6502profile, gallery, 3D map and orrery render; no browser page errors.
- Source-hashes.json verifies18Codex source copies, contract and both original chapters byte-for-byte.
- Standard predeploy script run against this release checkout: JS, requiredfiles, headers and limiter pass. Legacy warnings: timeout command absent (real server independently booted), old images/dogs path (actual86image paths verified), “secret” keywords in unchanged lore prose (not credentials).
- Isolated local test database only. Production data untouched. Release build verified before push.
- GitNexus skill read. Release checkout has no index and no MCP context resource available; direct import/reference and browser analysis used.
