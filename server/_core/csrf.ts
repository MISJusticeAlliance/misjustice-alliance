import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a CSRF token
 */
export const generateToken = (): string => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

/**
 * Middleware to generate and attach CSRF token to response
 */
export const csrfTokenMiddleware = (req: any, res: Response, next: NextFunction) => {
  // Generate token if not already in session
  if (!req.session || !req.session.csrfToken) {
    const token = generateToken();
    if (req.session) {
      req.session.csrfToken = token;
    }
    res.setHeader(CSRF_HEADER_NAME, token);
  } else {
    res.setHeader(CSRF_HEADER_NAME, req.session.csrfToken);
  }
  next();
};

/**
 * Middleware to verify CSRF token
 * Skip verification for GET, HEAD, OPTIONS requests
 */
export const verifyCsrfToken = (req: any, res: Response, next: NextFunction) => {
  // Skip CSRF verification for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF verification for certain paths (e.g., health checks)
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  const token = req.headers[CSRF_HEADER_NAME] as string || req.body?.csrfToken;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
    });
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    const tokenBuffer = Buffer.from(token, 'hex');
    const sessionBuffer = Buffer.from(sessionToken, 'hex');
    
    if (tokenBuffer.length !== sessionBuffer.length) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token invalid',
      });
    }

    if (!crypto.timingSafeEqual(tokenBuffer, sessionBuffer)) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token mismatch',
      });
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token verification failed',
    });
  }

  next();
};

/**
 * Regenerate CSRF token (useful after login/logout)
 */
export const regenerateToken = (req: any): string => {
  const token = generateToken();
  if (req.session) {
    req.session.csrfToken = token;
  }
  return token;
};
