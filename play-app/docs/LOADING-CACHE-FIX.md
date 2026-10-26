# Loading at stage 6 — mixed cached releases

## Confirmed failure
On 2026-09-14, the live origin advertised `no-cache`, but Cloudflare returned JavaScript with `max-age=14400` (four hours) while HTML remained uncached. Returning browsers could therefore combine current HTML (no Workshop) with the older pre-removal `game.js`. That module attaches an onclick handler to the removed `buildBtn` after setting loading stage 6 and throws `Cannot set properties of null (setting 'onclick')`.

Browser reproduction with current unversioned HTML plus historical game module confirmed this error. The animated displayed counter can lag behind the stage target in fast local tests. This demonstrates the reported failure mechanism, not proof that every affected person's session had that exact error. No account data corruption was observed or inferred.

## Fix
Build emits one deterministic content version from all public JS/CSS/HTML. A complete import map pins all 137 modules (including transitive/dynamic imports and bare `three`) to that version. Entry script and stylesheet links use the same version. Changing any dependency changes the version across the graph; solo and multiplayer share it. Merely versioning entry.js is insufficient.

Node v2 preview now serves built HTML for root/index aliases, as production already does. Asset source files remain unchanged except clearer loading-error guidance. Cloudflare query-key isolation was checked: new `?v=` URLs miss old cache and fetch fresh bytes. No account, save, recovery or storage clearing is needed. Refreshing gets versioned HTML and the coherent new module graph.

Tests: version-helper deterministic/dependency-invalidation/map coverage; existing authenticated account + saved discovery, poison old unversioned game URL, actual cold load and warm reload, all requested game modules match one version, no old URL requests, no JS errors. Public production gate/version URLs and bytes checked without creating player accounts.
