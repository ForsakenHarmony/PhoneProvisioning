import { MigrationInterface, QueryRunner } from "typeorm";

export class phoneType1569939955129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "temporary_phone" ("id" varchar PRIMARY KEY NOT NULL, "idx" integer NOT NULL, "name" varchar NOT NULL, "number" varchar NOT NULL, "mac" varchar, "skipContacts" boolean NOT NULL DEFAULT (0), "companyId" varchar, "type" varchar, CONSTRAINT "FK_0efd5efb550be72c7c9b065eedd" FOREIGN KEY ("companyId") REFERENCES "company" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "temporary_phone"("id", "idx", "name", "number", "mac", "skipContacts", "companyId") SELECT "id", "idx", "name", "number", "mac", "skipContacts", "companyId" FROM "phone"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "phone"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "temporary_phone" RENAME TO "phone"`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "phone" RENAME TO "temporary_phone"`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "phone" ("id" varchar PRIMARY KEY NOT NULL, "idx" integer NOT NULL, "name" varchar NOT NULL, "number" varchar NOT NULL, "mac" varchar, "skipContacts" boolean NOT NULL DEFAULT (0), "companyId" varchar, CONSTRAINT "FK_0efd5efb550be72c7c9b065eedd" FOREIGN KEY ("companyId") REFERENCES "company" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "phone"("id", "idx", "name", "number", "mac", "skipContacts", "companyId") SELECT "id", "idx", "name", "number", "mac", "skipContacts", "companyId" FROM "temporary_phone"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "temporary_phone"`, undefined);
  }
}
