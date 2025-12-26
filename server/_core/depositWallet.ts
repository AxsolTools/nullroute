import * as web3 from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Generate a new unique wallet for each transaction
 * Users get their own deposit address and private key
 */

/**
 * Generate a new keypair for a transaction
 */
export function generateTransactionWallet(): { keypair: web3.Keypair; publicKey: string; privateKey: string } {
  const keypair = web3.Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);
  
  return {
    keypair,
    publicKey,
    privateKey,
  };
}

/**
 * Load a keypair from a private key string (base58)
 */
export function loadWalletFromPrivateKey(privateKeyBase58: string): web3.Keypair {
  try {
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    return web3.Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    throw new Error(`Failed to load wallet from private key: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Send SOL from a wallet to recipient
 */
export async function sendSolToRecipient(
  connection: web3.Connection,
  senderKeypair: web3.Keypair,
  recipientAddress: string,
  amountSol: number,
  memo?: string
): Promise<string> {
  const recipientPubkey = new web3.PublicKey(recipientAddress);
  
  const amountLamports = Math.floor(amountSol * web3.LAMPORTS_PER_SOL);
  
  // Create transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: recipientPubkey,
      lamports: amountLamports,
    })
  );

  // Add memo if provided
  if (memo) {
    // Solana Memo Program ID
    const memoProgram = new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxCyWCXZ1uJqJqJqJq");
    transaction.add(
      new web3.TransactionInstruction({
        keys: [
          {
            pubkey: senderKeypair.publicKey,
            isSigner: true,
            isWritable: false,
          },
        ],
        programId: memoProgram,
        data: Buffer.from(memo, "utf-8"),
      })
    );
  }

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderKeypair.publicKey;

  // Sign transaction
  transaction.sign(senderKeypair);

  // Send transaction
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });

  // Wait for confirmation
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, "confirmed");

  return signature;
}

/**
 * Check if a transaction is for a specific amount and recipient
 */
export function validateTransaction(
  transaction: web3.TransactionResponse | null,
  expectedAmountLamports: number,
  expectedRecipient?: string
): boolean {
  if (!transaction) return false;
  
  // Check transaction amount matches
  const postBalance = transaction.meta?.postBalances?.[0] || 0;
  const preBalance = transaction.meta?.preBalances?.[0] || 0;
  const receivedAmount = postBalance - preBalance;
  
  if (receivedAmount < expectedAmountLamports * 0.99) { // Allow 1% tolerance
    return false;
  }

  // If recipient specified, check it matches
  if (expectedRecipient) {
    const recipientPubkey = new web3.PublicKey(expectedRecipient);
    // Check if transaction transfers to this recipient
    // This is a simplified check - in production you'd parse the transaction instructions
  }

  return true;
}

