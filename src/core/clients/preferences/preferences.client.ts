import { SupportedStorage } from "@/core/types";
import { StorageClient } from "../storage/storage.client";

/**
 * Type-safe preferences schema for user settings.
 * All preferences are automatically persisted to MMKV.
 */
export type Preferences = {
	/** UI theme preference */
	theme: "light" | "dark";
};

export type PreferencesClientOptions = {
	storage: SupportedStorage;
};

export class PreferencesClient {
	/** MMKV instance for high-performance preference storage */
	private storage: SupportedStorage;

	/**
	 * Initialize preferences client with encrypted MMKV storage.
	 * Creates a dedicated storage instance for user preferences.
	 */
	constructor(storageClient: StorageClient) {
		this.storage = storageClient.create("@ribcage/preferences");
	}

	/**
	 * Get a typed preference value by key.
	 *
	 * @param key - Preference key
	 * @returns Preference value or null if not set
	 */
	get<Key extends keyof Preferences>(key: Key): Preferences[Key] | null {
		const value = this.storage.getItem(key);
		if (value == null) {
			return null;
		}
		return JSON.parse(value) as Preferences[Key];
	}

	/**
	 * Set a preference value with automatic persistence.
	 *
	 * @param key - Preference key
	 * @param value - Value to store
	 */
	set<T>(key: keyof Preferences, value: T) {
		this.storage.setItem(key, JSON.stringify(value));
	}

	/**
	 * Remove a specific preference.
	 *
	 * @param key - Preference key to remove
	 */
	remove(key: keyof Preferences) {
		this.storage.removeItem(key);
	}

	/**
	 * Clear all user preferences.
	 * This action cannot be undone.
	 */
	clear() {
		this.storage.clear();
	}

	/**
	 * Get user's theme preference with default fallback.
	 *
	 * @returns User's theme preference, defaults to 'light'
	 */
	getTheme(): "light" | "dark" {
		return this.get("theme") ?? "light";
	}

	/**
	 * Set user's theme preference.
	 *
	 * @param theme - Theme to set ('light' or 'dark')
	 */
	setTheme(theme: "light" | "dark") {
		this.set("theme", theme);
	}
}
