import {
	Environment,
	EnvironmentConfig,
	Environments,
} from "./environment.interface";

export const environments = {
	[Environment.Production]: {
		name: "Production",
		environment: Environment.Production,
		enabled: true,
		api_url: "https://api.ribcage.app",
		webapp_url: "https://app.ribcage.app",
		supabase: {
			url: "https://zswkcieuwdnecvolvgos.supabase.co",
			publishable_key: "sb_publishable_m1a855LLg2nKGDxE_YEtwQ_hg6Zgcqi",
		},
		debug: {
			email: process.env.EXPO_PUBLIC_DEBUG_EMAIL_PROD ?? null,
			password: process.env.EXPO_PUBLIC_DEBUG_PASSWORD_PROD ?? null,
		},
	},
	[Environment.Staging]: {
		name: "Staging",
		environment: Environment.Staging,
		enabled: true,
		api_url: "https://api.ribcage.app",
		webapp_url: "https://app.ribcage.app",
		supabase: {
			url: "https://zswkcieuwdnecvolvgos.supabase.co",
			publishable_key: "sb_publishable_m1a855LLg2nKGDxE_YEtwQ_hg6Zgcqi",
		},
		debug: {
			email: process.env.EXPO_PUBLIC_DEBUG_EMAIL_STAGING ?? null,
			password: process.env.EXPO_PUBLIC_DEBUG_PASSWORD_STAGING ?? null,
		},
	},
	[Environment.Development]: {
		name: "Development",
		enabled: __DEV__,
		environment: Environment.Development,
		api_url: "https://api.ribcage.app",
		webapp_url: "https://app.ribcage.app",
		supabase: {
			url: "https://zswkcieuwdnecvolvgos.supabase.co",
			publishable_key: "sb_publishable_m1a855LLg2nKGDxE_YEtwQ_hg6Zgcqi",
		},
		debug: {
			email: process.env.EXPO_PUBLIC_DEBUG_EMAIL_DEV ?? null,
			password: process.env.EXPO_PUBLIC_DEBUG_PASSWORD_DEV ?? null,
		},
	},
} satisfies Environments<EnvironmentConfig>;
