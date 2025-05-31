import type { DoubleHeightPoint, DoubleWidthPoint } from "./double.js";
import { DOUBLE_H, DOUBLE_W } from "./hex-system.js";

export const doubleHeightAdd = (left: DoubleHeightPoint, right: DoubleHeightPoint): DoubleHeightPoint => ({
	col: left.col + right.col,
	row: left.row + right.row,
	system: DOUBLE_H,
});

export const doubleWidthAdd = (left: DoubleWidthPoint, right: DoubleWidthPoint): DoubleWidthPoint => ({
	col: left.col + right.col,
	row: left.row + right.row,
	system: DOUBLE_W,
});
