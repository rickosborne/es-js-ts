/**
 * Simple comparison to see if two arrays are equivalent.
 */
export const arrayEq = <T>(
	a: T[],
	b: T[],
	predicate: ((a: T, b: T, index: number) => boolean) = ((a, b) => a === b),
): boolean => {
	if (a === b) {
		return true;
	}
	if (a.length !== b.length) {
		return false;
	}
	return a.every((aValue, index) => predicate(aValue, b[ index ]!, index));
};
