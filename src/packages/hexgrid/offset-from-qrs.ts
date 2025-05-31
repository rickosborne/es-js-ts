import { EVEN_Q, EVEN_R, ODD_Q, ODD_R } from "./hex-system.js";
import type { EvenQPoint, EvenRPoint, OddQPoint, OddRPoint, OffsetPoint, OffsetSystem } from "./offset.js";
import type { BareQRSPoint } from "./qrs.js";

const SIMPLE_AXIAL_KEY: Readonly<Record<OffsetSystem, keyof BareQRSPoint>> = Object.freeze({
	[EVEN_Q]: "q",
	[EVEN_R]: "r",
	[ODD_Q]: "q",
	[ODD_R]: "r",
});

const COMPLEX_AXIAL_KEY: Readonly<Record<OffsetSystem, keyof BareQRSPoint>> = Object.freeze({
	[EVEN_Q]: "r",
	[EVEN_R]: "q",
	[ODD_Q]: "r",
	[ODD_R]: "q",
});

const offsetFromQRS = <S extends OffsetSystem>(system: S, point: BareQRSPoint): OffsetPoint<S> => {
	const simpleAxialKey = SIMPLE_AXIAL_KEY[system];
	const simpleIn: number = point[simpleAxialKey];
	const complexAxialKey = COMPLEX_AXIAL_KEY[system];
	const complexIn: number = point[complexAxialKey];
	let bit: number = simpleIn & 1;
	if (system === ODD_R || system === ODD_Q) {
		bit = -bit;
	}
	const complexOut = complexIn + ((simpleIn + bit) / 2);
	let col: number;
	let row: number;
	if (system === ODD_R || system === EVEN_R) {
		col = complexOut;
		row = simpleIn;
	} else {
		col = simpleIn;
		row = complexOut;
	}
	return {
		col,
		row,
		system,
	};
};

export const oddRFromQRS = (point: BareQRSPoint): OddRPoint => offsetFromQRS(ODD_R, point);
export const oddQFromQRS = (point: BareQRSPoint): OddQPoint => offsetFromQRS(ODD_Q, point);
export const evenRFromQRS = (point: BareQRSPoint): EvenRPoint => offsetFromQRS(EVEN_R, point);
export const evenQFromQRS = (point: BareQRSPoint): EvenQPoint => offsetFromQRS(EVEN_Q, point);

