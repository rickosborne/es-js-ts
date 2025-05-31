import { doubleHeightAdd, doubleWidthAdd } from "./double-add.js";
import type { DoubleHeightDirection, DoubleHeightPoint, DoubleWidthDirection, DoubleWidthPoint } from "./double.js";

export const doubleHeightNeighbor = (double: DoubleHeightPoint, direction: DoubleHeightDirection) => doubleHeightAdd(double, direction);

export const doubleWidthNeighbor = (double: DoubleWidthPoint, direction: DoubleWidthDirection) => doubleWidthAdd(double, direction);
