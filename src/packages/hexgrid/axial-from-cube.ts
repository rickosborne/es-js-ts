import type { AxialPoint } from "./axial.js";
import type { HexCubePoint } from "./cube.js";
import { AXIAL } from "./hex-system.js";

/**
 * Rebrand a Cube point to an Axial point.
 */
export const axialFromCube = (cube: HexCubePoint): AxialPoint => {
	return {
		q: cube.q,
		r: cube.r,
		system: AXIAL,
	};
};
