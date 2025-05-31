import { cubeAdd } from "./cube-add.js";
import { cubeSubtract } from "./cube-subtract.js";
import type { HexCubePoint } from "./cube.js";
import type { HexRotation } from "./hex-system.js";
import { CUBE, CW_60 } from "./hex-system.js";

export const cubeRotate = (center: HexCubePoint, outer: HexCubePoint, rotation: HexRotation): HexCubePoint => {
	const steps = rotation / CW_60;
	const vector = cubeSubtract(outer, center);
	let { q, r, s } = vector;
	for (let i = 0; i < steps; i++) {
		const t = q;
		q = -r;
		r = -s;
		s = -t;
	}
	return cubeAdd(center, { q, r, s, system: CUBE });
};
