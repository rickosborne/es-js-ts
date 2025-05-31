import { AXIAL } from "./hex-system.js";
import type { Axial } from "./hex-system.js";
import type { BareQRSPoint, QRSPoint } from "./qrs.js";

/**
 * Axial coordinates don't store the `s` coordinate, as it
 * can always be calculated via `q + r + s = 0`.
 */
export type AxialPoint = QRSPoint<Axial>;

export const AXIAL_FLAT_SE = Object.freeze({ q: 1, r: 0, system: AXIAL } as const satisfies AxialPoint);
export const AXIAL_FLAT_NE = Object.freeze({ q: 1, r: -1, system: AXIAL } as const satisfies AxialPoint);
export const AXIAL_FLAT_N = Object.freeze({ q: 0, r: -1, system: AXIAL } as const satisfies AxialPoint);
export const AXIAL_FLAT_NW = Object.freeze({ q: -1, r: 0, system: AXIAL } as const satisfies AxialPoint);
export const AXIAL_FLAT_SW = Object.freeze({ q: -1, r: 1, system: AXIAL } as const satisfies AxialPoint);
export const AXIAL_FLAT_S = Object.freeze({ q: 0, r: 1, system: AXIAL } as const satisfies AxialPoint);

export const AXIAL_POINTY_E = AXIAL_FLAT_SE;
export const AXIAL_POINTY_NE = AXIAL_FLAT_NE;
export const AXIAL_POINTY_NW = AXIAL_FLAT_N;
export const AXIAL_POINTY_W = AXIAL_FLAT_NW;
export const AXIAL_POINTY_SW = AXIAL_FLAT_SW;
export const AXIAL_POINTY_SE = AXIAL_FLAT_S;

export type AxialDirection = typeof AXIAL_POINTY_E | typeof AXIAL_POINTY_NE | typeof AXIAL_POINTY_NW | typeof AXIAL_POINTY_W | typeof AXIAL_POINTY_SW | typeof AXIAL_POINTY_SE;

export const AXIAL_DIRECTIONS: Readonly<AxialDirection[]> = Object.freeze([
	AXIAL_FLAT_SE,
	AXIAL_FLAT_NE,
	AXIAL_FLAT_N,
	AXIAL_FLAT_NW,
	AXIAL_FLAT_SW,
	AXIAL_FLAT_S,
]);

export const axialFromQR = (q: number, r: number): AxialPoint => ({ q, r, system: AXIAL });

export const stringifyAxial = ({ q, r }: AxialPoint | BareQRSPoint): string => `Axial<${q},${r}>`;

export type AxialTuple = [ q: number, r: number ];

export const AXIAL_ORIGIN = Object.freeze({ q: 0, r: 0, system: AXIAL } as const satisfies AxialPoint);
export const AXIAL_EPSILON = Object.freeze({ q: 1E-6, r: 1E-6, system: AXIAL } as const satisfies AxialPoint);
