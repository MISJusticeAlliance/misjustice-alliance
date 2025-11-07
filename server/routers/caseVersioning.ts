import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  createCaseVersion,
  getCaseVersionHistory,
  getCaseVersion,
  createFileVersion,
  getFileVersionHistory,
  getFileVersion,
  createCaseUpdate,
  getCaseUpdates,
  approveCaseUpdate,
  publishCaseUpdate,
  rejectCaseUpdate,
} from "../db";

export const caseVersioningRouter = router({
  // ============ Case Version Procedures ============
  
  getCaseVersionHistory: publicProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ input }) => {
      return await getCaseVersionHistory(input.caseId);
    }),

  getCaseVersion: publicProcedure
    .input(z.object({ caseId: z.string(), versionNumber: z.number() }))
    .query(async ({ input }) => {
      return await getCaseVersion(input.caseId, input.versionNumber);
    }),

  createCaseVersion: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
        versionNumber: z.number(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        changeType: z.string(),
        changeDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createCaseVersion(
        input.caseId,
        input.versionNumber,
        input.title,
        input.description,
        input.category,
        input.changeType,
        input.changeDescription || null,
        ctx.user.id
      );
      return { success: true };
    }),

  // ============ File Version Procedures ============

  getFileVersionHistory: publicProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ input }) => {
      return await getFileVersionHistory(input.fileId);
    }),

  getFileVersion: publicProcedure
    .input(z.object({ fileId: z.number(), versionNumber: z.number() }))
    .query(async ({ input }) => {
      return await getFileVersion(input.fileId, input.versionNumber);
    }),

  createFileVersion: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
        versionNumber: z.number(),
        s3Key: z.string(),
        encryptedKey: z.string(),
        originalFileName: z.string(),
        fileSize: z.number(),
        fileType: z.string(),
        mimeType: z.string(),
        versionLabel: z.string().optional(),
        changeDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createFileVersion(
        input.fileId,
        input.versionNumber,
        input.s3Key,
        input.encryptedKey,
        input.originalFileName,
        input.fileSize,
        input.fileType,
        input.mimeType,
        input.versionLabel || null,
        input.changeDescription || null,
        ctx.user.id
      );
      return { success: true };
    }),

  // ============ Case Update Procedures ============

  getCaseUpdates: publicProcedure
    .input(z.object({ caseId: z.string(), status: z.string().optional() }))
    .query(async ({ input }) => {
      return await getCaseUpdates(input.caseId, input.status);
    }),

  submitCaseUpdate: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
        updateTitle: z.string(),
        updateDescription: z.string(),
        updateContent: z.string().optional(),
        updateType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateId = await createCaseUpdate(
        input.caseId,
        input.updateTitle,
        input.updateDescription,
        input.updateContent || null,
        input.updateType,
        ctx.user.id
      );
      return { success: true, updateId };
    }),

  approveCaseUpdate: protectedProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await approveCaseUpdate(input.updateId, ctx.user.id);
      return { success: true };
    }),

  publishCaseUpdate: protectedProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ input }) => {
      await publishCaseUpdate(input.updateId);
      return { success: true };
    }),

  rejectCaseUpdate: protectedProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await rejectCaseUpdate(input.updateId, ctx.user.id);
      return { success: true };
    }),
});
