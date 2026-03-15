const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Work around Metro resolving MapLibre to its ESM entry, which fails to resolve
// an internal path on some Windows/Expo setups.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./app/global.css" });
