const { withNativeWind } = require('nativewind/metro');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Required for @tabler/icons-react-native v3+ which uses ESM package exports
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });