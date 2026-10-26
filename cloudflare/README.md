# Cloudflare migration

## Runtime

Worker Static Assets hosts the site and `/play/` client. The existing game Worker
remains authoritative; the wrapper preserves `/play/api/`, cookies and Origin
checks. D1 stores the existing game tables plus analytics `visits`. All 86 wizard
pages and native-canvas OG images are pre-rendered during build.

Only an explicit public-file allowlist is published. Database exports, backend
source, `.blend` source models and metadata are excluded. The request guard also
blocks private paths before asset lookup.

Workers **Paid** is required. Existing accounts use PBKDF2-HMAC-SHA256 with 600,000
iterations, above the deployed Workers native API's 100,000 limit. The Cloudflare
adapter uses @noble/hashes with identical output, not fewer iterations. Native
Railway tests keep their existing Web Crypto implementation. CPU cap is 30 seconds.
The browser/game assets are unchanged; this does not publish the bookshelf prototype.

## Build and verification

From repository root:

```
npm ci --prefix cloudflare
node cloudflare/build.mjs
npx --prefix cloudflare wrangler dev --config cloudflare/wrangler.staging.json --port 8791
node cloudflare/verify.mjs http://localhost:8791
node cloudflare/verify-metrics.mjs http://localhost:8791
```

Use only a staging database for mutating verification. `verify.mjs` creates a test
account and room. Never import the staging database back into production.

## Current state (2026-10-21, migration complete)

- Production serves entirely from Cloudflare Worker `order86-private-file-guard`
  (legacy name retained to atomically upgrade the existing route) and D1
  `order86-production`. There is NO Railway origin fetch in this Worker.
- Production version: `b60a9be5-7df5-478e-9cda-058928e232e0`.
- Workers Paid enabled by the owner. Maintenance is OFF.
- All 18 source tables matched the final import before opening writes: 43 accounts,
  11 session records, saved progress, trades, records and 1,554 analytics visits.
- Final consistent snapshots and verified D1 export are private at
  `~/.openclaw/private-backups/order86-20261021-final-1736/`.
- Remote staging AND real-domain tests passed: 22 route/account/save/multiplayer
  checks, plus metrics validation. Browser signup, sign-in/session restoration,
  entry menu and single-player world loaded without browser errors. Native account,
  public-lobby concurrency, subpath and persistence suites passed as well.
- Railway deployment `62e14d0e-528f-4cb2-900d-c6593e6965b4` is REMOVED; direct
  origin `/server.js` returns 404. GitHub source is explicitly disconnected
  (`repo:null`, `branch:null`) using Railway CLI 5.71.0. Keep its volume and domain
  reservation intact.
- Unused staging and attempted-custom-domain Workers were removed. The staging D1
  database remains available for future isolated testing, never for production.
- The proxied DNS record retains its Railway target because Cloudflare's custom
  domain API refused to replace externally managed DNS. Worker routes intercept
  every request and serve Cloudflare assets/D1 without using that target. Do not
  delete the reserved Railway service/domain before replacing this DNS record.

## Routine deployment

GitHub is the source of truth; Cloudflare currently deploys via the authenticated
Wrangler CLI, NOT the old Railway GitHub integration. After checks:

```
node cloudflare/build.mjs
npx --prefix cloudflare wrangler deploy --config cloudflare/wrangler.json
```

Verify the domain after deployment. Do not use the old security-report guard-only
config: it would replace the full production application with the former proxy.

## Cutover checklist

1. Deploy corrected staging Worker and run remote tests. Compare account/hash/save
   parity and inspect the browser client. Verify metrics and private paths.
2. Production config starts with `MAINTENANCE=true`; deploy only at the announced
   maintenance window. It upgrades the existing `order86-private-file-guard` Worker route to serve
   the whole application. No origin fetch remains. The existing proxied DNS
   record is retained; the custom-domain API refused to replace externally
   managed DNS. Keep the old Railway service/domain owned (but deployment
   stopped) until this legacy DNS target is replaced. Do not delete the service.
3. Pause source application writes (including direct-origin traffic); identify the
   actual application PID before any signal. Preserve a clear resume command.
   Do not take a raw copy of a WAL-mode database; use `migrate-data.py --label`
   with a new unique label to create consistent SQLite snapshots.
4. Import the final SQL into the EMPTY production D1. Export it privately and
   compare all source tables/counts/rows. Never print credential/session records.
5. Set `MAINTENANCE=false`, deploy, and verify real domain assets, anonymous session,
   accounts with a dedicated test account, saving, CSRF, multiplayer and telemetry.
6. Only after production verification, retire the old Railway deployment (not the
   persistent volume) and disable GitHub auto-deploy for that old service. Verify
   the direct origin no longer serves source or accepts game writes. Keep backups.
7. Remove staging/test resources when no longer needed. Record final commit,
   Worker version, database checks, and rollback details.

## Rollback

Before Cloudflare accepts production writes, the original Railway data remains
canonical: resume the source process and restore the prior DNS/edge-guard mapping.
After Cloudflare accepts writes, do NOT simply point back to old Railway SQLite:
freeze writes and migrate the latest D1 data back first, or progress will be lost.
Keep the Railway volume and final snapshots until the migration is established.

The SQL exports contain private account/session data. Never commit or publish them.
