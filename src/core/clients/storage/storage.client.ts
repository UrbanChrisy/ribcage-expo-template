import { MMKV } from "react-native-mmkv";
import type { StorageClientInterface, SupportedStorage } from "../../types";
import { Logger, LoggingClient } from "../logging/logging.client";

export class StorageClient implements StorageClientInterface {
	private logger: Logger;

	constructor(logging: LoggingClient) {
		this.logger = logging.createLogger({ name: "StorageClient" });
	}

	create(name: string): SupportedStorage {
		const mmkv = new MMKV({
			id: `@ribcage/${name}`,
			encryptionKey: `@ribcage/${name}`,
		});

		this.logger.info(`Created storage instance for ${name}`);

		const storage: SupportedStorage = {
			preload: () => {
				mmkv.getAllKeys();
			},
			getItem: (key: string) => {
				return mmkv.getString(key) ?? null;
			},
			setItem: (key: string, value: string) => {
				mmkv.set(key, value);
			},
			removeItem: (key: string) => {
				mmkv.delete(key);
			},
			clear: () => {
				mmkv.clearAll();
			},
			keys: () => {
				return mmkv.getAllKeys();
			},
		};

		this.logger.info(`Storage instance for ${name} created`, { storage });

		return storage;
	}
}
