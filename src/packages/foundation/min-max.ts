export function minMax(values: number[]): [ number, number ];
export function minMax(...values: number[]): [ number, number ];
/**
 * Find the minimum and maximum values in a list of numbers.
 * For small lists, it may be faster to call `Math.min` and `Math.max`.
 */
export function minMax(first: number | number[], ...rest: number[]): [ number, number ] {
	let min: number;
	let max: number;
	let remaining: number[];
	if (typeof first === "number") {
		if (rest.length === 0) {
			return [ first, first ];
		}
		min = first;
		max = first;
		remaining = rest.flatMap((n) => n);
	} else {
		if (first == null || first.length === 0) {
			return [ -Infinity, Infinity ];
		}
		min = Infinity;
		max = -Infinity;
		if (rest.length > 0) {
			// Not allowed by the type signature ... but Javascript.
			remaining = first.concat(rest);
		} else {
			remaining = first;
		}
	}
	for (const value of remaining) {
		if (value < min) {
			min = value;
		}
		if (value > max) {
			max = value;
		}
	}
	return [ min, max ];
}
