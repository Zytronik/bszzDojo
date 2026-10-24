import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScoreShots1793200000000 implements MigrationInterface {
  name = 'ScoreShots1793200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scores" ADD "shots" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scores" DROP COLUMN "shots"`);
  }
}
