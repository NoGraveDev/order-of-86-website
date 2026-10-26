CREATE TABLE IF NOT EXISTS multiplayer_boat_races (room TEXT PRIMARY KEY, state TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS multiplayer_boat_entries (room TEXT NOT NULL, player TEXT NOT NULL, race TEXT NOT NULL, name TEXT NOT NULL, dog INTEGER NOT NULL, state TEXT NOT NULL, seq INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, updated INTEGER NOT NULL, finished REAL, PRIMARY KEY(room,player));
CREATE INDEX IF NOT EXISTS boat_entries_race ON multiplayer_boat_entries(room,race);
