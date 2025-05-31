import type { BareQRSPoint } from "./qrs.js";

/**
 * Calculate the Manhattan distance between two hex points.
 */
export const hexDistance = (left: BareQRSPoint, right: BareQRSPoint): number => {
	const q = left.q - right.q;
	const r = left.r - right.r;
	return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
};

/**
 * Euclidean distance between two hex points.
 * @see {@link https://doi.org/10.1117/1.JEI.22.1.010502 | Storage and addressing scheme for practical hexagonal image processing}
 */
export const hexEuclidDistance = (left: BareQRSPoint, right: BareQRSPoint): number => {
	const q = left.q - right.q;
	const r = left.r - right.r;
	return Math.sqrt((q * q) + (r * r) + (q * r));
};
