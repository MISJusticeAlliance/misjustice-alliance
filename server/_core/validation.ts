import { body, param, query, ValidationChain } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize plain text input
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize email
 */
export const validateEmail = (): ValidationChain => {
  return body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address');
};

/**
 * Validate and sanitize name field
 */
export const validateName = (fieldName: string = 'name'): ValidationChain => {
  return body(fieldName)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(`${fieldName} must be between 2 and 100 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${fieldName} contains invalid characters`)
    .customSanitizer(value => sanitizeText(value));
};

/**
 * Validate and sanitize description/message field
 */
export const validateDescription = (fieldName: string = 'description', minLength: number = 10, maxLength: number = 5000): ValidationChain => {
  return body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
    .customSanitizer(value => sanitizeText(value));
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (fieldName: string = 'phone'): ValidationChain => {
  return body(fieldName)
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters');
};

/**
 * Validate URL
 */
export const validateUrl = (fieldName: string = 'url'): ValidationChain => {
  return body(fieldName)
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid URL format');
};

/**
 * Validate case ID format
 */
export const validateCaseId = (fieldName: string = 'caseId'): ValidationChain => {
  return body(fieldName)
    .trim()
    .matches(/^[A-Z0-9]{8}$/)
    .withMessage('Invalid case ID format (must be 8 alphanumeric characters)');
};

/**
 * Validate date field
 */
export const validateDate = (fieldName: string = 'date'): ValidationChain => {
  return body(fieldName)
    .trim()
    .isISO8601()
    .withMessage('Invalid date format (use ISO 8601 format)');
};

/**
 * Validate enum field
 */
export const validateEnum = (fieldName: string, allowedValues: string[]): ValidationChain => {
  return body(fieldName)
    .trim()
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
};

/**
 * Validate integer field
 */
export const validateInteger = (fieldName: string, min?: number, max?: number): ValidationChain => {
  let validator = body(fieldName)
    .isInt()
    .withMessage(`${fieldName} must be an integer`);
  
  if (min !== undefined) {
    validator = validator.isInt({ min }).withMessage(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined) {
    validator = validator.isInt({ max }).withMessage(`${fieldName} must be at most ${max}`);
  }
  
  return validator;
};

/**
 * Validate array field
 */
export const validateArray = (fieldName: string, minLength: number = 1, maxLength: number = 100): ValidationChain => {
  return body(fieldName)
    .isArray({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be an array with ${minLength} to ${maxLength} items`);
};

/**
 * Validate boolean field
 */
export const validateBoolean = (fieldName: string): ValidationChain => {
  return body(fieldName)
    .isBoolean()
    .withMessage(`${fieldName} must be a boolean value`);
};

/**
 * Validate UUID
 */
export const validateUUID = (fieldName: string = 'id'): ValidationChain => {
  return param(fieldName)
    .isUUID()
    .withMessage('Invalid UUID format');
};

/**
 * Validate pagination parameters
 */
export const validatePagination = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .matches(/^[a-zA-Z0-9_]+(:(asc|desc))?$/)
      .withMessage('Invalid sort parameter format'),
  ];
};

/**
 * Validate search query
 */
export const validateSearchQuery = (fieldName: string = 'q'): ValidationChain => {
  return query(fieldName)
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .customSanitizer(value => sanitizeText(value));
};

/**
 * Validate file upload
 */
export const validateFileUpload = (fieldName: string = 'file', allowedMimes: string[] = ['application/pdf', 'image/jpeg', 'image/png']): ValidationChain => {
  return body(fieldName)
    .custom((value, { req }: any) => {
      if (!req.file) {
        throw new Error('No file provided');
      }
      
      if (!allowedMimes.includes(req.file.mimetype)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`);
      }
      
      if (req.file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds 10MB limit');
      }
      
      return true;
    });
};

/**
 * Validate password strength
 */
export const validatePassword = (fieldName: string = 'password'): ValidationChain => {
  return body(fieldName)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character');
};

/**
 * Validate username
 */
export const validateUsername = (fieldName: string = 'username'): ValidationChain => {
  return body(fieldName)
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens');
};

/**
 * Validate JSON field
 */
export const validateJSON = (fieldName: string): ValidationChain => {
  return body(fieldName)
    .custom(value => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        throw new Error('Invalid JSON format');
      }
    });
};
