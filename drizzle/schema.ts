import { integer, pgTable, text, timestamp, varchar, pgEnum, numeric } from "drizzle-orm/pg-core";

/**
 * Wallets table - stores connected Solana wallets
 * No user authentication required - wallet address is the identity
 */
export const wallets = pgTable("wallets", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  publicKey: varchar("publicKey", { length: 64 }).notNull().unique(),
  isActive: integer("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Transactions table - stores all private transaction operations
 */
export const transactionTypeEnum = pgEnum("transaction_type", ["shield", "transfer", "unshield"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "confirmed", "failed"]);

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  walletId: integer("walletId").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 20, scale: 9 }).notNull(), // Amount in lamports
  amountSol: numeric("amountSol", { precision: 20, scale: 9 }).notNull(), // Amount in SOL for display
  recipientPublicKey: varchar("recipientPublicKey", { length: 64 }), // Only for transfers
  txSignature: varchar("txSignature", { length: 128 }).notNull(),
  payinAddress: varchar("payinAddress", { length: 128 }), // ChangeNow deposit address (for transfers)
  status: transactionStatusEnum("status").default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
