import { CUBE } from "./hex-system.js";
import type { Cube } from "./hex-system.js";
import type { BareQRSPoint, QRSPoint } from "./qrs.js";

/**
 * Cube points store the `s` value explicitly, instead of calculating it.
 */
export interface BareHexCubePoint extends BareQRSPoint {
	/**
	 * Bottom right (negative) to top left (positive).
	 */
	s: number;
}

export interface HexCubePoint extends QRSPoint<Cube>, BareHexCubePoint {}

export const CUBE_FLAT_SE = Object.freeze({ q: 1, r: 0, s: -1, system: CUBE } as const);
export const CUBE_FLAT_N = Object.freeze({ q: 0, r: -1, s: 1, system: CUBE } as const);
export const CUBE_FLAT_NW = Object.freeze({ q: -1, r: 0, s: 1, system: CUBE } as const);
export const CUBE_FLAT_S = Object.freeze({ q: 0, r: 1, s: -1, system: CUBE } as const);

export const CUBE_NE = Object.freeze({ q: 1, r: -1, s: 0, system: CUBE } as const);
export const CUBE_SW = Object.freeze({ q: -1, r: 1, s: 0, system: CUBE } as const);

export const CUBE_POINTY_E = CUBE_FLAT_SE;
export const CUBE_POINTY_NW = CUBE_FLAT_N;
export const CUBE_POINTY_W = CUBE_FLAT_NW;
export const CUBE_POINTY_SE = CUBE_FLAT_S;

export type HexCubeDirection = typeof CUBE_POINTY_E | typeof CUBE_NE | typeof CUBE_POINTY_NW | typeof CUBE_POINTY_W | typeof CUBE_SW | typeof CUBE_POINTY_SE;

export const HEX_CUBE_DIRECTIONS: Readonly<HexCubeDirection[]> = Object.freeze([
	CUBE_FLAT_SE,
	CUBE_NE,
	CUBE_FLAT_N,
	CUBE_FLAT_NW,
	CUBE_SW,
	CUBE_FLAT_S,
]);

export const stringifyCube = ({ q, r, s }: BareHexCubePoint): string => `Cube<${q},${r},${s}>`;

/**
 * Build a branded Cube point from `q` and `r` coordinates.
 */
export const cubeFromQR = (q: number, r: number): HexCubePoint => ({ q, r, s: -q - r, system: CUBE });

export type CubeTuple = [ q: number, r: number, s: number ];

export const CUBE_DIAG_FLAT_E = Object.freeze({ q: 2, r: -1, s: 1, system: CUBE } as const satisfies HexCubePoint);
export const CUBE_DIAG_FLAT_SW = Object.freeze({ q: -1, r: 2, s: -1, system: CUBE } as const satisfies HexCubePoint);
export const CUBE_DIAG_FLAT_W = Object.freeze({ q: -2, r: 1, s: 1, system: CUBE } as const satisfies HexCubePoint);
export const CUBE_DIAG_FLAT_NE = Object.freeze({ q: 1, r: -2, s: 1, system: CUBE } as const satisfies HexCubePoint);

export const CUBE_DIAG_SE = Object.freeze({ q: 1, r: 1, s: -2, system: CUBE } as const satisfies HexCubePoint);
export const CUBE_DIAG_NW = Object.freeze({ q: -1, r: -1, s: 2, system: CUBE } as const satisfies HexCubePoint);

export const CUBE_DIAG_POINTY_N = CUBE_DIAG_FLAT_NE;
export const CUBE_DIAG_POINTY_NE = CUBE_DIAG_FLAT_E;
export const CUBE_DIAG_POINTY_S = CUBE_DIAG_FLAT_SW;
export const CUBE_DIAG_POINTY_SW = CUBE_DIAG_FLAT_W;

export type CubeDiagDirection = typeof CUBE_DIAG_SE | typeof CUBE_DIAG_NW | typeof CUBE_DIAG_POINTY_N | typeof CUBE_DIAG_POINTY_NE | typeof CUBE_DIAG_POINTY_S | typeof CUBE_DIAG_POINTY_SW;

export const CUBE_ORIGIN = Object.freeze({ q: 0, r: 0, s: 0, system: CUBE } as const satisfies HexCubePoint);

export const CUBE_EPSILON = Object.freeze({ q: 1E-6, r: 1E-6, s: -2E-6, system: CUBE } satisfies HexCubePoint);
