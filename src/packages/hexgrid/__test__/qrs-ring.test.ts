import { expect } from "chai";
import { describe, test } from "mocha";
import { AXIAL_FLAT_N, AXIAL_FLAT_NE, AXIAL_FLAT_NW, AXIAL_FLAT_S, AXIAL_FLAT_SE, AXIAL_FLAT_SW, AXIAL_ORIGIN, axialFromQR } from "../axial.js";
import { CUBE_ORIGIN, cubeFromQR } from "../cube.js";
import type { HexCubePoint } from "../cube.js";
import { CUBE } from "../hex-system.js";
import { qrsRing } from "../qrs-ring.js";

describe(qrsRing.name, () => {
	test("one", () => {
		expect(qrsRing(AXIAL_ORIGIN, 1, axialFromQR)).eql([
			AXIAL_FLAT_SW,
			AXIAL_FLAT_S,
			AXIAL_FLAT_SE,
			AXIAL_FLAT_NE,
			AXIAL_FLAT_N,
			AXIAL_FLAT_NW,
		]);
	});
	test("two", () => {
		expect(qrsRing(CUBE_ORIGIN, 2, cubeFromQR)).eql([
			{ q: -2, r: 2, s: 0, system: CUBE },
			{ q: -1, r: 2, s: -1, system: CUBE },
			{ q: 0, r: 2, s: -2, system: CUBE },
			{ q: 1, r: 1, s: -2, system: CUBE },
			{ q: 2, r: 0, s: -2, system: CUBE },
			{ q: 2, r: -1, s: -1, system: CUBE },
			{ q: 2, r: -2, s: 0, system: CUBE },
			{ q: 1, r: -2, s: 1, system: CUBE },
			{ q: 0, r: -2, s: 2, system: CUBE },
			{ q: -1, r: -1, s: 2, system: CUBE },
			{ q: -2, r: 0, s: 2, system: CUBE },
			{ q: -2, r: 1, s: 1, system: CUBE },
		] satisfies HexCubePoint[]);
	});
});
