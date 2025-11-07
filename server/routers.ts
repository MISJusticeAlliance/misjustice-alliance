import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { encrypt, decrypt, generateCaseId } from "./encryption";
import { sendEmail, emailTemplates } from "./_core/email";
import { 
  createSubmissionSchema, 
  caseIdSchema, 
  createMessageSchema,
  updateSubmissionStatusSchema,
  assignSubmissionSchema,
  createLegalResourceSchema
} from "./validation";
import { caseVersioningRouter } from "./routers/caseVersioning";
import { adminStatsRouter } from "./routers/adminStats";
import { pdfExportRouter } from "./routers/pdfExport";
import { contactRouter } from "./routers/contact";
import { profileRouter } from "./routers/profile";
import { passwordResetRouter } from "./routers/passwordReset";
import { attachmentsRouter } from "./routers/attachments";

/**
 * Admin-only procedure that checks if user has admin role
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Admin access required' 
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: profileRouter,
  
  passwordReset: passwordResetRouter,
  
  attachments: attachmentsRouter,

  /**
   * Public submission endpoints for anonymous case submissions
   */
  submissions: router({
    /**
     * Create a new anonymous case submission
     */
    create: publicProcedure
      .input(createSubmissionSchema)
      .mutation(async ({ input, ctx }) => {
        try {
          // Generate unique case ID
          const caseId = generateCaseId();
          
          // Encrypt sensitive contact information if provided
          const encryptedContactEmail = input.contactEmail 
            ? encrypt(input.contactEmail) 
            : null;
          const encryptedContactPhone = input.contactPhone 
            ? encrypt(input.contactPhone) 
            : null;
          const encryptedPersonalDetails = input.personalDetails 
            ? encrypt(JSON.stringify(input.personalDetails)) 
            : null;
          
          // Create submission in database
          await db.createSubmission({
            caseId,
            category: input.category,
            title: input.title,
            description: input.description,
            jurisdiction: input.jurisdiction,
            urgencyLevel: input.urgencyLevel,
            encryptedContactEmail,
            encryptedContactPhone,
            encryptedPersonalDetails,
            status: 'NEW',
            ipAddress: ctx.req.ip || null,
            userAgent: ctx.req.headers['user-agent'] || null,
            submissionMethod: 'web',
          });
          
          // Log the submission
          await db.createSystemLog({
            level: 'INFO',
            action: 'SUBMISSION_CREATED',
            message: `New case submission created: ${caseId}`,
            contextData: JSON.stringify({ category: input.category, jurisdiction: input.jurisdiction }),
            ipAddress: ctx.req.ip || null,
            userAgent: ctx.req.headers['user-agent'] || null,
          });
          
          // Send confirmation email if contact email provided
          if (input.contactEmail) {
            const emailHtml = emailTemplates.caseCreationConfirmation(
              caseId,
              input.title,
              input.category,
              input.jurisdiction
            );
            sendEmail({
              to: input.contactEmail,
              subject: `Case Submission Confirmation - Case ID: ${caseId}`,
              html: emailHtml,
            }).catch(error => {
              console.error('[Email] Failed to send case confirmation:', error);
            });
          }
          
          return {
            success: true,
            caseId,
            message: 'Your case has been submitted successfully. Please save your case ID for tracking.',
          };
        } catch (error) {
          console.error('[Submissions] Create error:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create submission',
          });
        }
      }),
    
    /**
     * Get submission details by case ID (public for anonymous tracking)
     */
    getByCaseId: publicProcedure
      .input(caseIdSchema)
      .query(async ({ input }) => {
        const submission = await db.getSubmissionByCaseId(input.caseId);
        
        if (!submission) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Case not found',
          });
        }
        
        // Return only non-sensitive information for public access
        return {
          caseId: submission.caseId,
          category: submission.category,
          title: submission.title,
          description: submission.description,
          jurisdiction: submission.jurisdiction,
          urgencyLevel: submission.urgencyLevel,
          status: submission.status,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
        };
      }),
    
    /**
     * Get all submissions (admin only)
     */
    getAll: adminProcedure.query(async () => {
      const submissions = await db.getAllSubmissions();
      
      // Decrypt sensitive fields for admin view
      return submissions.map(sub => ({
        ...sub,
        contactEmail: sub.encryptedContactEmail ? decrypt(sub.encryptedContactEmail) : null,
        contactPhone: sub.encryptedContactPhone ? decrypt(sub.encryptedContactPhone) : null,
        personalDetails: sub.encryptedPersonalDetails 
          ? JSON.parse(decrypt(sub.encryptedPersonalDetails)) 
          : null,
      }));
    }),
    
    /**
     * Update submission status (admin only)
     */
    updateStatus: adminProcedure
      .input(updateSubmissionStatusSchema)
      .mutation(async ({ input, ctx }) => {
        const submission = await db.getSubmissionById(input.id);
        
        await db.updateSubmissionStatus(
          input.id, 
          input.status,
          new Date()
        );
        
        await db.createSystemLog({
          level: 'INFO',
          action: 'SUBMISSION_STATUS_UPDATED',
          message: `Submission ${input.id} status updated to ${input.status}`,
          userId: ctx.user.id,
        });
        
        if (submission && submission.encryptedContactEmail) {
          const contactEmail = decrypt(submission.encryptedContactEmail);
          const emailHtml = emailTemplates.caseUpdateNotification(
            submission.caseId,
            submission.title,
            `Case Status Update: ${input.status}`,
            `Your case status has been updated to: ${input.status}`
          );
          sendEmail({
            to: contactEmail,
            subject: `Case Update - ${submission.caseId}: Status Changed to ${input.status}`,
            html: emailHtml,
          }).catch(error => {
            console.error('[Email] Failed to send status update:', error);
          });
        }
        
        return { success: true };
      }),
    
    /**
     * Assign submission to admin (admin only)
     */
    assign: adminProcedure
      .input(assignSubmissionSchema)
      .mutation(async ({ input, ctx }) => {
        await db.assignSubmission(input.id, input.userId);
        
        await db.createSystemLog({
          level: 'INFO',
          action: 'SUBMISSION_ASSIGNED',
          message: `Submission ${input.id} assigned to user ${input.userId}`,
          userId: ctx.user.id,
        });
        
        return { success: true };
      }),
  }),

  /**
   * Messaging endpoints for case communication
   */
  messages: router({
    /**
     * Get messages for a case (public with case ID)
     */
    getByCaseId: publicProcedure
      .input(caseIdSchema)
      .query(async ({ input }) => {
        const submission = await db.getSubmissionByCaseId(input.caseId);
        
        if (!submission) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Case not found',
          });
        }
        
        const messages = await db.getMessagesBySubmissionId(submission.id);
        
        // Decrypt message content
        return messages.map(msg => ({
          id: msg.id,
          content: decrypt(msg.encryptedContent),
          sender: msg.sender,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        }));
      }),
    
    /**
     * Create a new message (public for submitters, protected for admins)
     */
    create: publicProcedure
      .input(createMessageSchema)
      .mutation(async ({ input, ctx }) => {
        const submission = await db.getSubmissionByCaseId(input.caseId);
        
        if (!submission) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Case not found',
          });
        }
        
        // Encrypt message content
        const encryptedContent = encrypt(input.content);
        
        // Determine sender user ID (null for anonymous submitters)
        const senderUserId = ctx.user ? ctx.user.id : null;
        
        await db.createMessage({
          submissionId: submission.id,
          encryptedContent,
          sender: input.sender,
          senderUserId,
          isRead: false,
        });
        
        await db.createSystemLog({
          level: 'INFO',
          action: 'MESSAGE_CREATED',
          message: `New message in case ${input.caseId}`,
          contextData: JSON.stringify({ sender: input.sender }),
          userId: senderUserId || undefined,
        });
        
        return { success: true };
      }),
    
    /**
     * Mark message as read (admin only)
     */
    markAsRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessageAsRead(input.id);
        return { success: true };
      }),
  }),

  /**
   * Legal resources endpoints
   */
  resources: router({
    /**
     * Get all published legal resources (public)
     */
    getPublished: publicProcedure.query(async () => {
      const resources = await db.getPublishedLegalResources();
      
      return resources.map(resource => ({
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : [],
      }));
    }),
    
    /**
     * Get legal resource by slug (public)
     */
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const resource = await db.getLegalResourceBySlug(input.slug);
        
        if (!resource) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Resource not found',
          });
        }
        
        return {
          ...resource,
          tags: resource.tags ? JSON.parse(resource.tags) : [],
        };
      }),
    
    /**
     * Get all legal resources including unpublished (admin only)
     */
    getAll: adminProcedure.query(async () => {
      const resources = await db.getAllLegalResources();
      
      return resources.map(resource => ({
        ...resource,
        tags: resource.tags ? JSON.parse(resource.tags) : [],
      }));
    }),
    
    /**
     * Create legal resource (admin only)
     */
    create: adminProcedure
      .input(createLegalResourceSchema)
      .mutation(async ({ input, ctx }) => {
        await db.createLegalResource({
          ...input,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          authorUserId: ctx.user.id,
          publishedAt: input.isPublished ? new Date() : null,
        });
        
        await db.createSystemLog({
          level: 'INFO',
          action: 'LEGAL_RESOURCE_CREATED',
          message: `Legal resource created: ${input.title}`,
          userId: ctx.user.id,
        });
        
        return { success: true };
      }),
  }),

  /**
   * Admin analytics and monitoring
   */
  admin: router({
    /**
     * Get dashboard statistics (admin only)
     */
    getStats: adminProcedure.query(async () => {
      const allSubmissions = await db.getAllSubmissions();
      
      const stats = {
        totalSubmissions: allSubmissions.length,
        newSubmissions: allSubmissions.filter(s => s.status === 'NEW').length,
        underReview: allSubmissions.filter(s => s.status === 'UNDER_REVIEW').length,
        inProgress: allSubmissions.filter(s => s.status === 'IN_PROGRESS').length,
        resolved: allSubmissions.filter(s => s.status === 'RESOLVED').length,
        byCategory: {} as Record<string, number>,
        byJurisdiction: {} as Record<string, number>,
      };
      
      // Count by category
      allSubmissions.forEach(sub => {
        stats.byCategory[sub.category] = (stats.byCategory[sub.category] || 0) + 1;
        stats.byJurisdiction[sub.jurisdiction] = (stats.byJurisdiction[sub.jurisdiction] || 0) + 1;
      });
      
      return stats;
    }),
    
    /**
     * Get recent system logs (admin only)
     */
    getLogs: adminProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return await db.getRecentSystemLogs(input.limit);
      }),
  }),

  /**
   * Public case profiles for raising case awareness
   */
  caseProfiles: router({
    /**
     * Get all published case profiles with pagination
     */
    getPublished: publicProcedure
      .input(z.object({ 
        limit: z.number().default(20),
        offset: z.number().default(0),
        category: z.string().optional(),
        jurisdiction: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPublishedCaseProfiles(input.limit, input.offset);
      }),

    /**
     * Get a single case profile by slug
     */
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const profile = await db.getCaseProfileBySlug(input.slug);
        if (profile) {
          // Increment view count
          await db.incrementCaseProfileViewCount(profile.id);
        }
        return profile;
      }),

    /**
     * Get attachments for a case profile
     */
    getAttachments: publicProcedure
      .input(z.object({ caseProfileId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaseProfileAttachments(input.caseProfileId);
      }),

    /**
     * Get published updates for a case profile
     */
    getUpdates: publicProcedure
      .input(z.object({ caseProfileId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaseProfileUpdates(input.caseProfileId);
      }),

    /**
     * Submit a new case profile (public, but requires approval)
     */
    submit: publicProcedure
      .input(z.object({
        title: z.string().min(10).max(255),
        summary: z.string().min(50).max(1000),
        category: z.enum([
          "CIVIL_RIGHTS",
          "POLICE_MISCONDUCT",
          "LEGAL_MALPRACTICE",
          "PROSECUTORIAL_MISCONDUCT",
          "CONSTITUTIONAL_VIOLATION",
          "INSTITUTIONAL_CORRUPTION",
          "OTHER"
        ]),
        jurisdiction: z.enum(["Montana", "Washington", "Federal", "Multi-State"]),
        allegedOrganizations: z.array(z.string()),
        fullContent: z.string().min(100),
      }))
      .mutation(async ({ input }) => {
        try {
          // Generate SEO/GEO content
          const seoContent = `Case Profile: ${input.title}. Category: ${input.category}. Jurisdiction: ${input.jurisdiction}. Organizations: ${input.allegedOrganizations.join(", ")}.`;
          
          const slug = input.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 200);

          const profile = await db.createCaseProfile({
            profileSlug: slug,
            title: input.title,
            summary: input.summary,
            category: input.category,
            jurisdiction: input.jurisdiction,
            allegedOrganizations: JSON.stringify(input.allegedOrganizations),
            fullContent: input.fullContent,
            metaTitle: input.title,
            metaDescription: input.summary,
            seoKeywords: JSON.stringify([input.category, input.jurisdiction, ...input.allegedOrganizations]),
            generatedSeoContent: seoContent,
            status: "PENDING_APPROVAL",
          });

          return profile;
        } catch (error) {
          console.error("Failed to submit case profile:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit case profile"
          });
        }
      }),

    /**
     * Submit an update to an existing case profile
     */
    submitUpdate: publicProcedure
      .input(z.object({
        caseProfileId: z.number(),
        title: z.string().min(10).max(255),
        content: z.string().min(50),
        updateReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const seoContent = `Update to: ${input.title}. Reason: ${input.updateReason || "Case development"}.`;
          
          const update = await db.createCaseProfileUpdate({
            caseProfileId: input.caseProfileId,
            title: input.title,
            content: input.content,
            updateReason: input.updateReason,
            generatedSeoContent: seoContent,
            status: "PENDING_APPROVAL",
          });

          return update;
        } catch (error) {
          console.error("Failed to submit case profile update:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit update"
          });
        }
      }),

    /**
     * Admin: Get pending case profiles for approval
     */
    getPendingProfiles: adminProcedure.query(async () => {
      return await db.getPendingCaseProfiles();
    }),

    /**
     * Admin: Get pending updates for approval
     */
    getPendingUpdates: adminProcedure.query(async () => {
      return await db.getPendingCaseProfileUpdates();
    }),

    /**
     * Admin: Approve a case profile
     */
    approveProfile: adminProcedure
      .input(z.object({
        profileId: z.number(),
        approvalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.updateCaseProfileStatus(
            input.profileId,
            "PUBLISHED",
            ctx.user.id,
            input.approvalNotes
          );
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to approve profile"
          });
        }
      }),

    /**
     * Admin: Reject a case profile
     */
    rejectProfile: adminProcedure
      .input(z.object({
        profileId: z.number(),
        rejectionReason: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.updateCaseProfileStatus(
            input.profileId,
            "ARCHIVED",
            undefined,
            input.rejectionReason
          );
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reject profile"
          });
        }
      }),

    /**
     * Admin: Approve a case profile update
     */
    approveUpdate: adminProcedure
      .input(z.object({
        updateId: z.number(),
        approvalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.updateCaseProfileUpdateStatus(
            input.updateId,
            "PUBLISHED",
            ctx.user.id,
            input.approvalNotes
          );
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to approve update"
          });
        }
      }),

    /**
     * Admin: Reject a case profile update
     */
    rejectUpdate: adminProcedure
      .input(z.object({
        updateId: z.number(),
        rejectionReason: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.updateCaseProfileUpdateStatus(
            input.updateId,
            "REJECTED",
            undefined,
            input.rejectionReason
          );
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reject update"
          });
        }
      }),
  }),

  /**
   * File management system for case evidence and documentation
   */
  files: router({
    /**
     * Get all files for a case
     */
    getCaseFiles: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        try {
          const files = await db.getCaseFiles(input.caseId);
          return files;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch case files"
          });
        }
      }),

    /**
     * Get file details by ID
     */
    getFileById: protectedProcedure
      .input(z.object({ fileId: z.number() }))
      .query(async ({ input }) => {
        try {
          const file = await db.getCaseFileById(input.fileId);
          if (!file) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "File not found"
            });
          }
          return file;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch file"
          });
        }
      }),

    /**
     * Delete a file (admin only)
     */
    deleteFile: adminProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const file = await db.getCaseFileById(input.fileId);
          if (!file) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "File not found"
            });
          }

          await db.deleteCaseFile(input.fileId);
          return { success: true, message: "File deleted successfully" };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete file"
          });
        }
      }),

    /**
     * Get file access logs (admin only)
     */
    getAccessLogs: adminProcedure
      .input(z.object({ fileId: z.number() }))
      .query(async ({ input }) => {
        try {
          const logs = await db.getFileAccessLogs(input.fileId);
          return logs;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch access logs"
          });
        }
      }),
  }),

  /**
   * Notifications system for users and admins
   */
  notifications: router({
    /**
     * Get user's notifications with pagination
     */
    getNotifications: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getUserNotifications(ctx.user.id, input.limit, input.offset);
      }),

    /**
     * Get unread notification count
     */
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await db.getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),

    /**
     * Mark a notification as read
     */
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),

    /**
     * Mark all notifications as read
     */
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),

    /**
     * Archive a notification
     */
    archive: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.archiveNotification(input.notificationId);
        return { success: true };
      }),

    /**
     * Delete a notification
     */
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.notificationId);
        return { success: true };
      }),

    /**
     * Get user's notification preferences
     */
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      let prefs = await db.getNotificationPreferences(ctx.user.id);
      
      // Create default preferences if they don't exist
      if (!prefs) {
        await db.createNotificationPreferences({
          userId: ctx.user.id,
        });
        prefs = await db.getNotificationPreferences(ctx.user.id);
      }
      
      return prefs;
    }),

    /**
     * Update notification preferences
     */
    updatePreferences: protectedProcedure
      .input(z.object({
        emailNotificationsEnabled: z.boolean().optional(),
        emailOnCaseUpdate: z.boolean().optional(),
        emailOnMessage: z.boolean().optional(),
        emailOnProfilePublished: z.boolean().optional(),
        emailDigestFrequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY", "NEVER"]).optional(),
        inAppNotificationsEnabled: z.boolean().optional(),
        showNotificationBadge: z.boolean().optional(),
        pushNotificationsEnabled: z.boolean().optional(),
        receiveSystemUpdates: z.boolean().optional(),
        receiveAdminAlerts: z.boolean().optional(),
        receiveMarketingEmails: z.boolean().optional(),
        doNotDisturbEnabled: z.boolean().optional(),
        doNotDisturbStart: z.string().optional(),
        doNotDisturbEnd: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateNotificationPreferences(ctx.user.id, input);
        return { success: true };
      }),

    /**
     * Admin: Create a notification for a user
     */
    createNotification: adminProcedure
      .input(z.object({
        userId: z.number(),
        type: z.enum([
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
        ]),
        title: z.string(),
        message: z.string(),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
        actionUrl: z.string().optional(),
        actionLabel: z.string().optional(),
        sentViaEmail: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const notification = await db.createNotification({
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          priority: input.priority || "NORMAL",
          actionUrl: input.actionUrl,
          actionLabel: input.actionLabel,
          sentViaEmail: input.sentViaEmail,
        });
        return notification;
       }),
  }),
  
  /**
   * Case versioning and history endpoints
   */
  caseVersioning: caseVersioningRouter,
  
  /**
   * Admin statistics and file download endpoints
   */
  adminStats: adminStatsRouter,
  
  /**
   * PDF export endpoints
   */
  pdfExport: pdfExportRouter,
  
  /**
   * Contact form endpoints
   */
  contact: contactRouter,
});
export type AppRouter = typeof appRouter;
