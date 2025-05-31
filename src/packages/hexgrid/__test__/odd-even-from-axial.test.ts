import { expect } from "chai";
import { describe, it } from "mocha";
import { axialFromOffset } from "../axial-from-offset.js";
import type { AxialPoint } from "../axial.js";
import { stringifyAxial } from "../axial.js";
import { AXIAL, EVEN_Q, EVEN_R, ODD_Q, ODD_R } from "../hex-system.js";
import { evenQFromQRS, evenRFromQRS, oddQFromQRS, oddRFromQRS } from "../offset-from-qrs.js";
import type { OffsetPoint, OffsetSystem } from "../offset.js";
import { stringifyOffset } from "../offset.js";
import type { Point } from "../point.js";

type Bare<P extends Point> = Omit<P, "system">;

const AXIAL_ROW_COL: [ Bare<AxialPoint>, OffsetPoint<OffsetSystem> ][] = [
	[ { q: 0, r: 0 }, { col: 0, row: 0, system: ODD_R } ],
	[ { q: 0, r: 0 }, { col: 0, row: 0, system: ODD_Q } ],
	[ { q: 0, r: 0 }, { col: 0, row: 0, system: EVEN_R } ],
	[ { q: 0, r: 0 }, { col: 0, row: 0, system: EVEN_Q } ],

	[ { q: -1, r: -2 }, { col: -2, row: -2, system: ODD_R } ],
	[ { q: -2, r: -1 }, { col: -2, row: -2, system: ODD_Q } ],
	[ { q: -1, r: -2 }, { col: -2, row: -2, system: EVEN_R } ],
	[ { q: -2, r: -1 }, { col: -2, row: -2, system: EVEN_Q } ],

	[ { q: 1, r: 0 }, { col: 1, row: 0, system: ODD_R } ],
	[ { q: 1, r: 0 }, { col: 1, row: 0, system: ODD_Q } ],
	[ { q: 1, r: 0 }, { col: 1, row: 0, system: EVEN_R } ],
	[ { q: 1, r: -1 }, { col: 1, row: 0, system: EVEN_Q } ],

	[ { q: 0, r: 1 }, { col: 0, row: 1, system: ODD_R } ],
	[ { q: 0, r: 1 }, { col: 0, row: 1, system: ODD_Q } ],
	[ { q: -1, r: 1 }, { col: 0, row: 1, system: EVEN_R } ],
	[ { q: 0, r: 1 }, { col: 0, row: 1, system: EVEN_Q } ],

	[ { q: -1, r: 1 }, { col: -1, row: 1, system: ODD_R } ],
	[ { q: -1, r: 2 }, { col: -1, row: 1, system: ODD_Q } ],
	[ { q: -2, r: 1 }, { col: -1, row: 1, system: EVEN_R } ],
	[ { q: -1, r: 1 }, { col: -1, row: 1, system: EVEN_Q } ],
];

describe("odd-even-from-axial", () => {
	AXIAL_ROW_COL.forEach(([ axial, rc ]) => {
		const { q, r } = axial;
		const { system } = rc;
		it(`${ stringifyOffset(rc) } => ${ stringifyAxial(axial) }`, () => {
			const ax: AxialPoint = { q, r, system: AXIAL };
			expect(axialFromOffset(rc)).eql(ax);
		});
		it(`${ stringifyAxial(axial) } => ${ stringifyOffset(rc) }`, () => {
			const ax: AxialPoint = { q, r, system: AXIAL };
			let outRowCol: OffsetPoint<OffsetSystem>;
			if (system === ODD_Q) {
				outRowCol = oddQFromQRS(ax);
			} else if (system === ODD_R) {
				outRowCol = oddRFromQRS(ax);
			} else if (system === EVEN_Q) {
				outRowCol = evenQFromQRS(ax);
			} else if (system === EVEN_R) {
				outRowCol = evenRFromQRS(ax);
			} else {
				expect.fail(`System unknown: ${ system as string }`);
			}
			expect(outRowCol).eql(rc);
		});
	});
});
