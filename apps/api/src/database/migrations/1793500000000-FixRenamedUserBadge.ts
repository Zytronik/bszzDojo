import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * `FixImportedBadges` matched placings by username, and Omar had renamed his account from
 * `Omar_Oberholzer` to `Zytronik` before it ran, so his 3D Clubturnier 2018 stayed an imported
 * "Nationales Turnier". Both names are accepted here.
 */
const USERS = `(SELECT "id" FROM "users" WHERE "username_key" IN ('zytronik', 'omar_oberholzer'))`;

export class FixRenamedUserBadge1793500000000 implements MigrationInterface {
  name = 'FixRenamedUserBadge1793500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "badges" SET "kind" = 'club', "tournament_type" = NULL, "location" = NULL,
        "team" = NULL, "bow_type" = 'cp', "age_category" = 'U18', "distance" = 18
      WHERE "kind" = 'tournament' AND "event_name" = '3D Clubturnier' AND "year" = 2018
        AND "place" = 1 AND "user_id" IN ${USERS}`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "badges" SET "kind" = 'tournament', "bow_type" = NULL, "age_category" = NULL,
        "distance" = NULL
      WHERE "kind" = 'club' AND "event_name" = '3D Clubturnier' AND "year" = 2018
        AND "place" = 1 AND "user_id" IN ${USERS}`,
    );
  }
}
