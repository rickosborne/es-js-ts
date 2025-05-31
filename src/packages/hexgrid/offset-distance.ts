import { axialFromOffset } from "./axial-from-offset.js";
import { axialSubtract } from "./axial-subtract.js";
import type { OffsetPoint, OffsetSystem } from "./offset.js";

export const offsetDistance = (left: OffsetPoint<OffsetSystem>, right: OffsetPoint<OffsetSystem>): number => {
	const l = axialFromOffset(left);
	const r = axialFromOffset(right);
	const d = axialSubtract(l, r);
	return (Math.abs(d.q) + Math.abs(d.q + d.r) + Math.abs(d.r)) / 2;
};
