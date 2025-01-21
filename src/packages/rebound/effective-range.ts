import type { CheckedBounds } from "./spec.js";

/**
 * Calculate the effective range for a given bounds.  That is, take
 * into account the inclusivity of the lower and upper bounds.
 */
export const effectiveRange = (bounds: CheckedBounds): number => {
	const start = bounds.lower + (bounds.isLowerInc ? 0 : bounds.isInt ? 1 : Number.MIN_VALUE);
	const end = bounds.upper - (bounds.isUpperInc ? 0 : bounds.isInt ? 1 : Number.MIN_VALUE);
	return end - start;
};
