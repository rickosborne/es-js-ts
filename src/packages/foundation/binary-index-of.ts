import type { Comparator } from "@rickosborne/typical";

/**
 * A result of a search through a list.  If the value was found,
 * its index is returned.  Otherwise, the <kbd>before</kbd> value
 * is the index before which the value could be inserted.
 * For troubleshooting and instrumentation, also returns the
 * number of comparisons it took to find the value.
 */
export type SearchResult = {
	before?: undefined;
	comparisons: number;
	exists: true;
	index: number;
} | {
	before: number;
	comparisons: number;
	exists: false;
	index?: undefined;
};

/**
 * Configuration options for {@link binaryIndexOf}.
 */
export type BinaryIndexOfConfig = {
	/**
	 * The values may not be unique, and the result should be the
	 * index of the first occurrence.
	 * When a value is found, step back and compare until the first
	 * occurrence of that value is found.  Will always cause extra
	 * comparisons.
	 * @defaultValue false
	 */
	firstNonUnique?: boolean;
	/**
	 * Left-most index to check.  Inclusive.
	 * @defaultValue 0
	 */
	initialLeft?: number;
	/**
	 * Right-most index, considered out-of-bounds.  Exclusive.
	 * Defaults to the length of the array.
	 */
	initialRight?: number;
	/**
	 * Perform an initial check against the first and last elements.
	 * Can speed up searches where you expect the value to be less
	 * than or greater than all the elements, such as when you mostly
	 * insert at the front or append to the back.
	 * But it can just add extra comparisons for small arrays, or
	 * arrays where most values will be in the middle.
	 * @defaultValue false
	 */
	rangeCheck?: boolean;
};

/**
 * Perform a binary search through the given list for the given value
 * using the given comparator.
 */
export const binaryIndexOf = <T>(
	value: T,
	items: T[],
	comparator: Comparator<T>,
	config: BinaryIndexOfConfig = {},
): SearchResult => {
	let left = config.initialLeft ?? 0;
	let right = config.initialRight ?? items.length;
	let comparisons = 0;
	if (left >= right) {
		return { before: right, comparisons: 0, exists: false };
	}
	const compareAt = (index: number): number => {
		const other = items[ index ]!;
		const compared = other === value ? 0 : comparator(value, other);
		comparisons++;
		return compared;
	};
	if (config.rangeCheck) {
		const beforeLeft = compareAt(left);
		if (beforeLeft < 0) {
			return { before: left, comparisons, exists: false };
		}
		if (beforeLeft === 0) {
			return { comparisons, exists: true, index: left };
		}
		left++;
		if (left < right) {
			const afterRight = compareAt(right - 1);
			if (afterRight > 0) {
				return { before: right, comparisons, exists: false };
			}
			if (afterRight === 0) {
				if (config.firstNonUnique) {
					while (right > 1 && compareAt(right - 2) === 0) {
						right--;
					}
				}
				return { comparisons, exists: true, index: right - 1 };
			}
			right--;
		}
	}
	while (left < right) {
		let index = (left + right) >> 1;
		const compared = compareAt(index);
		if (compared === 0) {
			if (config.firstNonUnique) {
				while (index > 0 && compareAt(index - 1) === 0) {
					index--;
				}
			}
			return { comparisons, exists: true, index };
		} else if (compared < 0) {
			right = index;
		} else {
			left = index + 1;
		}
	}
	return { before: right, comparisons, exists: false };
};

