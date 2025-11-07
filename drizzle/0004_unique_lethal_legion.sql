CREATE TABLE `adminPermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`permissionType` varchar(100) NOT NULL,
	`resourceType` varchar(50),
	`resourceId` int,
	`grantedBy` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminPermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `archiveExtractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`archiveFileId` int NOT NULL,
	`extractionStatus` enum('PENDING','PROCESSING','COMPLETED','FAILED','PARTIAL') NOT NULL DEFAULT 'PENDING',
	`extractedFilesCount` int NOT NULL DEFAULT 0,
	`failedFilesCount` int NOT NULL DEFAULT 0,
	`extractionLog` text,
	`extractionError` text,
	`extractionStartedAt` timestamp,
	`extractionCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `archiveExtractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`adminId` int NOT NULL,
	`assignmentType` enum('PRIMARY','REVIEWER','ANALYST') NOT NULL,
	`accessLevel` enum('VIEW','EDIT','PUBLISH','ADMIN') NOT NULL,
	`assignedBy` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caseAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`encryptedFilename` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`checksumSha256` varchar(64) NOT NULL,
	`category` enum('EVIDENCE','CORRESPONDENCE','LEGAL_DOCUMENTS','WITNESS_STATEMENTS','MEDIA','OTHER') NOT NULL DEFAULT 'OTHER',
	`status` enum('UPLOADING','PROCESSING','SCANNED','CLEAN','SUSPICIOUS','INFECTED','QUARANTINED','ARCHIVED') NOT NULL DEFAULT 'UPLOADING',
	`virusScanResult` text,
	`virusScanStatus` enum('PENDING','CLEAN','INFECTED','SUSPICIOUS','ERROR') DEFAULT 'PENDING',
	`virusScanTimestamp` timestamp,
	`parentArchiveId` int,
	`extractionPath` text,
	`accessCount` int NOT NULL DEFAULT 0,
	`lastAccessedAt` timestamp,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caseFiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `caseFiles_encryptedFilename_unique` UNIQUE(`encryptedFilename`)
);
--> statement-breakpoint
CREATE TABLE `fileAccessLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileId` int NOT NULL,
	`userId` int NOT NULL,
	`accessType` enum('VIEW','DOWNLOAD','DELETE','SHARE','RENAME','MOVE') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fileAccessLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publicCases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`publicationStatus` enum('DRAFT','PENDING_APPROVAL','PUBLISHED','ARCHIVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
	`title` varchar(500) NOT NULL,
	`summary` text NOT NULL,
	`redactedContent` text,
	`allegedInstitutions` text NOT NULL,
	`violationTypes` text NOT NULL,
	`legalContext` text,
	`caseStatus` varchar(50),
	`metaTitle` varchar(255),
	`metaDescription` text,
	`seoKeywords` text,
	`generatedSeoContent` text,
	`publishedAt` timestamp,
	`compiledBy` int NOT NULL,
	`approvedBy` int,
	`approvedAt` timestamp,
	`viewCount` int NOT NULL DEFAULT 0,
	`shareCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publicCases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redactionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`fileId` int,
	`redactionType` enum('TEXT','IMAGE','PDF') NOT NULL,
	`sensitiveDataMatches` text NOT NULL,
	`redactionCoordinates` text,
	`automatedConfidence` varchar(10),
	`manualReviewStatus` enum('PENDING','APPROVED','REJECTED','NEEDS_REVISION') NOT NULL DEFAULT 'PENDING',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `redactionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userMfaMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`methodType` enum('TOTP','WEBAUTHN','EMAIL_OTP','RECOVERY_CODES','YUBIKEY') NOT NULL,
	`methodData` text NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`setupTimestamp` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	`useCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userMfaMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRecoveryCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`codeHash` varchar(255) NOT NULL,
	`isUsed` boolean NOT NULL DEFAULT false,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userRecoveryCodes_id` PRIMARY KEY(`id`)
);
