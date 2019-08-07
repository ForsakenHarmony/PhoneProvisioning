import {MigrationInterface, QueryRunner} from "typeorm";

export class dndSoftkeys1565015427830 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_top_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "phoneId" varchar, "idx" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_87c17d58e22fc5436cfdbd42cf7" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_top_softkey"("id", "type", "label", "value", "line", "phoneId") SELECT "id", "type", "label", "value", "line", "phoneId" FROM "top_softkey"`);
        await queryRunner.query(`DROP TABLE "top_softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_top_softkey" RENAME TO "top_softkey"`);
        await queryRunner.query(`CREATE TABLE "temporary_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar, "idx" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_2618c7ff7bb2f51f17cc0df606d" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId" FROM "softkey"`);
        await queryRunner.query(`DROP TABLE "softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_softkey" RENAME TO "softkey"`);
        await queryRunner.query(`CREATE TABLE "temporary_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar, "idx" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx" FROM "softkey"`);
        await queryRunner.query(`DROP TABLE "softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_softkey" RENAME TO "softkey"`);
        await queryRunner.query(`CREATE TABLE "temporary_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar NOT NULL, "idx" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx" FROM "softkey"`);
        await queryRunner.query(`DROP TABLE "softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_softkey" RENAME TO "softkey"`);
        await queryRunner.query(`CREATE TABLE "temporary_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar NOT NULL, "idx" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_2618c7ff7bb2f51f17cc0df606d" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx" FROM "softkey"`);
        await queryRunner.query(`DROP TABLE "softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_softkey" RENAME TO "softkey"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "softkey" RENAME TO "temporary_softkey"`);
        await queryRunner.query(`CREATE TABLE "softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar NOT NULL, "idx" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx" FROM "temporary_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_softkey"`);
        await queryRunner.query(`ALTER TABLE "softkey" RENAME TO "temporary_softkey"`);
        await queryRunner.query(`CREATE TABLE "softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar, "idx" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx" FROM "temporary_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_softkey"`);
        await queryRunner.query(`ALTER TABLE "softkey" RENAME TO "temporary_softkey"`);
        await queryRunner.query(`CREATE TABLE "softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar, "idx" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_2618c7ff7bb2f51f17cc0df606d" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId", "idx" FROM "temporary_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_softkey"`);
        await queryRunner.query(`ALTER TABLE "softkey" RENAME TO "temporary_softkey"`);
        await queryRunner.query(`CREATE TABLE "softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar, CONSTRAINT "FK_2618c7ff7bb2f51f17cc0df606d" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId" FROM "temporary_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_softkey"`);
        await queryRunner.query(`ALTER TABLE "top_softkey" RENAME TO "temporary_top_softkey"`);
        await queryRunner.query(`CREATE TABLE "top_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "phoneId" varchar, CONSTRAINT "FK_87c17d58e22fc5436cfdbd42cf7" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "top_softkey"("id", "type", "label", "value", "line", "phoneId") SELECT "id", "type", "label", "value", "line", "phoneId" FROM "temporary_top_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_top_softkey"`);
    }

}
