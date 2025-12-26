-- PostgreSQL Migration for NULLROUTE
-- Run this in your Supabase SQL Editor

-- Create enum types
CREATE TYPE transaction_type AS ENUM ('shield', 'transfer', 'unshield');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  "publicKey" VARCHAR(64) NOT NULL UNIQUE,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  "walletId" INTEGER NOT NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(20, 9) NOT NULL,
  "amountSol" NUMERIC(20, 9) NOT NULL,
  "recipientPublicKey" VARCHAR(64),
  "txSignature" VARCHAR(128) NOT NULL,
  "payinAddress" VARCHAR(128),
  status transaction_status NOT NULL DEFAULT 'pending',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_publickey ON wallets("publicKey");
CREATE INDEX IF NOT EXISTS idx_wallets_isactive ON wallets("isActive");
CREATE INDEX IF NOT EXISTS idx_transactions_walletid ON transactions("walletId");
CREATE INDEX IF NOT EXISTS idx_transactions_txsignature ON transactions("txSignature");
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

