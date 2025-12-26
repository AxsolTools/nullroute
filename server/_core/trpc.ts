import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// For wallet-only dApp, all procedures are public
// Authentication is handled by wallet signatures, not server-side sessions
export const protectedProcedure = t.procedure;
export const adminProcedure = t.procedure;
