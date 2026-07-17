import { describe, expect, it } from "vitest";

import { buildDestinationUrl } from "@/lib/links/build-destination-url";

describe("buildDestinationUrl", () => {
  it("returns the destination when no UTM params are provided", () => {
    expect(
      buildDestinationUrl({
        destinationUrl: "https://example.com/page",
      }),
    ).toBe("https://example.com/page");
  });

  it("appends only provided UTM parameters", () => {
    expect(
      buildDestinationUrl({
        destinationUrl: "https://example.com/page",
        utmSource: "qr",
        utmCampaign: "event",
      }),
    ).toBe("https://example.com/page?utm_source=qr&utm_campaign=event");
  });

  it("appends all UTM parameters", () => {
    expect(
      buildDestinationUrl({
        destinationUrl: "https://example.com/page",
        utmSource: "qr",
        utmMedium: "offline",
        utmCampaign: "summer",
        utmTerm: "booth",
        utmContent: "a",
      }),
    ).toBe(
      "https://example.com/page?utm_source=qr&utm_medium=offline&utm_campaign=summer&utm_term=booth&utm_content=a",
    );
  });

  it("preserves existing query parameters and hash fragments", () => {
    expect(
      buildDestinationUrl({
        destinationUrl: "https://example.com/page?ref=internal#section",
        utmSource: "qr",
        utmCampaign: "event",
      }),
    ).toBe(
      "https://example.com/page?ref=internal&utm_source=qr&utm_campaign=event#section",
    );
  });

  it("ignores empty or whitespace-only UTM values", () => {
    expect(
      buildDestinationUrl({
        destinationUrl: "https://example.com/page",
        utmSource: "  ",
        utmMedium: null,
        utmCampaign: "",
      }),
    ).toBe("https://example.com/page");
  });

  it("encodes special characters in UTM values", () => {
    expect(
      buildDestinationUrl({
        destinationUrl: "https://example.com/page",
        utmContent: "booth a & b",
      }),
    ).toBe("https://example.com/page?utm_content=booth+a+%26+b");
  });
});
