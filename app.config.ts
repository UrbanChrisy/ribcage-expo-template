import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "Ribcage Mobile",
	slug: "ribcage-mobile",
	scheme: "ribcage-mobile",
	version: "1.0.0",
	orientation: "portrait",
	icon: "./src/assets/images/icon.png",
	userInterfaceStyle: "light",
	splash: {
		image: "./src/assets/images/splash-icon.png",
		resizeMode: "contain",
		backgroundColor: "#ffffff",
	},
	assetBundlePatterns: ["**/*"],
	ios: {
		supportsTablet: true,
		bundleIdentifier: "nz.co.delacour.ribcage",
	},
	android: {
		adaptiveIcon: {
			foregroundImage: "./src/assets/images/adaptive-icon.png",
			backgroundColor: "#FFFFFF",
		},
		package: "nz.co.delacour.ribcage",
	},
	web: {
		favicon: "./src/assets/images/favicon.png",
	},
	plugins: ["expo-router"],
});
