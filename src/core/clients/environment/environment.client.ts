import { DevSettings } from "react-native";
import { MMKV } from "react-native-mmkv";
import { environments } from "./environment.config";
import {
	EnvironmentConfig,
	Environment,
	EnvironmentClientInterface,
} from "./environment.interface";
import { StorageClient } from "../storage/storage.client";
import * as Updates from "expo-updates";

export class EnvironmentClient
	implements EnvironmentClientInterface<EnvironmentConfig>
{
	private readonly STORAGE_KEY = "@wedge/environment";
	private readonly DEFAULT_ENVIRONMENT = Environment.Staging;
	private readonly STORAGE_KEY_ENVIRONMENT = "environment";

	private storage: SupportedStorage;
	private _environment: Environment;

	constructor(storageClient: StorageClient) {
		this.storage = storageClient.create(this.STORAGE_KEY);
		const envFromStorage = this.storage.getItem(
			this.STORAGE_KEY_ENVIRONMENT,
		) as Environment | null;
		this._environment = envFromStorage ?? this.DEFAULT_ENVIRONMENT;
	}

	public get environment() {
		return this._environment;
	}

	public setEnvironment(environment: Environment) {
		this._environment = environment;
		this.storage.setItem(this.STORAGE_KEY_ENVIRONMENT, environment);
		setTimeout(() => {
			__DEV__ ? DevSettings.reload() : Updates.reloadAsync();
		}, 1000);
	}

	public get config() {
		return environments[this._environment];
	}
}
