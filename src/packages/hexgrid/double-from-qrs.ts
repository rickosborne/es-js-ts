import type { DoubleHeightPoint, DoubleWidthPoint } from "./double.js";
import { DOUBLE_H, DOUBLE_W } from "./hex-system.js";
import type { BareQRSPoint } from "./qrs.js";

export const doubleHeightFromQRS = (qrs: BareQRSPoint): DoubleHeightPoint => {
	const col = qrs.q;
	const row = 2 * qrs.r + col;
	return { col, row, system: DOUBLE_H };
};

export const doubleWidthFromQRS = (qrs: BareQRSPoint): DoubleWidthPoint => {
	const row = qrs.r;
	const col = 2 * qrs.q + row;
	return { col, row, system: DOUBLE_W };
};
