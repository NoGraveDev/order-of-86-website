CREATE TABLE `multiplayer_players` (
	`token` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`name` text NOT NULL,
	`state` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `multiplayer_room_updated` ON `multiplayer_players` (`room`,`updated`);--> statement-breakpoint
CREATE TABLE `multiplayer_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
