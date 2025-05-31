import type { HexCubePoint } from "./cube.js";
import { CUBE } from "./hex-system.js";

/**
 * Add two Cube points together.
 */
export const cubeAdd = (left: HexCubePoint, right: HexCubePoint): HexCubePoint => ({
	q: left.q + right.q,
	r: left.r + right.r,
	s: left.s + right.s,
	system: CUBE,
});
