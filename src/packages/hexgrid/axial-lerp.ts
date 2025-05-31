import type { AxialPoint } from "./axial.js";
import { AXIAL } from "./hex-system.js";
import { lerp } from "./lerp.js";

export const axialLerp = (left: AxialPoint, right: AxialPoint, fraction01: number): AxialPoint => ({
	q: lerp(left.q, right.q, fraction01),
	r: lerp(left.r, right.r, fraction01),
	system: AXIAL,
});
