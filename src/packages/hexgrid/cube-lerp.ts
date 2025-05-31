import type { HexCubePoint } from "./cube.js";
import { lerp } from "./lerp.js";

export const cubeLerp = (a: HexCubePoint, b: HexCubePoint, frac: number): HexCubePoint => {
	return {
		q: lerp(a.q, b.q, frac),
		r: lerp(a.r, b.r, frac),
		s: lerp(a.s, b.s, frac),
		system: a.system,
	};
};
