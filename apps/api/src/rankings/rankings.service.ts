import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LEADERBOARD_ARROWS,
  LEADERBOARD_DISTANCES,
  currentClubMonth,
  monthRange,
  type DistanceLeaderboard,
  type Rankings,
} from '@bszz-dojo/shared';
import { In, Repository } from 'typeorm';
import { BadgeEntity } from '../badges/badge.entity';
import { ScoreEntity } from '../scores/score.entity';
import { buildLeaderboard, buildMedalStandings, type LeaderboardRound } from './leaderboard';

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
    const { from, to } = monthRange(month);

    const scores = await this.scores.find({
      where: { distance: In([...LEADERBOARD_DISTANCES]), arrows: LEADERBOARD_ARROWS },
      relations: { user: true },
    });
    const rounds = scores.map((score): LeaderboardRound & { distance: number } => ({
      ...score,
      username: score.user.username,
      displayName: score.user.displayName,
    }));

    const boards = (inMonth: boolean): DistanceLeaderboard[] =>
      LEADERBOARD_DISTANCES.map((distance) => ({
        distance,
        entries: buildLeaderboard(
          rounds.filter(
            (round) =>
              round.distance === distance &&
              (!inMonth || (round.shotOn >= from && round.shotOn <= to)),
          ),
        ),
      }));

    const badges = await this.badges.find({ relations: { user: true } });
    const medals = buildMedalStandings(
      badges.map((badge) => ({
        userId: badge.userId,
        username: badge.user.username,
        displayName: badge.user.displayName,
        place: badge.place,
      })),
    );

    return { month, allTime: boards(false), monthly: boards(true), medals };
  }
}
