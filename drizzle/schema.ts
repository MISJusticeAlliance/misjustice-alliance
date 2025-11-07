import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended for legal advocacy platform with admin roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Anonymous case submissions from victims of civil rights violations.
 * Sensitive fields are encrypted before storage.
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  caseId: varchar("caseId", { length: 64 }).notNull().unique(),
  
  // Case details
  category: mysqlEnum("category", [
    "CIVIL_RIGHTS",
    "POLICE_MISCONDUCT", 
    "LEGAL_MALPRACTICE",
    "PROSECUTORIAL_MISCONDUCT",
    "CONSTITUTIONAL_VIOLATION",
    "INSTITUTIONAL_CORRUPTION",
    "OTHER"
  ]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["Montana", "Washington", "Federal", "Multi-State"]).notNull(),
  urgencyLevel: int("urgencyLevel").notNull().default(5),
  
  // Encrypted contact information (stored as encrypted JSON strings)
  encryptedContactEmail: text("encryptedContactEmail"),
  encryptedContactPhone: text("encryptedContactPhone"),
  encryptedPersonalDetails: text("encryptedPersonalDetails"),
  
  // Status tracking
  status: mysqlEnum("status", [
    "NEW",
    "UNDER_REVIEW", 
    "IN_PROGRESS",
    "AWAITING_INFO",
    "RESOLVED",
    "CLOSED"
  ]).notNull().default("NEW"),
  
  // Metadata for security (anonymized after 30 days)
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  submissionMethod: varchar("submissionMethod", { length: 50 }).notNull().default("web"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  resolvedAt: timestamp("resolvedAt"),
  
  // Relations
  assignedToUserId: int("assignedToUserId"),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * Encrypted messages between case submitters and admin staff.
 * Enables secure communication using only case ID.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  
  // Encrypted message content
  encryptedContent: text("encryptedContent").notNull(),
  
  // Sender identification
  sender: mysqlEnum("sender", ["SUBMITTER", "ADMIN"]).notNull(),
  senderUserId: int("senderUserId"), // null for anonymous submitters
  
  // Message status
  isRead: boolean("isRead").notNull().default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Document attachments for case submissions.
 * Files stored in S3, metadata and encryption keys stored here.
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  
  // File metadata
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  // S3 storage reference
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: text("s3Url").notNull(),
  
  // Encryption key for this specific file
  encryptionKey: varchar("encryptionKey", { length: 255 }).notNull(),
  
  // Security scanning
  virusScanned: boolean("virusScanned").notNull().default(false),
  scanResult: varchar("scanResult", { length: 50 }),
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  uploadedByUserId: int("uploadedByUserId"), // null for anonymous submitters
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Legal resources and educational content.
 * CMS-style content management for legal information.
 */
export const legalResources = mysqlTable("legalResources", {
  id: int("id").autoincrement().primaryKey(),
  
  // Content
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content").notNull(), // Markdown content
  excerpt: text("excerpt"),
  
  // Categorization
  category: varchar("category", { length: 100 }).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 100 }),
  tags: text("tags"), // JSON array stored as text
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  
  // Publishing
  isPublished: boolean("isPublished").notNull().default(false),
  publishedAt: timestamp("publishedAt"),
  
  // Authorship
  authorUserId: int("authorUserId").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalResource = typeof legalResources.$inferSelect;
export type InsertLegalResource = typeof legalResources.$inferInsert;

/**
 * System audit logs for security monitoring.
 * Tracks all sensitive operations and access patterns.
 */
export const systemLogs = mysqlTable("systemLogs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Log details
  level: mysqlEnum("level", ["INFO", "WARNING", "ERROR", "CRITICAL"]).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  message: text("message").notNull(),
  contextData: text("contextData"), // JSON context stored as text
  
  // Request metadata
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  userId: int("userId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;

/**
 * Public case profiles for raising case awareness.
 * Victim names are redacted, but alleged organizations and misconduct are public.
 */
export const caseProfiles = mysqlTable("caseProfiles", {
  id: int("id").autoincrement().primaryKey(),
  
  // Link to original submission (if from internal case)
  submissionId: int("submissionId"),
  
  // Profile metadata
  profileSlug: varchar("profileSlug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(), // Public-facing summary
  
  // Case details (public information)
  category: mysqlEnum("category", [
    "CIVIL_RIGHTS",
    "POLICE_MISCONDUCT",
    "LEGAL_MALPRACTICE",
    "PROSECUTORIAL_MISCONDUCT",
    "CONSTITUTIONAL_VIOLATION",
    "INSTITUTIONAL_CORRUPTION",
    "OTHER"
  ]).notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["Montana", "Washington", "Federal", "Multi-State"]).notNull(),
  
  // Alleged organizations (public, not redacted)
  allegedOrganizations: text("allegedOrganizations"), // JSON array of organization names
  
  // Content
  fullContent: text("fullContent"), // Markdown content with redacted victim names
  
  // SEO/GEO metadata
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  seoKeywords: text("seoKeywords"), // JSON array
  generatedSeoContent: text("generatedSeoContent"), // AI-generated SEO content
  
  // Status and approval
  status: mysqlEnum("status", [
    "DRAFT",
    "PENDING_APPROVAL",
    "APPROVED",
    "PUBLISHED",
    "ARCHIVED"
  ]).notNull().default("DRAFT"),
  
  isPublished: boolean("isPublished").notNull().default(false),
  publishedAt: timestamp("publishedAt"),
  
  // Approval workflow
  submittedByUserId: int("submittedByUserId"),
  approvedByUserId: int("approvedByUserId"),
  approvalNotes: text("approvalNotes"),
  approvedAt: timestamp("approvedAt"),
  
  // Visibility and engagement
  viewCount: int("viewCount").notNull().default(0),
  shareCount: int("shareCount").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CaseProfile = typeof caseProfiles.$inferSelect;
export type InsertCaseProfile = typeof caseProfiles.$inferInsert;

/**
 * Case profile attachments - documents, images, and media.
 * Supports .doc, .txt, .md, .pdf, and image files.
 */
export const caseProfileAttachments = mysqlTable("caseProfileAttachments", {
  id: int("id").autoincrement().primaryKey(),
  caseProfileId: int("caseProfileId").notNull(),
  
  // File metadata
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileType: mysqlEnum("fileType", ["DOCUMENT", "IMAGE", "VIDEO", "AUDIO"]).notNull(),
  
  // S3 storage reference
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: text("s3Url").notNull(),
  
  // Display metadata
  displayOrder: int("displayOrder").notNull().default(0),
  caption: text("caption"),
  
  // Security
  virusScanned: boolean("virusScanned").notNull().default(false),
  scanResult: varchar("scanResult", { length: 50 }),
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type CaseProfileAttachment = typeof caseProfileAttachments.$inferSelect;
export type InsertCaseProfileAttachment = typeof caseProfileAttachments.$inferInsert;

/**
 * Case profile updates - track revisions and new information.
 * Updates must be approved before being published.
 */
export const caseProfileUpdates = mysqlTable("caseProfileUpdates", {
  id: int("id").autoincrement().primaryKey(),
  caseProfileId: int("caseProfileId").notNull(),
  
  // Update content
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Markdown content
  updateReason: text("updateReason"), // Why this update is being submitted
  
  // Status
  status: mysqlEnum("status", [
    "DRAFT",
    "PENDING_APPROVAL",
    "APPROVED",
    "PUBLISHED",
    "REJECTED"
  ]).notNull().default("DRAFT"),
  
  isPublished: boolean("isPublished").notNull().default(false),
  publishedAt: timestamp("publishedAt"),
  
  // Approval workflow
  submittedByUserId: int("submittedByUserId"),
  approvedByUserId: int("approvedByUserId"),
  approvalNotes: text("approvalNotes"),
  approvedAt: timestamp("approvedAt"),
  
  // SEO/GEO
  generatedSeoContent: text("generatedSeoContent"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CaseProfileUpdate = typeof caseProfileUpdates.$inferSelect;
export type InsertCaseProfileUpdate = typeof caseProfileUpdates.$inferInsert;

/**
 * Custom notifications system for users and admins.
 * Supports in-app notifications, email notifications, and notification history.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Recipient
  userId: int("userId").notNull(),
  
  // Notification type and content
  type: mysqlEnum("type", [
    "CASE_SUBMITTED",
    "CASE_APPROVED",
    "CASE_REJECTED",
    "CASE_UPDATE",
    "MESSAGE_RECEIVED",
    "ADMIN_ALERT",
    "SYSTEM_UPDATE",
    "RESOURCE_ADDED",
    "PROFILE_PUBLISHED",
    "PROFILE_UPDATE_APPROVED",
    "PROFILE_UPDATE_REJECTED",
    "CUSTOM"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Optional related entity references
  relatedCaseId: int("relatedCaseId"),
  relatedSubmissionId: int("relatedSubmissionId"),
  relatedCaseProfileId: int("relatedCaseProfileId"),
  relatedMessageId: int("relatedMessageId"),
  
  // Notification metadata
  priority: mysqlEnum("priority", ["LOW", "NORMAL", "HIGH", "URGENT"]).notNull().default("NORMAL"),
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  actionUrl: text("actionUrl"), // URL to navigate to when clicked
  actionLabel: varchar("actionLabel", { length: 100 }),
  
  // Status tracking
  isRead: boolean("isRead").notNull().default(false),
  readAt: timestamp("readAt"),
  
  // Delivery channels
  sentViaEmail: boolean("sentViaEmail").notNull().default(false),
  emailSentAt: timestamp("emailSentAt"),
  
  sentViaPush: boolean("sentViaPush").notNull().default(false),
  pushSentAt: timestamp("pushSentAt"),
  
  // Expiration
  expiresAt: timestamp("expiresAt"),
  isArchived: boolean("isArchived").notNull().default(false),
  archivedAt: timestamp("archivedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User notification preferences and settings.
 * Controls which notifications users receive and how they receive them.
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Email preferences
  emailNotificationsEnabled: boolean("emailNotificationsEnabled").notNull().default(true),
  emailOnCaseUpdate: boolean("emailOnCaseUpdate").notNull().default(true),
  emailOnMessage: boolean("emailOnMessage").notNull().default(true),
  emailOnProfilePublished: boolean("emailOnProfilePublished").notNull().default(true),
  emailDigestFrequency: mysqlEnum("emailDigestFrequency", ["IMMEDIATE", "DAILY", "WEEKLY", "NEVER"]).notNull().default("IMMEDIATE"),
  
  // In-app preferences
  inAppNotificationsEnabled: boolean("inAppNotificationsEnabled").notNull().default(true),
  showNotificationBadge: boolean("showNotificationBadge").notNull().default(true),
  
  // Push preferences
  pushNotificationsEnabled: boolean("pushNotificationsEnabled").notNull().default(false),
  
  // Notification types to receive
  receiveSystemUpdates: boolean("receiveSystemUpdates").notNull().default(true),
  receiveAdminAlerts: boolean("receiveAdminAlerts").notNull().default(true),
  receiveMarketingEmails: boolean("receiveMarketingEmails").notNull().default(false),
  
  // Do not disturb
  doNotDisturbEnabled: boolean("doNotDisturbEnabled").notNull().default(false),
  doNotDisturbStart: varchar("doNotDisturbStart", { length: 5 }), // HH:mm format
  doNotDisturbEnd: varchar("doNotDisturbEnd", { length: 5 }), // HH:mm format
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;


/**
 * File management system for case evidence and documentation.
 * Stores encrypted files with virus scan results and access tracking.
 */
export const caseFiles = mysqlTable("caseFiles", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  
  // File metadata
  originalName: varchar("originalName", { length: 255 }).notNull(),
  encryptedFilename: varchar("encryptedFilename", { length: 255 }).notNull().unique(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  checksumSha256: varchar("checksumSha256", { length: 64 }).notNull(),
  
  // File categorization
  category: mysqlEnum("category", [
    "EVIDENCE",
    "CORRESPONDENCE",
    "LEGAL_DOCUMENTS",
    "WITNESS_STATEMENTS",
    "MEDIA",
    "OTHER"
  ]).notNull().default("OTHER"),
  
  // Processing status
  status: mysqlEnum("status", [
    "UPLOADING",
    "PROCESSING",
    "SCANNED",
    "CLEAN",
    "SUSPICIOUS",
    "INFECTED",
    "QUARANTINED",
    "ARCHIVED"
  ]).notNull().default("UPLOADING"),
  
  // Virus scan results (stored as JSON)
  virusScanResult: text("virusScanResult"), // JSON stringified
  virusScanStatus: mysqlEnum("virusScanStatus", ["PENDING", "CLEAN", "INFECTED", "SUSPICIOUS", "ERROR"]).default("PENDING"),
  virusScanTimestamp: timestamp("virusScanTimestamp"),
  
  // Archive processing
  parentArchiveId: int("parentArchiveId"),
  extractionPath: text("extractionPath"),
  
  // Access tracking
  accessCount: int("accessCount").notNull().default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  
  // Timestamps
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign key
  // caseId references submissions(id)
});

export type CaseFile = typeof caseFiles.$inferSelect;
export type InsertCaseFile = typeof caseFiles.$inferInsert;

/**
 * Archive extraction tracking for bulk file uploads.
 * Monitors the status and progress of archive processing.
 */
export const archiveExtractions = mysqlTable("archiveExtractions", {
  id: int("id").autoincrement().primaryKey(),
  archiveFileId: int("archiveFileId").notNull(),
  
  // Extraction status
  extractionStatus: mysqlEnum("extractionStatus", [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "PARTIAL"
  ]).notNull().default("PENDING"),
  
  // Results
  extractedFilesCount: int("extractedFilesCount").notNull().default(0),
  failedFilesCount: int("failedFilesCount").notNull().default(0),
  extractionLog: text("extractionLog"), // JSON stringified
  extractionError: text("extractionError"),
  
  // Timestamps
  extractionStartedAt: timestamp("extractionStartedAt"),
  extractionCompletedAt: timestamp("extractionCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign key
  // archiveFileId references caseFiles(id)
});

export type ArchiveExtraction = typeof archiveExtractions.$inferSelect;
export type InsertArchiveExtraction = typeof archiveExtractions.$inferInsert;

/**
 * File access audit log for security and compliance.
 * Tracks all access to case files for accountability.
 */
export const fileAccessLog = mysqlTable("fileAccessLog", {
  id: int("id").autoincrement().primaryKey(),
  fileId: int("fileId").notNull(),
  userId: int("userId").notNull(),
  
  // Access details
  accessType: mysqlEnum("accessType", [
    "VIEW",
    "DOWNLOAD",
    "DELETE",
    "SHARE",
    "RENAME",
    "MOVE"
  ]).notNull(),
  
  // Request information
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  // Timestamps
  accessedAt: timestamp("accessedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  
  // Foreign keys
  // fileId references caseFiles(id)
  // userId references users(id)
});

export type FileAccessLog = typeof fileAccessLog.$inferSelect;
export type InsertFileAccessLog = typeof fileAccessLog.$inferInsert;

/**
 * Multi-factor authentication methods for enhanced security.
 * Supports TOTP, WebAuthn, Email OTP, and recovery codes.
 */
export const userMfaMethods = mysqlTable("userMfaMethods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // MFA method type
  methodType: mysqlEnum("methodType", [
    "TOTP",
    "WEBAUTHN",
    "EMAIL_OTP",
    "RECOVERY_CODES",
    "YUBIKEY"
  ]).notNull(),
  
  // Method-specific data (encrypted)
  methodData: text("methodData").notNull(), // JSON stringified and encrypted
  
  // Status
  isPrimary: boolean("isPrimary").notNull().default(false),
  isActive: boolean("isActive").notNull().default(true),
  
  // Usage tracking
  setupTimestamp: timestamp("setupTimestamp").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  useCount: int("useCount").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign key
  // userId references users(id)
});

export type UserMfaMethod = typeof userMfaMethods.$inferSelect;
export type InsertUserMfaMethod = typeof userMfaMethods.$inferInsert;

/**
 * Recovery codes for account recovery in case of MFA loss.
 * One-time use codes stored as hashed values.
 */
export const userRecoveryCodes = mysqlTable("userRecoveryCodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Code information
  codeHash: varchar("codeHash", { length: 255 }).notNull(),
  isUsed: boolean("isUsed").notNull().default(false),
  usedAt: timestamp("usedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  
  // Foreign key
  // userId references users(id)
});

export type UserRecoveryCode = typeof userRecoveryCodes.$inferSelect;
export type InsertUserRecoveryCode = typeof userRecoveryCodes.$inferInsert;

/**
 * Admin permissions system for granular access control.
 * Manages what actions each admin can perform on resources.
 */
export const adminPermissions = mysqlTable("adminPermissions", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  
  // Permission details
  permissionType: varchar("permissionType", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 50 }),
  resourceId: int("resourceId"),
  
  // Permission lifecycle
  grantedBy: int("grantedBy").notNull(),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign keys
  // adminId references users(id)
  // grantedBy references users(id)
});

export type AdminPermission = typeof adminPermissions.$inferSelect;
export type InsertAdminPermission = typeof adminPermissions.$inferInsert;

/**
 * Case assignment system for admin case management.
 * Tracks which admins are assigned to specific cases.
 */
export const caseAssignments = mysqlTable("caseAssignments", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  adminId: int("adminId").notNull(),
  
  // Assignment details
  assignmentType: mysqlEnum("assignmentType", [
    "PRIMARY",
    "REVIEWER",
    "ANALYST"
  ]).notNull(),
  
  // Access level
  accessLevel: mysqlEnum("accessLevel", [
    "VIEW",
    "EDIT",
    "PUBLISH",
    "ADMIN"
  ]).notNull(),
  
  // Assignment lifecycle
  assignedBy: int("assignedBy").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign keys
  // caseId references submissions(id)
  // adminId references users(id)
  // assignedBy references users(id)
});

export type CaseAssignment = typeof caseAssignments.$inferSelect;
export type InsertCaseAssignment = typeof caseAssignments.$inferInsert;

/**
 * Redaction plans for sensitive data removal before publication.
 * Tracks automated and manual redaction decisions.
 */
export const redactionPlans = mysqlTable("redactionPlans", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  fileId: int("fileId"),
  
  // Redaction details
  redactionType: mysqlEnum("redactionType", [
    "TEXT",
    "IMAGE",
    "PDF"
  ]).notNull(),
  
  // Sensitive data matches (JSON)
  sensitiveDataMatches: text("sensitiveDataMatches").notNull(), // JSON stringified
  
  // Redaction coordinates for images/PDFs
  redactionCoordinates: text("redactionCoordinates"), // JSON stringified
  
  // Confidence and review
  automatedConfidence: varchar("automatedConfidence", { length: 10 }), // Decimal as string
  manualReviewStatus: mysqlEnum("manualReviewStatus", [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "NEEDS_REVISION"
  ]).notNull().default("PENDING"),
  
  // Review information
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign keys
  // caseId references submissions(id)
  // fileId references caseFiles(id)
  // reviewedBy references users(id)
});

export type RedactionPlan = typeof redactionPlans.$inferSelect;
export type InsertRedactionPlan = typeof redactionPlans.$inferInsert;

/**
 * Public cases for accountability and awareness.
 * Contains redacted case information for public disclosure.
 */
export const publicCases = mysqlTable("publicCases", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  
  // Publication details
  publicationStatus: mysqlEnum("publicationStatus", [
    "DRAFT",
    "PENDING_APPROVAL",
    "PUBLISHED",
    "ARCHIVED",
    "REJECTED"
  ]).notNull().default("DRAFT"),
  
  // Case information
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull(),
  redactedContent: text("redactedContent"), // JSON stringified
  
  // Institutional information (JSON)
  allegedInstitutions: text("allegedInstitutions").notNull(), // JSON stringified
  violationTypes: text("violationTypes").notNull(), // JSON stringified
  
  // Context and analysis
  legalContext: text("legalContext"),
  caseStatus: varchar("caseStatus", { length: 50 }),
  
  // SEO/GEO optimization
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  seoKeywords: text("seoKeywords"), // JSON stringified
  generatedSeoContent: text("generatedSeoContent"),
  
  // Publication tracking
  publishedAt: timestamp("publishedAt"),
  compiledBy: int("compiledBy").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  
  // Engagement metrics
  viewCount: int("viewCount").notNull().default(0),
  shareCount: int("shareCount").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Foreign keys
  // caseId references submissions(id)
  // compiledBy references users(id)
  // approvedBy references users(id)
});

export type PublicCase = typeof publicCases.$inferSelect;
export type InsertPublicCase = typeof publicCases.$inferInsert;


/**
 * Case version history tracking all changes and updates.
 * Enables rollback and audit trail for case modifications.
 */
export const caseVersions = mysqlTable("caseVersions", {
  id: int("id").autoincrement().primaryKey(),
  caseId: varchar("caseId", { length: 64 }).notNull(),
  versionNumber: int("versionNumber").notNull(),
  
  // Version content
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "CIVIL_RIGHTS",
    "POLICE_MISCONDUCT",
    "LEGAL_MALPRACTICE",
    "PROSECUTORIAL_MISCONDUCT",
    "CONSTITUTIONAL_VIOLATION",
    "INSTITUTIONAL_CORRUPTION",
    "OTHER"
  ]).notNull(),
  
  // Version metadata
  changeDescription: text("changeDescription"), // What changed in this version
  changeType: mysqlEnum("changeType", [
    "INITIAL_SUBMISSION",
    "CONTENT_UPDATE",
    "FILE_ADDITION",
    "FILE_REMOVAL",
    "STATUS_CHANGE",
    "ADMIN_EDIT"
  ]).notNull(),
  
  // Tracking
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  
  // Foreign keys
  // caseId references submissions(caseId)
  // createdBy references users(id)
});

export type CaseVersion = typeof caseVersions.$inferSelect;
export type InsertCaseVersion = typeof caseVersions.$inferInsert;

/**
 * File version history for tracking file changes and updates.
 * Maintains complete audit trail of all file modifications.
 */
export const fileVersions = mysqlTable("fileVersions", {
  id: int("id").autoincrement().primaryKey(),
  fileId: int("fileId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  
  // File content reference
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  encryptedKey: text("encryptedKey").notNull(),
  
  // File metadata
  originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  // Version tracking
  versionLabel: varchar("versionLabel", { length: 100 }),
  changeDescription: text("changeDescription"),
  
  // Status
  status: mysqlEnum("status", [
    "ACTIVE",
    "SUPERSEDED",
    "ARCHIVED",
    "DELETED"
  ]).notNull().default("ACTIVE"),
  
  // Tracking
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  
  // Foreign keys
  // fileId references caseFiles(id)
  // uploadedBy references users(id)
});

export type FileVersion = typeof fileVersions.$inferSelect;
export type InsertFileVersion = typeof fileVersions.$inferInsert;

/**
 * Case update submissions for tracking user-submitted updates.
 * Allows cases to evolve as situations change.
 */
export const caseUpdates = mysqlTable("caseUpdates", {
  id: int("id").autoincrement().primaryKey(),
  caseId: varchar("caseId", { length: 64 }).notNull(),
  
  // Update content
  updateTitle: varchar("updateTitle", { length: 200 }).notNull(),
  updateDescription: text("updateDescription").notNull(),
  updateContent: text("updateContent"),
  
  // Update type
  updateType: mysqlEnum("updateType", [
    "CASE_DEVELOPMENT",
    "NEW_EVIDENCE",
    "LEGAL_OUTCOME",
    "SETTLEMENT_UPDATE",
    "INSTITUTIONAL_RESPONSE",
    "GENERAL_UPDATE"
  ]).notNull(),
  
  // Approval workflow
  status: mysqlEnum("status", [
    "PENDING_REVIEW",
    "APPROVED",
    "REJECTED",
    "PUBLISHED"
  ]).notNull().default("PENDING_REVIEW"),
  
  // Tracking
  submittedBy: int("submittedBy").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  publishedAt: timestamp("publishedAt"),
  
  // Foreign keys
  // caseId references submissions(caseId)
  // submittedBy references users(id)
  // reviewedBy references users(id)
});

export type CaseUpdate = typeof caseUpdates.$inferSelect;
export type InsertCaseUpdate = typeof caseUpdates.$inferInsert;


/**
 * User preferences for customizing their experience
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Notification preferences
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  caseUpdates: boolean("caseUpdates").default(true).notNull(),
  systemAlerts: boolean("systemAlerts").default(true).notNull(),
  
  // Display preferences
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("auto").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  
  // Privacy preferences
  profileVisibility: mysqlEnum("profileVisibility", ["private", "public"]).default("private").notNull(),
  showEmail: boolean("showEmail").default(false).notNull(),
  
  // Accessibility
  highContrast: boolean("highContrast").default(false).notNull(),
  reducedMotion: boolean("reducedMotion").default(false).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * Remember Me tokens for persistent login across sessions
 */
export const rememberMeTokens = mysqlTable("rememberMeTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Token is hashed for security
  tokenHash: varchar("tokenHash", { length: 256 }).notNull().unique(),
  
  // Device/browser identification
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv6 can be up to 45 chars
  deviceName: varchar("deviceName", { length: 200 }),
  
  // Token lifecycle
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  revokedAt: timestamp("revokedAt"),
  
  // Foreign key: userId references users(id)
});

export type RememberMeToken = typeof rememberMeTokens.$inferSelect;
export type InsertRememberMeToken = typeof rememberMeTokens.$inferInsert;


/**
 * Password reset tokens for admin account recovery
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Token is hashed for security
  tokenHash: varchar("tokenHash", { length: 256 }).notNull().unique(),
  
  // Token lifecycle
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  usedAt: timestamp("usedAt"),
  
  // Foreign key: userId references users(id)
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;


/**
 * File attachments for case submissions
 * Stores metadata about uploaded files; actual file content is in S3
 */
export const caseAttachments = mysqlTable("caseAttachments", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reference to submission
  submissionId: int("submissionId").notNull(),
  caseId: varchar("caseId", { length: 64 }).notNull(),
  
  // File metadata
  fileName: varchar("fileName", { length: 255 }).notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  
  // S3 storage reference
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: text("s3Url").notNull(),
  
  // File type classification
  fileType: mysqlEnum("fileType", [
    "DOCUMENT",      // PDF, Word, etc.
    "IMAGE",         // JPG, PNG, etc.
    "EVIDENCE",      // Any evidence file
    "LEGAL_BRIEF",   // Legal documents
    "OTHER"
  ]).default("OTHER").notNull(),
  
  // Security and access control
  uploadedBy: varchar("uploadedBy", { length: 100 }), // "anonymous" or user identifier
  isEncrypted: boolean("isEncrypted").default(false).notNull(),
  encryptionKey: text("encryptionKey"), // If encrypted
  
  // Metadata
  description: text("description"),
  tags: text("tags"), // JSON array of tags
  
  // Lifecycle
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete
  
  // Audit
  downloadCount: int("downloadCount").default(0).notNull(),
  lastDownloadedAt: timestamp("lastDownloadedAt"),
});

export type CaseAttachment = typeof caseAttachments.$inferSelect;
export type InsertCaseAttachment = typeof caseAttachments.$inferInsert;


/**
 * Redaction audit log for PII detection and redaction
 * Tracks all PII found and redacted from documents
 */
export const redactionAudit = mysqlTable("redactionAudit", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reference to attachment
  attachmentId: int("attachmentId").notNull(),
  caseId: varchar("caseId", { length: 64 }).notNull(),
  
  // Redaction details
  piiDetected: int("piiDetected").notNull().default(0),
  piiRedacted: int("piiRedacted").notNull().default(0),
  riskScore: int("riskScore").notNull().default(0), // 0-100
  
  // PII types found (JSON array)
  piiTypes: text("piiTypes"), // JSON: ["SSN", "PHONE", "EMAIL"]
  
  // Original vs redacted text samples
  originalTextSample: text("originalTextSample"),
  redactedTextSample: text("redactedTextSample"),
  
  // Processing details
  extractionMethod: varchar("extractionMethod", { length: 50 }), // pdf, ocr, text
  processingTimeMs: int("processingTimeMs"),
  
  // Status
  status: mysqlEnum("status", [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "MANUAL_REVIEW"
  ]).default("PENDING").notNull(),
  
  // Admin review
  reviewedBy: varchar("reviewedBy", { length: 100 }),
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  
  // Lifecycle
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RedactionAudit = typeof redactionAudit.$inferSelect;
export type InsertRedactionAudit = typeof redactionAudit.$inferInsert;
