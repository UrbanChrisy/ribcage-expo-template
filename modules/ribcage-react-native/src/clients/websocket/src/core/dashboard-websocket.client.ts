import type { z } from "zod";
import {
	BaseWebSocketClient,
	type BaseWebSocketClientConfig,
} from "./base-websocket.client";
import type {
	EventMessagePayload,
	MessagePayloadType,
} from "./message-payloads";
import {
	type MessagePayloadTypeMap,
	parseMessagePayload,
} from "./message-payloads";
import { createMessage } from "./messages";
import type { ClientInfo, Message, WebSocketMessage } from "./schemas";

export interface DashboardWebSocketClientConfig
	extends Omit<BaseWebSocketClientConfig, "clientType"> {
	onMessageReceived?: (from: string, payload: EventMessagePayload) => void;
	onClientConnected?: (client: ClientInfo) => void;
	onClientDisconnected?: (clientId: string) => void;
	onClientListUpdated?: (clients: ClientInfo[]) => void;
}

export class DashboardWebSocketClient extends BaseWebSocketClient {
	private clients: ClientInfo[] = [];
	private eventHandlers: DashboardWebSocketClientConfig;

	constructor(config: DashboardWebSocketClientConfig) {
		super({
			...config,
			clientType: "dashboard",
		});
		this.eventHandlers = config;
	}

	/**
	 * Send a typed message to a specific mobile client
	 */
	public async sendToClient<T extends MessagePayloadType>(
		targetClientId: string,
		messageType: T,
		data: z.infer<(typeof MessagePayloadTypeMap)[T]>["data"],
		timestamp?: number,
	): Promise<void> {
		const payload: EventMessagePayload = {
			type: messageType,
			data,
			timestamp: timestamp ?? Date.now(),
		} as EventMessagePayload;

		const message: Message = createMessage(
			this.config.clientId,
			payload,
			targetClientId,
		);

		await this.sendRawMessage(message);
	}

	/**
	 * Broadcast a typed message to all mobile clients
	 */
	public async broadcastToMobileClients<T extends MessagePayloadType>(
		messageType: T,
		data: z.infer<(typeof MessagePayloadTypeMap)[T]>["data"],
		timestamp?: number,
	): Promise<void> {
		const mobileClients = this.clients.filter(
			(c) => c.client_type === "mobile",
		);

		await Promise.all(
			mobileClients.map((client) =>
				this.sendToClient(client.id, messageType, data, timestamp),
			),
		);
	}

	/**
	 * Send raw payload to specific client (for non-typed messages)
	 */
	public async sendRawPayloadToClient(
		targetClientId: string,
		payload: unknown,
	): Promise<void> {
		const message: Message = createMessage(
			this.config.clientId,
			payload,
			targetClientId,
		);

		await this.sendRawMessage(message);
	}

	/**
	 * Get list of connected clients
	 */
	public getClients(): ClientInfo[] {
		return [...this.clients];
	}

	/**
	 * Get clients by type
	 */
	public getClientsByType(type: "mobile" | "dashboard"): ClientInfo[] {
		return this.clients.filter((c) => c.client_type === type);
	}

	/**
	 * Check if a specific client is connected
	 */
	public isClientConnected(clientId: string): boolean {
		return this.clients.some((c) => c.id === clientId && c.is_connected);
	}

	protected handleMessage(message: WebSocketMessage): void {
		if (message.type === "message") {
			const messageData = message.data;

			// Try to parse the payload as a typed event message
			const parsedPayload = parseMessagePayload(messageData.payload);

			if (parsedPayload) {
				this.eventHandlers.onMessageReceived?.(messageData.from, parsedPayload);
			} else {
				console.warn(
					"[DashboardWebSocketClient] Received unparseable message payload:",
					messageData.payload,
				);
			}
		} else {
			console.log(
				"[DashboardWebSocketClient] Received unhandled message type:",
				message.type,
			);
		}
	}

	protected handleClientConnected(client: ClientInfo): void {
		// Update local client list
		const existingIndex = this.clients.findIndex((c) => c.id === client.id);
		if (existingIndex >= 0) {
			this.clients[existingIndex] = client;
		} else {
			this.clients.push(client);
		}

		this.eventHandlers.onClientConnected?.(client);
	}

	protected handleClientDisconnected(clientId: string): void {
		// Update local client list
		this.clients = this.clients.filter((c) => c.id !== clientId);

		this.eventHandlers.onClientDisconnected?.(clientId);
	}

	protected handleClientListUpdated(clients: ClientInfo[]): void {
		this.clients = [...clients];
		this.eventHandlers.onClientListUpdated?.(clients);
	}

	protected onConnected(): void {
		console.log("[DashboardWebSocketClient] Connected as dashboard client");
	}

	protected onDisconnected(): void {
		console.log("[DashboardWebSocketClient] Disconnected");
		// Clear client list on disconnect
		this.clients = [];
	}

	protected onError(error: string): void {
		console.error("[DashboardWebSocketClient] Error:", error);
	}

	protected onReconnecting(): void {
		console.log("[DashboardWebSocketClient] Reconnecting...");
	}
}
