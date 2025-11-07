import { TRPCError } from "@trpc/server";
import crypto from "crypto";

/**
 * File upload configuration and validation
 */

// Maximum file size: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types for different file categories
export const ALLOWED_MIME_TYPES = {
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ],
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
  ],
  EVIDENCE: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "audio/mpeg",
    "audio/wav",
  ],
  LEGAL_BRIEF: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// File extension whitelist
export const ALLOWED_EXTENSIONS = [
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "csv",
  "rtf",
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "tiff",
  "bmp",
  // Video/Audio
  "mp4",
  "mov",
  "avi",
  "mkv",
  "mp3",
  "wav",
  "m4a",
];

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: {
    name: string;
    size: number;
    type: string;
  },
  fileType: string
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file size minimum (at least 1 byte)
  if (file.size < 1) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // Get file extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not allowed`,
    };
  }

  // Check MIME type against allowed types for this file category
  const allowedMimeTypes = ALLOWED_MIME_TYPES[fileType as keyof typeof ALLOWED_MIME_TYPES] || [];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `MIME type ${file.type} is not allowed for this file category`,
    };
  }

  // Check for suspicious file names
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return {
      valid: false,
      error: "Invalid file name",
    };
  }

  return { valid: true };
}

/**
 * Generate secure file name for S3 storage
 */
export function generateSecureFileName(originalName: string, caseId: string): string {
  // Extract extension
  const extension = originalName.split(".").pop()?.toLowerCase() || "bin";

  // Generate random suffix to prevent collisions and enumeration
  const randomSuffix = crypto.randomBytes(8).toString("hex");

  // Create safe file name
  const timestamp = Date.now();
  const safeName = `${caseId}-${timestamp}-${randomSuffix}.${extension}`;

  return safeName;
}

/**
 * Get file type from MIME type
 */
export function getFileTypeFromMimeType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "EVIDENCE";
  if (mimeType.startsWith("audio/")) return "EVIDENCE";
  if (mimeType === "application/pdf") return "DOCUMENT";
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("officedocument")
  ) {
    return "LEGAL_BRIEF";
  }
  return "OTHER";
}

/**
 * Sanitize file name for display
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and suspicious characters
  return fileName
    .replace(/[\/\\]/g, "")
    .replace(/\.\./g, "")
    .substring(0, 255);
}

/**
 * Validate file buffer for suspicious content
 */
export async function validateFileBuffer(buffer: Buffer): Promise<boolean> {
  // Check for common malware signatures (simplified check)
  // In production, use a proper antivirus library like ClamAV

  // Check for executable signatures
  const executableSignatures = [
    Buffer.from([0x4d, 0x5a]), // MZ - Windows executable
    Buffer.from([0x7f, 0x45, 0x4c, 0x46]), // ELF - Linux executable
  ];

  for (const signature of executableSignatures) {
    if (buffer.subarray(0, signature.length).equals(signature)) {
      return false;
    }
  }

  return true;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
