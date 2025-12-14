/*
  Warnings:

  - You are about to drop the column `firstName` on the `CitizenProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `CitizenProfile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `KabaleAdminProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `KabaleAdminProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CitizenProfile" DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- AlterTable
ALTER TABLE "KabaleAdminProfile" DROP COLUMN "firstName",
DROP COLUMN "lastName";
