import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Accounts are identified by username alone: no email, so no password reset by mail either.
 * Adds an optional display name. Usernames with characters no longer allowed (spaces, umlauts)
 * get them replaced by `_` and keep the old spelling as their display name.
 */
const FROM = 'äöüÄÖÜàâáèéêëìíîïòóôùúûçñÀÂÁÈÉÊËÌÍÎÏÒÓÔÙÚÛÇÑ';
const TO = 'aouAOUaaaeeeeiiiiooouuucnAAAEEEEIIIIOOOUUUCN';

export class UsernameOnly1792800000000 implements MigrationInterface {
  name = 'UsernameOnly1792800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "display_name" character varying(40)`);
    // Like `legacyUsername()` in the import: accents dropped, anything else not allowed becomes `_`;
    // the old spelling stays visible as the display name.
    const allowed = `regexp_replace(translate("username", '${FROM}', '${TO}'), '[^a-zA-Z0-9._-]', '_', 'g')`;
    await queryRunner.query(`
      UPDATE "users"
      SET "display_name" = left("username", 40),
          "username" = ${allowed},
          "username_key" = lower(${allowed})
      WHERE "username" !~ '^[a-zA-Z0-9._-]+$'
    `);
    await queryRunner.query(`DROP INDEX "UQ_users_email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(`DROP TABLE "password_resets"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_resets" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_resets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_password_resets_user_id" ON "password_resets" ("user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "password_resets"
      ADD CONSTRAINT "FK_password_resets_user" FOREIGN KEY ("user_id")
      REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    // Emails are gone; every account gets a unique placeholder.
    await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(254)`);
    await queryRunner.query(`UPDATE "users" SET "email" = "id" || '@invalid.local'`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "display_name"`);
  }
}
