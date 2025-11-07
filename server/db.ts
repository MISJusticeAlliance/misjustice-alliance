import { drizzle } from "drizzle-orm/mysql2";
import { eq, desc, and, isNull } from "drizzle-orm";
import { 
  InsertUser, 
  users, 
  submissions,
  messages,
  documents,
  legalResources,
  systemLogs,
  InsertSubmission,
  InsertMessage,
  InsertDocument,
  InsertLegalResource,
  InsertSystemLog,
  caseProfiles,
  caseProfileAttachments,
  caseProfileUpdates,
  InsertCaseProfile,
  InsertCaseProfileAttachment,
  InsertCaseProfileUpdate,
  CaseProfile,
  CaseProfileUpdate,
  caseFiles,
  CaseFile,
  InsertCaseFile,
  archiveExtractions,
  InsertArchiveExtraction,
  fileAccessLog,
  InsertFileAccessLog,
  caseVersions,
  InsertCaseVersion,
  CaseVersion,
  fileVersions,
  InsertFileVersion,
  FileVersion,
  caseUpdates,
  InsertCaseUpdate,
  CaseUpdate,
  userMfaMethods,
  InsertUserMfaMethod,
  userRecoveryCodes,
  InsertUserRecoveryCode,
  adminPermissions,
  InsertAdminPermission,
  caseAssignments,
  InsertCaseAssignment,
  redactionPlans,
  InsertRedactionPlan,
  publicCases,
  InsertPublicCase,
  userPreferences,
  rememberMeTokens,
  InsertUserPreferences,
  InsertRememberMeToken,
  passwordResetTokens,
  InsertPasswordResetToken,
  caseAttachments,
  InsertCaseAttachment,
  redactionAudit,
  InsertRedactionAudit
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// User Management
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Submission Management
// ============================================================================

export async function createSubmission(data: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(submissions).values(data);
  return result;
}

export async function getSubmissionByCaseId(caseId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(submissions).where(eq(submissions.caseId, caseId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getSubmissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllSubmissions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(submissions).orderBy(desc(submissions.createdAt));
}

export async function updateSubmissionStatus(id: number, status: string, reviewedAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (reviewedAt) updateData.reviewedAt = reviewedAt;
  
  await db.update(submissions).set(updateData).where(eq(submissions.id, id));
}

export async function assignSubmission(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(submissions).set({ 
    assignedToUserId: userId,
    status: "UNDER_REVIEW",
    reviewedAt: new Date()
  }).where(eq(submissions.id, id));
}

// ============================================================================
// Message Management
// ============================================================================

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return result;
}

export async function getMessagesBySubmissionId(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(messages)
    .where(eq(messages.submissionId, submissionId))
    .orderBy(messages.createdAt);
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
}

// ============================================================================
// Document Management
// ============================================================================

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values(data);
  return result;
}

export async function getDocumentsBySubmissionId(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(documents)
    .where(eq(documents.submissionId, submissionId))
    .orderBy(documents.uploadedAt);
}

export async function updateDocumentScanResult(id: number, scanResult: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documents).set({ 
    virusScanned: true,
    scanResult 
  }).where(eq(documents.id, id));
}

// ============================================================================
// Legal Resources Management
// ============================================================================

export async function createLegalResource(data: InsertLegalResource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(legalResources).values(data);
  return result;
}

export async function getPublishedLegalResources() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(legalResources)
    .where(eq(legalResources.isPublished, true))
    .orderBy(desc(legalResources.publishedAt));
}

export async function getLegalResourceBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(legalResources)
    .where(and(
      eq(legalResources.slug, slug),
      eq(legalResources.isPublished, true)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllLegalResources() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(legalResources).orderBy(desc(legalResources.updatedAt));
}

// ============================================================================
// System Logging
// ============================================================================

export async function createSystemLog(data: InsertSystemLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create system log: database not available");
    return;
  }
  
  try {
    await db.insert(systemLogs).values(data);
  } catch (error) {
    console.error("[Database] Failed to create system log:", error);
  }
}

export async function getRecentSystemLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(systemLogs)
    .orderBy(desc(systemLogs.createdAt))
    .limit(limit);
}

// ============================================================================
// Case Profiles
// ============================================================================

export async function createCaseProfile(data: InsertCaseProfile): Promise<CaseProfile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(caseProfiles).values(data);
    const profileId = (result as any).insertId;
    const profile = await db.select().from(caseProfiles).where(eq(caseProfiles.id, profileId)).limit(1);
    return profile.length > 0 ? profile[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create case profile:", error);
    throw error;
  }
}

export async function getCaseProfileBySlug(slug: string): Promise<CaseProfile | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(caseProfiles).where(eq(caseProfiles.profileSlug, slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get case profile:", error);
    return null;
  }
}

export async function getPublishedCaseProfiles(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(caseProfiles)
      .where(eq(caseProfiles.isPublished, true))
      .orderBy(desc(caseProfiles.publishedAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get published case profiles:", error);
    return [];
  }
}

export async function getPendingCaseProfiles() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(caseProfiles)
      .where(eq(caseProfiles.status, "PENDING_APPROVAL"))
      .orderBy(desc(caseProfiles.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending case profiles:", error);
    return [];
  }
}

export async function updateCaseProfileStatus(
  profileId: number,
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "ARCHIVED",
  approvedByUserId?: number,
  approvalNotes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const updateData: any = { status };
    
    if (status === "PUBLISHED") {
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
    }
    
    if (approvedByUserId) {
      updateData.approvedByUserId = approvedByUserId;
      updateData.approvedAt = new Date();
    }
    
    if (approvalNotes) {
      updateData.approvalNotes = approvalNotes;
    }

    await db.update(caseProfiles).set(updateData).where(eq(caseProfiles.id, profileId));
  } catch (error) {
    console.error("[Database] Failed to update case profile status:", error);
    throw error;
  }
}

export async function addCaseProfileAttachment(data: InsertCaseProfileAttachment): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(caseProfileAttachments).values(data);
  } catch (error) {
    console.error("[Database] Failed to add case profile attachment:", error);
    throw error;
  }
}

export async function getCaseProfileAttachments(caseProfileId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(caseProfileAttachments)
      .where(eq(caseProfileAttachments.caseProfileId, caseProfileId))
      .orderBy(caseProfileAttachments.displayOrder);
  } catch (error) {
    console.error("[Database] Failed to get case profile attachments:", error);
    return [];
  }
}

export async function createCaseProfileUpdate(data: InsertCaseProfileUpdate): Promise<CaseProfileUpdate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(caseProfileUpdates).values(data);
    const updateId = (result as any).insertId;
    const update = await db.select().from(caseProfileUpdates).where(eq(caseProfileUpdates.id, updateId)).limit(1);
    return update.length > 0 ? update[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create case profile update:", error);
    throw error;
  }
}

export async function getPendingCaseProfileUpdates() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(caseProfileUpdates)
      .where(eq(caseProfileUpdates.status, "PENDING_APPROVAL"))
      .orderBy(desc(caseProfileUpdates.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending case profile updates:", error);
    return [];
  }
}

export async function updateCaseProfileUpdateStatus(
  updateId: number,
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED",
  approvedByUserId?: number,
  approvalNotes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const updateData: any = { status };
    
    if (status === "PUBLISHED") {
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
    }
    
    if (approvedByUserId) {
      updateData.approvedByUserId = approvedByUserId;
      updateData.approvedAt = new Date();
    }
    
    if (approvalNotes) {
      updateData.approvalNotes = approvalNotes;
    }

    await db.update(caseProfileUpdates).set(updateData).where(eq(caseProfileUpdates.id, updateId));
  } catch (error) {
    console.error("[Database] Failed to update case profile update status:", error);
    throw error;
  }
}

export async function getCaseProfileUpdates(caseProfileId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(caseProfileUpdates)
      .where(and(
        eq(caseProfileUpdates.caseProfileId, caseProfileId),
        eq(caseProfileUpdates.isPublished, true)
      ))
      .orderBy(desc(caseProfileUpdates.publishedAt));
  } catch (error) {
    console.error("[Database] Failed to get case profile updates:", error);
    return [];
  }
}

export async function incrementCaseProfileViewCount(caseProfileId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const profile = await db.select().from(caseProfiles).where(eq(caseProfiles.id, caseProfileId)).limit(1);
    if (profile.length > 0) {
      await db
        .update(caseProfiles)
        .set({ viewCount: (profile[0].viewCount || 0) + 1 })
        .where(eq(caseProfiles.id, caseProfileId));
    }
  } catch (error) {
    console.error("[Database] Failed to increment case profile view count:", error);
  }
}

// ============================================================================
// Notifications
// ============================================================================

import { notifications, notificationPreferences, InsertNotification, InsertNotificationPreference } from "../drizzle/schema";

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create notification: database not available");
    return null;
  }

  try {
    const result = await db.insert(notifications).values(notification);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    throw error;
  }
}

export async function getUserNotifications(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get notifications: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isArchived, false)
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    throw error;
  }
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get unread count: database not available");
    return 0;
  }

  try {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        eq(notifications.isArchived, false)
      ));
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to get unread count:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark notification as read: database not available");
    return null;
  }

  try {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark all notifications as read: database not available");
    return null;
  }

  try {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result;
  } catch (error) {
    console.error("[Database] Failed to mark all notifications as read:", error);
    throw error;
  }
}

export async function archiveNotification(notificationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot archive notification: database not available");
    return null;
  }

  try {
    const result = await db
      .update(notifications)
      .set({
        isArchived: true,
        archivedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to archive notification:", error);
    throw error;
  }
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete notification: database not available");
    return null;
  }

  try {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete notification:", error);
    throw error;
  }
}

// ============================================================================
// Notification Preferences
// ============================================================================

export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get preferences: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get preferences:", error);
    throw error;
  }
}

export async function createNotificationPreferences(prefs: InsertNotificationPreference) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create preferences: database not available");
    return null;
  }

  try {
    const result = await db.insert(notificationPreferences).values(prefs);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create preferences:", error);
    throw error;
  }
}

export async function updateNotificationPreferences(userId: number, updates: Partial<InsertNotificationPreference>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update preferences: database not available");
    return null;
  }

  try {
    const result = await db
      .update(notificationPreferences)
      .set(updates)
      .where(eq(notificationPreferences.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update preferences:", error);
    throw error;
  }
}


// ============================================================================
// File Management
// ============================================================================

export async function createCaseFile(file: InsertCaseFile) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create case file: database not available");
    return null;
  }

  try {
    const result = await db.insert(caseFiles).values(file);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create case file:", error);
    throw error;
  }
}

export async function getCaseFiles(caseId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case files: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(caseFiles)
      .where(eq(caseFiles.caseId, caseId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get case files:", error);
    throw error;
  }
}

export async function getCaseFileById(fileId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case file: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(caseFiles)
      .where(eq(caseFiles.id, fileId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get case file:", error);
    throw error;
  }
}

export async function updateCaseFileStatus(fileId: number, status: string, virusScanResult?: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update case file: database not available");
    return null;
  }

  try {
    const updateData: any = { status };
    if (virusScanResult) {
      updateData.virusScanResult = JSON.stringify(virusScanResult);
      updateData.virusScanStatus = virusScanResult.status || "PENDING";
      updateData.virusScanTimestamp = new Date();
    }

    const result = await db
      .update(caseFiles)
      .set(updateData)
      .where(eq(caseFiles.id, fileId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update case file:", error);
    throw error;
  }
}

export async function deleteCaseFile(fileId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete case file: database not available");
    return null;
  }

  try {
    const result = await db
      .delete(caseFiles)
      .where(eq(caseFiles.id, fileId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete case file:", error);
    throw error;
  }
}

export async function incrementFileAccessCount(fileId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment access count: database not available");
    return null;
  }

  try {
    const file = await getCaseFileById(fileId);
    if (!file) return null;

    const result = await db
      .update(caseFiles)
      .set({
        accessCount: (file.accessCount || 0) + 1,
        lastAccessedAt: new Date(),
      })
      .where(eq(caseFiles.id, fileId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to increment access count:", error);
    throw error;
  }
}

// ============================================================================
// Archive Extraction
// ============================================================================

export async function createArchiveExtraction(extraction: InsertArchiveExtraction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create archive extraction: database not available");
    return null;
  }

  try {
    const result = await db.insert(archiveExtractions).values(extraction);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create archive extraction:", error);
    throw error;
  }
}

export async function updateArchiveExtractionStatus(extractionId: number, status: string, updates?: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update archive extraction: database not available");
    return null;
  }

  try {
    const updateData: any = { extractionStatus: status };
    if (updates) {
      Object.assign(updateData, updates);
    }

    const result = await db
      .update(archiveExtractions)
      .set(updateData)
      .where(eq(archiveExtractions.id, extractionId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update archive extraction:", error);
    throw error;
  }
}

// ============================================================================
// File Access Logging
// ============================================================================

export async function logFileAccess(log: InsertFileAccessLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log file access: database not available");
    return null;
  }

  try {
    const result = await db.insert(fileAccessLog).values(log);
    return result;
  } catch (error) {
    console.error("[Database] Failed to log file access:", error);
    throw error;
  }
}

export async function getFileAccessLogs(fileId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get file access logs: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(fileAccessLog)
      .where(eq(fileAccessLog.fileId, fileId))
      .orderBy(desc(fileAccessLog.accessedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get file access logs:", error);
    throw error;
  }
}

// ============================================================================
// Admin Permissions
// ============================================================================

export async function grantAdminPermission(permission: InsertAdminPermission) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot grant permission: database not available");
    return null;
  }

  try {
    const result = await db.insert(adminPermissions).values(permission);
    return result;
  } catch (error) {
    console.error("[Database] Failed to grant permission:", error);
    throw error;
  }
}

export async function getAdminPermissions(adminId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get permissions: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(adminPermissions)
      .where(eq(adminPermissions.adminId, adminId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get permissions:", error);
    throw error;
  }
}

// ============================================================================
// Case Assignments
// ============================================================================

export async function assignCaseToAdmin(assignment: InsertCaseAssignment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot assign case: database not available");
    return null;
  }

  try {
    const result = await db.insert(caseAssignments).values(assignment);
    return result;
  } catch (error) {
    console.error("[Database] Failed to assign case:", error);
    throw error;
  }
}

export async function getCaseAssignments(caseId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case assignments: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(caseAssignments)
      .where(eq(caseAssignments.caseId, caseId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get case assignments:", error);
    throw error;
  }
}

export async function getAdminAssignedCases(adminId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get assigned cases: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(caseAssignments)
      .where(eq(caseAssignments.adminId, adminId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get assigned cases:", error);
    throw error;
  }
}

// ============================================================================
// Redaction Plans
// ============================================================================

export async function createRedactionPlan(plan: InsertRedactionPlan) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create redaction plan: database not available");
    return null;
  }

  try {
    const result = await db.insert(redactionPlans).values(plan);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create redaction plan:", error);
    throw error;
  }
}

export async function getRedactionPlans(caseId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get redaction plans: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(redactionPlans)
      .where(eq(redactionPlans.caseId, caseId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get redaction plans:", error);
    throw error;
  }
}

export async function updateRedactionPlanStatus(planId: number, status: string, reviewedBy?: number, notes?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update redaction plan: database not available");
    return null;
  }

  try {
    const updateData: any = { manualReviewStatus: status };
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }
    if (notes) {
      updateData.reviewNotes = notes;
    }

    const result = await db
      .update(redactionPlans)
      .set(updateData)
      .where(eq(redactionPlans.id, planId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update redaction plan:", error);
    throw error;
  }
}

// ============================================================================
// Public Cases
// ============================================================================

export async function createPublicCase(publicCase: InsertPublicCase) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create public case: database not available");
    return null;
  }

  try {
    const result = await db.insert(publicCases).values(publicCase);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create public case:", error);
    throw error;
  }
}

export async function getPublishedPublicCases(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get public cases: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(publicCases)
      .where(eq(publicCases.publicationStatus, "PUBLISHED"))
      .orderBy(desc(publicCases.publishedAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get public cases:", error);
    throw error;
  }
}

export async function getPublicCaseById(publicCaseId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get public case: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(publicCases)
      .where(eq(publicCases.id, publicCaseId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get public case:", error);
    throw error;
  }
}

export async function updatePublicCaseStatus(publicCaseId: number, status: string, approvedBy?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update public case: database not available");
    return null;
  }

  try {
    const updateData: any = { publicationStatus: status };
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      if (status === "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }

    const result = await db
      .update(publicCases)
      .set(updateData)
      .where(eq(publicCases.id, publicCaseId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update public case:", error);
    throw error;
  }
}

export async function incrementPublicCaseViewCount(publicCaseId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment view count: database not available");
    return null;
  }

  try {
    const publicCase = await getPublicCaseById(publicCaseId);
    if (!publicCase) return null;

    const result = await db
      .update(publicCases)
      .set({ viewCount: (publicCase.viewCount || 0) + 1 })
      .where(eq(publicCases.id, publicCaseId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to increment view count:", error);
    throw error;
  }
}


// ============ Case Versioning Helpers ============

export async function createCaseVersion(
  caseId: string,
  versionNumber: number,
  title: string,
  description: string,
  category: string,
  changeType: string,
  changeDescription: string | null,
  createdBy: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create case version: database not available");
    return;
  }

  try {
    await db.insert(caseVersions).values({
      caseId,
      versionNumber,
      title,
      description,
      category: category as any,
      changeType: changeType as any,
      changeDescription,
      createdBy,
    });
  } catch (error) {
    console.error("[Database] Failed to create case version:", error);
    throw error;
  }
}

export async function getCaseVersionHistory(caseId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case versions: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(caseVersions)
      .where(eq(caseVersions.caseId, caseId))
      .orderBy(desc(caseVersions.versionNumber));
  } catch (error) {
    console.error("[Database] Failed to get case versions:", error);
    throw error;
  }
}

export async function getCaseVersion(caseId: string, versionNumber: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case version: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(caseVersions)
      .where(and(eq(caseVersions.caseId, caseId), eq(caseVersions.versionNumber, versionNumber)))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get case version:", error);
    throw error;
  }
}

// ============ File Version Helpers ============

export async function createFileVersion(
  fileId: number,
  versionNumber: number,
  s3Key: string,
  encryptedKey: string,
  originalFileName: string,
  fileSize: number,
  fileType: string,
  mimeType: string,
  versionLabel: string | null,
  changeDescription: string | null,
  uploadedBy: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create file version: database not available");
    return;
  }

  try {
    await db.insert(fileVersions).values({
      fileId,
      versionNumber,
      s3Key,
      encryptedKey,
      originalFileName,
      fileSize,
      fileType,
      mimeType,
      versionLabel,
      changeDescription,
      uploadedBy,
    });
  } catch (error) {
    console.error("[Database] Failed to create file version:", error);
    throw error;
  }
}

export async function getFileVersionHistory(fileId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get file versions: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(fileVersions)
      .where(eq(fileVersions.fileId, fileId))
      .orderBy(desc(fileVersions.versionNumber));
  } catch (error) {
    console.error("[Database] Failed to get file versions:", error);
    throw error;
  }
}

export async function getFileVersion(fileId: number, versionNumber: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get file version: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(fileVersions)
      .where(and(eq(fileVersions.fileId, fileId), eq(fileVersions.versionNumber, versionNumber)))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get file version:", error);
    throw error;
  }
}

// ============ Case Update Helpers ============

export async function createCaseUpdate(
  caseId: string,
  updateTitle: string,
  updateDescription: string,
  updateContent: string | null,
  updateType: string,
  submittedBy: number
): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create case update: database not available");
    return -1;
  }

  try {
    const result = await db.insert(caseUpdates).values({
      caseId,
      updateTitle,
      updateDescription,
      updateContent,
      updateType: updateType as any,
      submittedBy,
    });
    return result[0]?.insertId || -1;
  } catch (error) {
    console.error("[Database] Failed to create case update:", error);
    throw error;
  }
}

export async function getCaseUpdates(caseId: string, status?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case updates: database not available");
    return [];
  }

  try {
    if (status) {
      return await db
        .select()
        .from(caseUpdates)
        .where(and(eq(caseUpdates.caseId, caseId), eq(caseUpdates.status, status as any)))
        .orderBy(desc(caseUpdates.submittedAt));
    }
    
    return await db
      .select()
      .from(caseUpdates)
      .where(eq(caseUpdates.caseId, caseId))
      .orderBy(desc(caseUpdates.submittedAt));
  } catch (error) {
    console.error("[Database] Failed to get case updates:", error);
    throw error;
  }
}

export async function approveCaseUpdate(updateId: number, reviewedBy: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot approve case update: database not available");
    return;
  }

  try {
    await db
      .update(caseUpdates)
      .set({
        status: "APPROVED" as any,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(caseUpdates.id, updateId));
  } catch (error) {
    console.error("[Database] Failed to approve case update:", error);
    throw error;
  }
}

export async function publishCaseUpdate(updateId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot publish case update: database not available");
    return;
  }

  try {
    await db
      .update(caseUpdates)
      .set({
        status: "PUBLISHED" as any,
        publishedAt: new Date(),
      })
      .where(eq(caseUpdates.id, updateId));
  } catch (error) {
    console.error("[Database] Failed to publish case update:", error);
    throw error;
  }
}

export async function rejectCaseUpdate(updateId: number, reviewedBy: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reject case update: database not available");
    return;
  }

  try {
    await db
      .update(caseUpdates)
      .set({
        status: "REJECTED" as any,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(caseUpdates.id, updateId));
  } catch (error) {
    console.error("[Database] Failed to reject case update:", error);
    throw error;
  }
}


// ============ Statistics Helpers ============

export async function getCaseSubmissionStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get submission stats: database not available");
    return null;
  }

  try {
    const totalSubmissions = await db.select().from(submissions);
    
    return {
      total: totalSubmissions.length,
      lastSubmitted: totalSubmissions.length > 0 ? totalSubmissions[totalSubmissions.length - 1]?.createdAt : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get submission stats:", error);
    throw error;
  }
}

export async function getCaseUpdateStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get update stats: database not available");
    return null;
  }

  try {
    const totalUpdates = await db.select().from(caseUpdates);
    const pendingApprovals = totalUpdates.filter(u => u.status === "PENDING_REVIEW").length;
    const publishedUpdates = totalUpdates.filter(u => u.status === "PUBLISHED").length;

    return {
      total: totalUpdates.length,
      pendingApprovals,
      publishedUpdates,
      lastUpdate: totalUpdates.length > 0 ? totalUpdates[totalUpdates.length - 1]?.submittedAt : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get update stats:", error);
    throw error;
  }
}

export async function getFileStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get file stats: database not available");
    return null;
  }

  try {
    const totalFiles = await db.select().from(caseFiles);
    const totalSize = totalFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0);
    const virusQuarantined = totalFiles.filter(f => f.virusScanStatus === "INFECTED").length;

    return {
      total: totalFiles.length,
      totalSize,
      virusQuarantined,
      lastUploaded: totalFiles.length > 0 ? totalFiles[totalFiles.length - 1]?.uploadedAt : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get file stats:", error);
    throw error;
  }
}

export async function getCaseProfileStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case profile stats: database not available");
    return null;
  }

  try {
    const totalProfiles = await db.select().from(caseProfiles);
    const totalViews = totalProfiles.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const avgViews = totalProfiles.length > 0 ? Math.round(totalViews / totalProfiles.length) : 0;

    return {
      total: totalProfiles.length,
      totalViews,
      avgViews,
      lastCreated: totalProfiles.length > 0 ? totalProfiles[totalProfiles.length - 1]?.createdAt : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get case profile stats:", error);
    throw error;
  }
}

export async function getAdminActivityStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get activity stats: database not available");
    return null;
  }

  try {
    const logs = await db.select().from(systemLogs);

    return {
      totalLogs: logs.length,
      lastActivity: logs.length > 0 ? logs[logs.length - 1]?.createdAt : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get activity stats:", error);
    throw error;
  }
}

// ============ File Download Helpers ============

export async function getCaseFilesForDownload(caseId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get case files: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(caseFiles)
      .where(eq(caseFiles.caseId, caseId));
  } catch (error) {
    console.error("[Database] Failed to get case files:", error);
    throw error;
  }
}

export async function getAllCaseFiles() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all case files: database not available");
    return [];
  }

  try {
    return await db.select().from(caseFiles);
  } catch (error) {
    console.error("[Database] Failed to get all case files:", error);
    throw error;
  }
}

export async function logFileDownload(fileId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log file download: database not available");
    return;
  }

  try {
    await db.insert(fileAccessLog).values({
      fileId,
      userId,
      accessType: "DOWNLOAD",
    });
  } catch (error) {
    console.error("[Database] Failed to log file download:", error);
    throw error;
  }
}


// ============================================================================
// User Preferences Management
// ============================================================================

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user preferences: database not available");
    return null;
  }
  try {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user preferences:", error);
    throw error;
  }
}

export async function createUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user preferences: database not available");
    return null;
  }
  try {
    await db.insert(userPreferences).values({
      userId,
      emailNotifications: true,
      caseUpdates: true,
      systemAlerts: true,
      theme: "auto",
      language: "en",
      profileVisibility: "private",
      showEmail: false,
      highContrast: false,
      reducedMotion: false,
    });
    return await getUserPreferences(userId);
  } catch (error) {
    console.error("[Database] Failed to create user preferences:", error);
    throw error;
  }
}

export async function updateUserPreferences(userId: number, updates: Partial<typeof userPreferences.$inferInsert>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user preferences: database not available");
    return null;
  }
  try {
    await db
      .update(userPreferences)
      .set(updates)
      .where(eq(userPreferences.userId, userId));
    return await getUserPreferences(userId);
  } catch (error) {
    console.error("[Database] Failed to update user preferences:", error);
    throw error;
  }
}

// ============================================================================
// Remember Me Token Management
// ============================================================================

export async function createRememberMeToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date,
  userAgent?: string,
  ipAddress?: string,
  deviceName?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create remember me token: database not available");
    return null;
  }
  try {
    const result = await db.insert(rememberMeTokens).values({
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
      deviceName,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create remember me token:", error);
    throw error;
  }
}

export async function getRememberMeToken(tokenHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get remember me token: database not available");
    return null;
  }
  try {
    const result = await db
      .select()
      .from(rememberMeTokens)
      .where(
        and(
          eq(rememberMeTokens.tokenHash, tokenHash),
          isNull(rememberMeTokens.revokedAt)
        )
      )
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get remember me token:", error);
    throw error;
  }
}

export async function updateRememberMeTokenLastUsed(tokenHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update remember me token: database not available");
    return;
  }
  try {
    await db
      .update(rememberMeTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(rememberMeTokens.tokenHash, tokenHash));
  } catch (error) {
    console.error("[Database] Failed to update remember me token:", error);
    throw error;
  }
}

export async function revokeRememberMeToken(tokenHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot revoke remember me token: database not available");
    return;
  }
  try {
    await db
      .update(rememberMeTokens)
      .set({ revokedAt: new Date() })
      .where(eq(rememberMeTokens.tokenHash, tokenHash));
  } catch (error) {
    console.error("[Database] Failed to revoke remember me token:", error);
    throw error;
  }
}

export async function revokeAllUserRememberMeTokens(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot revoke user tokens: database not available");
    return;
  }
  try {
    await db
      .update(rememberMeTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(rememberMeTokens.userId, userId),
          isNull(rememberMeTokens.revokedAt)
        )
      );
  } catch (error) {
    console.error("[Database] Failed to revoke user tokens:", error);
    throw error;
  }
}

export async function getActiveRememberMeTokens(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active tokens: database not available");
    return [];
  }
  try {
    return await db
      .select()
      .from(rememberMeTokens)
      .where(
        and(
          eq(rememberMeTokens.userId, userId),
          isNull(rememberMeTokens.revokedAt)
        )
      )
      .orderBy(desc(rememberMeTokens.lastUsedAt));
  } catch (error) {
    console.error("[Database] Failed to get active tokens:", error);
    throw error;
  }
}

export async function cleanupExpiredRememberMeTokens() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot cleanup tokens: database not available");
    return;
  }
  try {
    // Revoke tokens that have expired
    const now = new Date();
    await db
      .update(rememberMeTokens)
      .set({ revokedAt: now })
      .where(
        and(
          isNull(rememberMeTokens.revokedAt),
          // Token expiration check would go here
        )
      );
  } catch (error) {
    console.error("[Database] Failed to cleanup tokens:", error);
    throw error;
  }
}


/**
 * Password Reset Token Management
 */

export async function createPasswordResetToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create password reset token: database not available");
    return;
  }

  try {
    await db.insert(passwordResetTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });
  } catch (error) {
    console.error("[Database] Failed to create password reset token:", error);
    throw error;
  }
}

export async function getPasswordResetToken(tokenHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get password reset token: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get password reset token:", error);
    return null;
  }
}

export async function markPasswordResetTokenAsUsed(tokenHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark token as used: database not available");
    return;
  }

  try {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.tokenHash, tokenHash));
  } catch (error) {
    console.error("[Database] Failed to mark token as used:", error);
    throw error;
  }
}

export async function revokePasswordResetToken(tokenHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot revoke token: database not available");
    return;
  }

  try {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash));
  } catch (error) {
    console.error("[Database] Failed to revoke token:", error);
    throw error;
  }
}

export async function revokeAllPasswordResetTokensForUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot revoke tokens: database not available");
    return;
  }

  try {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to revoke all tokens:", error);
    throw error;
  }
}


/**
 * Case Attachments Management
 */

export async function createCaseAttachment(
  data: {
    submissionId: number;
    caseId: string;
    fileName: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    s3Key: string;
    s3Url: string;
    fileType: string;
    uploadedBy?: string;
    description?: string;
    tags?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create attachment: database not available");
    return;
  }

  try {
    await db.insert(caseAttachments).values({
      submissionId: data.submissionId,
      caseId: data.caseId,
      fileName: data.fileName,
      originalFileName: data.originalFileName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      s3Key: data.s3Key,
      s3Url: data.s3Url,
      fileType: data.fileType as any,
      uploadedBy: data.uploadedBy || "anonymous",
      description: data.description,
      tags: data.tags,
    });
  } catch (error) {
    console.error("[Database] Failed to create attachment:", error);
    throw error;
  }
}

export async function getCaseAttachments(caseId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attachments: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(caseAttachments)
      .where(eq(caseAttachments.caseId, caseId))
      .orderBy(desc(caseAttachments.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get attachments:", error);
    return [];
  }
}

export async function getCaseAttachmentById(attachmentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attachment: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(caseAttachments)
      .where(eq(caseAttachments.id, attachmentId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get attachment:", error);
    return null;
  }
}

export async function updateAttachmentDownloadCount(attachmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update attachment: database not available");
    return;
  }

  try {
    // Get current count
    const attachment = await getCaseAttachmentById(attachmentId);
    if (!attachment) return;

    await db
      .update(caseAttachments)
      .set({
        downloadCount: attachment.downloadCount + 1,
        lastDownloadedAt: new Date(),
      })
      .where(eq(caseAttachments.id, attachmentId));
  } catch (error) {
    console.error("[Database] Failed to update attachment:", error);
  }
}

export async function deleteCaseAttachment(attachmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete attachment: database not available");
    return;
  }

  try {
    // Soft delete
    await db
      .update(caseAttachments)
      .set({ deletedAt: new Date() })
      .where(eq(caseAttachments.id, attachmentId));
  } catch (error) {
    console.error("[Database] Failed to delete attachment:", error);
    throw error;
  }
}

export async function getAttachmentsBySubmissionId(submissionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attachments: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(caseAttachments)
      .where(
        and(
          eq(caseAttachments.submissionId, submissionId),
          isNull(caseAttachments.deletedAt)
        )
      )
      .orderBy(desc(caseAttachments.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get attachments:", error);
    return [];
  }
}


/**
 * Redaction Audit Management
 */

export async function createRedactionAudit(
  data: {
    attachmentId: number;
    caseId: string;
    piiDetected: number;
    piiRedacted: number;
    riskScore: number;
    piiTypes?: string;
    originalTextSample?: string;
    redactedTextSample?: string;
    extractionMethod?: string;
    processingTimeMs?: number;
    status?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create redaction audit: database not available");
    return;
  }

  try {
    await db.insert(redactionAudit).values({
      attachmentId: data.attachmentId,
      caseId: data.caseId,
      piiDetected: data.piiDetected,
      piiRedacted: data.piiRedacted,
      riskScore: data.riskScore,
      piiTypes: data.piiTypes,
      originalTextSample: data.originalTextSample,
      redactedTextSample: data.redactedTextSample,
      extractionMethod: data.extractionMethod,
      processingTimeMs: data.processingTimeMs,
      status: (data.status as any) || "PENDING",
    });
  } catch (error) {
    console.error("[Database] Failed to create redaction audit:", error);
    throw error;
  }
}

export async function getRedactionAuditByAttachmentId(attachmentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get redaction audit: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(redactionAudit)
      .where(eq(redactionAudit.attachmentId, attachmentId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get redaction audit:", error);
    return null;
  }
}

export async function getRedactionAuditByCaseId(caseId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get redaction audits: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(redactionAudit)
      .where(eq(redactionAudit.caseId, caseId))
      .orderBy(desc(redactionAudit.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get redaction audits:", error);
    return [];
  }
}

export async function updateRedactionAuditStatus(
  auditId: number,
  status: string,
  notes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update redaction audit: database not available");
    return;
  }

  try {
    const updateData: any = {
      status: status as any,
      reviewedAt: new Date(),
    };

    if (notes) {
      updateData.reviewNotes = notes;
    }

    await db
      .update(redactionAudit)
      .set(updateData)
      .where(eq(redactionAudit.id, auditId));
  } catch (error) {
    console.error("[Database] Failed to update redaction audit:", error);
    throw error;
  }
}
