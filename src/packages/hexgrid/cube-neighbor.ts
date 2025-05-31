import { cubeAdd } from "./cube-add.js";
import type { CubeDiagDirection, HexCubeDirection, HexCubePoint } from "./cube.js";

/**
 * Find the neighbor of the given hex in the given direction.
 */
export const cubeNeighbor = (cube: HexCubePoint, direction: HexCubeDirection | CubeDiagDirection): HexCubePoint => cubeAdd(cube, direction);
