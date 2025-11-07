CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`s3Url` text NOT NULL,
	`encryptionKey` varchar(255) NOT NULL,
	`virusScanned` boolean NOT NULL DEFAULT false,
	`scanResult` varchar(50),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`uploadedByUserId` int,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legalResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`category` varchar(100) NOT NULL,
	`jurisdiction` varchar(100),
	`tags` text,
	`metaTitle` varchar(200),
	`metaDescription` text,
	`isPublished` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`authorUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalResources_id` PRIMARY KEY(`id`),
	CONSTRAINT `legalResources_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`encryptedContent` text NOT NULL,
	`sender` enum('SUBMITTER','ADMIN') NOT NULL,
	`senderUserId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` varchar(64) NOT NULL,
	`category` enum('CIVIL_RIGHTS','POLICE_MISCONDUCT','LEGAL_MALPRACTICE','PROSECUTORIAL_MISCONDUCT','CONSTITUTIONAL_VIOLATION','INSTITUTIONAL_CORRUPTION','OTHER') NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`jurisdiction` enum('Montana','Washington','Federal','Multi-State') NOT NULL,
	`urgencyLevel` int NOT NULL DEFAULT 5,
	`encryptedContactEmail` text,
	`encryptedContactPhone` text,
	`encryptedPersonalDetails` text,
	`status` enum('NEW','UNDER_REVIEW','IN_PROGRESS','AWAITING_INFO','RESOLVED','CLOSED') NOT NULL DEFAULT 'NEW',
	`ipAddress` varchar(45),
	`userAgent` text,
	`submissionMethod` varchar(50) NOT NULL DEFAULT 'web',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`reviewedAt` timestamp,
	`resolvedAt` timestamp,
	`assignedToUserId` int,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `submissions_caseId_unique` UNIQUE(`caseId`)
);
--> statement-breakpoint
CREATE TABLE `systemLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('INFO','WARNING','ERROR','CRITICAL') NOT NULL,
	`action` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`contextData` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemLogs_id` PRIMARY KEY(`id`)
);
