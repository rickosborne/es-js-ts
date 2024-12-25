/**
 * A message, an error, or something which can generate one of those.
 */
export type MessageOrError = string | Error | (() => (string | Error));

/**
 * Helper for guards which expect text or an error, or
 * can generate one when needed.
 */
export const errorFromMessageOrError = (
	messageOrError: MessageOrError,
	defaultConstructor: (new (message: string) => Error) = Error,
): Error => {
	let stringOrError: string | Error;
	if (typeof messageOrError === "function") {
		stringOrError = messageOrError();
	} else {
		stringOrError = messageOrError;
	}
	let error: Error;
	if (typeof stringOrError === "string") {
		error = new defaultConstructor(`Missing: ${ stringOrError }`);
	} else {
		error = stringOrError;
	}
	return error;
};
