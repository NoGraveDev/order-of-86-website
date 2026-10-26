CREATE TABLE IF NOT EXISTS multiplayer_public_rooms (
 room TEXT PRIMARY KEY NOT NULL,
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS multiplayer_public_created ON multiplayer_public_rooms(created,room);
