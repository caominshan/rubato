CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`related_url` text,
	`email` text,
	`created_at` text NOT NULL
);
