import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { uploadCaseFile, getFileDownloadUrl } from "../_core/fileStorage";
import { validateFileUpload, getFileTypeFromMimeType } from "../_core/fileUpload";

/**
 * File attachments router for case submissions
 */
export const attachmentsRouter = router({
  /**
   * Get all attachments for a case
   */
  getByCaseId: publicProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ input }) => {
      try {
        const attachments = await db.getCaseAttachments(input.caseId);
        
        // Return safe metadata without sensitive info
        return attachments.map(att => ({
          id: att.id,
          fileName: att.originalFileName,
          fileSize: att.fileSize,
          fileType: att.fileType,
          mimeType: att.mimeType,
          description: att.description,
          createdAt: att.createdAt,
          downloadCount: att.downloadCount,
        }));
      } catch (error) {
        console.error("[Attachments] Get failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve attachments",
        });
      }
    }),

  /**
   * Get download URL for an attachment
   */
  getDownloadUrl: publicProcedure
    .input(z.object({ attachmentId: z.number() }))
    .query(async ({ input }) => {
      try {
        const attachment = await db.getCaseAttachmentById(input.attachmentId);
        
        if (!attachment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Attachment not found",
          });
        }

        // Update download count
        await db.updateAttachmentDownloadCount(input.attachmentId);

        // Get download URL
        const downloadUrl = await getFileDownloadUrl(attachment.s3Key);

        return {
          downloadUrl,
          fileName: attachment.originalFileName,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Attachments] Download URL failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get download URL",
        });
      }
    }),

  /**
   * Delete an attachment (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ attachmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete attachments",
          });
        }

        const attachment = await db.getCaseAttachmentById(input.attachmentId);
        
        if (!attachment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Attachment not found",
          });
        }

        // Soft delete
        await db.deleteCaseAttachment(input.attachmentId);

        return {
          success: true,
          message: "Attachment deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Attachments] Delete failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete attachment",
        });
      }
    }),

  /**
   * Get attachment metadata
   */
  getMetadata: publicProcedure
    .input(z.object({ attachmentId: z.number() }))
    .query(async ({ input }) => {
      try {
        const attachment = await db.getCaseAttachmentById(input.attachmentId);
        
        if (!attachment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Attachment not found",
          });
        }

        return {
          id: attachment.id,
          fileName: attachment.originalFileName,
          fileSize: attachment.fileSize,
          fileType: attachment.fileType,
          mimeType: attachment.mimeType,
          description: attachment.description,
          uploadedBy: attachment.uploadedBy,
          createdAt: attachment.createdAt,
          downloadCount: attachment.downloadCount,
          lastDownloadedAt: attachment.lastDownloadedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Attachments] Metadata failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get attachment metadata",
        });
      }
    }),
});
