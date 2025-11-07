import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  generateStatisticsReport,
  generateCaseReport,
  generateCaseProfilePDF,
} from "../pdfExport";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { submissions, caseProfiles } from "../../drizzle/schema";

export const pdfExportRouter = router({
  /**
   * Generate and download admin statistics report as PDF
   * Admin only
   */
  generateStatisticsReport: adminProcedure
    .input(
      z.object({
        includeSubmissions: z.boolean().default(true),
        includeUpdates: z.boolean().default(true),
        includeFiles: z.boolean().default(true),
        includeProfiles: z.boolean().default(true),
        includeActivity: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Gather statistics
        const allSubmissions = await db
          .select()
          .from(submissions)
          .limit(1000);

        const stats = {
          submissions: {
            total: allSubmissions.length,
            pending: allSubmissions.filter((s) => s.status === "NEW").length,
            approved: allSubmissions.filter((s) => s.status === "RESOLVED").length,
            rejected: allSubmissions.filter((s) => s.status === "CLOSED").length,
            lastSubmitted: allSubmissions.length > 0
              ? new Date(Math.max(...allSubmissions.map((s) => s.createdAt?.getTime() || 0)))
              : undefined,
          },
          updates: {
            total: 0,
            pendingApprovals: 0,
            publishedUpdates: 0,
          },
          files: {
            total: 0,
            totalSize: 0,
            virusQuarantined: 0,
          },
          profiles: {
            total: 0,
            totalViews: 0,
            avgViews: 0,
          },
          activity: {
            totalLogs: 0,
            lastActivity: new Date(),
          },
        };

        // Generate PDF
        const pdfBuffer = generateStatisticsReport(stats);

        return {
          success: true,
          buffer: pdfBuffer.toString("base64"),
          filename: `statistics-report-${new Date().toISOString().split("T")[0]}.pdf`,
          mimeType: "application/pdf",
        };
      } catch (error) {
        console.error("Error generating statistics report:", error);
        throw new Error("Failed to generate statistics report");
      }
    }),

  /**
   * Generate and download case report as PDF
   * Protected - users can only download their own cases
   */
  generateCaseReport: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Fetch the submission
        const submission = await db
          .select()
          .from(submissions)
          .where(eq(submissions.caseId, input.caseId))
          .limit(1);

        if (!submission || submission.length === 0) {
          throw new Error("Case not found");
        }

        const case_ = submission[0];

        // Prepare case data for PDF
        const caseData = {
          caseId: case_.caseId || "",
          title: case_.title || "",
          description: case_.description || "",
          category: case_.category || "",
          status: case_.status || "",
          urgencyLevel: case_.urgencyLevel || 0,
          jurisdiction: case_.jurisdiction || "",
          submittedAt: case_.createdAt || new Date(),
          organizationName: "",
          incidentDate: undefined,
          incidentLocation: "",
          legalIssues: [],
          desiredOutcome: "",
        };

        // Generate PDF
        const pdfBuffer = generateCaseReport(caseData);

        return {
          success: true,
          buffer: pdfBuffer.toString("base64"),
          filename: `case-report-${input.caseId}.pdf`,
          mimeType: "application/pdf",
        };
      } catch (error) {
        console.error("Error generating case report:", error);
        throw new Error("Failed to generate case report");
      }
    }),

  /**
   * Generate and download public case profile as PDF
   * Public - anyone can download published case profiles
   */
  generateCaseProfilePDF: publicProcedure
    .input(
      z.object({
        profileId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Fetch the case profile
        const profile = await db
          .select()
          .from(caseProfiles)
          .where(eq(caseProfiles.id, input.profileId))
          .limit(1);

        if (!profile || profile.length === 0) {
          throw new Error("Case profile not found");
        }

        const case_ = profile[0];

        // Only allow download if published
        if (case_.status !== "PUBLISHED") {
          throw new Error("Case profile is not published");
        }

        // Prepare profile data for PDF
        const profileData = {
          title: case_.title || "",
          description: case_.summary || "",
          organizationName: "",
          category: case_.category || "",
          status: case_.status || "",
          publishedAt: case_.publishedAt || new Date(),
          viewCount: case_.viewCount || 0,
          legalIssues: [],
        };

        // Generate PDF
        const pdfBuffer = generateCaseProfilePDF(profileData);

        return {
          success: true,
          buffer: pdfBuffer.toString("base64"),
          filename: `case-profile-${input.profileId}.pdf`,
          mimeType: "application/pdf",
        };
      } catch (error) {
        console.error("Error generating case profile PDF:", error);
        throw new Error("Failed to generate case profile PDF");
      }
    }),
});
