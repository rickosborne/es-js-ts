import type { HexCubePoint } from "./cube.js";

export const cubeSubtract = (left: HexCubePoint, right: HexCubePoint): HexCubePoint => {
	return {
		q: left.q - right.q,
		r: left.r - right.r,
		s: left.s - right.s,
		system: left.system,
	};
};
