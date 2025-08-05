const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

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
        ...config.resolver?.alias,
        // Add custom aliases here
      },
    },
    server: {
      ...config.server,
      // enhanceMiddleware: (middleware) => {
      //   return (arg0, arg1, arg2, arg3, arg4) => {
      //     console.log("middleware", arg0, arg1, arg2, arg3, arg4);
      //     return middleware(arg0, arg1, arg2, arg3, arg4);
      //   };
      // },
    },
    transformer: {
      ...config.transformer,
      // Add custom transformer options here
    },
    // Add other custom Metro options as needed
  };

  return customConfig;
};

module.exports = withNativeWind(withCustomConfig(config), { input: "./src/styles/global.css" });
