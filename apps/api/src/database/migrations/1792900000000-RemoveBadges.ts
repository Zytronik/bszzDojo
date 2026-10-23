import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Auszeichnungen (`badges`) and badge requests are gone; Abzeichen (`users.rank`) stay. */
export class RemoveBadges1792900000000 implements MigrationInterface {
  name = 'RemoveBadges1792900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "badge_requests"`);
    await queryRunner.query(`DROP TABLE "badges"`);
  }

  // Brings back the empty tables; their data is lost.
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "badges" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "year" smallint NOT NULL,
        "place" smallint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_badges" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_badges_user_id" ON "badges" ("user_id")`);
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
    for (const table of ['badges', 'badge_requests']) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD CONSTRAINT "FK_${table}_user" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }
}
