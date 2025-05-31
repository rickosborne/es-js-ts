import type { DoubleHeightPoint, DoubleWidthPoint } from "./double.js";

export const doubleHeightDistance = (left: DoubleHeightPoint, right: DoubleHeightPoint): number => {
	const dCol = left.col - right.col;
	const dRow = left.row - right.row;
	return dCol + Math.max(0, (dRow - dCol) / 2);
};

export const doubleWidthDistance = (left: DoubleWidthPoint, right: DoubleWidthPoint): number => {
	const dCol = left.col - right.col;
	const dRow = left.row - right.row;
	return dRow + Math.max(0, (dCol - dRow) / 2);
};
