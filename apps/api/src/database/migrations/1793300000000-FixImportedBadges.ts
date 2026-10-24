import type { MigrationInterface, QueryRunner } from 'typeorm';

interface Placing {
  /** `username_key` */
  user: string;
  /** The old app's free-text name, which the import stored as `event_name` */
  oldName: string;
  year: number;
  place: number;
}

interface Fix extends Placing {
  kind: string;
  tournamentType: string | null;
  location: string | null;
  eventName: string | null;
  team: boolean | null;
  bowType: string;
  ageCategory: string;
  distance: number | null;
}

/**
 * The old app only had a free-text name per placing, so the import made every one a "Nationales
 * Turnier" named after it. These are the club's placings sorted into kind, tournament type, place,
 * bow and age category, as checked with the archers. Two SM team placings were entered twice.
 * Rows are matched by user, old name, year and place, so a placing changed since is left alone.
 */
const FIXES: Fix[] = [
  {
    user: 'roli_wegmann',
    oldName: 'SM Bern Wankdorf Outdoor 30 Meter Einzel Traditionell',
    year: 2024,
    place: 2,
    kind: 'sm',
    tournamentType: 'fita',
    location: 'Bern',
    eventName: null,
    team: false,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'SM Magglingen Indoor 18 Meter Team Barebow',
    year: 2024,
    place: 1,
    kind: 'sm',
    tournamentType: 'indoor',
    location: 'Magglingen',
    eventName: null,
    team: true,
    bowType: 'bb',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'SM Magglingen Indoor 18 Meter Team Traditionell',
    year: 2024,
    place: 1,
    kind: 'sm',
    tournamentType: 'indoor',
    location: 'Magglingen',
    eventName: null,
    team: true,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'SM Indoor 18m Traditionell',
    year: 2024,
    place: 1,
    kind: 'sm',
    tournamentType: 'indoor',
    location: 'Magglingen',
    eventName: null,
    team: false,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'SM Outdoor 30m - 50+ Damen Traditionell',
    year: 2024,
    place: 2,
    kind: 'sm',
    tournamentType: 'fita',
    location: 'Bern',
    eventName: null,
    team: false,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Advents-Turnier Solothurn 18 Meter Traditionell',
    year: 2024,
    place: 3,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Solothurn',
    eventName: 'Adventsturnier',
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'Solothurn Adventsturnier 18m Indoor - 50+ Damen Traditionell',
    year: 2024,
    place: 3,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Solothurn',
    eventName: 'Adventsturnier',
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Lausanne Indoor 18 Meter Longbow',
    year: 2024,
    place: 1,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Lausanne',
    eventName: null,
    team: null,
    bowType: 'lb',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Lausanne Indoor 18 Meter Traditionell',
    year: 2024,
    place: 2,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Lausanne',
    eventName: null,
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Lausanne Indoor 25 Meter Traditionell',
    year: 2024,
    place: 2,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Lausanne',
    eventName: null,
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Yverdon Indoor 18 Meter Longbow',
    year: 2025,
    place: 2,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Yverdon-les-Bains',
    eventName: null,
    team: null,
    bowType: 'lb',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Yverdon Indoor 18 Meter Traditionell',
    year: 2025,
    place: 1,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Yverdon-les-Bains',
    eventName: null,
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'Yverdon Indoor 18m Langbogen',
    year: 2025,
    place: 2,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Yverdon-les-Bains',
    eventName: null,
    team: null,
    bowType: 'lb',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'Yverdon Indoor 18m Traditionell',
    year: 2024,
    place: 1,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Yverdon-les-Bains',
    eventName: null,
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'Yverdon Indoor 18m Traditionell',
    year: 2025,
    place: 3,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Yverdon-les-Bains',
    eventName: null,
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'Zürich Challenge 18m Indoor - 50+ Damen Langbogen',
    year: 2024,
    place: 3,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Zürich',
    eventName: 'Zürich Challenge',
    team: null,
    bowType: 'lb',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'uschi_wegmann',
    oldName: 'Zürich Challenge 18m Indoor - 50+ Damen Traditionell',
    year: 2024,
    place: 2,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Zürich',
    eventName: 'Zürich Challenge',
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Zürich Challenge Indoor 18 Meter Barebow',
    year: 2023,
    place: 2,
    kind: 'tournament',
    tournamentType: 'indoor',
    location: 'Zürich',
    eventName: 'Zürich Challenge',
    team: null,
    bowType: 'bb',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'roli_wegmann',
    oldName: 'Sion Traditionell',
    year: 2025,
    place: 1,
    kind: 'tournament',
    tournamentType: null,
    location: 'Sion',
    eventName: null,
    team: null,
    bowType: 'tr',
    ageCategory: '50+',
    distance: null,
  },
  {
    user: 'christine.berger',
    oldName: 'Osterturnier, Plausch-Schiessen',
    year: 2024,
    place: 3,
    kind: 'club',
    tournamentType: null,
    location: null,
    eventName: 'Osterturnier, Plausch-Schiessen',
    team: null,
    bowType: 'lb',
    ageCategory: '50+',
    distance: 18,
  },
  {
    user: 'omar_oberholzer',
    oldName: '3D Clubturnier',
    year: 2018,
    place: 1,
    kind: 'club',
    tournamentType: null,
    location: null,
    eventName: '3D Clubturnier',
    team: null,
    bowType: 'cp',
    ageCategory: 'U18',
    distance: 18,
  },
];

const DUPLICATES: Placing[] = [
  { user: 'roli_wegmann', oldName: 'SM Indoor Barebow Team', year: 2024, place: 1 },
  { user: 'roli_wegmann', oldName: 'SM Indoor Team Traditionell', year: 2024, place: 1 },
];

const MATCH = `"event_name" = $1 AND "year" = $2 AND "place" = $3
  AND "user_id" = (SELECT "id" FROM "users" WHERE "username_key" = $4)`;

export class FixImportedBadges1793300000000 implements MigrationInterface {
  name = 'FixImportedBadges1793300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const fix of FIXES) {
      await queryRunner.query(
        `UPDATE "badges" SET "kind" = $5, "tournament_type" = $6, "location" = $7,
          "event_name" = $8, "team" = $9, "bow_type" = $10, "age_category" = $11,
          "distance" = $12
        WHERE "kind" = 'tournament' AND ${MATCH}`,
        [
          fix.oldName,
          fix.year,
          fix.place,
          fix.user,
          fix.kind,
          fix.tournamentType,
          fix.location,
          fix.eventName,
          fix.team,
          fix.bowType,
          fix.ageCategory,
          fix.distance,
        ],
      );
    }
    for (const duplicate of DUPLICATES) {
      await queryRunner.query(`DELETE FROM "badges" WHERE "kind" = 'tournament' AND ${MATCH}`, [
        duplicate.oldName,
        duplicate.year,
        duplicate.place,
        duplicate.user,
      ]);
    }
  }

  /** A data fix: the old free-text names come back, the deleted duplicates don't. */
  async down(queryRunner: QueryRunner): Promise<void> {
    for (const fix of FIXES) {
      await queryRunner.query(
        `UPDATE "badges" SET "kind" = 'tournament', "tournament_type" = NULL, "location" = NULL,
          "event_name" = $1, "team" = NULL, "bow_type" = NULL, "age_category" = NULL,
          "distance" = NULL
        WHERE "year" = $2 AND "place" = $3 AND "kind" = $5
          AND "event_name" IS NOT DISTINCT FROM $6 AND "location" IS NOT DISTINCT FROM $7
          AND "bow_type" = $8
          AND "user_id" = (SELECT "id" FROM "users" WHERE "username_key" = $4)`,
        [
          fix.oldName,
          fix.year,
          fix.place,
          fix.user,
          fix.kind,
          fix.eventName,
          fix.location,
          fix.bowType,
        ],
      );
    }
  }
}
