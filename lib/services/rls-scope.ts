export const ensureHouseholdScope = <T extends object>(payload: T, householdId: string): T & { household_id: string } => {
  return {
    ...payload,
    household_id: householdId
  };
};

export const buildHouseholdWhereClause = (householdId: string) => ({
  column: "household_id",
  value: householdId
});
