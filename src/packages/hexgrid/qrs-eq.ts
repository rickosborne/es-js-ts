import type { BareHexCubePoint } from "./cube.js";

export const qrsEQ = (a: Readonly<BareHexCubePoint>, b: Readonly<BareHexCubePoint>): boolean => a.q === b.q && a.r === b.r;
