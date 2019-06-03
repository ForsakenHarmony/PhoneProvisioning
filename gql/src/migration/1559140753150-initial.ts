import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1559140753150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "top_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( type IN ('','line','speeddial','dnd','blfprivacy','blf','list','acd','dcp','xml','flash','spre','park','pickup','lcr','callforward','blfxfer','speeddialxfer','speeddialconf','directory','filter','callers','redial','conf','xfer','icom','phonelock','paging','hotdesklogin','speeddialmwi','discreetringing','empty') ) NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "phoneId" varchar)`);
        await queryRunner.query(`CREATE TABLE "softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( type IN ('','speeddial','dnd','xml','flash','spre','park','pickup','lcr','callforward','speeddialxfer','speeddialconf','directory','filter','callers','redial','conf','xfer','icom','phonelock','paging','hotdesklogin','discreetringing','callhistory','empty') ) NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar)`);
        await queryRunner.query(`CREATE TABLE "phone" ("id" varchar PRIMARY KEY NOT NULL, "idx" integer NOT NULL, "name" varchar NOT NULL, "number" varchar NOT NULL, "mac" varchar, "skipContacts" boolean NOT NULL DEFAULT (0), "companyId" varchar)`);
        await queryRunner.query(`CREATE TABLE "company" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_top_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( type IN ('','line','speeddial','dnd','blfprivacy','blf','list','acd','dcp','xml','flash','spre','park','pickup','lcr','callforward','blfxfer','speeddialxfer','speeddialconf','directory','filter','callers','redial','conf','xfer','icom','phonelock','paging','hotdesklogin','speeddialmwi','discreetringing','empty') ) NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "phoneId" varchar, CONSTRAINT "FK_87c17d58e22fc5436cfdbd42cf7" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_top_softkey"("id", "type", "label", "value", "line", "phoneId") SELECT "id", "type", "label", "value", "line", "phoneId" FROM "top_softkey"`);
        await queryRunner.query(`DROP TABLE "top_softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_top_softkey" RENAME TO "top_softkey"`);
        await queryRunner.query(`CREATE TABLE "temporary_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( type IN ('','speeddial','dnd','xml','flash','spre','park','pickup','lcr','callforward','speeddialxfer','speeddialconf','directory','filter','callers','redial','conf','xfer','icom','phonelock','paging','hotdesklogin','discreetringing','callhistory','empty') ) NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar, CONSTRAINT "FK_2618c7ff7bb2f51f17cc0df606d" FOREIGN KEY ("phoneId") REFERENCES "phone" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId" FROM "softkey"`);
        await queryRunner.query(`DROP TABLE "softkey"`);
        await queryRunner.query(`ALTER TABLE "temporary_softkey" RENAME TO "softkey"`);
        await queryRunner.query(`CREATE TABLE "temporary_phone" ("id" varchar PRIMARY KEY NOT NULL, "idx" integer NOT NULL, "name" varchar NOT NULL, "number" varchar NOT NULL, "mac" varchar, "skipContacts" boolean NOT NULL DEFAULT (0), "companyId" varchar, CONSTRAINT "FK_0efd5efb550be72c7c9b065eedd" FOREIGN KEY ("companyId") REFERENCES "company" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_phone"("id", "idx", "name", "number", "mac", "skipContacts", "companyId") SELECT "id", "idx", "name", "number", "mac", "skipContacts", "companyId" FROM "phone"`);
        await queryRunner.query(`DROP TABLE "phone"`);
        await queryRunner.query(`ALTER TABLE "temporary_phone" RENAME TO "phone"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "phone" RENAME TO "temporary_phone"`);
        await queryRunner.query(`CREATE TABLE "phone" ("id" varchar PRIMARY KEY NOT NULL, "idx" integer NOT NULL, "name" varchar NOT NULL, "number" varchar NOT NULL, "mac" varchar, "skipContacts" boolean NOT NULL DEFAULT (0), "companyId" varchar)`);
        await queryRunner.query(`INSERT INTO "phone"("id", "idx", "name", "number", "mac", "skipContacts", "companyId") SELECT "id", "idx", "name", "number", "mac", "skipContacts", "companyId" FROM "temporary_phone"`);
        await queryRunner.query(`DROP TABLE "temporary_phone"`);
        await queryRunner.query(`ALTER TABLE "softkey" RENAME TO "temporary_softkey"`);
        await queryRunner.query(`CREATE TABLE "softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( type IN ('','speeddial','dnd','xml','flash','spre','park','pickup','lcr','callforward','speeddialxfer','speeddialconf','directory','filter','callers','redial','conf','xfer','icom','phonelock','paging','hotdesklogin','discreetringing','callhistory','empty') ) NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "idle" boolean NOT NULL DEFAULT (1), "connected" boolean NOT NULL DEFAULT (1), "incoming" boolean NOT NULL DEFAULT (1), "outgoing" boolean NOT NULL DEFAULT (1), "busy" boolean NOT NULL DEFAULT (1), "phoneId" varchar)`);
        await queryRunner.query(`INSERT INTO "softkey"("id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId") SELECT "id", "type", "label", "value", "line", "idle", "connected", "incoming", "outgoing", "busy", "phoneId" FROM "temporary_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_softkey"`);
        await queryRunner.query(`ALTER TABLE "top_softkey" RENAME TO "temporary_top_softkey"`);
        await queryRunner.query(`CREATE TABLE "top_softkey" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( type IN ('','line','speeddial','dnd','blfprivacy','blf','list','acd','dcp','xml','flash','spre','park','pickup','lcr','callforward','blfxfer','speeddialxfer','speeddialconf','directory','filter','callers','redial','conf','xfer','icom','phonelock','paging','hotdesklogin','speeddialmwi','discreetringing','empty') ) NOT NULL, "label" varchar NOT NULL DEFAULT (''), "value" varchar NOT NULL DEFAULT (''), "line" integer NOT NULL DEFAULT (0), "phoneId" varchar)`);
        await queryRunner.query(`INSERT INTO "top_softkey"("id", "type", "label", "value", "line", "phoneId") SELECT "id", "type", "label", "value", "line", "phoneId" FROM "temporary_top_softkey"`);
        await queryRunner.query(`DROP TABLE "temporary_top_softkey"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "phone"`);
        await queryRunner.query(`DROP TABLE "softkey"`);
        await queryRunner.query(`DROP TABLE "top_softkey"`);
    }

}
