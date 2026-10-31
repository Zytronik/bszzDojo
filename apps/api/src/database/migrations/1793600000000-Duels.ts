import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Duels1793600000000 implements MigrationInterface {
  name = 'Duels1793600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "duels" (
        "id" uuid NOT NULL,
        "challenger_id" uuid NOT NULL,
        "opponent_id" uuid NOT NULL,
        "format" character varying(5) NOT NULL,
        "distance" smallint NOT NULL,
        "target_size" smallint NOT NULL,
        "is_spot" boolean NOT NULL,
        "challenger_bow" character varying(4) NOT NULL,
        "opponent_bow" character varying(4),
        "status" character varying(10) NOT NULL,
        "winner" character varying(10),
        "forfeited_by" character varying(10),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_duels" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_duels_challenger_id" ON "duels" ("challenger_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_duels_opponent_id" ON "duels" ("opponent_id")`);
    await queryRunner.query(`
      ALTER TABLE "duels" ADD CONSTRAINT "FK_duels_challenger" FOREIGN KEY ("challenger_id")
      REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "duels" ADD CONSTRAINT "FK_duels_opponent" FOREIGN KEY ("opponent_id")
      REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "duel_ends" (
        "id" uuid NOT NULL,
        "duel_id" uuid NOT NULL,
        "side" character varying(10) NOT NULL,
        "shoot_off" boolean NOT NULL,
        "end_index" smallint NOT NULL,
        "arrows" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_duel_ends" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_duel_ends_slot" ON "duel_ends" ("duel_id", "side", "shoot_off", "end_index")`,
    );
    await queryRunner.query(`
      ALTER TABLE "duel_ends" ADD CONSTRAINT "FK_duel_ends_duel" FOREIGN KEY ("duel_id")
      REFERENCES "duels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "duel_ends"`);
    await queryRunner.query(`DROP TABLE "duels"`);
  }
}
