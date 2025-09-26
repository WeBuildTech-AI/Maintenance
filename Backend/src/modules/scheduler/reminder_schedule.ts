import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/30 * * * * *') // every 30s
  async sweepDueReminders() {
    const now = new Date();
    const dueReminders = await this.prisma.workOrderReminder.findMany({
      where: {
        status: 'pending',
        fireAt: { lte: new Date(now.getTime() + 60_000) }, // due within next 60s
      },
      take: 100, // batch size
    });

    for (const reminder of dueReminders) {
      try {
        // enqueue notification (email/push/etc.)
        await this.sendNotification(reminder);

        await this.prisma.workOrderReminder.update({
          where: { id: reminder.id },
          data: { status: 'sent', updatedAt: new Date() },
        });
      } catch (err) {
        this.logger.error(`Failed reminder ${reminder.id}`, err);
        await this.prisma.workOrderReminder.update({
          where: { id: reminder.id },
          data: { status: 'failed', attempts: { increment: 1 } },
        });
      }
    }
  }

  private async sendNotification(reminder: any) {
    // choose channel from reminder.channel
    // e.g., email via SES, push via FCM
    console.log(`Sending reminder for WorkOrder ${reminder.workOrderId}`);
  }
}
