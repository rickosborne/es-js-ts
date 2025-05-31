import { axialAdd } from "./axial-add.js";
import { axialLerp } from "./axial-lerp.js";
import { axialRound } from "./axial-round.js";
import { AXIAL_EPSILON, type AxialPoint } from "./axial.js";
import { hexDistance } from "./hex-distance.js";

export const axialLineDraw = (left: AxialPoint, right: AxialPoint): AxialPoint[] => {
	const points: AxialPoint[] = [];
	const distance = hexDistance(left, right);
	const start = axialAdd(left, AXIAL_EPSILON);
	for (let i = 0; i <= distance; i++) {
		points.push(axialRound(axialLerp(start, right, i / distance)));
	}
	return points;
};
