import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PROFILE_HISTORY_SIZE,
  usernameKey,
  type Profile,
  type ProfileHistory,
} from '@bszz-dojo/shared';
import { Repository } from 'typeorm';
import { toBadge } from '../badges/badge-mapper';
import { BadgeEntity } from '../badges/badge.entity';
import { byShotOn, toScore } from '../scores/score-mapper';
import { ScoreEntity } from '../scores/score.entity';
import { UserEntity } from '../users/user.entity';
import {
  history,
  personalBests,
  profileStats,
  progress,
  type ProfileRound,
} from './profile-builder';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(ScoreEntity)
    private readonly scores: Repository<ScoreEntity>,
    @InjectRepository(BadgeEntity)
    private readonly badges: Repository<BadgeEntity>,
  ) {}

  async profile(username: string): Promise<Profile> {
    const user = await this.user(username);

    const [scores, badges] = await Promise.all([
      this.scores.findBy({ userId: user.id }),
      this.badges.find({
        where: { userId: user.id },
        order: { year: 'DESC', place: 'ASC', createdAt: 'DESC' },
      }),
    ]);
    const rounds: ProfileRound[] = scores
      .toSorted(byShotOn)
      .map((score) => ({ ...toScore(score), createdAt: score.createdAt }));

    return {
      username: user.username,
      displayName: user.displayName,
      rank: user.rank,
      stats: profileStats(rounds),
      badges: badges.map(toBadge),
      personalBests: personalBests(rounds),
      progress: progress(rounds),
      history: history(rounds),
    };
  }

  /** In the profile's order (`history`): newest day first, on the same day the last entered. */
  async history(username: string, offset: number): Promise<ProfileHistory> {
    const user = await this.user(username);
    const scores = await this.scores.find({
      where: { userId: user.id },
      order: { shotOn: 'DESC', createdAt: 'DESC' },
      skip: offset,
      // One more, to know whether there are older ones.
      take: PROFILE_HISTORY_SIZE + 1,
    });
    return {
      scores: scores.slice(0, PROFILE_HISTORY_SIZE).map(toScore),
      hasMore: scores.length > PROFILE_HISTORY_SIZE,
    };
  }

  private async user(username: string): Promise<UserEntity> {
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    if (!user) throw new NotFoundException('Benutzer nicht gefunden.');
    return user;
  }
}
