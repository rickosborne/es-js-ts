import { cubeFromQR } from "./cube.js";
import type { HexCubePoint } from "./cube.js";
import { qrsIntersection } from "./qrs-intersection.js";

export const cubeIntersection = (
	center1: HexCubePoint,
	radius1: number,
	center2: HexCubePoint,
	radius2: number = radius1,
): HexCubePoint[] => qrsIntersection<HexCubePoint>(cubeFromQR, center1, radius1, center2, radius2);
