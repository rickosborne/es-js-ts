/**
 * Generator for a sliding window of pairs of values from the given list.
 * It yields each value in the list in a tuple with its successor.
 * The last item wraps around to use the first item as its successor.
 * The indices of the two values are also yielded after the values.
 * For example:
 * ```
 * for (const [ x, y, xIndex, yIndex ] of window2([ "a", "b", "c" ])) {
 *     console.log(x, y, xIndex, yIndex);
 * }
 * ```
 * This would output:
 * <pre>
 * a, b, 0, 1
 * b, c, 1, 2
 * c, a, 2, 0
 * </pre>
 */
export function* window2<T>(
	items: Readonly<T[]>,
): Generator<Readonly<[T, T, number, number]>, void, undefined> {
	const count = items.length;
	let currentIndex = 0;
	let currentItem = items[0];
	for (let i = 1; i <= count; i++) {
		const nextIndex = i === count ? 0 : i;
		const nextItem = items[nextIndex];
		yield [ currentItem, nextItem, currentIndex, nextIndex ];
		currentIndex = nextIndex;
		currentItem = nextItem;
	}
}

/**
 * Generator for a sliding window of triplets of values from the given list.
 * It yields each value in the list in a tuple with its predecessor
 * and successor.  The first and last items wrap around to use the last
 * and first items as their predecessor/successor.
 * The indices of the values are also provided after the values.
 * The middle value (<kbd>y</kbd> in the example below) is the "current"
 * value, with the first value (<kbd>x</kbd>) being its predecessor and
 * the third (<kbd>z</kbd>) its successor.  That current value is the one
 * which will be at index 0 for the first iteration of the loop.
 * For example:
 * ```
 * for (const [ x, y, z, xIndex, yIndex, zIndex ] of window3([ "a", "b", "c" ])) {
 *     console.log(x, y, z, xIndex, yIndex, zIndex);
 * }
 * ```
 * This would output:
 * <pre>
 * c, a, b, 2, 0, 1
 * a, b, c, 0, 1, 2
 * b, c, a, 1, 2, 0
 * </pre>
 */
export function* window3<T>(
	items: Readonly<T[]>,
): Generator<Readonly<[T, T, T, number, number, number]>, void, undefined> {
	const count = items.length;
	let previousIndex = count - 1;
	let previousItem = items[previousIndex];
	let currentIndex = 0;
	let currentItem = items[0];
	for (let i = 1; i <= count; i++) {
		const nextIndex = i === count ? 0 : i;
		const nextItem = items[nextIndex];
		yield [ previousItem, currentItem, nextItem, previousIndex, currentIndex, nextIndex ];
		previousIndex = currentIndex;
		previousItem = currentItem;
		currentIndex = nextIndex;
		currentItem = nextItem;
	}
}
