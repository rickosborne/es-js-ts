import { SQRT_3, SQRT_3_2, SQRT_3_3 } from "./hex-system.js";

export interface HexOrientation {
	b0: number;
	b1: number;
	b2: number;
	b3: number;
	f0: number;
	f1: number;
	f2: number;
	f3: number;
	start60Deg: number;
	type: HexOrientationName;
}

export interface HexOrientations {
	flat: typeof ORIENTATION_FLAT;
	pointy: typeof ORIENTATION_POINTY;
}

export const FLAT = "flat";
export const POINTY = "pointy";

export type HexOrientationName = keyof HexOrientations;

export const ORIENTATION_POINTY: Readonly<HexOrientation> = Object.freeze({
	b0: SQRT_3_3,
	b1: -1 / 3,
	b2: 0,
	b3: 2 / 3,
	f0: SQRT_3,
	f1: SQRT_3_2,
	f2: 0,
	f3: 3 / 2,
	start60Deg: 0.5,
	type: POINTY,
});

export const ORIENTATION_FLAT: Readonly<HexOrientation> = Object.freeze({
	f0: 3 / 2,
	f1: 0,
	f2: SQRT_3_2,
	f3: SQRT_3,
	b0: 2 / 3,
	b1: 0,
	b2: -1 / 3,
	b3: SQRT_3_3,
	start60Deg: 0,
	type: FLAT,
});

export interface PointXY {
	x: number;
	y: number;
}

export interface HexLayout {
	orientation: HexOrientation;
	origin: PointXY;
	/**
	 * The smallest useful unit in this layout.  Pixel values
	 * will be rounded to it.
	 */
	resolution: number;
	size: PointXY;
}
