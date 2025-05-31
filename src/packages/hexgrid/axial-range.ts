import { axialAdd } from "./axial-add.js";
import { axialFromQR } from "./axial.js";
import type { AxialPoint } from "./axial.js";
import { qrsRange } from "./qrs-range.js";

export const axialRange = (
	center: AxialPoint,
	radius: number,
): AxialPoint[] => qrsRange<AxialPoint>(axialAdd, axialFromQR, center, radius);
