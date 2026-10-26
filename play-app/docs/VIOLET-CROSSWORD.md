# Violet Crossword

A glowing letter tablet in Violet Highlands, at `violetPoint(-25,510)`, adds a 12-word connected crossword. It is listed with the realm locations. Walk within 12m and use the Violet Crossword button or E. Existing realm/creature names supply the clues; no new lore or economy is introduced.

Choose a clue or a grid square, type the complete answer and press Enter. Shared crossing squares update together. Check puzzle reports the number correct without revealing answers. All twelve words must match before one completion is recorded. The same fixed puzzle may be restarted; its saved-time leaderboard is player-reported, with no XP or prizes.

Grid scrolls on smaller screens; clue buttons and answer entry stay usable on touch devices. Keyboard entry, labels, focus restoration and modal world-input blocking follow existing minigames. An account-private device draft stores entered letters, active play time and completed status across close/reload. Completion history uses the existing cloud minigame records. No schema migration.

Verification: `node tests/violet-crossword.mjs`, `node tests/violet-highlands.mjs`, local-only `scripts/browser-violet-crossword.cjs` with disposable account/database. Browser checks actual world approach, wrong answers, twelve correct clues, shared crossings, draft reopen, one completion despite repeat checks, personal record, and 320–1440px layout bounds.
