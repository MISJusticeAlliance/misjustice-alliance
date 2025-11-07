import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

/**
 * File Upload Service
 * Handles secure file uploads with encryption, virus scanning, and validation
 */

// Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_MIME_TYPES: [
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/rtf",
    // Images
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/bmp",
    "image/tiff",
    // Archives
    "application/zip",
    "application/x-tar",
    "application/gzip",
    "application/x-bzip2",
    "application/x-7z-compressed",
  ],
  ALLOWED_EXTENSIONS: [
    // Documents
    ".pdf", ".doc", ".docx", ".txt", ".md", ".rtf",
    // Images
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff",
    // Archives
    ".zip", ".tar", ".tar.gz", ".tar.bz2", ".7z",
  ],
  RATE_LIMIT_PER_HOUR: 10,
  UPLOAD_DIRECTORY: process.env.UPLOAD_DIR || "/tmp/case_files",
  QUARANTINE_DIRECTORY: process.env.QUARANTINE_DIR || "/tmp/quarantine",
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  size?: number;
}

export interface FileEncryptionResult {
  encryptedPath: string;
  encryptionKey: string;
  iv: string;
  checksum: string;
}

export interface VirusScanResult {
  status: "CLEAN" | "INFECTED" | "SUSPICIOUS" | "ERROR";
  threats: string[];
  scanDuration: number;
  scanEngine: string;
  timestamp: Date;
}

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  originalName: string;
  encryptedFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  virusScanResult?: VirusScanResult;
  error?: string;
}

/**
 * Validate file before processing
 */
export function validateFile(
  filename: string,
  mimeType: string,
  fileSize: number
): FileValidationResult {
  // Check file size
  if (fileSize > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  if (!FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Check MIME type
  if (!FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type not allowed: ${mimeType}`,
    };
  }

  return {
    valid: true,
    mimeType,
    size: fileSize,
  };
}

/**
 * Calculate SHA-256 checksum of file
 */
export async function calculateFileChecksum(filePath: string): Promise<string> {
  const hash = crypto.createHash("sha256");
  const fileBuffer = await fs.readFile(filePath);
  hash.update(fileBuffer);
  return hash.digest("hex");
}

/**
 * Encrypt file using AES-256-GCM
 */
export async function encryptFile(
  filePath: string,
  originalFilename: string
): Promise<FileEncryptionResult> {
  try {
    // Generate encryption key and IV
    const encryptionKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16); // 128-bit IV

    // Read file
    const fileBuffer = await fs.readFile(filePath);

    // Create cipher
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

    // Encrypt file
    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const encryptedData = Buffer.concat([iv, authTag, encrypted]);

    // Generate encrypted filename
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const encryptedFilename = `${timestamp}_${randomSuffix}.enc`;

    // Write encrypted file
    const encryptedPath = path.join(FILE_UPLOAD_CONFIG.UPLOAD_DIRECTORY, encryptedFilename);
    await fs.mkdir(FILE_UPLOAD_CONFIG.UPLOAD_DIRECTORY, { recursive: true });
    await fs.writeFile(encryptedPath, encryptedData);

    // Calculate checksum of original file
    const checksum = await calculateFileChecksum(filePath);

    return {
      encryptedPath,
      encryptionKey: encryptionKey.toString("base64"),
      iv: iv.toString("base64"),
      checksum,
    };
  } catch (error) {
    console.error("[FileUploadService] Encryption failed:", error);
    throw error;
  }
}

/**
 * Decrypt file using AES-256-GCM
 */
export async function decryptFile(
  encryptedPath: string,
  encryptionKey: string,
  iv: string
): Promise<Buffer> {
  try {
    // Read encrypted file
    const encryptedData = await fs.readFile(encryptedPath);

    // Extract components
    const keyBuffer = Buffer.from(encryptionKey, "base64");
    const ivBuffer = Buffer.from(iv, "base64");
    const authTag = encryptedData.slice(16, 32); // 16 bytes IV + 16 bytes auth tag
    const encrypted = encryptedData.slice(32); // Rest is encrypted data

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer);
    decipher.setAuthTag(authTag);

    // Decrypt file
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  } catch (error) {
    console.error("[FileUploadService] Decryption failed:", error);
    throw error;
  }
}

/**
 * Mock virus scan (in production, integrate with ClamAV or similar)
 */
export async function scanFileForViruses(
  filePath: string,
  filename: string
): Promise<VirusScanResult> {
  try {
    // In production, this would integrate with ClamAV or similar service
    // For now, return a mock result
    console.log(`[FileUploadService] Scanning file: ${filename}`);

    const startTime = Date.now();

    // Simulate scan delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const scanDuration = Date.now() - startTime;

    // Mock detection: flag files with suspicious patterns in name
    const suspiciousPatterns = ["malware", "virus", "trojan", "backdoor"];
    const isSuspicious = suspiciousPatterns.some((pattern) =>
      filename.toLowerCase().includes(pattern)
    );

    return {
      status: isSuspicious ? "SUSPICIOUS" : "CLEAN",
      threats: isSuspicious ? ["Suspicious filename pattern detected"] : [],
      scanDuration,
      scanEngine: "MockScanner",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[FileUploadService] Virus scan failed:", error);
    return {
      status: "ERROR",
      threats: ["Scan error"],
      scanDuration: 0,
      scanEngine: "MockScanner",
      timestamp: new Date(),
    };
  }
}

/**
 * Quarantine suspicious file
 */
export async function quarantineFile(
  filePath: string,
  reason: string
): Promise<void> {
  try {
    const filename = path.basename(filePath);
    const quarantinePath = path.join(
      FILE_UPLOAD_CONFIG.QUARANTINE_DIRECTORY,
      `${Date.now()}_${filename}`
    );

    await fs.mkdir(FILE_UPLOAD_CONFIG.QUARANTINE_DIRECTORY, { recursive: true });
    await fs.copyFile(filePath, quarantinePath);

    // Log quarantine
    console.log(`[FileUploadService] File quarantined: ${filename} - Reason: ${reason}`);
  } catch (error) {
    console.error("[FileUploadService] Quarantine failed:", error);
    throw error;
  }
}

/**
 * Generate unique encrypted filename
 */
export function generateEncryptedFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalFilename);
  return `${timestamp}_${randomSuffix}${ext}.enc`;
}

/**
 * Validate rate limit for user uploads
 */
export async function checkRateLimit(userId: number): Promise<boolean> {
  // In production, check against database or cache
  // For now, return true (no rate limiting)
  return true;
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn("[FileUploadService] Failed to cleanup temp file:", error);
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "MEDIA";
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("text")) {
    return "LEGAL_DOCUMENTS";
  }
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("gzip")) {
    return "EVIDENCE";
  }
  return "OTHER";
}
