import { describe, expect, it } from "vitest";
import { buildHouseholdWhereClause, ensureHouseholdScope } from "@/lib/services/rls-scope";

describe("RLS scoping helpers", () => {
  it("injects household scope into payload writes", () => {
    const payload = ensureHouseholdScope({ amount: 1200 }, "household-1");
    expect(payload.household_id).toBe("household-1");
  });

  it("builds household where clause for queries", () => {
    const where = buildHouseholdWhereClause("household-2");
    expect(where).toEqual({ column: "household_id", value: "household-2" });
  });
});
