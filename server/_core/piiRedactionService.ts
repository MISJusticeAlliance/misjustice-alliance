/**
 * PII Redaction Service
 * Orchestrates document extraction, PII detection, and redaction
 */

import { extractTextFromDocument } from "./documentExtraction";
import { detectPII, redactPII, calculatePIIRiskScore } from "./piiDetection";
import { uploadCaseFile } from "./fileStorage";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export interface RedactionServiceResult {
  success: boolean;
  originalFileName: string;
  redactedFileName: string;
  s3Key: string;
  s3Url: string;
  piiDetected: number;
  piiRedacted: number;
  riskScore: number;
  piiTypes: string[];
  processingTimeMs: number;
  auditId?: number;
  requiresManualReview: boolean;
}

/**
 * Process document for PII redaction
 */
export async function processDocumentForPII(
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  caseId: string,
  submissionId: number
): Promise<RedactionServiceResult> {
  const startTime = Date.now();
  let auditId: number | undefined;

  try {
    console.log(`[PII Service] Processing document: ${originalFileName}`);

    // Step 1: Extract text from document
    console.log("[PII Service] Extracting text from document...");
    const extraction = await extractTextFromDocument(
      fileBuffer,
      mimeType,
      originalFileName
    );

    // Step 2: Detect PII in extracted text
    console.log("[PII Service] Detecting PII...");
    const entities = await detectPII(extraction.text);
    const piiDetected = entities.length;
    const piiTypes = Array.from(new Set(entities.map((e) => e.type)));
    const riskScore = calculatePIIRiskScore(entities);

    // Step 3: Redact PII from text
    console.log("[PII Service] Redacting PII...");
    const redactionResult = redactPII(extraction.text, entities);
    const piiRedacted = redactionResult.redactionCount;

    // Step 4: Create redacted document (for now, save as text)
    // In production, you might want to recreate the PDF/document with redactions
    const redactedContent = redactionResult.redactedText;
    const redactedBuffer = Buffer.from(redactedContent, "utf8");

    // Step 5: Upload redacted document to S3
    console.log("[PII Service] Uploading redacted document...");
    const uploadResult = await uploadCaseFile(
      redactedBuffer,
      `redacted-${originalFileName}`,
      caseId,
      "text/plain"
    );

    // Step 6: Create audit log entry
    console.log("[PII Service] Creating audit log...");
    const processingTimeMs = Date.now() - startTime;

    await db.createRedactionAudit({
      attachmentId: submissionId,
      caseId,
      piiDetected,
      piiRedacted,
      riskScore,
      piiTypes: JSON.stringify(piiTypes),
      originalTextSample: extraction.text.substring(0, 500),
      redactedTextSample: redactedContent.substring(0, 500),
      extractionMethod: extraction.extractionMethod,
      processingTimeMs,
      status: riskScore > 70 ? "MANUAL_REVIEW" : "COMPLETED",
    });

    // Determine if manual review is needed
    const requiresManualReview = riskScore > 70 || piiDetected > 10;

    console.log(
      `[PII Service] Processing complete: ${piiDetected} PII entities found, ${piiRedacted} redacted`
    );

    return {
      success: true,
      originalFileName,
      redactedFileName: uploadResult.fileName,
      s3Key: uploadResult.s3Key,
      s3Url: uploadResult.s3Url,
      piiDetected,
      piiRedacted,
      riskScore,
      piiTypes,
      processingTimeMs,
      requiresManualReview,
    };
  } catch (error) {
    console.error("[PII Service] Processing failed:", error);

    // Log failed audit
    try {
      await db.createRedactionAudit({
        attachmentId: submissionId,
        caseId,
        piiDetected: 0,
        piiRedacted: 0,
        riskScore: 0,
        processingTimeMs: Date.now() - startTime,
        status: "FAILED",
      });
    } catch (auditError) {
      console.error("[PII Service] Failed to create audit log:", auditError);
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to process document for PII redaction",
    });
  }
}

/**
 * Get redaction status for a case
 */
export async function getCaseRedactionStatus(caseId: string) {
  try {
    const audits = await db.getRedactionAuditByCaseId(caseId);

    if (audits.length === 0) {
      return {
        caseId,
        documentsProcessed: 0,
        totalPIIDetected: 0,
        totalPIIRedacted: 0,
        averageRiskScore: 0,
        requiresReview: false,
      };
    }

    const totalPIIDetected = audits.reduce((sum, a) => sum + a.piiDetected, 0);
    const totalPIIRedacted = audits.reduce((sum, a) => sum + a.piiRedacted, 0);
    const averageRiskScore =
      Math.round(
        audits.reduce((sum, a) => sum + a.riskScore, 0) / audits.length
      ) || 0;
    const requiresReview = audits.some((a) => a.status === "MANUAL_REVIEW");

    return {
      caseId,
      documentsProcessed: audits.length,
      totalPIIDetected,
      totalPIIRedacted,
      averageRiskScore,
      requiresReview,
      audits: audits.map((a) => ({
        id: a.id,
        attachmentId: a.attachmentId,
        status: a.status,
        piiDetected: a.piiDetected,
        riskScore: a.riskScore,
        createdAt: a.createdAt,
      })),
    };
  } catch (error) {
    console.error("[PII Service] Get status failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get redaction status",
    });
  }
}
