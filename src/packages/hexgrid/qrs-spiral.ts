import { qrsRing } from "./qrs-ring.js";
import type { QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

export const qrsSpiral = <P extends QRSPoint<S>, S extends QRSSystem>(
	center: P,
	radius: number,
	builder: QRSBuilder<P>,
): P[] => {
	if (radius < 1) {
		return [];
	}
	const points: P[] = [];
	for (let r = 1; r <= radius; r++) {
		points.push(...qrsRing<P, S>(center, r, builder));
	}
	return points;
};
