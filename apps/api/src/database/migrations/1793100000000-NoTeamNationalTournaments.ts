import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * A national tournament has no "Team" tournament type. Placings that `BadgeTournamentTypes` gave
 * it (from a team flag) lose the type, since their real discipline isn't known.
 */
export class NoTeamNationalTournaments1793100000000 implements MigrationInterface {
  name = 'NoTeamNationalTournaments1793100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "badges" SET "tournament_type" = NULL
      WHERE "kind" = 'tournament' AND "tournament_type" = 'team'
    `);
  }

  // Which placings were changed isn't recorded, so there's nothing to undo.
  async down(): Promise<void> {}
}
