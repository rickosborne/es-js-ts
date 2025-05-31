import type { EVEN_Q, EVEN_R, ODD_Q, ODD_R } from "./hex-system.js";
import type { Point } from "./point.js";

export interface BareOffset {
	col: number;
	row: number;
}

export type OffsetSystem = typeof ODD_Q | typeof ODD_R | typeof EVEN_Q | typeof EVEN_R;

export interface OffsetPoint<SystemT extends OffsetSystem> extends Point, BareOffset {
	system: SystemT;
}

export interface OddRPoint extends OffsetPoint<typeof ODD_R> {}
export interface OddQPoint extends OffsetPoint<typeof ODD_Q> {}
export interface EvenRPoint extends OffsetPoint<typeof EVEN_R> {}
export interface EvenQPoint extends OffsetPoint<typeof EVEN_Q> {}

export const OFFSET_R_E = 0;
export const OFFSET_R_NE = 1;
export const OFFSET_R_NW = 2;
export const OFFSET_R_W = 3;
export const OFFSET_R_SW = 4;
export const OFFSET_R_SE = 5;

export type OffsetDirection = typeof OFFSET_R_E | typeof OFFSET_R_NE | typeof OFFSET_R_NW | typeof OFFSET_R_W | typeof OFFSET_R_SW | typeof OFFSET_R_SE;

export const OFFSET_Q_SE = OFFSET_R_E;
export const OFFSET_Q_NE = OFFSET_R_NE;
export const OFFSET_Q_N = OFFSET_R_NW;
export const OFFSET_Q_NW = OFFSET_R_W;
export const OFFSET_Q_SW = OFFSET_R_SW;
export const OFFSET_Q_S = OFFSET_R_SE;

export const OFFSET_DIRECTIONS: Readonly<Readonly<OffsetDirection>[]> = Object.freeze([
	OFFSET_Q_SE,
	OFFSET_Q_NE,
	OFFSET_Q_N,
	OFFSET_Q_NW,
	OFFSET_Q_SW,
	OFFSET_Q_S,
]);

export const stringifyOffset = ({ row, col, system }: OffsetPoint<OffsetSystem>): string => {
	return `${system}<${col},${row}>`;
};
