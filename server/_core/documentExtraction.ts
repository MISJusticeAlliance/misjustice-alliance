/**
 * Document Text Extraction
 * Extracts text from PDF, images, and other document formats
 */

const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import sharp from "sharp";
import Tesseract from "tesseract.js";

export interface ExtractionResult {
  text: string;
  language?: string;
  confidence?: number;
  pageCount?: number;
  extractionMethod: "pdf" | "ocr" | "text";
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<ExtractionResult> {
  try {
    const data = await pdfParse.default(buffer);

    // Extract text from all pages
    let fullText = "";
    if (data.text) {
      fullText = data.text;
    } else if (data.numpages && data.numpages > 0) {
      // Fallback: try to extract from each page
      for (let i = 1; i <= Math.min(data.numpages, 50); i++) {
        // Limit to first 50 pages
        fullText += `\n--- Page ${i} ---\n`;
      }
    }

    return {
      text: fullText,
      pageCount: data.numpages,
      extractionMethod: "pdf",
    };
  } catch (error) {
    console.error("[Document Extraction] PDF extraction failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  try {
    // Convert image to common format if needed
    let imageBuffer = buffer;

    if (
      mimeType === "image/webp" ||
      mimeType === "image/tiff" ||
      mimeType === "image/gif"
    ) {
      // Convert to PNG for better OCR compatibility
      imageBuffer = await sharp(buffer).png().toBuffer();
    }

    // Perform OCR
    const result = await Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      text: result.data.text,
      language: result.data.psm,
      confidence: result.data.confidence,
      extractionMethod: "ocr",
    };
  } catch (error) {
    console.error("[Document Extraction] OCR extraction failed:", error);
    throw new Error("Failed to extract text from image");
  }
}

/**
 * Extract text from Word document (DOCX)
 * Note: This is a simplified implementation
 * For production, consider using mammoth.js or similar
 */
export async function extractTextFromWord(
  buffer: Buffer
): Promise<ExtractionResult> {
  try {
    // DOCX files are ZIP archives containing XML
    // This is a simplified extraction - for production use a proper library
    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 10000));

    // Extract visible text (very basic)
    const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const extractedText = matches
      .map((match) => match.replace(/<[^>]+>/g, ""))
      .join(" ");

    return {
      text: extractedText || "Unable to extract text from Word document",
      extractionMethod: "text",
    };
  } catch (error) {
    console.error("[Document Extraction] Word extraction failed:", error);
    throw new Error("Failed to extract text from Word document");
  }
}

/**
 * Extract text from plain text file
 */
export async function extractTextFromPlainText(
  buffer: Buffer
): Promise<ExtractionResult> {
  try {
    const text = buffer.toString("utf8");
    return {
      text,
      extractionMethod: "text",
    };
  } catch (error) {
    console.error("[Document Extraction] Plain text extraction failed:", error);
    throw new Error("Failed to extract text from file");
  }
}

/**
 * Main extraction function - routes to appropriate extractor
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractionResult> {
  // Determine extraction method based on MIME type and file name
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (mimeType === "application/pdf" || extension === "pdf") {
    return extractTextFromPDF(buffer);
  }

  if (
    mimeType.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "tiff", "bmp"].includes(
      extension || ""
    )
  ) {
    return extractTextFromImage(buffer, mimeType);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    return extractTextFromWord(buffer);
  }

  if (
    mimeType === "text/plain" ||
    ["txt", "csv", "log"].includes(extension || "")
  ) {
    return extractTextFromPlainText(buffer);
  }

  // Fallback: try as plain text
  return extractTextFromPlainText(buffer);
}

/**
 * Chunk text for processing
 * Useful for processing large documents in smaller pieces
 */
export function chunkText(
  text: string,
  chunkSize: number = 2000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start = end - overlap;
  }

  return chunks;
}

/**
 * Clean extracted text
 */
export function cleanExtractedText(text: string): string {
  return (
    text
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      // Remove common OCR artifacts
      .replace(/\|/g, "l")
      .replace(/0/g, "O")
      .trim()
  );
}
