import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Friends1793600000000 implements MigrationInterface {
  name = 'Friends1793600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "friends" ("user_id" uuid NOT NULL, "friend_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_friends_not_self" CHECK ("user_id" <> "friend_id"), CONSTRAINT "PK_friends" PRIMARY KEY ("user_id", "friend_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_friends_friend_id" ON "friends" ("friend_id") `);
    await queryRunner.query(
      `ALTER TABLE "friends" ADD CONSTRAINT "FK_friends_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "friends" ADD CONSTRAINT "FK_friends_friend" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_friends_friend"`);
    await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_friends_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_friends_friend_id"`);
    await queryRunner.query(`DROP TABLE "friends"`);
  }
}
