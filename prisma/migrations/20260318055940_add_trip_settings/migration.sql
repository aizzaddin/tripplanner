-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "categories" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "paymentMethods" JSONB NOT NULL DEFAULT '[]';
