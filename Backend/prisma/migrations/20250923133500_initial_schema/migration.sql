/*
  Warnings:

  - The values [electricity,water,gas,runtime] on the enum `meter_type` will be removed. If these variants are still used in the database, this will fail.
  - The `vendor_type` column on the `vendors` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."asset_status" AS ENUM ('online', 'offline', 'doNotTrack');

-- CreateEnum
CREATE TYPE "public"."vendor_type" AS ENUM ('manufacturer', 'distributor');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."meter_type_new" AS ENUM ('manual', 'automated');
ALTER TABLE "public"."meters" ALTER COLUMN "meter_type" TYPE "public"."meter_type_new" USING ("meter_type"::text::"public"."meter_type_new");
ALTER TYPE "public"."meter_type" RENAME TO "meter_type_old";
ALTER TYPE "public"."meter_type_new" RENAME TO "meter_type";
DROP TYPE "public"."meter_type_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."assets" ADD COLUMN     "status" "public"."asset_status";

-- AlterTable
ALTER TABLE "public"."vendors" ADD COLUMN     "asset_ids" UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN     "locations" UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN     "part_ids" UUID[] DEFAULT ARRAY[]::UUID[],
DROP COLUMN "vendor_type",
ADD COLUMN     "vendor_type" "public"."vendor_type";

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "users" UUID[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
