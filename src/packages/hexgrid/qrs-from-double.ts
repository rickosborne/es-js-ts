import type { DoubleHeightPoint, DoubleWidthPoint } from "./double.js";
import type { QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

export const qrsFromDoubleHeight = <S extends QRSSystem, P extends QRSPoint<S>>(double: DoubleHeightPoint, builder: QRSBuilder<P>): P => {
	const q = double.col;
	const r = (double.row - q) / 2;
	return builder(q, r);
};

export const qrsFromDoubleWidth = <S extends QRSSystem, P extends QRSPoint<S>>(double: DoubleWidthPoint, builder: QRSBuilder<P>): P => {
	const r = double.row;
	const q = (double.col - r) / 2;
	return builder(q, r);
};
