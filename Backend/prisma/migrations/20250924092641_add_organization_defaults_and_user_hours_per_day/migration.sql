/*
  Warnings:

  - You are about to drop the column `fullUserVisibility` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rateVisibility` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."organizations" ADD COLUMN     "default_hourly_rate" DOUBLE PRECISION,
ADD COLUMN     "default_hours_per_day" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
ADD COLUMN     "default_rate_visibility" "public"."rate_visibility" NOT NULL DEFAULT 'view_only',
ADD COLUMN     "default_schedulable_user" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "default_work_order_visibility" "public"."user_visibility" NOT NULL DEFAULT 'full',
ADD COLUMN     "default_working_days" TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri']::TEXT[];

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "fullUserVisibility",
DROP COLUMN "rateVisibility",
ADD COLUMN     "full_user_visibility" "public"."user_visibility",
ADD COLUMN     "hours_per_day" DOUBLE PRECISION,
ADD COLUMN     "rate_visibility" "public"."rate_visibility",
ALTER COLUMN "schedulable_user" DROP NOT NULL,
ALTER COLUMN "schedulable_user" DROP DEFAULT,
ALTER COLUMN "working_days" DROP DEFAULT;
