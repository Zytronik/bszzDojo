import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CLUB_TIME_ZONE, trainingStreak, type TrainingStreak } from '@bszz-dojo/shared';
import { DataSource } from 'typeorm';

@Injectable()
export class StreaksService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async streak(userId: string): Promise<TrainingStreak> {
    // Mondays as text: node-postgres would turn a `date` into a Date at the server's midnight.
    // Rounds count by the day shot, duel ends by when they were saved in the club's zone.
    const rows: unknown = await this.db.query(
      `SELECT to_char(date_trunc('week', shot_on), 'YYYY-MM-DD') AS week
         FROM scores WHERE user_id = $1
       UNION
       SELECT to_char(date_trunc('week', e.created_at AT TIME ZONE $2), 'YYYY-MM-DD')
         FROM duel_ends e JOIN duels d ON d.id = e.duel_id
        WHERE (e.side = 'challenger' AND d.challenger_id = $1)
           OR (e.side = 'opponent' AND d.opponent_id = $1)`,
      [userId, CLUB_TIME_ZONE],
    );
    const weeks = Array.isArray(rows)
      ? rows.flatMap((row: unknown) =>
          typeof row === 'object' && row !== null && 'week' in row && typeof row.week === 'string'
            ? [row.week]
            : [],
        )
      : [];
    return trainingStreak(weeks);
  }
}
