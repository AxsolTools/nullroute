/**
 * Run database migration script with DATABASE_URL from command line
 * Usage: DATABASE_URL="your-connection-string" pnpm tsx scripts/run-migration-with-url.ts
 * Or: pnpm tsx scripts/run-migration-with-url.ts "your-connection-string"
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

async function runMigration() {
  // Get DATABASE_URL from command line arg or environment
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is required");
    console.error("\nUsage:");
    console.error('  DATABASE_URL="postgresql://..." pnpm tsx scripts/run-migration-with-url.ts');
    console.error('  OR');
    console.error('  pnpm tsx scripts/run-migration-with-url.ts "postgresql://..."');
    console.error("\nGet your DATABASE_URL from:");
    console.error("  DigitalOcean Dashboard → Databases → Your Database → Connection Details");
    process.exit(1);
  }

  const migrationFile = join(process.cwd(), "drizzle", "0005_add_transaction_routing_and_constraints.sql");
  
  try {
    console.log("📄 Reading migration file:", migrationFile);
    const sql = readFileSync(migrationFile, "utf-8");
    
    console.log("🔌 Connecting to database...");
    const db = postgres(databaseUrl);
    
    console.log("▶️  Running migration...");
    await db.unsafe(sql);
    
    console.log("✅ Migration completed successfully!");
    
    // Verify the migration worked
    console.log("🔍 Verifying migration...");
    const tables = await db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'transaction_routing'
    `;
    
    if (tables.length > 0) {
      console.log("✅ transaction_routing table exists");
    } else {
      console.warn("⚠️  Warning: transaction_routing table not found");
    }
    
    const constraints = await db`
      SELECT conname 
      FROM pg_constraint 
      WHERE conname = 'transactions_txsignature_unique'
    `;
    
    if (constraints.length > 0) {
      console.log("✅ UNIQUE constraint on transactions.txSignature exists");
    } else {
      console.warn("⚠️  Warning: UNIQUE constraint not found");
    }
    
    await db.end();
    console.log("✨ All done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

runMigration();

