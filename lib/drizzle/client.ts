import { drizzle } from "drizzle-orm/op-sqlite";
import { open } from "@op-engineering/op-sqlite";
import * as schema from "./schema/tables";

const opsqliteDb = open({
  name: "myDB",
});
export const db = drizzle(opsqliteDb, {
//   logger: true,
  schema: schema,
});
