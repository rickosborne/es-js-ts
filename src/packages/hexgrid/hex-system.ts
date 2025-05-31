export const AXIAL = "axial" as const;
export const CUBE = "cube" as const;
export const DOUBLE_H = "doubleH" as const;
export const DOUBLE_W = "doubleW" as const;
export const ODD_R = "oddR" as const;
export const ODD_Q = "oddQ" as const;
export const EVEN_R = "evenR" as const;
export const EVEN_Q = "evenQ" as const;

export type Axial = typeof AXIAL;
export type Cube = typeof CUBE;
export type DoubleHeight = typeof DOUBLE_H;
export type DoubleWidth = typeof DOUBLE_W;
export type OddR = typeof ODD_R;
export type OddQ = typeof ODD_Q;
export type EvenR = typeof EVEN_R;
export type EvenQ = typeof EVEN_Q;

export interface HexSystems {
	axial: Axial;
	cube: Cube;
	doubleH: DoubleHeight;
	doubleW: DoubleWidth;
	evenQ: EvenQ;
	evenR: EvenR;
	oddQ: OddQ;
	oddR: OddR;
}

export type HexSystem = keyof HexSystems;

export const HEX_SYSTEMS: readonly HexSystem[] = Object.freeze([
	AXIAL, CUBE, DOUBLE_H, DOUBLE_W, EVEN_Q, EVEN_R, ODD_Q, ODD_R,
]);

export const SQRT_3 = Math.sqrt(3);
export const SQRT_3_2 = SQRT_3 / 2;
export const SQRT_3_3 = SQRT_3 / 3;

export const TWO_PI = Math.PI * 2;

export const CW_60 = 60;
export const CW_120 = 120;
export const CW_180 = 180;
export const CW_240 = 240;
export const CW_300 = 300;

export const CCW_60 = CW_300;
export const CCW_120 = CW_240;
export const CCW_180 = CW_180;
export const CCW_240 = CW_120;
export const CCW_300 = CW_60;

export type HexRotation = 0 | typeof CW_60 | typeof CW_120 | typeof CW_180 | typeof CW_240 | typeof CW_300;
