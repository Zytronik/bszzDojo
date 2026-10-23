import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SM and national tournaments get a tournament type (FITA, Indoor, 3D, Field, Team) instead of
 * indoor/outdoor and 3D, and lose the distance; age categories come from a fixed list. Existing
 * placings are mapped as far as they can be: indoor → Indoor, outdoor 3D → 3D, other outdoor →
 * FITA, a national tournament marked as team → Team.
 */
export class BadgeTournamentTypes1793000000000 implements MigrationInterface {
  name = 'BadgeTournamentTypes1793000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "badges" ADD "tournament_type" character varying(10)`);
    await queryRunner.query(`
      UPDATE "badges" SET "tournament_type" = CASE
        WHEN "kind" = 'tournament' AND "team" THEN 'team'
        WHEN "venue" = 'indoor' THEN 'indoor'
        WHEN "is_3d" THEN '3d'
        WHEN "venue" = 'outdoor' THEN 'fita'
      END
      WHERE "kind" IN ('sm', 'tournament')
    `);
    await queryRunner.query(`
      UPDATE "badges" SET "team" = NULL
      WHERE "kind" <> 'sm' OR "tournament_type" = 'team'
    `);
    await queryRunner.query(`UPDATE "badges" SET "distance" = NULL WHERE "kind" <> 'club'`);
    await queryRunner.query(`
      UPDATE "badges" SET "age_category" = NULL
      WHERE "age_category" NOT IN ('U11', 'U13', 'U15', 'U18', 'U21', 'U50', '50+')
    `);
    await queryRunner.query(`ALTER TABLE "badges" DROP COLUMN "venue", DROP COLUMN "is_3d"`);
  }

  // Indoor stays indoor, everything else becomes outdoor; distances don't come back.
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "badges" ADD "venue" character varying(10), ADD "is_3d" boolean`,
    );
    await queryRunner.query(`
      UPDATE "badges" SET
        "venue" = CASE WHEN "tournament_type" = 'indoor' THEN 'indoor' ELSE 'outdoor' END,
        "is_3d" = CASE WHEN "tournament_type" = 'indoor' THEN NULL ELSE "tournament_type" = '3d' END,
        "team" = CASE WHEN "tournament_type" = 'team' THEN true ELSE "team" END
      WHERE "tournament_type" IS NOT NULL
    `);
    await queryRunner.query(`ALTER TABLE "badges" DROP COLUMN "tournament_type"`);
  }
}
