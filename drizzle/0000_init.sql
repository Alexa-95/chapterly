CREATE TABLE `activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` text NOT NULL,
	`type` text NOT NULL,
	`value` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text,
	`thumbnail` text,
	`description` text,
	`page_count` integer,
	`published_date` text,
	`categories` text,
	`status` text DEFAULT 'want' NOT NULL,
	`current_page` integer DEFAULT 0 NOT NULL,
	`rating` integer,
	`review` text,
	`started_at` integer,
	`finished_at` integer,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`year` integer PRIMARY KEY NOT NULL,
	`target` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shelf_books` (
	`shelf_id` integer NOT NULL,
	`book_id` text NOT NULL,
	PRIMARY KEY(`shelf_id`, `book_id`),
	FOREIGN KEY (`shelf_id`) REFERENCES `shelves`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shelves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
