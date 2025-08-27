import { v4 as uuidv4 } from "uuid";
import type { ClientType, Message, RegisterMessage } from "./schemas";

export function createRegister(
	clientType: ClientType,
	clientId: string,
	metadata?: Record<string, unknown>,
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

export function createMessage(
	from: string,
	payload: unknown,
	to?: string,
): Message {
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
