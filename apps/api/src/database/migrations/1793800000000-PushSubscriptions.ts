import type { MigrationInterface, QueryRunner } from 'typeorm';

export class PushSubscriptions1793800000000 implements MigrationInterface {
  name = 'PushSubscriptions1793800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "push_subscriptions" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "endpoint" text NOT NULL, "p256dh" character varying(100) NOT NULL, "auth" character varying(50) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_push_subscriptions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_push_subscriptions_user_id" ON "push_subscriptions" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_push_subscriptions_endpoint" ON "push_subscriptions" ("endpoint") `,
    );
    await queryRunner.query(
      `ALTER TABLE "push_subscriptions" ADD CONSTRAINT "FK_push_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_subscriptions" DROP CONSTRAINT "FK_push_subscriptions_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_push_subscriptions_endpoint"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_push_subscriptions_user_id"`);
    await queryRunner.query(`DROP TABLE "push_subscriptions"`);
  }
}
