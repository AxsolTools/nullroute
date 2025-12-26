import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
          },
        }).then(async (response) => {
          // Check if response is ok
          if (!response.ok) {
            // Clone response to read error message without consuming body
            const clonedResponse = response.clone();
            const text = await clonedResponse.text().catch(() => "");
            const errorMessage = text || response.statusText;
            console.error(`[tRPC] HTTP ${response.status} error:`, errorMessage);
            throw new Error(`HTTP ${response.status}: ${errorMessage}`);
          }
          
          // Check if response has content type
          const contentType = response.headers.get("content-type");
          if (contentType && !contentType.includes("application/json")) {
            // Clone to read without consuming
            const clonedResponse = response.clone();
            const text = await clonedResponse.text().catch(() => "");
            console.error(`[tRPC] Invalid content type: ${contentType}, response:`, text.substring(0, 200));
            throw new Error(`Invalid response format: Expected JSON, got ${contentType}`);
          }
          
          // Return the original response for tRPC to process
          return response;
        }).catch((error) => {
          // Enhanced error logging
          console.error("[tRPC] Fetch error:", error);
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error: Unable to reach server. Please check your connection.");
          }
          throw error;
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
