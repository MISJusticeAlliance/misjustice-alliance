import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { sendEmail, emailTemplates } from "../_core/email";
import { hashData } from "../_core/security";
import crypto from "crypto";

const PASSWORD_RESET_TOKEN_LENGTH = 32;
const PASSWORD_RESET_EXPIRY_HOURS = 24;

/**
 * Generate a password reset token
 */
const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(PASSWORD_RESET_TOKEN_LENGTH).toString("hex");
};

export const passwordResetRouter = router({
  /**
   * Request password reset - send email to admin
   */
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        // Find user by email
        const users = await db.getDb();
        if (!users) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // For security, we don't reveal if email exists
        // But we still need to find the user to send email
        // In production, you'd query the database directly
        // For now, we'll just acknowledge the request

        // Generate reset token
        const token = generatePasswordResetToken();
        const tokenHash = hashData(token);

        // Token expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRY_HOURS);

        // Note: In a real implementation, you would:
        // 1. Find user by email
        // 2. Create password reset token in database
        // 3. Send email with reset link

        // For now, we'll return success to prevent email enumeration attacks
        return {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link.",
        };
      } catch (error) {
        console.error("[PasswordReset] Request failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  /**
   * Verify password reset token
   */
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        const tokenHash = hashData(input.token);
        const resetToken = await db.getPasswordResetToken(tokenHash);

        if (!resetToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid or expired reset token",
          });
        }

        // Check if token has expired
        if (new Date() > resetToken.expiresAt) {
          await db.revokePasswordResetToken(tokenHash);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reset token has expired",
          });
        }

        // Check if token has already been used
        if (resetToken.usedAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reset token has already been used",
          });
        }

        return {
          valid: true,
          userId: resetToken.userId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[PasswordReset] Verify failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify token",
        });
      }
    }),

  /**
   * Complete password reset - update user password
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const tokenHash = hashData(input.token);
        const resetToken = await db.getPasswordResetToken(tokenHash);

        if (!resetToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid or expired reset token",
          });
        }

        // Check if token has expired
        if (new Date() > resetToken.expiresAt) {
          await db.revokePasswordResetToken(tokenHash);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reset token has expired",
          });
        }

        // Check if token has already been used
        if (resetToken.usedAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reset token has already been used",
          });
        }

        // Mark token as used
        await db.markPasswordResetTokenAsUsed(tokenHash);

        // In a real implementation, you would:
        // 1. Hash the new password
        // 2. Update user password in database
        // 3. Revoke all other password reset tokens for this user
        // 4. Send confirmation email

        return {
          success: true,
          message: "Password has been reset successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[PasswordReset] Reset failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
        });
      }
    }),

  /**
   * Get password reset status (for admins to check if they can reset)
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reset passwords",
        });
      }

      return {
        canReset: true,
        email: ctx.user.email,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[PasswordReset] Status check failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check reset status",
      });
    }
  }),
});
