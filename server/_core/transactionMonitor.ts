/**
 * Transaction Monitor - Stores routing transaction ID mappings
 * The routing service handles all monitoring and processing
 * We only need to store the mapping for status polling
 */

// Store mapping of our transaction IDs to routing service transaction IDs
const transactionIdToRoutingId = new Map<string, string>();

/**
 * Initialize transaction monitor (routing service handles all monitoring)
 */
export async function startTransactionMonitor() {
  console.log(`[Monitor] Routing service handles all monitoring - no local monitoring needed`);
}

/**
 * Store routing transaction ID mapping
 */
export function storeRoutingTransactionId(transactionId: string, routingTransactionId: string) {
  transactionIdToRoutingId.set(transactionId, routingTransactionId);
  console.log(`[Monitor] Stored routing transaction mapping: ${transactionId} -> ${routingTransactionId}`);
}

/**
 * Get routing transaction ID for our internal transaction ID
 */
export async function getRoutingTransactionId(transactionId: string): Promise<string | null> {
  return transactionIdToRoutingId.get(transactionId) || null;
}
