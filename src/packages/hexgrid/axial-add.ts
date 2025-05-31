import type { AxialPoint } from "./axial.js";

/**
 * Add together two axial points to form a third.
 */
export const axialAdd = (left: AxialPoint, right: AxialPoint): AxialPoint => ({
	q: left.q + right.q,
	r: left.r + right.r,
	system: left.system,
});
