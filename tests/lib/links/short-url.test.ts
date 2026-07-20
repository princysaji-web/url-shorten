import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildShortUrl,
  getAuthCallbackUrl,
  getShortLinkDomain,
  withAppAuthRedirect,
} from "@/lib/links/short-url";

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

describe("withAppAuthRedirect", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("replaces localhost redirect_to with the public app callback", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SHORT_LINK_DOMAIN",
      "https://url-shorten-sooty.vercel.app",
    );

    const rewritten = withAppAuthRedirect(
      "https://pleflwokbfdbzbmksgrj.supabase.co/auth/v1/verify?token=abc&type=invite&redirect_to=http://localhost:3000",
    );

    expect(rewritten).toContain(
      "redirect_to=" +
        encodeURIComponent(getAuthCallbackUrl()),
    );
    expect(rewritten).not.toContain("localhost");
  });
});
