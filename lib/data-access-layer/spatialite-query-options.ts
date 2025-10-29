import { sql } from "drizzle-orm";
import { db } from "../drizzle/client";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { logger } from "@/utils/logger";

export async function checkForSpatialitetables() {
  try {
    // const r = await db.run(sql`SELECT InitSpatialMetaData(1);`);
    // const res = await db.run(sql`SELECT spatialite_version() AS spatialite_version,
    //    sqlite_version() AS sqlite_version,
    //    proj4_version() AS proj4_version,
    //    geos_version() AS geos_version;`);
    // logger.log("spatialite", res);
    const result = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table';`);
    // logger.log("tables", result);
    return {
      result,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export const checkForSpatialitetablesQueryOptions = queryOptions({
  queryKey: ["checkForSpatialitetables"],
  queryFn: checkForSpatialitetables,
});

export const checkForSpatialitetablesMutationOptions = mutationOptions({
  mutationFn: checkForSpatialitetables,
});
