import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getCaseSubmissionStats,
  getCaseUpdateStats,
  getFileStats,
  getCaseProfileStats,
  getAdminActivityStats,
  getCaseFilesForDownload,
  getAllCaseFiles,
  logFileDownload,
} from "../db";
import { z } from "zod";

export const adminStatsRouter = router({
  // Statistics endpoints
  getSubmissionStats: adminProcedure.query(async () => {
    return await getCaseSubmissionStats();
  }),

  getCaseUpdateStats: adminProcedure.query(async () => {
    return await getCaseUpdateStats();
  }),

  getFileStats: adminProcedure.query(async () => {
    return await getFileStats();
  }),

  getCaseProfileStats: adminProcedure.query(async () => {
    return await getCaseProfileStats();
  }),

  getAdminActivityStats: adminProcedure.query(async () => {
    return await getAdminActivityStats();
  }),

  // Combined dashboard stats
  getDashboardStats: adminProcedure.query(async () => {
    const [submissions, updates, files, profiles, activity] = await Promise.all([
      getCaseSubmissionStats(),
      getCaseUpdateStats(),
      getFileStats(),
      getCaseProfileStats(),
      getAdminActivityStats(),
    ]);

    return {
      submissions,
      updates,
      files,
      profiles,
      activity,
    };
  }),

  // File download endpoints
  getCaseFiles: adminProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ input, ctx }) => {
      const files = await getCaseFilesForDownload(input.caseId);
      
      // Log the access
      if (ctx.user?.id) {
        for (const file of files) {
          await logFileDownload(file.id, ctx.user.id);
        }
      }

      return files;
    }),

  getAllFiles: adminProcedure.query(async ({ ctx }) => {
    const files = await getAllCaseFiles();
    
    // Log bulk access
    if (ctx.user?.id) {
      for (const file of files) {
        await logFileDownload(file.id, ctx.user.id);
      }
    }

    return files;
  }),

  // Statistics by time period
  getStatsByDateRange: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // This would require additional database queries filtered by date
      // For now, return all stats
      return {
        startDate: input.startDate,
        endDate: input.endDate,
        message: "Date range filtering available in extended version",
      };
    }),
});
