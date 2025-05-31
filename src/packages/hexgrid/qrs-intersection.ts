import type { QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

export const qrsIntersection = <P extends QRSPoint<QRSSystem>>(
	buildFn: QRSBuilder<P>,
	center1: P,
	radius1: number,
	center2: P,
	radius2: number = radius1,
): P[] => {
	const points: P[] = [];
	const qMin = Math.max(center1.q - radius1, center2.q - radius2);
	const qMax = Math.min(center1.q + radius1, center2.q + radius2);
	const rMin = Math.max(center1.r - radius1, center2.r - radius2);
	const rMax = Math.min(center1.r + radius1, center2.r + radius2);
	const s1 = -center1.q - center1.r;
	const s2 = -center2.q - center2.r;
	const sMin = Math.max(s1 - radius1, s2 - radius2);
	const sMax = Math.min(s1 + radius1, s2 + radius2);
	for (let q = qMin; q <= qMax; q++) {
		const ra = Math.max(rMin, -q - sMax);
		const rb = Math.min(rMax, -q - sMin);
		for (let r = ra; r <= rb; r++) {
			points.push(buildFn(q, r));
		}
	}
	return points;
};
