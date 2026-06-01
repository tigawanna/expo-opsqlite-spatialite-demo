# Expo op-sqlite with SpatiaLite Demo

A demonstration of using [SpatiaLite](https://www.gaia-gis.it/fossil/libspatialite/index) with [op-sqlite](https://github.com/OP-Engineering/op-sqlite) in a React Native Expo application. This project showcases spatial database capabilities on mobile devices, enabling powerful geospatial queries and operations directly on the device.

## Features

- **Native Spatial Database**: Full SpatiaLite 5.0.0 functionality integrated into React Native
- **Drizzle ORM Integration**: Type-safe SQL queries with spatial extensions
- **Geospatial Queries**: Distance calculations, spatial relationships, and geometry operations
- **Auto-Download Plugin**: SpatiaLite native libs are fetched automatically during `expo prebuild`
- **16KB Page Aligned**: Android `.so` files built with NDK r29, ready for Play Store
- **Modern Architecture**: Expo Router, React Query, and latest React Native features

## Why This Approach

| Feature | Manual Extension Loading | op-sqlite + Config Plugin |
|---------|--------------------------|---------------------------|
| Setup complexity | High | One-time `app.json` config |
| Drizzle ORM | Not compatible | Full support |
| PowerSync | Not compatible | Compatible |
| Native lib management | Manual per-arch copying | Auto-download or local path |
| Spatial functions | Manual FFI | Direct SQL access |

## Prerequisites

- Node.js 18+
- pnpm (or npm)
- Android Studio with SDK (for Android)
- Xcode with iOS SDK (for iOS, future)

## Quick Start

```bash
git clone https://github.com/tigawanna/expo-opsqlite-spatialite-demo.git
cd expo-opsqlite-spatialite-demo
pnpm install
```

### Option A: Auto-download from GitHub Releases (recommended)

In `app.json`, configure the plugin to download from a release:

```json
["./plugins/opsqlite-spatialite/with-spatialite", {
  "version": "5.0.0"
}]
```

Then prebuild and run:

```bash
pnpm prebuild:android
pnpm android
```

The plugin will automatically download the correct `.so` files for all architectures, cache them in `~/.cache/spatialite-libs/`, and copy them into `android/app/src/main/jniLibs/`.

### Option B: Local build (for development)

If you're building SpatiaLite from source using [react-native-spatialite-artifacts](https://github.com/tigawanna/react-native-spatialite-artifacts):

```json
["./plugins/opsqlite-spatialite/with-spatialite", {
  "version": "5.0.0",
  "localPath": "../react-native-spatialite-artifacts/android/libs"
}]
```

```bash
# Build the artifacts first
cd ../react-native-spatialite-artifacts
mise run fetch
mise run build:android

# Then prebuild the demo app
cd ../expo-opsqlite-spatialite-demo
pnpm prebuild:android
pnpm android
```

## Plugin Configuration

The config plugin (`plugins/opsqlite-spatialite/with-spatialite.js`) accepts these options in `app.json`:

| Option | Default | Description |
|--------|---------|-------------|
| `version` | `"5.0.0"` | SpatiaLite version to download |
| `repo` | `"tigawanna/react-native-spatialite-artifacts"` | GitHub repo for releases |
| `localPath` | `null` | Path to local `.so` files (skips download) |

The download cache location can be overridden with the `SPATIALITE_CACHE_DIR` environment variable.

## Architecture

### Database Client

```javascript
import { open } from "@op-engineering/op-sqlite";

const opsqliteDb = open({ name: "myDB" });
opsqliteDb.loadExtension("libspatialite", "sqlite3_modspatialite_init");
```

### Spatial Schema (Drizzle)

```typescript
export const notes = table("notes", {
  id: t.integer("id").primaryKey({ autoIncrement: true }),
  title: t.text("title").notNull(),
  timestamp: t.text().default(sql`(CURRENT_TIMESTAMP)`),
  pin: point("pin"),
});
```

### Spatial Queries

See `lib/data-access-layer/spatial-distance.ts` for the distance expression used in this app.

```typescript
import { distanceFromNairobiMeters } from "@/lib/data-access-layer/spatial-distance";

const query = db
  .select({
    id: notes.id,
    title: notes.title,
    latitude: sql<string>`ST_Y(${notes.pin})`.as("latitude"),
    longitude: sql<string>`ST_X(${notes.pin})`.as("longitude"),
    distance: distanceFromNairobiMeters.as("distance"),
  })
  .from(notes)
  .orderBy(sql`distance ASC`);
```

## Writing good geospatial queries

Tips learned while building this demo on **SpatiaLite + op-sqlite + Drizzle** on Android. They apply to most mobile SpatiaLite builds.

### 1. Initialize spatial metadata once

Before any geometry or distance work, run:

```sql
SELECT InitSpatialMetaData(1);
```

In this project that happens in `ensureSpatialMetadata()` (`lib/drizzle/client.ts`), called from `InitDatabase` after migrations and before spatial reads/writes. Without it, some functions behave inconsistently and `spatial_ref_sys` may be empty.

### 2. Respect coordinate order (GeoJSON vs display)

| Convention | Order | Example (Nairobi) |
|------------|--------|-------------------|
| **GeoJSON** `coordinates` | `[longitude, latitude]` | `[36.8219, -1.2921]` |
| **SpatiaLite** `ST_X` / `ST_Y` | X = lng, Y = lat | `ST_X` → 36.8219, `ST_Y` → -1.2921 |
| **MakePoint** | `MakePoint(lng, lat, srid)` | `MakePoint(36.8219, -1.2921, 4326)` |

Swapping lat/lng is the most common bug. UI labels should say **lat, lng** but storage and GeoJSON stay **lng, lat**.

### 3. Always tag geometries with SRID 4326 (WGS84)

On insert, wrap GeoJSON with WGS84:

```typescript
// lib/drizzle/drizzlespatialite-types.ts
toDriver(value) {
  return sql`SetSRID(GeomFromGeoJSON(${value}), 4326)`;
}
```

For ad‑hoc reference points in queries, prefer explicit points:

```sql
MakePoint(36.8219, -1.2921, 4326)
```

not an untagged blob. Geographic distance functions expect **long/lat degrees on SRID 4326**.

### 4. Use the right function for distance in meters

| Expression | Typical result on this stack | Safe for “km from Nairobi”? |
|------------|------------------------------|-----------------------------|
| `ST_Distance(a, b)` | **Degrees** (CRS units) | No — values like `32` look like meters but are ~32° |
| `ST_Distance(a, b, 1)` | Often **NULL** | No — ellipsoid flag not always supported |
| `Distance(a, b, 1)` | Meters on ellipsoid, or **NULL** if PROJ/ellipsoid unavailable | Maybe |
| `Distance(a, b, 0)` | Great‑circle **meters** | Often works when `1` is NULL |
| Haversine on `ST_X` / `ST_Y` | **Meters** (approximate) | Yes — reliable fallback |

**Rule:** Never treat `ST_Distance` results as meters unless you know your CRS is projected (e.g. metres-based EPSG).

If distances look like **tens of meters** between continents, you are almost certainly displaying **degrees**.

### 5. Pattern used in this repo (recommended for mobile)

Rebuild points with `MakePoint` from stored geometry, then fall back if native distance returns NULL:

```sql
COALESCE(
  Distance(
    MakePoint(ST_X(pin), ST_Y(pin), 4326),
    MakePoint(?, ?, 4326),
    1
  ),
  Distance(
    MakePoint(ST_X(pin), ST_Y(pin), 4326),
    MakePoint(?, ?, 4326),
    0
  ),
  -- haversine in meters using ST_X/ST_Y and known reference lat/lng
  ...
) AS distance
```

Implemented in `lib/data-access-layer/spatial-distance.ts`. Why it works here:

- **`MakePoint(..., 4326)`** — clear geographic points even if the blob was stored without SRID metadata.
- **`Distance(..., 0)`** — great‑circle meters when ellipsoid (`1`) is NULL on stripped mobile builds.
- **Haversine** — last resort so the UI never gets NULL; accurate enough for sorting and display.

Display in the app: divide meters by `1000` for km (see `formatDistanceKm` in `components/notes/NoteCard.tsx`).

### 6. Extracting coordinates for lists and maps

```sql
ST_Y(pin) AS latitude,
ST_X(pin) AS longitude
```

Do not assume `ST_X` is latitude. This demo shows **lat, lng** in the UI but reads them from **Y, X**.

### 7. Sorting and filtering

- **Sort by computed distance:** `ORDER BY distance ASC` on the alias works in SQLite when the expression is in the SELECT list (as in `buildGetNotesQuery`).
- **Filter within radius (pattern):** wrap the same distance expression and `WHERE distance < ?` or use `ST_DWithin` only after confirming it returns meters with your SRID and build.
- **Keep reference constants** (e.g. Nairobi lat/lng) in one module (`spatial-distance.ts`) so SQL, UI copy, and tests stay aligned.

### 8. Drizzle-specific habits

- Put raw spatial SQL in **reusable `sql` fragments** (`spatial-distance.ts`), not copy-pasted strings.
- Use **bound parameters** for variable reference points: `MakePoint(${lng}, ${lat}, 4326)` — Drizzle inlines them safely.
- Preview what actually runs: `formatExecutableSql(query)` + `toSQL()` (see `lib/data-access-layer/sql-format.ts` and the SQL panel in the app).
- Call `await ensureSpatialMetadata()` in the data layer before spatial queries if you bypass `InitDatabase`.

### 9. Debugging checklist

1. Log the generated SQL — confirm you see `COALESCE` / `MakePoint`, not an old `ST_Distance` without the third argument.
2. Select one row: `ST_X(pin)`, `ST_Y(pin)`, and your distance expression — sanity-check against [a known calculator](https://www.movable-type.co.uk/scripts/latlong.html).
3. If `Distance(..., 1)` is always NULL on device, rely on `0` + haversine; do not ship degree values as meters.
4. After changing insert geometry logic, **delete and re-seed** (or migrate) so every `pin` uses `SetSRID(GeomFromGeoJSON(...), 4326)`.
5. Reload the JS bundle after editing `spatial-distance.ts` — Metro can serve stale code while logs still show an old query (you may see `Distance(SetSRID(...))` in logs until a full reload).

### 10. Quick reference — do / don’t

| Do | Don’t |
|----|--------|
| `InitSpatialMetaData(1)` once per DB | Assume the extension load is enough |
| GeoJSON `[lng, lat]` | GeoJSON `[lat, lng]` |
| `SetSRID(GeomFromGeoJSON(...), 4326)` on write | Store untagged geometry blobs |
| `Distance(g1, g2, 0 or 1)` or haversine for meters | `ST_Distance(a, b)` as meters on WGS84 |
| `MakePoint(ST_X(pin), ST_Y(pin), 4326)` for queries | Only `SetSRID(pin, 4326)` when Distance returns NULL |
| `COALESCE` fallbacks on mobile | Single function that returns NULL in production |
| Centralize reference coordinates | Duplicate Nairobi constants in UI and SQL |

## Project Structure

```
app/                          # Expo Router screens
lib/
  drizzle/
    client.ts                 # Database connection + SpatiaLite loading
    schema/tables.ts          # Drizzle schema with spatial types
    drizzlespatialite-types.ts # Custom spatial column types
    InitDatabase.tsx          # Migration runner component
  data-access-layer/
    todos.ts                  # CRUD + spatial queries
    spatial-distance.ts       # Distance COALESCE (MakePoint + haversine)
    sql-format.ts             # SQL preview / multiline formatting
    spatialite-query-options.ts
  tanstack/query/             # React Query setup
plugins/
  opsqlite-spatialite/
    with-spatialite.js        # Expo config plugin (auto-download + copy)
drizzle/                      # Generated migrations
```

## Running the Project

```bash
# Development
pnpm start

# Android (requires dev build)
pnpm prebuild:android
pnpm android

# Generate new migrations after schema changes
pnpm db:migrate
```

## iOS Support

Android only for now. iOS support will require:
1. Building SpatiaLite as a static library / dynamic framework for iOS
2. Extending the config plugin with an iOS `withDangerousMod`
3. Using op-sqlite's `getDylibPath` for extension loading

## Supported Spatial Operations

Used successfully in this demo:

- **Geometry creation**: `GeomFromGeoJSON()`, `SetSRID()`, `MakePoint()`
- **Coordinate extraction**: `ST_X()`, `ST_Y()`
- **Distance (meters)**: `Distance(..., 0|1)` with haversine fallback — see [Writing good geospatial queries](#writing-good-geospatial-queries)
- **Metadata**: `InitSpatialMetaData()`

Also available in SpatiaLite (validate on device before relying on them): `ST_Contains`, `ST_Intersects`, `ST_Area`, R‑Tree indexes, etc.

## Acknowledgments

- [op-sqlite](https://github.com/OP-Engineering/op-sqlite) - SQLite wrapper for React Native
- [SpatiaLite](https://www.gaia-gis.it/fossil/libspatialite/index) - Spatial database engine
- [react-native-spatialite-artifacts](https://github.com/tigawanna/react-native-spatialite-artifacts) - NDK r29 build scripts
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL builder
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching

## License

MIT
