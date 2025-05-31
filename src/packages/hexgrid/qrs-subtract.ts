import type { BareQRSPoint, QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

export const bareQRSSubtract = (left: BareQRSPoint, right: BareQRSPoint): BareQRSPoint => ({
	q: left.q - right.q,
	r: left.r - right.r,
});

export const qrsSubtract = <P extends QRSPoint<S>, S extends QRSSystem>(left: P, right: P, builder: QRSBuilder<P>): P => builder(left.q - right.q, left.r - right.r);
