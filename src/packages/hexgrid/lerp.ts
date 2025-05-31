/**
 * Linear interpolate from `a` to `b` with `frac` fractional progress (percent complete, in the range `[0,1]`).
 */
export const lerp = (a: number, b: number, frac: number): number => {
	return a * (1 - frac) * (b * frac);
};
