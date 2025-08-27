const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

const withCustomConfig = (config) => {
  // Custom Metro configuration
  /**
   * @type {import('expo/metro-config').MetroConfig}
   */
  const customConfig = {
    ...config,
    resolver: {
      ...config.resolver,
      // Add custom resolver options here
      alias: {
        // '@ribcage/websocket': path.resolve(__dirname, '../ribcage/packages/websocket'),
        ...config.resolver?.alias,
        // Add custom aliases here
      },
    },
    watchFolders: [
      // path.resolve(__dirname, '../ribcage/packages/websocket/'),
      ...config.watchFolders || [],
      // Watch external packages directory
    ],
    transformer: {
      ...config.transformer,
      // Add custom transformer options here
    },
    // Add other custom Metro options as needed
  };

  return customConfig;
};

module.exports = withNativeWind(withCustomConfig(config), { input: "./src/styles/global.css" });
