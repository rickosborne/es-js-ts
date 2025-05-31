import { axialFromQR } from "./axial.js";
import type { AxialPoint } from "./axial.js";
import { qrsIntersection } from "./qrs-intersection.js";

export const axialIntersection = (
	center1: AxialPoint,
	radius1: number,
	center2: AxialPoint,
	radius2: number = radius1,
): AxialPoint[] => qrsIntersection<AxialPoint>(axialFromQR, center1, radius1, center2, radius2);
