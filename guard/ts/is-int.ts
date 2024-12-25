import { type MessageOrError, errorFromMessageOrError } from "./error-from-message.js";

export const isInt = (obj: unknown): obj is number => typeof obj === "number" && !isNaN(obj) && Math.trunc(obj) === obj && obj !== Infinity && obj !== -Infinity;

export function assertInt(value: unknown, messageOrError: MessageOrError): asserts value is number {
	if (!isInt(value)) {
		throw errorFromMessageOrError(messageOrError, TypeError);
	}
}

export const expectInt = (
	obj: unknown,
	messageOrError: MessageOrError,
): number => {
	assertInt(obj, messageOrError);
	return obj;
};
