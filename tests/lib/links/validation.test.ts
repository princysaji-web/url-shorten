import { describe, expect, it } from "vitest";

import { isHttpUrl, linkFormSchema } from "@/lib/links/validation";

describe("isHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isHttpUrl("https://example.com/landing-page")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("rejects invalid and non-http URLs", () => {
    expect(isHttpUrl("not-a-url")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("ftp://example.com")).toBe(false);
  });
});

describe("linkFormSchema", () => {
  it("parses a valid destination with optional UTMs", () => {
    const result = linkFormSchema.safeParse({
      destinationUrl: "https://example.com/page",
      utmSource: "qr",
      utmMedium: "",
      utmCampaign: "  summer  ",
      utmTerm: "",
      utmContent: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.utmSource).toBe("qr");
      expect(result.data.utmMedium).toBeNull();
      expect(result.data.utmCampaign).toBe("summer");
    }
  });

  it("rejects invalid destination URLs", () => {
    const result = linkFormSchema.safeParse({
      destinationUrl: "notaurl",
    });
    expect(result.success).toBe(false);
  });
});
