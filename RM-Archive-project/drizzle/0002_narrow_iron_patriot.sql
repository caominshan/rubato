CREATE TABLE `birthday_wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_birthday_wishes_created_at` ON `birthday_wishes` (`created_at`);