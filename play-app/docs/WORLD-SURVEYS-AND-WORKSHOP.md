# World surveys and paused Workshop — 2026-09-14

Order surveys now award **50 Order XP per complete eight-stop circuit**: all seven realm landmarks, then the Ancient Oak in the Starter Lands. A stride-three route crosses the map between realms; the starting realm rotates with each completion. The spellbook and completion notices derive their totals/reward from the same shared progression state used by the server. This is XP, not XRP currency.

Existing completed surveys retain their earned XP, levels, upgrades and loadouts. Legacy contract records without `xp` normalize once to `completed * 800`; unfinished old three-stop progress restarts at zero. New completions increment the explicit ledger by 50. Read normalization is idempotent, with persistence on the next shop action. Existing account save protection, compare-and-swap revisions, distance checks and replay/cooldown rejection remain. No bulk database rewrite or player reset.

Workshop is absent from runtime HTML, desktop/mobile menus, B shortcut, and game initialization. Its original dialog and code are preserved in `docs/retired-workshop/`. Keep them together when restoring; re-add the navigation/mobile/rpg entry and keyboard binding then. The empty placed-object group stays for shared spell/world interfaces. No exported player files were changed or deleted.

Verification: build; Order mastery client/server (including old saves and account restart), starter XP routing, spellbook server, Order spells, dedicated world-survey regression. Browser script `scripts/browser-world-survey.cjs` checks full circuit, exact award and reload, menus at 1280/390/320, shortcut removal and JS errors. Browser automation positions the player at landmarks for the reward check; not a manual full-map traversal.
