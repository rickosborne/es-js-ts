/**
 * How many hexes are reachable from a starting hex given a Manhattan
 * distance radius?
 */
export const hexesWithin = (radius: number) => {
	if (radius < 0 || !Number.isSafeInteger(radius)) {
		throw new RangeError("hexesWithin expects a positive integer radius");
	}
	return 1 + (3 * radius * (radius + 1));
};
