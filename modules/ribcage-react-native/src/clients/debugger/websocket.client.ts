import {
	WebSocketClientOptions,
	WebSocketConnectionState,
	WebSocketMessage,
	WebSocketEvents
} from "../websocket";
import { MobileWebSocketClient, type MobileWebSocketClientConfig } from "../websocket/src/core/mobile-websocket.client";
import { EventEmitter, EventSubscription } from "expo-modules-core";

export class WebSocketClient {
	public client: MobileWebSocketClient;
	private eventEmitter = new EventEmitter<WebSocketEvents>();

	constructor(options: WebSocketClientOptions = {}) {
		const config: MobileWebSocketClientConfig = {
			host: options.config?.host || "localhost",
			port: options.config?.port || 9001,
			clientId: options.clientId || `mobile-${Date.now()}`,
			reconnectInterval: options.config?.reconnectInterval || 5000,
			maxReconnectAttempts: options.config?.maxReconnectAttempts || 10,
			metadata: {
				platform: "react-native",
				userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "react-native",
				...options.metadata,
			},
			onConnected: () => {
				this.eventEmitter.emit("onConnected");
			},
			onDisconnected: () => {
				this.eventEmitter.emit("onDisconnected");
			},
			onError: (error: string) => {
				this.eventEmitter.emit("onError", error);
			},
			onReconnecting: () => {
				this.eventEmitter.emit("onReconnecting");
			},
			onMessageReceived: (payload) => {
				// Convert EventMessagePayload to WebSocketMessage for backward compatibility
				const message: WebSocketMessage = {
					type: "message",
					data: {
						from: config.clientId,
						payload,
						timestamp: payload.timestamp || Date.now(),
					},
				};
				this.eventEmitter.emit("onMessage", message);
			},
		};
		
		this.client = new MobileWebSocketClient(config);
	}

	async connect(): Promise<void> {
		try {
			console.log("[WebSocketMobileClient] Connecting...");
			await this.client.connect();
			console.log("[WebSocketMobileClient] Connected successfully");
		} catch (error) {
			console.error("[WebSocketMobileClient] Failed to connect:", error);
			throw error;
		}
	}

	disconnect(): void {
		console.log("[WebSocketMobileClient] Disconnecting...");
		this.client.disconnect();
	}

	getClientId(): string {
		// Access client ID through the connection state since config is protected
		return this.client.getConnectionState().clientId;
	}

	getConnectionState(): WebSocketConnectionState {
		return this.client.getConnectionState();
	}

	isConnected(): boolean {
		return this.client.getConnectionState().connected;
	}

	isRegistered(): boolean {
		// Check if client is connected and registered
		const state = this.client.getConnectionState();
		return state.connected && !state.reconnecting;
	}

	updateConfig(config: Partial<WebSocketClientOptions['config']>): void {
		if (config) {
			// Note: The new client doesn't support runtime config updates
			// This method is kept for backward compatibility but logs a warning
			console.warn("[WebSocketClient] Runtime config updates are not supported. Please reconnect with new config.");
		}
	}

	onConnected(callback: () => void): EventSubscription {
		return this.eventEmitter.addListener("onConnected", callback);
	}

	onDisconnected(callback: () => void): EventSubscription {
		return this.eventEmitter.addListener("onDisconnected", callback);
	}

	onMessage(callback: (message: WebSocketMessage) => void): EventSubscription {
		return this.eventEmitter.addListener("onMessage", callback);
	}

	onError(callback: (error: string) => void): EventSubscription {
		return this.eventEmitter.addListener("onError", callback);
	}

	onReconnecting(callback: () => void): EventSubscription {
		return this.eventEmitter.addListener("onReconnecting", callback);
	}
}