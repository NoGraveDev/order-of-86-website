# Private site and game metrics

Collection begins with this deployment; historical active game time cannot be reconstructed from Cloudflare request counts. Cloudflare traffic/Web Analytics and this tracker measure different things. No Cloudflare account report was read or changed.

The browser script records page visits using a random first-party localStorage browser identifier. No names, account IDs, IP addresses, query strings, hashes/invitations or chat messages are stored. IP is used only in a transient ingress rate limiter. Browser ID resets when storage is cleared; different devices/browsers count separately. Ad blockers, Global Privacy Control, storage denial and disabled JS can undercount; automated clients can inflate counts. These are estimates, not verified human counts.

Active game time counts only `/play` pages with a loaded canvas, no loading overlay, visible focused document and input within the last 60 seconds. Heartbeats every 15 seconds; page hide attempts a final beacon. Small sampling/unload/network losses are possible. Reloads/navigation create new visits. Duplicate and out-of-order heartbeats do not double-count. No raw keyboard or pointer data leaves the browser. Set localStorage `order86-analytics-opt-out` to `1` to disable collection in a browser.

## Read reports (private Railway access only)

From linked release checkout:

```
railway ssh node /app/analytics/report.mjs 7
railway ssh node /app/analytics/report.mjs 30
```

Returns pageViews, browserVisitors, gameVisits, activePlayers, activePlayMinutes, averageActiveMinutesPerPlayedVisit and daily totals. UTC dates; whole visit/time attributed to its starting date. Active players are unique browser IDs with >0 active time. Average excludes visits with zero active time. Reports are not served on a public URL. Ask the agent for a report anytime.

Storage: `/data/site-analytics.sqlite`, on the existing persistent Railway volume, separate from game saves. Can override with ANALYTICS_DB_PATH. Reporting and tracker use SQLite WAL. Do not commit databases or export browser IDs publicly. SQL schema created additively. No data imported from development.

Tests: `node analytics/test.mjs`, `node analytics/client-test.cjs`, `node release-verification/metrics-browser.cjs`. Public browser check intentionally adds a real test visitor/game visit; it is not a customer. Browser smoke check takes approximately 30 seconds. Public request-count reports may include older activity but cannot yield historical active time.
