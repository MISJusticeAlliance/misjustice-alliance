import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import crypto from 'crypto';

/**
 * Rate limiting middleware for general API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * Stricter rate limiting for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Rate limiting for form submissions
 */
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 submissions per hour
  message: 'Too many submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware to validate request and handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: 'param' in err ? err.param : 'unknown',
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Input validation chains for common fields
 */
export const validators = {
  email: () => body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),

  password: () => body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  name: () => body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name contains invalid characters'),

  caseDescription: () => body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters')
    .escape(),

  message: () => body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .escape(),

  caseId: () => body('caseId')
    .trim()
    .matches(/^[A-Z0-9]{8}$/)
    .withMessage('Invalid case ID format'),

  fileSize: (maxSizeMB: number = 10) => (req: any, res: Response, next: NextFunction) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (req.file && req.file.size > maxBytes) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      });
    }
    next();
  },

  fileType: (allowedTypes: string[]) => (req: any, res: Response, next: NextFunction) => {
    if (req.file && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      });
    }
    next();
  },
};

/**
 * CSRF token generation
 */
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Verify CSRF token
 */
export const verifyCSRFToken = (token: string, sessionToken: string): boolean => {
  if (!token || !sessionToken) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: any, options: {
  maxSize?: number;
  allowedMimes?: string[];
  allowedExtensions?: string[];
} = {}): { valid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'],
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds limit' };
  }

  // Check MIME type
  if (!allowedMimes.includes(file.mimetype)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file extension
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return { valid: false, error: 'File extension not allowed' };
  }

  // Check for suspicious file names
  if (file.originalname.includes('..') || file.originalname.includes('/')) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
};

/**
 * Encrypt sensitive data
 */
export const encryptData = (data: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData: string, key: string): string => {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Hash sensitive data
 */
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};
