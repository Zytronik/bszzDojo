import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Users record their own placings now, with more details, so badge requests are gone. Existing
 * placings only had a name: it becomes the event name of a "Turnier", and the new details stay
 * empty.
 */
export class SelfRecordedBadges1792900000000 implements MigrationInterface {
  name = 'SelfRecordedBadges1792900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // An earlier draft of this change (`RemoveBadges`) ran on the dev database and dropped both
    // tables; bring `badges` back in its old shape there so both databases end up the same.
    await queryRunner.query(`DELETE FROM "migrations" WHERE "name" = 'RemoveBadges1792900000000'`);
    await queryRunner.query(`DROP TABLE IF EXISTS "badge_requests"`);
    if (!(await queryRunner.hasTable('badges'))) {
      await queryRunner.query(`
        CREATE TABLE "badges" (
          "id" uuid NOT NULL,
          "user_id" uuid NOT NULL,
          "name" character varying(100) NOT NULL,
          "year" smallint NOT NULL,
          "place" smallint NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "PK_badges" PRIMARY KEY ("id"),
          CONSTRAINT "FK_badges_user" FOREIGN KEY ("user_id")
            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )
      `);
      await queryRunner.query(`CREATE INDEX "IDX_badges_user_id" ON "badges" ("user_id")`);
    }
    await queryRunner.query(`ALTER TABLE "badges" RENAME COLUMN "name" TO "event_name"`);
    await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "event_name" DROP NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "badges"
        ADD "kind" character varying(20) NOT NULL DEFAULT 'tournament',
        ADD "bow_type" character varying(4),
        ADD "distance" smallint,
        ADD "location" character varying(100),
        ADD "team" boolean,
        ADD "venue" character varying(10),
        ADD "is_3d" boolean,
        ADD "age_category" character varying(40)
    `);
    await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "kind" DROP DEFAULT`);
  }

  // Placings without an event name get their kind as name; requests come back empty.
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "badges" SET "event_name" = CASE "kind" WHEN 'sm' THEN 'SM' ELSE 'Clubturnier' END
      WHERE "event_name" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "badges"
        DROP COLUMN "kind",
        DROP COLUMN "bow_type",
        DROP COLUMN "distance",
        DROP COLUMN "location",
        DROP COLUMN "team",
        DROP COLUMN "venue",
        DROP COLUMN "is_3d",
        DROP COLUMN "age_category"
    `);
    await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "event_name" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "badges" RENAME COLUMN "event_name" TO "name"`);
    await queryRunner.query(`
      CREATE TABLE "badge_requests" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "place" smallint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_badge_requests" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_badge_requests_user_id" ON "badge_requests" ("user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "badge_requests"
      ADD CONSTRAINT "FK_badge_requests_user" FOREIGN KEY ("user_id")
      REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }
}
