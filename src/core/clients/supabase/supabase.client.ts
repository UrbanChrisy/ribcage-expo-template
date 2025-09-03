import {
  createClient as createSupabaseClient,
  type SupabaseClient as SupabaseClientType,
} from "@supabase/supabase-js";
import type { EventSubscription } from "expo-modules-core";
import * as Network from "expo-network";
import { AppState, type NativeEventSubscription } from "react-native";
import type { Environment, EnvironmentClient } from "../environment";
import type { Logger, LoggingClient } from "../logging/logging.client";
import { StorageClient } from "../storage/storage.client";
import { SupabaseStorage } from "./supabase.storage";

export class SupabaseClient {
  private logger: Logger;   
  public storage: SupabaseStorage;
  private clients: {
    [key in Environment]?: SupabaseClientType;
  } = {};
  private appStateSubscription: NativeEventSubscription | null = null;
  private networkStateSubscription: EventSubscription | null = null;
  private isConnected: boolean = true;
  private isAppActive: boolean = true;

  constructor(
    private env: EnvironmentClient,
    logging: LoggingClient,
    storageClient: StorageClient,
  ) {
    this.logger = logging.createLogger({ name: "SupabaseClient" });
    this.storage = new SupabaseStorage(storageClient);
    this.initializeNetworkAndAppStateListeners();
  }

  private initializeNetworkAndAppStateListeners() {
    // Initialize network state
    Network.getNetworkStateAsync().then((networkState) => {
      this.isConnected = networkState.isConnected ?? false;
      this.updateAutoRefreshState();
    });

    // Listen to app state changes
    this.appStateSubscription = AppState.addEventListener("change", (state) => {
      this.isAppActive = state === "active";
      this.updateAutoRefreshState();
    });

    // Listen to network state changes
    this.networkStateSubscription = Network.addNetworkStateListener((state) => {
      this.logger.info("Network state changed", {
        isConnected: state.isConnected,
        timestamp: Date.now(),
      });
      this.isConnected = state.isConnected ?? false;
      this.updateAutoRefreshState();
    });
  }

  private updateAutoRefreshState() {

    // Only start auto-refresh if app is active AND connected to internet
    const shouldRefresh = this.isAppActive && this.isConnected;

    if (shouldRefresh) {
      this.client.auth.startAutoRefresh();
    } else {
      this.client.auth.stopAutoRefresh();
    }

    if (__DEV__) {
      console.log(
        `[SupabaseClient] Auto-refresh ${shouldRefresh ? "started" : "stopped"} (active: ${this.isAppActive}, connected: ${this.isConnected})`,
      );
    }
  }

  // Public method to manually refresh the connection state
  async refreshConnectionState() {
    const networkState = await Network.getNetworkStateAsync();
    this.isConnected = networkState.isConnected ?? false;
    this.updateAutoRefreshState();
    return { isConnected: this.isConnected, isAppActive: this.isAppActive };
  }

  // Getter to check current connection status
  get connectionStatus() {
    return {
      isConnected: this.isConnected,
      isAppActive: this.isAppActive,
      shouldAutoRefresh: this.isAppActive && this.isConnected,
    };
  }

  private createClient() {
    return createSupabaseClient(
      this.env.config.supabase.url,
      this.env.config.supabase.publishable_key,
      {
        auth: {
          storage: this.storage,
        },
      },
    );
  }

  get client() {
    let client = this.clients[this.env.environment];

    if (client == null) {
      client = this.createClient();
      this.clients[this.env.environment] = client;
    }

    return client;
  }

  shutdown() {
    // Clean up listeners
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    if (this.networkStateSubscription) {
      this.networkStateSubscription.remove();
    }

    Object.values(this.clients).forEach((client) => {
      client?.auth.stopAutoRefresh();
    });

    this.clients = {};
    this.storage.clear();
  }
}
