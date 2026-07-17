import { afterEach, describe, expect, it, vi } from "vitest";

import { buildShortUrl, getShortLinkDomain } from "@/lib/links/short-url";

describe("getShortLinkDomain", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SHORT_LINK_DOMAIN origin only", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SHORT_LINK_DOMAIN",
      "https://url-shorten-sooty.vercel.app/dashboard",
    );
    expect(getShortLinkDomain()).toBe("https://url-shorten-sooty.vercel.app");
  });

  it("strips trailing slashes from plain domain values", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SHORT_LINK_DOMAIN",
      "https://url-shorten-sooty.vercel.app/",
    );
    expect(getShortLinkDomain()).toBe("https://url-shorten-sooty.vercel.app");
  });

  it("falls back when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SHORT_LINK_DOMAIN", "");
    expect(getShortLinkDomain()).toBe("https://www.cs.net");
  });
});

describe("buildShortUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a public short URL without /dashboard", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SHORT_LINK_DOMAIN",
      "https://url-shorten-sooty.vercel.app",
    );
    expect(buildShortUrl("NA2cHRa")).toBe(
      "https://url-shorten-sooty.vercel.app/NA2cHRa",
    );
  });
});
