import { v4 as uuidv4 } from "uuid";
import { ConnectionManager } from "./connection";
import { HealthMonitor } from "./health";
import { MessageBuilder } from "./messages";
import type {
	ClientInfo,
	ClientType,
	SendMessageOptions,
	WebSocketConfig,
	WebSocketConnectionState,
	WebSocketEvents,
	WebSocketMessage,
} from "./types";

export class WebSocketManager {
	private connectionManager: ConnectionManager;
	private healthMonitor: HealthMonitor;
	private config: WebSocketConfig;
	private clientId: string;
	private clientType: ClientType;
	private metadata?: Record<string, unknown>;
	private registered: boolean = false;
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
			pingInterval: 30000,
			pongTimeout: 5000,
			...config,
		};

		this.events = {
			onConnected: () => {},
			onDisconnected: () => {},
			onMessage: () => {},
			onError: () => {},
			onReconnecting: () => {},
			onHealthChanged: () => {},
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
				onHealthChanged: (health) => {
					this.events.onHealthChanged?.(health);
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

		this.healthMonitor = new HealthMonitor(
			{
				pingInterval: this.config.pingInterval,
				pongTimeout: this.config.pongTimeout,
			},
			{
				onPing: () => {
					this.sendPing();
				},
				onHealthChange: (health) => {
					this.events.onHealthChanged?.(health);
				},
			},
		);
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
		this.healthMonitor.stop();
		this.connectionManager.disconnect();
		this.registered = false;
		this.connectedClients.clear();
	}

	public async sendMessage(
		payload: unknown,
		options: SendMessageOptions,
	): Promise<void> {
		if (!this.registered) {
			throw new Error("Client must be registered before sending messages");
		}

		// Security: Validate and sanitize payload
		this.validatePayload(payload);

		const message: WebSocketMessage = {
			type: options.broadcast ? "broadcast" : "message",
			data: {
				from: this.clientId,
				payload,
				message_id: uuidv4(),
				timestamp: Date.now(),
				...(options.targetClientId && { to: options.targetClientId }),
			},
		};

		return this.connectionManager.send(message);
	}

	public async sendToClient(clientId: string, payload: unknown): Promise<void> {
		return this.sendMessage(payload, { targetClientId: clientId });
	}

	public async broadcast(payload: unknown): Promise<void> {
		return this.sendMessage(payload, { broadcast: true });
	}

	public getConnectedClients(): ClientInfo[] {
		return Array.from(this.connectedClients.values());
	}

	public getConnectionState(): WebSocketConnectionState {
		const baseState = this.connectionManager.getState();
		return this.healthMonitor.updateConnectionState(baseState);
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

	public updateEvents(events: Partial<WebSocketEvents>): void {
		this.events = { ...this.events, ...events };
	}

	private async handleConnected(): Promise<void> {
		console.log("[WebSocketManager] Connected, registering...");

		try {
			await this.register();
			this.healthMonitor.start();
			this.events.onConnected?.();
		} catch (error) {
			console.error("[WebSocketManager] Registration failed:", error);
			this.events.onError?.("Registration failed");
		}
	}

	private handleDisconnected(): void {
		console.log("[WebSocketManager] Disconnected");
		this.registered = false;
		this.healthMonitor.stop();
		this.connectedClients.clear();
		this.events.onDisconnected?.();
	}

	private handleMessage(message: WebSocketMessage): void {
		switch (message.type) {
			case "client_list":
				this.connectedClients.clear();
				(message.data as any).clients.forEach((client: ClientInfo) => {
					this.connectedClients.set(client.id, client);
				});
				this.events.onClientListUpdated?.(message.data.clients as ClientInfo[]);
				break;

			case "client_connected": {
				const connectedClient = (message.data as any).client;
				this.connectedClients.set(connectedClient.id, connectedClient);
				this.events.onClientConnected?.(connectedClient);
				break;
			}

			case "client_disconnected": {
				const clientId = (message.data as any).client_id;
				this.connectedClients.delete(clientId);
				this.events.onClientDisconnected?.(clientId);
				break;
			}

			case "error":
				console.error("[WebSocketManager] Server error:", message.data);
				this.events.onError?.((message.data as any).message);
				break;

			case "ping":
				this.sendPong((message.data as any).timestamp);
				break;

			case "pong":
				this.handlePong();
				break;

			default:
				this.events.onMessage?.(message);
				break;
		}
	}

	private async register(): Promise<void> {
		const registerMessage = MessageBuilder.createRegister(
			this.clientType,
			this.clientId,
			{
				userAgent:
					typeof navigator !== "undefined"
						? navigator.userAgent
						: "websocket-client",
				timestamp: Date.now(),
				...this.metadata,
			},
		);

		await this.connectionManager.send(registerMessage);
		this.registered = true;
		console.log("[WebSocketManager] Registration completed");
	}

	private sendPing(): void {
		if (this.registered) {
			const pingMessage = MessageBuilder.createPing();
			this.connectionManager.send(pingMessage).catch(console.error);
		}
	}

	private sendPong(timestamp: number): void {
		const pongMessage = MessageBuilder.createPong(timestamp);
		this.connectionManager.send(pongMessage).catch(console.error);
	}

	private handlePong(): void {
		this.healthMonitor.onPongReceived();
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
