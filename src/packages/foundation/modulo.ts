/**
 * Euclidian division which returns a tuple of the quotient
 * and remainder.
 * @see {@link https://en.wikipedia.org/wiki/Euclidean_division}
 */
export const divMod = (
	num: number,
	divisor: number,
): [ quotient: number, remainder: number ] => {
	if (divisor === 0) {
		return [ NaN, NaN ];
	}
	let remainder: number;
	if (num === divisor || num === 0) {
		remainder = 0;
	} else {
		remainder = num % divisor;
		if (remainder < 0) {
			remainder = divisor < 0 ? (remainder - divisor) : remainder + divisor;
		}
	}
	const quotient = (num - remainder) / divisor;
	return [ quotient, remainder ];
};

/**
 * Modulo where the result is always positive.
 * @see {@link https://en.wikipedia.org/wiki/Euclidean_division}
 */
export const positiveMod = (
	num: number,
	divisor: number,
): number => {
	return divMod(num, divisor)[ 1 ];
};


/**
 * Modulo where the result is always positive.
 * @see {@link https://en.wikipedia.org/wiki/Euclidean_division}
 */
export const positiveDiv = (
	num: number,
	divisor: number,
): number => {
	return divMod(num, divisor)[ 0 ];
};
