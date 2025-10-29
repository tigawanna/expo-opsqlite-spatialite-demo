# Expo op-sqlite with SpatiaLite Demo

A demonstration of using [SpatiaLite](https://www.gaia-gis.it/fossil/libspatialite/index) with [op-sqlite](https://github.com/OP-Engineering/op-sqlite) in a React Native Expo application. This project showcases spatial database capabilities on mobile devices, enabling powerful geospatial queries and operations directly on the device.

## 🚀 Features

- **Native Spatial Database**: Full SpatiaLite functionality integrated into React Native
- **Drizzle ORM Integration**: Type-safe SQL queries with spatial extensions
- **Geospatial Queries**: Distance calculations, spatial relationships, and geometry operations
- **Cross-Platform**: Works on iOS and Android with native performance
- **Modern Architecture**: Uses Expo Router, React Query, and latest React Native features

## ⚖️ Why This Approach is Easiest

While alternatives exist, this approach provides the most straightforward way to use SpatiaLite with Expo:

**Alternative Approach (More Complex):**
- Manually loading a prebuilt SpatiaLite extension using Expo modules
- Missing out on the clean integrations that op-sqlite provides
- Losing access to beautiful ecosystem tools like Drizzle ORM and PowerSync

**This Approach (Easiest):**
- ✅ Seamless integration with op-sqlite's clean API
- ✅ Full compatibility with Drizzle ORM for type-safe queries
- ✅ Maintains compatibility with PowerSync for local-first replication
- ✅ Automated native library deployment via Expo config plugin
- ✅ Direct access to advanced spatial functions

This project demonstrates that while other approaches require manual extension loading, our solution provides the best of both worlds: full SpatiaLite functionality with the clean ecosystem integrations that make op-sqlite, Drizzle, and PowerSync so appealing.

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- Expo CLI installed (`npm install -g @expo/cli`)
- For Android development: Android Studio with SDK
- For iOS development: Xcode with iOS SDK

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expo-opsqlite-spatialite-demo.git
   cd expo-opsqlite-spatialite-demo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Generate database migrations:
   ```bash
   pnpm db:migrate
   # or
   npx drizzle-kit generate
   ```

4. The project comes with pre-built spatialite libraries for Android (ARM64, ARMv7, x86, x86_64). If you need to update these libraries, check the `plugins/opsqlite-spatialite/spatialite-libs` directory.

## 🏗️ Architecture

### Plugin System
The project uses a custom Expo config plugin (`plugins/opsqlite-spatialite/with-spatialite.js`) that automatically copies the necessary SpatiaLite `.so` files to the correct Android native libraries directory during the build process.

### Drizzle ORM with Spatial Extensions
The project extends Drizzle ORM with custom spatial data types in `lib/drizzle/drizzlespatialite-types.ts`, enabling:
- Point, LineString, Polygon, and Multi-geometry types
- GeoJSON-based spatial data handling
- Direct integration with SpatiaLite functions

### Data Access Layer
Located in `lib/data-access-layer/`, this layer provides:
- Spatial query examples (distance calculations)
- CRUD operations for geospatial data
- React Query integration for optimal data fetching

## 🗺️ Key Components

### Database Client
`lib/drizzle/client.ts` sets up the database connection and loads the SpatiaLite extension:

```javascript
import { drizzle } from "drizzle-orm/op-sqlite";
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
```

### Spatial Schema
`lib/drizzle/schema/tables.ts` defines a table with spatial geometry:

```typescript
export const notes = table("notes", {
  id: t.integer("id").primaryKey({ autoIncrement: true }),
  title: t.text("title").notNull(),
  timestamp: t.text().default(sql`(CURRENT_TIMESTAMP)`),
  pin: point("pin"), // Spatial geometry column
});
```

### Spatial Queries
The project demonstrates spatial queries like distance calculations in `lib/data-access-layer/todos.ts`:

```typescript
// Calculate distance from Nairobi, Kenya
const nairobiGeoJSON = '{"type":"Point","coordinates":[36.8219,-1.2921]}';
const query = db
  .select({
    id: notes.id,
    title: notes.title,
    latitude: sql<string>`ST_Y(${notes.pin})`.as("latitude"),
    longitude: sql<string>`ST_X(${notes.pin})`.as("longitude"),
    distance: sql`ST_Distance(${notes.pin}, GeomFromGeoJSON(${nairobiGeoJSON}))`.as("distance_km"),
  })
  .from(notes)
  .orderBy(sql`distance_km ASC`);
```

## 🧪 Running the Project

1. Start the development server:
   ```bash
   pnpm start
   # or
   npx expo start
   ```

2. Choose your target platform:
   - **Expo Go**: For quick testing with limitations (not all native modules supported)
   - **Development Build**: For full native module access (recommended for this project)
   - **Android/iOS simulators**: For native testing

3. To build for Android with spatialite support:
   ```bash
   pnpm run:android
   # or
   npx expo run:android
   ```

## 🍎 iOS Support

**Important**: The current implementation only supports Android. For iOS support, you'll need to:

1. Build the SpatiaLite library for iOS using [libspatialite-ios](https://github.com/gstf/libspatialite-ios)
2. Follow the [op-sqlite extension loading guide](https://op-engineering.github.io/op-sqlite/docs/api/#loading-extensions) to place the files in the correct location
3. Create an Expo config plugin similar to the Android one to automate the process
4. Add the iOS native libraries to your project in the appropriate directories (typically `ios/` folder)

The Android plugin in `plugins/opsqlite-spatialite/with-spatialite.js` serves as a reference for how to implement a similar solution for iOS using a config plugin.

## 🌐 Spatial Data Sources

This project demonstrates working with various spatial data formats:
- **GeoJSON**: Native support for GeoJSON input/output
- **WKB (Well-Known Binary)**: Internal storage format for geometry data
- **Spatial Queries**: Distance calculations, spatial relationships, and geometric operations

## 📦 Spatialite Libraries

The SpatiaLite `.so` files in this project are sourced from the [spatialite-for-android-nodejs](https://github.com/tigawanna/spatialite-for-android-nodejs) repository. The native libraries for different architectures (arm64-v8a, armeabi-v7a, x86, x86_64) are located in the `plugins/opsqlite-spatialite/spatialite-libs/jni/` directory.

If you need to update these libraries, you can:
1. Download the latest versions from the [spatialite-for-android-nodejs](https://github.com/tigawanna/spatialite-for-android-nodejs) repository
2. Extract the appropriate `.so` files for each architecture
3. Place them in the respective directories under `plugins/opsqlite-spatialite/spatialite-libs/jni/`

## 🧩 Supported Spatial Operations

This project demonstrates several SpatiaLite capabilities:

1. **Geometry Creation**: `GeomFromGeoJSON()` for creating geometries from GeoJSON
2. **Distance Calculations**: `ST_Distance()` for calculating distances between geometries
3. **Coordinate Extraction**: `ST_X()` and `ST_Y()` for extracting coordinates from points
4. **Spatial Indexing**: Efficient spatial queries with built-in indexing

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs or issues
- Submit pull requests for improvements
- Add new spatial query examples
- Enhance documentation
- Add iOS support for SpatiaLite

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [op-sqlite](https://github.com/OP-Engineering/op-sqlite) for the SQLite wrapper
- [SpatiaLite](https://www.gaia-gis.it/fossil/libspatialite/index) for the spatial database engine
- [Drizzle ORM](https://orm.drizzle.team/) for the type-safe SQL builder
- [React Query](https://tanstack.com/query/latest) for data fetching and caching
- [spatialite-for-android-nodejs](https://github.com/tigawanna/spatialite-for-android-nodejs) for the Android native libraries