import { sql } from "drizzle-orm/sql";
import * as t from "drizzle-orm/sqlite-core";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import { point } from "../drizzlespatialite-types";

export const notes = table("notes", {
  id: t.integer("id").primaryKey({ autoIncrement: true }),
  title: t.text("title").notNull(),
  timestamp: t.text().default(sql`(CURRENT_TIMESTAMP)`),
  pin:point("pin"), // ← this is correct for WKB geometry
});
