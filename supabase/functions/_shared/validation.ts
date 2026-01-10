/**
 * Validation utilities for edge functions
 * Provides safe extraction and validation helpers
 */

/**
 * Safely extracts domain from email address
 * @param email - Email address
 * @returns Domain string or null if invalid
 */
export function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[1]) {
    return null;
  }
  
  return parts[1].toLowerCase().trim();
}

/**
 * Validates required environment variables
 * @param vars - Object with var names as keys and values
 * @returns Object with isValid flag and missing vars array
 */
export function validateEnvVars(vars: Record<string, string | undefined>): {
  isValid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  for (const [name, value] of Object.entries(vars)) {
    if (!value || value.trim() === '') {
      missing.push(name);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Ensures a string value is never undefined or null
 * @param value - Value to ensure
 * @param fallback - Fallback value if value is falsy
 * @returns Guaranteed string value
 */
export function ensureString(value: string | undefined | null, fallback: string = ''): string {
  if (!value || typeof value !== 'string') {
    return fallback;
  }
  return value;
}
