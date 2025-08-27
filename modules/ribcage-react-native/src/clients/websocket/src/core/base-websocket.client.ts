import { ConnectionManager } from "./connection";
import { createRegister } from "./messages";
import type {
	ClientInfo,
	ClientType,
	RegisterMessage,
	WebSocketMessage,
} from "./schemas";
import type { ConnectionConfig, WebSocketEvents } from "./types";

export interface BaseWebSocketClientConfig {
	host: string;
	port: number;
	clientId: string;
	clientType: ClientType;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
	metadata?: Record<string, unknown>;
}

export abstract class BaseWebSocketClient {
	protected connectionManager: ConnectionManager;
	protected config: BaseWebSocketClientConfig;
	protected isRegistered = false;

	constructor(config: BaseWebSocketClientConfig) {
		this.config = {
			reconnectInterval: 5000,
			maxReconnectAttempts: 10,
			...config,
		};

		const connectionConfig: ConnectionConfig = {
			host: this.config.host,
			port: this.config.port,
			reconnectInterval: this.config.reconnectInterval ?? 5000,
			maxReconnectAttempts: this.config.maxReconnectAttempts ?? 10,
		};

		const events: WebSocketEvents = {
			onConnected: this.handleConnected.bind(this),
			onDisconnected: this.handleDisconnected.bind(this),
			onMessage: this.handleRawMessage.bind(this),
			onError: this.handleError.bind(this),
			onReconnecting: this.handleReconnecting.bind(this),
			onClientConnected: this.handleClientConnected.bind(this),
			onClientDisconnected: this.handleClientDisconnected.bind(this),
			onClientListUpdated: this.handleClientListUpdated.bind(this),
		};

		this.connectionManager = new ConnectionManager({
			config: connectionConfig,
			events,
			clientId: this.config.clientId,
		});
	}

	public async connect(): Promise<void> {
		await this.connectionManager.connect();
	}

	public disconnect(): void {
		this.connectionManager.disconnect();
		this.isRegistered = false;
	}

	public getConnectionState() {
		return this.connectionManager.getState();
	}

	protected async sendRawMessage(message: WebSocketMessage): Promise<void> {
		return this.connectionManager.send(message);
	}

	protected async register(): Promise<void> {
		const registerMessage: RegisterMessage = createRegister(
			this.config.clientType,
			this.config.clientId,
			this.config.metadata,
		);

		await this.sendRawMessage(registerMessage);
		this.isRegistered = true;
	}

	private async handleConnected(): Promise<void> {
		try {
			await this.register();
			this.onConnected();
		} catch (error) {
			console.error("[BaseWebSocketClient] Registration failed:", error);
			this.onError("Registration failed");
		}
	}

	private handleDisconnected(): void {
		this.isRegistered = false;
		this.onDisconnected();
	}

	private handleRawMessage(message: WebSocketMessage): void {
		// Handle system messages
		if (message.type === "client_list") {
			this.handleClientListUpdated(message.data.clients);
			return;
		}

		if (message.type === "client_connected") {
			this.handleClientConnected(message.data.client);
			return;
		}

		if (message.type === "client_disconnected") {
			this.handleClientDisconnected(message.data.client_id);
			return;
		}

		if (message.type === "error") {
			this.onError(`Server error: ${message.data.message}`);
			return;
		}

		if (message.type === "ping") {
			// Auto-respond to ping
			const pong: WebSocketMessage = {
				type: "pong",
				data: {
					timestamp: Date.now(),
				},
			};
			this.sendRawMessage(pong).catch(console.error);
			return;
		}

		// Let subclass handle other message types
		this.handleMessage(message);
	}

	private handleReconnecting(): void {
		this.isRegistered = false;
		this.onReconnecting();
	}

	private handleError(error: string): void {
		this.onError(error);
	}

	// Abstract methods that subclasses must implement
	protected abstract handleMessage(message: WebSocketMessage): void;

	// Event handlers that subclasses can override
	protected onConnected(): void {}
	protected onDisconnected(): void {}
	protected onError(error: string): void {
		console.error("[BaseWebSocketClient] Error:", error);
	}
	protected onReconnecting(): void {
		console.log("[BaseWebSocketClient] Reconnecting...");
	}
	protected handleClientConnected(_client: ClientInfo): void {}
	protected handleClientDisconnected(_clientId: string): void {}
	protected handleClientListUpdated(_clients: ClientInfo[]): void {}
}
