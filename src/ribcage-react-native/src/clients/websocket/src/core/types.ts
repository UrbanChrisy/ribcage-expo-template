export enum ClientType {
	DASHBOARD = "dashboard",
	MOBILE = "mobile",
}

export interface ClientInfo {
	id: string;
	client_type: ClientType;
	connected_at: number;
	last_seen: number;
	metadata?: Record<string, unknown>;
}

export interface RegisterMessage {
	type: "register";
	data: {
		client_type: ClientType;
		client_id: string;
		metadata?: Record<string, unknown>;
	};
}

export interface DirectMessage {
	type: "message";
	data: {
		from: string;
		to?: string;
		payload: unknown;
		message_id: string;
		timestamp: number;
	};
}

export interface BroadcastMessage {
	type: "broadcast";
	data: {
		from: string;
		payload: unknown;
		message_id: string;
		timestamp: number;
	};
}

export interface ClientListMessage {
	type: "client_list";
	data: {
		clients: ClientInfo[];
	};
}

export interface ClientConnectedMessage {
	type: "client_connected";
	data: {
		client: ClientInfo;
	};
}

export interface ClientDisconnectedMessage {
	type: "client_disconnected";
	data: {
		client_id: string;
	};
}

export interface ErrorMessage {
	type: "error";
	data: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
}

export interface PingMessage {
	type: "ping";
	data: {
		timestamp: number;
	};
}

export interface PongMessage {
	type: "pong";
	data: {
		timestamp: number;
	};
}

export type WebSocketMessage =
	| RegisterMessage
	| DirectMessage
	| BroadcastMessage
	| ClientListMessage
	| ClientConnectedMessage
	| ClientDisconnectedMessage
	| ErrorMessage
	| PingMessage
	| PongMessage;

export interface WebSocketConfig {
	host: string;
	port: number;
	reconnectInterval: number;
	maxReconnectAttempts: number;
	pingInterval: number;
	pongTimeout: number;
}

export interface WebSocketConnectionState {
	connected: boolean;
	reconnecting: boolean;
	lastError?: string;
	reconnectAttempts: number;
	clientId: string;
	lastPing?: number;
	lastPong?: number;
	connectionHealth: "healthy" | "warning" | "unhealthy";
}

export type WebSocketEvents = {
	onConnected: () => void;
	onDisconnected: () => void;
	onMessage: (message: WebSocketMessage) => void;
	onError: (error: string) => void;
	onReconnecting: () => void;
	onHealthChanged: (health: "healthy" | "warning" | "unhealthy") => void;
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

export type SendMessageOptions = {
	timeout?: number;
} & (
	| {
			targetClientId: string;
			broadcast?: never;
	  }
	| {
			targetClientId?: never;
			broadcast: true;
	  }
);

export interface MessagePayload {
	type: string;
	data: unknown;
	timestamp?: number;
}

export interface MemoryMetrics {
	ramUsageInMB: number;
	timestamp: number;
}

export interface CPUMetrics {
	cpuUsage: number;
	timestamp: number;
}

export interface PerformanceMetrics {
	fps: number;
	ramUsageInMB: number;
	cpuUsage: number;
	timestamp: number;
}

export interface MemoryMetricsEventData {
	metrics: MemoryMetrics;
	timestamp: number;
}

export interface CPUMetricsEventData {
	metrics: CPUMetrics;
	timestamp: number;
}

export interface PerformanceMetricsEventData {
	metrics: PerformanceMetrics;
}

export interface EventTypeMap {
	PERFORMANCE_METRICS: PerformanceMetricsEventData;
	MEMORY_UPDATE: MemoryMetricsEventData;
	CPU_UPDATE: CPUMetricsEventData;
}

export type EventType = keyof EventTypeMap;

export interface HealthCheckConfig {
	pingInterval: number;
	pongTimeout: number;
	unhealthyThreshold: number;
	warningThreshold: number;
}
