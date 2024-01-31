-- AlterTable
ALTER TABLE `Order` ADD COLUMN `paidStatus` ENUM('PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID';

-- CreateIndex
CREATE FULLTEXT INDEX `Food_name_idx` ON `Food`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Food_description_idx` ON `Food`(`description`);
