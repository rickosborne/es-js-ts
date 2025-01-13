/**
 * A function which compares two values and returns
 * the order in which they should be sorted.
 * Negative values mean `a` should be sorted
 * before `b`, while positive values mean the
 * reverse.  Zero means the two values are equivalent.
 * @returns Negative for `a lt b`, positive for `a gt b`, and zero for `a eq b`.
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Helper for comparators to make it clear to readers
 * which value is less-than the other.
 */
export const A_LT_B = -1;
/**
 * Helper for comparators to make it clear to readers
 * which value is greater-than the other.
 */
export const A_GT_B = 1;
/**
 * Helper for comparators to make it clear the two
 * values are equivalent.
 */
export const EQ = 0;
