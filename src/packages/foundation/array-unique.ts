import { deepEquals } from "./deep-equals.js";

/**
 * Generate a new array which has no duplicate values.
 * Preserves the order of the first occurrence of each value.
 * Returns the original array if no duplicates were found.
 */
export const arrayUnique = <T>(array: T[]): T[] => {
	const primitives = new Set<T>();
	const objects: (T & object)[] = [];
	const result: T[] = [];
	for (const value of array) {
		if (typeof value === "object" && value != null) {
			if (!objects.some((v) => deepEquals(v, value))) {
				result.push(value);
				objects.push(value);
			}
		} else {
			if (!primitives.has(value)) {
				result.push(value);
				primitives.add(value);
			}
		}
	}
	return result.length === array.length ? array : result;
};

/**
 * Generate a function for use in an array reducer which will track
 * and only keep the first occurrence of each value.
 */
export const uniqueReducer = () => {
	const primitives = new Set<unknown>();
	const objects: object[] = [];
	return <T>(prev: T[], cur: T): T[] => {
		if (typeof cur === "object" && cur != null) {
			if (!objects.some((v) => deepEquals(v, cur))) {
				prev.push(cur);
				objects.push(cur);
			}
		} else {
			if (!primitives.has(cur)) {
				prev.push(cur);
				primitives.add(cur);
			}
		}
		return prev;
	};
};

/**
 * Generate the args for an array reducer which keeps only distinct
 * values.
 * @example
 * const unique = items.reduce(...reduceToUnique());
 */
export const reduceToUnique = <T>(): [ (prev: T[], cur: T) => T[], T[] ] => [
	uniqueReducer(),
	[],
];
