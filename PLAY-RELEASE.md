# Pawtheon /play production release

Prepared 2026-09-13 from website production commit `6f9d440` and Pawtheon v2 commit `acf203a66fb90f9fac4938bb044e35c1b2a3971b`.

## Isolation

- Independent vendored snapshot under `play-app/`; no git submodule, dev server proxy or automatic v2 updates.
- Existing website HTML and assets unchanged. `/play` redirects to `/play/`; multiplayer is `/play/multiplayer`.
- Game assets/API stay under `/play/`; account cookie is `paw_play_session`, scoped to `/play/`.
- New production database: no development accounts, passwords, saves or test data copied.
- Runtime source cannot be served by the website's static handler.

## Hosting prerequisites — do before merging to main

1. Restore Railway authentication externally or via protected credential entry. Saved CLI login is unauthorized; protected entry returned no answer.
2. Identify the existing service for theorderof86.com; retain its domain and existing settings.
3. Attach a persistent Railway volume at `/data` and set `PLAY_DB_PATH=/data/pawtheon.sqlite`. Verify actual volume attachment, not merely environment configuration. Keep one replica for SQLite. Arrange volume backups.
4. Confirm service uses this repository and main branch, root Dockerfile, with no old conflicting build/start override. Node 22.22.3 is required for native SQLite.
5. Merge the prepared release to main and push via GitHub; Railway auto-deploys. Do not use railway up/redeploy.
6. Verify public homepage and existing routes, `/play/`, assets, account save/reload and two-player room. Verify account/save persists across a subsequent controlled deployment before declaring production persistence proven.

Dockerfile prepared; Docker is unavailable locally, so Linux container build is not verified. Production must not launch without an existing database parent directory. This catches absent `/data`, but cannot itself prove persistence.

## Local verification

`npm ci`, `npm run build`, `node play-app/tests/subpath.mjs`.

Start with an isolated absolute test database path:
`PLAY_DB_PATH=/tmp/order86-play-verification.sqlite PORT=8065 node server.js`

Browser audit PASS: desktop WebGL, signed-in room creation, two-client desktop/mobile multiplayer, mobile layout and leave-to-solo routing; zero JS errors or failed HTTP responses. First audit reached both-player verification but attempted the mobile room control outside its Menu; test navigation corrected and rerun passed.

Browser audit: `node release-verification/browser.cjs` uses local Chrome/Playwright from agent-browser. Artifacts stay in release-verification. It creates disposable accounts only in the test database and never logs credentials/invites.

The workspace pre-deploy script was run with only its target directory changed to this checkout. JS/files/headers/rate limiter checks passed. Its startup check depends on unavailable timeout; real combined server startup verified separately. Its old images/dogs path no longer matches production's image structure (102 PNGs beneath images). Its secret keyword matches are unchanged lore prose containing “secrets,” not credentials. No production HTML modified.

Dependency audit: root and pared-down game dependencies show zero vulnerabilities. Unused Drizzle generation tooling removed only from release package; SQL migrations remain intact.

## Updates and rollback

Future v2 changes require an explicit release into this snapshot; source v2 continues separately. Never copy live production SQLite into Git. Before future migrations, back up production volume. Code rollback uses the prior website commit; retain the game volume and do not delete production data. Current release has not been deployed.
