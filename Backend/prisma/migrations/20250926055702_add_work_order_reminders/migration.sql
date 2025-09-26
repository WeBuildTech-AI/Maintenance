-- CreateTable
CREATE TABLE "public"."work_order_reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_id" UUID NOT NULL,
    "assignee_id" UUID,
    "fire_at" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_order_reminders_fire_at_status_idx" ON "public"."work_order_reminders"("fire_at", "status");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_reminders_work_order_id_assignee_id_fire_at_chan_key" ON "public"."work_order_reminders"("work_order_id", "assignee_id", "fire_at", "channel");

-- AddForeignKey
ALTER TABLE "public"."work_order_reminders" ADD CONSTRAINT "work_order_reminders_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order_reminders" ADD CONSTRAINT "work_order_reminders_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
