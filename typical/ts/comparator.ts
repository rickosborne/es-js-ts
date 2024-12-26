/**
 * A function which compares two values and returns
 * the order in which they should be sorted.
 * Negative values mean <kbd>a</kbd> should be sorted
 * before <kbd>b</kbd>, while positive values mean the
 * reverse.  Zero means the two values are equivalent.
 * @returns Negative for <kbd>a lt b</kbd>, positive for <kbd>a gt b</kbd>, and zero for <kbd>a eq b</kbd>.
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
