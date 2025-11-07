/**
 * File storage service for case attachments
 * Uses the built-in S3 storage proxy
 */

import { storagePut, storageGet } from "../storage";
import { generateSecureFileName, validateFileBuffer } from "./fileUpload";
import { TRPCError } from "@trpc/server";

/**
 * Upload file to S3 storage
 */
export async function uploadCaseFile(
  buffer: Buffer,
  originalFileName: string,
  caseId: string,
  mimeType: string
): Promise<{
  s3Key: string;
  s3Url: string;
  fileName: string;
}> {
  try {
    // Validate file buffer for suspicious content
    const isValidBuffer = await validateFileBuffer(buffer);
    if (!isValidBuffer) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "File content validation failed - file may contain malicious content",
      });
    }

    // Generate secure file name
    const fileName = generateSecureFileName(originalFileName, caseId);

    // Create S3 key path
    const s3Key = `cases/${caseId}/${fileName}`;

    // Upload to S3
    const { key, url } = await storagePut(s3Key, buffer, mimeType);

    return {
      s3Key: key,
      s3Url: url,
      fileName,
    };
  } catch (error) {
    console.error("[FileStorage] Upload failed:", error);
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to upload file to storage",
    });
  }
}

/**
 * Get download URL for file
 */
export async function getFileDownloadUrl(s3Key: string): Promise<string> {
  try {
    const { url } = await storageGet(s3Key);
    return url;
  } catch (error) {
    console.error("[FileStorage] Get URL failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get file download URL",
    });
  }
}

/**
 * Delete file from S3 storage
 * Note: The current storage API may not support deletion
 * This is a placeholder for future implementation
 */
export async function deleteCaseFile(s3Key: string): Promise<void> {
  try {
    // TODO: Implement file deletion when storage API supports it
    console.log("[FileStorage] File deletion not yet implemented:", s3Key);
  } catch (error) {
    console.error("[FileStorage] Delete failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete file from storage",
    });
  }
}
