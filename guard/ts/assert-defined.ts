import { type MessageOrError, errorFromMessageOrError } from "./error-from-message.js";

export function assertDefined<T>(
	value: T,
	messageOrError: MessageOrError,
): asserts value is NonNullable<T> {
	if (value != null) {
		return;
	}
	throw errorFromMessageOrError(messageOrError, RangeError);
}
