export function assertDefined<T>(
	value: T,
	nameOrError: string | Error | (() => string | Error),
): asserts value is NonNullable<T> {
	if (value == null) {
		let stringOrError: string | Error;
		if (typeof nameOrError === "function") {
			stringOrError = nameOrError();
		} else {
			stringOrError = nameOrError;
		}
		let error: Error;
		if (typeof stringOrError === "string") {
			error = new RangeError(`Missing: ${stringOrError}`);
		} else {
			error = stringOrError;
		}
		throw error;
	}
}
