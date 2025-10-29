import { sql } from "drizzle-orm/sql";
import { customType } from "drizzle-orm/sqlite-core";

/**
 * SpatiaLite Geometry Types for Drizzle ORM
 *
 * All types use direct GeoJSON conversion without ST_MakeValid
 * since valid GeoJSON input should create valid geometries.
 */

// Point geometry type - already fixed
export const point = customType<{
  data: string; // GeoJSON string or "POINT(lng lat)"
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`;
  },
});

// MultiPoint geometry type
export const multiPoint = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});

// LineString geometry type
export const lineString = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});

// MultiLineString geometry type
export const multiLineString = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});

// Polygon geometry type
export const polygon = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});

// MultiPolygon geometry type
export const multiPolygon = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});

// Generic geometry type (accepts any geometry)
export const geometry = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});

// Geometry collection type
export const geometryCollection = customType<{
  data: string; // GeoJSON string
}>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return sql`GeomFromGeoJSON(${value})`; // Removed ST_MakeValid
  },
});
