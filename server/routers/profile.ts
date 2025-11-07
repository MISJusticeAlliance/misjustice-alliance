import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";

/**
 * User profile and preferences management router
 */
export const profileRouter = router({
  /**
   * Get current user's profile information
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastSignedIn: user.lastSignedIn,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[Profile] Failed to get profile:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve profile",
      });
    }
  }),

  /**
   * Update user's profile information
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Update user in database
        await db.upsertUser({
          openId: ctx.user.openId,
          name: input.name ?? user.name,
          email: input.email ?? user.email,
          loginMethod: user.loginMethod,
          role: user.role,
        });

        // Return updated profile
        const updated = await db.getUserByOpenId(ctx.user.openId);
        return {
          id: updated?.id,
          name: updated?.name,
          email: updated?.email,
          role: updated?.role,
          updatedAt: updated?.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Profile] Failed to update profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  /**
   * Get user's preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let preferences = await db.getUserPreferences(user.id);

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await db.createUserPreferences(user.id);
      }

      return preferences;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[Profile] Failed to get preferences:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve preferences",
      });
    }
  }),

  /**
   * Update user's preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        caseUpdates: z.boolean().optional(),
        systemAlerts: z.boolean().optional(),
        theme: z.enum(["light", "dark", "auto"]).optional(),
        language: z.string().length(2).optional(),
        profileVisibility: z.enum(["private", "public"]).optional(),
        showEmail: z.boolean().optional(),
        highContrast: z.boolean().optional(),
        reducedMotion: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Ensure preferences exist
        let preferences = await db.getUserPreferences(user.id);
        if (!preferences) {
          preferences = await db.createUserPreferences(user.id);
        }

        // Update preferences
        const updated = await db.updateUserPreferences(user.id, input);

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Profile] Failed to update preferences:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update preferences",
        });
      }
    }),

  /**
   * Get active Remember Me tokens for current user
   */
  getRememberMeTokens: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const tokens = await db.getActiveRememberMeTokens(user.id);

      // Return sanitized token info (without the actual token hash)
      return tokens.map((token) => ({
        id: token.id,
        deviceName: token.deviceName || "Unknown Device",
        ipAddress: token.ipAddress,
        lastUsedAt: token.lastUsedAt,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
      }));
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[Profile] Failed to get tokens:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve tokens",
      });
    }
  }),

  /**
   * Revoke a specific Remember Me token
   */
  revokeRememberMeToken: protectedProcedure
    .input(z.object({ tokenId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Get the token to verify it belongs to this user
        const tokens = await db.getActiveRememberMeTokens(user.id);
        const token = tokens.find((t) => t.id === input.tokenId);

        if (!token) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token not found",
          });
        }

        // Revoke the token
        await db.revokeRememberMeToken(token.tokenHash);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Profile] Failed to revoke token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to revoke token",
        });
      }
    }),

  /**
   * Revoke all Remember Me tokens for current user
   */
  revokeAllRememberMeTokens: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await db.revokeAllUserRememberMeTokens(user.id);

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("[Profile] Failed to revoke all tokens:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to revoke tokens",
      });
    }
  }),
});
