import type { BareQRSPoint, QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

export const bareQRSScale = (point: BareQRSPoint, factor: number): BareQRSPoint => ({ q: point.q * factor, r: point.r * factor });

export const qrsScale = <P extends QRSPoint<S>, S extends QRSSystem>(point: P, factor: number, builder: QRSBuilder<P>): P => {
	return builder(point.q * factor, point.r * factor);
};
