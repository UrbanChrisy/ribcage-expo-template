// Re-export types from schemas for backward compatibility
export type {
	ClientConnectedMessage,
	ClientDisconnectedMessage,
	ClientInfo,
	ClientListMessage,
	ClientType,
	ErrorMessage,
	EventType,
	EventTypeMap,
	Message,
	PingMessage,
	PongMessage,
	RegisterMessage,
	WebSocketMessage,
} from "./schemas";

// Import types for use in this file
import type { ClientInfo, ClientType, WebSocketMessage } from "./schemas";

export interface WebSocketConfig {
	host: string;
	port: number;
	reconnectInterval: number;
	maxReconnectAttempts: number;
}

export interface ConnectionConfig {
	host: string;
	port: number;
	reconnectInterval: number;
	maxReconnectAttempts: number;
}

export interface WebSocketConnectionState {
	connected: boolean;
	reconnecting: boolean;
	lastError?: string;
	reconnectAttempts: number;
	clientId: string;
	lastPing?: number;
}

export type WebSocketEvents = {
	onConnected: () => void;
	onDisconnected: () => void;
	onMessage: (message: WebSocketMessage) => void;
	onError: (error: string) => void;
	onReconnecting: () => void;
	onClientConnected: (client: ClientInfo) => void;
	onClientDisconnected: (clientId: string) => void;
	onClientListUpdated: (clients: ClientInfo[]) => void;
};

export class WebSocketError extends Error {
	constructor(
		public code: string,
		message: string,
		public details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "WebSocketError";
	}
}

export interface WebSocketClientOptions {
	config?: Partial<WebSocketConfig>;
	clientId?: string;
	clientType?: ClientType;
	metadata?: Record<string, unknown>;
	events?: Partial<WebSocketEvents>;
}

export interface MessagePayload {
	type: string;
	data: unknown;
	timestamp?: number;
}
