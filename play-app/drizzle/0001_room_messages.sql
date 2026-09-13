CREATE TABLE IF NOT EXISTS multiplayer_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 room TEXT NOT NULL,
 sender TEXT NOT NULL,
 name TEXT NOT NULL,
 kind TEXT NOT NULL,
 text TEXT NOT NULL,
 created INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS multiplayer_messages_room_id ON multiplayer_messages(room,id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS multiplayer_messages_sender_time ON multiplayer_messages(room,sender,created);
