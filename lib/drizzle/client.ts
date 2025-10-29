import { drizzle } from "drizzle-orm/op-sqlite";
import * as schema from "./schema/tables";
import { open } from "@op-engineering/op-sqlite";

const opsqliteDb = open({
  name: "myDB",
});
const path = "libspatialite";
opsqliteDb.loadExtension(path, "sqlite3_modspatialite_init");
export const db = drizzle(opsqliteDb, {
  //   logger: true,
  schema: schema,
});
