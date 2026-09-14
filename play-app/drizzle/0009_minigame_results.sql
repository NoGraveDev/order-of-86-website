CREATE TABLE IF NOT EXISTS minigame_results (
 game TEXT NOT NULL, run TEXT NOT NULL, profile TEXT NOT NULL, course TEXT NOT NULL,
 time REAL, won INTEGER NOT NULL DEFAULT 0, drawn INTEGER NOT NULL DEFAULT 0,
 hits INTEGER NOT NULL DEFAULT 0, finished INTEGER NOT NULL,
 PRIMARY KEY(game,run,profile)
);
CREATE INDEX IF NOT EXISTS minigame_results_profile ON minigame_results(profile,game,finished);
CREATE INDEX IF NOT EXISTS minigame_results_board ON minigame_results(game,course,time);
-- Finishers may leave the room before a race settles; retain their account association.
CREATE TABLE IF NOT EXISTS minigame_result_members (
 game TEXT NOT NULL, run TEXT NOT NULL, player TEXT NOT NULL, profile TEXT NOT NULL,
 PRIMARY KEY(game,run,player)
);
