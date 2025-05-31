import { EVEN_Q, EVEN_R, ODD_Q, ODD_R } from "./hex-system.js";
import type { BareOffset, OffsetDirection, OffsetPoint, OffsetSystem } from "./offset.js";

type UnitStep = 0 | 1 | -1;

const DIRECTION_DIFFERENCES: Readonly<Record<OffsetSystem, [UnitStep, UnitStep][][]>> = Object.freeze({
	[EVEN_Q]: [
		[ [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ] ],
		[ [ 1, 0 ], [ 1, -1 ], [ 0, -1 ], [ -1, -1 ], [ -1, 0 ], [ 0, 1 ] ],
	],
	[EVEN_R]: [
		[ [ 1, 0 ], [ 1, -1 ], [ 0, -1 ], [ -1, 0 ], [ 0, 1 ], [ 1, 1 ] ],
		[ [ 1, 0 ], [ 0, -1 ], [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ] ],
	],
	[ODD_Q]: [
		[ [ 1, 0 ], [ 1, -1 ], [ 0, -1 ], [ -1, -1 ], [ -1, 0 ], [ 0, 1 ] ],
		[ [ 1, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ] ],
	],
	[ODD_R]: [
		[ [ 1, 0 ], [ 0, -1 ], [ -1, 1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ] ],
		[ [ 1, 0 ], [ 1, -1 ], [ 0, -1 ], [ -1, 0 ], [ 0, 1 ], [ 1, 1 ] ],
	],
});

export const offsetNeighbor = <S extends OffsetSystem>(offset: OffsetPoint<S>, direction: OffsetDirection): OffsetPoint<S> => {
	const simpleKey: keyof BareOffset = offset.system === ODD_Q || offset.system === EVEN_Q ? "col" : "row";
	const bit = (offset[simpleKey] & 1) as (0 | 1);
	const [ colStep, rowStep ] = DIRECTION_DIFFERENCES[offset.system][bit]![direction]!;
	return {
		col: offset.col + colStep,
		row: offset.row + rowStep,
		system: offset.system,
	};
};
