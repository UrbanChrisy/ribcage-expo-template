import type {
	WebSocketConfig,
	WebSocketConnectionState,
	WebSocketEvents,
	WebSocketMessage,
} from "./types";
import { MessageParser } from "./messages";

export interface ConnectionManagerConfig {
	config: Pick<WebSocketConfig, "host" | "port"> &
		Partial<Omit<WebSocketConfig, "host" | "port">>;
	events: WebSocketEvents;
	clientId: string;
}

export class ConnectionManager {
	private socket?: WebSocket;
	private config: WebSocketConfig;
	private events: WebSocketEvents;
	private state: WebSocketConnectionState;
	private reconnectTimeout?: NodeJS.Timeout;
	private messageQueue: WebSocketMessage[] = [];

	constructor({ config, events, clientId }: ConnectionManagerConfig) {
		this.config = {
			reconnectInterval: 5000,
			maxReconnectAttempts: 10,
			pingInterval: 30000,
			pongTimeout: 5000,
			...config,
		};

		this.events = events;
		this.state = {
			connected: false,
			reconnecting: false,
			reconnectAttempts: 0,
			clientId,
			connectionHealth: "healthy",
		};
	}

	async connect(): Promise<void> {
		if (this.socket?.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const wsUrl = `ws://${this.config.host}:${this.config.port}`;

			try {
				this.socket = new WebSocket(wsUrl);

				this.socket.onopen = () => {
					console.log("[WebSocket] Connected to server");
					this.state.connected = true;
					this.state.reconnecting = false;
					this.state.reconnectAttempts = 0;
					this.state.lastError = undefined;

					this.processMessageQueue();
					this.events.onConnected?.();
					resolve();
				};

				this.socket.onmessage = (event) => {
					try {
						const message = MessageParser.parse(event.data);
						this.handleMessage(message);
					} catch (error) {
						console.error("[WebSocket] Failed to parse message:", error);
						this.events.onError?.("Failed to parse message");
					}
				};

				this.socket.onclose = (event) => {
					console.log(
						"[WebSocket] Connection closed:",
						event.code,
						event.reason,
					);
					this.state.connected = false;
					this.events.onDisconnected?.();

					if (
						!this.state.reconnecting &&
						this.state.reconnectAttempts < this.config.maxReconnectAttempts
					) {
						this.scheduleReconnect();
					}
				};

				this.socket.onerror = (error) => {
					console.error("[WebSocket] Connection error:", error);
					this.state.lastError = "Connection error";
					this.events.onError?.("Connection error");
					reject(new Error("WebSocket connection failed"));
				};
			} catch (error) {
				console.error("[WebSocket] Failed to create connection:", error);
				reject(error);
			}
		});
	}

	disconnect(): void {
		console.log("[WebSocket] Disconnecting...");

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = undefined;
		}

		if (this.socket) {
			this.socket.close(1000, "Client disconnecting");
			this.socket = undefined;
		}

		this.state.connected = false;
		this.state.reconnecting = false;
	}

	send(message: WebSocketMessage): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
				if (this.state.reconnecting) {
					console.log("[WebSocket] Queuing message for later delivery");
					this.messageQueue.push(message);
					resolve();
					return;
				} else {
					reject(new Error("WebSocket is not connected"));
					return;
				}
			}

			try {
				const messageStr = JSON.stringify(message);
				this.socket.send(messageStr);
				resolve();
			} catch (error) {
				console.error("[WebSocket] Failed to send message:", error);
				reject(error);
			}
		});
	}

	getState(): WebSocketConnectionState {
		return { ...this.state };
	}

	updateEvents(events: Partial<WebSocketEvents>): void {
		this.events = { ...this.events, ...events };
	}

	private handleMessage(message: WebSocketMessage): void {
		this.events.onMessage?.(message);
	}

	private scheduleReconnect(): void {
		if (this.state.reconnectAttempts >= this.config.maxReconnectAttempts) {
			console.error("[WebSocket] Max reconnect attempts reached");
			this.events.onError?.("Max reconnect attempts reached");
			return;
		}

		this.state.reconnecting = true;
		this.state.reconnectAttempts++;

		console.log(
			`[WebSocket] Scheduling reconnect attempt ${this.state.reconnectAttempts} in ${this.config.reconnectInterval}ms`,
		);
		this.events.onReconnecting?.();

		this.reconnectTimeout = setTimeout(async () => {
			try {
				await this.connect();
			} catch (error) {
				console.error("[WebSocket] Reconnect failed:", error);
				this.scheduleReconnect();
			}
		}, this.config.reconnectInterval);
	}

	private processMessageQueue(): void {
		if (this.messageQueue.length > 0) {
			console.log(
				`[WebSocket] Processing ${this.messageQueue.length} queued messages`,
			);
			const queue = [...this.messageQueue];
			this.messageQueue = [];

			queue.forEach((message) => {
				this.send(message).catch(console.error);
			});
		}
	}
}