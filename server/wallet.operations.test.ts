import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as solana from "./solana";

// Mock Express request/response
function createMockContext(): TrpcContext {
  return {
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Wallet Operations", () => {
  it("should validate valid Solana public keys", () => {
    const validKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";
    expect(solana.isValidPublicKey(validKey)).toBe(true);
  });

  it("should reject invalid Solana public keys", () => {
    const invalidKey = "invalid-key";
    expect(solana.isValidPublicKey(invalidKey)).toBe(false);
  });

  it("should connect a wallet successfully", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const validPublicKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";

    const result = await caller.wallet.connect({
      publicKey: validPublicKey,
    });

    expect(result.success).toBe(true);
    expect(result.wallet).toBeDefined();
    expect(result.wallet?.publicKey).toBe(validPublicKey);
  });

  it("should reject invalid public key format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.wallet.connect({
        publicKey: "invalid-key",
      })
    ).rejects.toThrow(); // Zod validation will fail on length
  });

  it("should list connected wallets", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const validPublicKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";

    // First connect a wallet
    await caller.wallet.connect({ publicKey: validPublicKey });

    // Then list wallets
    const wallets = await caller.wallet.list({ publicKey: validPublicKey });

    expect(wallets).toBeDefined();
    expect(wallets.length).toBeGreaterThan(0);
    expect(wallets[0]?.publicKey).toBe(validPublicKey);
  });
});

describe("Transaction Operations", () => {
  it("should fail shield operation without Light Protocol setup", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const validPublicKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";

    // Connect wallet first
    await caller.wallet.connect({ publicKey: validPublicKey });

    // Attempt shield operation (should fail with helpful error)
    await expect(
      caller.transaction.shield({
        publicKey: validPublicKey,
        amountSol: "1.0",
      })
    ).rejects.toThrow("Light Protocol");
  });

  it("should fail transfer operation without Light Protocol setup", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const senderKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";
    const recipientKey = "8FrQdFVxKNcSaWX4mYLFjc9Z6K9i4wA9zD9zLrLrLrLr";

    // Connect wallet first
    await caller.wallet.connect({ publicKey: senderKey });

    // Attempt transfer (should fail with helpful error)
    await expect(
      caller.transaction.transfer({
        senderPublicKey: senderKey,
        recipientPublicKey: recipientKey,
        amountSol: "0.5",
      })
    ).rejects.toThrow("Light Protocol");
  });

  it("should fail unshield operation without Light Protocol setup", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const validPublicKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";

    // Connect wallet first
    await caller.wallet.connect({ publicKey: validPublicKey });

    // Attempt unshield (should fail with helpful error)
    await expect(
      caller.transaction.unshield({
        publicKey: validPublicKey,
        amountSol: "0.5",
      })
    ).rejects.toThrow("Light Protocol");
  });

  it("should return empty transaction history for new wallet", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const validPublicKey = "84yqsEThuG5fphbhXBpXNMmDvZ6xc7BjFX8VZRyii2eZ";

    // Connect wallet first
    await caller.wallet.connect({ publicKey: validPublicKey });

    // Get transaction history
    const history = await caller.transaction.history({ publicKey: validPublicKey });

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
  });

  it("should validate transaction amounts", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const validPublicKey = "7EqQdEUwJNVRhNjNs8H6z8Z5K8h3vZ8yC8yKqKqKqKqK";

    // Connect wallet first
    await caller.wallet.connect({ publicKey: validPublicKey });

    // Test invalid amount (negative)
    await expect(
      caller.transaction.shield({
        publicKey: validPublicKey,
        amountSol: "-1.0",
      })
    ).rejects.toThrow("Invalid amount");

    // Test invalid amount (zero)
    await expect(
      caller.transaction.shield({
        publicKey: validPublicKey,
        amountSol: "0",
      })
    ).rejects.toThrow("Invalid amount");
  });
});

describe("Solana Utilities", () => {
  it("should convert lamports to SOL correctly", () => {
    const lamports = 1000000000; // 1 SOL
    const sol = solana.lamportsToSol(lamports);
    expect(sol).toBe(1);
  });

  it("should convert SOL to lamports correctly", () => {
    const sol = 1.5;
    const lamports = solana.solToLamports(sol);
    expect(lamports).toBe(1500000000);
  });

  it("should export LAMPORTS_PER_SOL constant", () => {
    expect(solana.LAMPORTS_PER_SOL).toBe(1000000000);
  });
});
