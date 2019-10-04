import { MigrationInterface, QueryRunner } from "typeorm";

export class phoneType1569939955129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // ADD TYPE
    await queryRunner.query(`
      ALTER TABLE "phone" ADD COLUMN "type" varchar;
    `);
    // make `phoneId` NOT NULL
    await queryRunner.query(`
      CREATE TABLE "temporary_top_softkey" (
        "id" varchar PRIMARY KEY NOT NULL,
        "type" varchar NOT NULL,
        "label" varchar NOT NULL DEFAULT (''),
        "value" varchar NOT NULL DEFAULT (''),
        "line" integer NOT NULL DEFAULT (0),
        "phoneId" varchar NOT NULL,
        "idx" integer NOT NULL DEFAULT (0),
        CONSTRAINT "FK_87c17d58e22fc5436cfdbd42cf7" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      INSERT INTO "temporary_top_softkey" ("id", "type", "label", "value", "line", "phoneId", "idx")
        SELECT "id", "type", "label", "value", "line", "phoneId", "idx" FROM "top_softkey"
    `);
    await queryRunner.query(`DROP TABLE "top_softkey"`);
    await queryRunner.query(`ALTER TABLE "temporary_top_softkey" RENAME TO "top_softkey"`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    throw new Error("Not supported");
  }
}
