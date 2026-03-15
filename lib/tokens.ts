import crypto from "crypto";

/**
 * Generate a cryptographically secure review token.
 * 24 random bytes → 48 hex chars → 192 bits of entropy.
 * Non-sequential, impossible to guess.
 */
export function generateReviewToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Generate a shorter token (e.g. for email OTP verification).
 * 4 bytes → 8-char uppercase hex code.
 */
export function generateOtpCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}
