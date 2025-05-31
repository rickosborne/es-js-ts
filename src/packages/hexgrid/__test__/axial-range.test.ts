import { expect } from "chai";
import { describe, test } from "mocha";
import { axialRange } from "../axial-range.js";
import { AXIAL_FLAT_N, AXIAL_FLAT_NE, AXIAL_FLAT_NW, AXIAL_FLAT_S, AXIAL_FLAT_SE, AXIAL_FLAT_SW, AXIAL_ORIGIN } from "../axial.js";

describe(axialRange.name, () => {
	test("zero", () => {
		expect(axialRange(AXIAL_ORIGIN, 0)).eql([ AXIAL_ORIGIN ]);
	});
	test("one", () => {
		expect(axialRange(AXIAL_ORIGIN, 1)).eql([
			AXIAL_FLAT_NW,
			AXIAL_FLAT_SW,
			AXIAL_FLAT_N,
			AXIAL_ORIGIN,
			AXIAL_FLAT_S,
			AXIAL_FLAT_NE,
			AXIAL_FLAT_SE,
		]);
	});
});
