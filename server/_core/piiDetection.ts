/**
 * PII Detection and Redaction Engine
 * Uses regex patterns and LLM-powered NER for comprehensive PII detection
 */

import { invokeLLM } from "./llm";

export interface PIIEntity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface RedactionResult {
  originalText: string;
  redactedText: string;
  entitiesFound: PIIEntity[];
  redactionCount: number;
  redactionPercentage: number;
}

/**
 * PII Pattern definitions
 */
const PII_PATTERNS = {
  // Social Security Number (XXX-XX-XXXX or XXXXXXXXX)
  SSN: {
    pattern: /\b(?:\d{3}-\d{2}-\d{4}|\d{9})\b/g,
    type: "SSN",
    replacement: "[SSN REDACTED]",
  },

  // Phone Numbers (various formats)
  PHONE: {
    pattern:
      /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    type: "PHONE",
    replacement: "[PHONE REDACTED]",
  },

  // Email Addresses
  EMAIL: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    type: "EMAIL",
    replacement: "[EMAIL REDACTED]",
  },

  // Credit Card Numbers (16 digits with optional spaces/dashes)
  CREDIT_CARD: {
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    type: "CREDIT_CARD",
    replacement: "[CREDIT CARD REDACTED]",
  },

  // Driver's License (simplified - varies by state)
  DRIVERS_LICENSE: {
    pattern: /\b[A-Z]{1,2}\d{5,8}\b/g,
    type: "DRIVERS_LICENSE",
    replacement: "[LICENSE REDACTED]",
  },

  // Passport Number (simplified)
  PASSPORT: {
    pattern: /\b[A-Z]{1,2}\d{6,9}\b/g,
    type: "PASSPORT",
    replacement: "[PASSPORT REDACTED]",
  },

  // Bank Account Numbers (simplified - 8-17 digits)
  BANK_ACCOUNT: {
    pattern: /\b\d{8,17}\b/g,
    type: "BANK_ACCOUNT",
    replacement: "[ACCOUNT REDACTED]",
  },

  // IP Addresses (IPv4)
  IP_ADDRESS: {
    pattern:
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    type: "IP_ADDRESS",
    replacement: "[IP REDACTED]",
  },

  // Date of Birth (MM/DD/YYYY or MM-DD-YYYY)
  DOB: {
    pattern: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g,
    type: "DOB",
    replacement: "[DOB REDACTED]",
  },

  // Medical Record Numbers
  MEDICAL_RECORD: {
    pattern: /\bMRN\s*[:#]?\s*\d{6,10}\b/gi,
    type: "MEDICAL_RECORD",
    replacement: "[MRN REDACTED]",
  },

  // Case Numbers
  CASE_NUMBER: {
    pattern: /\b\d{2}-\d{4,6}-\d{2,4}\b/g,
    type: "CASE_NUMBER",
    replacement: "[CASE# REDACTED]",
  },
};

/**
 * Detect PII using regex patterns
 */
export function detectPIIWithRegex(text: string): PIIEntity[] {
  const entities: PIIEntity[] = [];

  for (const [key, config] of Object.entries(PII_PATTERNS)) {
    let match;
    const pattern = new RegExp(config.pattern.source, config.pattern.flags);

    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: config.type,
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
        confidence: 0.95, // High confidence for regex matches
      });
    }
  }

  // Sort by position
  entities.sort((a, b) => a.start - b.start);

  return entities;
}

/**
 * Detect PII using LLM-powered Named Entity Recognition
 */
export async function detectPIIWithLLM(text: string): Promise<PIIEntity[]> {
  try {
    // Limit text to first 4000 characters for LLM processing
    const limitedText = text.substring(0, 4000);

    const systemPrompt = "You are a PII (Personally Identifiable Information) detection expert. Analyze the provided text and identify all PII entities. Return a JSON array with detected entities. Each entity should have: type (SSN, PHONE, EMAIL, CREDIT_CARD, NAME, ADDRESS, DOB, MEDICAL, FINANCIAL, etc.), value (the actual text), start (character position), end (end position), confidence (0-1). Only return the JSON array, no other text.";
    const userPrompt = "Detect PII in this text:\n\n" + limitedText;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ] as any,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pii_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    value: { type: "string" },
                    start: { type: "number" },
                    end: { type: "number" },
                    confidence: { type: "number" },
                  },
                  required: ["type", "value", "start", "end", "confidence"],
                },
              },
            },
            required: ["entities"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    try {
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      return parsed.entities || [];
    } catch {
      console.warn("[PII Detection] Failed to parse LLM response");
      return [];
    }
  } catch (error) {
    console.error("[PII Detection] LLM detection failed:", error);
    return [];
  }
}

/**
 * Combine regex and LLM detection results
 */
export async function detectPII(text: string): Promise<PIIEntity[]> {
  // Get regex matches
  const regexEntities = detectPIIWithRegex(text);

  // Get LLM matches (for complex patterns like names, addresses)
  let llmEntities: PIIEntity[] = [];
  try {
    llmEntities = await detectPIIWithLLM(text);
  } catch (error) {
    console.warn("[PII Detection] LLM detection skipped, using regex only");
  }

  // Merge and deduplicate entities
  const allEntities = [...regexEntities, ...llmEntities];
  const uniqueEntities = deduplicateEntities(allEntities);

  return uniqueEntities;
}

/**
 * Deduplicate overlapping entities, keeping highest confidence
 */
function deduplicateEntities(entities: PIIEntity[]): PIIEntity[] {
  if (entities.length === 0) return [];

  // Sort by position
  entities.sort((a, b) => a.start - b.start);

  const deduplicated: PIIEntity[] = [];

  for (const entity of entities) {
    // Check if this entity overlaps with any existing entity
    const overlapping = deduplicated.find(
      (e) => !(e.end <= entity.start || entity.end <= e.start)
    );

    if (overlapping) {
      // Keep the one with higher confidence
      if (entity.confidence > overlapping.confidence) {
        const index = deduplicated.indexOf(overlapping);
        deduplicated[index] = entity;
      }
    } else {
      deduplicated.push(entity);
    }
  }

  return deduplicated;
}

/**
 * Redact PII from text
 */
export function redactPII(text: string, entities: PIIEntity[]): RedactionResult {
  let redactedText = text;
  let redactionCount = 0;

  // Sort entities in reverse order to maintain correct positions
  const sortedEntities = [...entities].sort((a, b) => b.start - a.start);

  for (const entity of sortedEntities) {
    const replacement = getPIIReplacement(entity.type);
    redactedText =
      redactedText.substring(0, entity.start) +
      replacement +
      redactedText.substring(entity.end);
    redactionCount++;
  }

  const redactionPercentage =
    text.length > 0
      ? Math.round(
          (entities.reduce((sum, e) => sum + (e.end - e.start), 0) /
            text.length) *
            100
        )
      : 0;

  return {
    originalText: text,
    redactedText,
    entitiesFound: entities,
    redactionCount,
    redactionPercentage,
  };
}

/**
 * Get replacement text for PII type
 */
function getPIIReplacement(type: string): string {
  const replacements: Record<string, string> = {
    SSN: "[SSN]",
    PHONE: "[PHONE]",
    EMAIL: "[EMAIL]",
    CREDIT_CARD: "[CC]",
    DRIVERS_LICENSE: "[LICENSE]",
    PASSPORT: "[PASSPORT]",
    BANK_ACCOUNT: "[ACCOUNT]",
    IP_ADDRESS: "[IP]",
    DOB: "[DOB]",
    MEDICAL_RECORD: "[MRN]",
    CASE_NUMBER: "[CASE#]",
    NAME: "[NAME]",
    ADDRESS: "[ADDRESS]",
    MEDICAL: "[MEDICAL]",
    FINANCIAL: "[FINANCIAL]",
  };

  return replacements[type] || `[${type}]`;
}

/**
 * Calculate PII risk score (0-100)
 */
export function calculatePIIRiskScore(entities: PIIEntity[]): number {
  if (entities.length === 0) return 0;

  // Weight different types of PII
  const weights: Record<string, number> = {
    SSN: 25,
    CREDIT_CARD: 25,
    BANK_ACCOUNT: 20,
    PASSPORT: 20,
    DRIVERS_LICENSE: 15,
    PHONE: 10,
    EMAIL: 8,
    DOB: 10,
    MEDICAL_RECORD: 15,
    ADDRESS: 12,
    NAME: 5,
    FINANCIAL: 15,
  };

  let totalScore = 0;
  for (const entity of entities) {
    const weight = weights[entity.type] || 5;
    totalScore += weight * entity.confidence;
  }

  // Normalize to 0-100
  return Math.min(100, Math.round((totalScore / entities.length) * 2));
}
