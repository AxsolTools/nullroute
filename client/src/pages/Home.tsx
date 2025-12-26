import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { COMMUNITY_URL, APP_LOGO } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"transfer" | "history" | "about">("about");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transactionResult, setTransactionResult] = useState<{
    txSignature: string;
    depositAddress: string;
    routingTransactionId?: string;
    amountSol: number;
    recipientAddress: string;
  } | null>(null);

  const handleLogoClick = () => {
    setLocation("/");
    setActiveTab("about");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Create transfer transaction
  const transferMutation = trpc.transaction.transfer.useMutation({
    onSuccess: (data) => {
      setTransactionResult({
        txSignature: data.txSignature,
        depositAddress: data.depositAddress,
        routingTransactionId: data.routingTransactionId,
        amountSol: data.amountSol,
        recipientAddress: data.recipientAddress,
      });
      toast.success("Transaction created! Please send SOL to the deposit address.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
      setTransactionResult(null);
    },
  });

  const handleTransfer = () => {
    // Validate inputs
    if (!transferRecipient || transferRecipient.trim().length === 0) {
      toast.error("Please enter a recipient address");
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    transferMutation.mutate({
      recipientPublicKey: transferRecipient.trim(),
      amountSol: transferAmount,
    });
  };

  const downloadTransactionInfo = () => {
    if (!transactionResult) return;

    const content = `NULLROUTE Transaction Information

Transaction ID: ${transactionResult.txSignature}
Deposit Address (Send SOL here): ${transactionResult.depositAddress}
Recipient Address: ${transactionResult.recipientAddress}
Amount: ${transactionResult.amountSol} SOL

⚠️ IMPORTANT INSTRUCTIONS:
1. Send exactly ${transactionResult.amountSol.toFixed(6)} SOL to the deposit address above
2. The transaction will be automatically processed and routed privately
3. Monitor the transaction status in the app
4. Save this information for your records

Generated: ${new Date().toISOString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nullroute-tx-${transactionResult.txSignature.slice(0, 8)}-info.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transaction info downloaded!");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Get transaction status
  const { data: transactionStatus } = trpc.transaction.getTransaction.useQuery(
    { txSignature: transactionResult?.txSignature || "" },
    {
      enabled: !!transactionResult?.txSignature,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Get routing status if we have a routing transaction ID
  const { data: routingStatus } = trpc.transaction.getRoutingStatus.useQuery(
    { routingTransactionId: transactionResult?.routingTransactionId || "" },
    {
      enabled: !!transactionResult?.routingTransactionId,
      refetchInterval: 10000, // Poll every 10 seconds
    }
  );

  // Get recent transactions for history
  const { data: recentTransactions } = trpc.transaction.getRecent.useQuery(
    undefined,
    {
      refetchInterval: 10000, // Poll every 10 seconds
    }
  );

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="border-b border-[#333333] backdrop-blur-xl bg-black/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src={APP_LOGO} alt="NULLROUTE" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                NULLROUTE
              </span>
            </button>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "about"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("transfer")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "transfer"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                Transfer
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "history"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                History
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-all"
              >
                Community
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Mobile Tab Selector */}
        <div className="md:hidden flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "about"
                ? "bg-primary text-white"
                : "bg-[#1a1a1a] text-gray-400"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("transfer")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "transfer"
                ? "bg-primary text-white"
                : "bg-[#1a1a1a] text-gray-400"
            }`}
          >
            Transfer
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "history"
                ? "bg-primary text-white"
                : "bg-[#1a1a1a] text-gray-400"
            }`}
          >
            History
          </button>
        </div>

        {/* About Tab - Keep existing content */}
        {activeTab === "about" && (
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-8 py-16">
              <div className="flex justify-center">
                <img src={APP_LOGO} alt="NULLROUTE" className="w-40 h-40 rounded-2xl border-2 border-primary shadow-[0_0_40px_rgba(5,79,252,0.4)]" />
              </div>
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white">
                  NR <span className="text-primary">Ø</span> ROUTE
                </h1>
                
                <div className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary border-2 border-white/20 shadow-[0_0_40px_rgba(5,79,252,0.6)]">
                  <span className="text-2xl font-bold text-white tracking-wide">NULLROUTE</span>
                </div>

                <div className="space-y-3 max-w-3xl mx-auto">
                  <p className="text-xl text-white font-semibold leading-relaxed">
                    NULL-ROUTE ENCRYPTED PATHWAY REGISTER
                  </p>
                  <p className="text-xl text-white font-semibold leading-relaxed">
                    CERTIFIED GHOST TX CHANNEL
                  </p>
                  <p className="text-xl text-white font-semibold leading-relaxed">
                    UNTRACEABLE LEDGER MIGRATION
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="py-16">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">How It Works</h2>
                <div className="space-y-6 text-gray-300">
                  <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#333333]">
                    <h3 className="text-xl font-bold text-white mb-2">1. Enter Recipient & Amount</h3>
                    <p>Simply enter the recipient's Solana address and the amount you want to send.</p>
                  </div>
                  <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#333333]">
                    <h3 className="text-xl font-bold text-white mb-2">2. Get Your Deposit Address</h3>
                    <p>You'll receive a unique deposit address. Send SOL to this address from any wallet.</p>
                  </div>
                  <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#333333]">
                    <h3 className="text-xl font-bold text-white mb-2">3. Send SOL</h3>
                    <p>Send the exact amount of SOL to the deposit address. The transaction will be processed automatically.</p>
                  </div>
                  <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#333333]">
                    <h3 className="text-xl font-bold text-white mb-2">4. Private Routing</h3>
                    <p>Your transaction is automatically routed privately to the recipient. Monitor the status in real-time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Tab */}
        {activeTab === "transfer" && (
          <div className="max-w-2xl mx-auto">
            {/* Transfer Form */}
            <div className="crypto-card rounded-xl p-10 border-2 border-transparent">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-bold mb-3 text-white">Private Transfer</h3>
                <p className="text-gray-400">Enter recipient and amount to generate your unique deposit address</p>
              </div>
              
              {!transactionResult ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="transfer-recipient" className="text-sm font-semibold mb-2 block text-white">
                      Recipient Address
                    </Label>
                    <Input
                      id="transfer-recipient"
                      type="text"
                      placeholder="Solana address..."
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      className="bg-[#1a1a1a] border-[#333333] text-white font-mono text-sm h-12 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transfer-amount" className="text-sm font-semibold mb-2 block text-white">
                      Amount (SOL)
                    </Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="bg-[#1a1a1a] border-[#333333] text-white h-12 focus:border-primary"
                    />
                  </div>

                  <Button
                    onClick={handleTransfer}
                    disabled={!transferRecipient || !transferAmount || transferMutation.isPending}
                    className="w-full btn-hover-lift bg-primary hover:bg-[#0a5fff] h-14 text-base font-bold text-white shadow-[0_0_30px_rgba(5,79,252,0.4)]"
                  >
                    {transferMutation.isPending ? "Generating Deposit Address..." : "Create Transaction"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Transaction Created Successfully */}
                  <div className="rounded-lg bg-primary/10 border-2 border-primary/30 p-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-bold text-white mb-2 text-lg">Transaction Created Successfully</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Send exactly <strong className="text-white">{transactionResult.amountSol.toFixed(6)} SOL</strong> to the deposit address below:
                          </p>
                        </div>
                        
                        {/* Deposit Address */}
                        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
                          <Label className="text-xs text-gray-400 mb-2 block">Deposit Address (Send SOL here):</Label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 font-mono text-sm bg-[#0a0a0a] text-white p-3 rounded break-all border border-[#333333]">
                              {transactionResult.depositAddress}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(transactionResult.depositAddress, "Deposit address")}
                              className="shrink-0"
                            >
                              Copy
                            </Button>
                          </div>
                        </div>

                        {/* Transaction Info Download */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-bold text-blue-400 mb-1">💾 Save Transaction Info</h5>
                              <p className="text-xs text-blue-300">
                                Download your transaction details for your records.
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={downloadTransactionInfo}
                            className="w-full mt-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50"
                          >
                            Download Transaction Info
                          </Button>
                        </div>

                        {/* Transaction Status */}
                        {transactionStatus && (
                          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Deposit Status:</span>
                              <span className={`text-sm font-semibold ${
                                transactionStatus.status === "confirmed" ? "text-green-500" :
                                transactionStatus.status === "failed" ? "text-red-500" :
                                "text-yellow-500"
                              }`}>
                                {transactionStatus.status}
                              </span>
                            </div>
                            {routingStatus && (
                              <div className="flex items-center justify-between pt-2 border-t border-[#333333]">
                                <span className="text-sm text-gray-400">Processing Status:</span>
                                <span className={`text-sm font-semibold ${
                                  routingStatus.status === "finished" ? "text-green-500" :
                                  routingStatus.status === "failed" || routingStatus.status === "refunded" ? "text-red-500" :
                                  routingStatus.status === "waiting" || routingStatus.status === "confirming" ? "text-yellow-500" :
                                  "text-blue-500"
                                }`}>
                                  {routingStatus.status === "finished" ? "completed" :
                                   routingStatus.status === "waiting" ? "waiting for deposit" :
                                   routingStatus.status === "confirming" ? "confirming" :
                                   routingStatus.status === "exchanging" ? "processing" :
                                   routingStatus.status === "sending" ? "sending" :
                                   routingStatus.status}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-xs text-blue-300">
                            <strong>Instructions:</strong> Send exactly <strong>{transactionResult.amountSol.toFixed(6)} SOL</strong> to the deposit address above from any Solana wallet. 
                            The transaction will be processed automatically once we detect your deposit.
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setTransactionResult(null);
                            setTransferRecipient("");
                            setTransferAmount("");
                          }}
                        >
                          Create New Transaction
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto">
            <div className="crypto-card rounded-xl p-8 border-2 border-transparent">
              <h3 className="text-2xl font-bold mb-6 text-white">Recent Transactions</h3>
              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-5 rounded-lg bg-[#1a1a1a] border border-[#333333] hover:border-primary transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold capitalize text-white">{tx.type}</p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {tx.payinAddress ? `Deposit: ${tx.payinAddress.slice(0, 8)}...${tx.payinAddress.slice(-8)}` : "N/A"}
                          </p>
                          {tx.recipientPublicKey && (
                            <p className="text-xs text-gray-500 mt-1 font-mono">
                              To: {tx.recipientPublicKey.slice(0, 8)}...{tx.recipientPublicKey.slice(-8)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{parseFloat(tx.amountSol).toFixed(4)} SOL</p>
                          <p className={`text-xs font-semibold mt-1 ${
                            tx.status === "confirmed" ? "text-green-500" :
                            tx.status === "failed" ? "text-red-500" :
                            "text-yellow-500"
                          }`}>
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-white mb-2">No transactions yet</p>
                  <p className="text-sm">Create a transaction to see it here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
