import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2),
  provider_type: z.enum(["zerodha", "groww", "indmoney_csv", "manual", "bank", "cash"]),
  account_category: z.enum(["brokerage", "mutual_fund", "stock", "cash", "bank", "other"]),
  base_currency: z.string().default("INR"),
  status: z.enum(["active", "inactive", "error"]).default("active")
});

export const csvParseRequestSchema = z.object({
  uploadId: z.string().uuid(),
  parserOptions: z
    .object({
      defaultCurrency: z.string().optional(),
      customMapping: z.record(z.array(z.string())).optional()
    })
    .optional()
});

export const csvCommitRequestSchema = z.object({
  importJobId: z.string().uuid()
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member")
});

export const manualTransactionSchema = z.object({
  account_id: z.string().uuid(),
  transaction_type: z.enum([
    "buy",
    "sell",
    "dividend",
    "interest",
    "fee",
    "transfer",
    "expense",
    "income",
    "deposit",
    "withdrawal"
  ]),
  amount: z.coerce.number(),
  quantity: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  transaction_date: z.string(),
  asset_name: z.string().optional(),
  symbol: z.string().optional(),
  currency: z.string().default("INR"),
  notes: z.string().optional()
});

export const expenseSchema = z.object({
  category_id: z.string().uuid(),
  paid_by_user_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().default("INR"),
  entry_type: z.enum(["expense", "income"]),
  expense_date: z.string(),
  note: z.string().optional(),
  receipt_url: z.string().url().optional(),
  split_mode: z.enum(["equal", "manual"]).default("equal")
});
