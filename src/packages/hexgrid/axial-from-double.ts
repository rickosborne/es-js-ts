import { axialFromQR, type AxialPoint } from "./axial.js";
import type { DoubleHeightPoint, DoubleWidthPoint } from "./double.js";
import type { Axial } from "./hex-system.js";
import { qrsFromDoubleHeight, qrsFromDoubleWidth } from "./qrs-from-double.js";

export const axialFromDoubleHeight = (double: DoubleHeightPoint): AxialPoint => qrsFromDoubleHeight<Axial, AxialPoint>(double, axialFromQR);

export const axialFromDoubleWidth = (double: DoubleWidthPoint): AxialPoint => qrsFromDoubleWidth<Axial, AxialPoint>(double, axialFromQR);
