import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LEADERBOARD_ARROWS,
  LEADERBOARD_DISTANCES,
  currentClubMonth,
  monthRange,
  type CalendarMonth,
  type DistanceLeaderboard,
  type Rankings,
} from '@bszz-dojo/shared';
import { In, Repository } from 'typeorm';
import { BadgeEntity } from '../badges/badge.entity';
import { ScoreEntity } from '../scores/score.entity';
import { buildLeaderboard, buildMedalStandings, type LeaderboardRound } from './leaderboard';

type QualifyingRound = LeaderboardRound & { distance: number };

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(ScoreEntity)
    private readonly scores: Repository<ScoreEntity>,
    @InjectRepository(BadgeEntity)
    private readonly badges: Repository<BadgeEntity>,
  ) {}

  /**
   * Ranked in memory: a club has a few thousand qualifying rounds at most, and the handicap and
   * per-user best are much clearer in TypeScript than as window functions.
   */
  async rankings(): Promise<Rankings> {
    const month = currentClubMonth();
    const rounds = await this.qualifyingRounds();
    const allTime = this.boards(rounds);
    const monthly = this.boards(rounds.filter(inMonth(month)));

    const badges = await this.badges.find({ relations: { user: true } });
    const medals = buildMedalStandings(
      badges.map((badge) => ({
        userId: badge.userId,
        username: badge.user.username,
        displayName: badge.user.displayName,
        place: badge.place,
      })),
    );

    return { month, allTime, monthly, medals };
  }

  /** Everyone who shot a qualifying round in `month`, not only the top 10, with their user ids. */
  async monthStandings(
    month: CalendarMonth,
  ): Promise<{ boards: DistanceLeaderboard[]; userIds: Map<string, string> }> {
    const rounds = (await this.qualifyingRounds()).filter(inMonth(month));
    const userIds = new Map(rounds.map((round) => [round.username, round.userId]));
    return { boards: this.boards(rounds, Number.POSITIVE_INFINITY), userIds };
  }

  private async qualifyingRounds(): Promise<QualifyingRound[]> {
    const scores = await this.scores.find({
      where: { distance: In([...LEADERBOARD_DISTANCES]), arrows: LEADERBOARD_ARROWS },
      relations: { user: true },
    });
    return scores.map((score) => ({
      ...score,
      username: score.user.username,
      displayName: score.user.displayName,
    }));
  }

  private boards(rounds: readonly QualifyingRound[], size?: number): DistanceLeaderboard[] {
    return LEADERBOARD_DISTANCES.map((distance) => ({
      distance,
      entries: buildLeaderboard(
        rounds.filter((round) => round.distance === distance),
        size,
      ),
    }));
  }
}

function inMonth(month: CalendarMonth): (round: QualifyingRound) => boolean {
  const { from, to } = monthRange(month);
  return (round) => round.shotOn >= from && round.shotOn <= to;
}
