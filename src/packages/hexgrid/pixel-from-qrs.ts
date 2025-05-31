import { memoizeBinary, roundTo } from "@rickosborne/foundation";
import { SQRT_3, SQRT_3_2, TWO_PI } from "./hex-system.js";
import type { HexLayout, PointXY } from "./orientation.js";
import type { BareQRSPoint } from "./qrs.js";

const MAG_3_2 = 3 / 2;

export const pixelFromFlatQRS = ({ q, r }: BareQRSPoint, scale = 1): PointXY => {
	const x = scale * MAG_3_2 * q;
	const y = scale * (SQRT_3_2 * q + SQRT_3 * r);
	return { x, y };
};

export const pixelFromPointyQRS = ({ q, r }: BareQRSPoint, scale = 1): PointXY => {
	const x = scale * (SQRT_3 * q + SQRT_3_2 * r);
	const y = scale * MAG_3_2 * r;
	return { x, y };
};

export const pixelFromQRS = (
	{ q, r }: BareQRSPoint,
	{ orientation: { f0, f1, f2, f3 }, origin: { x: cx, y: cy }, size: { x: scaleX, y: scaleY } }: HexLayout,
): PointXY => {
	const x = cx + (f0 * q + f1 * r) * scaleX;
	const y = cy + (f2 * q + f3 * r) * scaleY;
	return { x, y };
};

export type HexCorner = 0 | 1 | 2 | 3 | 4 | 5;

export const HEX_CORNERS: readonly HexCorner[] = Object.freeze([ 0, 1, 2, 3, 4, 5 ]);

export const pixelOffsetOfCorner = memoizeBinary((
	corner: HexCorner,
	{ orientation: { start60Deg }, size: { x: scaleX, y: scaleY } }: HexLayout,
): Readonly<PointXY> => {
	const rad = TWO_PI * (start60Deg + corner) / 6;
	const x = scaleX * Math.cos(rad);
	const y = scaleY * Math.sin(rad);
	return Object.freeze({ x, y });
});

export const hexCorners = (
	qrs: BareQRSPoint,
	layout: HexLayout,
): PointXY[] => {
	const { x: cx, y: cy } = pixelFromQRS(qrs, layout);
	const resolution = layout.resolution;
	return HEX_CORNERS.map((corner) => {
		const { x: ox, y: oy } = pixelOffsetOfCorner(corner, layout);
		return {
			x: roundTo(cx + ox, resolution),
			y: roundTo(cy + oy, resolution),
		};
	});
};
