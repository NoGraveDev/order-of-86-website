# The Order’s Trial — 86 × 86 Golden Labyrinth

The difficulty selector adds a true 86-by-86-cell maze: 7,396 rooms represented by a 173-by-173 wall/corridor grid. Seeded depth-first generation produces a connected perfect maze with a reachable boundary exit. Existing 9×9 and 13×13 difficulties remain unchanged.

Large mazes default to a readable follow window. Zoom buttons change the visible tile span; Full map shows the complete maze and Follow wizard restores navigation. A small overview marks the visible window, wizard and exit. Moving automatically returns from overview to follow mode. Keyboard and touch direction controls remain available. Large-maze sidebar controls are compact on iPad and top-aligned on phones.

Walls are drawn once into an offscreen canvas for each new/reset maze. Moving or zooming copies only the current viewport and draws the wizard/overview markers; idle animation updates only the timer instead of redrawing almost 30,000 tiles every frame.

Completed `maze86` runs save count, time, steps, seed and recent history through the existing account record store. The separate saved-time leaderboard is explicitly player-reported. Existing records are preserved; neither this difficulty nor the Violet Crossword introduces new XP grants. Crossword records use `{time, puzzle:'violet-words-v1'}` with count, best time and recent completions.

Tests: maze86 model connectivity, full legal solutions and viewport bounds across multiple seeds; minigame records/ledger categories; browser-maze86 actual approach,173grid,cache reuse,zoom/follow/overview,keyboard,screen widths320–1280,finish single-count/noXP. Full route solving is a model test; the browser completion assertion uses a final-corridor fixture. No production test accounts required.
