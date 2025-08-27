import { z } from "zod";

// Base enums
export const ClientTypeSchema = z.enum(["dashboard", "mobile"]);

// Client info schema
export const ClientInfoSchema = z.object({
	id: z.string(),
	client_type: ClientTypeSchema,
	connected_at: z.number(),
	last_seen: z.number(),
	disconnected_at: z.number().optional(),
	is_connected: z.boolean(),
	metadata: z.record(z.unknown()).optional(),
});

// Register message schema
export const RegisterMessageSchema = z.object({
	type: z.literal("register"),
	data: z.object({
		client_type: ClientTypeSchema,
		client_id: z.string(),
		metadata: z.record(z.unknown()).optional(),
	}),
});

// Unified message schema
export const MessageSchema = z.object({
	type: z.literal("message"),
	data: z.object({
		from: z.string(),
		to: z.string().optional(), // Only used by dashboard clients
		payload: z.unknown(),
		message_id: z.string(),
		timestamp: z.number(),
	}),
});

// Client list message schema
export const ClientListMessageSchema = z.object({
	type: z.literal("client_list"),
	data: z.object({
		clients: z.array(ClientInfoSchema),
	}),
});

// Client connected message schema
export const ClientConnectedMessageSchema = z.object({
	type: z.literal("client_connected"),
	data: z.object({
		client: ClientInfoSchema,
	}),
});

// Client disconnected message schema
export const ClientDisconnectedMessageSchema = z.object({
	type: z.literal("client_disconnected"),
	data: z.object({
		client_id: z.string(),
	}),
});

// Error message schema
export const ErrorMessageSchema = z.object({
	type: z.literal("error"),
	data: z.object({
		code: z.string(),
		message: z.string(),
		details: z.record(z.unknown()).optional(),
	}),
});

// Ping message schema
export const PingMessageSchema = z.object({
	type: z.literal("ping"),
	data: z.object({
		timestamp: z.number(),
	}),
});

// Pong message schema
export const PongMessageSchema = z.object({
	type: z.literal("pong"),
	data: z.object({
		timestamp: z.number(),
	}),
});

// Union of all message schemas
export const WebSocketMessageSchema = z.discriminatedUnion("type", [
	RegisterMessageSchema,
	MessageSchema,
	ClientListMessageSchema,
	ClientConnectedMessageSchema,
	ClientDisconnectedMessageSchema,
	ErrorMessageSchema,
	PingMessageSchema,
	PongMessageSchema,
]);

// Infer TypeScript types from schemas
export type ClientType = z.infer<typeof ClientTypeSchema>;
export type ClientInfo = z.infer<typeof ClientInfoSchema>;
export type RegisterMessage = z.infer<typeof RegisterMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ClientListMessage = z.infer<typeof ClientListMessageSchema>;
export type ClientConnectedMessage = z.infer<
	typeof ClientConnectedMessageSchema
>;
export type ClientDisconnectedMessage = z.infer<
	typeof ClientDisconnectedMessageSchema
>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type PingMessage = z.infer<typeof PingMessageSchema>;
export type PongMessage = z.infer<typeof PongMessageSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Event-specific payload schemas
export const PerformanceMetricsSchema = z.object({
	fps: z.number(),
	ramUsageInMB: z.number(),
	cpuUsage: z.number(),
	timestamp: z.number(),
});

// Base event type map for extensible events
export const EventTypeMapSchema = z.object({
	performance: PerformanceMetricsSchema,
});

export type EventTypeMap = z.infer<typeof EventTypeMapSchema>;
export type EventType = keyof EventTypeMap;

// Helper function to create typed event payloads
export function createEventPayload<T extends EventType>(
	eventType: T,
	payload: EventTypeMap[T],
): { type: T; data: EventTypeMap[T] } {
	return {
		type: eventType,
		data: payload,
	};
}

// biome-ignore lint/complexity/noStaticOnlyClass: yeah its gonna be static
export class SchemaParser {
	static parseWebSocketMessage(data: unknown): WebSocketMessage {
		console.log("[WebSocket] Parsing message:", data);
		return WebSocketMessageSchema.parse(data);
	}

	static parseEventPayload<T extends EventType>(
		eventType: T,
		data: unknown,
	): EventTypeMap[T] {
		console.log("[WebSocket] Parsing event payload:", data);
		const schema = EventTypeMapSchema.shape[eventType];
		return schema.parse(data);
	}

	static safeParseWebSocketMessage(data: unknown): {
		success: boolean;
		data?: WebSocketMessage;
		error?: string;
	} {
		const result = WebSocketMessageSchema.safeParse(data);
		if (result.success) {
			return { success: true, data: result.data };
		}
		return { success: false, error: result.error.message };
	}
}
