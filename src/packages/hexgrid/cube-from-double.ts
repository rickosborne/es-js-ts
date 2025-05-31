import type { HexCubePoint } from "./cube.js";
import { cubeFromQR } from "./cube.js";
import type { DoubleHeightPoint, DoubleWidthPoint } from "./double.js";
import type { Cube } from "./hex-system.js";
import { qrsFromDoubleHeight, qrsFromDoubleWidth } from "./qrs-from-double.js";

export const cubeFromDoubleHeight = (double: DoubleHeightPoint): HexCubePoint => qrsFromDoubleHeight<Cube, HexCubePoint>(double, cubeFromQR);

export const cubeFromDoubleWidth = (double: DoubleWidthPoint): HexCubePoint => qrsFromDoubleWidth<Cube, HexCubePoint>(double, cubeFromQR);
