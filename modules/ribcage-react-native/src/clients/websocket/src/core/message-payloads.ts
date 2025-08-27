import { z } from "zod";

// Base message payload schema with type discriminator
export const BaseMessagePayloadSchema = z.object({
	type: z.string(),
	timestamp: z.number().optional(),
});

// Performance Metrics Payloads
export const MemoryUpdatePayloadSchema = z.object({
	type: z.literal("MEMORY_UPDATE"),
	data: z.object({
		ramUsageInMB: z.number().min(0),
		timestamp: z.number().optional(),
		deviceId: z.string().optional(),
	}),
	timestamp: z.number().optional(),
});

export const CpuUpdatePayloadSchema = z.object({
	type: z.literal("CPU_UPDATE"),
	data: z.object({
		cpuUsage: z.number().min(0).max(100),
		timestamp: z.number().optional(),
		deviceId: z.string().optional(),
	}),
	timestamp: z.number().optional(),
});

export const FpsUiUpdatePayloadSchema = z.object({
	type: z.literal("FPS_UI_UPDATE"),
	data: z.object({
		uiFps: z.number().min(0),
		timestamp: z.number().optional(),
		deviceId: z.string().optional(),
	}),
	timestamp: z.number().optional(),
});

export const FpsJsUpdatePayloadSchema = z.object({
	type: z.literal("FPS_JS_UPDATE"),
	data: z.object({
		jsFps: z.number().min(0),
		timestamp: z.number().optional(),
		deviceId: z.string().optional(),
	}),
	timestamp: z.number().optional(),
});

// Union of all message payload schemas
export const EventMessagePayloadSchema = z.discriminatedUnion("type", [
	MemoryUpdatePayloadSchema,
	CpuUpdatePayloadSchema,
	FpsUiUpdatePayloadSchema,
	FpsJsUpdatePayloadSchema,
]);

// Infer TypeScript types from schemas
export type BaseMessagePayload = z.infer<typeof BaseMessagePayloadSchema>;
export type MemoryUpdatePayload = z.infer<typeof MemoryUpdatePayloadSchema>;
export type CpuUpdatePayload = z.infer<typeof CpuUpdatePayloadSchema>;
export type FpsUiUpdatePayload = z.infer<typeof FpsUiUpdatePayloadSchema>;
export type FpsJsUpdatePayload = z.infer<typeof FpsJsUpdatePayloadSchema>;
export type EventMessagePayload = z.infer<typeof EventMessagePayloadSchema>;

// Type map for easy access
export const MessagePayloadTypeMap = {
	MEMORY_UPDATE: MemoryUpdatePayloadSchema,
	CPU_UPDATE: CpuUpdatePayloadSchema,
	FPS_UI_UPDATE: FpsUiUpdatePayloadSchema,
	FPS_JS_UPDATE: FpsJsUpdatePayloadSchema,
} as const;

export type MessagePayloadType = keyof typeof MessagePayloadTypeMap;

// Helper function to create typed message payloads
export function createMessagePayload<T extends MessagePayloadType>(
	type: T,
	data: z.infer<(typeof MessagePayloadTypeMap)[T]>["data"],
	timestamp?: number,
): z.infer<(typeof MessagePayloadTypeMap)[T]> {
	return {
		type,
		data,
		timestamp: timestamp ?? Date.now(),
	} as z.infer<(typeof MessagePayloadTypeMap)[T]>;
}

/**
 * Parse a message payload from unknown data (including JSON strings)
 */
export function parseMessagePayload(data: unknown): EventMessagePayload | null {
	// If it's a string, try to parse as JSON first
	if (typeof data === "string") {
		try {
			const parsed = JSON.parse(data);
			return parseMessagePayload(parsed);
		} catch (e) {
			console.error("[WebSocket] Failed to parse message payload:", e);
			return null;
		}
	}

	// Try to parse with the schema
	const result = EventMessagePayloadSchema.safeParse(data);
	return result.success ? result.data : null;
}

/**
 * Safe parse with detailed error information
 */
export function safeParseMessagePayload(data: unknown): {
	success: boolean;
	data?: EventMessagePayload;
	error?: string;
} {
	// If it's a string, try to parse as JSON first
	if (typeof data === "string") {
		try {
			const parsed = JSON.parse(data);
			return safeParseMessagePayload(parsed);
		} catch (e) {
			return {
				success: false,
				error: `Failed to parse JSON: ${e instanceof Error ? e.message : "Unknown error"}`,
			};
		}
	}

	const result = EventMessagePayloadSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, error: result.error.message };
}

/**
 * Parse a specific payload type
 */
export function parsePayloadType<T extends MessagePayloadType>(
	type: T,
	data: unknown,
): z.infer<(typeof MessagePayloadTypeMap)[T]> | null {
	// If it's a string, try to parse as JSON first
	if (typeof data === "string") {
		try {
			const parsed = JSON.parse(data);
			return parsePayloadType(type, parsed);
		} catch {
			return null;
		}
	}

	const schema = MessagePayloadTypeMap[type];
	const result = schema.safeParse(data);
	return result.success ? result.data : null;
}

/**
 * Type guard to check if payload is of specific type
 */
export function isPayloadType<T extends MessagePayloadType>(
	payload: EventMessagePayload,
	type: T,
): payload is z.infer<(typeof MessagePayloadTypeMap)[T]> {
	return payload.type === type;
}
