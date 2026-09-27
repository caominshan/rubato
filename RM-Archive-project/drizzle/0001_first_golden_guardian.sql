ALTER TABLE `feedback` ADD `status` text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `feedback` ADD `updated_at` text;--> statement-breakpoint
CREATE INDEX `idx_feedback_created_at` ON `feedback` (`created_at`);