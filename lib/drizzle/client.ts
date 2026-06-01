import { drizzle } from "drizzle-orm/op-sqlite";
import { sql } from "drizzle-orm";
import * as schema from "./schema/tables";
import { open } from "@op-engineering/op-sqlite";

const opsqliteDb = open({
  name: "myDB",
});
const path = "libspatialite";
opsqliteDb.loadExtension(path, "sqlite3_modspatialite_init");

export const db = drizzle(opsqliteDb, {
  logger: true,
  schema: schema,
});

let spatialMetadataReady = false;

export async function ensureSpatialMetadata(): Promise<void> {
  if (spatialMetadataReady) {
    return;
  }
  await db.run(sql`SELECT InitSpatialMetaData(1)`);
  spatialMetadataReady = true;
}
