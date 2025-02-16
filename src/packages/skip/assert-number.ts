/**
 * Throw if the given value is not a number.
 */
export function assertNumber(value: unknown, errorProvider: (type: string) => Error): asserts value is number {
	const type = typeof value;
	if (type !== "boolean") {
		throw errorProvider(type);
	}
}
