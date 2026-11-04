import { Controller, Get, HttpCode, Logger, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { CronGuard } from '../common/cron.guard';
import { MonthEndService } from './month-end.service';

/** Called by Vercel Cron (`vercel.json`), not by the app, so it's not in the API docs. */
@ApiExcludeController()
@UseGuards(CronGuard)
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly monthEnd: MonthEndService) {}

  @Get('month-end')
  @HttpCode(204)
  async monthEndRankings(): Promise<void> {
    const notified = await this.monthEnd.notify();
    if (notified > 0) this.logger.log(`Month-end rankings sent to ${notified} archers`);
  }
}
