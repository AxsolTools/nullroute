# Luminos User Guide

Welcome to Luminos, your gateway to private transactions on the Solana blockchain using Zero-Knowledge Proofs powered by Light Protocol.

## Table of Contents

1. [What is Luminos?](#what-is-luminos)
2. [How Private Transactions Work](#how-private-transactions-work)
3. [Getting Started](#getting-started)
4. [Connecting Your Wallet](#connecting-your-wallet)
5. [Shield Operation](#shield-operation)
6. [Private Transfer](#private-transfer)
7. [Unshield Operation](#unshield-operation)
8. [Transaction History](#transaction-history)
9. [Security & Privacy](#security--privacy)
10. [FAQ](#faq)

## What is Luminos?

Luminos is a web application that enables you to perform completely private transactions on the Solana blockchain. Unlike regular blockchain transactions where everyone can see the sender, recipient, and amount, Luminos uses advanced cryptography (Zero-Knowledge Proofs) to keep your transactions confidential.

### Key Features

- **Complete Privacy**: Hide sender, recipient, and transaction amounts
- **Zero-Knowledge Proofs**: Mathematically proven security without revealing data
- **Solana Speed**: Fast transactions with low fees
- **User-Friendly**: Simple interface for complex cryptography
- **Non-Custodial**: You maintain full control of your assets

## How Private Transactions Work

Luminos uses Light Protocol's implementation of Zero-Knowledge Proofs on Solana. Here's how it works:

### The Three-Step Process

1. **Shield** (Make Private)
   - Convert your public SOL into a private balance
   - Your SOL is locked in a smart contract
   - Only you can prove ownership without revealing your identity

2. **Transfer** (Send Privately)
   - Send SOL from your private balance to another user
   - The blockchain records that "someone sent something to someone"
   - But it doesn't record WHO sent WHAT to WHOM

3. **Unshield** (Make Public)
   - Convert your private balance back to regular SOL
   - Withdraw to any Solana address you choose
   - The connection between shield and unshield is cryptographically hidden

### Why This Matters

On a regular blockchain, if you send money to someone:
- Everyone can see your wallet address
- Everyone can see how much you sent
- Everyone can see the recipient's address
- Anyone can track all your past and future transactions

With Luminos:
- Your financial activity is private
- No one can link your transactions together
- You choose what to reveal and when

## Getting Started

### Prerequisites

- A Solana wallet (Phantom, Solflare, etc.)
- Some SOL for transactions and fees
- A Manus account (for authentication)

### First Time Setup

1. **Visit Luminos**
   - Navigate to the Luminos application
   - You'll see the landing page with an overview

2. **Sign In**
   - Click "Sign In" in the top right
   - Authenticate with your Manus account
   - You'll be redirected back to Luminos

3. **Connect Wallet**
   - Enter your Solana wallet public address
   - Click "Connect"
   - Your wallet is now linked to your account

## Connecting Your Wallet

### How to Find Your Wallet Address

**Phantom Wallet:**
1. Open Phantom extension
2. Click your wallet name at the top
3. Your address is displayed (starts with a letter and numbers)
4. Click to copy

**Solflare:**
1. Open Solflare
2. Click "Receive"
3. Copy your wallet address

### Connecting to Luminos

1. Copy your Solana wallet address
2. Paste it into the "Enter Solana wallet address" field
3. Click "Connect"
4. You'll see a confirmation message
5. Your connected wallet appears at the top of the page

### Important Notes

- You can connect multiple wallets
- Your wallet address is public information (it's okay to share)
- Luminos never asks for your private key or seed phrase
- The connection is stored securely in the database

## Shield Operation

Shielding converts your public SOL into a private balance.

### Step-by-Step

1. **Navigate to Shield Tab**
   - After connecting your wallet, you'll see three tabs
   - Click on the "Shield" tab

2. **Enter Amount**
   - Type the amount of SOL you want to shield
   - Example: `1.5` for 1.5 SOL
   - Make sure you have enough SOL in your wallet

3. **Click "Shield Assets"**
   - The operation will be initiated
   - You'll see a loading indicator
   - A success message appears when complete

4. **What Happens**
   - Your public SOL is locked in a smart contract
   - You receive a private balance (invisible on-chain)
   - Only you can prove you own this private balance

### When to Shield

- Before making private transfers
- When you want to hide your balance
- To break the transaction trail from your public wallet

### Fees

- Standard Solana transaction fee (very small)
- No additional fees from Luminos
- Gas fees are paid from your public wallet

## Private Transfer

Send SOL privately to another user without revealing any details.

### Step-by-Step

1. **Navigate to Transfer Tab**
   - Click on the "Transfer" tab

2. **Enter Recipient Address**
   - Paste the recipient's Solana wallet address
   - Double-check the address (transactions can't be reversed)

3. **Enter Amount**
   - Type the amount to send
   - Must be less than or equal to your private balance

4. **Click "Send Privately"**
   - The transfer will be processed
   - You'll see a confirmation message
   - The recipient receives the private balance

### Important Considerations

- **Recipient Must Have Luminos**: The recipient needs to use Luminos to access their private balance
- **Irreversible**: Private transfers cannot be undone
- **Verify Address**: Always double-check the recipient address
- **Private Balance Required**: You must shield SOL before transferring

### What the Blockchain Sees

When you make a private transfer, the blockchain records:
- ✅ A transaction occurred
- ✅ It was valid and authorized
- ❌ NOT who sent it
- ❌ NOT who received it
- ❌ NOT how much was sent

This is the power of Zero-Knowledge Proofs!

## Unshield Operation

Unshielding converts your private balance back to public SOL.

### Step-by-Step

1. **Navigate to Unshield Tab**
   - Click on the "Unshield" tab

2. **Enter Amount**
   - Type the amount to unshield
   - Must be less than or equal to your private balance

3. **Click "Unshield Assets"**
   - The operation will be processed
   - SOL is sent to your connected wallet
   - You'll see a confirmation message

### When to Unshield

- When you want to use SOL on other applications
- To send to a non-Luminos user
- To convert back to regular, visible SOL

### Privacy Note

When you unshield:
- The blockchain sees SOL appearing in your wallet
- But it can't trace where it came from
- The link to your original shield is cryptographically hidden

## Transaction History

Luminos keeps a record of your operations for your convenience.

### What You Can See

- **Transaction Type**: Shield, Transfer, or Unshield
- **Amount**: How much SOL was involved
- **Status**: Pending, Confirmed, or Failed
- **Date**: When the transaction occurred

### Transaction Status

- **Pending** ⏱️: Transaction is being processed
- **Confirmed** ✅: Successfully completed
- **Failed** ❌: Transaction didn't complete (funds are safe)

### Privacy Note

Your transaction history is stored securely and is only visible to you. It's not publicly accessible and is encrypted in the database.

## Security & Privacy

### What Luminos Protects

✅ **Your Transaction Details**: Amounts, recipients, and senders are hidden
✅ **Your Balance**: Private balances are not visible on-chain
✅ **Your Identity**: Transactions can't be linked to you
✅ **Your History**: Past transactions can't be traced

### What Luminos Doesn't Protect

❌ **Your Wallet Address**: Public addresses are visible (this is normal)
❌ **Timing Analysis**: Someone might infer connections based on timing
❌ **Amount Patterns**: Unique amounts might be identifiable

### Best Practices

1. **Don't Reuse Addresses**: Use different wallets for different purposes
2. **Vary Amounts**: Don't always send the same amount
3. **Add Delays**: Don't shield and immediately unshield
4. **Use Multiple Shields**: Break large amounts into smaller shields
5. **Never Share Private Keys**: Luminos never asks for them

### What Luminos Can't See

- Your private keys or seed phrases
- Your wallet's private transactions on other platforms
- Your private balance (only you can prove ownership)

### Security Features

- **Server-Side Operations**: All cryptography happens on secure servers
- **No Private Key Exposure**: Your keys never leave your wallet
- **Encrypted Storage**: Database is encrypted at rest
- **Authenticated Access**: Only you can access your account
- **Audit Trail**: All operations are logged for your security

## FAQ

### General Questions

**Q: Is Luminos legal?**
A: Privacy is not illegal. Luminos is a tool for financial privacy, similar to using cash. However, laws vary by jurisdiction. You are responsible for complying with local regulations.

**Q: How much does it cost?**
A: Luminos itself is free. You only pay standard Solana network fees (typically fractions of a cent).

**Q: Can I use Luminos on mobile?**
A: Yes! The interface is responsive and works on all devices.

**Q: Do I need to download anything?**
A: No, Luminos is a web application. Just use your browser.

### Privacy Questions

**Q: Can anyone see my private balance?**
A: No. Your private balance is cryptographically hidden. Only you can prove ownership.

**Q: Can the government trace my transactions?**
A: Zero-Knowledge Proofs are mathematically proven to be private. However, metadata (timing, patterns) might provide clues. Use best practices for maximum privacy.

**Q: Can Luminos see my transactions?**
A: No. The cryptography happens on-chain. Luminos only provides the interface.

**Q: What if Luminos shuts down?**
A: Your funds are safe. They're locked in smart contracts on Solana, not controlled by Luminos. You can always access them through other Light Protocol interfaces.

### Technical Questions

**Q: What are Zero-Knowledge Proofs?**
A: A cryptographic method that lets you prove something is true without revealing why it's true. In Luminos, you prove you own SOL without revealing which SOL you own.

**Q: How is this different from a mixer?**
A: Mixers pool funds and redistribute them. Light Protocol uses cryptographic proofs, which is more secure and doesn't require trusting a third party.

**Q: Can I lose my funds?**
A: Your funds are secured by Solana smart contracts. As long as you maintain access to your wallet, your funds are safe.

**Q: What if a transaction fails?**
A: Failed transactions don't move funds. Your SOL remains in its previous state (public or private).

### Troubleshooting

**Q: My transaction is stuck on "Pending"**
A: Solana transactions usually confirm in seconds. If it's been more than a minute, check your transaction history or try refreshing the page.

**Q: I can't connect my wallet**
A: Make sure you're entering a valid Solana address. It should be 32-44 characters long and contain only letters and numbers.

**Q: My balance doesn't show up**
A: Private balances are not visible on regular blockchain explorers. Use Luminos to view your private balance.

**Q: I entered the wrong recipient address**
A: Unfortunately, blockchain transactions cannot be reversed. Always double-check addresses before sending.

## Getting Help

### Community Support

- **Discord**: Join the Light Protocol community
- **GitHub**: Report issues or contribute
- **Documentation**: Visit Light Protocol docs

### Contact

For issues specific to Luminos:
- Visit [https://help.manus.im](https://help.manus.im)
- Check the GitHub repository for updates

### Emergency

If you believe your funds are at risk:
1. Do NOT share your private keys with anyone
2. Document the issue with screenshots
3. Contact support immediately
4. Check the Solana blockchain explorer for transaction status

## Conclusion

Luminos brings financial privacy to Solana through cutting-edge Zero-Knowledge Proof technology. By following this guide and using best practices, you can enjoy private transactions while maintaining the speed and low costs of the Solana network.

Remember: **Privacy is a right, not a privilege.** Use Luminos responsibly and help build a more private financial future.

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Powered by**: Light Protocol on Solana
