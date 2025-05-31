import { cubeAdd } from "./cube-add.js";
import { cubeFromQR } from "./cube.js";
import type { HexCubePoint } from "./cube.js";
import { qrsRange } from "./qrs-range.js";

export const cubeRange = (
	center: HexCubePoint,
	radius: number,
): HexCubePoint[] => qrsRange<HexCubePoint>(cubeAdd, cubeFromQR, center, radius);
