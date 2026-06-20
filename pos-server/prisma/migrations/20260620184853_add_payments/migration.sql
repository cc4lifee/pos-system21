/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentMethod";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'COMPLETED';
