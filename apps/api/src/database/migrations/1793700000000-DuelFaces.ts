import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Each archer shoots on their own face, picked like their bow. */
export class DuelFaces1793700000000 implements MigrationInterface {
  name = 'DuelFaces1793700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "duels" RENAME COLUMN "target_size" TO "challenger_target_size"`,
    );
    await queryRunner.query(`ALTER TABLE "duels" RENAME COLUMN "is_spot" TO "challenger_is_spot"`);
    await queryRunner.query(`ALTER TABLE "duels" ADD "opponent_target_size" smallint`);
    await queryRunner.query(`ALTER TABLE "duels" ADD "opponent_is_spot" boolean`);
    // Duels accepted before this shot on one face.
    await queryRunner.query(`
      UPDATE "duels"
      SET "opponent_target_size" = "challenger_target_size",
        "opponent_is_spot" = "challenger_is_spot"
      WHERE "opponent_bow" IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "duels" DROP COLUMN "opponent_is_spot"`);
    await queryRunner.query(`ALTER TABLE "duels" DROP COLUMN "opponent_target_size"`);
    await queryRunner.query(`ALTER TABLE "duels" RENAME COLUMN "challenger_is_spot" TO "is_spot"`);
    await queryRunner.query(
      `ALTER TABLE "duels" RENAME COLUMN "challenger_target_size" TO "target_size"`,
    );
  }
}
