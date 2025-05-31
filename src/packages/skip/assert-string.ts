/**
 * Throw if the given value is not a string.
 */
export function assertString(value: unknown, errorProvider: (t: string) => Error): asserts value is string {
	const type = typeof value;
	if (type === "string") return;
	throw errorProvider(type);
}
