import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { usernameKey, type Profile } from '@bszz-dojo/shared';
import { Repository } from 'typeorm';
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
  ) {}

  async profile(username: string): Promise<Profile> {
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    if (!user) throw new NotFoundException('Benutzer nicht gefunden.');

    const scores = await this.scores.findBy({ userId: user.id });
    const rounds: ProfileRound[] = scores
      .toSorted(byShotOn)
      .map((score) => ({ ...toScore(score), createdAt: score.createdAt }));

    return {
      username: user.username,
      displayName: user.displayName,
      rank: user.rank,
      stats: profileStats(rounds),
      personalBests: personalBests(rounds),
      progress: progress(rounds),
      history: history(rounds),
    };
  }
}
