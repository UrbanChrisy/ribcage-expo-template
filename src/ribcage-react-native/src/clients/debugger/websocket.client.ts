import {
	ClientType,
	EventType,
	EventTypeMap,
	MessagePayload,
	WebSocketClientOptions,
	WebSocketConnectionState,
	WebSocketMessage,
  WebSocketManager,
  WebSocketEvents
} from "../websocket";
import { EventEmitter, EventSubscription } from "expo-modules-core";


export class WebSocketClient {
	private manager: WebSocketManager;
	private eventEmitter = new EventEmitter<WebSocketEvents>();

	constructor(options: WebSocketClientOptions = {}) {
		
		this.manager = new WebSocketManager(
			ClientType.MOBILE,
			options.config,
			{
				onConnected: () => {
					this.eventEmitter.emit("onConnected");
				},
				onDisconnected: () => {
					this.eventEmitter.emit("onDisconnected");
				},
				onMessage: (message: WebSocketMessage) => {
					this.eventEmitter.emit("onMessage", message);
				},
				onError: (error: string) => {
					this.eventEmitter.emit("onError", error);
				},
				onReconnecting: () => {
					this.eventEmitter.emit("onReconnecting");
				},
				onHealthChanged: (health) => {
					this.eventEmitter.emit("onHealthChanged", health);
				},
			},
			options.clientId,
			{
				platform: "react-native",
				userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "react-native",
				...options.metadata,
			},
		);
	}

	async connect(): Promise<void> {
		try {
			console.log("[WebSocketMobileClient] Connecting...");
			await this.manager.connect();
			console.log("[WebSocketMobileClient] Connected successfully");
		} catch (error) {
			console.error("[WebSocketMobileClient] Failed to connect:", error);
			throw error;
		}
	}

	disconnect(): void {
		console.log("[WebSocketMobileClient] Disconnecting...");
		this.manager.disconnect();
	}

	async sendMessage(payload: MessagePayload): Promise<void> {
		if (!this.manager.isRegistered()) {
			throw new Error("Client must be registered before sending messages");
		}

		return this.manager.sendMessage(payload.data);
	}

	async sendEvent<T extends EventType>(
		eventType: T,
		data: EventTypeMap[T],
	): Promise<void> {
		const payload: MessagePayload = {
			type: eventType,
			data,
			timestamp: Date.now(),
		};

		return this.sendMessage(payload);
	}

	async sendToClient(targetClientId: string, payload: unknown): Promise<void> {
		if (!this.manager.isRegistered()) {
			throw new Error("Client must be registered before sending messages");
		}

		return this.manager.sendToClient(targetClientId, payload);
	}

	async broadcast(payload: unknown): Promise<void> {
		if (!this.manager.isRegistered()) {
			throw new Error("Client must be registered before broadcasting");
		}

		return this.manager.broadcast(payload);
	}

	getClientId(): string {
		return this.manager.getClientId();
	}

	getConnectionState(): WebSocketConnectionState {
		return this.manager.getConnectionState();
	}

	isConnected(): boolean {
		return this.manager.isConnected();
	}

	isRegistered(): boolean {
		return this.manager.isRegistered();
	}

	updateConfig(config: Partial<WebSocketClientOptions['config']>): void {
		if (config) {
			this.manager.updateEvents({
				...this.manager['events'],
			});
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

	onHealthChanged(
		callback: (health: "healthy" | "warning" | "unhealthy") => void,
	): EventSubscription {
		return this.eventEmitter.addListener("onHealthChanged", callback);
	}
}