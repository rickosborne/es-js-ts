import type { AxialPoint } from "./axial.js";
import { AXIAL, EVEN_Q, EVEN_R, ODD_Q, ODD_R } from "./hex-system.js";
import type { OffsetPoint, OffsetSystem } from "./offset.js";
import type { Axis } from "./point.js";

const SIMPLE_ROW_COL_KEY: Readonly<Record<OffsetSystem, Axis<OffsetPoint<OffsetSystem>>>> = Object.freeze({
	[ EVEN_Q ]: "col",
	[ EVEN_R ]: "row",
	[ ODD_Q ]: "col",
	[ ODD_R ]: "row",
});

const COMPLEX_ROW_COL_KEY: Readonly<Record<OffsetSystem, Axis<OffsetPoint<OffsetSystem>>>> = Object.freeze({
	[ EVEN_Q ]: "row",
	[ EVEN_R ]: "col",
	[ ODD_Q ]: "row",
	[ ODD_R ]: "col",
});

export const axialFromOffset = <S extends OffsetSystem>(offset: OffsetPoint<S>): AxialPoint => {
	const system: S = offset.system;
	const simpleRowColKey = SIMPLE_ROW_COL_KEY[ system ];
	const complexRowColKey = COMPLEX_ROW_COL_KEY[ system ];
	const simpleIn: number = offset[ simpleRowColKey ];
	const complexIn: number = offset[ complexRowColKey ];
	let bit = simpleIn & 1;
	if (system === ODD_Q || system === ODD_R) {
		bit = -bit;
	}
	let q: number;
	let r: number;
	const complexOut = complexIn - ((simpleIn + bit) / 2);
	if (system === ODD_R || system === EVEN_R) {
		q = complexOut;
		r = simpleIn;
	} else {
		q = simpleIn;
		r = complexOut;
	}
	return {
		q,
		r,
		system: AXIAL,
	};
};
