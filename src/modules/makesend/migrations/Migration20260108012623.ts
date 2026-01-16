import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260108012623 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "makesend_setting" ("id" text not null, "originProvinceId" integer null, "originDistrictId" integer null, "originProvinceName" text null, "originDistrictName" text null, "senderName" text null, "senderPhone" text null, "pickupAddress" text null, "pickupPostcode" text null, "timeCutoff" text null, "supportedParcelSizes" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "makesend_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_makesend_setting_deleted_at" ON "makesend_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "makesend_setting" cascade;`);
  }

}
