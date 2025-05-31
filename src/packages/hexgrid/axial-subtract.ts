import { axialFromQR, type AxialPoint } from "./axial.js";
import { qrsSubtract } from "./qrs-subtract.js";

/**
 * Subtract one axial point from another.
 */
export const axialSubtract = (left: AxialPoint, right: AxialPoint): AxialPoint => qrsSubtract(left, right, axialFromQR);
