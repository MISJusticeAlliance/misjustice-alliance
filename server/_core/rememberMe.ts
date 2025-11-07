import crypto from 'crypto';
import { Request, Response } from 'express';
import * as db from '../db';
import { hashData } from './security';

const REMEMBER_ME_COOKIE_NAME = 'remember_me_token';
const REMEMBER_ME_DURATION_DAYS = 30;
const REMEMBER_ME_TOKEN_LENGTH = 32;

/**
 * Generate a new Remember Me token
 */
export const generateRememberMeToken = (): string => {
  return crypto.randomBytes(REMEMBER_ME_TOKEN_LENGTH).toString('hex');
};

/**
 * Create and store a Remember Me token for a user
 */
export const createRememberMeToken = async (
  userId: number,
  req: Request,
  deviceName?: string
): Promise<string> => {
  try {
    const token = generateRememberMeToken();
    const tokenHash = hashData(token);
    
    // Token expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REMEMBER_ME_DURATION_DAYS);

    // Extract device info from request
    const userAgent = req.headers['user-agent'];
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';

    // Store token hash in database
    await db.createRememberMeToken(
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
      deviceName
    );

    return token;
  } catch (error) {
    console.error('[RememberMe] Failed to create token:', error);
    throw error;
  }
};

/**
 * Set Remember Me cookie
 */
export const setRememberMeCookie = (res: Response, token: string): void => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REMEMBER_ME_DURATION_DAYS);

  res.cookie(REMEMBER_ME_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
};

/**
 * Clear Remember Me cookie
 */
export const clearRememberMeCookie = (res: Response): void => {
  res.clearCookie(REMEMBER_ME_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

/**
 * Verify Remember Me token and get user
 */
export const verifyRememberMeToken = async (token: string) => {
  try {
    if (!token) {
      return null;
    }

    const tokenHash = hashData(token);
    const rememberMeToken = await db.getRememberMeToken(tokenHash);

    if (!rememberMeToken) {
      return null;
    }

    // Check if token has expired
    if (new Date() > rememberMeToken.expiresAt) {
      await db.revokeRememberMeToken(tokenHash);
      return null;
    }

    // Update last used timestamp
    await db.updateRememberMeTokenLastUsed(tokenHash);

    // Get user
    const user = await db.getUserByOpenId(rememberMeToken.userId.toString());
    return user;
  } catch (error) {
    console.error('[RememberMe] Failed to verify token:', error);
    return null;
  }
};

/**
 * Get Remember Me token from request
 */
export const getRememberMeTokenFromRequest = (req: Request): string | null => {
  return req.cookies?.[REMEMBER_ME_COOKIE_NAME] || null;
};

/**
 * Revoke Remember Me token
 */
export const revokeRememberMeToken = async (token: string): Promise<void> => {
  try {
    const tokenHash = hashData(token);
    await db.revokeRememberMeToken(tokenHash);
  } catch (error) {
    console.error('[RememberMe] Failed to revoke token:', error);
    throw error;
  }
};

/**
 * Revoke all Remember Me tokens for a user (useful on logout)
 */
export const revokeAllUserRememberMeTokens = async (userId: number): Promise<void> => {
  try {
    await db.revokeAllUserRememberMeTokens(userId);
  } catch (error) {
    console.error('[RememberMe] Failed to revoke all tokens:', error);
    throw error;
  }
};

/**
 * Middleware to handle Remember Me authentication
 * This should be used before the main OAuth/session middleware
 */
export const rememberMeMiddleware = async (req: any, res: Response, next: Function) => {
  try {
    const token = getRememberMeTokenFromRequest(req);
    
    if (token && !req.user) {
      const user = await verifyRememberMeToken(token);
      if (user) {
        // Attach user to request for downstream middleware
        req.rememberMeUser = user;
      }
    }
  } catch (error) {
    console.error('[RememberMe] Middleware error:', error);
  }
  
  next();
};
