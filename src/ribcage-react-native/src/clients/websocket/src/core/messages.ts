import { v4 as uuidv4 } from "uuid";
import type {
	WebSocketMessage,
	RegisterMessage,
	DirectMessage,
	BroadcastMessage,
	PingMessage,
	PongMessage,
	ClientType,
} from "./types";

export class MessageBuilder {
	static createRegister(
		clientType: ClientType,
		clientId: string,
		metadata?: Record<string, unknown>
	): RegisterMessage {
		return {
			type: "register",
			data: {
				client_type: clientType,
				client_id: clientId,
				metadata,
			},
		};
	}

	static createMessage(
		from: string,
		payload: unknown,
		to?: string
	): DirectMessage {
		return {
			type: "message",
			data: {
				from,
				to,
				payload,
				message_id: uuidv4(),
				timestamp: Date.now(),
			},
		};
	}

	static createBroadcast(
		from: string,
		payload: unknown
	): BroadcastMessage {
		return {
			type: "broadcast",
			data: {
				from,
				payload,
				message_id: uuidv4(),
				timestamp: Date.now(),
			},
		};
	}

	static createPing(): PingMessage {
		return {
			type: "ping",
			data: {
				timestamp: Date.now(),
			},
		};
	}

	static createPong(timestamp?: number): PongMessage {
		return {
			type: "pong",
			data: {
				timestamp: timestamp || Date.now(),
			},
		};
	}
}

export class MessageParser {
	static parse(data: string): WebSocketMessage {
		try {
			const parsed = JSON.parse(data);
			return this.validate(parsed);
		} catch (error) {
			throw new Error(`Failed to parse WebSocket message: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	static serialize(message: WebSocketMessage): string {
		try {
			return JSON.stringify(message);
		} catch (error) {
			throw new Error(`Failed to serialize WebSocket message: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	private static validate(data: unknown): WebSocketMessage {
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid message format: not an object');
		}

		const obj = data as Record<string, unknown>;

		if (!obj.type || typeof obj.type !== 'string') {
			throw new Error('Invalid message format: missing or invalid type');
		}

		if (!obj.data || typeof obj.data !== 'object') {
			throw new Error('Invalid message format: missing or invalid data');
		}

		switch (obj.type) {
			case 'register':
				this.validateRegister(obj.data);
				break;
			case 'message':
				this.validateMessage(obj.data);
				break;
			case 'broadcast':
				this.validateBroadcast(obj.data);
				break;
			case 'ping':
			case 'pong':
				this.validatePingPong(obj.data);
				break;
			case 'client_list':
			case 'client_connected':
			case 'client_disconnected':
			case 'error':
				break;
			default:
				console.warn(`Unknown message type: ${obj.type}`);
		}

		return obj as WebSocketMessage;
	}

	private static validateRegister(data: unknown) {
		const obj = data as Record<string, unknown>;
		if (!obj.client_type || !obj.client_id) {
			throw new Error('Invalid register message: missing client_type or client_id');
		}
	}

	private static validateMessage(data: unknown) {
		const obj = data as Record<string, unknown>;
		if (!obj.from || !obj.message_id || typeof obj.timestamp !== 'number') {
			throw new Error('Invalid message: missing required fields');
		}
	}

	private static validateBroadcast(data: unknown) {
		const obj = data as Record<string, unknown>;
		if (!obj.from || !obj.message_id || typeof obj.timestamp !== 'number') {
			throw new Error('Invalid broadcast message: missing required fields');
		}
	}

	private static validatePingPong(data: unknown) {
		const obj = data as Record<string, unknown>;
		if (typeof obj.timestamp !== 'number') {
			throw new Error('Invalid ping/pong message: missing timestamp');
		}
	}
}