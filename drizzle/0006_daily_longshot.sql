CREATE TABLE `rememberMeTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(256) NOT NULL,
	`userAgent` text,
	`ipAddress` varchar(45),
	`deviceName` varchar(200),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	`revokedAt` timestamp,
	CONSTRAINT `rememberMeTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `rememberMeTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`caseUpdates` boolean NOT NULL DEFAULT true,
	`systemAlerts` boolean NOT NULL DEFAULT true,
	`theme` enum('light','dark','auto') NOT NULL DEFAULT 'auto',
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`profileVisibility` enum('private','public') NOT NULL DEFAULT 'private',
	`showEmail` boolean NOT NULL DEFAULT false,
	`highContrast` boolean NOT NULL DEFAULT false,
	`reducedMotion` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
