import { expect } from "chai";
import { describe, test } from "mocha";
import { cubeRotate } from "../cube-rotate.js";
import { CUBE_ORIGIN, cubeFromQR, stringifyCube } from "../cube.js";
import { CCW_120, CCW_60, CW_120, CW_180, CW_60, type HexRotation } from "../hex-system.js";
import type { BareQRSPoint } from "../qrs.js";

describe(cubeRotate.name, () => {
	const examples: [outer: BareQRSPoint, rotation: HexRotation, expected: BareQRSPoint][] = [
		[ { q: -4, r: -1 }, 0, { q: -4, r: -1 } ],
		[ { q: -4, r: -1 }, CW_60, { q: 1, r: -5 } ],
		[ { q: -4, r: -1 }, CW_120, { q: 5, r: -4 } ],
		[ { q: -4, r: -1 }, CW_180, { q: 4, r: 1 } ],
		[ { q: -4, r: -1 }, CCW_120, { q: -1, r: 5 } ],
		[ { q: -4, r: -1 }, CCW_60, { q: -5, r: 4 } ],
		[ { q: 5, r: -5 }, 0, { q: 5, r: -5 } ],
		[ { q: 5, r: -5 }, CW_60, { q: 5, r: 0 } ],
		[ { q: 5, r: -5 }, CW_120, { q: 0, r: 5 } ],
		[ { q: 5, r: -5 }, CW_180, { q: -5, r: 5 } ],
		[ { q: 5, r: -5 }, CCW_120, { q: -5, r: 0 } ],
		[ { q: 5, r: -5 }, CCW_60, { q: 0, r: -5 } ],
	];
	for (const [ outerQR, rotation, expectedQR ] of examples) {
		const outerCube = cubeFromQR(outerQR.q, outerQR.r);
		const expectedCube = cubeFromQR(expectedQR.q, expectedQR.r);
		test(`${stringifyCube(outerCube)} + ${rotation} -> ${stringifyCube(expectedCube)}`, () => {
			expect(cubeRotate(CUBE_ORIGIN, outerCube, rotation)).eql(expectedCube);
		});
	}
});
