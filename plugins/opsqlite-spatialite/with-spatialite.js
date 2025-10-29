const fs = require("fs");
const path = require("path");

function copySpatialiteSoFiles() {
  // eslint-disable-next-line no-undef
  const sourceBase = path.join(__dirname, "spatialite-libs", "jni");
  const targetBase = path.join(process.cwd(), "android", "app", "src", "main", "jniLibs");

  console.log("📦 Setting up Spatialite native libraries...");

  if (!fs.existsSync(sourceBase)) {
    console.warn("⚠️  Spatialite libraries not found. Run extraction script first.");
    return;
  }

  const architectures = ["arm64-v8a", "armeabi-v7a", "x86", "x86_64"];

  for (const arch of architectures) {
    const sourceDir = path.join(sourceBase, arch);
    const targetDir = path.join(targetBase, arch);

    if (fs.existsSync(sourceDir)) {
      // Create target directory
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy .so files
      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        if (file.endsWith(".so")) {
          fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
          console.log(`✓ ${arch}/${file}`);
        }
      }
    }
  }

  console.log("✅ Spatialite native libraries ready!\n");
}

// Expo config plugin
module.exports = (config) => {
  return {
    ...config,
    hooks: {
      postPublish: async (data) => {
        // This runs after the build is complete
        copySpatialiteSoFiles();
      },
      postExport: async (data) => {
        // This runs after exporting the project
      },
    },
  };
};

// Separate function that should be called during prebuild
module.exports.copySpatialiteSoFiles = copySpatialiteSoFiles;
