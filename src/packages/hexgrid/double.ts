import { DOUBLE_H, DOUBLE_W, type DoubleHeight, type DoubleWidth } from "./hex-system.js";
import type { Point } from "./point.js";

export interface BareDouble {
	col: number;
	row: number;
}

export type DoubleSystem = DoubleWidth | DoubleHeight;

export interface DoublePoint<SystemT extends DoubleSystem> extends Point, BareDouble {
	system: SystemT;
}

export interface DoubleHeightPoint extends DoublePoint<DoubleHeight> {}
export interface DoubleWidthPoint extends DoublePoint<DoubleWidth> {}

export const DOUBLE_H_N = Object.freeze({ col: 0, row: -2, system: DOUBLE_H } as const satisfies DoubleHeightPoint);
export const DOUBLE_H_NE = Object.freeze({ col: 1, row: -1, system: DOUBLE_H } as const satisfies DoubleHeightPoint);
export const DOUBLE_H_SE = Object.freeze({ col: 1, row: 1, system: DOUBLE_H } as const satisfies DoubleHeightPoint);
export const DOUBLE_H_S = Object.freeze({ col: 0, row: 2, system: DOUBLE_H } as const satisfies DoubleHeightPoint);
export const DOUBLE_H_SW = Object.freeze({ col: -1, row: 1, system: DOUBLE_H } as const satisfies DoubleHeightPoint);
export const DOUBLE_H_NW = Object.freeze({ col: -1, row: -1, system: DOUBLE_H } as const satisfies DoubleHeightPoint);

export type DoubleHeightDirection = typeof DOUBLE_H_N | typeof DOUBLE_H_NE | typeof DOUBLE_H_SE | typeof DOUBLE_H_S | typeof DOUBLE_H_SW | typeof DOUBLE_H_NW;

export const DOUBLE_W_E = Object.freeze({ col: 2, row: 0, system: DOUBLE_W } as const satisfies DoubleWidthPoint);
export const DOUBLE_W_SE = Object.freeze({ col: 1, row: 1, system: DOUBLE_W } as const satisfies DoubleWidthPoint);
export const DOUBLE_W_SW = Object.freeze({ col: -1, row: 1, system: DOUBLE_W } as const satisfies DoubleWidthPoint);
export const DOUBLE_W_W = Object.freeze({ col: -2, row: 0, system: DOUBLE_W } as const satisfies DoubleWidthPoint);
export const DOUBLE_W_NW = Object.freeze({ col: -1, row: 1, system: DOUBLE_W } as const satisfies DoubleWidthPoint);
export const DOUBLE_W_NE = Object.freeze({ col: 1, row: -1, system: DOUBLE_W } as const satisfies DoubleWidthPoint);

export type DoubleWidthDirection = typeof DOUBLE_W_E | typeof DOUBLE_W_SE | typeof DOUBLE_W_SW | typeof DOUBLE_W_W | typeof DOUBLE_W_NW | typeof DOUBLE_W_NE;
