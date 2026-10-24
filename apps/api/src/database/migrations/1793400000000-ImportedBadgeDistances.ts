import type { MigrationInterface, QueryRunner } from 'typeorm';

interface Distance {
  /** `username_key` */
  user: string;
  kind: string;
  /** The title the placing has after `FixImportedBadges`: its event name, else its place */
  title: string;
  year: number;
  place: number;
  bowType: string;
  distance: number;
}

/**
 * The distances from the old placings' names, now that an SM and a national tournament can have
 * one; separate from `FixImportedBadges`, which dev had already run. Roli's two Lausanne 2024
 * placings (18m and 25m) are the same otherwise, so each update takes one placing without a
 * distance.
 */
const DISTANCES: Distance[] = [
  {
    user: 'roli_wegmann',
    kind: 'sm',
    title: 'Bern',
    year: 2024,
    place: 2,
    bowType: 'tr',
    distance: 30,
  },
  {
    user: 'roli_wegmann',
    kind: 'sm',
    title: 'Magglingen',
    year: 2024,
    place: 1,
    bowType: 'bb',
    distance: 18,
  },
  {
    user: 'roli_wegmann',
    kind: 'sm',
    title: 'Magglingen',
    year: 2024,
    place: 1,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'sm',
    title: 'Magglingen',
    year: 2024,
    place: 1,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'sm',
    title: 'Bern',
    year: 2024,
    place: 2,
    bowType: 'tr',
    distance: 30,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Adventsturnier',
    year: 2024,
    place: 3,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'tournament',
    title: 'Adventsturnier',
    year: 2024,
    place: 3,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Lausanne',
    year: 2024,
    place: 1,
    bowType: 'lb',
    distance: 18,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Lausanne',
    year: 2024,
    place: 2,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Lausanne',
    year: 2024,
    place: 2,
    bowType: 'tr',
    distance: 25,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Yverdon-les-Bains',
    year: 2025,
    place: 2,
    bowType: 'lb',
    distance: 18,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Yverdon-les-Bains',
    year: 2025,
    place: 1,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'tournament',
    title: 'Yverdon-les-Bains',
    year: 2025,
    place: 2,
    bowType: 'lb',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'tournament',
    title: 'Yverdon-les-Bains',
    year: 2024,
    place: 1,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'tournament',
    title: 'Yverdon-les-Bains',
    year: 2025,
    place: 3,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'tournament',
    title: 'Zürich Challenge',
    year: 2024,
    place: 3,
    bowType: 'lb',
    distance: 18,
  },
  {
    user: 'uschi_wegmann',
    kind: 'tournament',
    title: 'Zürich Challenge',
    year: 2024,
    place: 2,
    bowType: 'tr',
    distance: 18,
  },
  {
    user: 'roli_wegmann',
    kind: 'tournament',
    title: 'Zürich Challenge',
    year: 2023,
    place: 2,
    bowType: 'bb',
    distance: 18,
  },
];

export class ImportedBadgeDistances1793400000000 implements MigrationInterface {
  name = 'ImportedBadgeDistances1793400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const row of DISTANCES) {
      await queryRunner.query(
        `UPDATE "badges" SET "distance" = $7 WHERE "id" = (
          SELECT "id" FROM "badges"
          WHERE "kind" = $2 AND COALESCE("event_name", "location") = $3 AND "year" = $4
            AND "place" = $5 AND "bow_type" = $6 AND "distance" IS NULL
            AND "user_id" = (SELECT "id" FROM "users" WHERE "username_key" = $1)
          ORDER BY "created_at", "id"
          LIMIT 1
        )`,
        [row.user, row.kind, row.title, row.year, row.place, row.bowType, row.distance],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const row of DISTANCES) {
      await queryRunner.query(
        `UPDATE "badges" SET "distance" = NULL
        WHERE "kind" = $2 AND COALESCE("event_name", "location") = $3 AND "year" = $4
          AND "place" = $5 AND "bow_type" = $6 AND "distance" = $7
          AND "user_id" = (SELECT "id" FROM "users" WHERE "username_key" = $1)`,
        [row.user, row.kind, row.title, row.year, row.place, row.bowType, row.distance],
      );
    }
  }
}
