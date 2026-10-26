CREATE TABLE IF NOT EXISTS `multiplayer_chess_members` (
	`token` text PRIMARY KEY NOT NULL,
	`profile` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `multiplayer_chess_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `multiplayer_chess_scores` (
	`game` text NOT NULL,
	`profile` text NOT NULL,
	`won` integer NOT NULL,
	`drawn` integer NOT NULL,
	`reason` text NOT NULL,
	`finished` integer NOT NULL,
	PRIMARY KEY(`game`, `profile`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `chess_scores_profile` ON `multiplayer_chess_scores` (`profile`);