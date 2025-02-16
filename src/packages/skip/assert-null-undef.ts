/**
 * Throw if the given value is not null or undefined.
 */
export function assertNullUndef(value: unknown, errorProvider: (type: string) => Error): asserts value is (null | undefined) {
	if (value != null) {
		throw errorProvider(typeof value);
	}
}
