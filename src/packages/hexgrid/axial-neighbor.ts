import { axialAdd } from "./axial-add.js";
import type { AxialDirection, AxialPoint } from "./axial.js";

export const axialNeighbor = (axial: AxialPoint, direction: AxialDirection): AxialPoint => axialAdd(axial, direction);
