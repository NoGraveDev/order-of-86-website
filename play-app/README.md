# Order of 86 production game snapshot

Independent runtime snapshot of Pawtheon v2 commit `acf203a66fb90f9fac4938bb044e35c1b2a3971b` (2026-09-13). The Pawtheon development repository, running preview and database were not changed or copied. This copy changes only hosting paths and account-cookie scope, not gameplay.

## Parent server integration

Node 22.13+ is required (`node:sqlite`); Node 22.22 is suitable.

Build: `npm ci --prefix play-app && npm run build --prefix play-app`.

From CommonJS, dynamically import `./play-app/server.mjs`, then `await createPlayHandler()`. Call the returned async `(req,res)` handler for `/play` and `/play/*` before website polling rate limits or static routing. It returns `true` when handled. `handler.close()` closes the database for shutdown. `initializePlay()` also exports `{handle,close}` for tests.

`PLAY_DB_PATH` must be an absolute dedicated persistent mounted path, e.g. `/data/pawtheon.sqlite`. There is deliberately no ephemeral default. In production its parent directory must already exist before startup, avoiding silently creating a missing mount path. This cannot establish whether a real persistent volume is mounted: verify the hosting volume configuration before deployment. One running application replica should own this SQLite volume. Back up the SQLite database consistently (SQLite backup API or after stopping writes), including WAL-aware handling; do not copy a running database file alone.

Never serve `play-app/` through the website's broad static file handler. Public game files are exclusively `play-app/dist/client`, routed by this handler. Parent process must preserve raw request bodies for the game API. Railway's trusted proxy should provide `X-Forwarded-Proto` so HTTPS session cookies remain Secure and original-origin CSRF checks match.

Production begins with a fresh database. Existing dev usernames/progress are not transferred. Browser guest saves belong to their origin. Development changes do not automatically update this frozen copy.

Routes: `/play` redirects to `/play/`; solo `/play/`; private rooms `/play/multiplayer`; APIs `/play/api/accounts/*` and `/play/api/multiplayer/*`. Account cookie is `paw_play_session`, `Path=/play/`, HttpOnly/SameSite Strict, Secure on HTTPS.

The existing Worker logic executes through the established D1-compatible SQLite adapter. All SQL migrations 0000–0007 apply on initialization. Cloudflare Workers are not the chosen runtime: their PBKDF2 iteration restrictions require separate investigation before using this account implementation there.

## Verification

`node play-app/tests/subpath.mjs` from repository root, or `node tests/subpath.mjs` inside this directory. Creates and removes an isolated temp database and localhost server. Checks subpath entries/assets, JS MIME/ETag, account signup/cookie isolation, CSRF rejection, room creation and restart persistence. Does not touch dev or production saves.

Parent release verification should additionally open the actual game in a browser, inspect console/network errors, use two room clients, confirm invitation and leave routes, sign in/save/reload, and confirm the original website pages remain intact.
