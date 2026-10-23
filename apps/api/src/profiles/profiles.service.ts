import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { usernameKey, type Profile } from '@bszz-dojo/shared';
import { Repository } from 'typeorm';
import { BadgeEntity } from '../badges/badge.entity';
import { toBadge } from '../badges/badge-mapper';
import { byShotOn, toScore } from '../scores/score-mapper';
import { ScoreEntity } from '../scores/score.entity';
import { UserEntity } from '../users/user.entity';
import { history, personalBests, profileStats, progress, type ProfileRound } from './profile-builder';

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
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    if (!user) throw new NotFoundException('Benutzer nicht gefunden.');

    const [scores, badges] = await Promise.all([
      this.scores.findBy({ userId: user.id }),
      this.badges.find({ where: { userId: user.id }, order: { year: 'DESC', place: 'ASC' } }),
    ]);
    const rounds: ProfileRound[] = scores
      .toSorted(byShotOn)
      .map((score) => ({ ...toScore(score), createdAt: score.createdAt }));

    return {
      username: user.username,
      rank: user.rank,
      stats: profileStats(rounds),
      badges: badges.map(toBadge),
      personalBests: personalBests(rounds),
      progress: progress(rounds),
      history: history(rounds),
    };
  }
}
