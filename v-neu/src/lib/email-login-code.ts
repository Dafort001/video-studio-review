import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export const EMAIL_LOGIN_CODE_EXPIRY_MS = 10 * 60 * 1000;
export const EMAIL_LOGIN_MAX_ATTEMPTS = 5;

export function generateEmailLoginCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashEmailLoginCode(email: string, code: string): string {
  return hashOneTimeCode("email-login", email, code);
}

export function hashOneTimeCode(purpose: string, email: string, code: string): string {
  return createHash("sha256")
    .update(`pix-shared-auth:${purpose}:${email.trim().toLowerCase()}:${code.trim()}`)
    .digest("hex");
}

export function encodeEmailLoginToken(codeHash: string, attempts = 0): string {
  return `${codeHash}.${attempts}`;
}

export function parseEmailLoginToken(token: string): { codeHash: string; attempts: number } | null {
  const [codeHash, attemptsValue] = token.split(".");
  const attempts = Number.parseInt(attemptsValue ?? "", 10);

  if (!/^[a-f0-9]{64}$/.test(codeHash) || !Number.isInteger(attempts) || attempts < 0) {
    return null;
  }

  return { codeHash, attempts };
}

export function emailLoginCodeMatches(storedHash: string, email: string, code: string): boolean {
  return oneTimeCodeMatches(storedHash, "email-login", email, code);
}

export function oneTimeCodeMatches(storedHash: string, purpose: string, email: string, code: string): boolean {
  const candidateHash = hashOneTimeCode(purpose, email, code);
  return timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(candidateHash, "hex"));
}

export function opaqueRateLimitKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
