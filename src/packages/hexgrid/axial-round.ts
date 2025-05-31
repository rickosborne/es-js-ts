import { axialFromCube } from "./axial-from-cube.js";
import type { AxialPoint } from "./axial.js";
import { cubeFromAxial } from "./cube-from-axial.js";
import { cubeRound } from "./cube-round.js";

export const axialRound = (axial: AxialPoint): AxialPoint => {
	return axialFromCube(cubeRound(cubeFromAxial(axial)));
};
