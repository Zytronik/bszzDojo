import { Injectable } from '@nestjs/common';
import { monthRange, todayInClub, type CalendarMonth, type IsoDate } from '@bszz-dojo/shared';
import { pushMessage } from '../push/push-message';
import { PushService } from '../push/push.service';
import { MONTH_END_NOTICE_DAYS, monthEndText } from './month-end';
import { RankingsService } from './rankings.service';

function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / (24 * 60 * 60 * 1000),
  );
}

@Injectable()
export class MonthEndService {
  constructor(
    private readonly rankings: RankingsService,
    private readonly push: PushService,
  ) {}

  /**
   * Called every evening by Vercel Cron; only sends on the day `MONTH_END_NOTICE_DAYS` before the
   * month's last day, so the schedule can stay a plain daily one. Returns how many were told.
   */
  async notify(today: IsoDate = todayInClub()): Promise<number> {
    const [year, monthNumber] = today.split('-').map(Number);
    const month: CalendarMonth = { year: year ?? 0, month: monthNumber ?? 0 };
    if (daysBetween(today, monthRange(month).to) !== MONTH_END_NOTICE_DAYS) return 0;

    const { boards, userIds } = await this.rankings.monthStandings(month);
    const sends = [...userIds].flatMap(([username, userId]) => {
      const text = monthEndText(boards, username, month);
      if (!text) return [];
      const message = pushMessage({ ...text, tag: 'month-end', url: '/' });
      return [this.push.send([userId], message)];
    });
    await Promise.all(sends);
    return sends.length;
  }
}
