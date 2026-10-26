import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  scoreErrors,
  type Score,
  type ScoreComparison,
  type ScoreDetail,
  type ScoreInput,
} from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { Not, Repository } from 'typeorm';
import { toScore } from './score-mapper';
import { ScoreEntity } from './score.entity';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(ScoreEntity)
    private readonly scores: Repository<ScoreEntity>,
  ) {}

  async create(userId: string, body: ScoreInput): Promise<Score> {
    const input: ScoreInput = { ...body, shots: body.shots ?? null };
    const errors = scoreErrors(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    const score = this.scores.create({ id: randomUUID(), userId, ...input });
    await this.scores.insert(score);
    return toScore(score);
  }

  async findOne(id: string): Promise<ScoreDetail> {
    const score = await this.scores.findOne({ where: { id }, relations: { user: true } });
    if (!score) throw new NotFoundException('Score nicht gefunden.');

    const others = await this.scores
      .createQueryBuilder('score')
      .select('COUNT(*)::int', 'rounds')
      .addSelect('ROUND(AVG(score.result))::int', 'average')
      .addSelect('MAX(score.result)', 'best')
      .where({
        userId: score.userId,
        bowType: score.bowType,
        distance: score.distance,
        arrows: score.arrows,
        id: Not(score.id),
      })
      .getRawOne<ScoreComparison>();

    return {
      ...toScore(score),
      username: score.user.username,
      displayName: score.user.displayName,
      comparison: {
        rounds: others?.rounds ?? 0,
        average: others?.average ?? null,
        best: others?.best ?? null,
      },
    };
  }

  async delete(userId: string, scoreId: string): Promise<void> {
    const result = await this.scores.delete({ id: scoreId, userId });
    if (result.affected === 0) throw new NotFoundException('Eintrag nicht gefunden.');
  }
}
