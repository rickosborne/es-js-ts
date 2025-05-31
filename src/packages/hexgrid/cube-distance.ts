import { cubeSubtract } from "./cube-subtract.js";
import type { HexCubePoint } from "./cube.js";

/**
 * Calculate the Manhattan distance between two points.
 */
export const cubeDistance = (left: HexCubePoint, right: HexCubePoint): number => {
	const { q, r, s } = cubeSubtract(left, right);
	return Math.max(Math.abs(q) + Math.abs(r) + Math.abs(s));
};
