import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // CORS headers for all routes
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  // Initialize transaction monitor (routing service handles all monitoring)
  try {
    const { startTransactionMonitor } = await import("./transactionMonitor");
    await startTransactionMonitor();
    console.log("[Server] Transaction monitor initialized");
  } catch (error) {
    console.error("[Server] Failed to initialize transaction monitor:", error);
  }
  
  // tRPC API - handle all HTTP methods
  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path, type }) => {
      console.error(`[tRPC] Error on path ${path} (${type}):`, error);
    },
  });
  
  app.all("/api/trpc/*", trpcMiddleware);
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // DigitalOcean sets PORT environment variable automatically
  const port = parseInt(process.env.PORT || "8080");
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Static files from: ${path.resolve(import.meta.dirname, "../..", "dist", "public")}`);
  });
}

startServer().catch(console.error);
