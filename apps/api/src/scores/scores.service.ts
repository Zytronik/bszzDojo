import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { scoreErrors, type Score, type ScoreInput } from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
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

  async delete(userId: string, scoreId: string): Promise<void> {
    const result = await this.scores.delete({ id: scoreId, userId });
    if (result.affected === 0) throw new NotFoundException('Eintrag nicht gefunden.');
  }
}
