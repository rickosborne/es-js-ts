import type { HexCubePoint } from "./cube.js";

export const cubeRound = (cube: HexCubePoint): HexCubePoint => {
	let q = Math.round(cube.q);
	let r = Math.round(cube.r);
	let s = Math.round(cube.s);
	const dq = Math.abs(q - cube.q);
	const dr = Math.abs(r - cube.r);
	const ds = Math.abs(s - cube.s);
	if ((dq > dr) && (dq > ds)) {
		q = -r - s;
	} else if (dr > ds) {
		r = -q - s;
	} else {
		s = -q - r;
	}
	return {
		q, r, s,
		system: cube.system,
	};
};
