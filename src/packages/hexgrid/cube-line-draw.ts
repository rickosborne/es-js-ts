import { cubeAdd } from "./cube-add.js";
import { cubeDistance } from "./cube-distance.js";
import { cubeLerp } from "./cube-lerp.js";
import { cubeRound } from "./cube-round.js";
import { CUBE_EPSILON, type HexCubePoint } from "./cube.js";

export const cubeLineDraw = (a: HexCubePoint, b: HexCubePoint): HexCubePoint[] => {
	const distance = cubeDistance(a, b);
	const step = 1.0 / Math.max(1, distance);
	const points: HexCubePoint[] = [];
	const begin = cubeAdd(a, CUBE_EPSILON);
	const end = cubeAdd(b, CUBE_EPSILON);
	for (let i = 0; i <= distance; i++) {
		points.push(cubeRound(cubeLerp(begin, end, step * i)));
	}
	return points;
};
