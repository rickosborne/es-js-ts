/**
 * Simple comparison to see if two arrays are equivalent.
 */
export const arrayEq = <T>(
	a: T[],
	b: T[],
	predicate: ((_a: T, _b: T, index: number) => boolean) = ((aa, bb) => aa === bb),
): boolean => {
	if (a === b) {
		return true;
	}
	if (a.length !== b.length) {
		return false;
	}
	return a.every((aValue, index) => predicate(aValue, b[ index ]!, index));
};
