/**
 * Round a given number to the nearest unit of resolution.
 * For resolution of 1, this is equal to `Math.round`.
 */
export const roundTo = (value: number, resolution = 1): number => {
	if (resolution === 1 || resolution === 0) {
		return Math.round(value);
	}
	return Math.round(value / resolution) * resolution;
};
