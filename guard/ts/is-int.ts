import { type MessageOrError, errorFromMessageOrError } from "./error-from-message.js";

/**
 * Check whether the given value is not just numeric, but is
 * also an integer.
 */
export const isInt = (obj: unknown): obj is number => typeof obj === "number" && !isNaN(obj) && Math.trunc(obj) === obj && obj !== Infinity && obj !== -Infinity;

/**
 * Throw if the given value is not an integer.
 */
export function assertInt(value: unknown, messageOrError: MessageOrError): asserts value is number {
	if (!isInt(value)) {
		throw errorFromMessageOrError(messageOrError, TypeError);
	}
}

/**
 * Coerce a value's type to a number, throwing if it's not an integer.
 */
export const expectInt = (
	obj: unknown,
	messageOrError: MessageOrError,
): number => {
	assertInt(obj, messageOrError);
	return obj;
};
