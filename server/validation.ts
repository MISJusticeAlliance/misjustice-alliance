import { z } from 'zod';

/**
 * Validation schemas for legal advocacy platform.
 * Ensures data integrity and security for sensitive legal information.
 */

export const submissionCategorySchema = z.enum([
  'CIVIL_RIGHTS',
  'POLICE_MISCONDUCT',
  'LEGAL_MALPRACTICE',
  'PROSECUTORIAL_MISCONDUCT',
  'CONSTITUTIONAL_VIOLATION',
  'INSTITUTIONAL_CORRUPTION',
  'OTHER'
]);

export const jurisdictionSchema = z.enum([
  'Montana',
  'Washington',
  'Federal',
  'Multi-State'
]);

export const submissionStatusSchema = z.enum([
  'NEW',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'AWAITING_INFO',
  'RESOLVED',
  'CLOSED'
]);

/**
 * Schema for creating a new anonymous case submission
 */
export const createSubmissionSchema = z.object({
  category: submissionCategorySchema,
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(10000, 'Description must not exceed 10,000 characters')
    .trim(),
  jurisdiction: jurisdictionSchema,
  urgencyLevel: z.number()
    .int()
    .min(1, 'Urgency level must be at least 1')
    .max(10, 'Urgency level must not exceed 10')
    .default(5),
  
  // Optional encrypted contact information
  contactEmail: z.string().email('Invalid email format').optional(),
  contactPhone: z.string().max(50).optional(),
  personalDetails: z.object({
    age: z.number().int().min(0).max(150).optional(),
    location: z.string().max(200).optional(),
    additionalInfo: z.string().max(2000).optional(),
  }).optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

/**
 * Schema for looking up a case by case ID
 */
export const caseIdSchema = z.object({
  caseId: z.string()
    .min(10, 'Invalid case ID format')
    .max(100, 'Invalid case ID format')
    .regex(/^CASE-[A-Z0-9-]+$/, 'Invalid case ID format'),
});

/**
 * Schema for creating a message in a case
 */
export const createMessageSchema = z.object({
  caseId: z.string().min(10),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must not exceed 5,000 characters')
    .trim(),
  sender: z.enum(['SUBMITTER', 'ADMIN']),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

/**
 * Schema for updating submission status (admin only)
 */
export const updateSubmissionStatusSchema = z.object({
  id: z.number().int().positive(),
  status: submissionStatusSchema,
});

/**
 * Schema for assigning a case to an admin (admin only)
 */
export const assignSubmissionSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
});

/**
 * Schema for creating legal resources (admin only)
 */
export const createLegalResourceSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  content: z.string()
    .min(20, 'Content must be at least 20 characters')
    .trim(),
  excerpt: z.string().max(500).optional(),
  category: z.string().min(1).max(100),
  jurisdiction: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  isPublished: z.boolean().default(false),
});

export type CreateLegalResourceInput = z.infer<typeof createLegalResourceSchema>;

/**
 * Schema for file upload validation
 */
export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
});

/**
 * Allowed file types for document uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

/**
 * Validates if a mime type is allowed
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any);
}

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}
