import { sql } from "drizzle-orm/sql";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const notes = table("notes", {
  id: t.integer("id").primaryKey({ autoIncrement: true }),
  title: t.text("title").notNull(),
  timestamp: t.text().default(sql`(CURRENT_TIMESTAMP)`),
});
