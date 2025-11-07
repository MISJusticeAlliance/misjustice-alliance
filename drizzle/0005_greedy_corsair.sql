CREATE TABLE `caseUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` varchar(64) NOT NULL,
	`updateTitle` varchar(200) NOT NULL,
	`updateDescription` text NOT NULL,
	`updateContent` text,
	`updateType` enum('CASE_DEVELOPMENT','NEW_EVIDENCE','LEGAL_OUTCOME','SETTLEMENT_UPDATE','INSTITUTIONAL_RESPONSE','GENERAL_UPDATE') NOT NULL,
	`status` enum('PENDING_REVIEW','APPROVED','REJECTED','PUBLISHED') NOT NULL DEFAULT 'PENDING_REVIEW',
	`submittedBy` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`publishedAt` timestamp,
	CONSTRAINT `caseUpdates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caseVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` varchar(64) NOT NULL,
	`versionNumber` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`category` enum('CIVIL_RIGHTS','POLICE_MISCONDUCT','LEGAL_MALPRACTICE','PROSECUTORIAL_MISCONDUCT','CONSTITUTIONAL_VIOLATION','INSTITUTIONAL_CORRUPTION','OTHER') NOT NULL,
	`changeDescription` text,
	`changeType` enum('INITIAL_SUBMISSION','CONTENT_UPDATE','FILE_ADDITION','FILE_REMOVAL','STATUS_CHANGE','ADMIN_EDIT') NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `caseVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fileVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`encryptedKey` text NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`versionLabel` varchar(100),
	`changeDescription` text,
	`status` enum('ACTIVE','SUPERSEDED','ARCHIVED','DELETED') NOT NULL DEFAULT 'ACTIVE',
	`uploadedBy` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fileVersions_id` PRIMARY KEY(`id`)
);
