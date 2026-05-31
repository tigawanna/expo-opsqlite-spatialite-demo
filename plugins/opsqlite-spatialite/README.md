# withSpatialite - Expo Config Plugin

Automatically provisions SpatiaLite native libraries for Android during `expo prebuild`.

## How it works

1. During `expo prebuild`, the plugin runs as a `withDangerousMod`
2. It either copies from a **local path** or **downloads from GitHub Releases**
3. Downloads are cached in `~/.cache/spatialite-libs/` to avoid re-downloading
4. `.so` files are placed into `android/app/src/main/jniLibs/{arch}/`

## Configuration (app.json)

```json
["./plugins/opsqlite-spatialite/with-spatialite", {
  "version": "5.0.0",
  "repo": "tigawanna/react-native-spatialite-artifacts",
  "localPath": "../react-native-spatialite-artifacts/android/libs"
}]
```

- `version` - Release tag version (default: `"5.0.0"`)
- `repo` - GitHub owner/repo for release downloads (default: `"tigawanna/react-native-spatialite-artifacts"`)
- `localPath` - Absolute or relative path to pre-built libs directory (skips download when set)

## Environment Variables

- `SPATIALITE_CACHE_DIR` - Override the download cache location

## Runtime Usage (op-sqlite)

```javascript
import { open } from "@op-engineering/op-sqlite";

const db = open({ name: "myDB" });
db.loadExtension("libspatialite", "sqlite3_modspatialite_init");
```
