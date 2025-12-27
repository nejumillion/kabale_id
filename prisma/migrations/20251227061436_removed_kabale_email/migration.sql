/*
  Warnings:

  - You are about to drop the column `code` on the `kabale` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `kabale` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `kabale` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Kabale_code_idx` ON `kabale`;

-- DropIndex
DROP INDEX `Kabale_code_key` ON `kabale`;

-- AlterTable
ALTER TABLE `kabale` DROP COLUMN `code`,
    DROP COLUMN `email`,
    DROP COLUMN `phone`;
