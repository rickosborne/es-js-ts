import type { BareQRSPoint, QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

const RING_DIRECTIONS: readonly BareQRSPoint[] = Object.freeze([
	{ q: 1, r: 0 },
	{ q: 1, r: -1 },
	{ q: 0, r: -1 },
	{ q: -1, r: 0 },
	{ q: -1, r: 1 },
	{ q: 0, r: 1 },
]);

export const qrsRing = <P extends QRSPoint<S>, S extends QRSSystem>(
	center: P,
	radius: number,
	builder: QRSBuilder<P>,
): P[] => {
	if (radius < 1) {
		return [];
	}
	const points: P[] = [];
	let q = -radius + center.q;
	let r = radius + center.q;
	for (let i = 0; i < 6; i++) {
		const neighborDirection = RING_DIRECTIONS[ i ]!;
		for (let j = 0; j < radius; j++) {
			points.push(builder(q, r));
			q += neighborDirection.q;
			r += neighborDirection.r;
		}
	}
	return points;
};
