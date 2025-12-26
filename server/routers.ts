import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as solana from "./solana";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // Wallet operations
  wallet: router({
    // Connect a wallet (upsert)
    connect: publicProcedure
      .input(
        z.object({
          publicKey: z.string().min(32).max(64),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Validate Solana public key format
          if (!solana.isValidPublicKey(input.publicKey)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid Solana public key format. Please ensure you're using a valid Solana wallet address.",
            });
          }

          console.log(`[Wallet] Attempting to register wallet: ${input.publicKey.slice(0, 8)}...`);
          
          // Check database connection first
          const dbInstance = await db.getDb();
          if (!dbInstance) {
            console.error("[Wallet] Database not available");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Database connection failed. Please check server configuration.",
            });
          }
          
          const walletId = await db.upsertWallet(input.publicKey);
          const wallet = await db.getWalletByPublicKey(input.publicKey);

          if (!wallet) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Wallet was created but could not be retrieved. Please try again.",
            });
          }

          console.log(`[Wallet] Successfully registered wallet: ${input.publicKey.slice(0, 8)}... (ID: ${walletId})`);

          return {
            success: true,
            wallet,
          };
        } catch (error) {
          // Log the full error for debugging
          console.error("[Wallet] Registration error:", error);
          console.error("[Wallet] Error stack:", error instanceof Error ? error.stack : "No stack trace");
          
          // If it's already a TRPCError, re-throw it
          if (error instanceof TRPCError) {
            throw error;
          }

          // Provide more specific error messages
          const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
          
          // Check for database-related errors
          if (errorMessage.includes("Database") || errorMessage.includes("DATABASE_URL") || errorMessage.includes("relation") || errorMessage.includes("does not exist")) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Database tables not found. Please run database migrations first.",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),

    // List connected wallets (for a given public key)
    list: publicProcedure
      .input(
        z.object({
          publicKey: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        if (!input?.publicKey) {
          return [];
        }

        const wallet = await db.getWalletByPublicKey(input.publicKey);
        return wallet ? [wallet] : [];
      }),

    // Disconnect a wallet (mark as inactive)
    disconnect: publicProcedure
      .input(
        z.object({
          publicKey: z.string().min(32).max(64),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Validate Solana public key format
          if (!solana.isValidPublicKey(input.publicKey)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid Solana public key format",
            });
          }

          const wallet = await db.getWalletByPublicKey(input.publicKey);
          
          if (!wallet) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Wallet not found",
            });
          }

          // Mark wallet as inactive
          const dbInstance = await db.getDb();
          if (!dbInstance) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Database not available",
            });
          }

          const { wallets } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          
          await dbInstance.update(wallets)
            .set({ isActive: 0, updatedAt: new Date() })
            .where(eq(wallets.publicKey, input.publicKey));

          console.log(`[Wallet] Disconnected wallet: ${input.publicKey.slice(0, 8)}...`);

          return {
            success: true,
            message: "Wallet disconnected successfully",
          };
        } catch (error) {
          console.error("[Wallet] Disconnect error:", error);
          
          if (error instanceof TRPCError) {
            throw error;
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to disconnect wallet",
          });
        }
      }),

    // Get wallet balance from Solana
    getBalance: publicProcedure
      .input(
        z.object({
          publicKey: z.string().min(32).max(64),
        })
      )
      .query(async ({ input }) => {
        try {
          const balance = await solana.getBalance(input.publicKey);
          return {
            publicKey: input.publicKey,
            balance,
            balanceSol: balance / solana.LAMPORTS_PER_SOL,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to fetch balance",
          });
        }
      }),

    // Get private balance (Light Protocol)
    getPrivateBalance: publicProcedure
      .input(
        z.object({
          publicKey: z.string().min(32).max(64),
        })
      )
      .query(async ({ input }) => {
        try {
          const privateBalance = await solana.getPrivateBalance(input.publicKey);
          return {
            publicKey: input.publicKey,
            privateBalance,
            privateBalanceSol: privateBalance / solana.LAMPORTS_PER_SOL,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to fetch private balance",
          });
        }
      }),
  }),

  // Transaction operations
  transaction: router({
    // Shield operation (public -> private)
    shield: publicProcedure
      .input(
        z.object({
          publicKey: z.string().min(32).max(64),
          amountSol: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Ensure wallet exists
          const wallet = await db.getWalletByPublicKey(input.publicKey);
          if (!wallet) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No wallet connected. Please connect your wallet first.",
            });
          }

          const amount = parseFloat(input.amountSol);
          if (isNaN(amount) || amount <= 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid amount",
            });
          }

          // Perform shield operation via Light Protocol
          const txSignature = await solana.shieldAssets(input.publicKey, amount);

          // Record transaction
          await db.createTransaction({
            walletId: wallet.id,
            type: "shield",
            amount: String(amount * solana.LAMPORTS_PER_SOL),
            amountSol: String(amount),
            txSignature,
            status: "pending",
            recipientPublicKey: null,
          });

          return {
            success: true,
            txSignature,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Shield operation failed",
          });
        }
      }),

    // Estimate transaction fees (before processing)
    estimateFees: publicProcedure
      .input(
        z.object({
          amountSol: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          const amount = parseFloat(input.amountSol);
          if (isNaN(amount) || amount <= 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid amount",
            });
          }

          // Import routing service to estimate fees
          const { estimateTransactionFees } = await import("./_core/changenow");
          const feeEstimate = await estimateTransactionFees("sol", "sol", amount);

          return {
            sendAmount: feeEstimate.sendAmount,
            receiveAmount: feeEstimate.receiveAmount,
            feeAmount: feeEstimate.feeAmount,
            feePercentage: feeEstimate.feePercentage,
            isValid: feeEstimate.isValid,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to estimate fees",
          });
        }
      }),

    // Create transfer - user sends SOL to deposit wallet
    transfer: publicProcedure
      .input(
        z.object({
          recipientPublicKey: z.string().min(32).max(64),
          amountSol: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Validate recipient
          if (!solana.isValidPublicKey(input.recipientPublicKey)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid recipient public key",
            });
          }

          const amount = parseFloat(input.amountSol);
          if (isNaN(amount) || amount <= 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid amount",
            });
          }

          // Create private routing transaction (backend handles routing service)
          console.log("[Transfer] Creating private routing transaction...");
          const { createTransaction: createRoutingTransaction } = await import("./_core/changenow");
          const routingTx = await createRoutingTransaction({
            fromCurrency: "sol",
            toCurrency: "sol",
            fromAmount: amount,
            address: input.recipientPublicKey,
            flow: "standard",
          });

          console.log("[Transfer] Routing transaction created:", {
            id: routingTx.id,
            payinAddress: routingTx.payinAddress,
            fromAmount: routingTx.fromAmount,
            toAmount: routingTx.toAmount,
          });

          // Generate unique transaction ID for our internal tracking
          const { nanoid } = await import("nanoid");
          const transactionId = nanoid();

          // Store routing transaction ID for status polling
          const { storeRoutingTransactionId } = await import("./_core/transactionMonitor");
          storeRoutingTransactionId(transactionId, routingTx.id);

          // Create transaction record in database
          let placeholderWalletId = 1;
          try {
            const placeholderWallet = await db.getWalletByPublicKey("DEPOSIT_PLACEHOLDER");
            if (placeholderWallet) {
              placeholderWalletId = placeholderWallet.id;
            } else {
              placeholderWalletId = await db.upsertWallet("DEPOSIT_PLACEHOLDER");
            }
          } catch (error) {
            console.warn("[Transfer] Could not get/create placeholder wallet, using ID 1");
          }

          const transaction = await db.createTransaction({
            walletId: placeholderWalletId,
            type: "transfer",
            amount: String(amount * solana.LAMPORTS_PER_SOL),
            amountSol: String(amount),
            recipientPublicKey: input.recipientPublicKey,
            txSignature: transactionId,
            payinAddress: routingTx.payinAddress, // User sends SOL directly here
            status: "pending",
          });

          console.log("[Transfer] Transaction saved:", transactionId);

          return {
            success: true,
            txSignature: transactionId,
            depositAddress: routingTx.payinAddress, // Deposit address for user
            routingTransactionId: routingTx.id, // Internal routing ID
            amountSol: amount,
            recipientAddress: input.recipientPublicKey,
          };
        } catch (error) {
          // Handle specific error types
          if (error instanceof TRPCError) {
            throw error;
          }

          const errorMessage = error instanceof Error ? error.message : "Transfer operation failed";
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),

    // Unshield operation (private -> public)
    unshield: publicProcedure
      .input(
        z.object({
          publicKey: z.string().min(32).max(64),
          amountSol: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Ensure wallet exists
          const wallet = await db.getWalletByPublicKey(input.publicKey);
          if (!wallet) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No wallet connected. Please connect your wallet first.",
            });
          }

          const amount = parseFloat(input.amountSol);
          if (isNaN(amount) || amount <= 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid amount",
            });
          }

          // Perform unshield operation via Light Protocol
          const txSignature = await solana.unshieldAssets(input.publicKey, amount);

          // Record transaction
          await db.createTransaction({
            walletId: wallet.id,
            type: "unshield",
            amount: String(amount * solana.LAMPORTS_PER_SOL),
            amountSol: String(amount),
            txSignature,
            status: "pending",
            recipientPublicKey: null,
          });

          return {
            success: true,
            txSignature,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Unshield operation failed",
          });
        }
      }),

    // Get recent transactions (last 50)
    getRecent: publicProcedure
      .query(async () => {
        const dbInstance = await db.getDb();
        if (!dbInstance) {
          return [];
        }

        const { transactions } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");

        return await dbInstance
          .select()
          .from(transactions)
          .orderBy(desc(transactions.createdAt))
          .limit(50);
      }),

    // Get single transaction by signature
    getTransaction: publicProcedure
      .input(
        z.object({
          txSignature: z.string(),
        })
      )
      .query(async ({ input }) => {
        const tx = await db.getTransactionBySignature(input.txSignature);
        if (!tx) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found",
          });
        }
        
        // Get routing status (internal routing service)
        let routingStatus = null;
        if (tx.payinAddress && tx.status === "pending") {
          try {
            const { getRoutingTransactionId } = await import("./_core/transactionMonitor");
            const routingTxId = await getRoutingTransactionId(input.txSignature);
            if (routingTxId) {
              const { getTransactionStatus } = await import("./_core/changenow");
              routingStatus = await getTransactionStatus(routingTxId);
            }
          } catch (error) {
            console.warn(`[GetTransaction] Could not get routing status:`, error);
          }
        }
        
        return {
          ...tx,
          routingStatus,
        };
      }),

    // Get routing transaction status (internal)
    getRoutingStatus: publicProcedure
      .input(
        z.object({
          routingTransactionId: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { getTransactionStatus } = await import("./_core/changenow");
        return await getTransactionStatus(input.routingTransactionId);
      }),

    // Confirm transaction status
    confirmTransaction: publicProcedure
      .input(
        z.object({
          txSignature: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const tx = await db.getTransactionBySignature(input.txSignature);
        if (!tx) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found",
          });
        }

        try {
          const confirmed = await solana.confirmTransaction(input.txSignature);
          await db.updateTransactionStatus(
            input.txSignature,
            confirmed ? "confirmed" : "failed",
            confirmed ? undefined : "Transaction failed to confirm"
          );

          return {
            success: true,
            confirmed,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to confirm transaction",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
