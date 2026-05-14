import { describe, expect, it } from "vitest";
import { buildSyncRunKey, getQuarterHourBucketIso } from "@/lib/services/sync-service";

describe("sync job idempotency", () => {
  it("generates same run key within same 15-minute window", () => {
    const now = new Date("2026-01-01T10:07:00.000Z").getTime();
    const later = new Date("2026-01-01T10:14:59.000Z").getTime();
    expect(buildSyncRunKey("household-1", now)).toBe(buildSyncRunKey("household-1", later));
    expect(getQuarterHourBucketIso(now)).toBe("2026-01-01T10:00:00.000Z");
  });

  it("generates a new run key for the next quarter-hour", () => {
    const first = new Date("2026-01-01T10:14:59.000Z").getTime();
    const second = new Date("2026-01-01T10:15:00.000Z").getTime();
    expect(buildSyncRunKey("household-1", first)).not.toBe(buildSyncRunKey("household-1", second));
  });
});
