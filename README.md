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

```typescript
const nairobiGeoJSON = '{"type":"Point","coordinates":[36.8219,-1.2921]}';
const query = db
  .select({
    id: notes.id,
    title: notes.title,
    latitude: sql<string>`ST_Y(${notes.pin})`.as("latitude"),
    longitude: sql<string>`ST_X(${notes.pin})`.as("longitude"),
    distance: sql`Distance(SetSRID(${notes.pin}, 4326), SetSRID(GeomFromGeoJSON(${nairobiGeoJSON}), 4326), 1)`.as("distance"),
  })
  .from(notes)
  .orderBy(sql`distance ASC`);
```

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

- **Geometry Creation**: `GeomFromGeoJSON()`, `GeomFromText()`
- **Distance Calculations**: `ST_Distance()`
- **Coordinate Extraction**: `ST_X()`, `ST_Y()`
- **Spatial Indexing**: Built-in R-Tree support
- **Geometry Functions**: `ST_Area()`, `ST_Length()`, `ST_Contains()`, `ST_Intersects()`, etc.

## Acknowledgments

- [op-sqlite](https://github.com/OP-Engineering/op-sqlite) - SQLite wrapper for React Native
- [SpatiaLite](https://www.gaia-gis.it/fossil/libspatialite/index) - Spatial database engine
- [react-native-spatialite-artifacts](https://github.com/tigawanna/react-native-spatialite-artifacts) - NDK r29 build scripts
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL builder
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching

## License

MIT
