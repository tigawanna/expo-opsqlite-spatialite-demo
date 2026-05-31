const {
  withDangerousMod,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { execSync } = require("child_process");

const PLUGIN_NAME = "withSpatialite";
const ARCHITECTURES = ["arm64-v8a", "armeabi-v7a", "x86", "x86_64"];
const DEFAULT_REPO = "tigawanna/react-native-spatialite-artifacts";
const DEFAULT_VERSION = "5.0.0";

function resolveOptions(props) {
  const version = props?.version ?? DEFAULT_VERSION;
  const repo = props?.repo ?? DEFAULT_REPO;
  const localPath = props?.localPath ?? null;
  return { version, repo, localPath };
}

function getCacheDir(version) {
  const cacheRoot =
    process.env.SPATIALITE_CACHE_DIR ??
    path.join(require("os").homedir(), ".cache", "spatialite-libs");
  return path.join(cacheRoot, `android-${version}`);
}

function followRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error("Too many redirects"));

    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "expo-spatialite-plugin" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return followRedirects(res.headers.location, maxRedirects - 1).then(
            resolve,
            reject
          );
        }
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Download failed: HTTP ${res.statusCode} for ${url}`)
          );
        }
        resolve(res);
      })
      .on("error", reject);
  });
}

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const stream = await followRedirects(url);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    stream.pipe(file);
    file.on("finish", () => {
      file.close();
      resolve();
    });
    file.on("error", (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function extractZip(zipPath, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: "pipe" });
}

async function ensureLibsFromGitHub(version, repo) {
  const cacheDir = getCacheDir(version);
  const markerFile = path.join(cacheDir, ".downloaded");

  if (fs.existsSync(markerFile)) {
    console.log(`  [cache hit] SpatiaLite ${version} already downloaded`);
    return cacheDir;
  }

  const zipName = `spatialite-android-${version}.zip`;
  const downloadUrl = `https://github.com/${repo}/releases/download/v${version}/${zipName}`;
  const zipDest = path.join(cacheDir, zipName);

  console.log(`  [download] ${downloadUrl}`);

  try {
    await downloadFile(downloadUrl, zipDest);
  } catch (err) {
    console.error(`\n  ERROR: Failed to download SpatiaLite libs from GitHub.`);
    console.error(`  URL: ${downloadUrl}`);
    console.error(`  ${err.message}\n`);
    console.error(`  Possible fixes:`);
    console.error(`    1. Create a GitHub release: cd react-native-spatialite-artifacts && mise run release -- ${version}`);
    console.error(`    2. Use localPath option in app.json to point to a local build`);
    console.error(`    3. Set SPATIALITE_CACHE_DIR env var to a pre-populated cache\n`);
    throw err;
  }

  console.log(`  [extract] ${zipName}`);
  extractZip(zipDest, cacheDir);
  fs.unlinkSync(zipDest);

  fs.writeFileSync(markerFile, new Date().toISOString());
  return cacheDir;
}

function resolveLocalPath(localPath) {
  const resolved = path.resolve(localPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(
      `SpatiaLite localPath does not exist: ${resolved}\n` +
        `  Build the artifacts first: cd react-native-spatialite-artifacts && mise run build:android`
    );
  }
  return resolved;
}

function copyLibsToJniLibs(sourceDir, projectRoot) {
  const targetBase = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "jniLibs"
  );

  let copied = 0;

  for (const arch of ARCHITECTURES) {
    const sourceArchDir = path.join(sourceDir, arch);
    if (!fs.existsSync(sourceArchDir)) {
      console.warn(`  [warn] Missing arch directory: ${arch}`);
      continue;
    }

    const targetArchDir = path.join(targetBase, arch);
    if (!fs.existsSync(targetArchDir)) {
      fs.mkdirSync(targetArchDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceArchDir).filter((f) => f.endsWith(".so"));
    for (const file of files) {
      const src = path.join(sourceArchDir, file);
      const dest = path.join(targetArchDir, file);

      const srcStat = fs.statSync(src);
      if (fs.existsSync(dest)) {
        const destStat = fs.statSync(dest);
        if (destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) {
          continue;
        }
      }

      fs.copyFileSync(src, dest);
      copied++;
      console.log(`  [copy] ${arch}/${file} (${(srcStat.size / 1024 / 1024).toFixed(1)} MB)`);
    }
  }

  return copied;
}

const withSpatialiteAndroid = (config, props) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const { version, repo, localPath } = resolveOptions(props);
      const projectRoot = config.modRequest.projectRoot;

      console.log(`\n[withSpatialite] Setting up SpatiaLite ${version} for Android`);

      let libsDir;

      if (localPath) {
        const resolved = resolveLocalPath(localPath);
        libsDir = resolved;
        console.log(`  [source] local: ${resolved}`);
      } else {
        libsDir = await ensureLibsFromGitHub(version, repo);
        console.log(`  [source] cache: ${libsDir}`);
      }

      const copied = copyLibsToJniLibs(libsDir, projectRoot);

      if (copied > 0) {
        console.log(`  [done] Copied ${copied} native libraries`);
      } else {
        console.log(`  [done] All native libraries up to date`);
      }

      console.log("");
      return config;
    },
  ]);
};

const withSpatialite = (config, props) => {
  config = withSpatialiteAndroid(config, props);
  return config;
};

module.exports = createRunOncePlugin(withSpatialite, PLUGIN_NAME, DEFAULT_VERSION);
