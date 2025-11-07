import crypto from 'crypto';

/**
 * Encryption service for protecting sensitive legal data.
 * Uses AES-256-GCM for authenticated encryption.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Derives an encryption key from a password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

/**
 * Gets the master encryption key from environment
 */
function getMasterKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY || process.env.JWT_SECRET;
  if (!key) {
    throw new Error('ENCRYPTION_MASTER_KEY or JWT_SECRET must be set');
  }
  return key;
}

/**
 * Encrypts data and returns base64-encoded string with format:
 * salt:iv:authTag:encryptedData
 */
export function encrypt(plaintext: string): string {
  try {
    const masterKey = getMasterKey();
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from master key and salt
    const key = deriveKey(masterKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine all components
    const result = [
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted
    ].join(':');
    
    return result;
  } catch (error) {
    console.error('[Encryption] Failed to encrypt data:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts data from the format: salt:iv:authTag:encryptedData
 */
export function decrypt(encryptedData: string): string {
  try {
    const masterKey = getMasterKey();
    
    // Split components
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltB64, ivB64, authTagB64, encrypted] = parts;
    
    // Convert from base64
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    
    // Derive key
    const key = deriveKey(masterKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Failed to decrypt data:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Encrypts an object by converting to JSON first
 */
export function encryptObject(obj: any): string {
  const json = JSON.stringify(obj);
  return encrypt(json);
}

/**
 * Decrypts and parses JSON object
 */
export function decryptObject<T = any>(encryptedData: string): T {
  const json = decrypt(encryptedData);
  return JSON.parse(json);
}

/**
 * Generates a unique case ID for anonymous tracking
 */
export function generateCaseId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(8).toString('hex');
  return `CASE-${timestamp}-${randomPart}`.toUpperCase();
}

/**
 * Generates a random encryption key for file storage
 */
export function generateFileEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Hashes sensitive data for comparison without storing plaintext
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
