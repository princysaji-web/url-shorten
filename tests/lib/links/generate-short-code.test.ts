import { describe, expect, it } from "vitest";

import {
  generateShortCode,
  isValidShortCode,
  SHORT_CODE_PATTERN,
} from "@/lib/links/generate-short-code";

describe("generateShortCode", () => {
  it("generates URL-safe codes of length 7", () => {
    const code = generateShortCode();
    expect(code).toHaveLength(7);
    expect(SHORT_CODE_PATTERN.test(code)).toBe(true);
  });

  it("generates unique values across many samples", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateShortCode()));
    expect(codes.size).toBe(200);
  });
});

describe("isValidShortCode", () => {
  it("accepts generated codes", () => {
    expect(isValidShortCode(generateShortCode())).toBe(true);
  });

  it("rejects reserved route names", () => {
    expect(isValidShortCode("login")).toBe(false);
    expect(isValidShortCode("dashboard")).toBe(false);
    expect(isValidShortCode("links")).toBe(false);
    expect(isValidShortCode("organization")).toBe(false);
    expect(isValidShortCode("auth")).toBe(false);
  });

  it("rejects invalid characters", () => {
    expect(isValidShortCode("abc$12")).toBe(false);
    expect(isValidShortCode("ab")).toBe(false);
  });
});
