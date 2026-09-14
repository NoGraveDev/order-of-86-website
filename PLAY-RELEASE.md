# Pawtheon /play production release

Prepared 2026-09-13 from website production commit `6f9d440` and Pawtheon v2 commit `acf203a66fb90f9fac4938bb044e35c1b2a3971b`.

## Isolation

- Independent vendored snapshot under `play-app/`; no git submodule, dev server proxy or automatic v2 updates.
- Existing website HTML and assets unchanged. `/play` redirects to `/play/`; multiplayer is `/play/multiplayer`.
- Game assets/API stay under `/play/`; account cookie is `paw_play_session`, scoped to `/play/`.
- New production database: no development accounts, passwords, saves or test data copied.
- Runtime source cannot be served by the website's static handler.

## Hosting configuration (completed September 13, 2026)

1. Railway authentication restored by Adam on the Mac mini.
2. Identify the existing service for theorderof86.com; retain its domain and existing settings.
3. Attach a persistent Railway volume at `/data` and set `PLAY_DB_PATH=/data/pawtheon.sqlite`. Verify actual volume attachment, not merely environment configuration. Keep one replica for SQLite. Arrange volume backups.
4. Confirm service uses this repository and main branch, root Dockerfile, with no old conflicting build/start override. Node 22.22.3 is required for native SQLite.
5. Merge the prepared release to main and push via GitHub; Railway auto-deploys. Do not use railway up/redeploy.
6. Verify public homepage and existing routes, `/play/`, assets, account save/reload and two-player room. Verify account/save persists across a subsequent controlled deployment before declaring production persistence proven.

Railway Linux Docker build passed and first production deployment succeeded. SSH confirmed /data is a mounted ext4 device. Production must not launch without an existing database parent directory. This catches absent `/data`, but cannot itself prove persistence.

## Local verification

`npm ci`, `npm run build`, `node play-app/tests/subpath.mjs`.

Start with an isolated absolute test database path:
`PLAY_DB_PATH=/tmp/order86-play-verification.sqlite PORT=8065 node server.js`

Browser audit PASS: desktop WebGL, signed-in room creation, two-client desktop/mobile multiplayer, mobile layout and leave-to-solo routing; zero JS errors or failed HTTP responses. First audit reached both-player verification but attempted the mobile room control outside its Menu; test navigation corrected and rerun passed.

Browser audit: `node release-verification/browser.cjs` uses local Chrome/Playwright from agent-browser. Artifacts stay in release-verification. It creates disposable accounts only in the test database and never logs credentials/invites.

The workspace pre-deploy script was run with only its target directory changed to this checkout. JS/files/headers/rate limiter checks passed. Its startup check depends on unavailable timeout; real combined server startup verified separately. Its old images/dogs path no longer matches production's image structure (102 PNGs beneath images). Its secret keyword matches are unchanged lore prose containing “secrets,” not credentials. No production HTML modified.

Dependency audit: root and pared-down game dependencies show zero vulnerabilities. Unused Drizzle generation tooling removed only from release package; SQL migrations remain intact.

## Updates and rollback

Future v2 changes require an explicit release into this snapshot; source v2 continues separately. Never copy live production SQLite into Git. Before future migrations, back up production volume. Code rollback uses the prior website commit; retain the game volume and do not delete production data. Initial production deployment succeeded as fd075bf. Public homepage/map/content/moons and game entry/module bytes matched the verified release. Production save creation succeeded. A follow-up documentation/verification deployment will validate persistence across container replacement.


## Public multiplayer release — September 13, 2026

Added one-click public matchmaking, filling lobbies up to 8 players and automatically opening additional lobbies. Private invitations remain available and isolated. Reservation is transactional; disconnected boat racers retain their reconnect-grace seats. New idempotent public-room metadata migration preserves existing accounts and saves.

Verification: build and `/play` subpath/account persistence tests pass, including 17 concurrent HTTP joins partitioning 8/8/1. Worker/SQLite suite passes 65 concurrent joins (eight full lobbies plus one), private isolation, full-room rejection, refill, stale leases, boat reconnect reservation, restart and expiry. Source v2 desktop/mobile browser checks passed locally and on its public preview before this production release.

## Spellbook survey rebalance and Workshop retirement — September 14, 2026

Ported v2 commit `0d21980` into the independent `/play` snapshot. Order surveys now require eight distinct stops covering all seven Order realms and Starter Lands, with cross-map ordering, and award 50 Order XP per complete circuit. Legacy survey rewards normalize to the corrected rate and old partial three-stop progress resets. Build/Workshop buttons, keyboard shortcut and builder runtime are removed; source/markup are preserved under `play-app/docs/retired-workshop/` for a future restoration. Existing multiplayer compatibility interfaces remain intact. No database schema migration.

Release build and local world-survey, Order mastery, authoritative server, and `/play` subpath/account-save/restart/public-lobby regression tests passed. Existing website content, analytics, API routing and scoped account cookies are unchanged.

## Account-required entry — September 14, 2026

Ported source `b67bdcd`. The independent `/play` snapshot now starts with a lightweight account gate followed by an explicit Single Player / Multiplayer choice. World/Three.js/model loading is deferred until authenticated mode selection; direct multiplayer links use the same gate. Expired/switched sessions lock the running world. Multiplayer APIs require a valid account and account-bound membership tokens; prior guest tokens cannot be adopted. Existing scoped account cookies, saves, recovery and older-save import are retained. No database schema migration.

Release build and isolated `/play` API/account-save/restart tests pass, including anonymous rejection of every multiplayer action, 17 authenticated simultaneous joins split 8/8/1, account ownership and 65-player public lobby regressions. Public account session remains an anonymous health endpoint.

## Returning-player cache compatibility — September 14, 2026

Ported source `91f66b1`. Cloudflare publicly applies a four-hour JavaScript browser cache lifetime despite the origin's revalidation header. A cached pre-Workshop-removal game module can consequently run against current HTML and fail after loading stage 6. Each generated game page now pins the complete 137-module import graph, bare Three.js import, entry script and CSS to one deterministic content hash. Relative/dynamic imports resolve through the generated import map. Both solo and multiplayer use the same build version; the website's separate analytics script remains unchanged. Saved accounts, local drafts and discoveries are not cleared or migrated.

Build/static versioning and release subpath/account-save/restart/guest-denial tests passed. Versioned query URLs were independently confirmed to get distinct fresh Cloudflare cache entries.

## Navigation HUD and complete mini-game playbook — September 14, 2026

Ported v2 `4439588` / `4bd6b2b`: camera-driven compass bearings, compact expandable lobby panel above the minimap on desktop/iPad, and seven mini-game leaderboard categories with personal Boat/Lava records. Server-owned Chess/Boat/Lava results are separated from clearly labeled player-reported Sled/Maze/Solo Boat saved times. Additive `0009_minigame_results.sql` retains authoritative outcomes and finishers' identities beyond room cleanup. No accounts/saves were cleared. Older unrecorded Boat/Lava finish histories cannot be reconstructed; existing solo personal bests remain.

Production backup created before migration: `/data/backups/pre-minigame-ledger-1789416734048.sqlite`, permissions 0600. The first backup attempt rejected double-quoted SQL path without writing a backup; corrected parameter binding succeeded. Release tests passed: ledger replay/tie/quit/score-rejection/leave-before-settlement/room-cleanup/restart, personal records, compass bearings, subpath/accounts and full desktop/iPad navigation plus seven-board record UI/reload browser checks. Initial record browser fixture used a nonexistent mobile selector; corrected sole retry passed. No production test accounts created.

## Violet Crossword and 86 × 86 Labyrinth — September 14, 2026

Added the Violet Highlands themed crossword and true 86 × 86 Golden Labyrinth difficulty. Large mazes have zoom/follow/full-map views, a compact overview and cached static rendering; existing9/13 difficulties are retained. Crossword draft/reopen and completed records persist to the account's existing storage. Both new categories appear in personal records and explicitly player-reported saved-time leaderboards (nine categories total), with no new XP grants or schema migration.

V2 and release browser checks passed for crossword discovery/12clues/crossings/incorrect+complete/draft/singlecount and mobile layouts, plus maze173grid/cache reuse/zoom/follow/overview/keyboard/desktop+iPad+phone/finishrecord. Connectivity and complete legal maze paths are separately covered by model tests. No production data cleared or test accounts created.
