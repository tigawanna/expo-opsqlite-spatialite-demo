import { sql, type SQL } from "drizzle-orm";
import { notes } from "../drizzle/schema/tables";

export const NAIROBI_LAT = -1.2921;
export const NAIROBI_LNG = 36.8219;

const NAIROBI_POINT = sql`MakePoint(${NAIROBI_LNG}, ${NAIROBI_LAT}, 4326)`;
const NOTE_POINT = sql`MakePoint(ST_X(${notes.pin}), ST_Y(${notes.pin}), 4326)`;

const HAVERSINE_METERS = sql`(
  6371000.0 * 2 * ASIN(
    MIN(
      1.0,
      SQRT(
        POWER(SIN((RADIANS(ST_Y(${notes.pin}) - ${NAIROBI_LAT})) / 2), 2) +
        COS(RADIANS(${NAIROBI_LAT})) * COS(RADIANS(ST_Y(${notes.pin}))) *
        POWER(SIN((RADIANS(ST_X(${notes.pin}) - ${NAIROBI_LNG})) / 2), 2)
      )
    )
  )
)`;

export const distanceFromNairobiMeters: SQL = sql`COALESCE(
  Distance(${NOTE_POINT}, ${NAIROBI_POINT}, 1),
  Distance(${NOTE_POINT}, ${NAIROBI_POINT}, 0),
  ${HAVERSINE_METERS}
)`;
