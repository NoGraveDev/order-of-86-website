# Account-required play — 2026-09-14

Entry now runs `entry.js` instead of the WebGL loader. Visitors must create an account or sign in, then explicitly choose Single Player or Multiplayer. The world loader, Three.js and model requests start only after that choice and a fresh session check. Returning accounts see the choice again. Direct multiplayer/invitation URLs pass through the same entry; the invitation survives sign-in and multiplayer selection.

Mode changes across solo/multiplayer paths use a one-use sessionStorage choice tied to the account and expiring after 30 seconds. No persistent guest mode or remembered auto-entry. Account UI is initialized once and reused in-game. Existing saves, account recovery and one-time older browser-save import remain; no accounts, saves or guest source data are deleted.

The game itself checks account/entry authorization, and session-mode storage no longer falls back to guests. Expired or switched sessions lock and pause the world with a sign-in screen. Visible-page session checks run every 30 seconds and on focus/authorization failures. Temporary offline failures do not erase account identity/drafts or enable guest play.

Every multiplayer API operation requires a current account. Existing bearer tokens additionally must belong to `account:<current ID>` via the membership table; old guest tokens and other accounts' tokens are rejected. Room display names are account-owned. Session health endpoint remains anonymous/read-only with `user:null`. No schema or production data migration.

Regression tests: `tests/account-required.mjs`, `tests/accounts.mjs`, `tests/public-lobbies.mjs`, `tests/order-mastery-server.mjs`. `scripts/browser-account-entry.cjs` exercises signup, login, pre-load gate, direct invitation, mode navigation, multiplayer join/leave, sign-out and expiry with a throwaway local test account. Never run signup test on production without cleanup; public gate can be checked anonymously without test accounts.
