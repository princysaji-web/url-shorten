import { beforeEach, describe, expect, it, vi } from "vitest";

const updateTagMock = vi.fn();
const unstableCacheMock = vi.fn((fn: unknown) => fn);
const createAdminClientMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (tag: string) => updateTagMock(tag),
  unstable_cache: (fn: unknown) => unstableCacheMock(fn),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createAdminClientMock(),
}));

import {
  getCachedLinkByShortCode,
  invalidateCachedLink,
  linkCacheTag,
} from "@/lib/cache/link-cache";

describe("link-cache", () => {
  beforeEach(() => {
    updateTagMock.mockReset();
    unstableCacheMock.mockClear();
    createAdminClientMock.mockReset();
  });

  it("builds a stable cache tag per short code", () => {
    expect(linkCacheTag("abc1234")).toBe("link-abc1234");
  });

  it("invalidates via updateTag", () => {
    invalidateCachedLink("abc1234");
    expect(updateTagMock).toHaveBeenCalledWith("link-abc1234");
  });

  it("wraps Supabase lookup with unstable_cache", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "link-1",
        destination_url: "https://example.com",
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        is_active: true,
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    createAdminClientMock.mockReturnValue({ from });

    const link = await getCachedLinkByShortCode("abc1234");

    expect(unstableCacheMock).toHaveBeenCalledWith(expect.any(Function));
    expect(from).toHaveBeenCalledWith("links");
    expect(link).toEqual(
      expect.objectContaining({
        id: "link-1",
        destination_url: "https://example.com",
        is_active: true,
      }),
    );
  });

  it("throws when Supabase returns an error so the miss is not cached as null", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "db down" },
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    createAdminClientMock.mockReturnValue({ from });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(getCachedLinkByShortCode("abc1234")).rejects.toThrow("db down");
  });
});
