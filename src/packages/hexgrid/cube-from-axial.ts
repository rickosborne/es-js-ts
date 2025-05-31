import type { AxialPoint } from "./axial.js";
import type { HexCubePoint } from "./cube.js";
import { CUBE } from "./hex-system.js";

/**
 * Transform an Axial point into a Cube point by calculating and materializing `s`.
 */
export const cubeFromAxial = (axial: AxialPoint): HexCubePoint => {
	return {
		q: axial.q,
		r: axial.r,
		s: 0 - axial.q - axial.r,
		system: CUBE,
	};
};
