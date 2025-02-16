/**
 * Throw unless at most exactly one of the given keys is present in the
 * given value.  Used for "you can have A or B, but never both".
 */
export function assertExactlyOne<T extends object, K extends string>(name: string, value: T, ...keys: K[]): void {
	const present = keys.filter((k) => value[ k as unknown as keyof T ] != null);
	if (present.length > 1) {
		throw new SyntaxError(`${ name } cannot have more than 1 of: ${ present.join(" ") }`);
	}
}
