const STATIC_FX_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83.5
};

export const convertToInr = (value: number, currency = "INR") => {
  const rate = STATIC_FX_TO_INR[currency] ?? 1;
  return value * rate;
};

export const getFxRate = (currency = "INR") => STATIC_FX_TO_INR[currency] ?? 1;

// TODO: Replace static map with live FX table / provider feed.
