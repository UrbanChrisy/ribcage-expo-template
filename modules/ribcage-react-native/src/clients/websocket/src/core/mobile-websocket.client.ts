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
import type { Message, WebSocketMessage } from "./schemas";

export interface MobileWebSocketClientConfig
	extends Omit<BaseWebSocketClientConfig, "clientType"> {
	onMessageReceived?: (payload: EventMessagePayload) => void;
	onConnected?: () => void;
	onDisconnected?: () => void;
	onError?: (error: string) => void;
	onReconnecting?: () => void;
}

export class MobileWebSocketClient extends BaseWebSocketClient {
	private eventHandlers: MobileWebSocketClientConfig;

	constructor(config: MobileWebSocketClientConfig) {
		super({
			...config,
			clientType: "mobile",
		});
		this.eventHandlers = config;
	}

	/**
	 * Send a typed message to all dashboard clients
	 * This is the main method mobile clients will use
	 */
	public async sendMessage<T extends MessagePayloadType>(
		messageType: T,
		data: z.infer<(typeof MessagePayloadTypeMap)[T]>["data"],
		timestamp?: number,
	): Promise<void> {
		const payload: EventMessagePayload = {
			type: messageType,
			data,
			timestamp: timestamp ?? Date.now(),
		} as EventMessagePayload;

		// Mobile clients don't specify a target - they broadcast to all dashboards
		const message: Message = createMessage(this.config.clientId, payload);

		await this.sendRawMessage(message);
	}

	/**
	 * Send a memory update - convenience method for the most common message type
	 */
	public async sendMemoryUpdate(
		ramUsageInMB: number,
		deviceId?: string,
		timestamp?: number,
	): Promise<void> {
		await this.sendMessage(
			"MEMORY_UPDATE",
			{
				ramUsageInMB,
				timestamp,
				deviceId,
			},
			timestamp,
		);
	}

	/**
	 * Send a CPU update
	 */
	public async sendCpuUpdate(
		cpuUsage: number,
		deviceId?: string,
		timestamp?: number,
	): Promise<void> {
		await this.sendMessage(
			"CPU_UPDATE",
			{
				cpuUsage,
				timestamp,
				deviceId,
			},
			timestamp,
		);
	}

	/**
	 * Send UI FPS update
	 */
	public async sendFpsUiUpdate(
		uiFps: number,
		deviceId?: string,
		timestamp?: number,
	): Promise<void> {
		await this.sendMessage(
			"FPS_UI_UPDATE",
			{
				uiFps,
				timestamp,
				deviceId,
			},
			timestamp,
		);
	}

	/**
	 * Send JS FPS update
	 */
	public async sendFpsJsUpdate(
		jsFps: number,
		deviceId?: string,
		timestamp?: number,
	): Promise<void> {
		await this.sendMessage(
			"FPS_JS_UPDATE",
			{
				jsFps,
				timestamp,
				deviceId,
			},
			timestamp,
		);
	}

	/**
	 * Send raw payload (for non-typed messages)
	 */
	public async sendRawPayload(payload: unknown): Promise<void> {
		const message: Message = createMessage(this.config.clientId, payload);

		await this.sendRawMessage(message);
	}

	protected handleMessage(message: WebSocketMessage): void {
		console.log("[MobileWebSocketClient] Handling message:", message);
		if (message.type === "message") {
			const messageData = message.data;

			// Try to parse the payload as a typed event message
			const parsedPayload = parseMessagePayload(messageData.payload);

			if (parsedPayload) {
				this.eventHandlers.onMessageReceived?.(parsedPayload);
			} else {
				console.warn(
					"[MobileWebSocketClient] Received unparseable message payload:",
					messageData.payload,
				);
			}
		} else {
			console.log(
				"[MobileWebSocketClient] Received unhandled message type:",
				message.type,
			);
		}
	}

	protected onConnected(): void {
		console.log("[MobileWebSocketClient] Connected as mobile client");
		this.eventHandlers.onConnected?.();
	}

	protected onDisconnected(): void {
		console.log("[MobileWebSocketClient] Disconnected");
		this.eventHandlers.onDisconnected?.();
	}

	protected onError(error: string): void {
		console.error("[MobileWebSocketClient] Error:", error);
		this.eventHandlers.onError?.(error);
	}

	protected onReconnecting(): void {
		console.log("[MobileWebSocketClient] Reconnecting...");
		this.eventHandlers.onReconnecting?.();
	}
}
