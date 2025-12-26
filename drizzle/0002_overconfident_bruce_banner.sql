DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `transactions` DROP INDEX `transactions_txSignature_unique`;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `type` enum('shield','transfer','unshield') NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `amount` decimal(20,9) NOT NULL;--> statement-breakpoint
ALTER TABLE `wallets` MODIFY COLUMN `isActive` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `transactions` ADD `amountSol` decimal(20,9) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `wallets` DROP COLUMN `userId`;