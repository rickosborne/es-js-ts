import { type MessageOrError, errorFromMessageOrError } from "./error-from-message.js";

/**
 * Assert the given value is not null or undefined.
 * Throws with the given message or error, otherwise.
 */
export function assertDefined<T>(
	value: T,
	messageOrError: MessageOrError,
): asserts value is NonNullable<T> {
	if (value != null) {
		return;
	}
	throw errorFromMessageOrError(messageOrError, RangeError);
}

/**
 * Guard to filter out null or undefined values.
 */
export const isDefined = <T>(obj: T): obj is NonNullable<T> => obj != null;

/**
 * Coerce a value's type to exclude null or undefined, or throw
 * if it actually is null or undefined.
 */
export const expectDefined = <T>(
	obj: T,
	messageOrError: MessageOrError,
): NonNullable<T> => {
	assertDefined(obj, messageOrError);
	return obj;
};
