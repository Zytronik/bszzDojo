import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792700000000 implements MigrationInterface {
  name = 'InitialSchema1792700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "username" character varying(30) NOT NULL,
        "username_key" character varying(30) NOT NULL,
        "email" character varying(254) NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" character varying(10) NOT NULL DEFAULT 'user',
        "rank" character varying(20),
        "settings" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_username_key" ON "users" ("username_key")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")`);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`);

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
    await queryRunner.query(`CREATE INDEX "IDX_password_resets_user_id" ON "password_resets" ("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "scores" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "bow_type" character varying(4) NOT NULL,
        "target_size" smallint NOT NULL,
        "is_spot" boolean NOT NULL,
        "distance" smallint NOT NULL,
        "arrows" smallint NOT NULL,
        "tens" smallint NOT NULL,
        "nines" smallint NOT NULL,
        "result" smallint NOT NULL,
        "shot_on" date NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_scores" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_scores_user_shot_on" ON "scores" ("user_id", "shot_on")`);
    await queryRunner.query(`CREATE INDEX "IDX_scores_distance_arrows" ON "scores" ("distance", "arrows")`);

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
    await queryRunner.query(`CREATE INDEX "IDX_badge_requests_user_id" ON "badge_requests" ("user_id")`);

    // Everything belonging to a user goes when the account is deleted.
    for (const table of ['refresh_tokens', 'password_resets', 'scores', 'badges', 'badge_requests']) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD CONSTRAINT "FK_${table}_user" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['badge_requests', 'badges', 'scores', 'password_resets', 'refresh_tokens']) {
      await queryRunner.query(`DROP TABLE "${table}"`);
    }
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
