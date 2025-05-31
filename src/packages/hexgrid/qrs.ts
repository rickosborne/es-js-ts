import type { Axial, Cube } from "./hex-system.js";
import type { Point } from "./point.js";

export type QRSSystem = Axial | Cube;

/**
 * In the QRS notation, `q` is the column, while `r` is the row.
 */
export interface BareQRSPoint {
	/**
	 * Bottom left (negative) to top right (positive).
	 */
	q: number;
	/**
	 * Top (negative) to bottom (positive);
	 */
	r: number;
}

/**
 * A QRS Point which also has its {@link HexSystem} materialized with its coordinates.
 */
export interface QRSPoint<S extends QRSSystem> extends Point, BareQRSPoint {
	system: S;
}

/**
 * A function which can add together two QRS points with the same system.
 */
export type QRSAdder<P extends QRSPoint<QRSSystem>> = (left: P, right: P) => P;

/**
 * A function which can structures numbers into a QRS point for a given system.
 */
export type QRSBuilder<P extends QRSPoint<QRSSystem>> = (q: number, r: number) => P;

export const QRS_ORIGIN = Object.freeze({ q: 0, r: 0 } as const satisfies BareQRSPoint);

export const bareQRS = (q: number, r: number): BareQRSPoint => ({ q, r });
