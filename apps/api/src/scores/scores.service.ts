import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  scoreErrors,
  type CreateScoreRequest,
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

  async create(userId: string, body: CreateScoreRequest): Promise<Score> {
    const { id, ...fields } = body;
    if (id !== undefined) {
      const existing = await this.scores.findOneBy({ id });
      if (existing?.userId === userId) return toScore(existing);
      if (existing) throw new ConflictException('Diese ID ist bereits vergeben.');
    }

    const input: ScoreInput = { ...fields, shots: fields.shots ?? null };
    const errors = scoreErrors(input);
    if (errors.length > 0) throw new BadRequestException(errors);

    const score = this.scores.create({ id: id ?? randomUUID(), userId, ...input });
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
