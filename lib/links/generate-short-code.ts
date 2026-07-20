import { customAlphabet } from "nanoid";

/** URL-safe alphabet without ambiguous characters (0/O, 1/l/I). */
const alphabet =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const nanoid = customAlphabet(alphabet, 7);

export function generateShortCode(): string {
  return nanoid();
}

export const SHORT_CODE_PATTERN = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{4,12}$/;

export const RESERVED_SHORT_CODES = new Set([
  "login",
  "dashboard",
  "links",
  "api",
  "auth",
  "organization",
  "organizations",
  "favicon.ico",
  "_next",
  "public",
]);

export function isValidShortCode(code: string): boolean {
  if (RESERVED_SHORT_CODES.has(code.toLowerCase())) {
    return false;
  }
  return SHORT_CODE_PATTERN.test(code);
}
