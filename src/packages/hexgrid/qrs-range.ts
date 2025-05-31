import type { QRSAdder, QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

/**
 * Calculate all the points within a given radius of a given center.
 */
export const qrsRange = <P extends QRSPoint<QRSSystem>>(
	addFn: QRSAdder<P>,
	buildFn: QRSBuilder<P>,
	center: P,
	radius: number,
): P[] => {
	const points: P[] = [];
	for (let q = -radius; q <= radius; q++) {
		const ra = Math.max(-radius, -q - radius);
		const rb = Math.min(radius, radius - q);
		for (let r = ra; r <= rb; r++) {
			const vector = buildFn(q, r);
			const point = addFn(center, vector);
			points.push(point);
		}
	}
	return points;
};
