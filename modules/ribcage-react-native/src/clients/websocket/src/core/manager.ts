import { v4 as uuidv4 } from "uuid";
import { ConnectionManager } from "./connection";
import { createMessage, createRegister } from "./messages";
import type { ClientInfo, ClientType, WebSocketMessage } from "./schemas";
import type {
	WebSocketConfig,
	WebSocketConnectionState,
	WebSocketEvents,
} from "./types";

export class WebSocketManager {
	private connectionManager: ConnectionManager;
	private config: WebSocketConfig;
	private clientId: string;
	private clientType: ClientType;
	private metadata?: Record<string, unknown>;
	private registered = false;
	private connectedClients: Map<string, ClientInfo> = new Map();
	private events: WebSocketEvents;

	constructor(
		clientType: ClientType,
		config: Partial<WebSocketConfig> = {},
		events: Partial<WebSocketEvents> = {},
		clientId?: string,
		metadata?: Record<string, unknown>,
	) {
		this.clientId = clientId || uuidv4();
		this.clientType = clientType;
		this.metadata = metadata;

		this.config = {
			port: 9001,
			host: "localhost",
			reconnectInterval: 5000,
			maxReconnectAttempts: 10,
			...config,
		};

		this.events = {
			onConnected: () => {},
			onDisconnected: () => {},
			onMessage: () => {},
			onError: () => {},
			onReconnecting: () => {},
			onClientConnected: () => {},
			onClientDisconnected: () => {},
			onClientListUpdated: () => {},
			...events,
		};

		this.connectionManager = new ConnectionManager({
			config: this.config,
			events: {
				onConnected: () => {
					this.handleConnected();
				},
				onDisconnected: () => {
					this.handleDisconnected();
				},
				onMessage: (message) => {
					this.handleMessage(message);
				},
				onError: (error) => {
					this.events.onError?.(error);
				},
				onReconnecting: () => {
					this.events.onReconnecting?.();
				},
				onClientConnected: (client) => {
					this.events.onClientConnected?.(client);
				},
				onClientDisconnected: (clientId) => {
					this.events.onClientDisconnected?.(clientId);
				},
				onClientListUpdated: (clients) => {
					this.events.onClientListUpdated?.(clients);
				},
			},
			clientId: this.clientId,
		});
	}

	public async connect(): Promise<void> {
		try {
			console.log("[WebSocketManager] Connecting...");
			await this.connectionManager.connect();
		} catch (error) {
			console.error("[WebSocketManager] Failed to connect:", error);
			throw error;
		}
	}

	public disconnect(): void {
		this.connectionManager.disconnect();
		this.registered = false;
		this.connectedClients.clear();
	}

	public async sendMessage(payload: unknown, to?: string): Promise<void> {
		if (!this.registered) {
			throw new Error("Client must be registered before sending messages");
		}

		// Security: Validate and sanitize payload
		this.validatePayload(payload);

		const message = createMessage(this.clientId, payload, to);
		return this.connectionManager.send(message);
	}

	public async sendToClient(clientId: string, payload: unknown): Promise<void> {
		return this.sendMessage(payload, clientId);
	}

	public async broadcast(payload: unknown): Promise<void> {
		return this.sendMessage(payload);
	}

	public getConnectedClients(): ClientInfo[] {
		return Array.from(this.connectedClients.values());
	}

	public getConnectionState(): WebSocketConnectionState {
		const baseState = this.connectionManager.getState();
		return {
			...baseState,
		};
	}

	public isConnected(): boolean {
		return this.getConnectionState().connected;
	}

	public isRegistered(): boolean {
		return this.registered;
	}

	public getClientId(): string {
		return this.clientId;
	}

	private async handleConnected(): Promise<void> {
		console.log("[WebSocketManager] Connected, registering...");

		try {
			await this.register();
			this.events.onConnected?.();
		} catch (error) {
			console.error("[WebSocketManager] Registration failed:", error);
			this.events.onError?.("Registration failed");
		}
	}

	private handleDisconnected(): void {
		console.log("[WebSocketManager] Disconnected");
		this.registered = false;
		this.connectedClients.clear();
		this.events.onDisconnected?.();
	}

	private handleMessage(message: WebSocketMessage): void {
		switch (message.type) {
			case "client_list": {
				const clientListData = message.data as { clients: ClientInfo[] };
				this.connectedClients.clear();
				clientListData.clients.forEach((client: ClientInfo) => {
					this.connectedClients.set(client.id, client);
				});
				this.events.onClientListUpdated?.(clientListData.clients);
				break;
			}

			case "client_connected": {
				const clientConnectedData = message.data as { client: ClientInfo };
				this.connectedClients.set(
					clientConnectedData.client.id,
					clientConnectedData.client,
				);
				this.events.onClientConnected?.(clientConnectedData.client);
				break;
			}

			case "client_disconnected": {
				const clientDisconnectedData = message.data as { client_id: string };
				this.connectedClients.delete(clientDisconnectedData.client_id);
				this.events.onClientDisconnected?.(clientDisconnectedData.client_id);
				break;
			}

			case "error": {
				const errorData = message.data as { message: string };
				console.error("[WebSocketManager] Server error:", message.data);
				this.events.onError?.(errorData.message);
				break;
			}

			default:
				this.events.onMessage?.(message);
				break;
		}
	}

	private async register(): Promise<void> {
		const registerMessage = createRegister(this.clientType, this.clientId, {
			userAgent:
				typeof navigator !== "undefined"
					? navigator.userAgent
					: "websocket-client",
			timestamp: Date.now(),
			...this.metadata,
		});

		await this.connectionManager.send(registerMessage);
		this.registered = true;
		console.log("[WebSocketManager] Registration completed");
	}

	/**
	 * Validates and sanitizes payload before sending
	 * @param payload - The payload to validate
	 * @throws Error if payload is invalid
	 */
	private validatePayload(payload: unknown): void {
		// Maximum message size (1MB)
		const MAX_MESSAGE_SIZE = 1024 * 1024;

		try {
			// Serialize to check size and detect circular references
			const serialized = JSON.stringify(payload);

			if (serialized.length > MAX_MESSAGE_SIZE) {
				throw new Error(
					`Message too large: ${serialized.length} bytes exceeds ${MAX_MESSAGE_SIZE} bytes limit`,
				);
			}

			// Additional security checks
			if (typeof payload === "string") {
				// Basic sanitization for strings
				if (payload.includes("<script") || payload.includes("javascript:")) {
					throw new Error("Payload contains potentially dangerous content");
				}
			}

			// Check for function or symbol types which shouldn't be sent
			if (typeof payload === "function" || typeof payload === "symbol") {
				throw new Error(
					"Invalid payload type: functions and symbols are not allowed",
				);
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Payload validation failed: ${error.message}`);
			}
			throw new Error("Payload validation failed: Unable to serialize payload");
		}
	}
}
